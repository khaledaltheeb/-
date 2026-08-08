import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import CapabilitiesRegistry from '@/components/capabilities-registry';
import {
  capabilityFaq,
  capabilityReferences,
  getCapabilityPage,
  getCapabilityRegistryItems,
} from '@/lib/capabilities';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;

function sectionLabel(slug: string) {
  if (slug === 'registry') return 'سجل القدرات';
  if (slug === 'methodology') return 'المنهجية والأدلة';
  if (slug === 'protocol') return 'البروتوكول العملي';
  return 'دليل حالة من سجل القدرات';
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const record = await getCapabilityPage(slug);
  if (!record) return {};
  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || `/capabilities/${slug}/`,
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

export default async function CapabilityRoutePage({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getCapabilityPage(slug);
  if (!record) notFound();

  const registryItems = slug === 'registry' ? await getCapabilityRegistryItems() : [];
  const references = capabilityReferences(record.references_json);
  const faqItems = capabilityFaq(record.body_json);
  const audiences = Array.isArray(record.audience) ? record.audience : [];
  const canonical = record.canonical_url || `/capabilities/${slug}/`;
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'ذوو الاحتياجات الخاصة والدمج والتمكين', path: '/sectors/special-needs-inclusion' },
    { name: 'لنرتقي بقدراتهم', path: '/capabilities/' },
    { name: record.title, path: canonical },
  ]);

  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': slug === 'registry' ? 'CollectionPage' : 'Article',
    '@id': `${url}#content`,
    url,
    headline: record.title,
    name: record.title,
    description: record.seo_description || record.excerpt || undefined,
    inLanguage: 'ar',
    datePublished: record.published_at || undefined,
    dateModified: record.updated_at || undefined,
    lastReviewed: record.last_reviewed_at || undefined,
    author: record.author_display_name ? { '@type': 'Organization', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    image: record.featured_image_url || undefined,
    isPartOf: { '@id': `${SITE_URL}/capabilities/#collection` },
    ...(slug === 'registry' ? {
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: registryItems.length,
        itemListElement: registryItems.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.titleAr,
          url: `${SITE_URL}${item.href}`,
        })),
      },
    } : {}),
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
  const schemas = [breadcrumbs, baseSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <>
      <SiteHeader />
      <main className="article-shell capability-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span>
          <Link href="/sectors/special-needs-inclusion">ذوو الاحتياجات الخاصة</Link><span>/</span>
          <Link href="/capabilities/">لنرتقي بقدراتهم</Link><span>/</span>
          <span aria-current="page">{record.title}</span>
        </nav>

        <article>
          <header className="article-hero capability-hero">
            <span className="eyebrow">{sectionLabel(slug)}</span>
            <h1>{record.title}</h1>
            {record.excerpt && <p>{record.excerpt}</p>}
            <div className="article-meta">
              {record.author_display_name && <span>إعداد: {record.author_display_name}</span>}
              {record.reviewer_display_name && <span>مراجعة: {record.reviewer_display_name}{record.reviewer_credentials ? ` — ${record.reviewer_credentials}` : ''}</span>}
              {record.published_at && <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span>}
              {record.last_reviewed_at && <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.last_reviewed_at))}</span>}
            </div>
            {audiences.length > 0 && <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div>}
          </header>

          <nav className="capability-context-nav" aria-label="روابط مرجع القدرات">
            <Link href="/capabilities/">مدخل المرجع</Link>
            <Link href="/capabilities/registry/">السجل</Link>
            <Link href="/capabilities/protocol/">البروتوكول</Link>
            <Link href="/capabilities/methodology/">المنهجية</Link>
          </nav>

          {slug === 'registry' && <CapabilitiesRegistry items={registryItems} />}

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
              <strong>تنبيه صحي ومنهجي</strong><p>{record.medical_disclaimer}</p><Link href="/disclaimer">إخلاء المسؤولية الكامل</Link>
            </aside>
          )}

          <nav className="capability-end-nav" aria-label="الخطوة التالية">
            {slug !== 'registry' && <Link href="/capabilities/registry/">استكشف بقية الحالات</Link>}
            {slug !== 'protocol' && <Link href="/capabilities/protocol/">طبّق البروتوكول</Link>}
            {slug !== 'methodology' && <Link href="/capabilities/methodology/">راجع المنهجية</Link>}
          </nav>

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
