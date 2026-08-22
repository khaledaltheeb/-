import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import ContentDisclaimerLink from '@/components/content-disclaimer-link';
import { breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { evidenceKind, sourceUrl, type MagazineListingRecord, type MagazineRecord } from '@/lib/magazine';
import styles from './magazine.module.css';

type Block = { type?: string; items?: Array<{ question?: string; answer?: string }> };

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('ar', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}

function faqItems(record: MagazineRecord) {
  if (!record.body_json || typeof record.body_json !== 'object') return [];
  const blocks = (record.body_json as { blocks?: Block[] }).blocks;
  if (!Array.isArray(blocks)) return [];
  return blocks.flatMap((block) => block.type === 'faq' && Array.isArray(block.items) ? block.items : []).filter((item) => item.question && item.answer);
}

export default function MagazineArticle({ record, related }: { record: MagazineRecord; related: MagazineListingRecord[] }) {
  const canonical = record.canonical_url || `/content/${record.slug}`;
  const references = (record.references_json ?? []).filter((ref) => ref && (ref.title || ref.url));
  const primarySource = sourceUrl(record);
  const faqs = faqItems(record);
  const breadcrumb = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'المجلة والأبحاث', path: '/magazine/' },
    { name: record.title, path: canonical },
  ]);
  const scholarly = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': `${SITE_URL}${canonical}#article`,
    headline: record.title,
    description: record.excerpt || record.seo_description,
    url: `${SITE_URL}${canonical}`,
    inLanguage: 'ar',
    datePublished: record.published_at || undefined,
    dateModified: record.updated_at || undefined,
    author: { '@type': 'Organization', name: record.author_display_name || 'منصة روافد', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'منصة روافد', url: SITE_URL },
    isPartOf: { '@type': 'CollectionPage', name: 'المجلة والأبحاث', url: `${SITE_URL}/magazine/` },
    isBasedOn: primarySource || undefined,
    about: [record.primary_keyword, ...(record.semantic_terms ?? [])].filter(Boolean),
  };
  const faqSchema = faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  } : null;

  return (
    <>
      <SiteHeader />
      <main className={styles.page} dir="rtl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(scholarly) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

        <div className={styles.shell}>
          <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>←</span><Link href="/magazine/">المجلة والأبحاث</Link><span>←</span><span aria-current="page">القراءة الحالية</span></nav>
          <article className={styles.article}>
            <header className={styles.articleHero}>
              <div className={styles.cardMeta}><span>{evidenceKind(record)}</span>{record.published_at && <time dateTime={record.published_at}>{formatDate(record.published_at)}</time>}</div>
              <h1>{record.title}</h1>
              {record.excerpt && <p>{record.excerpt}</p>}
              <div className={styles.articleActions}>
                {primarySource && <a href={primarySource} target="_blank" rel="noopener noreferrer">فتح المصدر الأصلي ↗</a>}
                <Link href="/magazine/">العودة إلى فهرس المجلة</Link>
              </div>
            </header>

            <div className={styles.methodNote}><strong>طريقة القراءة:</strong> افصل بين نتيجة الدراسة ودلالتها العملية، واقرأ حدود الدليل قبل تعميم النتيجة. هذه الصفحة تحليل تثقيفي وليست توصية علاجية فردية.</div>
            <div className={styles.articleBody}><ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id} /></div>

            <ContentDisclaimerLink />

            {references.length > 0 && <section className={styles.references} aria-labelledby="magazine-references"><h2 id="magazine-references">المصدر والمراجع</h2><ol>{references.map((ref, index) => <li key={`${ref.url || ref.title}-${index}`}>{ref.url ? <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title || ref.url}</a> : <span>{ref.title}</span>}{ref.publisher && <small>{ref.publisher}</small>}{ref.year && <small>{String(ref.year)}</small>}</li>)}</ol></section>}
          </article>

          {related.length > 0 && <section className={styles.related} aria-labelledby="related-research"><div className={styles.sectionHead}><div><p className={styles.eyebrow}>قراءات مرتبطة</p><h2 id="related-research">تابع استكشاف الدليل</h2></div></div><div className={styles.relatedGrid}>{related.map((item) => <article key={item.id}><span>{evidenceKind(item)}</span><h3><Link href={item.canonical_url || `/content/${item.slug}`}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}</article>)}</div></section>}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
