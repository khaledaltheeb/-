import { cognitiveTools } from '@/lib/cognitive-lab/catalog';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RELEASE = '2026-08-22T00:00:00.000Z';

export async function GET() {
  const response = sitemapResponse([
    { path: '/cognitive-lab', lastModified: RELEASE, changeFrequency: 'weekly', priority: 0.82 },
    ...cognitiveTools.map((tool) => ({
      path: `/cognitive-lab/${tool.slug}`,
      lastModified: RELEASE,
      changeFrequency: 'monthly',
      priority: 0.72,
    })),
  ]);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
