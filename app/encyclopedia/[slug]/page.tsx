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
import {
  encyclopediaCanonical,
  getEncyclopediaRecord,
  safeEncyclopediaReferences,
  visibleEncyclopediaFaq,
} from '@/lib/encyclopedia';
import { contentReviewProvenance } from '@/lib/review-provenance';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
const legacyRoute = (slug: string) => `/encyclopedia/${slug}/`;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const record = await getEncyclopediaRecord(slug);
  if (!record) {
    const route = legacyRoute(slug);
    return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
  }
  const canonical = encyclopediaCanonical(record.slug) || `/encyclopedia/${record.slug}/`;
  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: canonical,
    index: record.robots_index,
    follow: record.robots_follow,
    type: 'article',
    image: record.featured_image_url,
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 12)].filter(Boolean) as string[],
    publishedTime: record.published_at,
    modifiedTime: record.updated_at,
    authors: record.author_display_name ? [{ name: record.author_display_name }] : undefined,
  });
}

export default async function EncyclopediaConditionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getEncyclopediaRecord(slug);
  if (!record) {
    const route = legacyRoute(slug);
    const preserved = await getLegacyPreservedPage(route);
    if (!preserved) notFound();
    return <LegacyPreservedPageView page={preserved} route={route} />;
  }

  const canonical = encyclopediaCanonical(record.slug) || `/encyclopedia/${record.slug}/`;
  const url = `${SITE_URL}${canonical}`;
  const references = safeEncyclopediaReferences(record.references_json);
  const faqItems = visibleEncyclopediaFaq(record.body_json);
  const audiences = Array.isArray(record.audience) ? record.audience.map(String) : [];
  const review = contentReviewProvenance(record);
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الموسوعة النفسية', path: '/encyclopedia/' },
    { name: record.title, path: canonical },
  ]);

  const conditionSchema = {
    '@context': 'https://schema.org', '@type': 'MedicalCondition', '@id': `${url}#condition`,
    name: record.primary_keyword || record.title,
    alternateName: (record.secondary_keywords ?? []).slice(0, 12),
    description: record.seo_description || record.excerpt || undefined, url,
  };
  const pageSchema = {
    '@context': 'https://schema.org', '@type': 'MedicalWebPage', '@id': `${url}#page`, url,
    name: record.title, headline: record.title,
    description: record.seo_description || record.excerpt || undefined,
    inLanguage: 'ar', datePublished: record.published_at || undefined, dateModified: record.updated_at || undefined,
    lastReviewed: review.lastReviewedAt || undefined, about: { '@id': `${url}#condition` },
    author: record.author_display_name ? { '@type': 'Person', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` },
    reviewedBy: review.reviewedBySchema,
    publisher: { '@id': `${SITE_URL}/#organization` }, isPartOf: { '@id': `${SITE_URL}/encyclopedia/#page` },
    citation: references.flatMap((reference) => reference.url ? [reference.url] : []),
  };
  const faqSchema = faqItems.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${url}#faq`,
    mainEntity: faqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  } : null;
  const schemas = [breadcrumbs, conditionSchema, pageSchema, ...(faqSchema ? [faqSchema] : [])];

  return <><SiteHeader /><main className="article-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/encyclopedia/">الموسوعة النفسية</Link><span>/</span><span aria-current="page">{record.title}</span></nav>
    <article>
      <header className="article-hero"><span className="eyebrow">الموسوعة النفسية</span><h1>{record.title}</h1>{record.excerpt ? <p>{record.excerpt}</p> : null}<div className="article-meta">
        {record.author_display_name ? <span>إعداد: {record.author_display_name}</span> : null}
        {review.reviewerName ? <span>مراجعة: {review.reviewerName}{review.reviewerCredentials ? ` — ${review.reviewerCredentials}` : ''}</span> : null}
        {record.published_at ? <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span> : null}
        {review.lastReviewedAt ? <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(review.lastReviewedAt))}</span> : null}
      </div>{audiences.length ? <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div> : null}</header>
      <nav className="article-related" aria-label="التنقل في الموسوعة"><Link href="/encyclopedia/">كل حالات الموسوعة</Link> · <Link href="/search/?type=condition">البحث في الحالات</Link> · <Link href="/specialists/">دليل المختصين</Link></nav>
      <div className="article-body">{record.featured_image_url ? <figure className="article-featured-image"><Image src={record.featured_image_url} alt={record.featured_image_alt || record.title} width={1200} height={675} sizes="(max-width: 900px) 100vw, 900px" priority unoptimized /></figure> : null}<ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id} /></div>
      <aside className="medical-disclaimer" aria-label="حدود المحتوى الطبي"><strong>تنبيه طبي</strong><p>{record.medical_disclaimer || 'هذا المحتوى للتثقيف العام ولا يقدم تشخيصًا فرديًا أو وصفة علاجية، ولا يغني عن تقييم مختص مؤهل عند الحاجة.'}</p><Link href="/disclaimer">إخلاء المسؤولية الكامل</Link></aside>
      {references.length ? <section className="article-references" aria-labelledby="encyclopedia-references-title"><h2 id="encyclopedia-references-title">المصادر والمراجع</h2><ol>{references.map((reference, index) => <li key={`${reference.url || reference.title}-${index}`}>{reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}{reference.publisher ? <small>{reference.publisher}</small> : null}{reference.year ? <small>{String(reference.year)}</small> : null}</li>)}</ol></section> : null}
    </article>
  </main><SiteFooter /></>;
}
