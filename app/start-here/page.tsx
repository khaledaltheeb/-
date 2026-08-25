import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from './start-here.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'ابدأ هنا: خريطة استخدام منصة روافد',
  description: 'خريطة عملية لاختيار المسار المناسب داخل روافد: فهم حالة، دعم الأسرة، التربية الدامجة، الأدوات غير التشخيصية، قراءة الدليل والاستعداد للموعد.',
  path: '/start-here',
  index: true,
  follow: true,
  keywords: ['ابدأ هنا روافد', 'الصحة النفسية', 'الاحتياجات الخاصة', 'التربية الدامجة', 'الاستعداد للمختص', 'فهم الأدلة الصحية'],
});

const audienceCards = [
  { id: 'person', title: 'أبحث عن فهم أو دعم لنفسي', body: 'ابدأ بتحديد السؤال أو التغير الذي تريد فهمه، ثم افصل بين التثقيف العام وبين التشخيص الفردي. استخدم المحتوى لترتيب الملاحظات والأسئلة، لا لإصدار حكم نهائي على نفسك.', links: [['المعرفة والموسوعة','/sectors/knowledge'],['الصحة النفسية','/sectors/mental-health'],['اختبر نفسك','/assessment-lab']] },
  { id: 'family', title: 'أنا من الأسرة أو مقدم رعاية', body: 'حوّل الأوصاف العامة إلى ملاحظات محددة: متى يحدث الأمر، في أي سياق، ما أثره، وما الذي يساعد. حافظ على كرامة الشخص واستقلاله، واطلب دعمًا مهنيًا عندما تتجاوز الحاجة قدرة الأسرة وحدها.', links: [['الطفل والأسرة والمدرسة','/sectors/child-family-education'],['الاحتياجات الخاصة والتربية الدامجة','/sectors/special-needs-inclusion'],['أدلة الرعاية','/care-guides']] },
  { id: 'teacher', title: 'أنا معلم أو مرشد مدرسي', body: 'ابدأ بالحاجز في المهمة أو البيئة بدل تفسير الصعوبة كصفة في الطالب. جرّب تكييفًا واضحًا، راقب أثره، وسجّل ملاحظات موضوعية يمكن مناقشتها مع الأسرة والفريق المختص.', links: [['التربية الدامجة','/sectors/special-needs-inclusion'],['الطفل والأسرة والمدرسة','/sectors/child-family-education'],['مختبر القدرات','/cognitive-lab']] },
  { id: 'student', title: 'أنا طالب أو متعلم', body: 'سمِّ الصعوبة بطريقة قابلة للشرح: تركيز، نوم، قلق، فهم تعليمات، تنظيم وقت أو عبء دراسي. الصعوبة الدراسية ليست حكمًا على القيمة أو الذكاء، وطلب التيسير أو الدعم جزء من حل المشكلة.', links: [['الطفل والأسرة والمدرسة','/sectors/child-family-education'],['مختبر القدرات','/cognitive-lab'],['البحث في روافد','/search']] },
  { id: 'professional', title: 'أنا مختص أو متدرب', body: 'استخدم روافد كطبقة تثقيف وإحالة ومراجعة مصادر، مع فحص نوع المصدر وتاريخ المراجعة وحدود الصفحة. المحتوى العام لا يحل محل حكمك المهني أو أدواتك المقننة أو متطلبات الترخيص المحلية.', links: [['المعرفة والموسوعة','/sectors/knowledge'],['المتدربون والمتطوعون','/sectors/trainees-volunteers'],['منهجية المراجعة العلمية','/medical-review-policy']] },
] as const;

const pathways = [
  { title: 'أريد فهم حالة أو مصطلح', body: 'ابدأ بالتعريف والفروق والأثر الوظيفي والسياق قبل القفز إلى قائمة العلامات. وجود عرض واحد لا يثبت حالة، وتشابه تجربتين لا يعني أنهما التشخيص نفسه.', links: [['الموسوعة','/encyclopedia'],['المقارنات','/comparisons'],['قطاع المعرفة','/sectors/knowledge']] },
  { title: 'أحتاج محتوى لذوي الاحتياجات الخاصة', body: 'ابدأ بالحاجة الفعلية: التواصل، التعلم، السمع، الحواس، النوم، الاستقلال، المدرسة أو الوصول إلى الخدمات. لا تفترض أن الأشخاص الذين يشتركون في التشخيص يحتاجون الخطة نفسها.', links: [['مركز الاحتياجات الخاصة','/sectors/special-needs-inclusion'],['القدرات','/capabilities'],['أدلة الرعاية','/care-guides']] },
  { title: 'أريد خطوة عملية اليوم', body: 'اختر مشكلة واحدة قابلة للملاحظة، حدّد خط أساس بسيطًا، جرّب خطوة واحدة قابلة للتعديل، ثم راجع أثرها. لا تجعل الخطة اختبارًا للطاعة؛ الهدف تحسين الأمان والمشاركة والاستقلال والتواصل.', links: [['أدلة الرعاية','/care-guides'],['الأدلة المبنية على الدليل','/evidence-guides'],['الأسئلة الاسترشادية','/guided-assessment']] },
  { title: 'أفكر في استخدام أداة أو اختبار', body: 'اقرأ الغرض والفئة العمرية وطريقة التفسير قبل البدء. الأداة التعليمية أو التحريّة لا تتحول إلى تشخيص لمجرد أنها تعطي نتيجة، والتمرين المعرفي لا يصبح اختبارًا سريريًا معياريًا دون دليل تقنين وصلاحية مناسب.', links: [['اختبر نفسك','/assessment-lab'],['مختبر القدرات','/cognitive-lab'],['منهجية المراجعة','/medical-review-policy']] },
  { title: 'أريد قراءة دراسة أو التحقق من ادعاء', body: 'ابدأ بسؤال البحث وتصميم الدراسة، ثم افحص المشاركين والقياس والتحيز وحجم الأثر وعدم اليقين. عدد المراجع وحده لا يكفي؛ المهم مدى صلة المصدر بالادعاء وقوته وحداثته.', links: [['الأدلة المبنية على الدليل','/evidence-guides'],['منهجية المراجعة العلمية','/medical-review-policy'],['البحث','/search']] },
  { title: 'أريد الاستعداد لموعد مع مختص', body: 'اكتب سبب الزيارة في جملة، متى بدأ التغير، أمثلة محددة على أثره، قائمة الأدوية والمكملات والحالات الصحية، وأهم ثلاثة أسئلة تريد الإجابة عنها. هذه المعلومات تجعل وقت الموعد أكثر فائدة.', links: [['الأسئلة الاسترشادية','/guided-assessment'],['دليل المختصين','/specialists'],['المراكز','/centers']] },
] as const;

const references = [
  { title: 'NIMH — Tips for Talking With a Health Care Provider About Your Mental Health', url: 'https://www.nimh.nih.gov/health/publications/tips-for-talking-with-your-health-care-provider', note: 'التحضير للأسئلة، قائمة الأدوية، ووصف بداية الأعراض وشدتها وتكرارها قبل الموعد.' },
  { title: 'NIMH — Children and Mental Health: Is This Just a Stage?', url: 'https://www.nimh.nih.gov/health/publications/children-and-mental-health', note: 'التقييم الشامل للطفل قد يشمل التاريخ النمائي والأسري، معلومات المدرسة، ومقابلة الطفل أو ملاحظته بحسب الحاجة.' },
  { title: 'WHO — mhGAP guideline, third edition', url: 'https://www.who.int/publications/i/item/9789240084278', note: 'إرشادات قائمة على الدليل لتقييم ورعاية الحالات النفسية والعصبية واضطرابات استخدام المواد في الخدمات غير التخصصية.' },
] as const;

export default function StartHerePage() {
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'ابدأ هنا', path: '/start-here' }]);
  return <>
    <SiteHeader />
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
      <section className={styles.hero}>
        <div className={styles.shell}>
          <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">ابدأ هنا</span></nav>
          <span className={styles.eyebrow}>خريطة استخدام المنصة</span>
          <h1>ابدأ بالسؤال الذي تريد حله، لا بقائمة طويلة من الصفحات</h1>
          <p>روافد واسعة؛ لذلك نقطة البداية الأفضل هي تحديد حاجتك: فهم حالة، دعم شخص من الأسرة، إزالة حاجز مدرسي، استخدام أداة، قراءة دليل علمي، أو الاستعداد لمختص. هذه الصفحة تجمع قيمة صفحة «ابدأ هنا» القديمة ومسارات الجمهور المتفرقة في بوابة واحدة حتى لا تتكرر المعلومة ولا يضيع القارئ بين صفحات قصيرة متشابهة.</p>
          <div className={styles.heroLinks}><a href="#audiences">اختر حسب دورك</a><a href="#pathways">اختر حسب الهدف</a><a href="#appointment">استعد للموعد</a></div>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.safety}`} aria-labelledby="safety-title">
        <div><span className={styles.eyebrow}>الأولوية الأولى</span><h2 id="safety-title">قبل البحث عن تفسير: هل توجد حاجة عاجلة؟</h2></div>
        <p>إذا كان هناك خطر فوري على النفس أو الآخرين، فقدان شديد للاتصال بالواقع، عجز شديد عن تلبية الاحتياجات الأساسية، أو حالة طبية حادة، فالأولوية لخدمات الطوارئ المحلية المناسبة للموقف. لا تستخدم مقالًا أو أداة إلكترونية لتأخير الرعاية العاجلة. وإذا لم يكن الخطر فوريًا لكن التغير جديد أو سريع، سجّل وقت البداية والأعراض والأدوية والتغيرات المهمة واطلب تقييمًا مناسبًا.</p>
      </section>

      <section id="audiences" className={`${styles.shell} ${styles.section}`} aria-labelledby="audience-title">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>المسارات حسب الدور</span><h2 id="audience-title">اختر ما يصف موقعك الآن</h2><p>هذه المسارات تدمج الصفحات التاريخية المنفصلة للأفراد والأسر والمعلمين والطلاب والمختصين. لا تحتاج إلى فتح صفحة جديدة لكل دور؛ اختر نقطة البداية ثم انتقل إلى القطاع أو الدليل المناسب.</p></div>
        <div className={styles.cardGrid}>{audienceCards.map((card) => <article id={card.id} key={card.id} className={styles.card}><h3>{card.title}</h3><p>{card.body}</p><div className={styles.links}>{card.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></article>)}</div>
      </section>

      <section id="pathways" className={`${styles.shell} ${styles.section}`} aria-labelledby="pathway-title">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>المسارات حسب الهدف</span><h2 id="pathway-title">ما الذي تريد إنجازه؟</h2><p>اختر مسارًا واحدًا أولًا. التنقل المنظم أفضل من جمع عشرات الصفحات دون سؤال واضح أو معيار لما سيُعد نتيجة مفيدة.</p></div>
        <div className={styles.pathwayGrid}>{pathways.map((pathway, index) => <article key={pathway.title} className={styles.pathway}><span className={styles.number}>{String(index + 1).padStart(2, '0')}</span><h3>{pathway.title}</h3><p>{pathway.body}</p><div className={styles.links}>{pathway.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div></article>)}</div>
      </section>

      <section id="appointment" className={`${styles.shell} ${styles.appointment}`} aria-labelledby="appointment-title">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>قبل موعد الصحة النفسية أو النمو</span><h2 id="appointment-title">جهّز معلومات تجعل الحوار أكثر دقة</h2></div>
        <ol>
          <li><strong>سبب الزيارة:</strong> اكتب في جملة واحدة ما الذي تغير أو ما السؤال الأساسي الذي تريد مناقشته.</li>
          <li><strong>التسلسل الزمني:</strong> متى بدأت الملاحظات؟ هل كانت تدريجية أم بعد حدث أو تغير محدد؟</li>
          <li><strong>الأثر الوظيفي:</strong> أعط أمثلة على النوم، التعلم، العمل، العلاقات، الأكل، العناية بالنفس أو المشاركة اليومية.</li>
          <li><strong>السياق الصحي:</strong> حضّر قائمة الأدوية الموصوفة وغير الموصوفة والمكملات والحالات الطبية والتقييمات السابقة ذات الصلة.</li>
          <li><strong>عند الأطفال:</strong> اجمع ـ عند ملاءمة ذلك ـ ملاحظات من المدرسة أو مقدمي الرعاية الآخرين، وفسح مساحة لصوت الطفل أو المراهق نفسه.</li>
          <li><strong>الأسئلة:</strong> رتّب أهم سؤالين أو ثلاثة، واسأل عن البدائل والفوائد والأضرار وعدم اليقين والخطوة التالية ومتى تكون المراجعة.</li>
        </ol>
        <Link className={styles.primaryLink} href="/guided-assessment">استخدم بنك الأسئلة الاسترشادية للتحضير</Link>
      </section>

      <section className={`${styles.shell} ${styles.reading}`} aria-labelledby="reading-title">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>طريقة القراءة</span><h2 id="reading-title">ستة فحوص قبل تحويل أي صفحة إلى قرار</h2></div>
        <div className={styles.checkGrid}>
          <p><strong>ما نوع الصفحة؟</strong> تعريف، دليل، مقارنة، أداة، بحث أم صفحة خدمة؟ لكل نوع حدود مختلفة.</p>
          <p><strong>من الجمهور؟</strong> العمر والسياق والقدرات واللغة والحالات المصاحبة قد تغير معنى المعلومة.</p>
          <p><strong>ما الذي يثبته المصدر؟</strong> لا توسّع الادعاء أبعد مما تدعمه الدراسة أو الإرشادات.</p>
          <p><strong>ما درجة عدم اليقين؟</strong> «قد يرتبط» ليست «يسبب»، و«تحرٍّ» ليست «تشخيصًا».</p>
          <p><strong>هل المعلومة حديثة؟</strong> الطب والخدمات والقوانين والإرشادات تتغير؛ راجع تاريخ المصدر والمراجعة.</p>
          <p><strong>ما الخطوة المناسبة؟</strong> حوّل القراءة إلى سؤال أو متابعة أو طلب دعم، لا إلى ملصق نهائي على شخص.</p>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.sources}`} aria-labelledby="sources-title">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>مراجع منهجية</span><h2 id="sources-title">المصادر التي تدعم طريقة التحضير والتقييم</h2><p>هذه المصادر لا تجعل روافد جهة تشخيص أو علاج؛ هي مراجع رسمية استُخدمت لتثبيت حدود الصفحة وطريقة الاستعداد للمقابلة المهنية.</p></div>
        <div className={styles.sourceGrid}>{references.map((reference) => <article key={reference.url}><h3><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></h3><p>{reference.note}</p></article>)}</div>
        <p className={styles.methodLink}><Link href="/medical-review-policy">اقرأ منهجية المراجعة العلمية في روافد</Link></p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
