import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AddictionArticlePage from '@/components/addiction-article-page';
import { getAddictionItems, getAddictionRecord } from '@/lib/addiction';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const record = await getAddictionRecord();
  if (!record) return {};
  const metadata = buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || '/addiction/',
    index: record.robots_index,
    follow: record.robots_follow,
    type: 'website',
    image: record.featured_image_url,
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[],
  });
  if (record.robots_index) metadata.robots = `index, ${record.robots_follow ? 'follow' : 'nofollow'}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;
  return metadata;
}

export default async function AddictionPage() {
  const [record, items] = await Promise.all([getAddictionRecord(), getAddictionItems()]);
  if (!record) notFound();
  return <AddictionArticlePage record={record} items={items} />;
}
