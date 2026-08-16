import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import styles from './care-guide-page.module.css';
import {
  careGuideCategory,
  careGuideDisclaimer,
  careGuidePageRole,
  safeCareGuideReferences,
  visibleCareGuideFaq,
  type CareGuideItem,
  type CareGuideRecord,
  type CareGuideRelatedItem,
} from '@/lib/care-guides';
import { contentReviewProvenance } from '@/lib/review-provenance';
import { breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

type Props = {
  record: CareGuideRecord;
  items?: CareGuideItem[];
  related?: CareGuideRelatedItem[];
  routeSegments?: string[];
};

function CareGuidesNav({ end = false }: { end?: boolean }) {
  return <nav className={end ? styles.endNav : styles.referenceNav} aria-label="التنقل داخل أدلة التعامل والرعاية">
    <Link href="/care-guides/">كل أدلة التعامل والرعاية</Link>
    <Link href="/search/?type=guide">البحث في الأدلة</Link>
    <Link href="/specialists/">دليل المختصين</Link>
  </nav>;
}

function GuideBrowser({ items }: { items: CareGuideItem[] }) {
  const grouped = new Map<string, CareGuideItem[]>();
  for (const item of items) {
    const group = grouped.get(item.category) ?? [];
    group.push(item);
    grouped.set(item.category, group);
  }

  return <section className={styles.browser} aria-labelledby="care-guides-browser-title">
    <div className={styles.browserHeader}>
      <div><span className="eyebrow">فهرس عملي</span><h2 id="care-guides-browser-title">استكشف الأدلة حسب الحاجة</h2></div>
      <p>نُظمت الأدلة بحسب الموقف والحاجة العملية بدل تكرار الصفحة نفسها لكل جمهور. استخدم العنوان الأقرب لسؤالك ثم انتقل إلى المصادر والروابط المرتبطة داخل الدليل.</p>
    </div>
    <div className={styles.groups}>
      {[...grouped.entries()].map(([category, rows]) => <section className={styles.group} key={category} aria-labelledby={`care-guide-group-${rows[0]?.id}`}>
        <h2 id={`care-guide-group-${rows[0]?.id}`}>{category} <span className={styles.count}>({rows.length})</span></h2>
        <div className={styles.grid}>{rows.map((item) => <article className={styles.card} key={item.id}>
          <h3><Link href={item.canonicalUrl}>{item.title}</Link></h3>
          {item.excerpt ? <p>{item.excerpt}</p> : null}
          {item.audience.length ? <div className={styles.meta} aria-label="الفئات المستفيدة">{item.audience.slice(0, 4).map((audience) => <span key={audience}>{audience}</span>)}</div> : null}
        </article>)}</div>
      </section>)}
    </div>
  </section>;
}

export default function CareGuidePage({ record, items = [], related = [], routeSegments = [] }: Props) {
  const role = careGuidePageRole(record.schema_json);
  const references = safeCareGuideReferences(record.references_json);
  const faqItems = visibleCareGuideFaq(record.body_json);
  const centralDisclaimer = careGuideDisclaimer(record.schema_json);
  const review = contentReviewProvenance(record);
  const canonical = record.canonical_url || (routeSegments.length ? `/care-guides/${routeSegments.join('/')}/` : '/care-guides/');
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const audiences = Array.isArray(record.audience) ? record.audience.map(String) : [];
  const category = careGuideCategory(record.schema_json);
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    ...(routeSegments.length ? [{ name: 'أدلة التعامل والرعاية', path: '/care-guides/' }] : []),
    { name: record.title, path: canonical },
  ]);

  const baseSchema = {
    '@context': 'https://schema.org',
    '@id': `${url}#page`,
    url,
    name: record.title,
    headline: record.title,
    description: record.seo_description || record.excerpt || undefined,
    inLanguage: 'ar',
    datePublished: record.published_at || undefined,
    dateModified: record.updated_at || undefined,
    lastReviewed: review.lastReviewedAt || undefined,
    publisher: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
    image: record.featured_image_url ? (record.featured_image_url.startsWith('https://') ? record.featured_image_url : `${SITE_URL}${record.featured_image_url}`) : undefined,
  };

  const pageSchema: Record<string, unknown> = role === 'hub'
    ? {
      ...baseSchema,
      '@type': 'CollectionPage',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.title,
          url: item.canonicalUrl.startsWith('https://') ? item.canonicalUrl : `${SITE_URL}${item.canonicalUrl}`,
        })),
      },
    }
    : {
      ...baseSchema,
      '@type': 'Article',
      articleSection: category,
      author: record.author_display_name ? { '@type': 'Organization', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` },
      reviewedBy: review.reviewedBySchema,
      citation: references.flatMap((reference) => reference.url ? [reference.url] : []),
    };

  const faqSchema = faqItems.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  } : null;

  const schemas = [breadcrumbs, pageSchema, ...(faqSchema ? [faqSchema] : [])];

  return <><SiteHeader /><main className="article-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link>{routeSegments.length ? <><span>/</span><Link href="/care-guides/">أدلة التعامل والرعاية</Link></> : null}<span>/</span><span aria-current="page">{record.title}</span></nav>
    <article>
      <header className="article-hero">
        <span className="eyebrow">{role === 'hub' ? 'أدلة التعامل والرعاية' : category}</span>
        <h1>{record.title}</h1>
        {record.excerpt ? <p>{record.excerpt}</p> : null}
        <div className="article-meta">
          {record.author_display_name ? <span>إعداد: {record.author_display_name}</span> : null}
          {review.reviewerName ? <span>مراجعة: {review.reviewerName}{review.reviewerCredentials ? ` — ${review.reviewerCredentials}` : ''}</span> : null}
          {record.published_at ? <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span> : null}
          {review.lastReviewedAt ? <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(review.lastReviewedAt))}</span> : null}
        </div>
        {audiences.length ? <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div> : null}
      </header>
      <CareGuidesNav />
      {role === 'hub' && items.length ? <GuideBrowser items={items} /> : null}
      <div className="article-body">
        {record.featured_image_url ? <figure className="article-featured-image"><Image src={record.featured_image_url} alt={record.featured_image_alt || record.title} width={1200} height={675} sizes="(max-width: 900px) 100vw, 900px" priority={role === 'hub'} unoptimized /></figure> : null}
        <ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id} />
      </div>
      {(record.medical_disclaimer || centralDisclaimer) ? <aside className="medical-disclaimer" aria-label="حدود المحتوى"><strong>تنبيه صحي ومنهجي</strong>{record.medical_disclaimer ? <p>{record.medical_disclaimer}</p> : <p>هذا الدليل للتثقيف والدعم العملي العام، ولا يحل محل التقييم أو التشخيص أو العلاج المهني الفردي.</p>}<Link href={centralDisclaimer?.url || '/disclaimer'}>{centralDisclaimer?.label || 'إخلاء المسؤولية الكامل'}</Link></aside> : null}
      {related.length ? <section className="article-related" aria-labelledby="care-guide-related-title"><div className="section-mini-heading"><div><span className="eyebrow">روابط داخلية دلالية</span><h2 id="care-guide-related-title">محتوى مرتبط</h2></div><span>اختيار من المحتوى المنشور وفق الصلة الموضوعية</span></div><div className="related-content-grid">{related.map((item) => <article key={item.id}><span>{item.contentType}</span><h3><Link href={item.href}>{item.title}</Link></h3>{item.excerpt ? <p>{item.excerpt}</p> : null}<Link href={item.href}>متابعة القراءة ←</Link></article>)}</div></section> : null}
      <CareGuidesNav end />
      {references.length ? <section className="article-references" aria-labelledby="care-guide-references-title"><h2 id="care-guide-references-title">المصادر والمراجع</h2><ol>{references.map((reference, index) => <li key={`${reference.url || reference.title}-${index}`}>{reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}{reference.publisher ? <small>{reference.publisher}</small> : null}{reference.year ? <small>{String(reference.year)}</small> : null}</li>)}</ol></section> : null}
    </article>
  </main><SiteFooter /></>;
}
