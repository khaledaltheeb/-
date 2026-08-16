import { createClient } from '@/lib/supabase/server';
import { getPsychEncyclopediaReleaseIndex } from '@/lib/psych-encyclopedia-release';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get('page') ?? '0');
  const page = Number.isInteger(raw) && raw >= 0 && raw < 1000 ? raw : 0;
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [releaseRows, databaseResult] = await Promise.all([
    getPsychEncyclopediaReleaseIndex(),
    supabase
      .from('content')
      .select('slug,updated_at')
      .eq('content_type', 'condition')
      .eq('status', 'published')
      .eq('robots_index', true)
      .lte('published_at', now)
      .order('title', { ascending: true })
      .limit(PAGE_SIZE),
  ]);

  if (databaseResult.error) {
    throw new Error(`encyclopedia sitemap query failed: ${databaseResult.error.message}`);
  }
  if (!Array.isArray(databaseResult.data)) {
    throw new Error('encyclopedia sitemap query returned no data array');
  }

  const bySlug = new Map<string, SitemapItem>();
  for (const row of releaseRows as unknown as RawItem[]) {
    const item = normalizeItem(row);
    if (item) bySlug.set(item.slug, item);
  }
  for (const row of databaseResult.data as unknown as RawItem[]) {
    const item = normalizeItem(row);
    if (item) bySlug.set(item.slug, item);
  }

  const allItems = [...bySlug.values()].sort((left, right) => left.slug.localeCompare(right.slug));
  const start = page * PAGE_SIZE;
  const pageItems = allItems.slice(start, start + PAGE_SIZE);
  const rows = pageItems.map((item) => ({
    path: item.canonicalUrl,
    lastModified: item.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: .8,
  }));

  const hub = page === 0 ? [{ path: '/encyclopedia/', changeFrequency: 'weekly' as const, priority: .9 }] : [];
  return sitemapResponse([...hub, ...rows]);
}
