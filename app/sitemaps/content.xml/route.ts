import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';
import { getCognitivePageIndex } from '@/lib/cognitive-program';
import { getExpandedEncyclopediaIndex } from '@/lib/expanded-encyclopedia';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;
const DB_BATCH_SIZE = 1000;
const RELEASE = '2026-08-14T00:00:00.000Z';

// Wave 004 has an explicit repository release hold. These currently
// materialized pages remain available in place with noindex,follow until an
// explicit per-page release decision records genuine human review. Keeping the
// hold here prevents an accidental database robots_index drift from leaking an
// unreleased page into XML sitemaps.
const WAVE_004_HELD_PATHS = new Set([
  '/care-guides/cognitive-flexibility-switching-plan/',
  '/care-guides/cognitive-load-instruction-audit/',
  '/care-guides/inhibitory-control-pause-plan/',
  '/care-guides/metacognition-study-review-card/',
  '/care-guides/processing-speed-accuracy-balance/',
  '/care-guides/prospective-memory-external-cues/',
  '/care-guides/retrieval-practice-study-plan/',
  '/care-guides/selective-attention-distraction-audit/',
  '/care-guides/spaced-practice-study-calendar/',
  '/care-guides/sustained-attention-work-interval/',
  '/care-guides/working-memory-task-breakdown/',
  '/care-guides/care-guide-dual-task-attention-limit/',
]);

type SitemapRow = {
  path: string;
  lastModified: string | null;
  changeFrequency: string;
  priority: number;
};

type ContentSitemapRecord = {
  id: string;
  slug: string;
  updated_at: string | null;
  canonical_url: string | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get('page') ?? '0');
  const page = Number.isInteger(raw) && raw >= 0 && raw < 10000 ? raw : 0;
  const supabase = await createClient();
  const pageStart = page * PAGE_SIZE;
  const pageEndExclusive = pageStart + PAGE_SIZE;
  const now = new Date().toISOString();
  const data: ContentSitemapRecord[] = [];

  // No-loss rule: every live, indexable database record that is not a condition belongs
  // to this sitemap safety net. Dedicated maps such as quick-info may repeat the same
  // canonical URL; overlap is preferable to silently dropping an indexable published page.
  // Conditions remain in the encyclopedia sitemap, whose public route is canonicalized there.
  // Pagination is intentionally ordered by immutable id rather than updated_at: content edits
  // must change <lastmod> without moving URLs between sitemap pages while crawlers fetch them.
  for (let batchStart = pageStart; batchStart < pageEndExclusive; batchStart += DB_BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + DB_BATCH_SIZE - 1, pageEndExclusive - 1);
    const requestedRows = batchEnd - batchStart + 1;
    const { data: batch, error } = await supabase
      .from('content')
      .select('id,slug,updated_at,canonical_url')
      .eq('status', 'published')
      .neq('content_type', 'condition')
      .lte('published_at', now)
      .eq('robots_index', true)
      .order('id', { ascending: false })
      .range(batchStart, batchEnd);

    if (error) {
      throw new Error(`content sitemap query failed at rows ${batchStart}-${batchEnd}: ${error.message}`);
    }
    if (!Array.isArray(batch)) {
      throw new Error('content sitemap query returned no data array');
    }

    data.push(...(batch as ContentSitemapRecord[]));
    if (batch.length < requestedRows) break;
  }

  const databaseRows: SitemapRow[] = data.flatMap((item) => {
    const path = item.canonical_url || `/content/${item.slug}`;
    if (WAVE_004_HELD_PATHS.has(path)) return [];
    return [{
      path,
      lastModified: item.updated_at,
      changeFrequency: 'monthly',
      priority: .7,
    }];
  });

  let generatedRows: SitemapRow[] = [];
  if (page === 0) {
    const expandedIndex = await getExpandedEncyclopediaIndex();
    generatedRows = [
      ...getCognitivePageIndex().map((item) => ({
        path: `/content/${item.slug}`,
        lastModified: RELEASE,
        changeFrequency: 'monthly',
        priority: .72,
      })),
      ...expandedIndex.map((item) => ({
        path: item.canonical_url,
        lastModified: item.updated_at,
        changeFrequency: 'monthly',
        priority: .74,
      })),
    ];
  }

  const unique = new Map<string, SitemapRow>();
  for (const item of [...databaseRows, ...generatedRows]) {
    if (!unique.has(item.path)) unique.set(item.path, item);
  }

  return sitemapResponse([...unique.values()]);
}