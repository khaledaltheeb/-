import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { attentionActivityCount, attentionSeriesPlans } from '@/lib/capabilities/attention-lab';
import styles from '../kids-lab.module.css';

export const metadata = buildSeoMetadata({
  title: 'الانتباه والتركيز للأطفال | 120 نشاطًا واختبارًا متدرجًا',
  description: 'ثماني سلاسل متدرجة لتنمية الانتباه والتركيز لدى الأطفال، بخمسة مستويات وتدريبين واختبار إتقان لكل مستوى، مع معاينة وطباعة.',
  path: '/capabilities/kids-lab/attention/',
  index: true,
  keywords: ['أنشطة التركيز للأطفال', 'الانتباه الانتقائي', 'الانتباه المستمر', 'مقاومة المشتتات', 'أوراق عمل تركيز قابلة للطباعة'],
});

export default function AttentionLabPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'مختبر الأطفال', path: '/capabilities/kids-lab/' },
    { name: 'الانتباه والتركيز', path: '/capabilities/kids-lab/attention/' },
  ]);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/capabilities/kids-lab/attention/#collection`,
    url: `${SITE_URL}/capabilities/kids-lab/attention/`,
    name: 'الانتباه والتركيز للأطفال',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    numberOfItems: attentionActivityCount,
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, schema]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><span aria-current="page">الانتباه والتركيز</span>
        </nav>

        <section className={styles.hero}>
          <span className={styles.kicker}>المجال الأول مكتمل إنتاجيًا</span>
          <h1>الانتباه والتركيز</h1>
          <p className={styles.lead}>ثماني سلاسل مختلفة، وليست نسخًا من ورقة واحدة. كل سلسلة تتدرج عبر خمسة مستويات، وفي كل مستوى تدريبان ثم اختبار إتقان بترتيب بصري جديد. الهدف هو تدريب سلوك الانتباه داخل المهمة، لا إصدار تشخيص.</p>
          <div className={styles.stats}>
            <div className={styles.stat}><strong>8</strong><span>سلاسل</span></div>
            <div className={styles.stat}><strong>5</strong><span>مستويات لكل سلسلة</span></div>
            <div className={styles.stat}><strong>40</strong><span>اختبار إتقان</span></div>
            <div className={styles.stat}><strong>{attentionActivityCount}</strong><span>نشاطًا واختبارًا</span></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><h2>اختر السلسلة</h2><p>ابدأ من المهارة التي تريد تدريبها. العمر نطاق إرشادي، لكن مستوى البداية يحدد من خلال أداء الطفل الفعلي وسهولة فهمه للمهمة.</p></div>
          </div>
          <div className={styles.categoryGrid}>
            {attentionSeriesPlans.map((series) => (
              <Link href={`/capabilities/kids-lab/attention/${series.slug}/`} className={styles.categoryCard} style={{ '--category-color': '#F59E0B' } as React.CSSProperties} key={series.slug}>
                <span className={styles.seriesNumber}>{series.number}</span>
                <h3>{series.title}</h3>
                <p>{series.purpose}</p>
                <div className={styles.metaRow}>
                  <span className={styles.metaChip}>العمر: {series.ages}</span>
                  <span className={styles.metaChip}>15 عنصرًا</span>
                </div>
                <span className={styles.readyBadge}>5 مستويات جاهزة</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.note}><strong>قاعدة الاستخدام:</strong> إذا أصبح الطفل سريعًا لكنه كثير الأخطاء، لا نصعّد المستوى. الدقة والاستراتيجية والاستقلال تسبق السرعة، خصوصًا في السلاسل التي تقيس المعالجة البصرية.</div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
