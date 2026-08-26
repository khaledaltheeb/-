import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';
import { getCognitivePageIndex } from '@/lib/cognitive-program';
import { getExpandedEncyclopediaIndex } from '@/lib/expanded-encyclopedia';
import { isExplicitNoindexPath, normalizePublicPath } from '@/lib/public-indexability';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;
const DB_BATCH_SIZE = 1000;
const REDIRECT_BATCH_SIZE = 1000;
const RELEASE = '2026-08-14T00:00:00.000Z';

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

type RedirectRecord = {
  source_path: string | null;
};

async function getActiveRedirectSources(supabase: Awaited<ReturnType<typeof createClient>>) {
  const sources = new Set<string>();
  for (let start = 0; start < 50000; start += REDIRECT_BATCH_SIZE) {
    const { data, error } = await supabase
      .from('redirects')
      .select('source_path')
      .eq('is_active', true)
      .order('source_path', { ascending: true })
      .range(start, start + REDIRECT_BATCH_SIZE - 1);

    if (error) throw new Error(`content sitemap redirect query failed at rows ${start}-${start + REDIRECT_BATCH_SIZE - 1}: ${error.message}`);
    const batch = Array.isArray(data) ? data as RedirectRecord[] : [];
    for (const row of batch) {
      if (typeof row.source_path === 'string' && row.source_path.trim()) {
        sources.add(normalizePublicPath(row.source_path));
      }
    }
    if (batch.length < REDIRECT_BATCH_SIZE) break;
  }
  return sources;
}

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
  // to this sitemap safety net unless its public URL is intentionally noindex or is an
  // active redirect source. Redirect sources must never be advertised as canonical URLs.
  // Conditions remain in the encyclopedia sitemap, whose public route is canonicalized there.
  // Pagination is intentionally ordered by the immutable row id rather than updated_at:
  // content edits must change <lastmod> without moving URLs between sitemap pages while
  // crawlers are fetching page=0, page=1, ... on a continuously updated 10k+ URL site.
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
      .order('id', { ascending: true })
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

  const databaseRows: SitemapRow[] = data.map((item) => ({
    path: item.canonical_url || `/content/${item.slug}`,
    lastModified: item.updated_at,
    changeFrequency: 'monthly',
    priority: .7,
  }));

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

  const activeRedirectSources = await getActiveRedirectSources(supabase);
  const unique = new Map<string, SitemapRow>();
  for (const item of [...databaseRows, ...generatedRows]) {
    const normalizedPath = normalizePublicPath(item.path);
    if (isExplicitNoindexPath(normalizedPath)) continue;
    if (activeRedirectSources.has(normalizedPath)) continue;
    if (!unique.has(normalizedPath)) unique.set(normalizedPath, { ...item, path: normalizedPath });
  }

  return sitemapResponse([...unique.values()]);
}
