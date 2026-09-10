import { worksheets } from '@/lib/practical-resources';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RELEASE = '2026-09-10T00:00:00.000Z';

export async function GET() {
  const response = sitemapResponse([
    ...worksheets.map((item) => ({
      path: `/resources/worksheets/${item.slug}`,
      lastModified: RELEASE,
      changeFrequency: 'monthly' as const,
      priority: 0.66,
    })),
  ]);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
