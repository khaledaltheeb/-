import { sitemapResponse } from '@/lib/sitemap-xml';

export async function GET() {
  return sitemapResponse([
    { path: '/all-pages', changeFrequency: 'daily', priority: .86 },
    { path: '/institutions', changeFrequency: 'monthly', priority: .72 },
    { path: '/en/institutions', changeFrequency: 'monthly', priority: .62 },
    { path: '/institutions/arabic-rtl-assurance', changeFrequency: 'monthly', priority: .68 },
    { path: '/institutions/terminology-qa', changeFrequency: 'monthly', priority: .68 },
    { path: '/institutions/open-source', changeFrequency: 'monthly', priority: .66 },
    { path: '/media/', changeFrequency: 'weekly', priority: .66 },
    { path: '/external-review/', changeFrequency: 'monthly', priority: .62 },
    { path: '/accessibility-statement', changeFrequency: 'monthly', priority: .64 },
  ]);
}
