import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import CapabilityArticlePage from '@/components/capability-article-page';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import { getCapabilityRecord, getCapabilityRegistryItems } from '@/lib/capabilities';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
const legacyRoute = (slug: string) => `/capabilities/${slug}/`;

const getCapabilityPage = cache(async (slug: string) => {
  const record = await getCapabilityRecord(slug);
  if (record) return { record, preserved: null };
  return { record: null, preserved: await getLegacyPreservedPage(legacyRoute(slug)) };
});

function capabilityAuthors(schemaJson: unknown, fallback?: string | null) {
  const schema = schemaJson && typeof schemaJson === 'object' && !Array.isArray(schemaJson)
    ? schemaJson as Record<string, unknown>
    : null;
  const authors = Array.isArray(schema?.authors)
    ? schema.authors.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim())
    : [];
  if (authors.length > 0) return authors;
  return fallback?.trim() ? [fallback.trim()] : [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const { record, preserved } = await getCapabilityPage(slug);
  if (!record) return legacyPreservedMetadata(preserved, legacyRoute(slug));

  const authors = capabilityAuthors(record.schema_json, record.author_display_name);
  const metadata = buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || `/capabilities/${slug}/`,
    index: record.robots_index,
    follow: record.robots_follow,
    type: 'article',
    image: record.featured_image_url,
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[],
    publishedTime: record.published_at,
    modifiedTime: record.updated_at,
    authors: authors.length > 0 ? authors.map((name) => ({ name })) : undefined,
  });
  if (record.robots_index) metadata.robots = `index, ${record.robots_follow ? 'follow' : 'nofollow'}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;
  return metadata;
}

export default async function CapabilityDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const { record, preserved } = await getCapabilityPage(slug);
  if (!record) {
    const route = legacyRoute(slug);
    if (!preserved) notFound();
    return <LegacyPreservedPageView page={preserved} route={route} />;
  }
  const registryItems = slug === 'registry' ? await getCapabilityRegistryItems() : [];
  return <CapabilityArticlePage record={record} routeSlug={slug} registryItems={registryItems} />;
}
