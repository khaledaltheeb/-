import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import { coreOutcomeRegistry } from '@/lib/core-outcome-sets/registry';
import styles from '@/components/assessment-measures.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Core Outcome Sets — ما النتائج التي ينبغي قياسها؟',
  description: 'دليل وسجل عربي يوضح الفرق بين Core Outcome Set (COS) وCore Outcome Measurement Set (COMS) وأدوات قياس النتائج والخصائص السيكومترية وتكييف COS للسياق المحلي والتكييف العربي لأداة القياس، مع سجلات تطبيقية موثقة من COMET.',
  path: '/core-outcome-sets/',
  index: true,
  follow: true,
  type: 'article',
  keywords: ['Core Outcome Set', 'COS', 'Core Outcome Measurement Set', 'COMS', 'COMET Initiative', 'COSMIN', 'النتائج الأساسية', 'أدوات قياس النتائج', 'الخصائص السيكومترية', 'تكييف Core Outcome Set', 'التكييف العربي'],
  relatedTerms: ['what to measure', 'how to measure', 'outcome domains', 'measurement instruments', 'core outcomes', 'adopt or adapt core outcome set'],
  searchIntents: ['ما هو Core Outcome Set', 'الفرق بين COS وأداة القياس', 'كيف أختار مقياسا لنتيجة أساسية', 'ما هو COMS', 'هل يمكن استخدام COS أجنبي في مجتمع عربي'],
});

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/core-outcome-sets/#page`,
  url: `${SITE_URL}/core-outcome-sets/`,
  name: 'Core Outcome Sets — ما النتائج التي ينبغي قياسها؟',
  description: 'دليل تطبيقي وسجل عربي للفصل بين النتائج الأساسية وأدوات القياس وجودتها وملاءمة COS للسياق المحلي والتكييف العربي للأداة.',
  inLanguage: 'ar',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  publisher: { '@id': `${SITE_URL}/#organization` },
  hasPart: coreOutcomeRegistry.map((item) => ({ '@id': `${SITE_URL}/core-outcome-sets/${item.slug}/#page`, name: item.titleAr })),
};

const layers = [
  {
    title: 'COS — Core Outcome Set',
    question: 'ماذا ينبغي قياسه؟',
    meaning: 'مجموعة دنيا متفق عليها من النتائج التي ينبغي قياسها والإبلاغ عنها في مجال صحي محدد. لا تمنع قياس نتائج إضافية.',
    not: 'ليست استبيانًا، وليست قائمة بنود، وليست خوارزمية درجات، ولا تمنح أي أداة قياس صلاحية تلقائية.',
  },
  {
    title: 'COMS — Core Outcome Measurement Set',
    question: 'بأي أدوات نقيس النتائج الأساسية؟',
    meaning: 'توصيات بأدوات قياس محددة لقياس النتائج الداخلة في COS عندما ينجز المشروع مرحلة اختيار أدوات القياس أيضًا.',
    not: 'وجود COS وحده لا يعني أن COMS موجود. يجب التحقق من سجل المشروع ومنشوراته لمعرفة ما إذا حُددت أدوات بعينها.',
  },
  {
    title: 'Outcome Measurement Instrument',
    question: 'كيف نقيس نتيجة محددة؟',
    meaning: 'أداة تحول البناء أو النتيجة إلى بيانات قابلة للقياس، مثل استبيان أو اختبار أداء أو قياس سريري أو جهاز.',
    not: 'شيوع الأداة أو وجودها في دراسة لا يثبت وحده أنها الأفضل، أو صالحة لكل مجتمع، أو مسموح إعادة نشرها.',
  },
  {
    title: 'Measurement Properties',
    question: 'هل أداء الأداة جيد لهذا الغرض؟',
    meaning: 'أدلة عن الصلاحية والثبات وخطأ القياس والاستجابة وغيرها، ويجب تفسيرها بالنسبة للمجتمع والسياق وطريقة التطبيق.',
    not: 'لا يجوز نقل تقدير الصلاحية أو MDC/MCID أو الثبات من مجتمع مختلف وكأنه خاصية ثابتة لا تتغير بالسياق.',
  },
  {
    title: 'Arabic Adaptation & Validation',
    question: 'هل النسخة العربية مفهومة ومكافئة وصالحة؟',
    meaning: 'مسار منفصل يشمل الحقوق، والترجمة والتكييف الثقافي، واختبار الفهم، ثم التحقق السيكومتري والتكافؤ بين اللغات/المجموعات عند الحاجة.',
    not: 'وجود ترجمة عربية لا يساوي تلقائيًا نسخة عربية متحققة، ولا يثبت حق نشر النص كاملًا على الويب.',
  },
];

export default function CoreOutcomeSetsPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-lab/">Assessment Lab</Link><span>/</span><span aria-current="page">Core Outcome Sets</span>
        </nav>

        <section className={styles.hero} aria-labelledby="cos-title">
          <span className={styles.eyebrow}>COMET → WHAT TO MEASURE · COSMIN → HOW TO MEASURE</span>
          <h1 id="cos-title">Core Outcome Sets: حدّد «ماذا نقيس» قبل أن تختار «كيف نقيس»</h1>
          <p>الـCore Outcome Set (COS) ليس مقياسًا نفسيًا أو استبيانًا. هو مجموعة دنيا متفق عليها من النتائج التي ينبغي قياسها والإبلاغ عنها في مجال صحي محدد. بعد تثبيت النتائج الأساسية تبدأ خطوة منفصلة: اختيار أدوات القياس المناسبة لكل نتيجة، ثم فحص جودة القياس والحقوق والنسخة العربية.</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="https://www.comet-initiative.org/Studies" target="_blank" rel="noreferrer">ابحث في قاعدة COMET ↗</a>
            <Link className={styles.secondaryAction} href="#registry">السجل التطبيقي في روافد</Link>
            <Link className={styles.secondaryAction} href="/assessment-measures/">مكتبة أدوات القياس</Link>
            <Link className={styles.secondaryAction} href="/assessment-measures/methodology/">منهجية الجودة والتكييف العربي</Link>
            <Link className={styles.secondaryAction} href="/assessment-lab/">العودة إلى Assessment Lab</Link>
          </div>
          <div className={styles.notice}><strong>قاعدة الفصل:</strong> COS يحدد <strong>WHAT</strong>، وأداة القياس تحدد <strong>HOW</strong>. بعض مشاريع COS تضيف مرحلة اختيار أدوات محددة؛ عندها نتعامل معها كـCOMS أو كتوصيات قياس موثقة، لا نفترضها من وجود COS وحده.</div>
        </section>

        <section className={styles.section} id="registry" aria-labelledby="registry-title">
          <div className={styles.sectionHead}><div><span className={styles.eyebrow}>Operational registry · سجل تشغيلي</span><h2 id="registry-title">Core Outcome Sets موثقة ومفصولة عن أدوات القياس</h2><p>هذه ليست قائمة أسماء فقط. كل سجل يثبت النطاق والنتائج الأساسية وحالة توصيات القياس وحالة المراجعة العربية. نبدأ بالمجالات الأعلى صلة بقطاعات روافد، ونبقي أي فجوة على حالها بدل ملئها باستنتاج غير موثق.</p></div></div>
          <div className={styles.grid}>
            {coreOutcomeRegistry.map((item) => (
              <Link className={styles.card} href={`/core-outcome-sets/${item.slug}/`} key={item.slug}>
                <div className={styles.cardMeta}><span className={styles.badge}>{item.healthArea}</span><span className={styles.badge}>{item.stageLabel}</span></div>
                <h3>{item.titleAr}</h3>
                <p>{item.condition}</p>
                <div className={styles.cardFoot}><span>{item.coreOutcomes.length} نتائج/مجالات مسجلة</span><span>{item.measurementStatusLabel}</span></div>
              </Link>
            ))}
          </div>
          <div className={styles.callout}><strong>حالة العربية في هذه الدفعة:</strong> لا تحمل أي بطاقة شارة «متحقق عربيًا» ما لم توجد مراجعة منفصلة للحقوق والتكييف والخصائص السيكومترية. السجل يوضح هذا صراحة داخل كل صفحة.</div>
        </section>

        <section className={styles.section} aria-labelledby="layers-title">
          <div className={styles.sectionHead}><div><h2 id="layers-title">خمسة مستويات يجب أن تبقى منفصلة</h2><p>الفصل بينها يمنع أكثر أخطاء عرض المقاييس شيوعًا ويجعل حالة كل توصية قابلة للتدقيق.</p></div></div>
          <div className={styles.grid}>
            {layers.map((layer) => <article className={styles.card} key={layer.title}>
              <div className={styles.cardMeta}><span className={styles.badge}>{layer.question}</span></div>
              <h3>{layer.title}</h3>
              <p>{layer.meaning}</p>
              <div className={styles.cardFoot}><span><strong>لا يعني:</strong> {layer.not}</span></div>
            </article>)}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="scope-title">
          <div className={styles.sectionHead}><div><h2 id="scope-title">قبل تبني أي COS: طابق النطاق أولًا</h2><p>COMET تنبه إلى أن ملاءمة COS تُقرأ من نطاقه؛ التطابق في اسم المرض وحده غير كافٍ.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>1. الحالة أو المجال الصحي</h3><p>هل COS للحالة نفسها، أم لفئة أوسع أو أضيق؟ مثال: السرطان عمومًا لا يساوي نوعًا محددًا أو مرحلة محددة.</p></article>
            <article className={styles.methodCard}><h3>2. السكان المستهدفون</h3><p>العمر، الجنس عند صلته، شدة الحالة، المرحلة، التشخيصات المصاحبة وأي خصائص تحدد من صُمم له COS.</p></article>
            <article className={styles.methodCard}><h3>3. التدخلات</h3><p>هل المجموعة صالحة لكل التدخلات أم لنوع محدد مثل الجراحة أو العلاج الدوائي أو التأهيل؟ لا نعمم خارج نطاق التطوير بلا تبرير.</p></article>
            <article className={styles.methodCard}><h3>4. سياق الاستخدام</h3><p>نثبت هل التوصية للبحوث السريرية أو الرعاية الروتينية أو التدقيق أو أكثر من سياق، لأن مجموعة مناسبة للبحث قد لا تطابق الرعاية اليومية بالكامل.</p></article>
          </div>
          <div className={styles.callout}><strong>قرار روافد:</strong> لا نضع شارة «COS مناسب» لمجرد تطابق اسم الحالة. نسجل الحالة/المجال، السكان، التدخل، والسياق، ثم نوضح درجة التطابق وأي اختلاف قبل ربطه بمحتوى الموقع.</div>
        </section>

        <section className={styles.section} id="cos-context-adaptation" aria-labelledby="cos-context-title">
          <div className={styles.sectionHead}><div><h2 id="cos-context-title">تبنّي أو تكييف COS للسياق العربي ≠ تكييف أداة القياس إلى العربية</h2><p>هذان سؤالان مختلفان منهجيًا. الأول يسأل هل النتائج الأساسية نفسها ملائمة للسياق المحلي؛ والثاني يسأل هل الأداة التي ستقيس إحدى تلك النتائج صالحة باللغة العربية وللمجتمع المستهدف.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}>
              <h3>A. ملاءمة COS للسياق المحلي</h3>
              <p>إذا طُوّر COS في بلد أو ثقافة أو مستوى موارد مختلف، نراجع تمثيل المرضى ومقدمي الرعاية والممارسين وصناع القرار، وأولوياتهم، وعبء المرض المحلي، وقدرة النظام على جمع النتائج، وتوفر وسائل القياس. قد يكون القرار تبني COS كما هو، أو تكييفه بمنهج شفاف، أو إضافة نتائج محلية مهمة مع إبقاء ما هو «core» وما هو «إضافي» واضحًا.</p>
            </article>
            <article className={styles.methodCard}>
              <h3>B. تكييف أداة القياس إلى العربية</h3>
              <p>بعد تثبيت outcome المراد قياسه، نراجع أداة القياس نفسها: الحقوق، الترجمة والتكييف الثقافي، فهم البنود والتعليمات، إصدار النسخة، خصائص القياس في المجتمع المستهدف، والتكافؤ عبر اللغات أو المجموعات عندما يكون الهدف المقارنة.</p>
            </article>
            <article className={styles.methodCard}>
              <h3>ما الذي يبرر التبني؟</h3>
              <p>نقرأ المنشور الكامل ونفحص جودة تطوير COS ومعايير COS-STAD ونطاقه. عندما يكون COS عالي الجودة وملائمًا للنطاق، تكون نتائجه الأساسية نقطة مرجعية قوية، وأي استبعاد لنتيجة يحتاج سببًا واضحًا وموثقًا بدل الحذف الصامت.</p>
            </article>
            <article className={styles.methodCard}>
              <h3>ما الذي قد يبرر التكييف؟</h3>
              <p>اختلاف جوهري في الأولويات أو الموارد أو قابلية جمع outcome أو أصحاب المصلحة أو سياق الرعاية قد يستدعي تقييمًا محليًا منظمًا. مثال كينيا في حديثي الولادة اختبر قابلية تبني أو تكييف COS مطور في سياق مرتفع الموارد عبر أصحاب مصلحة محليين وإمكان جمع البيانات.</p>
            </article>
          </div>
          <div className={styles.callout}><strong>قاعدة حاسمة:</strong> ترجمة أو تلخيص COS بالعربية لا يثبت ملاءمته الثقافية للسياق العربي، كما لا يثبت صلاحية أي أداة قياس عربية. ملاءمة <strong>مجموعة النتائج</strong> وملاءمة <strong>أداة القياس</strong> مساران مستقلان يجب توثيق كل منهما.</div>
          <div className={styles.sourceLinks}>
            <a href="https://doi.org/10.1371/journal.pmed.1002447" target="_blank" rel="noreferrer">COS-STAD — الحد الأدنى لمعايير تطوير COS ↗</a>
            <a href="https://doi.org/10.1186/s13063-026-09834-w" target="_blank" rel="noreferrer">Karumbi et al. 2026 — adopt or adapt a neonatal COS in Kenya ↗</a>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="workflow-title">
          <div className={styles.sectionHead}><div><h2 id="workflow-title">مسار عملي من COS إلى أداة عربية قابلة للاستخدام</h2><p>هذا هو المسار الذي سيحكم إضافة COS وأدواته إلى روافد بدل القفز مباشرة إلى اسم مقياس مشهور.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>1. صياغة سؤال القياس</h3><p>نحدد الحالة، السكان، التدخل/السياق والغرض من القياس قبل البحث.</p></article>
            <article className={styles.methodCard}><h3>2. البحث في COMET</h3><p>نبحث عن COS منشور أو جارٍ تطويره، ونراجع السجل والمنشور الأصلي بدل الاعتماد على اسم النتيجة فقط.</p></article>
            <article className={styles.methodCard}><h3>3. تقييم التطابق والمنهج والسياق</h3><p>نقارن النطاق، ثم نراجع جودة التطوير ومعايير COS-STAD، ونحدد هل يمكن تبني COS مباشرة أم يحتاج تقييم ملاءمة/تكييف للسياق المحلي.</p></article>
            <article className={styles.methodCard}><h3>4. استخراج النتائج الأساسية</h3><p>نسجل كل outcome/domain وتعريفه كما ورد، مع المصدر والإصدار والتاريخ. لا نحوله إلى أداة قياس.</p></article>
            <article className={styles.methodCard}><h3>5. فحص وجود COMS</h3><p>نحدد إن كان المشروع أو منشور لاحق أوصى بأداة قياس بعينها لكل نتيجة. إذا لم يفعل، نعرض COS دون اختلاق توصية قياس.</p></article>
            <article className={styles.methodCard}><h3>6. تقييم أدوات القياس</h3><p>عند الحاجة نبحث عن الأدوات المرشحة ونقيم خصائص القياس والجدوى والسياق وفق منهج COSMIN والمصادر الأصلية.</p></article>
            <article className={styles.methodCard}><h3>7. تثبيت الحقوق والعربية</h3><p>نثبت حق استخدام الأصل وحق الترجمة منفصلين، ثم نتحقق من التكييف الثقافي والدليل السيكومتري في المجتمع العربي المستهدف.</p></article>
            <article className={styles.methodCard}><h3>8. النشر مع حالة ثقة واضحة</h3><p>نعرض: COS، نطاقه، ملاءمته للسياق، النتيجة، أداة القياس إن وُجدت، جودة الأدلة، الحقوق، وحالة العربية دون دمج هذه الطبقات في شارة واحدة.</p></article>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="matrix-title">
          <div className={styles.sectionHead}><div><h2 id="matrix-title">مصفوفة القرار السريعة</h2><p>ما الذي تستطيع كل طبقة الإجابة عنه، وما الذي لا تستطيع إثباته؟</p></div></div>
          <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>الطبقة</th><th>السؤال الذي تجيب عنه</th><th>الدليل المطلوب</th><th>لا تثبت تلقائيًا</th></tr></thead><tbody>
            <tr><td><strong>COS</strong></td><td>ما النتائج الدنيا التي ينبغي قياسها؟</td><td>سجل/منشور تطوير COS ونطاقه</td><td>أداة محددة، خصائصها، حقوقها أو صلاحية عربية</td></tr>
            <tr><td><strong>Context adoption/adaptation</strong></td><td>هل يمكن نقل COS نفسه إلى المجتمع والسياق المستهدفين؟</td><td>النطاق + جودة التطوير + أصحاب المصلحة + الأولويات + الموارد وقابلية القياس المحلية</td><td>صلاحية أداة عربية أو تكافؤها السيكومتري</td></tr>
            <tr><td><strong>COMS / recommendation</strong></td><td>ما الأدوات الموصى بها للنتائج الأساسية؟</td><td>توصية صريحة من مشروع COS/COMS أو دراسة اختيار أدوات</td><td>حق إعادة النشر أو صلاحية كل ترجمة عربية</td></tr>
            <tr><td><strong>Measurement instrument</strong></td><td>كيف نقيس outcome/construct محددًا؟</td><td>المصدر الأصلي والبروتوكول والإصدار</td><td>أنه أفضل أداة لكل مجتمع أو غرض</td></tr>
            <tr><td><strong>Measurement properties</strong></td><td>ما جودة القياس في مجتمع وسياق محددين؟</td><td>دراسات صلاحية/ثبات/استجابة وغيرها</td><td>قابلية التعميم على مجتمع مختلف</td></tr>
            <tr><td><strong>Arabic instrument adaptation</strong></td><td>هل النسخة العربية مناسبة ومكافئة وقابلة للتفسير؟</td><td>حقوق + تكييف لغوي/ثقافي + تحقق سيكومتري مناسب</td><td>ملاءمة COS نفسه للسياق المحلي أو اعتماد عالمي</td></tr>
          </tbody></table></div>
        </section>

        <section className={styles.section} aria-labelledby="arabic-title">
          <div className={styles.sectionHead}><div><h2 id="arabic-title">لماذا تحتاج أداة القياس العربية مسارًا مستقلًا؟</h2><p>اللغة جزء من الأداة والسياق وليست مجرد استبدال كلمات، وهذا المسار يأتي بعد فصل ملاءمة COS نفسه للسياق.</p></div></div>
          <div className={styles.panel}>
            <p>عند استخدام أداة ضمن مجتمع عربي، نسجل بدقة اللغة/الصيغة المستخدمة، البلد أو المجتمع، العمر والسياق السريري وطريقة الإدارة. النسخة العربية قد تكون مترجمة فقط، أو مكيفة ثقافيًا، أو مدروسة سيكومتريًا، أو مختبرة للتكافؤ بين المجموعات/اللغات؛ وهذه حالات مختلفة.</p>
            <ul>
              <li><strong>الحقوق أولًا:</strong> هل يحق إنشاء ترجمة أو نشر نسخة عربية؟</li>
              <li><strong>الترجمة والتكييف:</strong> هل حُفظ معنى البنود وملاءمتها الثقافية؟</li>
              <li><strong>الفهم/الاختبار المعرفي:</strong> هل يفهم المستخدم المستهدف النص كما قُصد؟</li>
              <li><strong>التحقق السيكومتري:</strong> هل أداء النسخة مدعوم في المجتمع والسياق المستهدفين؟</li>
              <li><strong>التكافؤ:</strong> إذا كان الهدف مقارنة لغات أو بلدان، هل توجد أدلة cross-cultural validity / measurement invariance ملائمة؟</li>
            </ul>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="sources-title">
          <div className={styles.panel}><h2 id="sources-title">المصادر والمنهجية</h2><p>هذا الدليل يلخص ويطبق المنهجيات المنشورة ولا يمثل اعتمادًا من COMET أو COSMIN. أي COS أو COMS يُنسب إلى مطوريه ومصدره الأصلي عند إضافته إلى روافد.</p><div className={styles.sourceList}>
            <a href="https://www.comet-initiative.org/About" target="_blank" rel="noreferrer">COMET Initiative — تعريف Core Outcome Sets ↗</a>
            <a href="https://www.comet-initiative.org/Studies" target="_blank" rel="noreferrer">COMET Database — البحث ومطابقة نطاق COS ↗</a>
            <a href="https://comet-initiative.org/Resources" target="_blank" rel="noreferrer">COMET Resources — COS-STAD / COS-STAP / COS-STAR / Handbook ↗</a>
            <a href="https://doi.org/10.1371/journal.pgph.0002574" target="_blank" rel="noreferrer">Karumbi et al. — اعتبارات استخدام COS في البلدان منخفضة ومتوسطة الدخل ↗</a>
            <a href="https://doi.org/10.1186/s13063-026-09834-w" target="_blank" rel="noreferrer">Karumbi et al. 2026 — التبني أو التكييف في كينيا ↗</a>
            <a href="https://www.cosmin.nl/finding-right-tool/developing-core-outcome-set/" target="_blank" rel="noreferrer">COSMIN/COMET — اختيار أدوات قياس النتائج الداخلة في COS ↗</a>
            <a href="https://www.cosmin.nl/" target="_blank" rel="noreferrer">COSMIN — منهجية خصائص أدوات القياس ↗</a>
          </div></div>
        </section>

        <section className={styles.section}>
          <div className={styles.callout}><strong>مهم:</strong> إدراج COS أو أداة أو مصدر في روافد لا يعني أن COMET أو COSMIN أو مطوري الأداة قد راجعوا روافد أو اعتمدوها. أي تعاون أو مراجعة خارجية سيُذكر فقط إذا أصبح موثقًا صراحة.</div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
