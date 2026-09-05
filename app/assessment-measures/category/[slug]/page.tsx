import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import {
  arabicStatusBadge,
  assessmentMeasureCategories,
  getAssessmentMeasureCategory,
  getMeasuresByCategory,
  rightsBadge,
} from '@/lib/assessment-measures-catalog';
import styles from '@/components/assessment-measures.module.css';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return assessmentMeasureCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getAssessmentMeasureCategory(slug);
  if (!category) return {};
  return buildSeoMetadata({
    title: `${category.name} — المقاييس وأدوات التقييم`,
    description: `${category.description} قارن المقاييس، طريقة التطبيق، التسجيل، النسخ العربية وحقوق الاستخدام.`,
    path: `/assessment-measures/category/${category.slug}/`,
    index: true,
    follow: true,
    type: 'website',
    keywords: [category.name, 'مقاييس التقييم', 'أدوات التقييم', 'مقاييس التأهيل'],
  });
}

export default async function AssessmentMeasureCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getAssessmentMeasureCategory(slug);
  if (!category) notFound();
  const measures = getMeasuresByCategory(category.slug);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/assessment-measures/category/${category.slug}/#page`,
    url: `${SITE_URL}/assessment-measures/category/${category.slug}/`,
    name: category.name,
    description: category.description,
    inLanguage: 'ar',
    isPartOf: { '@id': `${SITE_URL}/assessment-measures/#page` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: measures.length,
      itemListElement: measures.map((measure, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${measure.nameAr} (${measure.acronym})`,
        url: `${SITE_URL}/assessment-measures/${measure.slug}/`,
      })),
    },
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-measures/">المقاييس وأدوات التقييم</Link><span>/</span><span aria-current="page">{category.name}</span>
        </nav>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>مجموعة وظيفية</span>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
          <div className={styles.stats}>
            <div className={styles.stat}><strong>{measures.length}</strong><span>مقياسًا في هذه المجموعة</span></div>
            <div className={styles.stat}><strong>{measures.filter((measure) => measure.rightsStatus === 'public-domain').length}</strong><span>Public Domain</span></div>
            <div className={styles.stat}><strong>{measures.filter((measure) => measure.arabicStatus === 'validated-version-reported').length}</strong><span>دليل عربي منشور</span></div>
            <div className={styles.stat}><strong>{measures.filter((measure) => measure.fullArabicFormPublished).length}</strong><span>بروتوكول عربي جاهز</span></div>
          </div>
          <div className={styles.heroActions}><Link className={styles.secondaryAction} href="/assessment-measures/compare/">قارن مقاييس هذه المكتبة</Link></div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><h2>المقاييس في هذه المجموعة</h2><p>اختر المقياس وفق البنية والمجتمع والبروتوكول، لا وفق الشهرة وحدها.</p></div>
            <Link href="/assessment-measures/">عرض المكتبة كاملة ←</Link>
          </div>
          {measures.length > 0 ? <div className={styles.grid}>{measures.map((measure) => <article className={styles.card} key={measure.slug}>
            <div className={styles.cardMeta}><span className={styles.badge}>{rightsBadge(measure.rightsStatus)}</span><span className={measure.fullArabicFormPublished ? styles.badgeSoft : styles.badgeWarn}>{arabicStatusBadge(measure.arabicStatus)}</span></div>
            <h3><Link href={`/assessment-measures/${measure.slug}/`}>{measure.nameAr} — {measure.acronym}</Link></h3>
            <span className={styles.englishName} lang="en" dir="ltr">{measure.nameEn}</span>
            <p>{measure.summary}</p>
            <div className={styles.cardFoot}><span>{measure.administrationTime}</span><Link href={`/assessment-measures/${measure.slug}/`}>فتح الدليل ←</Link></div>
          </article>)}</div> : <div className={styles.empty}>لا توجد مقاييس منشورة في هذه المجموعة بعد.</div>}
        </section>

        <section className={styles.section}>
          <div className={styles.callout}><strong>ملاحظة منهجية:</strong> وجود المقياس ضمن مجموعة مثل «خطر السقوط» لا يعني أنه يتنبأ بالسقوط وحده. التصنيف هنا يساعد على الاكتشاف، بينما صفحة المقياس تشرح حدود الاستخدام والتفسير.</div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
