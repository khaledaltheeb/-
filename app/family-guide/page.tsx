import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FamilyGuideArticlePage from '@/components/family-guide-article-page';
import { getFamilyGuideItems, getFamilyGuideRecord } from '@/lib/family-guide';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const record = await getFamilyGuideRecord();
  if (!record) return {};
  const metadata = buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || '/family-guide/',
    index: record.robots_index,
    follow: record.robots_follow,
    type: 'website',
    image: record.featured_image_url,
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[],
  });
  if (record.robots_index) metadata.robots = `index, ${record.robots_follow ? 'follow' : 'nofollow'}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;
  return metadata;
}

export default async function FamilyGuidePage() {
  const [record, items] = await Promise.all([getFamilyGuideRecord(), getFamilyGuideItems()]);
  if (!record) notFound();
  return <FamilyGuideArticlePage record={record} items={items} />;
}
