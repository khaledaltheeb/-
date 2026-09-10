import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RELEASE = '2026-09-10T00:00:00.000Z';

export async function GET() {
  const response = sitemapResponse([
    {
      path: '/tools/rare-phenotype-navigator',
      lastModified: RELEASE,
      changeFrequency: 'weekly',
      priority: 0.86,
    },
  ]);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
