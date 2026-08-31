import { sitemapResponse } from '@/lib/sitemap-xml';
import { RARE_DISEASE_GLOBAL_GENES_SLUGS } from '@/lib/rare-disease-global-genes-pages';

const RELEASE = '2026-08-31T14:00:00.000Z';

export async function GET() {
  const slugs = RARE_DISEASE_GLOBAL_GENES_SLUGS.filter(Boolean).sort();
  return sitemapResponse([
    { path: '/evidence-guides/rare-disease/', lastModified: RELEASE, changeFrequency: 'weekly', priority: .88 },
    ...slugs.map((slug) => ({ path: `/evidence-guides/rare-disease/${slug}/`, lastModified: RELEASE, changeFrequency: 'monthly' as const, priority: .76 })),
  ]);
}
