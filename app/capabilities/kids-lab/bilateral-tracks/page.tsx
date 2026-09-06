import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { bilateralLevels } from '@/lib/capabilities/bilateral-tracks';
import styles from '../kids-lab.module.css';

export const metadata = buildSeoMetadata({
  title: 'مسارا اليدين المتزامنان | مختبر الأنشطة والاختبارات للأطفال',
  description: 'سلسلة متدرجة من خمسة مستويات لتدريب التآزر الثنائي والتتبع البصري الحركي والانتباه، مع تدريبين واختبار إتقان لكل مستوى.',
  path: '/capabilities/kids-lab/bilateral-tracks/',
  index: true,
  keywords: ['التآزر الثنائي', 'مسارات اليدين', 'تتبع بصري حركي', 'أنشطة أطفال قابلة للطباعة', 'تنسيق اليدين'],
});

export default function BilateralTracksPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'لنرتقي بقدراتهم', path: '/sectors/capabilities' },
    { name: 'مختبر الأطفال', path: '/capabilities/kids-lab/' },
    { name: 'مسارا اليدين المتزامنان', path: '/capabilities/kids-lab/bilateral-tracks/' },
  ]);
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': `${SITE_URL}/capabilities/kids-lab/bilateral-tracks/#resource`,
    url: `${SITE_URL}/capabilities/kids-lab/bilateral-tracks/`,
    name: 'مسارا اليدين المتزامنان',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    educationalUse: 'practice',
    learningResourceType: 'worksheet series',
    typicalAgeRange: '4-8',
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collection]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><span aria-current="page">مسارا اليدين المتزامنان</span>
        </nav>

        <section className={styles.hero}>
          <span className={styles.kicker}>السلسلة 43 · التآزر الثنائي</span>
          <h1>مسارا اليدين المتزامنان</h1>
          <p className={styles.lead}>
            يبدأ الطفل بمسارين متماثلين وواضحين، ثم ينتقل تدريجيًا إلى اختلاف المسارين، التوقف والبطء عند إشارات، ثم قواعد متغيرة. لكل مستوى تدريبان، وبعدهما اختبار جديد لا يكرر ورقة التدريب.
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}><strong>5</strong><span>مستويات متدرجة</span></div>
            <div className={styles.stat}><strong>10</strong><span>أوراق تدريب</span></div>
            <div className={styles.stat}><strong>5</strong><span>اختبارات إتقان</span></div>
            <div className={styles.stat}><strong>4-8</strong><span>سنوات كنطاق أولي مع تكييف حسب الأداء</span></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><h2>المسار الكامل</h2><p>ابدأ من المستوى الأول إذا لم توجد ملاحظة سابقة موثوقة. إذا كانت المهمة سهلة جدًا يمكن للمرافق اختيار مستوى أعلى، لكن الاختبار هو الذي يحسم الانتقال التالي.</p></div>
          </div>
          <div className={styles.levelGrid}>
            {bilateralLevels.map(({ level, activities }) => (
              <article className={styles.levelCard} key={level}>
                <span className={styles.kicker}>المستوى {level}</span>
                <h3>{level === 1 ? 'التزامن الأساسي' : level === 2 ? 'تغير شكل المسار' : level === 3 ? 'توقف وبطء' : level === 4 ? 'مساران غير متناظرين' : 'قواعد متغيرة'}</h3>
                <div className={styles.activityList}>
                  {activities.map((activity) => (
                    <Link
                      key={activity.slug}
                      href={`/capabilities/kids-lab/bilateral-tracks/${activity.slug}/`}
                      className={`${styles.activityLink} ${activity.kind === 'test' ? styles.testLink : ''}`}
                    >
                      <strong>{activity.label}</strong>
                      <small>{activity.title}</small>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.note}>
            <strong>لماذا نستخدم هذه السلسلة؟</strong> لدعم التآزر بين اليدين، التتبع البصري الحركي، استمرار الانتباه وتنظيم الحركة المتزامنة. لا نصفها بأنها «توازن نصفي الدماغ» ولا نستخدم نتيجتها كاختبار تشخيصي.
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
