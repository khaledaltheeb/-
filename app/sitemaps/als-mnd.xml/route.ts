import { sitemapResponse } from '@/lib/sitemap-xml';

const RELEASE = '2026-09-08T00:00:00.000Z';
const paths = [
  '/evidence-guides/als-mnd/',
  '/evidence-guides/als-mnd/understanding/',
  '/evidence-guides/als-mnd/living/',
  '/evidence-guides/als-mnd/treatment/',
  '/evidence-guides/als-mnd/action/',
] as const;

export async function GET() {
  return sitemapResponse(paths.map((path) => ({
    path,
    lastModified: RELEASE,
    changeFrequency: 'monthly' as const,
    priority: path === '/evidence-guides/als-mnd/' ? 0.82 : 0.76,
  })));
}
