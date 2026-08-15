import { getQuickInfoItems } from '@/lib/quick-info';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await getQuickInfoItems(500);
  if (items.length === 0) return sitemapResponse([]);

  return sitemapResponse([
    {
      path: '/quick-info/',
      lastModified: items.reduce<string | null>((latest, item) => {
        if (!item.updatedAt) return latest;
        return !latest || item.updatedAt > latest ? item.updatedAt : latest;
      }, null),
      changeFrequency: 'weekly',
      priority: 0.82,
    },
    ...items.map((item) => ({
      path: item.canonicalUrl,
      lastModified: item.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.74,
    })),
  ]);
}
