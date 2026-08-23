import { getDailyToolRoutes } from '@/lib/daily-tools-catalog';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const entries = getDailyToolRoutes().map((path, index) => ({
    path,
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 0.82 : 0.64,
  }));
  return sitemapResponse(entries);
}
