import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MagazineArticle from '@/components/magazine-article';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import { getRelatedMagazine } from '@/lib/magazine';
import { getMagazineRouteRecord } from '@/lib/magazine-route';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };
const legacyRoute = (slug: string) => `/magazine/${slug}/`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const record = await getMagazineRouteRecord(slug);
  if (!record) {
    const route = legacyRoute(slug);
    return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
  }
  const path = record.canonical_url || `/magazine/${slug}`;
  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path,
    index: record.robots_index,
    follow: record.robots_follow,
    type: 'article',
    publishedTime: record.published_at,
    modifiedTime: record.updated_at,
    authors: [{ name: record.author_display_name || 'منصة روافد' }],
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? [])].filter((value): value is string => Boolean(value)),
    hreflang: { ar: path, 'x-default': path },
  });
}

export default async function MagazineResearchPage({ params }: Props) {
  const { slug } = await params;
  const record = await getMagazineRouteRecord(slug);
  if (!record) {
    const route = legacyRoute(slug);
    const preserved = await getLegacyPreservedPage(route);
    if (!preserved) notFound();
    return <LegacyPreservedPageView page={preserved} route={route} />;
  }
  const related = await getRelatedMagazine(record, 4);
  return <MagazineArticle record={record} related={related} />;
}
