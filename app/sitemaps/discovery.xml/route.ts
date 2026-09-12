import { sitemapResponse } from '@/lib/sitemap-xml';

export async function GET() {
  return sitemapResponse([
    { path: '/all-pages', changeFrequency: 'daily', priority: .92 },
    { path: '/institutions', changeFrequency: 'monthly', priority: .82 },
    { path: '/en/institutions', changeFrequency: 'monthly', priority: .68 },
    { path: '/institutions/arabic-rtl-assurance', changeFrequency: 'monthly', priority: .76 },
    { path: '/institutions/terminology-qa', changeFrequency: 'monthly', priority: .76 },
    { path: '/institutions/open-source', changeFrequency: 'monthly', priority: .74 },
    { path: '/institutions/technology-evaluation', changeFrequency: 'monthly', priority: .74 },
    { path: '/institutions/patient-participation', changeFrequency: 'monthly', priority: .74 },
    { path: '/media/', changeFrequency: 'weekly', priority: .76 },
    { path: '/external-review/', changeFrequency: 'monthly', priority: .70 },
    { path: '/external-review/addiction-safety', changeFrequency: 'monthly', priority: .70 },
    { path: '/external-review/reviewer-governance', changeFrequency: 'monthly', priority: .68 },
    { path: '/accessibility-statement', changeFrequency: 'monthly', priority: .70 },
  ]);
}
