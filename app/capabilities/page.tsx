import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CapabilityArticlePage from '@/components/capability-article-page';
import { getCapabilityRecord } from '@/lib/capabilities';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const record = await getCapabilityRecord();
  if (!record) return {};
  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || '/capabilities/',
    index: record.robots_index,
    follow: record.robots_follow,
    type: 'article',
    image: record.featured_image_url,
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[],
    publishedTime: record.published_at,
    modifiedTime: record.updated_at,
    authors: record.author_display_name ? [{ name: record.author_display_name }] : undefined,
  });
}

export default async function CapabilitiesPage() {
  const record = await getCapabilityRecord();
  if (!record) notFound();
  return <CapabilityArticlePage record={record} />;
}
