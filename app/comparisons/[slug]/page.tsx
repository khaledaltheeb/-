import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ComparisonArticlePage from '@/components/comparison-article-page';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import { getComparisonRecord } from '@/lib/comparisons';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
const legacyRoute = (slug: string) => `/comparisons/${slug}/`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const record = await getComparisonRecord(slug);
  if (!record) {
    const route = legacyRoute(slug);
    return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
  }
  const metadata = buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || `/comparisons/${slug}/`,
    index: record.robots_index,
    follow: record.robots_follow,
    type: 'article',
    image: record.featured_image_url,
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[],
    publishedTime: record.published_at,
    modifiedTime: record.updated_at,
    authors: record.author_display_name ? [{ name: record.author_display_name }] : undefined,
  });
  if (record.robots_index) metadata.robots = `index, ${record.robots_follow ? 'follow' : 'nofollow'}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;
  return metadata;
}

export default async function ComparisonDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getComparisonRecord(slug);
  if (!record) {
    const route = legacyRoute(slug);
    const preserved = await getLegacyPreservedPage(route);
    if (!preserved) notFound();
    return <LegacyPreservedPageView page={preserved} route={route} />;
  }
  return <ComparisonArticlePage record={record} routeSlug={slug} />;
}