import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentRenderer from '@/components/content-renderer';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { getSpecialNeedsRecord, getSpecialNeedsRelated, safeSpecialNeedsReferences, specialNeedsCanonical } from '@/lib/special-needs';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug?: string[] }>;

type JsonRecord = Record<string, unknown>;
type FaqItem = { question: string; answer: string };

function visibleFaq(value: unknown): FaqItem[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  const blocks = Array.isArray((value as JsonRecord).blocks) ? (value as JsonRecord).blocks as unknown[] : [];
  return blocks.flatMap((block): FaqItem[] => {
    if (!block || typeof block !== 'object' || Array.isArray(block)) return [];
    const row = block as JsonRecord;
    if (row.type !== 'faq' || !Array.isArray(row.items)) return [];
    return row.items.flatMap((item): FaqItem[] => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
      const faq = item as JsonRecord;
      return typeof faq.question === 'string' && typeof faq.answer === 'string'
        ? [{ question: faq.question, answer: faq.answer }]
        : [];
    });
  }).slice(0, 40);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug = [] } = await params;
  const record = await getSpecialNeedsRecord(slug);
  if (!record) return {};
  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || specialNeedsCanonical(slug) || '/special-needs/',
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

export default async function SpecialNeedsPage({ params }: { params: Params }) {
  const { slug = [] } = await params;
  const record = await getSpecialNeedsRecord(slug);
  if (!record) notFound();

  const canonical = record.canonical_url || specialNeedsCanonical(slug) || '/special-needs/';
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const references = safeSpecialNeedsReferences(record.references_json);
  const related = await getSpecialNeedsRelated(record.id);
  const faqItems = visibleFaq(record.body_json);
  const audiences = Array.isArray(record.audience) ? record.audience.map(String) : [];
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    ...(slug.length ? [{ name: 'ذوو الاحتياجات الخاصة', path: '/special-needs/' }] : []),
    { name: record.title, path: canonical },
  ]);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': slug.length ? 'Article' : 'CollectionPage',
    '@id': `${url}#page`,
    url,
    name: record.title,
    headline: record.title,
    description: record.seo_description || record.excerpt || undefined,
    inLanguage: 'ar',
    datePublished: record.published_at || undefined,
    dateModified: record.updated_at || undefined,
    lastReviewed: record.last_reviewed_at || undefined,
    publisher: { '@id': `${SITE_URL}/#organization` },
    author: record.author_display_name ? { '@type': 'Organization', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` },
    image: record.featured_image_url || undefined,
    citation: references.flatMap((reference) => reference.url ? [reference.url] : []),
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
  const faqSchema = faqItems.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  } : null;
  const schemas = [breadcrumbs, articleSchema, ...(faqSchema ? [faqSchema] : [])];

  return <>
    <SiteHeader />
    <main className="article-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link>
        {slug.length ? <><span>/</span><Link href="/special-needs/">ذوو الاحتياجات الخاصة</Link></> : null}
        <span>/</span><span aria-current="page">{record.title}</span>
      </nav>
      <article>
        <header className="article-hero">
          <span className="eyebrow">ذوو الاحتياجات الخاصة والدمج</span>
          <h1>{record.title}</h1>
          {record.excerpt ? <p>{record.excerpt}</p> : null}
          <div className="article-meta">
            {record.author_display_name ? <span>إعداد: {record.author_display_name}</span> : null}
            {record.reviewer_display_name ? <span>مراجعة: {record.reviewer_display_name}{record.reviewer_credentials ? ` — ${record.reviewer_credentials}` : ''}</span> : null}
            {record.published_at ? <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span> : null}
            {record.last_reviewed_at ? <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.last_reviewed_at))}</span> : null}
          </div>
          {audiences.length ? <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div> : null}
        </header>
        <nav className="reference-nav" aria-label="التنقل داخل قطاع ذوي الاحتياجات الخاصة">
          <Link href="/special-needs/">المركز</Link>
          <Link href="/sectors/special-needs-inclusion">القطاع</Link>
          <Link href="/sections">الأقسام</Link>
          <Link href="/search/?sector=special-needs-inclusion">البحث</Link>
        </nav>
        <div className="article-body">
          {record.featured_image_url ? <figure className="article-featured-image"><Image src={record.featured_image_url} alt={record.featured_image_alt || record.title} width={1200} height={675} sizes="(max-width: 900px) 100vw, 900px" priority={!slug.length} unoptimized /></figure> : null}
          <ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id} />
        </div>
        {record.medical_disclaimer ? <aside className="medical-disclaimer" aria-label="حدود المحتوى"><strong>تنبيه صحي ومنهجي</strong><p>{record.medical_disclaimer}</p><Link href="/disclaimer">إخلاء المسؤولية الكامل</Link></aside> : null}
        {related.length ? <section className="article-related" aria-labelledby="special-needs-related-title"><div className="section-mini-heading"><div><span className="eyebrow">محتوى مترابط</span><h2 id="special-needs-related-title">اقرأ أيضًا</h2></div></div><div className="related-content-grid">{related.map((item) => <article key={item.id}><span>{item.contentType}</span><h3><Link href={item.href}>{item.title}</Link></h3>{item.excerpt ? <p>{item.excerpt}</p> : null}<Link href={item.href}>متابعة القراءة ←</Link></article>)}</div></section> : null}
        {references.length ? <section className="article-references" aria-labelledby="special-needs-references-title"><h2 id="special-needs-references-title">المصادر والمراجع</h2><ol>{references.map((reference, index) => <li key={`${reference.url || reference.title}-${index}`}>{reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}{reference.publisher ? <small>{reference.publisher}</small> : null}{reference.year ? <small>{String(reference.year)}</small> : null}</li>)}</ol></section> : null}
      </article>
    </main>
    <SiteFooter />
  </>;
}
