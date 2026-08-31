import { sitemapResponse } from '@/lib/sitemap-xml';
import { PALLIATIVE_CARE_IAHPC_SLUGS } from '@/lib/palliative-care-iahpc-pages';

const RELEASE = '2026-08-31T13:30:00.000Z';

export async function GET() {
  const slugs = PALLIATIVE_CARE_IAHPC_SLUGS.filter(Boolean).sort();
  return sitemapResponse([
    { path: '/evidence-guides/palliative-care/', lastModified: RELEASE, changeFrequency: 'weekly', priority: .88 },
    ...slugs.map((slug) => ({
      path: `/evidence-guides/palliative-care/${slug}/`,
      lastModified: RELEASE,
      changeFrequency: 'monthly' as const,
      priority: slug === 'what-is-palliative-care' ? .84 : .76,
    })),
  ]);
}
