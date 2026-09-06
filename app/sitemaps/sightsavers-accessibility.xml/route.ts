import { sitemapResponse } from '@/lib/sitemap-xml';

const RELEASE = '2026-08-31T15:10:00.000Z';
const ROUTES = [
  { path: '/accessibility/sightsavers/', priority: .82 },
  { path: '/accessibility/sightsavers/inclusive-communications/', priority: .78 },
  { path: '/accessibility/sightsavers/testing-protocol/', priority: .78 },
  { path: '/accessibility/sightsavers/health-facility-audit/', priority: .76 },
] as const;

export async function GET() {
  return sitemapResponse(ROUTES.map((item) => ({
    path: item.path,
    lastModified: RELEASE,
    changeFrequency: 'monthly' as const,
    priority: item.priority,
  })));
}
