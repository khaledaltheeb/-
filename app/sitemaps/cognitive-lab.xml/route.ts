import { cognitiveTools } from '@/lib/cognitive-lab/catalog';
import { sitemapResponse } from '@/lib/sitemap-xml';

const RELEASE = '2026-08-14T00:00:00.000Z';

export async function GET() {
  return sitemapResponse([
    { path: '/cognitive-lab', lastModified: RELEASE, changeFrequency: 'weekly', priority: 0.82 },
    ...cognitiveTools.map((tool) => ({
      path: `/cognitive-lab/${tool.slug}`,
      lastModified: RELEASE,
      changeFrequency: 'monthly',
      priority: 0.72,
    })),
  ]);
}
