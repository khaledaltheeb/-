import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import styles from './capability-article-page.module.css';
import type { CapabilityRecord } from '@/lib/capabilities';
import {
  safeOutsideBoxReferences,
  sanitizeOutsideBoxBody,
  sanitizeOutsideBoxText,
  type OutsideBoxIndexItem,
  type OutsideBoxSibling,
} from '@/lib/outside-the-box';
import { contentReviewProvenance } from '@/lib/review-provenance';
import { breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

type JsonRecord = Record<string, unknown>;

type ArticleProps = {
  record: CapabilityRecord;
  routeSlug: string;
  capabilitySibling?: OutsideBoxSibling | null;
};

type HubProps = {
  items: OutsideBoxIndexItem[];
};

const DEFAULT_DISCLAIMER = 'هذه المادة إطار علمي وتطبيقي عام لمقدمي الخدمة ولا تُنتج تشخيصًا أو وصفة علاج فردية. تُقدَّم السلامة والتقييم المتخصص والحقوق وقرار الشخص على أي تجربة أو بروتوكول.';

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function namedAuthors(value: unknown, fallback?: string | null) {
  const root = asRecord(value);
  const authors = Array.isArray(root?.authors)
    ? root.authors.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim())
    : [];
  if (authors.length > 0) return authors;
  return fallback?.trim() ? [fallback.trim()] : [];
}

function OutsideBoxNav({ end = false }: { end?: boolean }) {
  return (
    <nav className={end ? styles.endNav : styles.referenceNav} aria-label={end ? 'الخطوة التالية في خارج الصندوق' : 'المسارات العلمية في خارج الصندوق'}>
      <Link href="/outside-the-box/">خارج الصندوق</Link>
      <Link href="/outside-the-box/methodology/">المنهجية</Link>
      <Link href="/outside-the-box/evidence-standard/">معيار الأدلة</Link>
      <Link href="/outside-the-box/monitoring-matrix/">مصفوفة المتابعة</Link>
      <Link href="/outside-the-box/instruments/">حوكمة أدوات التقييم</Link>
      <Link href="/outside-the-box/review-governance/">حوكمة المراجعة العلمية</Link>
      <Link href="/sectors/capabilities">لنرتقي بقدراتهم</Link>
    </nav>
  );
}

export function OutsideTheBoxHubPage({ items }: HubProps) {
  const methods = items.filter((item) => item.kind === 'methodology');
  const conditions = items.filter((item) => item.kind === 'condition');
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/outside-the-box/#collection`,
    url: `${SITE_URL}/outside-the-box/`,
    name: 'خارج الصندوق — مسارات علمية قابلة للاختبار والقياس',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.title,
        url: `${SITE_URL}${item.href}`,
      })),
    },
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'خارج الصندوق', path: '/outside-the-box/' },
  ]);

  return (
    <>
      <SiteHeader />
      <main className="trust-page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collection]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">خارج الصندوق</span>
        </nav>

        <header style={{ maxWidth: 1040, margin: '0 auto 2.5rem', padding: 'clamp(2.2rem,6vw,5rem)', borderRadius: 30, background: '#f7fbfa', border: '1px solid rgba(7,95,97,.14)' }}>
          <span className="eyebrow">العلم أولًا: فرضية، تجربة، قياس، ثم قرار</span>
          <h1>خارج الصندوق</h1>
          <p style={{ fontSize: '1.15rem', lineHeight: 2, maxWidth: 860 }}>
            مكتبة علمية لمقدمي الخدمة تربط الحالة بالسؤال الوظيفي والتقييم متعدد المصادر وخط الأساس والتجربة القابلة للعكس وجودة التنفيذ ومؤشرات النتيجة وقواعد التوقف والتعميم. لا تفترض أن الفكرة المبتكرة صحيحة؛ بل تجعلها قابلة للاختبار والتراجع عنها إذا لم تفد الشخص.
          </p>
          <div className="public-stat-strip">
            <span>{conditions.length.toLocaleString('ar')} مسار حالة منشور</span>
            <span>{methods.length.toLocaleString('ar')} مراجع منهجية علمية</span>
            <span>{items.reduce((sum, item) => sum + item.referenceCount, 0).toLocaleString('ar')} إحالة مرجعية مسجلة</span>
          </div>
          <p style={{ lineHeight: 1.9, color: 'var(--muted, #53686b)' }}>
            هذا القسم مستقل عن <Link href="/sectors/capabilities">«لنرتقي بقدراتهم»</Link>: هناك نركز على القدرة ونقاط القوة والوصول والمشاركة؛ وهنا نركز على منهج مقدم الخدمة للتقييم والتجربة والقياس وإعادة القرار. عندما توجد الصفحة المناظرة للحالة، يظهر رابط مباشر بين المسارين.
          </p>
        </header>

        <OutsideBoxNav />

        {methods.length > 0 ? (
          <section style={{ maxWidth: 1100, margin: '2.5rem auto' }} aria-labelledby="outside-methods-title">
            <span className="eyebrow">الأساس العلمي والمنهجي</span>
            <h2 id="outside-methods-title">قبل تطبيق أي فكرة</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem', marginTop: '1.25rem' }}>
              {methods.map((item) => (
                <Link key={item.slug} href={item.href} style={{ display: 'block', padding: '1.35rem', border: '1px solid rgba(7,95,97,.14)', borderRadius: 18, background: '#fff', color: 'inherit', textDecoration: 'none' }}>
                  <h3 style={{ marginTop: 0 }}>{item.title}</h3>
                  {item.excerpt ? <p style={{ lineHeight: 1.8 }}>{item.excerpt}</p> : null}
                  <small>{item.referenceCount.toLocaleString('ar')} مراجع مسجلة</small>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section style={{ maxWidth: 1100, margin: '3rem auto' }} aria-labelledby="outside-conditions-title">
          <span className="eyebrow">المسارات التطبيقية</span>
          <h2 id="outside-conditions-title">الحالات المنشورة</h2>
          <p style={{ lineHeight: 1.9, maxWidth: 850 }}>كل صفحة تحتفظ بسؤالها الوظيفي، التقييم، خط الأساس، البروتوكولات القابلة للتخصيص، الجرعة أو الوتيرة حين تكون مبررة، جودة التنفيذ، مؤشرات النتيجة، التوقف والتصعيد، وإعادة التقييم.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: '.85rem', marginTop: '1.25rem' }}>
            {conditions.map((item) => (
              <Link key={item.slug} href={item.href} style={{ display: 'block', padding: '1.1rem 1.2rem', border: '1px solid rgba(7,95,97,.13)', borderRadius: 16, background: '#fff', color: 'inherit', textDecoration: 'none' }}>
                <strong>{item.title}</strong>
                <div style={{ marginTop: '.45rem', color: 'var(--muted, #53686b)' }}>{item.referenceCount.toLocaleString('ar')} مراجع</div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="medical-disclaimer" aria-label="حدود الاستخدام">
          <strong>حدود الاستخدام</strong>
          <p>{DEFAULT_DISCLAIMER}</p>
          <Link href="/disclaimer">إخلاء المسؤولية الكامل</Link>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}

export default function OutsideTheBoxArticlePage({ record, routeSlug, capabilitySibling }: ArticleProps) {
  const references = safeOutsideBoxReferences(record.references_json);
  const bodyJson = sanitizeOutsideBoxBody(record.body_json);
  const bodyText = sanitizeOutsideBoxText(record.body_text || '');
  const review = contentReviewProvenance(record);
  const authors = namedAuthors(record.schema_json, record.author_display_name);
  const canonical = record.canonical_url || `/outside-the-box/${routeSlug}/`;
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const audiences = Array.isArray(record.audience) ? record.audience.map(String) : [];
  const disclaimer = sanitizeOutsideBoxText(record.medical_disclaimer || DEFAULT_DISCLAIMER);

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'خارج الصندوق', path: '/outside-the-box/' },
    { name: record.title, path: canonical },
  ]);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
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
    author: authors.length > 0 ? authors.map((name) => ({ '@type': 'Person', name })) : { '@id': `${SITE_URL}/#organization` },
    reviewedBy: review.reviewedBySchema,
    citation: references.flatMap((reference) => reference.url ? [reference.url] : []),
    isPartOf: { '@id': `${SITE_URL}/outside-the-box/#collection` },
  };

  return (
    <>
      <SiteHeader />
      <main className="article-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, articleSchema]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/outside-the-box/">خارج الصندوق</Link><span>/</span><span aria-current="page">{record.title}</span>
        </nav>

        <article>
          <header className="article-hero">
            <span className="eyebrow">خارج الصندوق — مسار علمي لمقدم الخدمة</span>
            <h1>{record.title}</h1>
            {record.excerpt ? <p>{record.excerpt}</p> : null}
            <div className="article-meta">
              {authors.length > 0 ? <span>المؤلفات: {authors.join(' · ')}</span> : null}
              {review.reviewerName ? <span>مراجعة: {review.reviewerName}{review.reviewerCredentials ? ` — ${review.reviewerCredentials}` : ''}</span> : null}
              {record.published_at ? <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span> : null}
              {review.lastReviewedAt ? <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(review.lastReviewedAt))}</span> : null}
            </div>
            {audiences.length > 0 ? <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div> : null}
          </header>

          <OutsideBoxNav />

          {capabilitySibling ? (
            <aside style={{ margin: '1.4rem 0', padding: '1.1rem 1.25rem', borderRadius: 16, border: '1px solid rgba(7,95,97,.17)', background: '#f7fbfa' }}>
              <strong>المسار العلمي الموازي في «لنرتقي بقدراتهم»</strong>
              <p style={{ marginBottom: '.65rem', lineHeight: 1.8 }}>للقراءة من زاوية القدرة ونقاط القوة والوصول والمشاركة، افتح الصفحة المناظرة دون استبدال هذا المسار التشغيلي.</p>
              <Link href={capabilitySibling.href}>{capabilitySibling.title} ←</Link>
            </aside>
          ) : null}

          <div className="article-body">
            {record.featured_image_url ? (
              <figure className="article-featured-image">
                <Image src={record.featured_image_url} alt={record.featured_image_alt || record.title} width={1200} height={675} sizes="(max-width: 900px) 100vw, 900px" unoptimized />
              </figure>
            ) : null}
            <ContentRenderer bodyJson={bodyJson} bodyText={bodyText} recordId={record.id} />
          </div>

          <aside className="medical-disclaimer" aria-label="تنبيه منهجي وصحي">
            <strong>تنبيه منهجي وصحي</strong>
            <p>{disclaimer}</p>
            <Link href="/disclaimer">إخلاء المسؤولية الكامل</Link>
          </aside>

          <OutsideBoxNav end />

          {references.length > 0 ? (
            <section className="article-references" aria-labelledby="outside-references-title">
              <h2 id="outside-references-title">المصادر والمراجع العلمية</h2>
              <ol>
                {references.map((reference, index) => (
                  <li key={`${reference.url || reference.title}-${index}`}>
                    {reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}
                    {reference.publisher ? <small>{reference.publisher}</small> : null}
                    {reference.year ? <small>{String(reference.year)}</small> : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
