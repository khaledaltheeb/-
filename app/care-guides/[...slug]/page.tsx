import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CareGuidePage from '@/components/care-guide-page';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import { careGuideCanIndex, getCareGuideRecord, getRelatedCareGuideContent } from '@/lib/care-guides';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';
import { buildSeoMetadata } from '@/lib/seo';

type Params = Promise<{ slug: string[] }>;
export const dynamic = 'force-dynamic';
const legacyRoute = (segments: string[]) => `/care-guides/${segments.filter(Boolean).join('/')}/`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const record = await getCareGuideRecord(slug);
  if (!record) {
    const route = legacyRoute(slug);
    return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
  }
  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || `/care-guides/${slug.join('/')}/`,
    index: careGuideCanIndex(record),
    follow: record.robots_follow,
    type: 'article',
    image: record.featured_image_url,
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[],
    publishedTime: record.published_at,
    modifiedTime: record.updated_at,
    authors: record.author_display_name ? [{ name: record.author_display_name }] : undefined,
  });
}

export default async function CareGuideDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getCareGuideRecord(slug);
  if (!record) {
    const route = legacyRoute(slug);
    const preserved = await getLegacyPreservedPage(route);
    if (!preserved) notFound();
    return <LegacyPreservedPageView page={preserved} route={route} />;
  }
  const related = await getRelatedCareGuideContent(record.id);
  return <CareGuidePage record={record} related={related} routeSegments={slug} />;
}
