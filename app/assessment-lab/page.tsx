import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { assessmentCategories, assessmentMonitors, sourceInstruments } from '@/lib/assessment-lab/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from './assessment-lab.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'اختبر نفسك — أدوات متابعة ذاتية عربية موثوقة',
  description: 'قطاع اختبر نفسك في روافد: 60 أداة متابعة ذاتية عربية غير تشخيصية و10 صفحات موثقة لمقاييس خارجية، مع فصل واضح بين Core Outcome Sets وأدوات القياس والخصائص السيكومترية والتكييف العربي.',
  path: '/assessment-lab',
  index: true,
  follow: true,
  keywords: ['اختبر نفسك', 'اختبارات نفسية', 'فحص ذاتي', 'متابعة ذاتية', 'Core Outcome Set', 'COMET Initiative', 'أدوات قياس النتائج', 'الخصائص السيكومترية', 'التكييف العربي', 'الصحة النفسية', 'النوم', 'القلق', 'الضغط النفسي', 'الاحتراق النفسي', 'التسويف', 'الكمالية', 'الغضب', 'الاجترار', 'القلق الصحي', 'القلق الاجتماعي', 'قلق الأداء', 'حل المشكلات', 'طلب المساعدة', 'الحدود', 'الحمل الرقمي', 'وسائل التواصل', 'PHQ-9', 'GAD-7', 'WHO-5', 'AUDIT', 'PSQI', 'MBI', 'PROMIS', 'K10', 'PSS', 'Zarit'],
});

export default function AssessmentLabPage() {
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'اختبر نفسك', path: '/assessment-lab' }]);
  return <><SiteHeader/><main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}/>
    <section className={styles.hero}><div className={styles.shell}>
      <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">اختبر نفسك</span></nav>
      <span className={styles.eyebrow}>اختبر نفسك · Self-check & monitoring</span>
      <h1>لاحظ نمطك بوضوح — من دون تشخيص آلي أو حفظ بياناتك</h1>
      <p>هذه المكتبة لا تحاول إقناعك بأن بضع نقرات تستطيع تشخيصك. صُممت أدوات روافد لتساعدك على ملاحظة ما يحدث، متى يحدث، وما أثره على حياتك، ثم تحويل الانطباع العام إلى أمثلة وأسئلة أوضح. أما المقاييس المعروفة عالميًا فتبقى منفصلة حتى تكون النسخة العربية وحقوق الاستخدام وطريقة الحساب موثقة.</p>
      <div className={styles.facts}><span><strong>60</strong> أداة متابعة محلية</span><span><strong>10</strong> صفحات أدوات مصدرية وحقوق</span><span><strong>70</strong> مسارًا منشورًا</span><span><strong>0</strong> إجابات محفوظة</span></div>
    </div></section>

    <section className={`${styles.shell} ${styles.method}`} aria-labelledby="measurement-map-title">
      <div className={styles.sectionHeading}>
        <span className={styles.eyebrow}>خريطة القياس · WHAT → HOW → QUALITY → ARABIC</span>
        <h2 id="measurement-map-title">أربعة مستويات مختلفة لا ينبغي جمعها تحت كلمة «مقياس»</h2>
        <p>قبل اختيار أداة أو تفسير درجة، حدّد في أي مستوى تعمل. Core Outcome Set يحدد الحد الأدنى المتفق عليه من <strong>النتائج التي ينبغي قياسها</strong> في مجال محدد؛ أداة قياس النتائج تحدد <strong>كيف تُقاس نتيجة بعينها</strong>؛ الخصائص السيكومترية تختبر جودة أداء الأداة؛ أما التكييف العربي فيبحث ما إذا كانت النسخة العربية مفهومة ومكافئة وقابلة للتفسير في المجتمع المستهدف.</p>
      </div>
      <div className={styles.grid}>
        <Link className={styles.card} href="/core-outcome-sets/">
          <h3>1. Core Outcome Set — ماذا نقيس؟</h3>
          <p>مجموعة دنيا متفق عليها من النتائج المهمة لحالة أو مجال أو مجتمع محدد. هي قائمة «ماذا»، وليست استبيانًا أو اختبارًا أو طريقة حساب.</p>
          <span>دليل COMET ومجموعات النتائج الأساسية ←</span>
        </Link>
        <Link className={styles.card} href="/assessment-measures/">
          <h3>2. Outcome Measurement Instrument — كيف نقيس؟</h3>
          <p>استبيان، مقياس، اختبار أداء، جهاز أو إجراء قياس يُستخدم لقياس نتيجة أو بناء محدد. الشهرة وحدها لا تجعل الأداة مناسبة.</p>
          <span>استكشف مكتبة أدوات القياس ←</span>
        </Link>
        <Link className={styles.card} href="/assessment-measures/methodology/#measurement-properties">
          <h3>3. الخصائص السيكومترية — هل القياس صالح للغرض؟</h3>
          <p>نراجع صلاحية المحتوى والبنية، الثبات، خطأ القياس، صدق البناء، التكافؤ بين المجموعات والاستجابة للتغير بحسب نوع الأداة والسياق.</p>
          <span>اقرأ إطار COSMIN التطبيقي ←</span>
        </Link>
        <Link className={styles.card} href="/assessment-measures/methodology/#arabic-adaptation">
          <h3>4. التكييف والتحقق العربي — هل بقي المعنى نفسه؟</h3>
          <p>وجود ترجمة عربية لا يساوي تلقائيًا نسخة عربية متحققة. نفصل بين الترجمة، التكييف الثقافي، الاختبار اللغوي، التحقق السيكومتري والتكافؤ عبر اللغات.</p>
          <span>راجع مسار النسخة العربية ←</span>
        </Link>
      </div>
      <div className={styles.sourceLinks}>
        <a href="https://www.comet-initiative.org/About" target="_blank" rel="noreferrer">COMET Initiative: ما هو Core Outcome Set؟ ↗</a>
        <a href="https://www.cosmin.nl/finding-right-tool/developing-core-outcome-set/" target="_blank" rel="noreferrer">COSMIN/COMET: ماذا نقيس وكيف نقيس؟ ↗</a>
      </div>
    </section>

    <section className={`${styles.shell} ${styles.method}`} aria-labelledby="method-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>المنهج</span><h2 id="method-title">نبني مكتبة فحص ذاتي مسؤولة، لا مكتبة «نتائج سريعة»</h2><p>الفحص الذاتي قد يكون مفيدًا عندما يساعد الشخص على تنظيم الملاحظة وطلب المساعدة المناسبة، لكنه يصبح مضللًا عندما يقلّد التشخيص أو يضع عتبات ودرجات بلا أساس. لذلك يعتمد هذا القطاع فصلًا واضحًا بين أدوات روافد المحلية والمقاييس المنشورة ذات المصادر والحقوق الخاصة بها. أدوات المتابعة المحلية هنا ليست Core Outcome Sets ولا تُعرض على أنها أدوات قياس مقننة ما لم يثبت ذلك بصورة مستقلة.</p></div><div className={styles.methodGrid}>
      <article><h3>أسئلة مرتبطة بالمحور</h3><p>كل متابعة تستخدم أربعة محاور، ولكل محور أربعة بنود على الأقل. الدفعات الجديدة تستخدم بنك أسئلة مخصصًا للأداة نفسها بدل إعادة صياغة قالب عام على كل موضوع.</p></article>
      <article><h3>لا درجة إجمالية مختلقة</h3><p>الإنهاك والأمان والدعم ليست متغيرًا واحدًا. لذلك لا نحول المحاور المختلفة إلى نسبة واحدة تبدو دقيقة وهي ليست كذلك.</p></article>
      <article><h3>الخصوصية افتراضيًا</h3><p>لا يرسل محرك المتابعة الإجابات إلى الخادم، ولا يستخدم Local Storage أو Session Storage. تحديث الصفحة يمسح الإجابات.</p></article>
      <article><h3>المقياس المعروف يبقى مقياسًا معروفًا</h3><p>المقاييس الخارجية مثل PHQ-9 وGAD-7 وWHO-5 وAUDIT وPSQI وMBI وPROMIS وK10/K6 وPSS وZBI لا تُعاد تسميتها كأدوات روافد، ولا تُنسخ بنودها أو درجاتها ما لم تكن النسخة وحقوق الاستخدام والتطبيق التفاعلي مثبتة بوضوح.</p></article>
    </div></section>

    <section className={`${styles.shell} ${styles.directory}`} aria-labelledby="monitor-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>أدوات روافد للمتابعة</span><h2 id="monitor-title">اختر الموضوع الأقرب لما تريد ملاحظته</h2><p>هذه الأدوات ليست اختبارات تشخيصية ولا مقاييس نفسية مقننة. استخدمها للمقارنة مع نفسك عبر الوقت، ولتجهيز أمثلة محددة يمكن مناقشتها مع شخص داعم أو مختص.</p></div>{assessmentCategories.map((category) => <section className={styles.group} key={category}><h3>{category}</h3><div className={styles.grid}>{assessmentMonitors.filter((row) => row.category === category).map((row) => <Link className={styles.card} href={`/assessment-lab/${row.slug}`} key={row.slug}><h4>{row.title}</h4><p>{row.axes.join(' · ')}</p><span>ابدأ المتابعة ←</span></Link>)}</div></section>)}</section>

    <section className={`${styles.shell} ${styles.instruments}`} aria-labelledby="instrument-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>مقاييس وأدوات ذات مصدر خارجي</span><h2 id="instrument-title">10 صفحات تفصل الأداة الأصلية عن أي ترجمة أو إعادة استخدام</h2><p>تحتفظ هذه الصفحات بالمصدر والحالة الحقوقية والمنهجية. لن تعرض روافد بنودًا أو تفسيرًا رقميًا قبل التحقق من النسخة العربية المصرح بها وطريقة الحساب الرسمية وشروط النشر على الويب. وللبحث المنهجي في الأدوات المستخدمة عالميًا، استخدم المكتبة المستقلة؛ ولتحديد «ماذا ينبغي قياسه» قبل الأداة، ابدأ بدليل Core Outcome Sets.</p></div><div className={styles.grid}>{sourceInstruments.map((row) => <Link className={styles.card} href={`/assessment-lab/${row.slug}`} key={row.slug}><h3>{row.title}</h3><p>{row.period}</p><span>المصدر وحالة الاستعادة ←</span></Link>)}</div><div className={styles.sourceLinks}><Link href="/assessment-measures/">مكتبة أدوات قياس النتائج ←</Link><Link href="/core-outcome-sets/">دليل Core Outcome Sets ←</Link></div></section>

    <section className={`${styles.shell} ${styles.evidence}`} aria-labelledby="evidence-title"><span className={styles.eyebrow}>الإطار العلمي</span><h2 id="evidence-title">الفحص الذاتي جزء مساعد، وليس بديلًا عن الرعاية</h2><p>تؤكد منظمة الصحة العالمية في إرشاداتها الحديثة لعام 2026 أن تدخلات المساعدة الذاتية النفسية يمكن أن توسع الوصول إلى دعم قائم على الأدلة عندما تكون منظمة ومطبقة ضمن حدود واضحة، كما تؤكد أن الرعاية الذاتية تكمل النظام الصحي ولا تستبدله.</p><div className={styles.sourceLinks}><a href="https://www.who.int/publications/i/item/9789240120785" target="_blank" rel="noreferrer">WHO 2026: Psychological self-help interventions</a><a href="https://www.who.int/news-room/questions-and-answers/item/self-care-for-health-and-well-being" target="_blank" rel="noreferrer">WHO 2026: Self-care for health and well-being</a><a href="https://www.who.int/en/news-room/questions-and-answers/item/stress" target="_blank" rel="noreferrer">WHO 2026: Stress Q&A</a></div></section>

    <section className={`${styles.shell} ${styles.specialistCta}`}><div><strong>لا تريد نتيجة آلية بل تقييمًا حقيقيًا؟</strong><p>يمكنك استخدام دليل المختصين أو صفحة التحضير للتقييم لتنظيم الأعراض والأسئلة قبل الموعد.</p></div><div className={styles.ctaLinks}><Link href="/specialists">دليل المختصين</Link><Link href="/guided-assessment">التحضير للتقييم</Link></div></section>

    <section className={`${styles.shell} ${styles.reviewNote}`}><strong>تمت المراجعة من قبل فريق روافد</strong><p>تشمل المراجعة الفصل بين المتابعة الذاتية والتشخيص، والفصل بين Core Outcome Sets وأدوات قياس النتائج، وسلامة الخصوصية، ووضوح اللغة، وحفظ المصادر، وعدم اختلاق درجات أو صلاحية سيكومترية غير مثبتة.</p></section>
    <section className={`${styles.shell} ${styles.safety}`}><h2>حدود السلامة</h2><p>إذا كان هناك خطر فوري على النفس أو الآخرين، عنف، فقدان شديد للاتصال بالواقع، حالة طبية حادة أو تدهور سريع في الأداء، فلا تنتظر نتيجة أداة. اطلب مساعدة طارئة أو تقييمًا مهنيًا مناسبًا للموقف. هذه الأدوات لا تقدم تشخيصًا ولا قرار علاج.</p><Link href="/medical-review-policy">منهجية المراجعة العلمية</Link></section>
  </main><SiteFooter/></>;
}
