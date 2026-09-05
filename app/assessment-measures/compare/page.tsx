import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata } from '@/lib/seo';
import { arabicStatusBadge, assessmentMeasures, rightsBadge } from '@/lib/assessment-measures-catalog';
import styles from '@/components/assessment-measures.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'مقارنة المقاييس وأدوات التقييم',
  description: 'قارن بين المقاييس المستخدمة عالميًا حسب ما تقيسه، الفئات، طريقة التطبيق، الوقت، التسجيل، النسخة العربية وحقوق الاستخدام.',
  path: '/assessment-measures/compare/',
  index: true,
  follow: true,
  type: 'website',
  keywords: ['مقارنة المقاييس', 'اختيار مقياس تقييم', 'مقارنة أدوات التقييم', 'مقاييس التأهيل'],
});

type PageProps = { searchParams: Promise<{ measure?: string | string[] }> };

export default async function AssessmentMeasuresComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.measure) ? params.measure : params.measure ? [params.measure] : [];
  const selectedSlugs = requested.filter((slug, index, array) => array.indexOf(slug) === index).slice(0, 4);
  const selected = (selectedSlugs.length ? selectedSlugs : assessmentMeasures.slice(0, 4).map((measure) => measure.slug))
    .map((slug) => assessmentMeasures.find((measure) => measure.slug === slug))
    .filter((measure): measure is NonNullable<typeof measure> => Boolean(measure));

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-measures/">المقاييس وأدوات التقييم</Link><span>/</span><span aria-current="page">المقارنة</span></nav>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>أداة اختيار عملية</span>
          <h1>قارن المقاييس قبل أن تختار</h1>
          <p>المقارنة تساعدك على رؤية اختلاف البنية، الفئة، وقت التطبيق والتسجيل والحقوق. لا تعني أن أحد المقاييس «أفضل» مطلقًا؛ الأفضل هو الأنسب لسؤال القياس والمجتمع والبروتوكول.</p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><div><h2>اختر حتى 4 مقاييس</h2><p>إذا اخترت أكثر من أربعة سنعرض أول أربعة فقط للحفاظ على قابلية القراءة.</p></div></div>
          <form className={styles.panel} action="/assessment-measures/compare/" method="get">
            <div className={styles.methodGrid}>{assessmentMeasures.map((measure) => <label key={measure.slug} className={styles.statusBox}>
              <span><input type="checkbox" name="measure" value={measure.slug} defaultChecked={selected.some((item) => item.slug === measure.slug)} /> <strong>{measure.nameAr} — {measure.acronym}</strong></span>
              <p>{measure.construct}</p>
            </label>)}</div>
            <div className={styles.heroActions}><button className={styles.primaryAction} type="submit">تحديث المقارنة</button><Link className={styles.secondaryAction} href="/assessment-measures/compare/">الافتراضي</Link></div>
          </form>
        </section>

        <section className={styles.section} aria-labelledby="comparison-title">
          <div className={styles.sectionHead}><div><h2 id="comparison-title">المقارنة</h2><p>{selected.length} مقاييس محددة.</p></div></div>
          <div className={styles.tableWrap}><table className={styles.table}>
            <thead><tr><th>البعد</th>{selected.map((measure) => <th key={measure.slug}><Link href={`/assessment-measures/${measure.slug}/`}>{measure.acronym}</Link><br /><small>{measure.nameAr}</small></th>)}</tr></thead>
            <tbody>
              <tr><td><strong>ما الذي يقيسه؟</strong></td>{selected.map((measure) => <td key={measure.slug}>{measure.construct}</td>)}</tr>
              <tr><td><strong>الغرض</strong></td>{selected.map((measure) => <td key={measure.slug}>{measure.purpose}</td>)}</tr>
              <tr><td><strong>الفئات الشائعة</strong></td>{selected.map((measure) => <td key={measure.slug}>{measure.populations.join(' · ')}</td>)}</tr>
              <tr><td><strong>طريقة التطبيق</strong></td>{selected.map((measure) => <td key={measure.slug}>{measure.administrationMode}</td>)}</tr>
              <tr><td><strong>الوقت</strong></td>{selected.map((measure) => <td key={measure.slug}>{measure.administrationTime}</td>)}</tr>
              <tr><td><strong>التسجيل</strong></td>{selected.map((measure) => <td key={measure.slug}>{measure.scoring}</td>)}</tr>
              <tr><td><strong>حقوق الأصل</strong></td>{selected.map((measure) => <td key={measure.slug}>{rightsBadge(measure.rightsStatus)}</td>)}</tr>
              <tr><td><strong>العربية</strong></td>{selected.map((measure) => <td key={measure.slug}>{arabicStatusBadge(measure.arabicStatus)}</td>)}</tr>
            </tbody>
          </table></div>
        </section>

        <section className={styles.section}><div className={styles.callout}><strong>قبل اتخاذ القرار:</strong> قارن بعد ذلك الخصائص القياسية في المجتمع المستهدف، التدريب المطلوب، حساسية التغير، السقف/الأرضية، ونسخة اللغة. الجدول هنا نقطة بداية للاختيار وليس بديلًا عن مراجعة الأدلة.</div></section>
      </main>
      <SiteFooter />
    </>
  );
}
