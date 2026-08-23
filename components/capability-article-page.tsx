import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import CapabilitiesRegistryBrowser from '@/components/capabilities-registry-browser';
import styles from './capability-article-page.module.css';
import {
  capabilityBodyWithoutRegistryCards,
  safeCapabilityReferences,
  sanitizeCapabilityBody,
  sanitizeCapabilityText,
  visibleCapabilityFaq,
  type CapabilityRecord,
  type CapabilityRegistryItem,
} from '@/lib/capabilities';
import { contentReviewProvenance } from '@/lib/review-provenance';
import { breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

type JsonRecord = Record<string, unknown>;
type Props = {
  record: CapabilityRecord;
  routeSlug?: string;
  registryItems?: CapabilityRegistryItem[];
};

const DEFAULT_DISCLAIMER = 'هذا المحتوى تثقيفي وعملي عام. لا يشخّص حالة، ولا يصف علاجًا فرديًا، ولا يستبدل التقييم الطبي أو النفسي أو التأهيلي المتخصص. عند وجود ألم، تدهور، أعراض جديدة أو مخاطر سلامة، تُقدَّم الرعاية المهنية المناسبة على أي تجربة وظيفية.';

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function pageRole(value: unknown) {
  const root = asRecord(value);
  return typeof root?.page_role === 'string' ? root.page_role : '';
}

function protocolSteps(value: unknown) {
  const root = asRecord(value);
  const blocks = Array.isArray(root?.blocks) ? root.blocks : [];
  return blocks.flatMap((block, index) => {
    const row = asRecord(block);
    if (!row || row.type !== 'heading' || typeof row.text !== 'string') return [];
    const match = row.text.match(/^المرحلة\s+(\d+)\s*[:：-]?\s*(.*)$/);
    if (!match) return [];
    const next = asRecord(blocks[index + 1]);
    const items = next?.type === 'list' && Array.isArray(next.items)
      ? next.items.filter((item): item is string => typeof item === 'string')
      : [];
    return [{ position: Number(match[1]), name: match[2] || row.text, text: items.join(' ') || row.text }];
  });
}

function ReferenceNav({ end = false }: { end?: boolean }) {
  return (
    <nav className={end ? styles.endNav : styles.referenceNav} aria-label={end ? 'الخطوة التالية في قطاع لنرتقي بقدراتهم' : 'أقسام قطاع لنرتقي بقدراتهم'}>
      <Link href="/sectors/capabilities">واجهة القطاع</Link>
      <Link href="/capabilities/">ابدأ من هنا</Link>
      <Link href="/capabilities/registry/">أدلة الحالات المئة</Link>
      <Link href="/capabilities/protocol/">البروتوكول العملي</Link>
      <Link href="/capabilities/printables/">أوراق قابلة للطباعة</Link>
      <Link href="/capabilities/ideas/">أفكار خارج الصندوق</Link>
      <Link href="/capabilities/methodology/">المنهجية والأدلة</Link>
    </nav>
  );
}

export default function CapabilityArticlePage({ record, routeSlug, registryItems = [] }: Props) {
  const references = safeCapabilityReferences(record.references_json);
  const sanitizedBody = sanitizeCapabilityBody(record.body_json);
  const faqItems = visibleCapabilityFaq(sanitizedBody);
  const role = pageRole(record.schema_json);
  const review = contentReviewProvenance(record);
  const canonical = record.canonical_url || (routeSlug ? `/capabilities/${routeSlug}/` : '/capabilities/');
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const bodyJson = role === 'registry' ? capabilityBodyWithoutRegistryCards(sanitizedBody) : sanitizedBody;
  const audiences = Array.isArray(record.audience) ? record.audience.map(String) : [];
  const registry = role === 'registry' ? registryItems : [];
  const disclaimer = sanitizeCapabilityText(record.medical_disclaimer || DEFAULT_DISCLAIMER);

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'القطاعات', path: '/sectors' },
    { name: 'لنرتقي بقدراتهم', path: '/sectors/capabilities' },
    ...(routeSlug ? [{ name: 'مرجع القدرات', path: '/capabilities/' }] : []),
    { name: record.title, path: canonical },
  ]);

  const common = {
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
    image: record.featured_image_url
      ? (record.featured_image_url.startsWith('https://') ? record.featured_image_url : `${SITE_URL}${record.featured_image_url}`)
      : undefined,
  };

  const steps = role === 'protocol' ? protocolSteps(bodyJson) : [];
  const contentSchema: Record<string, unknown> = role === 'registry'
    ? {
        ...common,
        '@type': 'CollectionPage',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: registry.length,
          itemListElement: registry.map((item) => ({
            '@type': 'ListItem',
            position: item.rank,
            name: item.title,
            url: item.href.startsWith('https://') ? item.href : `${SITE_URL}${item.href}`,
          })),
        },
      }
    : role === 'hub'
      ? {
          ...common,
          '@type': 'CollectionPage',
          hasPart: [
            { '@type': 'CollectionPage', name: 'أدلة الحالات المئة', url: `${SITE_URL}/capabilities/registry/` },
            { '@type': 'HowTo', name: 'بروتوكول اكتشاف وتنمية القدرة', url: `${SITE_URL}/capabilities/protocol/` },
            { '@type': 'Article', name: 'منهجية اكتشاف القدرات', url: `${SITE_URL}/capabilities/methodology/` },
            { '@type': 'CollectionPage', name: 'أوراق قابلة للطباعة', url: `${SITE_URL}/capabilities/printables/` },
            { '@type': 'CollectionPage', name: 'أفكار خارج الصندوق', url: `${SITE_URL}/capabilities/ideas/` },
          ],
        }
      : role === 'protocol' && steps.length > 0
        ? {
            ...common,
            '@type': 'HowTo',
            step: steps.map((step) => ({
              '@type': 'HowToStep',
              position: step.position,
              name: step.name,
              text: step.text,
            })),
          }
        : {
            ...common,
            '@type': 'Article',
            author: record.author_display_name
              ? { '@type': 'Organization', name: record.author_display_name }
              : { '@id': `${SITE_URL}/#organization` },
            reviewedBy: review.reviewedBySchema,
            citation: references.flatMap((reference) => (reference.url ? [reference.url] : [])),
          };

  const faqSchema = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null;

  const schemas = [breadcrumbs, contentSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <>
      <SiteHeader />
      <main className="article-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }}
        />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link>
          <span>/</span>
          <Link href="/sectors">القطاعات</Link>
          <span>/</span>
          <Link href="/sectors/capabilities">لنرتقي بقدراتهم</Link>
          {routeSlug ? (
            <>
              <span>/</span>
              <Link href="/capabilities/">مرجع القدرات</Link>
            </>
          ) : null}
          <span>/</span>
          <span aria-current="page">{record.title}</span>
        </nav>

        <article>
          <header className="article-hero">
            <span className="eyebrow">قطاع لنرتقي بقدراتهم</span>
            <h1>{record.title}</h1>
            {record.excerpt ? <p>{record.excerpt}</p> : null}
            <div className="article-meta">
              {record.author_display_name ? <span>إعداد: {record.author_display_name}</span> : null}
              {review.reviewerName ? (
                <span>مراجعة: {review.reviewerName}{review.reviewerCredentials ? ` — ${review.reviewerCredentials}` : ''}</span>
              ) : null}
              {record.published_at ? <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span> : null}
              {review.lastReviewedAt ? <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(review.lastReviewedAt))}</span> : null}
            </div>
            {audiences.length > 0 ? <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div> : null}
          </header>

          <ReferenceNav />

          {role === 'registry' && registry.length > 0 ? <CapabilitiesRegistryBrowser items={registry} /> : null}

          <div className="article-body">
            {record.featured_image_url ? (
              <figure className="article-featured-image">
                <Image
                  src={record.featured_image_url}
                  alt={record.featured_image_alt || record.title}
                  width={1200}
                  height={675}
                  sizes="(max-width: 900px) 100vw, 900px"
                  priority={role === 'hub'}
                  unoptimized
                />
              </figure>
            ) : null}
            <ContentRenderer bodyJson={bodyJson} bodyText={sanitizeCapabilityText(record.body_text || '')} recordId={record.id} />
          </div>

          <aside className="medical-disclaimer" aria-label="تنبيه منهجي وصحي">
            <strong>تنبيه منهجي وصحي</strong>
            <p>{disclaimer}</p>
            <Link href="/disclaimer">إخلاء المسؤولية الكامل</Link>
          </aside>

          <ReferenceNav end />

          {references.length > 0 ? (
            <section className="article-references" aria-labelledby="capability-references-title">
              <h2 id="capability-references-title">المصادر والمراجع</h2>
              <ol>
                {references.map((reference, index) => (
                  <li key={`${reference.url || reference.title}-${index}`}>
                    {reference.url ? (
                      <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a>
                    ) : <span>{reference.title}</span>}
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
