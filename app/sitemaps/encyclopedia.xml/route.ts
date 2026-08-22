import { createClient } from '@/lib/supabase/server';
import { getPsychEncyclopediaReleaseIndex } from '@/lib/psych-encyclopedia-release';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;
const DB_BATCH_SIZE = 1000;

type RawItem = Record<string, unknown>;
type SitemapItem = { slug: string; canonicalUrl: string; updatedAt: string | null };

function normalizeItem(row: RawItem): SitemapItem | null {
  const slug = typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : '';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return {
    slug,
    canonicalUrl: `/encyclopedia/${slug}/`,
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
  const releaseRows = await getPsychEncyclopediaReleaseIndex();
  const releaseItems = releaseRows.flatMap((row) => {
    const item = normalizeItem(row as unknown as RawItem);
    return item ? [item] : [];
  });
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
      .select('slug,updated_at')
      .eq('content_type', 'condition')
      .eq('status', 'published')
      .eq('robots_index', true)
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
    return item ? [item] : [];
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
