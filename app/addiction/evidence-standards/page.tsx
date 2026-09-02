import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getAddictionAtlas } from '@/lib/addiction-atlas';
import { ADDICTION_ATLAS_AXIS_EVIDENCE_COUNT, getAtlasRiskEvidence } from '@/lib/addiction-atlas-evidence';
import { ADF_EDITORIAL_STANDARD_AR, ADF_PROVENANCE_NOTE_AR, ADF_RESOURCES, countAdfDrugFactReferences, getAdfDrugFactReference } from '@/lib/adf-addiction';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/addiction-atlas.module.css';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'معايير أدلة الإدمان واللغة | مصفوفة تغطية أطلس المواد',
    description: 'مصفوفة تدقيق لأطلس روافد توضح قوة الدليل، التتبع محورًا بمحور، التفاعلات، المقارنات، المصادر المباشرة، والإحالات الموازية إلى ADF Drug Facts مع معيار لغة غير وصمية.',
    path: '/addiction/evidence-standards/', index: true, follow: true, type: 'website',
    keywords: ['أدلة الإدمان', 'مصادر المخدرات', 'لغة غير وصمية', 'معلومات المخدرات', 'ADF Drug Facts', 'Power of Words'],
    relatedTerms: ['drug information evidence standards', 'person-first language substance use', 'drug facts evidence matrix'],
  });
}

const GENERAL_EVIDENCE_PRIORITY = { A: 4, B: 3, C: 2, U: 1 } as const;

export default async function AddictionEvidenceStandardsPage() {
  const atlas = await getAddictionAtlas();
  const adfCoverage = countAdfDrugFactReferences(atlas.substances);
  const reviewedEvidence = atlas.substances.filter((item) => item.evidence_grade !== 'U').length;
  const interactionSlugs = new Set(atlas.interactions.flatMap((item) => [item.a, item.b]));
  const comparisonCounts = new Map<string, number>();
  for (const comparison of atlas.comparisons.filter((item) => item.indexable)) {
    comparisonCounts.set(comparison.a, (comparisonCounts.get(comparison.a) ?? 0) + 1);
    comparisonCounts.set(comparison.b, (comparisonCounts.get(comparison.b) ?? 0) + 1);
  }
  const interactionCounts = new Map<string, number>();
  for (const interaction of atlas.interactions) {
    interactionCounts.set(interaction.a, (interactionCounts.get(interaction.a) ?? 0) + 1);
    interactionCounts.set(interaction.b, (interactionCounts.get(interaction.b) ?? 0) + 1);
  }
  const evidenceGapRows = atlas.substances
    .filter((item) => !getAtlasRiskEvidence(item.slug))
    .map((item) => {
      const adf = getAdfDrugFactReference(item);
      const interactionCount = interactionCounts.get(item.slug) ?? 0;
      const comparisonCount = comparisonCounts.get(item.slug) ?? 0;
      const sourceCount = item.source_urls.length;
      const operationalPriority = GENERAL_EVIDENCE_PRIORITY[item.evidence_grade]
        + Math.min(interactionCount, 3) * 2
        + Math.min(comparisonCount, 3)
        + (adf ? 1 : 0)
        + (sourceCount <= 1 ? 1 : 0);
      const reasons = [
        `الدليل العام ${item.evidence_grade}`,
        interactionCount ? `${interactionCount} تفاعل مراجع` : 'لا تفاعلات مراجعة بعد',
        comparisonCount ? `${comparisonCount} مقارنة تحريرية` : 'لا مقارنات تحريرية بعد',
        `${sourceCount} مصدر مباشر`,
        adf ? 'له مرجع ADF موازٍ' : 'لا مطابقة ADF مباشرة',
      ];
      return { item, adf, interactionCount, comparisonCount, sourceCount, operationalPriority, reasons };
    })
    .sort((a, b) => b.operationalPriority - a.operationalPriority || a.item.display_name_ar.localeCompare(b.item.display_name_ar, 'ar'));
  const schemas = [
    breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'معايير الأدلة واللغة', path: '/addiction/evidence-standards/' }]),
    { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${SITE_URL}/addiction/evidence-standards/#collection`, url: `${SITE_URL}/addiction/evidence-standards/`, name: 'معايير أدلة الإدمان واللغة', description: 'مصفوفة شفافة لتغطية أطلس الإدمان ومصادره ومراجعاته.', inLanguage: 'ar', dateModified: atlas.updatedOn, publisher: { '@id': `${SITE_URL}/#organization` } },
  ];

  return <><SiteHeader /><main className={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><span aria-current="page">معايير الأدلة واللغة</span></nav>
    <header className={styles.hero}>
      <span className={styles.eyebrow}>حوكمة المصدر · اكتمال السجل · لغة غير وصمية · تتبع قابل للتدقيق</span>
      <h1>معايير أدلة الإدمان واللغة</h1>
      <p>هذه الصفحة لا تضيف «درجة اعتماد» جديدة، بل تكشف حالة التغطية لكل مادة: ما إذا كانت تمتلك تتبعًا محورًا بمحور، وتفاعلات أو مقارنات مراجعة، وعدد مصادرها المباشرة، وما إذا كانت لها إحالة خارجية موازية في ADF Drug Facts.</p>
      <div className={styles.actions}><Link href="/addiction/substances/">الأطلس</Link><Link href="/addiction/compare/">المقارنات</Link><Link href="/addiction/interactions/">التفاعلات</Link><Link href="/addiction/methodology/">المنهجية</Link></div>
    </header>

    <section className={styles.statsSummary} aria-label="ملخص اكتمال الأدلة">
      <article><strong>{atlas.substances.length}</strong><span>مادة/عائلة في الأطلس</span></article>
      <article><strong>{reviewedEvidence}</strong><span>سجلًا بدليل عام مصنف</span></article>
      <article><strong>{ADDICTION_ATLAS_AXIS_EVIDENCE_COUNT}</strong><span>سجلًا بتتبع محورًا بمحور</span></article>
      <article><strong>{evidenceGapRows.length}</strong><span>فجوة تتبع محوري متبقية</span></article>
      <article><strong>{interactionSlugs.size}</strong><span>مادة مرتبطة بتفاعل مراجع</span></article>
      <article><strong>{adfCoverage}</strong><span>إحالة مباشرة إلى ADF Drug Facts</span></article>
    </section>

    <section className={styles.section} aria-labelledby="evidence-gap-registry-title">
      <h2 id="evidence-gap-registry-title">سجل فجوات التتبع المحوري</h2>
      <p>هذه القائمة تُولد مباشرة من بيانات الأطلس: أي مادة لا تملك بعد سجلًا في طبقة الدليل محورًا بمحور تظهر هنا تلقائيًا. ترتيب «الأولوية التشغيلية» يساعد فريق التحرير على اختيار ما يراجع أولًا اعتمادًا على حضور المادة داخل المقارنات والتفاعلات، قوة سجلها العام، عمق المصادر، ووجود مرجع ADF موازٍ.</p>
      <aside className={styles.notice}><strong>ليست درجة خطورة سريرية</strong><p>الأولوية التشغيلية ليست مقياسًا لخطورة المادة، ولا احتمال ضرر، ولا ترتيبًا من «الأخطر إلى الأقل». هي أداة حوكمة للبحث فقط، ولا يجوز عرضها في صفحات المواد كدرجة صحية.</p></aside>
      <div className={styles.tableWrap} tabIndex={0} aria-label="سجل المواد التي لم يكتمل لها التتبع محورًا بمحور">
        <table className={styles.table}>
          <thead><tr><th>المادة</th><th>أولوية تشغيلية</th><th>الدليل العام</th><th>تفاعلات</th><th>مقارنات</th><th>مصادر مباشرة</th><th>ADF</th><th>سبب الإدراج</th></tr></thead>
          <tbody>{evidenceGapRows.map(({ item, adf, interactionCount, comparisonCount, sourceCount, operationalPriority, reasons }) => <tr key={item.slug}>
            <td><Link className={styles.name} href={`/addiction/substances/${item.slug}/`}>{item.display_name_ar}<small dir="ltr">{item.display_name_en}</small></Link></td>
            <td><strong>{operationalPriority}</strong></td>
            <td><span className={styles.grade}>{item.evidence_grade}</span></td>
            <td>{interactionCount}</td>
            <td>{comparisonCount}</td>
            <td>{sourceCount}</td>
            <td>{adf ? <a href={adf.url} target="_blank" rel="noopener noreferrer">مرجع موازٍ</a> : '—'}</td>
            <td>{reasons.join(' · ')}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p>يزول السجل من هذه القائمة تلقائيًا بمجرد إضافة مراجعة صحيحة لجميع محاور الخطر الثمانية إلى طبقة الأدلة. وجود مادة هنا لا يخفض تلقائيًا قوة مصادرها العامة ولا يعني أن معلوماتها الحالية خاطئة.</p>
    </section>

    <section className={styles.section} aria-labelledby="adf-standard-title">
      <div className={styles.card}>
        <span className={styles.eyebrow}>Alcohol and Drug Foundation — مرجع خارجي</span>
        <h2 id="adf-standard-title">كيف استفدنا من Power of Words وDrug Facts؟</h2>
        <p>استخدمنا Power of Words كمرجع لضبط لغة القطاع، وDrug Facts كمرجع موازٍ يساعد على فحص بنية ملفات المواد وأسئلة التأثيرات والانسحاب والطوارئ والتداخلات. لم ننقل جداول ADF أو نصوصها أو رسومها.</p>
        <ul>{ADF_EDITORIAL_STANDARD_AR.map((item) => <li key={item}>{item}</li>)}</ul>
        <p>{ADF_PROVENANCE_NOTE_AR}</p>
        <div className={styles.actions}><a href={ADF_RESOURCES.powerOfWords} target="_blank" rel="noopener noreferrer">Power of Words</a><a href={ADF_RESOURCES.drugFacts} target="_blank" rel="noopener noreferrer">Drug Facts</a><a href={ADF_RESOURCES.drugWheel} target="_blank" rel="noopener noreferrer">Drug Wheel</a><a href={ADF_RESOURCES.copyright} target="_blank" rel="noopener noreferrer">سياسة حقوق النشر لدى ADF</a></div>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="coverage-matrix-title">
      <h2 id="coverage-matrix-title">مصفوفة اكتمال الأطلس</h2>
      <p>وجود خانة «لا» لا يعني أن المادة آمنة أو أن سجلها عديم القيمة؛ بل يحدد ببساطة أين لم تكتمل طبقة مراجعة معينة بعد. هذه المصفوفة تجعل الفجوات قابلة للقياس بدل إخفائها.</p>
      <div className={styles.tableWrap} tabIndex={0} aria-label="مصفوفة اكتمال أدلة أطلس الإدمان">
        <table className={styles.table}>
          <thead><tr><th>المادة</th><th>الفئة</th><th>الدليل العام</th><th>تتبع محوري</th><th>تفاعلات مراجعة</th><th>مقارنات تحريرية</th><th>مصادر مباشرة</th><th>ADF Drug Facts</th></tr></thead>
          <tbody>{atlas.substances.map((item) => {
            const adf = getAdfDrugFactReference(item);
            return <tr key={item.slug}>
              <td><Link className={styles.name} href={`/addiction/substances/${item.slug}/`}>{item.display_name_ar}<small dir="ltr">{item.display_name_en}</small></Link></td>
              <td>{item.class_ar}</td>
              <td><span className={styles.grade}>{item.evidence_grade}</span></td>
              <td>{getAtlasRiskEvidence(item.slug) ? 'نعم' : 'لم يكتمل بعد'}</td>
              <td>{interactionCounts.get(item.slug) ?? 0}</td>
              <td>{comparisonCounts.get(item.slug) ?? 0}</td>
              <td>{item.source_urls.length}</td>
              <td>{adf ? <a href={adf.url} target="_blank" rel="noopener noreferrer">{adf.title}</a> : 'لا توجد مطابقة مباشرة'}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </section>

    <aside className={styles.notice}><strong>حدود الاستخدام</strong><p>الإحالة إلى ADF لا تعني أن ADF راجعت أو اعتمدت درجات المخاطر أو المقارنات أو المحتوى العربي في روافد. كما أن عدم وجود صفحة ADF مباشرة لمادة ما لا يغيّر قوة المصادر الأخرى المسجلة لها.</p></aside>
    <p className={styles.updateLine}>آخر مراجعة لنسخة بيانات الأطلس: <time dateTime={atlas.updatedOn}>{atlas.updatedOn}</time>.</p>
  </main><SiteFooter /></>;
}
