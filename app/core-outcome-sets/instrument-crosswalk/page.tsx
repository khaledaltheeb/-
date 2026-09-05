import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import { coreOutcomeRegistry } from '@/lib/core-outcome-sets/registry';
import { instrumentCrosswalk, instrumentCrosswalkStats } from '@/lib/core-outcome-sets/instrument-crosswalk';
import { measurementCoverageStats, unmappedCoreOutcomeMeasurementCoverage } from '@/lib/core-outcome-sets/measurement-coverage';
import styles from '@/components/assessment-measures.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'خريطة COS → أدوات القياس → الدليل العربي',
  description: 'Crosswalk تشغيلي يربط Core Outcome Sets بأدوات القياس الموصى بها، وحالة توفرها في روافد، والحقوق، والدليل العربي المطابق للإصدار والسياق.',
  path: '/core-outcome-sets/instrument-crosswalk/',
  index: true,
  follow: true,
  type: 'article',
  keywords: ['Core Outcome Set', 'COMS', 'أدوات القياس', 'التكييف العربي', 'التحقق السيكومتري', 'PHQ-9', 'GAD-7', 'WHODAS', 'C-SSRS', 'PROMIS', 'RCADS'],
  relatedTerms: ['measurement instrument crosswalk', 'Arabic validation', 'Arabic psychometrics', 'measurement rights', 'exact version matching'],
  searchIntents: ['ما أدوات قياس Core Outcome Set', 'هل يوجد PHQ-9 عربي متحقق', 'هل C-SSRS متاح بالعربية', 'ما الفرق بين الترجمة والتحقق العربي'],
});

const cosBySlug = new Map(coreOutcomeRegistry.map((item) => [item.slug, item]));

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/core-outcome-sets/instrument-crosswalk/#page`,
  url: `${SITE_URL}/core-outcome-sets/instrument-crosswalk/`,
  name: 'خريطة COS إلى أدوات القياس والدليل العربي',
  description: 'خريطة تشغيلية للفصل بين توصية الأداة، توفرها في روافد، حقوق الاستخدام، وحالة الدليل العربي.',
  inLanguage: 'ar',
  isPartOf: { '@id': `${SITE_URL}/core-outcome-sets/#page` },
  publisher: { '@id': `${SITE_URL}/#organization` },
};

const statusLabel = (status: (typeof instrumentCrosswalk)[number]['rawafidStatus']) => {
  if (status === 'operational-full') return 'متاح تشغيليًا';
  if (status === 'reference-rights') return 'مرجعي/حقوق';
  return 'فجوة مكتبة';
};

export default function InstrumentCrosswalkPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-lab/">Assessment Lab</Link><span>/</span><Link href="/core-outcome-sets/">Core Outcome Sets</Link><span>/</span><span aria-current="page">Instrument Crosswalk</span>
        </nav>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>COS → COMS / instrument → RIGHTS → ARABIC EVIDENCE</span>
          <h1>خريطة أدوات القياس: ماذا أوصى به COS، وماذا نملك فعليًا، وما الذي ثبت بالعربية؟</h1>
          <p>هذه الصفحة تمنع اختصار أربع حالات مختلفة في كلمة «متاح». قد تكون الأداة موصى بها ضمن Standard Set لكنها غير موجودة في روافد، أو موجودة مرجعيًا فقط بسبب الحقوق، أو متاحة تشغيليًا لكن الدليل العربي يخص بلدًا أو إصدارًا محددًا. لذلك نسجل كل طبقة على حدة.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/core-outcome-sets/">سجل Core Outcome Sets</Link>
            <Link className={styles.secondaryAction} href="/assessment-measures/">مكتبة أدوات القياس</Link>
            <Link className={styles.secondaryAction} href="/assessment-measures/rights-review/">سجل الحقوق المقيدة</Link>
            <Link className={styles.secondaryAction} href="/assessment-measures/methodology/#arabic-adaptation">منهجية التكييف العربي</Link>
          </div>
          <div className={styles.notice}><strong>قاعدة exact-version:</strong> دليل نسخة مختصرة أو إصدار من عائلة مقياس لا يُنقل تلقائيًا إلى إصدار آخر. مثال: دليل RCADS-25 العربي لا يثبت تلقائيًا النسخة الكاملة، ودليل GAD-7 لا يثبت GAD-2 كأداة مستقلة.</div>
        </section>

        <section className={styles.section} aria-labelledby="stats-title">
          <div className={styles.sectionHead}><div><h2 id="stats-title">حالة الربط الحالية</h2><p>الأرقام تصف السجل الحالي في روافد فقط، ولا تعني غياب الأداة عالميًا إذا كانت غير موجودة لدينا.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>{instrumentCrosswalkStats.total}</h3><p>أداة/عائلة أدوات مدققة في الـcrosswalk الأول</p></article>
            <article className={styles.methodCard}><h3>{instrumentCrosswalkStats.operationalFull}</h3><p>متاحة كنموذج تشغيلي كامل في مكتبة روافد</p></article>
            <article className={styles.methodCard}><h3>{instrumentCrosswalkStats.referenceRights}</h3><p>موجودة مرجعيًا لكن شروط المالك تمنع التعامل معها كنسخ حرة</p></article>
            <article className={styles.methodCard}><h3>{instrumentCrosswalkStats.notInLibrary}</h3><p>فجوات مكتبة تحتاج إضافة أو تدقيق حقوق/نسخة</p></article>
            <article className={styles.methodCard}><h3>{instrumentCrosswalkStats.arabicPsychometricContext}</h3><p>لها دليل سيكومتري عربي محدد السياق موثق في هذه الدفعة</p></article>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="coverage-title">
          <div className={styles.sectionHead}><div><h2 id="coverage-title">تغطية COS نفسها — هل لكل مجموعة instrument mapping؟</h2><p>هذا المؤشر يقيس اكتمال الربط داخل روافد، لا وجود الأدوات عالميًا. عدم وجود mapping هنا لا يعني أن COS لا يملك أدوات قياس أو أن الأدوات غير موجودة في المصادر الأصلية.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>{measurementCoverageStats.totalCos}</h3><p>إجمالي Core Outcome Sets في السجل التشغيلي</p></article>
            <article className={styles.methodCard}><h3>{measurementCoverageStats.mappedCos}</h3><p>COS لديها أداة واحدة على الأقل مرتبطة في الـcrosswalk</p></article>
            <article className={styles.methodCard}><h3>{measurementCoverageStats.mappingGaps}</h3><p>COS لها توصية/مسار قياس معروف لكن ربط الأدوات لم يكتمل بعد</p></article>
            <article className={styles.methodCard}><h3>{measurementCoverageStats.outcomeOnly}</h3><p>COS لا توجد لها توصية أداة مثبتة في سجل روافد حتى الآن؛ تبقى WHAT فقط</p></article>
            <article className={styles.methodCard}><h3>{measurementCoverageStats.unmappedCos}</h3><p>COS بلا أي instrument mapping حاليًا وتدخل قائمة التدقيق التالية</p></article>
          </div>
          <div className={styles.notice}><strong>قاعدة عدم الاستنتاج:</strong> «لا mapping في روافد» ≠ «لا توجد أداة». إذا كانت حالة القياس explicit أو linked فالمطلوب هو استخراج الأداة الدقيقة من المصدر وتدقيق إصدارها وحقوقها وعربيتها. وإذا كانت not-established فلا نخترع HOW لمجرد ملء الفراغ.</div>
          <div className={styles.grid}>
            {unmappedCoreOutcomeMeasurementCoverage.map((record) => (
              <article className={styles.card} key={record.slug}>
                <div className={styles.cardMeta}>
                  <span className={styles.badge}>{record.coverageLabel}</span>
                  <span className={styles.badge}>{record.measurementStatusLabel}</span>
                </div>
                <h3>{record.condition}</h3>
                <p>{record.healthArea}</p>
                <div className={styles.cardFoot}><span><strong>الإجراء التالي:</strong> {record.nextAction}</span></div>
                <div className={styles.sourceLinks}>
                  <Link href={`/core-outcome-sets/${record.slug}/`}>فتح COS ومصدره الكامل ←</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="crosswalk-title">
          <div className={styles.sectionHead}><div><h2 id="crosswalk-title">السجل أداةً بأداة</h2><p>اضغط على الأداة المتاحة داخليًا أو على COS المرتبط بها للوصول إلى السياق الكامل.</p></div></div>
          <div className={styles.grid}>
            {instrumentCrosswalk.map((item) => (
              <article className={styles.card} id={item.id} key={item.id}>
                <div className={styles.cardMeta}>
                  <span className={styles.badge}>{statusLabel(item.rawafidStatus)}</span>
                  <span className={styles.badge}>{item.arabicEvidenceLabel}</span>
                </div>
                <h3>{item.acronym}</h3>
                <p><strong>{item.instrument}</strong></p>
                <p>{item.rawafidStatusLabel}</p>
                <div className={styles.cardFoot}><span><strong>الحقوق:</strong> {item.rightsNote}</span></div>
                <div className={styles.cardFoot}><span><strong>العربية:</strong> {item.arabicEvidenceNote}</span></div>
                <div className={styles.cardFoot}><span><strong>المصدر:</strong> {item.evidenceCitation}</span></div>
                <div className={styles.sourceLinks}>
                  {item.internalPath ? <Link href={item.internalPath}>سجل الأداة في روافد ←</Link> : null}
                  {item.evidenceUrl ? <a href={item.evidenceUrl} target="_blank" rel="noreferrer">دليل العربية/الحقوق ↗</a> : null}
                </div>
                <div className={styles.sourceList}>
                  {item.linkedCosSlugs.map((slug) => {
                    const cos = cosBySlug.get(slug);
                    return cos ? <Link href={`/core-outcome-sets/${slug}/`} key={slug}>COS: {cos.condition} ←</Link> : null;
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="rules-title">
          <div className={styles.sectionHead}><div><h2 id="rules-title">كيف نقرر أن الأداة «جاهزة بالعربية»؟</h2><p>لا توجد شارة واحدة تختصر هذه السلسلة.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>1. تطابق الأداة والإصدار</h3><p>نثبت الاسم والإصدار والطول وطريقة التطبيق. دليل QOLIE-31 لا يُرحل تلقائيًا إلى QOLIE-10، وRCADS-25 لا يساوي النسخة الكاملة.</p></article>
            <article className={styles.methodCard}><h3>2. حق الاستخدام والترجمة</h3><p>وجود PDF أو ترجمة على الويب لا يثبت حق إعادة نشرها أو برمجتها. بعض الأنظمة مثل PROMIS وWHODAS وEQ-5D لها مسارات إذن/ترخيص محددة.</p></article>
            <article className={styles.methodCard}><h3>3. التكييف اللغوي والثقافي</h3><p>نثبت كيفية الترجمة والمراجعة والاختبار المعرفي والفئة المستهدفة والبلد/اللهجة عند صلته.</p></article>
            <article className={styles.methodCard}><h3>4. الخصائص السيكومترية</h3><p>نقرأ الثبات والبنية والصدق والاستجابة/العتبات بحسب الغرض. نتيجة جيدة في عينة واحدة لا تتحول إلى صلاحية شاملة لكل الدول العربية.</p></article>
            <article className={styles.methodCard}><h3>5. التكافؤ عند المقارنة</h3><p>للدراسات متعددة اللغات أو البلدان نحتاج دليل cross-cultural validity / measurement invariance مناسب، لا مجرد ترجمتين تبدوان متشابهتين.</p></article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.callout}><strong>مهم:</strong> هذا Crosswalk سجل تحرير وتدقيق، وليس توصية سريرية باستخدام أداة بعينها. الأدوات ذات مخاطر السلامة مثل C-SSRS تحتاج تدريبًا وسياق استخدام وإجراءات استجابة مناسبة، ولا تُحوّل إلى «اختبار ذاتي» لمجرد وجود ترجمة.</div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
