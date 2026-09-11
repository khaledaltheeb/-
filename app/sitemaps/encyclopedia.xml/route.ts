import { createClient } from '@/lib/supabase/server';
import { getPsychEncyclopediaReleaseIndex } from '@/lib/psych-encyclopedia-release';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;
const DB_BATCH_SIZE = 1000;
// Permanent encyclopedia redirect sources declared in next.config.ts. DB redirects
// are also resolved dynamically below; this list covers config-owned redirects.
const REDIRECTED_LEGACY_SLUGS = [
  'fragile-x-syndrome-education',
  'cluttering-communication-disorder',
] as const;

type RawItem = Record<string, unknown>;
type SitemapItem = { slug: string; canonicalUrl: string; updatedAt: string | null };
type IndexabilityRow = { slug: string; canonical_url: string | null };

function normalizeItem(row: RawItem): SitemapItem | null {
  const slug = typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : '';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  if ((REDIRECTED_LEGACY_SLUGS as readonly string[]).includes(slug)) return null;
  const canonicalUrl = `/encyclopedia/${slug}/`;
  const storedCanonical = typeof row.canonical_url === 'string' ? row.canonical_url.trim() : '';
  if (storedCanonical !== canonicalUrl) return null;
  return {
    slug,
    canonicalUrl,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null,
  };
}

function inFilter(values: string[]) {
  return `(${values.join(',')})`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get('page') ?? '0');
  const page = Number.isInteger(raw) && raw >= 0 && raw < 1000 ? raw : 0;
  const supabase = await createClient();
  const now = new Date().toISOString();

  // A redirect source is not a canonical URL and must never be advertised in a sitemap.
  // Resolve DB-owned redirects dynamically; config-owned encyclopedia redirects are
  // excluded by REDIRECTED_LEGACY_SLUGS above.
  const { data: redirectRows, error: redirectError } = await supabase
    .from('redirects')
    .select('source_path')
    .eq('is_active', true)
    .like('source_path', '/encyclopedia/%')
    .range(0, 4999);
  if (redirectError) {
    throw new Error(`encyclopedia sitemap redirect query failed: ${redirectError.message}`);
  }
  const redirectedPaths = new Set(
    (Array.isArray(redirectRows) ? redirectRows : [])
      .map((row) => (typeof row.source_path === 'string' ? row.source_path.trim() : ''))
      .filter(Boolean),
  );

  const releaseRows = await getPsychEncyclopediaReleaseIndex();
  const normalizedReleaseItems = releaseRows.flatMap((row) => {
    const item = normalizeItem(row as unknown as RawItem);
    return item && !redirectedPaths.has(item.canonicalUrl) ? [item] : [];
  });
  const normalizedReleaseSlugs = normalizedReleaseItems.map((item) => item.slug);

  // The release index is an editorial allow-list, not an indexability authority.
  // Reconfirm every release entry against the live published/indexable inventory and
  // the encyclopedia canonical namespace before advertising it in a public sitemap.
  const indexableReleaseSlugs = new Set<string>();
  for (let start = 0; start < normalizedReleaseSlugs.length; start += DB_BATCH_SIZE) {
    const slugBatch = normalizedReleaseSlugs.slice(start, start + DB_BATCH_SIZE);
    if (slugBatch.length === 0) continue;
    const { data, error } = await supabase
      .from('content')
      .select('slug,canonical_url')
      .in('slug', slugBatch)
      .eq('status', 'published')
      .eq('robots_index', true)
      .like('canonical_url', '/encyclopedia/%')
      .lte('published_at', now);

    if (error) {
      throw new Error(`encyclopedia release indexability query failed at rows ${start}-${start + slugBatch.length - 1}: ${error.message}`);
    }

    for (const row of (data ?? []) as IndexabilityRow[]) {
      const slug = typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : '';
      const canonicalUrl = typeof row.canonical_url === 'string' ? row.canonical_url.trim() : '';
      if (slug && canonicalUrl === `/encyclopedia/${slug}/`) indexableReleaseSlugs.add(slug);
    }
  }

  const releaseItems = normalizedReleaseItems.filter((item) => indexableReleaseSlugs.has(item.slug));
  const releaseSlugs = releaseItems.map((item) => item.slug);
  const releaseSlots = page === 0 ? releaseItems.length : 0;
  const databaseCapacity = Math.max(0, PAGE_SIZE - releaseSlots);
  const databaseStart = page === 0
    ? 0
    : Math.max(0, PAGE_SIZE - releaseItems.length) + (page - 1) * PAGE_SIZE;
  const databaseEndExclusive = databaseStart + databaseCapacity;
  const databaseRows: RawItem[] = [];

  for (let batchStart = databaseStart; batchStart < databaseEndExclusive; batchStart += DB_BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + DB_BATCH_SIZE - 1, databaseEndExclusive - 1);
    const requestedRows = batchEnd - batchStart + 1;
    let query = supabase
      .from('content')
      .select('slug,canonical_url,updated_at')
      .in('content_type', ['glossary_term', 'condition'])
      .eq('status', 'published')
      .eq('robots_index', true)
      .like('canonical_url', '/encyclopedia/%')
      .lte('published_at', now)
      .order('slug', { ascending: true })
      .range(batchStart, batchEnd);

    if (releaseSlugs.length > 0) {
      query = query.not('slug', 'in', inFilter(releaseSlugs));
    }

    const { data: batch, error } = await query;
    if (error) {
      throw new Error(`encyclopedia sitemap query failed at rows ${batchStart}-${batchEnd}: ${error.message}`);
    }
    if (!Array.isArray(batch)) {
      throw new Error('encyclopedia sitemap query returned no data array');
    }

    databaseRows.push(...(batch as unknown as RawItem[]));
    if (batch.length < requestedRows) break;
  }

  const databaseItems = databaseRows.flatMap((row) => {
    const item = normalizeItem(row);
    return item && !redirectedPaths.has(item.canonicalUrl) ? [item] : [];
  });
  const pageItems = page === 0 ? [...releaseItems, ...databaseItems] : databaseItems;
  const rows = pageItems.map((item) => ({
    path: item.canonicalUrl,
    lastModified: item.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: .8,
  }));

  const hub = page === 0 ? [{ path: '/encyclopedia/', changeFrequency: 'weekly' as const, priority: .9 }] : [];
  return sitemapResponse([...hub, ...rows]);
}
