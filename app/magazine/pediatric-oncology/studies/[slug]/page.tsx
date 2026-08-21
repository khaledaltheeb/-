import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MagazineArticle from '@/components/magazine-article';
import { getPediatricOncologyEvidenceRecord, getRelatedMagazine } from '@/lib/magazine';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const record = await getPediatricOncologyEvidenceRecord('studies', slug);
  if (!record) return {};
  const path = record.canonical_url || `/magazine/pediatric-oncology/studies/${slug}/`;
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

export default async function PediatricOncologyStudyPage({ params }: Props) {
  const { slug } = await params;
  const record = await getPediatricOncologyEvidenceRecord('studies', slug);
  if (!record) notFound();
  const related = await getRelatedMagazine(record, 4);
  return <MagazineArticle record={record} related={related} />;
}
