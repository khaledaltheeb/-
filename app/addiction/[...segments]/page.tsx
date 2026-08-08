import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import AddictionArticlePage from '@/components/addiction-article-page';
import { getAddictionRecord, getMigratedAddictionCondition } from '@/lib/addiction';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ segments: string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { segments } = await params;
  const record = await getAddictionRecord(segments);
  if (!record) return {};
  const metadata = buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || `/addiction/${segments.join('/')}/`,
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

export default async function AddictionDetailPage({ params }: { params: Params }) {
  const { segments } = await params;
  const record = await getAddictionRecord(segments);
  if (record) return <AddictionArticlePage record={record} />;

  if (segments.length === 1) {
    const migrated = await getMigratedAddictionCondition(segments[0]);
    if (migrated?.canonical_url) permanentRedirect(migrated.canonical_url);
  }
  notFound();
}
