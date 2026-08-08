import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import CapabilitiesRegistryBrowser from '@/components/capabilities-registry-browser';
import {
  capabilityBodyWithoutRegistryCards,
  safeCapabilityReferences,
  visibleCapabilityFaq,
  type CapabilityRecord,
  type CapabilityRegistryItem,
} from '@/lib/capabilities';
import { breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

type JsonRecord = Record<string, unknown>;
type Props = {
  record: CapabilityRecord;
  routeSlug?: string;
  registryItems?: CapabilityRegistryItem[];
};

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

export default function CapabilityArticlePage({ record, routeSlug, registryItems = [] }: Props) {
  const references = safeCapabilityReferences(record.references_json);
  const faqItems = visibleCapabilityFaq(record.body_json);
  const role = pageRole(record.schema_json);
  const canonical = record.canonical_url || (routeSlug ? `/capabilities/${routeSlug}/` : '/capabilities/');
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const bodyJson = role === 'registry' ? capabilityBodyWithoutRegistryCards(record.body_json) : record.body_json;
  const audiences = Array.isArray(record.audience) ? record.audience.map(String) : [];
  const registry = role === 'registry' ? registryItems : [];
  const sectionLinks = [
    { href: '/capabilities/', title: 'مدخل القدرات', description: 'الفكرة، حدودها، وكيف يتحول السؤال عن القوة إلى قياس وظيفي يحترم الشخص.' },
    { href: '/capabilities/registry/', title: 'سجل الحالات المئة', description: 'بحث وفلترة مباشرة للوصول إلى أدلة الحالات المئة بالعربية والإنجليزية.' },
    { href: '/capabilities/methodology/', title: 'المنهجية والأدلة', description: 'كيف نختار المصادر، نضبط الادعاءات، ونمنع التعميم والتكرار والحشو.' },
    { href: '/capabilities/protocol/', title: 'البروتوكول العملي', description: 'تسع مراحل من الأمان وصوت الشخص إلى التجربة والقياس والتعميم والقرار.' },
  ].filter((item) => item.href !== canonical);

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'ذوو الاحتياجات الخاصة والدمج والتمكين', path: '/sectors/special-needs-inclusion' },
    ...(routeSlug ? [{ name: 'لنرتقي بقدراتهم', path: '/capabilities/' }] : []),
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
    lastReviewed: record.last_reviewed_at || undefined,
    publisher: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };

  const steps = role === 'protocol' ? protocolSteps(record.body_json) : [];
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
      ? { ...common, '@type': 'CollectionPage' }
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
          <Link href="/sectors/special-needs-inclusion">ذوو الاحتياجات الخاصة والدمج والتمكين</Link>
          {routeSlug ? (
            <>
              <span>/</span>
              <Link href="/capabilities/">لنرتقي بقدراتهم</Link>
            </>
          ) : null}
          <span>/</span>
          <span aria-current="page">{record.title}</span>
        </nav>

        <article>
          <header className="article-hero">
            <span className="eyebrow">لنرتقي بقدراتهم</span>
            <h1>{record.title}</h1>
            {record.excerpt ? <p>{record.excerpt}</p> : null}
            <div className="article-meta">
              {record.author_display_name ? <span>إعداد: {record.author_display_name}</span> : null}
              {record.reviewer_display_name ? (
                <span>مراجعة: {record.reviewer_display_name}{record.reviewer_credentials ? ` — ${record.reviewer_credentials}` : ''}</span>
              ) : null}
              {record.published_at ? <span>نُشر {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.published_at))}</span> : null}
              {record.last_reviewed_at ? <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.last_reviewed_at))}</span> : null}
            </div>
            {audiences.length > 0 ? <div className="tag-list">{audiences.map((audience) => <span key={audience}>{audience}</span>)}</div> : null}
          </header>

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
            <ContentRenderer bodyJson={bodyJson} bodyText={record.body_text} recordId={record.id} />
          </div>

          {record.medical_disclaimer ? (
            <aside className="medical-disclaimer" aria-label="إخلاء المسؤولية الطبية">
              <strong>تنبيه منهجي وصحي</strong>
              <p>{record.medical_disclaimer}</p>
              <Link href="/disclaimer">إخلاء المسؤولية الكامل</Link>
            </aside>
          ) : null}

          {sectionLinks.length > 0 ? (
            <section className="article-related" aria-labelledby="capabilities-navigation-title">
              <div className="section-mini-heading">
                <div>
                  <span className="eyebrow">ترابط القسم</span>
                  <h2 id="capabilities-navigation-title">استكشف مكتبة القدرات</h2>
                </div>
                <span>المسارات المركزية للبحث والمنهج والتطبيق</span>
              </div>
              <div className="related-content-grid">
                {sectionLinks.map((item) => (
                  <article key={item.href}>
                    <span>لنرتقي بقدراتهم</span>
                    <h3><Link href={item.href}>{item.title}</Link></h3>
                    <p>{item.description}</p>
                    <Link href={item.href}>فتح المسار ←</Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

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
