import { sitemapResponse } from '@/lib/sitemap-xml';
import { SOCIAL_WORK_SLUGS } from '@/lib/social-work-pages.generated';
import { SOCIAL_WORK_TALENTIA_SLUGS } from '@/lib/social-work-talentia-pages';
import { SOCIAL_WORK_COMPARATIVE_SLUGS } from '@/lib/social-work-comparative-pages';

const RELEASE = '2026-09-01T18:20:00.000Z';

export async function GET() {
  const slugs = new Set([...SOCIAL_WORK_SLUGS, ...SOCIAL_WORK_TALENTIA_SLUGS, ...SOCIAL_WORK_COMPARATIVE_SLUGS]);
  return sitemapResponse([
    { path: '/evidence-guides/social-work/', lastModified: RELEASE, changeFrequency: 'weekly', priority: .90 },
    ...[...slugs]
      .filter(Boolean)
      .sort()
      .map((slug) => ({
        path: `/evidence-guides/social-work/${slug}/`,
        lastModified: RELEASE,
        changeFrequency: 'monthly' as const,
        priority: slug === 'international-comparative-social-work-ethics' ? .86 : slug === 'professional-ethics' ? .84 : SOCIAL_WORK_COMPARATIVE_SLUGS.includes(slug) ? .78 : .76,
      })),
  ]);
}
