import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import AddictionBrowser from '@/components/addiction-browser';
import { breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { addictionPageRole, safeAddictionReferences, visibleAddictionFaq, type AddictionItem, type AddictionRecord } from '@/lib/addiction';
import { contentReviewProvenance } from '@/lib/review-provenance';
import styles from './addiction-article-page.module.css';

type Props = { record: AddictionRecord; items?: AddictionItem[] };

export default function AddictionArticlePage({ record, items = [] }: Props) {
  const role = addictionPageRole(record.schema_json);
  const references = safeAddictionReferences(record.references_json);
  const faq = visibleAddictionFaq(record.body_json);
  const review = contentReviewProvenance(record);
  const canonical = record.canonical_url || '/addiction/';
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الإدمان والتعافي', path: '/addiction/' },
    ...(role === 'hub' ? [] : [{ name: record.title, path: canonical }]),
  ]);
  const common = {
    '@context': 'https://schema.org', '@id': `${url}#page`, url, name: record.title, headline: record.title,
    description: record.seo_description || record.excerpt || undefined, inLanguage: 'ar', datePublished: record.published_at || undefined,
    dateModified: record.updated_at || undefined, lastReviewed: review.lastReviewedAt || undefined,
    publisher: { '@id': `${SITE_URL}/#organization` }, isPartOf: { '@id': `${SITE_URL}/#website` },
    image: record.featured_image_url ? (record.featured_image_url.startsWith('https://') ? record.featured_image_url : `${SITE_URL}${record.featured_image_url}`) : undefined,
  };
  const contentSchema: Record<string, unknown> = role === 'hub'
    ? { ...common, '@type': 'CollectionPage', mainEntity: { '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((item) => ({ '@type': 'ListItem', position: item.rank, name: item.title, url: `${SITE_URL}${item.href}` })) } }
    : { ...common, '@type': 'Article', author: record.author_display_name ? { '@type': 'Organization', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` }, reviewedBy: review.reviewedBySchema, citation: references.flatMap((reference) => reference.url ? [reference.url] : []) };
  const faqSchema = faq.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) } : null;
  const schemas = [breadcrumbs, contentSchema, ...(faqSchema ? [faqSchema] : [])];

  return <>
    <SiteHeader />
    <main className="article-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link>{role !== 'hub' ? <><span>/</span><span aria-current="page">{record.title}</span></> : null}</nav>
      <article>
        <header className="article-hero">
          <span className="eyebrow">الإدمان والتعافي · أمان · علاج قائم على الدليل · استعادة الوظيفة</span>
          <h1>{record.title}</h1>
          {record.excerpt ? <p>{record.excerpt}</p> : null}
          <div className="article-meta">
            {record.author_display_name ? <span>إعداد: {record.author_display_name}</span> : null}
            {review.reviewerName ? <span>مراجعة: {review.reviewerName}{review.reviewerCredentials ? ` — ${review.reviewerCredentials}` : ''}</span> : null}
            {review.lastReviewedAt ? <span>آخر مراجعة {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(review.lastReviewedAt))}</span> : null}
          </div>
        </header>
        <aside className={styles.safetyNotice} aria-label="تنبيه سلامة عاجل">
          <strong>السلامة أولًا</strong>
          <p>عدم الاستجابة، بطء أو توقف التنفس، اختلاج، ألم صدر، ارتباك أو هياج شديد، ذهان حاد، أو خطر مباشر لإيذاء النفس أو الآخرين يحتاج إلى خدمة طوارئ محلية فورًا. لا تترك الشخص وحده عندما يكون ذلك غير آمن.</p>
          <Link href="/addiction/withdrawal-safety/">دليل سلامة الانسحاب والطوارئ</Link>
        </aside>
        <nav className={styles.sectionNav} aria-label="التنقل في قطاع الإدمان والتعافي">
          <Link href="/addiction/">المركز</Link><Link href="/addiction/substances/">أطلس المواد</Link><Link href="/addiction/compare/">المقارنات</Link><Link href="/addiction/methodology/">منهجية الأطلس</Link><Link href="/addiction/withdrawal-safety/">سلامة الانسحاب</Link><Link href="/addiction/recovery-roadmap/">خريطة التعافي</Link><Link href="/addiction/family-guide/">للأسرة</Link><Link href="/addiction/sources/">المراجع</Link>
        </nav>
        {role === 'hub' && items.length ? <AddictionBrowser items={items} /> : null}
        <div className="article-body">
          {record.featured_image_url ? <figure className="article-featured-image"><Image src={record.featured_image_url} alt={record.featured_image_alt || record.title} width={1200} height={675} sizes="(max-width:900px) 100vw, 900px" priority={role === 'hub'} unoptimized /></figure> : null}
          <ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id} />
        </div>
        {record.medical_disclaimer ? <aside className="medical-disclaimer" aria-label="تنبيه صحي"><strong>تنبيه طبي ومنهجي</strong><p>{record.medical_disclaimer}</p><Link href="/disclaimer">إخلاء المسؤولية الكامل</Link></aside> : null}
        {references.length ? <section className="article-references" aria-labelledby="addiction-references"><h2 id="addiction-references">المصادر والمراجع</h2><ol>{references.map((reference, index) => <li key={`${reference.url || reference.title}-${index}`}>{reference.url ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a> : <span>{reference.title}</span>}{reference.publisher ? <small>{reference.publisher}</small> : null}{reference.year ? <small>{String(reference.year)}</small> : null}</li>)}</ol></section> : null}
      </article>
    </main>
    <SiteFooter />
  </>;
}
