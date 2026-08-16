import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import ComparisonsBrowser from '@/components/comparisons-browser';
import styles from './comparison-article-page.module.css';
import { comparisonPageRole, safeComparisonReferences, visibleComparisonFaq, type ComparisonItem, type ComparisonRecord } from '@/lib/comparisons';
import { breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

type JsonRecord = Record<string, unknown>;
type Props = { record: ComparisonRecord; routeSlug?: string; items?: ComparisonItem[] };

function asRecord(value: unknown): JsonRecord | null { return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null; }
function schemaString(value: unknown, key: string) { const row = asRecord(value); return typeof row?.[key] === 'string' ? String(row[key]) : ''; }

function ReferenceNav({ end = false }: { end?: boolean }) {
  return <nav className={end ? styles.endNav : styles.referenceNav} aria-label="التنقل داخل موسوعة المقارنات">
    <Link href="/comparisons/">موسوعة المقارنات</Link><Link href="/comparisons/methodology/">المنهجية والمصادر</Link><Link href="/comparisons/#comparison-browser">فهرس المقارنات الخمسين</Link>
  </nav>;
}

export default function ComparisonArticlePage({ record, routeSlug, items = [] }: Props) {
  const references = safeComparisonReferences(record.references_json);
  const faqItems = visibleComparisonFaq(record.body_json);
  const role = comparisonPageRole(record.schema_json);
  const hasHumanReview = Boolean(record.reviewer_display_name?.trim());
  const canonical = record.canonical_url || (routeSlug ? `/comparisons/${routeSlug}/` : '/comparisons/');
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const audiences = Array.isArray(record.audience) ? record.audience.map(String) : [];
  const conceptA = schemaString(record.schema_json, 'concept_a');
  const conceptB = schemaString(record.schema_json, 'concept_b');
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, ...(routeSlug ? [{ name: 'موسوعة المقارنات', path: '/comparisons/' }] : []), { name: record.title, path: canonical }]);
  const common = { '@context': 'https://schema.org', '@id': `${url}#page`, url, name: record.title, headline: record.title, description: record.seo_description || record.excerpt || undefined, inLanguage: 'ar', datePublished: record.published_at || undefined, dateModified: record.updated_at || undefined, lastReviewed: hasHumanReview ? record.last_reviewed_at || undefined : undefined, publisher: { '@id': `${SITE_URL}/#organization` }, isPartOf: { '@id': `${SITE_URL}/#website` }, image: record.featured_image_url ? (record.featured_image_url.startsWith('https://') ? record.featured_image_url : `${SITE_URL}${record.featured_image_url}`) : undefined };
  const contentSchema: Record<string, unknown> = role === 'hub' ? { ...common, '@type': 'CollectionPage', mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((item) => ({ '@type': 'ListItem', position: item.rank, name: item.title, url: item.href.startsWith('https://') ? item.href : `${SITE_URL}${item.href}` })) } } : { ...common, '@type': 'Article', author: record.author_display_name ? { '@type': 'Organization', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` }, reviewedBy: hasHumanReview ? { '@type': 'Person', name: record.reviewer_display_name, description: record.reviewer_credentials || undefined } : undefined, about: role === 'comparison' && conceptA && conceptB ? [{ '@type': 'Thing', name: conceptA }, { '@type': 'Thing', name: conceptB }] : undefined, citation: references.flatMap((reference) => (reference.url ? [reference.url] : [])) };
  const faqSchema = faqItems.length > 0 ? { '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) } : null;
  const schemas = [breadcrumbs, contentSchema, ...(faqSchema ? [faqSchema] : [])];

  return <><SiteHeader /><main className="article-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link>{routeSlug ? <><span>/</span><Link href="/comparisons/">موسوعة المقارنات</Link></> : null}<span>/</span><span aria-current="page">{record.title}</span></nav>
    <article>
      <header className="article-hero"><span className="eyebrow">{role === 'methodology' ? 'المنهجية والأدلة' : 'موسوعة المقارنات المنهجية'}</span><h1>{record.title}</h1>{record.excerpt ? <p>{record.excerpt}</p> : null}<div className="article-meta">{record.author_display_name ? <span>إعداد: {record.author_display_name}</span> : null}{hasHumanReview ? <span>مراجعة: {record.reviewer_display_name}{record.reviewer_credentials ? ` — ${record.reviewer_credentials}` : ''}</span> : null}{record.published_at ? <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span> : null}{hasHumanReview && record.last_reviewed_at ? <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.last_reviewed_at))}</span> : !hasHumanReview && record.updated_at ? <span>آخر تحديث {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.updated_at))}</span> : null}</div>{audiences.length > 0 ? <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div> : null}</header>
      <ReferenceNav />
      {role === 'hub' && items.length > 0 ? <ComparisonsBrowser items={items} /> : null}
      <div className="article-body">{record.featured_image_url ? <figure className="article-featured-image"><Image src={record.featured_image_url} alt={record.featured_image_alt || record.title} width={1200} height={675} sizes="(max-width: 900px) 100vw, 900px" priority={role === 'hub'} unoptimized /></figure> : null}<ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id} /></div>
      {record.medical_disclaimer ? <aside className="medical-disclaimer" aria-label="حدود المحتوى"><strong>تنبيه منهجي وصحي</strong><p>{record.medical_disclaimer}</p><Link href="/disclaimer">إخلاء المسؤولية الكامل</Link></aside> : null}
      <ReferenceNav end />
      {references.length > 0 ? <section className="article-references" aria-labelledby="comparison-references-title"><h2 id="comparison-references-title">المصادر والمراجع</h2><ol>{references.map((reference, index) => <li key={`${reference.url || reference.title}-${index}`}>{reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}{reference.publisher ? <small>{reference.publisher}</small> : null}{reference.year ? <small>{String(reference.year)}</small> : null}</li>)}</ol></section> : null}
    </article>
  </main><SiteFooter /></>;
}
