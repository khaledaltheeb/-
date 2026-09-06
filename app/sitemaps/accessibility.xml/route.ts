import { sitemapResponse } from '@/lib/sitemap-xml';

export async function GET() {
  return sitemapResponse([
    { path: '/accessibility/', changeFrequency: 'monthly', priority: 0.72 },
    { path: '/accessibility/sensory-accessibility/', changeFrequency: 'monthly', priority: 0.82 },
  ]);
}
