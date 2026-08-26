import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';
import { getCognitivePageIndex } from '@/lib/cognitive-program';
import { getExpandedEncyclopediaIndex } from '@/lib/expanded-encyclopedia';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;
const DB_BATCH_SIZE = 1000;
const RELEASE = '2026-08-14T00:00:00.000Z';

const ATLAS_OWNED_CANONICALS = [
  '/addiction/substances/',
  '/addiction/compare/',
  '/addiction/interactions/',
  '/addiction/prevalence/',
  '/addiction/mortality/',
  '/addiction/methodology/',
] as const;

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

function applyDedicatedSitemapExclusions<T extends {
  not: (column: string, operator: string, value: string) => T;
  neq: (column: string, value: string) => T;
}>(query: T): T {
  let owned = query
    .not('canonical_url', 'like', '/quick-info/%')
    .not('canonical_url', 'like', '/daily-tools/%')
    .not('canonical_url', 'like', '/addiction/substances/%')
    .not('canonical_url', 'like', '/addiction/compare/%');
  for (const canonical of ATLAS_OWNED_CANONICALS) {
    owned = owned.neq('canonical_url', canonical);
  }
  return owned;
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

  // Canonical ownership is exclusive across child sitemaps. Only canonicals actually
  // owned by Quick Info, Daily Tools, and the Addiction Atlas are excluded here.
  // Other records may have legacy-looking slugs or namespaces but remain in this no-loss safety net.
  // Pagination is intentionally ordered by immutable row id; updated_at only feeds lastmod.
  for (let batchStart = pageStart; batchStart < pageEndExclusive; batchStart += DB_BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + DB_BATCH_SIZE - 1, pageEndExclusive - 1);
    const requestedRows = batchEnd - batchStart + 1;
    let query = supabase
      .from('content')
      .select('id,slug,updated_at,canonical_url')
      .eq('status', 'published')
      .neq('content_type', 'condition')
      .lte('published_at', now)
      .eq('robots_index', true);
    query = applyDedicatedSitemapExclusions(query);
    const { data: batch, error } = await query
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

  const unique = new Map<string, SitemapRow>();
  for (const item of [...databaseRows, ...generatedRows]) {
    if (!unique.has(item.path)) unique.set(item.path, item);
  }

  return sitemapResponse([...unique.values()]);
}
