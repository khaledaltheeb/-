import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MagazineArticle from '@/components/magazine-article';
import { getRelatedMagazine } from '@/lib/magazine';
import { getPediatricOncologyEvidenceRecordForRequest } from '@/lib/pediatric-oncology-release-preview';
import { buildSeoMetadata, IS_TEMPORARY_HOST } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Query = { release_verify?: string | string[] };
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Query> };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function releaseToken(searchParams: Query) {
  return IS_TEMPORARY_HOST ? first(searchParams.release_verify) : undefined;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const token = releaseToken(query);
  const record = await getPediatricOncologyEvidenceRecordForRequest('theses', slug, token);
  if (!record) return {};
  const path = record.canonical_url || `/magazine/pediatric-oncology/theses/${slug}/`;
  const verifiedPreview = Boolean(token && record.schema_json?.release_token === token);
  const metadata = buildSeoMetadata({
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

  if (!verifiedPreview) return metadata;
  return {
    ...metadata,
    robots: {
      index: record.robots_index !== false,
      follow: record.robots_follow !== false,
      noarchive: false,
      nosnippet: false,
      googleBot: {
        index: record.robots_index !== false,
        follow: record.robots_follow !== false,
        noimageindex: false,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

export default async function PediatricOncologyThesisPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const token = releaseToken(query);
  const record = await getPediatricOncologyEvidenceRecordForRequest('theses', slug, token);
  if (!record) notFound();
  const related = await getRelatedMagazine(record, 4);
  const verifiedPreview = Boolean(token && record.schema_json?.release_token === token);

  return <>
    {verifiedPreview ? <meta name="rawafid-release-token" content={token} /> : null}
    <MagazineArticle record={record} related={related} />
  </>;
}
