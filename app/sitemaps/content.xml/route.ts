import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';
import { getCognitivePageIndex } from '@/lib/cognitive-program';
import { getExpandedEncyclopediaIndex } from '@/lib/expanded-encyclopedia';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;
const DB_BATCH_SIZE = 1000;
const GENERATED_OVERRIDE_BATCH_SIZE = 100;
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
  canonical_url: string | null;
};

type TaxonomySitemapRecord = {
  slug: string;
};

type GeneratedOverrideRecord = {
  slug: string;
  canonical_url: string | null;
  robots_index: boolean;
};

function applyDedicatedSitemapExclusions<T extends {
  not: (column: string, operator: string, value: string) => T;
  neq: (column: string, value: string) => T;
}>(query: T): T {
  let owned = query
    .not('canonical_url', 'like', '/encyclopedia/%')
    .not('canonical_url', 'like', '/quick-info/%')
    .not('canonical_url', 'like', '/daily-tools/%')
    .not('canonical_url', 'like', '/addiction/substances/%')
    .not('canonical_url', 'like', '/addiction/compare/%');
  for (const canonical of ATLAS_OWNED_CANONICALS) {
    owned = owned.neq('canonical_url', canonical);
  }
  return owned;
}

function normalizeCanonicalPath(path: string) {
  if (path === '/') return path;
  return path.replace(/\/+$/, '');
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

  // Taxonomy hub canonicals belong exclusively to taxonomy.xml. Content rows may
  // still power those pages editorially, but must not emit a competing sitemap URL.
  const [sectorResult, categoryResult] = await Promise.all([
    supabase
      .from('sectors')
      .select('slug')
      .eq('is_active', true)
      .eq('visibility', 'public')
      .limit(20000),
    supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true)
      .eq('visibility', 'public')
      .limit(50000),
  ]);

  if (sectorResult.error) {
    throw new Error(`content sitemap taxonomy sector query failed: ${sectorResult.error.message}`);
  }
  if (categoryResult.error) {
    throw new Error(`content sitemap taxonomy category query failed: ${categoryResult.error.message}`);
  }

  const taxonomyOwnedCanonicals = new Set<string>([
    ...((sectorResult.data ?? []) as TaxonomySitemapRecord[]).map((item) => `/sectors/${item.slug}`),
    ...((categoryResult.data ?? []) as TaxonomySitemapRecord[]).map((item) => `/sections/${item.slug}`),
  ]);

  // Child-sitemap ownership is determined by the published canonical namespace,
  // never by an internal content_type. This prevents non-encyclopedia conditions
  // and glossary terms from being dropped or emitted under a competing URL.
  // Pagination is intentionally ordered by immutable row id.
  for (let batchStart = pageStart; batchStart < pageEndExclusive; batchStart += DB_BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + DB_BATCH_SIZE - 1, pageEndExclusive - 1);
    const requestedRows = batchEnd - batchStart + 1;
    let query = supabase
      .from('content')
      .select('id,slug,canonical_url')
      .eq('status', 'published')
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

  const databaseRows: SitemapRow[] = data
    .filter((item) => {
      const path = item.canonical_url || `/content/${item.slug}`;
      return !taxonomyOwnedCanonicals.has(normalizeCanonicalPath(path));
    })
    .map((item) => ({
      path: item.canonical_url || `/content/${item.slug}`,
      // Do not publish a technical database timestamp as sitemap <lastmod>.
      // It will be restored when substantive editorial-change provenance is explicit.
      lastModified: null,
      changeFrequency: 'monthly',
      priority: .7,
    }));

  let generatedRows: SitemapRow[] = [];
  if (page === 0) {
    const cognitiveIndex = getCognitivePageIndex();
    const publishedOverrideBySlug = new Map<string, GeneratedOverrideRecord>();

    // `/content/[slug]` intentionally prefers a published database record over a
    // generated cognitive page. If that record owns a different canonical (for
    // example `/encyclopedia/<slug>/`) the generated alias must not be advertised
    // in a sitemap. Query in bounded slug batches so newly published canonical
    // takeovers cannot create duplicate sitemap discovery URLs.
    for (let start = 0; start < cognitiveIndex.length; start += GENERATED_OVERRIDE_BATCH_SIZE) {
      const slugs = cognitiveIndex.slice(start, start + GENERATED_OVERRIDE_BATCH_SIZE).map((item) => item.slug);
      const { data: overrides, error } = await supabase
        .from('content')
        .select('slug,canonical_url,robots_index')
        .in('slug', slugs)
        .eq('status', 'published')
        .lte('published_at', now);

      if (error) {
        throw new Error(`content sitemap generated override query failed at rows ${start}-${start + slugs.length - 1}: ${error.message}`);
      }

      for (const override of (overrides ?? []) as GeneratedOverrideRecord[]) {
        publishedOverrideBySlug.set(override.slug, override);
      }
    }

    const expandedIndex = await getExpandedEncyclopediaIndex();
    const cognitiveRows = cognitiveIndex
      .filter((item) => {
        const override = publishedOverrideBySlug.get(item.slug);
        if (!override) return true;
        const expected = normalizeCanonicalPath(`/content/${item.slug}`);
        const publishedCanonical = normalizeCanonicalPath(override.canonical_url || `/content/${item.slug}`);
        return override.robots_index && publishedCanonical === expected;
      })
      .map((item) => ({
        path: `/content/${item.slug}`,
        lastModified: RELEASE,
        changeFrequency: 'monthly' as const,
        priority: .72,
      }));

    generatedRows = [
      ...cognitiveRows,
      ...expandedIndex.map((item) => ({
        path: item.canonical_url,
        lastModified: item.updated_at,
        changeFrequency: 'monthly' as const,
        priority: .74,
      })),
    ].filter((item) => !taxonomyOwnedCanonicals.has(normalizeCanonicalPath(item.path)));
  }

  const unique = new Map<string, SitemapRow>();
  for (const item of [...databaseRows, ...generatedRows]) {
    if (!unique.has(item.path)) unique.set(item.path, item);
  }

  return sitemapResponse([...unique.values()]);
}
