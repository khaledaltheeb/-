import { sitemapResponse } from '@/lib/sitemap-xml';

export async function GET() {
  return sitemapResponse([
    { path: '/guides/', changeFrequency: 'weekly', priority: 0.78 },
    { path: '/resources/open-books-discovery/', changeFrequency: 'monthly', priority: 0.74 },
    { path: '/media-kit', changeFrequency: 'monthly', priority: 0.64 },
    { path: '/team-and-partners', changeFrequency: 'monthly', priority: 0.68 },
    { path: '/stats', changeFrequency: 'weekly', priority: 0.58 },
    { path: '/institutions', changeFrequency: 'monthly', priority: 0.72 },
  ]);
}
