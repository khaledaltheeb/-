import { getAllEncyclopediaItems } from '@/lib/encyclopedia';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get('page') ?? '0');
  const page = Number.isInteger(raw) && raw >= 0 && raw < 1000 ? raw : 0;
  const allItems = await getAllEncyclopediaItems(PAGE_SIZE);
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
