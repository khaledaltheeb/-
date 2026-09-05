import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/assessment-measures.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'منهجية أدوات القياس — الخصائص السيكومترية والحقوق والتكييف العربي',
  description: 'منهجية روافد لفصل اختيار أداة القياس عن خصائصها السيكومترية وحقوقها وترجمتها وتكييفها والتحقق من النسخة العربية، استنادًا إلى COSMIN ومصادر الحقوق الأصلية.',
  path: '/assessment-measures/methodology/',
  index: true,
  follow: true,
  type: 'article',
  keywords: ['خصائص سيكومترية', 'measurement properties', 'COSMIN', 'cross-cultural validity', 'measurement invariance', 'تكييف المقاييس العربية', 'حقوق المقاييس', 'ترجمة المقاييس', 'RMD', 'ePROVIDE', 'CDISC QRS'],
});

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/assessment-measures/methodology/#page`,
  url: `${SITE_URL}/assessment-measures/methodology/`,
  name: 'منهجية أدوات القياس — الخصائص السيكومترية والحقوق والتكييف العربي',
  inLanguage: 'ar',
  isPartOf: { '@id': `${SITE_URL}/assessment-measures/#page` },
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export default function AssessmentMeasuresMethodologyPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-measures/">أدوات القياس</Link><span>/</span><span aria-current="page">المنهجية</span></nav>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>QUALITY + RIGHTS + ARABIC · منهجية قابلة للتدقيق</span>
          <h1>لا نخلط جودة القياس مع الترجمة أو الحقوق أو التشخيص</h1>
          <p>كل أداة لها أربعة ملفات مستقلة على الأقل: <strong>ما الذي تقيسه وكيف تُستخدم</strong>، <strong>جودة خصائص القياس</strong>، <strong>حقوق الاستخدام وإعادة النشر</strong>، و<strong>حالة النسخة العربية</strong>. وقد يكون أحد هذه الملفات قويًا بينما الآخر غير مكتمل، لذلك لا نختصرها في شارة واحدة مثل «معتمد».</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/assessment-measures/">العودة إلى مكتبة الأدوات</Link>
            <Link className={styles.secondaryAction} href="/core-outcome-sets/">ما الفرق عن Core Outcome Sets؟</Link>
            <a className={styles.secondaryAction} href="#measurement-properties">الخصائص السيكومترية</a>
            <a className={styles.secondaryAction} href="#arabic-adaptation">التكييف العربي</a>
          </div>
          <div className={styles.notice}><strong>قاعدة حاكمة:</strong> الترجمة أو التكييف اللغوي ليست بحد ذاتها «خاصية سيكومترية». بعد إعداد النسخة العربية نحتاج إلى أدلة ملائمة على أداء القياس في المجتمع المقصود، وقد نحتاج إلى اختبار cross-cultural validity / measurement invariance عندما يكون الهدف مقارنة اللغات أو المجموعات.</div>
        </section>

        <section className={styles.section} aria-labelledby="verification-title">
          <div className={styles.sectionHead}><div><h2 id="verification-title">مسار التحقق قبل النشر</h2><p>كل خطوة تغلق نوعًا مختلفًا من المخاطر العلمية أو القانونية.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>1. تثبيت هوية الأداة</h3><p>نحدد الاسم الكامل، الاختصار، الإصدار، عدد البنود/المهام، صاحب الأداة أو الجهة الحافظة لها والمصدر الأصلي. لا نخلط بين النسخة الأصلية والنسخ القصيرة أو المعدلة.</p></article>
            <article className={styles.methodCard}><h3>2. تثبيت outcome / construct</h3><p>نحدد بدقة النتيجة أو البناء الذي يُفترض أن تقيسه الأداة. إذا بدأ الاستخدام من COS، نربط الأداة بالـcore outcome نفسه ولا نستبدل اسم النتيجة باسم المقياس.</p></article>
            <article className={styles.methodCard}><h3>3. جمع أدلة القياس</h3><p>نراجع المصادر الأصلية والمراجعات المنهجية وقواعد مثل RMD عند ملاءمتها. قاعدة تجميع الأدلة ليست مالكًا للحقوق ولا تمنح الأداة اعتمادًا تلقائيًا.</p></article>
            <article className={styles.methodCard}><h3>4. فحص حقوق الأصل</h3><p>نبحث عن نص صريح من صاحب الحقوق أو سجل موثوق مثل Mapi Research Trust/ePROVIDE أو CDISC QRS أو المصدر الرسمي. عبارة Free/No cost وحدها لا تكفي لإعادة النشر.</p></article>
            <article className={styles.methodCard}><h3>5. فحص العربية كملف مستقل</h3><p>قد يكون الأصل Public Domain بينما ترجمة عربية محددة لها مترجمون وناشر وشروط أخرى. نثبت الإذن والإصدار والمنهج والمجتمع قبل عرض النسخة.</p></article>
            <article className={styles.methodCard}><h3>6. بناء صفحة استخدام مسؤولة</h3><p>ننشر الغرض، السكان، البروتوكول، التسجيل، خصائص القياس، interpretability، feasibility، الحقوق، حالة العربية، المصادر وتاريخ المراجعة. لا نبتكر Cut-offs أو ادعاء اعتماد غير مثبت.</p></article>
          </div>
        </section>

        <section className={styles.section} id="measurement-properties" aria-labelledby="measurement-properties-title">
          <div className={styles.sectionHead}><div><h2 id="measurement-properties-title">خصائص القياس وفق إطار COSMIN</h2><p>نستخدم المصطلحات بحسب نوع الأداة والسؤال؛ لا يكفي أن نقول إن المقياس «صادق وثابت» بصورة عامة.</p></div></div>
          <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>المجال</th><th>الخاصية</th><th>السؤال العملي</th></tr></thead><tbody>
            <tr><td rowSpan={3}><strong>Reliability</strong></td><td>Internal consistency</td><td>هل ترتبط بنود المقياس بصورة متسقة عندما يكون من المنطقي أن تمثل بنية مترابطة؟ وتُفسر بعد وجود دليل مناسب على البنية.</td></tr>
            <tr><td>Reliability</td><td>إلى أي درجة يمكن التمييز بين الأشخاص رغم خطأ القياس، مع ثبات الحالة في ظروف إعادة القياس المناسبة؟</td></tr>
            <tr><td>Measurement error</td><td>ما مقدار الخطأ غير المنسوب إلى تغير حقيقي في البنية المقاسة؟</td></tr>
            <tr><td rowSpan={5}><strong>Validity</strong></td><td>Content validity</td><td>هل محتوى الأداة ملائم وشامل ومفهوم بالنسبة للبناء والمجتمع وسياق الاستخدام؟ وهو أولوية مبكرة وحاسمة في تقييم أداة مرشحة.</td></tr>
            <tr><td>Structural validity</td><td>هل البنية الداخلية للدرجات تعكس أبعاد البناء المقاس على نحو مناسب؟</td></tr>
            <tr><td>Hypotheses testing for construct validity</td><td>هل ترتبط الدرجات أو تختلف بين المجموعات كما تتنبأ الفرضيات المسبقة المبنية على البناء النظري؟</td></tr>
            <tr><td>Cross-cultural validity / measurement invariance</td><td>هل أداء البنود/البنية مكافئ بما يكفي عبر مجموعات مختلفة، مثل اللغات أو الثقافات، بعد مراعاة الفروق الحقيقية في البناء؟</td></tr>
            <tr><td>Criterion validity</td><td>هل تتوافق الأداة مع معيار مرجعي مناسب عندما يوجد بالفعل معيار معقول يمكن اعتباره مرجعًا؟</td></tr>
            <tr><td><strong>Responsiveness</strong></td><td>Responsiveness</td><td>هل تستطيع الأداة اكتشاف التغير بمرور الوقت في البناء المراد قياسه عندما يكون الاستخدام تقييميًا؟</td></tr>
          </tbody></table></div>
          <div className={styles.callout}><strong>ليسا خصائص قياس:</strong> COSMIN يفصل <strong>Interpretability</strong> — القدرة على إعطاء معنى للدرجة أو تغيرها — و<strong>Feasibility</strong> — سهولة التطبيق من حيث الزمن والتكلفة والطول والإدارة — عن measurement properties، مع بقائهما عنصرين مهمين في اختيار الأداة.</div>
        </section>

        <section className={styles.section} aria-labelledby="selection-title">
          <div className={styles.sectionHead}><div><h2 id="selection-title">عند اختيار أداة لنتيجة ضمن COS</h2><p>لا نعطي الخصائص كلها الوزن نفسه أو نبدأ بالأرقام الأسهل استخراجًا.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>1. Content validity أولًا</h3><p>إذا لم يكن واضحًا أن الأداة تقيس النتيجة المقصودة بمحتوى ملائم وشامل ومفهوم، فلن تنقذها معاملات ثبات مرتفعة.</p></article>
            <article className={styles.methodCard}><h3>2. Internal structure</h3><p>نراجع structural validity ثم internal consistency عندما يكون ذلك ملائمًا، أو ملاءمة IRT/Rasch للأدوات المبنية بهذه النماذج.</p></article>
            <article className={styles.methodCard}><h3>3. الخصائص المتبقية حسب الغرض</h3><p>Reliability، measurement error، construct validity، cross-cultural validity، criterion validity وresponsiveness بحسب نوع الأداة والسياق.</p></article>
            <article className={styles.methodCard}><h3>4. Feasibility + interpretability</h3><p>بعد جودة القياس، نحتاج أداة قابلة للتطبيق ويمكن تفسير درجاتها وتغيراتها ضمن سياق الاستخدام، مع حقوق قابلة للتنفيذ.</p></article>
          </div>
        </section>

        <section className={styles.section} id="arabic-adaptation" aria-labelledby="arabic-adaptation-title">
          <div className={styles.sectionHead}><div><h2 id="arabic-adaptation-title">مسار الترجمة والتكييف والتحقق العربي</h2><p>«نسخة عربية موجودة» ليست حالة واحدة؛ نعرض أين وصلت النسخة في السلسلة بدل منحها وصفًا مبهمًا.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>1. الحقوق والإذن</h3><p>نثبت حق إنشاء الترجمة أو استخدام نسخة عربية موجودة وحق عرض البنود أو توزيعها. ترخيص الأصل لا ينتقل تلقائيًا إلى كل ترجمة.</p></article>
            <article className={styles.methodCard}><h3>2. الترجمة والتكييف الثقافي</h3><p>نتبع متطلبات مالك الأداة أو بروتوكولًا موثقًا للحفاظ على المعنى والمفهوم وملاءمة الأمثلة والسياق، لا ترجمة كلمة بكلمة فقط.</p></article>
            <article className={styles.methodCard}><h3>3. الفهم والاختبار قبل الاعتماد</h3><p>عند ملاءمته للأداة، نتحقق من فهم الفئة المستهدفة للصياغة والتعليمات وخيارات الإجابة عبر pretesting/cognitive interviewing أو منهج مناسب.</p></article>
            <article className={styles.methodCard}><h3>4. تثبيت النسخة</h3><p>نسجل اسم النسخة، اللغة/الصيغة، البلد أو المجتمع، تاريخها، صاحبها، المرجع، الإصدار، وطريقة الإدارة لمنع خلط نسخ عربية مختلفة.</p></article>
            <article className={styles.methodCard}><h3>5. التحقق السيكومتري</h3><p>نقيّم خصائص القياس المطلوبة في المجتمع والسياق المستهدفين بدل افتراض أن خصائص الأصل انتقلت تلقائيًا إلى الترجمة.</p></article>
            <article className={styles.methodCard}><h3>6. التكافؤ عبر اللغات/المجموعات</h3><p>عندما نريد مقارنة مجموعات لغوية أو ثقافية، نبحث عن cross-cultural validity / measurement invariance بتصميم وتحليل ملائمين، مثل MGCFA أو DIF عندما يناسب نموذج الأداة.</p></article>
          </div>
          <div className={styles.callout}><strong>حالة العربية في روافد ستبقى متعددة الأبعاد:</strong> حالة الحقوق ≠ حالة الترجمة ≠ التكييف الثقافي ≠ التحقق السيكومتري ≠ التكافؤ بين اللغات. لا تُدمج هذه العناصر في كلمة «مُعتمد».</div>
        </section>

        <section className={styles.section} aria-labelledby="rights-title">
          <div className={styles.sectionHead}><div><h2 id="rights-title">كيف نقرأ حالات الحقوق؟</h2></div></div>
          <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>الحالة</th><th>ما الذي تعنيه؟</th><th>ما الذي لا تعنيه؟</th></tr></thead><tbody>
            <tr><td><strong>Public Domain</strong></td><td>وجدنا أساسًا موثقًا بأن الأصل في المجال العام ويمكن إعادة استخدامه.</td><td>لا يعني تلقائيًا أن كل ترجمة أو ملف PDF أو مادة تدريبية عنه في المجال العام.</td></tr>
            <tr><td><strong>إعادة استخدام مجانية موثقة</strong></td><td>المالك أو المصدر الرسمي يسمح بالاستخدام/إعادة الإنتاج دون رسوم وفق الشروط المنشورة.</td><td>لا يعني تجاهل شروط النسبة أو حدود التعديل أو متطلبات النسخة.</td></tr>
            <tr><td><strong>مجاني للاستخدام</strong></td><td>قد يستطيع المختص أو الباحث تطبيق الأداة بلا رسوم.</td><td>ليس تصريحًا تلقائيًا لنا بنسخ النموذج كاملًا على موقع عام.</td></tr>
            <tr><td><strong>إذن مطلوب</strong></td><td>نكتفي بالشرح والرابط والمصادر حتى نحصل على إذن مناسب.</td><td>لا نعيد صياغة البنود بهدف الالتفاف على حقوق صاحبها.</td></tr>
          </tbody></table></div>
        </section>

        <section className={styles.section} aria-labelledby="dont-title">
          <div className={styles.sectionHead}><div><h2 id="dont-title">ماذا لا تفعل روافد؟</h2></div></div>
          <div className={styles.panel}><ul>
            <li>لا تخلط Core Outcome Set باسم أداة القياس؛ الأول يحدد ماذا نقيس، والثاني كيف نقيس.</li>
            <li>لا تصف جميع المقاييس بأنها «معتمدة عالميًا»؛ نوضح مصدر الدليل وحدوده لكل أداة.</li>
            <li>لا تنسخ مقياسًا لأنه ظهر في قاعدة RMD أو لأن خانة التكلفة تقول Free.</li>
            <li>لا تولد ترجمة آلية ثم تسميها النسخة العربية الرسمية أو المحققة.</li>
            <li>لا تحول أداة فحص إلى تشخيص ولا تنشئ درجات شدة أو Cut-offs من دون دليل.</li>
            <li>لا تعمم خصائص قياس أو MCID/MDC من مجتمع مرضي أو لغة إلى مجتمع آخر دون سند.</li>
            <li>لا تعتبر وجود الصفحة أو مراجعة فريق روافد اعتمادًا من COMET أو COSMIN أو Shirley Ryan AbilityLab أو RMD أو صاحب الأداة.</li>
          </ul></div>
        </section>

        <section className={styles.section} aria-labelledby="sources-title">
          <div className={styles.panel}><h2 id="sources-title">المصادر المرجعية المستخدمة في التحقق</h2><div className={styles.sourceList}>
            <a href="https://www.cosmin.nl/" target="_blank" rel="noreferrer">COSMIN — أدوات ومنهجية خصائص القياس ↗</a>
            <a href="https://www.cosmin.nl/finding-right-tool/developing-core-outcome-set/" target="_blank" rel="noreferrer">COSMIN/COMET — اختيار أدوات القياس لنتائج COS ↗</a>
            <a href="https://www.sralab.org/rehabilitation-measures" target="_blank" rel="noreferrer">Rehabilitation Measures Database (RMD) ↗</a>
            <a href="https://eprovide.mapi-trust.org/advanced-search" target="_blank" rel="noreferrer">Mapi Research Trust / ePROVIDE ↗</a>
            <a href="https://www.cdisc.org/standards/foundational/qrs" target="_blank" rel="noreferrer">CDISC Questionnaires, Ratings and Scales (QRS) ↗</a>
          </div></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
