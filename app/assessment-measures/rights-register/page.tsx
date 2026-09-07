import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import { assessmentMeasures, rightsBadge } from '@/lib/assessment-measures-catalog';
import { assessmentMeasuresRightsReview } from '@/lib/assessment-measures-rights-review';
import { getAssessmentMeasureRightsDimensions } from '@/lib/assessment-measures-rights-dimensions';
import styles from '@/components/assessment-measures.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'سجل حقوق المقاييس وأدوات التقييم',
  description: 'سجل شفاف يفصل حقوق الأداة الأصلية عن حقوق وثيقة المصدر والترجمة العربية وحق إعادة نشر النموذج لكل مقياس في روافد.',
  path: '/assessment-measures/rights-register/',
  index: true,
  follow: true,
  type: 'website',
  keywords: ['حقوق المقاييس', 'Public Domain', 'ترخيص أدوات التقييم', 'حقوق الترجمة العربية'],
});

export default function AssessmentMeasureRightsRegisterPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/assessment-measures/rights-register/#page`,
    url: `${SITE_URL}/assessment-measures/rights-register/`,
    name: 'سجل حقوق المقاييس وأدوات التقييم',
    inLanguage: 'ar',
    isPartOf: { '@id': `${SITE_URL}/assessment-measures/#page` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-measures/">المقاييس وأدوات التقييم</Link><span>/</span><span aria-current="page">سجل الحقوق</span></nav>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>شفافية حقوقية قابلة للتدقيق</span>
          <h1>سجل حقوق المقاييس</h1>
          <p>نعامل الحقوق كأربع مسائل مستقلة: الأداة الأصلية، وثيقة المصدر، النسخة أو الدراسة العربية، وحق إعادة نشر النص العربي. حقوق الأداة الأصلية لا تعمم على ترجمتها العربية، وعبارة «مجاني» وحدها لا تكفي لإعادة نشر نموذج كامل.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/assessment-measures/">المكتبة</Link>
            <Link className={styles.secondaryAction} href="/assessment-measures/rights-review/">{assessmentMeasuresRightsReview.length} أداة مهمة قيد مراجعة الحقوق</Link>
            <Link className={styles.secondaryAction} href="/assessment-measures/methodology/">منهجية التحقق</Link>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.callout}>
            <strong>قاعدة الفصل الحقوقي:</strong> Public Domain أو Open Reuse للأداة لا يعني أن ملف PDF أو صفحة الناشر أو الرسوم أو ترجمة طرف ثالث تحمل الترخيص نفسه. كما أن دراسة تحقق عربية تثبت وجود نسخة أو خصائص قياس، لكنها لا تمنح تلقائيًا إذن إعادة استضافة نص الترجمة.
          </div>
        </section>

        <section className={styles.section} aria-labelledby="register-title">
          <div className={styles.sectionHead}><div><h2 id="register-title">الإصدار الحالي: {assessmentMeasures.length} مقياسًا قابلًا للنشر المرجعي وفق سجل الحقوق</h2><p>تاريخ التحقق يخص سجل الحقوق في روافد، ولا يعني أن شروط صاحب الحق أو ناشر وثيقة بعينها لن تتغير مستقبلًا.</p></div></div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>المقياس</th><th>الأداة الأصلية</th><th>وثيقة المصدر</th><th>النسخة/الدليل العربي</th><th>إعادة نشر النص العربي</th><th>آخر تحقق</th><th>مصدر حقوق الأصل</th></tr></thead>
              <tbody>{assessmentMeasures.map((measure) => {
                const dimensions = getAssessmentMeasureRightsDimensions(measure);
                const authoritativeRightsSource = measure.sources.find((source) => source.role === 'rights');
                const rightsSourceUrl = dimensions.originalInstrument.sourceUrl || authoritativeRightsSource?.url;
                const rightsSourceLabel = dimensions.originalInstrument.sourceLabel || authoritativeRightsSource?.label || 'مصدر الحقوق الرسمي';
                return <tr key={measure.slug}>
                  <td><Link href={`/assessment-measures/${measure.slug}/`}><strong>{measure.nameAr}</strong><br /><span lang="en" dir="ltr">{measure.acronym}</span></Link></td>
                  <td>{rightsBadge(dimensions.originalInstrument.status)}<br /><small>{dimensions.originalInstrument.note}</small></td>
                  <td><strong>{dimensions.sourceDocument.label}</strong><br /><small>{dimensions.sourceDocument.note}</small></td>
                  <td><strong>{dimensions.arabicVersion.label}</strong><br /><small>{dimensions.arabicVersion.note}</small>{dimensions.arabicVersion.evidenceUrl ? <><br /><a href={dimensions.arabicVersion.evidenceUrl} target="_blank" rel="noreferrer">{dimensions.arabicVersion.evidenceLabel} ↗</a></> : null}</td>
                  <td><strong>{dimensions.arabicRepublication.label}</strong><br /><small>{dimensions.arabicRepublication.note}</small></td>
                  <td>{measure.rightsVerifiedOn}</td>
                  <td>{rightsSourceUrl ? <a href={rightsSourceUrl} target="_blank" rel="noreferrer">{rightsSourceLabel} ↗</a> : 'غير متاح'}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.callout}><strong>لماذا يوجد سجل آخر؟</strong> الأدوات المقيدة أو غير المحسومة لا تختفي من المرجع؛ نضعها في <Link href="/assessment-measures/rights-review/">قائمة مراجعة الحقوق</Link> ونشرح ما يمكن عرضه دون إعادة نشر المحتوى المحمي.</div>
        </section>
        <section className={styles.section}><div className={styles.callout}><strong>مبدأ النشر:</strong> إذا تعارض مصدران للحقوق، أو أصبحت شروط صاحب الأداة غير واضحة، ننتقل تلقائيًا إلى التفسير الأكثر تحفظًا ونوقف إعادة نشر النموذج إلى أن يحسم الوضع.</div></section>
      </main>
      <SiteFooter />
    </>
  );
}
