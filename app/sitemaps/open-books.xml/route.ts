import { sitemapResponse } from '@/lib/sitemap-xml';

const RELEASE = '2026-08-31T14:45:00.000Z';

export async function GET() {
  return sitemapResponse([
    { path: '/open-books/', lastModified: RELEASE, changeFrequency: 'weekly', priority: .82 },
  ]);
}
