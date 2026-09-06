import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';

const PATH = '/accessibility/sensory-accessibility/';
const DAIVURJNT = 'https://daivurjnt.com/';
const PRIVACY = 'https://daivurjnt.com/privacy-policy.html';
const TERMS = 'https://daivurjnt.com/terms-of-service.html';
const APP_STORE = 'https://apps.apple.com/us/app/spectrumscan/id6746865649';

export const metadata = buildSeoMetadata({
  title: 'إمكانية الوصول الحسي في الصفوف والمراكز | الإضاءة والضوضاء وقياس البيئة',
  description: 'دليل علمي وعملي لفهم أثر الإضاءة والضوضاء في التركيز والراحة والتفاعل، وكيفية تقييم البيئة الحسية في الصفوف والمراكز والأماكن العامة، مع SpectrumScan كمثال تطبيقي غير تشخيصي.',
  path: PATH,
  index: true,
  follow: true,
  keywords: [
    'إمكانية الوصول الحسي', 'البيئة الحسية', 'الضوضاء في الصفوف', 'الإضاءة في الصفوف',
    'الحساسية الحسية', 'التكامل الحسي', 'التربية الخاصة', 'المراكز الخاصة', 'البيئة الصفية',
    'sensory accessibility', 'sensory environment', 'SpectrumScan', 'sensory friendly spaces',
  ],
  relatedTerms: ['الانتباه', 'الذاكرة العاملة', 'الاستماع', 'الوميض', 'شدة الإضاءة', 'الديسيبل', 'التردد', 'التقنيات المساعدة'],
  searchIntents: [
    'كيف تؤثر الضوضاء على التركيز في الصف',
    'كيف تؤثر الإضاءة على الانتباه والراحة',
    'تقييم البيئة الحسية للمراكز',
    'sensory accessibility classroom',
    'sensory friendly center assessment',
    'SpectrumScan Arabic',
  ],
});

const acousticFactors = [
  ['شدة الصوت', 'تقاس عادة بالديسيبل. الرقم وحده لا يصف الراحة بالكامل، لكنه يساعد على اكتشاف الفترات أو الغرف الأعلى ضوضاء.'],
  ['التردد', 'قد تكون بعض النغمات أو الأصوات الحادة/المنخفضة أكثر إزعاجًا لبعض الأشخاص حتى عندما لا يكون المستوى العام مرتفعًا جدًا.'],
  ['نسبة الإشارة إلى الضوضاء', 'تحدد مدى وضوح صوت المعلم أو المعالج مقارنة بالخلفية. تدهورها يزيد جهد الاستماع ويستهلك موارد الانتباه.'],
  ['زمن الارتداد الصوتي', 'كلما طال بقاء الصوت وانعكاسه في الغرفة قد يصبح الكلام أقل وضوحًا، خصوصًا في الصفوف الكبيرة والأسطح الصلبة.'],
] as const;

const lightFactors = [
  ['شدة الإضاءة Lux', 'تقيس مقدار الإضاءة الواصلة إلى السطح. المطلوب ليس أعلى رقم دائمًا، بل مستوى مناسب للمهمة مع إمكانية التكيف.'],
  ['الوميض Flicker', 'قد لا يكون ظاهرًا دائمًا للعين، لكنه قد يسبب انزعاجًا لدى بعض الأشخاص أو يزيد عبء البيئة البصرية.'],
  ['حرارة اللون', 'تصف الطابع الدافئ أو البارد للضوء، وقد تؤثر في الإحساس بالمكان واليقظة بحسب السياق والوقت والتفضيل الفردي.'],
  ['الوهج والتباين', 'الوهج من النوافذ أو الشاشات أو الأسطح اللامعة قد يسبب إجهادًا بصريًا حتى عندما تكون شدة الإضاءة الاسمية مقبولة.'],
] as const;

const settings = [
  ['مراكز التربية الخاصة والتأهيل', 'مقارنة غرف العلاج والانتظار والأنشطة، وتحديد البيئات التي تحتاج ضبطًا أو مساحة أكثر هدوءًا.'],
  ['الصفوف والمدارس', 'رصد الضوضاء والإضاءة في أوقات مختلفة وربط التعديلات بجودة الاستماع والمشاركة والانتباه.'],
  ['المعاهد والجامعات', 'تحسين القاعات والمختبرات والمكتبات ومساحات الدراسة من منظور الاستخدام المتنوع والحساسية الفردية.'],
  ['العيادات والمستشفيات', 'دراسة غرف الانتظار والممرات والمساحات عالية الحركة، خاصة عندما يكون المراجع متعبًا أو حساسًا للضوء أو الصوت.'],
  ['المتاحف والمطارات والأماكن العامة', 'بناء وصف حسي للمكان قبل الزيارة ومساعدة المستخدم على اختيار الوقت أو المسار الأنسب.'],
  ['أماكن العمل والخدمات', 'تقليل مصادر التشتيت وتحسين القدرة على التركيز والتواصل دون افتراض أن حلًا واحدًا يناسب الجميع.'],
] as const;

const protocol = [
  ['1', 'عرّف وظيفة المكان', 'حدد هل الغرفة للتعلم، العلاج، الانتظار، اللعب، الراحة أو التواصل. ما يعد مناسبًا لمهمة قد لا يناسب مهمة أخرى.'],
  ['2', 'قِس في أكثر من وقت', 'لا تعتمد على قراءة واحدة. قارن بداية اليوم، وقت الذروة، الحصص المختلفة، وعدد الأشخاص في المكان.'],
  ['3', 'سجّل السياق', 'دوّن عدد الموجودين، الأجهزة العاملة، مصدر الضوء، فتح الأبواب والنوافذ، وأي حدث يفسر تغير القراءة.'],
  ['4', 'ابحث عن النمط لا عن الرقم المنفرد', 'المهم هو التكرار والارتباط بالسياق: متى يرتفع الصوت؟ أين يظهر الوهج؟ أي غرفة أكثر ثباتًا؟'],
  ['5', 'نفّذ تعديلًا منخفض المخاطر', 'مثل تقليل الوهج، تغيير توزيع المقاعد، فصل جهاز صاخب، إضافة منطقة هادئة، أو تحسين امتصاص الصوت.'],
  ['6', 'أعد القياس واسأل المستخدم', 'المؤشر البيئي لا يكفي وحده. أعد القياس واجمع ملاحظات المستخدمين والمختصين حول الراحة والمشاركة والاستماع.'],
] as const;

const faq = [
  ['هل توجد قيمة ديسيبل واحدة تجعل المكان مناسبًا حسيًا للجميع؟', 'لا. شدة الصوت مهمة، لكن الراحة تعتمد أيضًا على نوع الصوت وتردده وتقطعه ووضوح الكلام والحساسية الفردية والمهمة المطلوبة. لذلك لا يصح اختزال إمكانية الوصول الحسي في رقم واحد.'],
  ['هل الإضاءة الأقوى أفضل دائمًا للتركيز؟', 'لا. بعض المهام قد تستفيد من إضاءة أعلى أو أكثر يقظة، لكن الوهج والوميض والسطوع الزائد قد يسببون انزعاجًا. الأفضل هو الإضاءة المناسبة للمهمة مع قابلية التعديل وتفضيلات المستخدم.'],
  ['هل قياس البيئة الحسية يشخّص اضطراب معالجة حسية أو توحدًا أو ADHD؟', 'لا. قياس الضوء والصوت يصف خصائص البيئة ولا يشخّص الشخص. التشخيص السريري يحتاج تقييمًا متخصصًا ولا يمكن استنتاجه من قراءات المكان.'],
  ['هل يمكن استخدام القياس داخل مركز مكوّن من عدة غرف؟', 'نعم من حيث المبدأ إذا كانت كل غرفة تقاس بصورة مستقلة وبسياق واضح. في التطبيقات المؤسسية قد تستخدم حساسات منفصلة لكل غرفة، لكن يلزم نظام يحافظ على فصل البيانات والخصوصية والترخيص المناسب.'],
  ['أين يدخل SpectrumScan في هذا المجال؟', 'هو مثال على أداة رقمية تترجم جزءًا من البيئة الحسية إلى بيانات عن الضوء والصوت وتربطها بتفضيلات المستخدم وخريطة للأماكن. فائدته الأساسية هي دعم الوعي واتخاذ القرار، لا إصدار تشخيص أو حكم طبي.'],
] as const;

export default function SensoryAccessibilityPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الوصولية', path: '/accessibility/' },
    { name: 'إمكانية الوصول الحسي', path: PATH },
  ]);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${absoluteSiteUrl(PATH)}#article`,
    headline: 'إمكانية الوصول الحسي في الصفوف والمراكز: الإضاءة والضوضاء وقياس البيئة',
    description: 'دليل علمي وعملي لتقييم البيئة الحسية وتحسين الضوء والصوت في الصفوف والمراكز والأماكن العامة.',
    inLanguage: 'ar',
    dateModified: '2026-09-07',
    isAccessibleForFree: true,
    mainEntityOfPage: absoluteSiteUrl(PATH),
    publisher: { '@type': 'Organization', name: 'روافد / Health Renewal', url: SITE_URL },
    about: ['Sensory accessibility', 'Environmental noise', 'Lighting', 'Assistive technology', 'Special education'],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, articleJsonLd, faqJsonLd]).replace(/</g, '\\u003c') }} />

      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link><span>/</span>
        <Link href="/accessibility/">الوصولية</Link><span>/</span>
        <span aria-current="page">إمكانية الوصول الحسي</span>
      </nav>

      <section className="public-index-hero" aria-labelledby="sensory-title">
        <span className="eyebrow">الوصولية الحسية · الضوء · الصوت · البيئة المبنية</span>
        <h1 id="sensory-title">إمكانية الوصول الحسي: عندما تصبح الإضاءة والضوضاء جزءًا من جودة الخدمة</h1>
        <p>الصف أو المركز أو العيادة لا يتكوّن من أثاث ومساحة فقط. شدة الإضاءة، الوميض، الوهج، مستوى الضوضاء، الترددات، وضوح الكلام والارتداد الصوتي تشكل معًا جزءًا من التجربة الحسية التي قد تساعد الإنسان على التركيز والتفاعل أو تزيد الجهد والتشتت والانزعاج.</p>
        <p>هذه الصفحة تشرح كيف تُقاس البيئة الحسية وكيف تتحول القراءات إلى قرارات عملية. وهي لا تفترض أن هناك «رقمًا مثاليًا» يصلح لكل الأشخاص، ولا تستخدم القياس البيئي كبديل للتقييم الطبي أو النفسي.</p>
        <div className="public-stat-strip">
          <span>قياس متكرر لا قراءة واحدة</span>
          <span>الصوت + الضوء + السياق</span>
          <span>لا تشخيص من بيانات البيئة</span>
          <span>التفضيل الفردي جزء من القرار</span>
        </div>
      </section>

      <section aria-labelledby="why-title">
        <div className="section-mini-heading"><div><span className="eyebrow">لماذا يهم؟</span><h2 id="why-title">البيئة قد تستهلك الموارد المعرفية قبل أن تبدأ المهمة</h2></div><span>الانتباه والاستماع والذاكرة العاملة لا تعمل بمعزل عن المكان.</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>الضوضاء وجهد الاستماع</h3><p>عندما يقترب صوت الخلفية من صوت المتحدث أو يكثر الارتداد داخل الغرفة، يحتاج الدماغ جهدًا أكبر لاستخلاص الكلام. هذا الجهد قد يترك موارد أقل للانتباه والفهم والتذكر، ويكون أوضح لدى الأطفال وبعض من لديهم صعوبات لغوية أو انتباهية أو حساسية سمعية.</p></article>
          <article className="institutional-sector-card"><h3>الإضاءة واليقظة والراحة</h3><p>شدة الضوء وحرارة اللون والوهج والوميض يمكن أن تغير الإحساس بالمكان واليقظة والراحة البصرية. لكن التأثير يعتمد على وقت اليوم والمهمة والشخص؛ لذلك لا يصح التعامل مع الإضاءة الأعلى باعتبارها أفضل دائمًا.</p></article>
          <article className="institutional-sector-card"><h3>التفاعل والكفاءة</h3><p>المكان المرهق حسيًا قد يجعل التواصل أو أداء المهمة أصعب حتى عندما تكون قدرة الشخص الأساسية جيدة. تحسين البيئة لا «يعالج» اضطرابًا، لكنه يزيل حواجز يمكن أن تعيق المشاركة والتعلم والعمل.</p></article>
        </div>
      </section>

      <section aria-labelledby="sound-title">
        <div className="section-mini-heading"><div><span className="eyebrow">المجال السمعي</span><h2 id="sound-title">ماذا نقيس عندما نقول إن الغرفة «صاخبة»؟</h2></div><span>الديسيبل مهم، لكنه ليس القصة كاملة.</span></div>
        <div className="institutional-sector-grid">
          {acousticFactors.map(([title, text]) => <article className="institutional-sector-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}
        </div>
        <div className="content-card"><strong>قاعدة عملية:</strong> قارن الغرف والأوقات داخل المنشأة نفسها قبل البحث عن حد رقمي مطلق. إذا كانت غرفة العلاج أكثر ضوضاء باستمرار من غرفة أخرى مماثلة، أو يرتفع الصوت في وقت محدد، فهذه معلومة قابلة للتحويل إلى إجراء.</div>
      </section>

      <section aria-labelledby="light-title">
        <div className="section-mini-heading"><div><span className="eyebrow">المجال البصري</span><h2 id="light-title">الإضاءة ليست Lux فقط</h2></div><span>السطوع والوميض واللون والوهج عوامل مختلفة.</span></div>
        <div className="institutional-sector-grid">
          {lightFactors.map(([title, text]) => <article className="institutional-sector-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="who-title">
        <div className="section-mini-heading"><div><span className="eyebrow">الفروق الفردية</span><h2 id="who-title">من قد يستفيد أكثر من بيئة قابلة للتكيف؟</h2></div><span>التصميم الحسي الجيد يفيد أكثر من فئة ولا يُبنى على التشخيص وحده.</span></div>
        <div className="content-card">
          <p>قد يكون للضوء والصوت أثر أكبر لدى بعض الأشخاص ذوي التباين العصبي، الحساسية الحسية، الصداع النصفي، صعوبات الانتباه أو الاستماع، وبعض كبار السن، لكن الاحتياجات داخل المجموعة الواحدة قد تكون متعاكسة: شخص يحتاج ضوءًا أقل، وآخر يحتاج إضاءة أوضح؛ شخص يتأثر بالضوضاء المستمرة، وآخر بالأصوات المفاجئة.</p>
          <p><strong>لذلك المعيار الأفضل ليس «ما التشخيص؟» بل «ما متطلبات المهمة، وما خصائص المكان، وما الذي يبلغ عنه المستخدم؟»</strong></p>
        </div>
      </section>

      <section aria-labelledby="protocol-title">
        <div className="section-mini-heading"><div><span className="eyebrow">بروتوكول للمراكز</span><h2 id="protocol-title">من القياس إلى تعديل قابل للتحقق</h2></div><span>دورة قصيرة يمكن تكرارها لكل غرفة.</span></div>
        <div className="institutional-sector-grid">
          {protocol.map(([n, title, text]) => <article className="institutional-sector-card" key={n}><span className="eyebrow">الخطوة {n}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="settings-title">
        <div className="section-mini-heading"><div><span className="eyebrow">أين يمكن التطبيق؟</span><h2 id="settings-title">من الصف الصغير إلى المكان العام</h2></div><span>القيمة الحقيقية تظهر عندما تصبح القياسات جزءًا من إدارة المكان.</span></div>
        <div className="institutional-sector-grid">
          {settings.map(([title, text]) => <article className="institutional-sector-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="center-model-title">
        <div className="section-mini-heading"><div><span className="eyebrow">نموذج مؤسسي</span><h2 id="center-model-title">ماذا لو كان المركز مكوّنًا من خمس غرف؟</h2></div><span>يجب فصل القياس بحسب المكان والسياق.</span></div>
        <div className="content-card">
          <p>في مركز متعدد الغرف، لا ينبغي دمج القراءات في رقم واحد. الأفضل إعطاء كل غرفة هوية مستقلة، ثم قياس الضوء والصوت خلال فترات متكررة مع تسجيل النشاط وعدد الموجودين. عند استخدام حساسات ثابتة، يمكن لكل غرفة أن تنتج سجلًا منفصلًا يسمح بمقارنة الأنماط بدل خلط المصادر.</p>
          <p>هذا النموذج يفتح بابًا لاستخدام مؤسسي أوسع: لوحة تعرض حالة الغرف، تنبيه عند تغير غير معتاد، مقارنة قبل/بعد تعديل بيئي، وخريطة داخلية تساعد الموظف أو الزائر على اختيار المساحة الأنسب. لكنه يتطلب حوكمة بيانات واضحة، صلاحيات وصول، سياسة احتفاظ، وترخيصًا مؤسسيًا مناسبًا.</p>
        </div>
      </section>

      <section aria-labelledby="spectrum-title">
        <div className="section-mini-heading"><div><span className="eyebrow">مثال تطبيقي</span><h2 id="spectrum-title">SpectrumScan: تحويل جزء من البيئة الحسية إلى بيانات قابلة للفهم</h2></div><span>مثال تقني داخل المجال، وليس معيارًا تشخيصيًا.</span></div>
        <div className="content-card">
          <p><strong>SpectrumScan</strong> هو تطبيق من DAIVURJNT يركز على مساعدة المستخدم في فهم الضوء والصوت حوله. تصف الشركة التطبيق باعتباره مراقبًا شخصيًا بحدود متكيفة، تقارير بصرية، توصيات مرتبطة بتفضيلات المستخدم، وخريطة حسية تساعد على معرفة خصائص بعض الأماكن قبل زيارتها.</p>
          <p>تذكر سياسة الخصوصية الرسمية أن بيانات البيئة قد تشمل <strong>شدة الإضاءة (lux)، الوميض، حرارة اللون، مستوى الصوت بالديسيبل والتردد</strong>، مع إمكانية استخدام الموقع للخريطة. كما تصف قياسات حيوية اختيارية عند وجود تكامل مصرح به مع أجهزة قابلة للارتداء، مثل معدل القلب أو HRV.</p>
          <p>في نقاش مباشر مع مؤسسة التطبيق، أوضحت DAIVURJNT لروافد أن الرؤية المؤسسية يمكن أن تتوسع إلى حساسات منفصلة توضع في الصفوف أو الغرف وتراقب كل مساحة على حدة، وأن الاستخدام التجاري يمكن تنظيمه بحسب حجم التنفيذ. هذا يتوافق مع فكرة تقييم المراكز على مستوى الغرفة بدل الاكتفاء بالاستخدام الفردي.</p>
          <div className="hero-actions">
            <a className="primary-link" href={DAIVURJNT} target="_blank" rel="noreferrer">الموقع الرسمي لـ DAIVURJNT ↗</a>
            <a className="secondary-link" href={APP_STORE} target="_blank" rel="noreferrer">SpectrumScan على App Store ↗</a>
          </div>
        </div>
      </section>

      <section aria-labelledby="limits-title">
        <div className="section-mini-heading"><div><span className="eyebrow">حدود الاستخدام</span><h2 id="limits-title">ما الذي لا ينبغي استنتاجه من التطبيق أو من أي حساس بيئي؟</h2></div><span>القياس البيئي أداة قرار، لا تشخيص.</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>لا يشخّص الشخص</h3><p>قراءة الضوء أو الصوت لا تشخّص التوحد أو ADHD أو اضطراب معالجة حسية أو القلق أو الصداع النصفي. هي تصف البيئة في لحظة وسياق محددين.</p></article>
          <article className="institutional-sector-card"><h3>لا يوجد حد شخصي عالمي</h3><p>عتبة الراحة تختلف بين الأشخاص وقد تختلف للشخص نفسه حسب التعب، الوقت، المهمة والحالة العامة. يجب استخدام القياس مع التفضيلات والملاحظة الوظيفية.</p></article>
          <article className="institutional-sector-card"><h3>ليس جهاز قياس مختبريًا بالضرورة</h3><p>حساس الهاتف مفيد للوعي والمقارنة، لكنه لا يجب أن يحل محل أجهزة قياس معايرة عندما يكون القرار هندسيًا أو تنظيميًا أو مرتبطًا بالسلامة المهنية.</p></article>
        </div>
      </section>

      <section aria-labelledby="privacy-title">
        <div className="section-mini-heading"><div><span className="eyebrow">الخصوصية والحوكمة</span><h2 id="privacy-title">قبل تعميم أي نظام داخل مركز</h2></div><span>القياس البيئي يصبح نظام بيانات عندما يعمل باستمرار.</span></div>
        <div className="content-card">
          <p>تذكر DAIVURJNT أن SpectrumScan لا يسجل الصوت ولا يلتقط الصور، وأنه يستخرج قياسات من حساسات الجهاز، بينما تسجل بطاقة الخصوصية في App Store فئة <strong>Audio Data</strong> ضمن بيانات قد تستخدم لوظائف التطبيق وغير مرتبطة بالهوية. هذا الاختلاف في توصيف الفئة لا يعني بالضرورة وجود تسجيل صوتي محفوظ، لكنه سبب كافٍ لكي تطلب المؤسسة توضيحًا مكتوبًا قبل نشر النظام على نطاق واسع.</p>
          <p>كما أن سياسة الشركة الحالية توجّه التطبيق للبالغين 18+، وشروط الاستخدام العامة تصف ترخيص المستخدم المعتاد بأنه شخصي وغير تجاري. لذلك استخدامه داخل مركز أو شبكة مؤسسات يحتاج اتفاقًا مناسبًا ولا ينبغي افتراض أن حساب المستخدم العادي يغطي التنفيذ المؤسسي.</p>
          <div className="hero-actions">
            <a className="secondary-link" href={PRIVACY} target="_blank" rel="noreferrer">سياسة خصوصية DAIVURJNT ↗</a>
            <a className="secondary-link" href={TERMS} target="_blank" rel="noreferrer">شروط الاستخدام الرسمية ↗</a>
          </div>
        </div>
      </section>

      <section aria-labelledby="availability-title">
        <div className="section-mini-heading"><div><span className="eyebrow">الوضع الحالي</span><h2 id="availability-title">التوافر والمنصة التقنية</h2></div><span>تحقق من المتجر المحلي قبل التوصية المباشرة.</span></div>
        <div className="content-card">
          <p>بطاقة App Store الحالية تعرض SpectrumScan كتطبيق <strong>iPhone</strong> في مرحلة beta وبحد عمري 18+. توافر التطبيق قد يختلف حسب دولة حساب App Store، ولذلك يجب التأكد من توفره في البلد المستهدف قبل إدخاله في دليل مستخدمين أو برنامج مؤسسي. لا ينبغي أيضًا بناء مسار مركز كامل على منصة واحدة قبل التحقق من تغطية أجهزة الموظفين والمستفيدين.</p>
        </div>
      </section>

      <section aria-labelledby="decision-title">
        <div className="section-mini-heading"><div><span className="eyebrow">قرار عملي</span><h2 id="decision-title">كيف نعرف أن تحسين البيئة نجح؟</h2></div><span>لا نكتفي بأن يصبح الرقم أقل أو أعلى.</span></div>
        <div className="content-card">
          <ul>
            <li><strong>بيئيًا:</strong> هل انخفضت التقلبات غير المرغوبة في الصوت أو الوهج أو الوميض؟</li>
            <li><strong>وظيفيًا:</strong> هل أصبح فهم الكلام أو أداء المهمة أو البقاء في الغرفة أسهل؟</li>
            <li><strong>تجريبيًا:</strong> هل يصف المستخدم المكان بأنه أكثر راحة أو قابلية للتحمل؟</li>
            <li><strong>تشغيليًا:</strong> هل يستطيع الموظفون الحفاظ على التعديل دون تكلفة أو تعقيد غير مبرر؟</li>
            <li><strong>عدالةً:</strong> هل أعطينا خيارات متعددة بدل فرض إعداد واحد على جميع الأشخاص؟</li>
          </ul>
          <p><strong>أفضل بيئة حسية ليست الأكثر هدوءًا أو الأكثر إضاءة بصورة مطلقة؛ بل البيئة التي تجعل المهمة ممكنة وتسمح للشخص بالاختيار والتكيف.</strong></p>
        </div>
      </section>

      <section aria-labelledby="related-title">
        <div className="section-mini-heading"><div><span className="eyebrow">اقرأ أيضًا في روافد</span><h2 id="related-title">مسارات مرتبطة</h2></div><span>لربط البيئة الحسية بالتقييم الوظيفي والتقنيات المساعدة.</span></div>
        <div className="institutional-sector-grid">
          <Link className="institutional-sector-card" href="/capabilities/sensory-processing-differences/"><h3>اختلافات المعالجة الحسية</h3><p>فهم الاستجابة الحسية ضمن الوظيفة والمشاركة بدل اختزالها في سلوك واحد.</p></Link>
          <Link className="institutional-sector-card" href="/capabilities/kids-lab/sensory-self-regulation/"><h3>الوعي الحسي والتنظيم الذاتي</h3><p>مسار تدريبي للأطفال داخل مختبر القدرات؛ منفصل عن SpectrumScan الذي توجَّه سياسته الحالية للبالغين.</p></Link>
          <Link className="institutional-sector-card" href="/care-guides/assistive-technology-trial-follow-up/"><h3>تجربة التقنية المساعدة ومتابعتها</h3><p>كيف نختبر أداة في سياقها الحقيقي ونقرر استمرارها بناءً على المنفعة والعبء والنتيجة.</p></Link>
        </div>
      </section>

      <section aria-labelledby="sources-title">
        <div className="section-mini-heading"><div><span className="eyebrow">المصادر الرسمية للأداة</span><h2 id="sources-title">للتحقق من المعلومات المتغيرة</h2></div><span>قد تتغير الخصائص والتوافر والشروط مع تطور المنتج.</span></div>
        <div className="content-card">
          <p>استُخدمت المعلومات المنشورة رسميًا من DAIVURJNT وبطاقة SpectrumScan في App Store للتحقق من خصائص الأداة وحدودها الحالية. أما شرح أثر الصوت والإضاءة وبروتوكول تقييم المكان فهو سياق علمي تحريري مستقل، ولا يمثل ادعاءً بأن SpectrumScan أداة تشخيصية أو أن الشركة راجعت هذه الصفحة.</p>
          <ul>
            <li><a href={DAIVURJNT} target="_blank" rel="noreferrer">DAIVURJNT — الموقع الرسمي وشرح SpectrumScan</a></li>
            <li><a href={PRIVACY} target="_blank" rel="noreferrer">DAIVURJNT — سياسة الخصوصية</a></li>
            <li><a href={TERMS} target="_blank" rel="noreferrer">DAIVURJNT — شروط الاستخدام</a></li>
            <li><a href={APP_STORE} target="_blank" rel="noreferrer">SpectrumScan — الصفحة الرسمية في App Store</a></li>
          </ul>
          <p><small>آخر مراجعة تحريرية: 7 سبتمبر 2026. المحتوى للتثقيف واتخاذ القرار المؤسسي الأولي، وليس بديلًا عن التقييم السريري أو القياس الهندسي المعاير عند الحاجة.</small></p>
        </div>
      </section>

      <section aria-labelledby="faq-title">
        <div className="section-mini-heading"><div><span className="eyebrow">أسئلة شائعة</span><h2 id="faq-title">أسئلة عملية قبل البدء</h2></div></div>
        <div className="institutional-sector-grid">
          {faq.map(([question, answer]) => <article className="institutional-sector-card" key={question}><h3>{question}</h3><p>{answer}</p></article>)}
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
