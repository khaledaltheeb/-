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

// These routes are permanent redirect sources in next.config.ts. A redirect source
// may stay published/indexable in the preservation database, but it is not a
// canonical URL and must never be advertised by any DB-driven content sitemap.
const NEXT_CONFIG_REDIRECT_SOURCE_CANONICALS = [
  '/encyclopedia/fragile-x-syndrome-education',
  '/encyclopedia/cluttering-communication-disorder',
  '/content/cluttering-fluency-disorder',
  '/content/special-ed-encyclopedia-childhood-apraxia-of-speech',
  '/special-needs/communication/childhood-apraxia-of-speech',
  '/provider-assessment-demo/conditions/aac',
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

type TaxonomySitemapRecord = {
  slug: string;
};

type RedirectSitemapRecord = {
  source_path: string;
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

const nextConfigRedirectSources = new Set<string>(
  NEXT_CONFIG_REDIRECT_SOURCE_CANONICALS.map((path) => normalizeCanonicalPath(path)),
);

function isRedirectSource(path: string, databaseRedirectSources: Set<string>) {
  const normalizedPath = normalizeCanonicalPath(path);
  return nextConfigRedirectSources.has(normalizedPath) || databaseRedirectSources.has(normalizedPath);
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
  // Active database redirect sources are preserved for routing/history but are not
  // canonical destinations, so they must also be omitted from sitemap advertising.
  const [sectorResult, categoryResult, redirectResult] = await Promise.all([
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
    supabase
      .from('redirects')
      .select('source_path')
      .eq('is_active', true)
      .limit(50000),
  ]);

  if (sectorResult.error) {
    throw new Error(`content sitemap taxonomy sector query failed: ${sectorResult.error.message}`);
  }
  if (categoryResult.error) {
    throw new Error(`content sitemap taxonomy category query failed: ${categoryResult.error.message}`);
  }
  if (redirectResult.error) {
    throw new Error(`content sitemap redirect-source query failed: ${redirectResult.error.message}`);
  }

  const taxonomyOwnedCanonicals = new Set<string>([
    ...((sectorResult.data ?? []) as TaxonomySitemapRecord[]).map((item) => `/sectors/${item.slug}`),
    ...((categoryResult.data ?? []) as TaxonomySitemapRecord[]).map((item) => `/sections/${item.slug}`),
  ]);
  const databaseRedirectSources = new Set<string>(
    ((redirectResult.data ?? []) as RedirectSitemapRecord[])
      .map((item) => normalizeCanonicalPath(item.source_path))
      .filter(Boolean),
  );

  // Child-sitemap ownership is determined by the published canonical namespace,
  // never by an internal content_type. This prevents non-encyclopedia conditions
  // and glossary terms from being dropped or emitted under a competing URL.
  // Pagination is intentionally ordered by immutable row id; updated_at only feeds lastmod.
  for (let batchStart = pageStart; batchStart < pageEndExclusive; batchStart += DB_BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + DB_BATCH_SIZE - 1, pageEndExclusive - 1);
    const requestedRows = batchEnd - batchStart + 1;
    let query = supabase
      .from('content')
      .select('id,slug,updated_at,canonical_url')
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
      const normalizedPath = normalizeCanonicalPath(path);
      return !taxonomyOwnedCanonicals.has(normalizedPath) && !isRedirectSource(normalizedPath, databaseRedirectSources);
    })
    .map((item) => ({
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
      ...expandedIndex
        // A published/indexable DB row owns this slug. Its canonical belongs to
        // the DB-driven sitemap partition, so the static release must not emit a
        // second legacy /content alias or duplicate that canonical elsewhere.
        .filter((item) => item.canonical_source === 'static')
        .map((item) => ({
          path: item.canonical_url,
          lastModified: item.updated_at,
          changeFrequency: 'monthly',
          priority: .74,
        })),
    ].filter((item) => {
      const normalizedPath = normalizeCanonicalPath(item.path);
      return !taxonomyOwnedCanonicals.has(normalizedPath) && !isRedirectSource(normalizedPath, databaseRedirectSources);
    });
  }

  const unique = new Map<string, SitemapRow>();
  for (const item of [...databaseRows, ...generatedRows]) {
    if (!unique.has(item.path)) unique.set(item.path, item);
  }

  return sitemapResponse([...unique.values()]);
}
