import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import { capabilityFaq, capabilityReferences, getCapabilityPage } from '@/lib/capabilities';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const record = await getCapabilityPage();
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

export default async function CapabilitiesHubPage() {
  const record = await getCapabilityPage();
  if (!record) notFound();

  const canonical = record.canonical_url || '/capabilities/';
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const references = capabilityReferences(record.references_json);
  const faqItems = capabilityFaq(record.body_json);
  const audiences = Array.isArray(record.audience) ? record.audience : [];
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'ذوو الاحتياجات الخاصة والدمج والتمكين', path: '/sectors/special-needs-inclusion' },
    { name: 'لنرتقي بقدراتهم', path: '/capabilities/' },
  ]);
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name: record.title,
    headline: record.title,
    description: record.seo_description || record.excerpt || undefined,
    inLanguage: 'ar',
    datePublished: record.published_at || undefined,
    dateModified: record.updated_at || undefined,
    lastReviewed: record.last_reviewed_at || undefined,
    author: record.author_display_name ? { '@type': 'Organization', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    hasPart: [
      { '@type': 'CollectionPage', name: 'سجل القدرات', url: `${SITE_URL}/capabilities/registry/` },
      { '@type': 'Article', name: 'منهجية اكتشاف القدرات', url: `${SITE_URL}/capabilities/methodology/` },
      { '@type': 'Article', name: 'بروتوكول اكتشاف وتنمية القدرة', url: `${SITE_URL}/capabilities/protocol/` },
    ],
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
  const schemas = [breadcrumbs, pageSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <>
      <SiteHeader />
      <main className="article-shell capability-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span>
          <Link href="/sectors/special-needs-inclusion">ذوو الاحتياجات الخاصة</Link><span>/</span>
          <span aria-current="page">لنرتقي بقدراتهم</span>
        </nav>
        <article>
          <header className="article-hero capability-hero">
            <span className="eyebrow">مرجع روافد للقدرات والوصول</span>
            <h1>{record.title}</h1>
            {record.excerpt && <p>{record.excerpt}</p>}
            <div className="capability-stats" aria-label="ملخص القسم">
              <span><strong>100</strong> حالة</span>
              <span><strong>104</strong> صفحات Canonical</span>
              <span><strong>9</strong> مراحل للبروتوكول</span>
              <span><strong>6</strong> مسارات للدليل</span>
            </div>
            <div className="article-meta">
              {record.author_display_name && <span>إعداد: {record.author_display_name}</span>}
              {record.last_reviewed_at && <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.last_reviewed_at))}</span>}
            </div>
            {audiences.length > 0 && <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div>}
          </header>

          <nav className="capability-entry-grid" aria-label="مسارات القسم">
            <Link href="/capabilities/registry/"><span>استكشف</span><strong>سجل الحالات المئة</strong><small>بحث عربي/إنجليزي وفلترة حسب المجال ومسار الدليل.</small></Link>
            <Link href="/capabilities/protocol/"><span>طبّق</span><strong>البروتوكول العملي</strong><small>تسع مراحل من الأمان إلى القياس والقرار المشترك.</small></Link>
            <Link href="/capabilities/methodology/"><span>دقّق</span><strong>المنهجية والأدلة</strong><small>كيف نختبر ادعاء القوة ونمنع التعميم والسببية الزائفة.</small></Link>
          </nav>

          <div className="article-body">
            {record.featured_image_url && (
              <figure className="article-featured-image">
                <Image src={record.featured_image_url} alt={record.featured_image_alt || record.title} width={1200} height={675} sizes="(max-width: 900px) 100vw, 900px" priority unoptimized />
              </figure>
            )}
            <ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id} />
          </div>

          {record.medical_disclaimer && (
            <aside className="medical-disclaimer" aria-label="إخلاء المسؤولية الطبية">
              <strong>تنبيه منهجي وصحي</strong><p>{record.medical_disclaimer}</p><Link href="/disclaimer">إخلاء المسؤولية الكامل</Link>
            </aside>
          )}

          {references.length > 0 && (
            <section className="article-references" aria-labelledby="capability-references-title">
              <h2 id="capability-references-title">المصادر والمراجع</h2>
              <ol>{references.map((reference, index) => <li key={`${reference.url || reference.title}-${index}`}>{reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}{reference.publisher && <small>{reference.publisher}</small>}{reference.year && <small>{String(reference.year)}</small>}</li>)}</ol>
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
