import dailyToolRoutes from '@/generated/daily-tools-routes.json';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = false;

const EXPECTED_ROUTES = 151;

export async function GET() {
  if (dailyToolRoutes.length !== EXPECTED_ROUTES || dailyToolRoutes[0] !== '/daily-tools/') {
    throw new Error(`Daily Tools sitemap manifest integrity failure: expected ${EXPECTED_ROUTES} routes, found ${dailyToolRoutes.length}.`);
  }

  const entries = dailyToolRoutes.map((path, index) => ({
    path,
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 0.82 : 0.64,
  }));
  return sitemapResponse(entries);
}
