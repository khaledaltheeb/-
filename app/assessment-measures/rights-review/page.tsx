import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import {
  assessmentMeasuresRightsReview,
  assessmentMeasureRightsReviewStatusLabels,
} from '@/lib/assessment-measures-rights-review';
import styles from '@/components/assessment-measures.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'مقاييس مهمة قيد مراجعة الحقوق',
  description: 'سجل روافد للأدوات العالمية المهمة التي نعرضها كمرجع فقط لأن إعادة نشر النموذج أو الترجمة تحتاج إذنًا أو لأن حالة الحقوق لا تسمح باعتبارها Public Domain.',
  path: '/assessment-measures/rights-review/',
  index: true,
  follow: true,
  type: 'website',
  keywords: ['حقوق المقاييس النفسية', 'ترخيص الاختبارات', 'MMSE', 'HADS', 'EQ-5D', 'MoCA', 'C-SSRS'],
});

export default function AssessmentMeasuresRightsReviewPage() {
  const counts = new Map<string, number>();
  for (const item of assessmentMeasuresRightsReview) counts.set(item.status, (counts.get(item.status) ?? 0) + 1);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/assessment-measures/rights-review/#page`,
    url: `${SITE_URL}/assessment-measures/rights-review/`,
    name: 'مقاييس مهمة قيد مراجعة الحقوق',
    description: 'سجل مرجعي للمقاييس المقيدة أو غير المحسومة حقوقيًا التي لا تعيد روافد نشر محتواها الكامل.',
    inLanguage: 'ar',
    isPartOf: { '@id': `${SITE_URL}/assessment-measures/#page` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: assessmentMeasuresRightsReview.length,
      itemListElement: assessmentMeasuresRightsReview.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${item.nameAr} (${item.acronym})`,
        url: `${SITE_URL}/assessment-measures/rights-review/#${item.slug}`,
        sameAs: item.rightsSource,
      })),
    },
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-measures/">المقاييس وأدوات التقييم</Link><span>/</span><span aria-current="page">مراجعة الحقوق</span></nav>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>مرجع نعم · نسخ غير مصرح لا</span>
          <h1>مقاييس مهمة قيد مراجعة الحقوق</h1>
          <p>وجود مقياس هنا يعني أنه مهم علميًا أو واسع الاستخدام، لكن روافد لا يملك أساسًا كافيًا لإعادة نشر النموذج أو البنود أو الترجمة أو مفتاح التسجيل. لذلك نوثق الأداة وحالة الحقوق ونوجه إلى المصدر بدل نسخها.</p>
          <div className={styles.stats} aria-label="ملخص حالات الحقوق">
            <div className={styles.stat}><strong>{assessmentMeasuresRightsReview.length}</strong><span>أداة مرجعية مقيدة أو غير محسومة</span></div>
            <div className={styles.stat}><strong>{counts.get('granted-to-cdisc') ?? 0}</strong><span>Granted لـCDISC فقط</span></div>
            <div className={styles.stat}><strong>{counts.get('denied') ?? 0}</strong><span>Denied في سجل CDISC</span></div>
            <div className={styles.stat}><strong>{(counts.get('author-permission-required') ?? 0) + (counts.get('no-response-received') ?? 0)}</strong><span>إذن مؤلف/لا رد</span></div>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/assessment-measures/rights-register/">سجل الأدوات المسموح بها</Link>
            <Link className={styles.secondaryAction} href="/assessment-measures/methodology/">منهجية الحقوق</Link>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="rights-review-explain">
          <div className={styles.sectionHead}><div><h2 id="rights-review-explain">كيف نقرأ حالات CDISC؟</h2><p>CDISC يوضح أن Granted يسمح له هو بتطوير ملحق QRS، لكن المستخدم أو الراعي ما يزال يحتاج إذن صاحب الحقوق لاستخدام الأداة. أما Public Domain فتعني أن الإذن غير مطلوب.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>Granted</h3><p>ليس تصريحًا لروافد. نعرض مرجعًا فقط إلى أن تسمح شروط صاحب الحق بإعادة الاستخدام الذي نريده.</p></article>
            <article className={styles.methodCard}><h3>Author Permission Required</h3><p>لا ننشر المواد؛ المستخدم يعود إلى صاحب الحق للحصول على الأداة أو الإذن.</p></article>
            <article className={styles.methodCard}><h3>Denied</h3><p>لا ننشئ نسخة محلية أو نعيد بناء النموذج من وصفه. نكتفي بمعلومات ببليوغرافية ومقارنة منهجية.</p></article>
            <article className={styles.methodCard}><h3>No Response Received</h3><p>غياب الرد ليس إذنًا. تبقى الأداة مرجعًا فقط إلى أن يظهر أساس حقوقي أو تصريح واضح.</p></article>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="review-table-title">
          <div className={styles.sectionHead}><div><h2 id="review-table-title">سجل الانتظار الحقوقي</h2><p>نراجع هذه الحالات عند تغير شروط المالك أو ظهور تصريح رسمي جديد.</p></div></div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>الأداة</th><th>المجال</th><th>حالة الحقوق</th><th>لماذا لا ننشر النموذج؟</th><th>ما الذي نعرضه بأمان؟</th><th>المصدر</th></tr></thead>
              <tbody>{assessmentMeasuresRightsReview.map((item) => <tr id={item.slug} key={item.slug}>
                <td><strong>{item.nameAr}</strong><br /><span lang="en" dir="ltr">{item.nameEn} · {item.acronym}</span></td>
                <td>{item.domain}</td>
                <td><strong>{assessmentMeasureRightsReviewStatusLabels[item.status]}</strong><br /><small>تحقق: {item.rightsVerifiedOn}</small></td>
                <td>{item.whyReferenceOnly}</td>
                <td>{item.safeUseOnRawafid}</td>
                <td><a href={item.rightsSource} target="_blank" rel="noreferrer">مصدر حالة الحقوق ↗</a></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}><div className={styles.callout}><strong>قاعدة روافد:</strong> لا نحول «متاح للقراءة»، «مجاني»، «له PDF على الإنترنت»، أو «Granted لـCDISC» إلى تصريح لإعادة النشر. عندما يكون الوضع غير واضح نستخدم التفسير الأكثر تحفظًا.</div></section>
      </main>
      <SiteFooter />
    </>
  );
}
