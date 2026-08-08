import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CareGuidePage from '@/components/care-guide-page';
import { getCareGuideItems, getCareGuidesHubRecord } from '@/lib/care-guides';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const record = await getCareGuidesHubRecord();
  if (!record) return {};
  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || '/care-guides/',
    index: record.robots_index,
    follow: record.robots_follow,
    type: 'website',
    image: record.featured_image_url,
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[],
  });
}

export default async function CareGuidesPage() {
  const [record, items] = await Promise.all([getCareGuidesHubRecord(), getCareGuideItems()]);
  if (!record) notFound();
  return <CareGuidePage record={record} items={items} />;
}
