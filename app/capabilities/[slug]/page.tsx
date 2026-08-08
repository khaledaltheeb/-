import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CapabilityArticlePage from '@/components/capability-article-page';
import { getCapabilityRecord, getCapabilityRegistryItems } from '@/lib/capabilities';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const record = await getCapabilityRecord(slug);
  if (!record) return {};
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
    authors: record.author_display_name ? [{ name: record.author_display_name }] : undefined,
  });
  if (record.robots_index) {
    metadata.robots = `index, ${record.robots_follow ? 'follow' : 'nofollow'}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;
  }
  return metadata;
}

export default async function CapabilityDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getCapabilityRecord(slug);
  if (!record) notFound();
  const registryItems = slug === 'registry' ? await getCapabilityRegistryItems() : [];
  return <CapabilityArticlePage record={record} routeSlug={slug} registryItems={registryItems} />;
}
