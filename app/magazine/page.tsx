import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import { evidenceKind, getMagazineItems } from '@/lib/magazine';
import styles from '@/components/magazine.module.css';

export const dynamic = 'force-dynamic';

const description = 'مجلة روافد للأبحاث: قراءات عربية نقدية للدراسات والتجارب العشوائية والمراجعات المنهجية والتحليلات التلوية، مع النتائج والقيود والمصادر الأصلية.';

export const metadata: Metadata = buildSeoMetadata({
  title: 'المجلة والأبحاث العلمية',
  description,
  path: '/magazine/',
  index: true,
  follow: true,
  type: 'website',
  hreflang: { ar: '/magazine/', 'x-default': '/magazine/' },
});

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat('ar', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value));
}

export default async function MagazinePage() {
  const items = await getMagazineItems();
  const kinds = Array.from(new Set(items.map(evidenceKind)));
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'المجلة والأبحاث العلمية | منصة روافد',
    description,
    url: `${SITE_URL}/magazine/`,
    inLanguage: 'ar',
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    hasPart: items.map((item) => ({ '@type': 'ScholarlyArticle', name: item.title, url: `${SITE_URL}${item.canonical_url}` })),
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.page} dir="rtl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <section className={styles.hero}>
          <div className={styles.shell}>
            <p className={styles.eyebrow}>المجلة والأبحاث</p>
            <h1>قراءات عربية نقدية للأبحاث والدراسات الحديثة</h1>
            <p className={styles.heroLead}>لا نكتفي بعنوان الدراسة أو نتيجتها. نعرض سؤال البحث، التصميم والعينة، النتائج، حدود الدليل، الدلالة العملية، وما لا يمكن استنتاجه، مع رابط المصدر الأصلي لكل قراءة.</p>
            <div className={styles.stats} aria-label="إحصاءات المجلة">
              <span><strong>{items.length}</strong> قراءة علمية</span>
              <span><strong>{kinds.length}</strong> أنواع من الأدلة</span>
              <span><strong>100%</strong> بمصدر أصلي</span>
            </div>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.readingGuide}`} aria-labelledby="reading-guide-title">
          <p className={styles.eyebrow}>منهج القراءة</p>
          <h2 id="reading-guide-title">كيف تقرأ تحليلات المجلة؟</h2>
          <div className={styles.guideGrid}>
            <article><h3>ابدأ بالسؤال والمنهج</h3><p>حدد سؤال الدراسة ونوع التصميم والعينة والمقارنة. قوة النتيجة لا تنفصل عن الطريقة التي جُمعت بها البيانات.</p></article>
            <article><h3>افصل الدلالة عن الأهمية</h3><p>وجود فرق إحصائي لا يعني تلقائيًا أثرًا كبيرًا أو مهمًا في الحياة اليومية. راقب حجم الأثر والوظيفة والمدة.</p></article>
            <article><h3>اقرأ القيود قبل التعميم</h3><p>راجع التحيز، التعمية، مدة المتابعة، حجم العينة، والسياق قبل نقل النتيجة إلى فئة أو بلد أو شخص آخر.</p></article>
            <article><h3>ارجع إلى المصدر الأصلي</h3><p>كل قراءة تحتفظ بمرجع الدراسة أو السجل العلمي. استخدم الرابط الأصلي للتحقق من المنهج والجداول والتفاصيل.</p></article>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.catalog}`} aria-labelledby="magazine-catalog-title">
          <div className={styles.sectionHead}>
            <div><p className={styles.eyebrow}>الفهرس الكامل</p><h2 id="magazine-catalog-title">جميع القراءات المنشورة</h2></div>
            <p>{items.length} صفحة محفوظة على مساراتها الأصلية، مع عرض حديث وبيانات منظمة للفهرسة.</p>
          </div>
          <div className={styles.chips} aria-label="أنواع الأدلة">{kinds.map((kind) => <span key={kind}>{kind}</span>)}</div>
          <div className={styles.grid}>
            {items.map((item) => (
              <article className={styles.card} key={item.id}>
                <div className={styles.cardMeta}><span>{evidenceKind(item)}</span>{item.published_at && <time dateTime={item.published_at}>{formatDate(item.published_at)}</time>}</div>
                <h3><a href={item.canonical_url || `/content/${item.slug}`}>{item.title}</a></h3>
                {item.excerpt && <p>{item.excerpt}</p>}
                <a className={styles.readMore} href={item.canonical_url || `/content/${item.slug}`}>قراءة التحليل كاملًا ←</a>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
