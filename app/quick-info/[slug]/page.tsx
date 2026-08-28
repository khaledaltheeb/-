import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';
import { getQuickInfoRecord, quickInfoCardPath, safeQuickInfoReferences, visibleQuickInfoFaq } from '@/lib/quick-info';
import { contentReviewProvenance } from '@/lib/review-provenance';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
const legacyRoute = (slug: string) => `/quick-info/${slug}/`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const record = await getQuickInfoRecord(slug);
  if (!record) {
    const route = legacyRoute(slug);
    return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
  }
  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || `/quick-info/${slug}/`,
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

export default async function QuickInfoDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getQuickInfoRecord(slug);
  if (!record) {
    const route = legacyRoute(slug);
    const preserved = await getLegacyPreservedPage(route);
    if (!preserved) notFound();
    return <LegacyPreservedPageView page={preserved} route={route} />;
  }

  const canonical = record.canonical_url || `/quick-info/${slug}/`;
  const url = `${SITE_URL}${canonical}`;
  const references = safeQuickInfoReferences(record.references_json);
  const faqItems = visibleQuickInfoFaq(record.body_json);
  const review = contentReviewProvenance(record);
  const wordCount = String(record.body_text ?? '').trim().split(/\s+/u).filter(Boolean).length;
  const keywords = [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)]
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'معلومات سريعة', path: '/quick-info/' }, { name: record.title, path: canonical }]);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': ['Article', 'MedicalWebPage'],
    '@id': `${url}#article`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: record.title,
    name: record.title,
    description: record.seo_description || record.excerpt || undefined,
    inLanguage: 'ar',
    isAccessibleForFree: true,
    datePublished: record.published_at || undefined,
    dateModified: record.updated_at || undefined,
    lastReviewed: review.lastReviewedAt || undefined,
    author: record.author_display_name ? { '@type': 'Organization', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` },
    reviewedBy: review.reviewedBySchema,
    publisher: { '@id': `${SITE_URL}/#organization` },
    image: record.featured_image_url || `${SITE_URL}/seo-card`,
    keywords: keywords.join(', '),
    wordCount,
    citation: references.flatMap((reference) => reference.url ? [reference.url] : []),
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
  const faqSchema = faqItems.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;
  const schemas = [breadcrumbs, articleSchema, ...(faqSchema ? [faqSchema] : [])];

  return <><SiteHeader /><main className="article-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/quick-info/">معلومات سريعة</Link><span>/</span><span aria-current="page">{record.title}</span></nav>
    <article><header className="article-hero"><span className="eyebrow">معلومات سريعة</span><h1>{record.title}</h1>{record.excerpt && <p>{record.excerpt}</p>}<div className="article-meta">
      {record.author_display_name && <span>إعداد: {record.author_display_name}</span>}{review.reviewerName && <span>مراجعة: {review.reviewerName}{review.reviewerCredentials ? ` — ${review.reviewerCredentials}` : ''}</span>}{record.published_at && <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span>}{review.lastReviewedAt && <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(review.lastReviewedAt))}</span>}
    </div></header>
    <div className="article-body">{record.featured_image_url && <figure className="article-featured-image"><Image src={quickInfoCardPath(record.title)} alt={record.featured_image_alt || record.title} width={1280} height={720} sizes="(max-width: 900px) 100vw, 900px" priority unoptimized /></figure>}<ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id} /></div>
    {record.medical_disclaimer && <aside className="medical-disclaimer" aria-label="إخلاء المسؤولية الطبية"><strong>تنبيه</strong><p>{record.medical_disclaimer}</p><Link href="/disclaimer">إخلاء المسؤولية الكامل</Link></aside>}
    {references.length > 0 && <section className="article-references" aria-labelledby="references-title"><h2 id="references-title">المصادر والمراجع</h2><ol>{references.map((reference, index) => <li key={`${reference.url || reference.title}-${index}`}>{reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}{reference.publisher && <small>{reference.publisher}</small>}{reference.year && <small>{String(reference.year)}</small>}</li>)}</ol></section>}
    </article>
  </main><SiteFooter /></>;
}
