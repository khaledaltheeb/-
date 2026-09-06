import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import {
  kidsLabCategories,
  kidsLabSeries,
  KIDS_LAB_LEVELS,
  KIDS_LAB_PLANNED_ITEMS,
  KIDS_LAB_TARGET_ITEMS,
} from '@/lib/capabilities/kids-lab-catalog';
import { attentionActivityCount } from '@/lib/capabilities/attention-lab';
import styles from './kids-lab.module.css';

export const metadata = buildSeoMetadata({
  title: 'مختبر الأنشطة والاختبارات للأطفال | لنرتقي بقدراتهم',
  description: 'مكتبة عربية متدرجة لأنشطة الأطفال القابلة للطباعة: 67 سلسلة مهارية، خمسة مستويات، تدريبان واختبار إتقان لكل مستوى، مع تصنيف حسب العمر والمهارة والاحتياج.',
  path: '/capabilities/kids-lab/',
  index: true,
  keywords: ['أنشطة أطفال قابلة للطباعة', 'أوراق عمل للأطفال', 'اختبارات مهارات للأطفال', 'الانتباه والتركيز', 'الذاكرة العاملة', 'المهارات الحركية الدقيقة', 'التآزر الثنائي'],
});

const flow = [
  ['1', 'اختر السلسلة', 'ابدأ من المهارة المطلوبة والعمر المناسب، لا من اسم التشخيص وحده.'],
  ['2', 'ابدأ بالمستوى المناسب', 'كل سلسلة تتدرج من مهام واضحة وبسيطة إلى مهام تتطلب استقلالًا ومرونة أكبر.'],
  ['3', 'تدريبان ثم اختبار', 'لكل مستوى نشاطان تدريبيان ثم اختبار مختلف بصريًا لقياس الإتقان بدل حفظ الورقة.'],
  ['4', 'انتقل بناءً على الأداء', 'إذا أتقن الطفل المهارة انتقل للمستوى التالي، وإلا استخدم تدريبًا إضافيًا أو تكييفًا مناسبًا.'],
];

export default function KidsLabPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'لنرتقي بقدراتهم', path: '/sectors/capabilities' },
    { name: 'مختبر الأنشطة والاختبارات للأطفال', path: '/capabilities/kids-lab/' },
  ]);
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/capabilities/kids-lab/#collection`,
    url: `${SITE_URL}/capabilities/kids-lab/`,
    name: 'مختبر الأنشطة والاختبارات للأطفال',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    numberOfItems: kidsLabSeries.length,
    description: 'سلاسل مهارية متدرجة للأطفال، لكل مستوى تدريبان واختبار إتقان قابلان للمعاينة والطباعة.',
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collection]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors/capabilities">لنرتقي بقدراتهم</Link><span>/</span><span aria-current="page">مختبر الأطفال</span>
        </nav>

        <section className={styles.hero}>
          <span className={styles.kicker}>أنشطة جميلة، متدرجة، قابلة للطباعة</span>
          <h1>مختبر الأنشطة والاختبارات للأطفال</h1>
          <p className={styles.lead}>ليس مستودع أوراق عشوائيًا. كل مهارة تتحول إلى سلسلة من خمسة مستويات، وكل مستوى يحتوي تدريبين ثم اختبار إتقان مستقل. التصميم موجه للطفل: ألوان واضحة، مساحة عمل كبيرة، تعليمات قصيرة، ومعاينة كاملة قبل الطباعة.</p>
          <div className={styles.stats}>
            <div className={styles.stat}><strong>{kidsLabSeries.length}</strong><span>سلسلة مهارية مخططة</span></div>
            <div className={styles.stat}><strong>{KIDS_LAB_LEVELS}</strong><span>مستويات لكل سلسلة</span></div>
            <div className={styles.stat}><strong>{KIDS_LAB_PLANNED_ITEMS}</strong><span>عنصرًا في الخطة الخام قبل المراجعة</span></div>
            <div className={styles.stat}><strong>{KIDS_LAB_TARGET_ITEMS}</strong><span>نشاط واختبار في النسخة المعتمدة المستهدفة</span></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><div><h2>كيف يعمل التدرج؟</h2><p>لا ينتقل الطفل لأن عمره ازداد أو لأنه أنهى الورقة، بل لأن أداءه في اختبار المستوى يدل على جاهزية معقولة للمهمة التالية.</p></div></div>
          <div className={styles.flow}>
            {flow.map(([number, title, text]) => (
              <article className={styles.flowCard} key={number}>
                <span className={styles.flowNumber}>{number}</span><h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.launchCard}>
            <div>
              <span className={styles.kicker}>المجال الأول مكتمل إنتاجيًا</span>
              <h2>الانتباه والتركيز - 120 نشاطًا واختبارًا</h2>
              <p>ثماني سلاسل مختلفة، من الانتباه الانتقائي والمستمر إلى تبديل القاعدة وسرعة المعالجة والانتباه المزدوج. كل سلسلة خمسة مستويات، وفي كل مستوى تدريبان واختبار مستقل.</p>
              <div className={styles.actions}>
                <Link className={styles.primaryButton} href="/capabilities/kids-lab/attention/">افتح مجال الانتباه</Link>
                <Link className={styles.secondaryButton} href="/capabilities/kids-lab/attention/visual-selective-attention/">ابدأ بالسلسلة 1</Link>
              </div>
              <div className={styles.metaRow}><span className={styles.metaChip}>8 سلاسل</span><span className={styles.metaChip}>40 اختبار إتقان</span><span className={styles.metaChip}>{attentionActivityCount} عنصرًا</span></div>
            </div>
            <div className={styles.launchVisual} aria-hidden="true"><div className={styles.track} /><div className={`${styles.track} ${styles.trackBlue}`} /></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.launchCard}>
            <div>
              <span className={styles.kicker}>سلسلة حركية مكتملة</span>
              <h2>43. مسارا اليدين المتزامنان</h2>
              <p>خمسة مستويات كاملة. في كل مستوى تدريبان واختبار منفصل. تبدأ المسارات متماثلة وواضحة ثم تصبح مختلفة، وتضاف إشارات توقف وبطء وقواعد متغيرة تدريجيًا.</p>
              <div className={styles.actions}>
                <Link className={styles.primaryButton} href="/capabilities/kids-lab/bilateral-tracks/">افتح السلسلة</Link>
                <Link className={styles.secondaryButton} href="/capabilities/kids-lab/bilateral-tracks/level-1-training-a/">شاهد أول ورقة</Link>
              </div>
            </div>
            <div className={styles.launchVisual} aria-hidden="true"><div className={styles.track} /><div className={`${styles.track} ${styles.trackBlue}`} /></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><div><h2>خريطة السلاسل الـ67</h2><p>السلاسل 1-8 في الانتباه والتركيز والسلسلة 43 مفعلة الآن. بقية السلاسل مثبتة في الكتالوج لتنتج بنفس العقد التصميمي والعلمي.</p></div></div>
          <div className={styles.categoryGrid}>
            {kidsLabCategories.map((category) => (
              <article className={styles.categoryCard} style={{ '--category-color': category.color } as React.CSSProperties} key={category.slug}>
                <h3>{category.title}</h3><p>{category.summary}</p>
                <div className={styles.seriesList}>
                  {category.series.map((series) => category.slug === 'attention' ? (
                    <Link href={`/capabilities/kids-lab/attention/${series.slug}/`} className={styles.seriesActive} key={series.slug}>
                      <span className={styles.seriesNumber}>{series.number}</span><span><strong>{series.title}</strong><small>{series.example}</small></span><span className={styles.readyBadge}>جاهزة</span>
                    </Link>
                  ) : series.slug === 'bilateral-tracks' ? (
                    <Link href="/capabilities/kids-lab/bilateral-tracks/" className={styles.seriesActive} key={series.slug}>
                      <span className={styles.seriesNumber}>{series.number}</span><span><strong>{series.title}</strong><small>{series.example}</small></span><span className={styles.readyBadge}>جاهزة</span>
                    </Link>
                  ) : (
                    <div className={styles.seriesItem} key={series.slug}>
                      <span className={styles.seriesNumber}>{series.number}</span><span><strong>{series.title}</strong><small>{series.example}</small></span><span className={styles.badge}>{series.ages}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}><div className={styles.note}><strong>قاعدة علمية ثابتة:</strong> اختبارات المستوى هنا تقيس إتقان المهمة داخل السلسلة، ولا تُستخدم لتشخيص ADHD أو التوحد أو اضطراب تعلم أو أي حالة طبية أو نفسية. يمكن تكييف النشاط لاحتياجات مختلفة، لكن اسم التشخيص وحده لا يحدد الورقة المناسبة.</div></section>
      </main>
      <SiteFooter />
    </>
  );
}
