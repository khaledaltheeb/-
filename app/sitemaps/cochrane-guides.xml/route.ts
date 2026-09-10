import foundations from '@/data/cochrane/guides-foundations-v1.json';
import searchBias from '@/data/cochrane/guides-search-bias-v1.json';
import statistics from '@/data/cochrane/guides-statistics-v1.json';
import gradeDecision from '@/data/cochrane/guides-grade-decision-v1.json';
import msGovernance from '@/data/cochrane/guides-ms-arabic-governance-v1.json';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const batches = [foundations, searchBias, statistics, gradeDecision, msGovernance] as const;

export async function GET() {
  const guides = batches.flatMap((batch) => batch.guides.map((guide) => ({
    path: `/cochrane/guides/${guide.slug}/`,
    lastModified: batch.updated_on,
    changeFrequency: 'monthly' as const,
    priority: 0.76,
  })));

  const latestModified = batches
    .map((batch) => batch.updated_on)
    .filter(Boolean)
    .sort()
    .at(-1);

  const response = sitemapResponse([
    {
      path: '/cochrane/guides/',
      lastModified: latestModified,
      changeFrequency: 'weekly',
      priority: 0.84,
    },
    ...guides,
  ]);
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
