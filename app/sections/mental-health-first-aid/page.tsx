import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';

const REVIEWED_ON = '2026-09-08';

const officialRoutes = [
  {
    title: 'البرنامج العالمي Global MHFA',
    summary: 'مسار رسمي تقدمه Mental Health First Aid International للدول التي لا يوجد فيها شريك MHFA مرخّص. تذكر الصفحة الرسمية أن البرنامج يمتد يومين (12 ساعة) ويمكن تقديمه افتراضياً أو حضورياً بحسب الموقع وتوافر المدرّب.',
    href: 'https://mhfainternational.org/the-global-mhfa-program/',
    action: 'فتح صفحة البرنامج العالمي الرسمية',
  },
  {
    title: 'دليل الشركاء المرخّصين دولياً',
    summary: 'المرجع الأساسي للتحقق من وجود شريك MHFA مرخّص في دولة أو إقليم. لا تعتمد على إعلان دورة أو شعار بمفرده؛ راجع الدليل الرسمي قبل التسجيل أو الدفع.',
    href: 'https://mhfainternational.org/international-mental-health-first-aid-programs/',
    action: 'التحقق من الشركاء المرخّصين',
  },
  {
    title: 'صفحة التدريب الرسمية',
    summary: 'توضح الفرق بين التدريب عبر الشركاء المرخّصين وبين بعض المسارات العالمية أو متعددة الجنسيات، وتعرض القيود المرتبطة بالنطاق الجغرافي والاعتماد.',
    href: 'https://mhfainternational.org/mental-health-first-aid-training/',
    action: 'فتح صفحة التدريب الرسمية',
  },
  {
    title: 'مسار الترخيص الوطني',
    summary: 'مخصص للجهات المؤسسية التي تفكر في تطوير برنامج MHFA وطني في بلد لا يوجد فيه شريك مرخّص، مع متطلبات الأهلية والتمويل والبحث والتقييم والتكييف المحلي.',
    href: 'https://mhfainternational.org/license-mhfa/',
    action: 'قراءة متطلبات الترخيص الرسمية',
  },
] as const;

const licensingCriteria = [
  'أن تكون الجهة مسجلة كمنظمة غير ربحية أو social enterprise وفق متطلبات MHFA International المنشورة.',
  'توافر فريق قادر على تكييف البرنامج وتطويره ونشره وإدارته وطنياً، بما يشمل المحتوى والإدارة والمالية والتسويق.',
  'وجود تمويل تأسيسي وموارد كافية للتجريب والتوسع الوطني، مع نموذج تمويل طويل الأمد.',
  'خبرة لا تقل عن خمس سنوات في تدريب المعلّمين/المدرّبين وتطوير البرامج التعليمية وتقديمها.',
  'خبرة لا تقل عن خمس سنوات في تسويق البرامج أو الحملات التعليمية واستقطاب الفئات المستهدفة والاحتفاظ بها.',
  'علاقات عمل قائمة مع جهات وطنية معنية بالصحة النفسية، مع خبرة أو التزام واضح بالبحث والتقييم.',
  'القدرة على تقديم تقارير سنوية مؤسسية وقوائم مالية للسنوات المالية الثلاث السابقة.',
] as const;

const verificationSteps = [
  ['1', 'حدد الدولة', 'ابدأ من الدولة التي سيُقدَّم فيها التدريب فعلياً، لأن وجود مزود مرخّص ونطاق الاعتماد يختلفان حسب البلد.'],
  ['2', 'افحص الدليل الرسمي', 'ابحث عن الدولة أو الإقليم في قائمة الشركاء الدولية على موقع MHFA International.'],
  ['3', 'طابق الجهة', 'تأكد أن اسم الجهة التي تسجل لديها يطابق الشريك أو المسار الرسمي المذكور، ولا تعتمد على إعادة نشر معلومات من طرف ثالث.'],
  ['4', 'افهم نوع المسار', 'فرّق بين دورة محلية معتمدة، والبرنامج العالمي، والتعلم الإلكتروني لجهات متعددة الجنسيات، وأي نشاط توعوي مستقل لا يمنح اعتماد MHFA.'],
  ['5', 'تحقق قبل الدفع', 'راجع صفحة MHFA الرسمية المرتبطة بالمسار في يوم التسجيل لأن الأسعار والمواعيد والتوافر قد تتغير.'],
] as const;

const faq = [
  {
    q: 'هل يوجد شريك MHFA مرخّص في الأردن؟',
    a: 'حتى تاريخ المراجعة 8 سبتمبر 2026، لم يظهر الأردن في قائمة الشركاء المرخّصين المنشورة على موقع MHFA International. يجب إعادة التحقق من القائمة الرسمية عند الاستخدام لأن وضع الدول قد يتغير.',
  },
  {
    q: 'هل يستطيع شخص في الأردن الوصول إلى تدريب رسمي الآن؟',
    a: 'تذكر MHFA International أن Global MHFA مصمم للدول التي لا يوجد فيها شريك مرخّص، وأنه يمكن تقديمه افتراضياً أو حضورياً بحسب الموقع وتوافر المدربين. استخدم صفحة Global MHFA الرسمية لتحديد التوافر الحالي.',
  },
  {
    q: 'هل قراءة هذه الصفحة تعادل الحصول على دورة MHFA؟',
    a: 'لا. هذه صفحة توجيه معرفي مستقلة من روافد. لا تمنح تدريباً أو اعتماداً أو شهادة MHFA، ولا تستبدل التسجيل في برنامج رسمي.',
  },
  {
    q: 'هل Mental Health First Aid بديل للعلاج أو الطوارئ؟',
    a: 'لا. الفكرة هي تقديم دعم أولي ومساعدة الشخص على الوصول إلى مساعدة مناسبة. لا تحل محل التقييم الطبي أو النفسي، ولا خدمات الطوارئ عند وجود خطر فوري.',
  },
  {
    q: 'هل تستطيع مؤسسة أردنية أن تصبح شريكاً وطنياً؟',
    a: 'يوجد مسار ترخيص للدول التي لا يوجد فيها شريك حالي، لكن الأهلية مؤسسية وتتطلب شروطاً تشغيلية ومالية وخبرات سابقة واضحة. المرجع الحاسم هو صفحة الترخيص الرسمية والتواصل المباشر مع MHFA International.',
  },
] as const;

const sources = [
  ['Mental Health First Aid International — The Global MHFA Program', 'https://mhfainternational.org/the-global-mhfa-program/', 'تفاصيل البرنامج العالمي، الفئات المستهدفة، المدة وصيغ التقديم.'],
  ['Mental Health First Aid International — International MHFA Programs', 'https://mhfainternational.org/international-mental-health-first-aid-programs/', 'القائمة الرسمية للشركاء المرخّصين دولياً.'],
  ['Mental Health First Aid International — Mental Health First Aid Training', 'https://mhfainternational.org/mental-health-first-aid-training/', 'نطاق تقديم التدريب والمسارات الدولية ومتعددة الجنسيات.'],
  ['Mental Health First Aid International — License MHFA', 'https://mhfainternational.org/license-mhfa/', 'شروط الأهلية والترخيص الوطني والتمويل والتقييم والتكييف المحلي.'],
  ['Mental Health First Aid International — International Quality Principles', 'https://mhfainternational.org/international-quality-principles/', 'مبادئ الجودة والسلامة والخبرة المعيشة والتحقق من المزودين المرخّصين.'],
  ['Morgan AJ, Ross A, Reavley NJ. PLOS ONE (2018)', 'https://doi.org/10.1371/journal.pone.0197102', 'مراجعة منهجية وتحليل تلوي لـ18 دراسة مضبوطة شملت 5,936 مشاركاً.'],
] as const;

export const metadata: Metadata = buildSeoMetadata({
  title: 'الإسعافات الأولية للصحة النفسية MHFA في الأردن: كيف تصل إلى التدريب الرسمي؟',
  description: 'دليل عربي مستقل للتحقق من Mental Health First Aid، وضع الأردن، برنامج Global MHFA، الشركاء المرخّصين، شروط الترخيص الوطني، وما الذي يعنيه الاعتماد فعلياً.',
  path: '/sections/mental-health-first-aid/',
  index: true,
  follow: true,
  type: 'article',
  keywords: ['MHFA', 'Mental Health First Aid', 'الإسعافات الأولية للصحة النفسية', 'الصحة النفسية الأردن', 'تدريب الصحة النفسية', 'Global MHFA'],
  relatedTerms: ['mental health literacy', 'licensed provider', 'Jordan', 'برنامج الصحة النفسية'],
});

export default function MentalHealthFirstAidPathwayPage() {
  const path = '/sections/mental-health-first-aid/';
  const url = `${SITE_URL}${path}`;
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الأقسام', path: '/sections' },
    { name: 'الإسعافات الأولية للصحة النفسية MHFA', path },
  ]);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: 'الإسعافات الأولية للصحة النفسية MHFA في الأردن: كيف تصل إلى التدريب الرسمي؟',
    description: 'دليل عربي مستقل للتحقق من المسارات الرسمية لـ Mental Health First Aid وفهم وضع الأردن ومسار Global MHFA والترخيص الوطني.',
    inLanguage: 'ar',
    datePublished: REVIEWED_ON,
    dateModified: REVIEWED_ON,
    isAccessibleForFree: true,
    mainEntityOfPage: url,
    publisher: { '@id': `${SITE_URL}/#organization` },
    citation: sources.map((source) => source[1]),
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell" lang="ar" dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, articleSchema, faqSchema]).replace(/</g, '\\u003c') }} />

      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link><span aria-hidden="true">/</span>
        <Link href="/sections">الأقسام</Link><span aria-hidden="true">/</span>
        <span aria-current="page">MHFA</span>
      </nav>

      <section className="public-index-hero" aria-labelledby="mhfa-title">
        <span className="eyebrow">دليل وصول رسمي · مراجعة {REVIEWED_ON}</span>
        <h1 id="mhfa-title">الإسعافات الأولية للصحة النفسية MHFA في الأردن</h1>
        <p>هذه الصفحة لا تعيد نشر منهج Mental Health First Aid ولا تحاول تقديم تدريب بديل. هدفها أبسط وأدق: مساعدتك على فهم ما هو MHFA، والتحقق من الطريق الرسمي للتدريب، ومعرفة وضع الأردن، والتمييز بين المزود المرخّص والمحتوى التوعوي العام.</p>
        <div className="public-stat-strip"><span>مصادر رسمية أولاً</span><span>تحقق من الترخيص قبل التسجيل</span><span>لا تدريب ولا اعتماد من روافد</span></div>
      </section>

      <aside className="rawafid-empty" aria-label="حدود الصفحة">
        <h2>حدود واضحة قبل أن تبدأ</h2>
        <p><strong>روافد / Health Renewal ليست مزوداً مرخّصاً من MHFA International، ولا تمنح شهادات أو اعتماد MHFA، وهذه الصفحة لم تُنشر بوصفها ترجمة رسمية أو مادة تدريبية تابعة لـ MHFA.</strong> نستخدم المعلومات العامة المنشورة على المصادر الرسمية لتوجيه القارئ إلى المسار الصحيح، مع الحفاظ على الفصل بين التثقيف العام والتدريب المرخّص.</p>
      </aside>

      <section aria-labelledby="what-is-mhfa">
        <div className="section-mini-heading"><div><span className="eyebrow">المفهوم</span><h2 id="what-is-mhfa">ما هو Mental Health First Aid؟</h2></div><span>ليس علاجاً ولا تشخيصاً</span></div>
        <div className="taxonomy-root-grid">
          <article className="taxonomy-root-card">
            <h3>دعم أولي مبكر</h3>
            <p>تصف MHFA International البرنامج بأنه تدريب يهدف إلى مساعدة الناس على التعرف إلى مؤشرات مشكلات الصحة النفسية، وبدء محادثة داعمة، والاستجابة في مواقف الأزمة، وتشجيع الوصول إلى مساعدة مهنية أو دعم إضافي.</p>
          </article>
          <article className="taxonomy-root-card">
            <h3>حدوده مهمة</h3>
            <p>المسعف الأولي للصحة النفسية لا يحل محل الطبيب أو الأخصائي النفسي ولا يقوم بالتشخيص. عند وجود خطر مباشر على الحياة أو السلامة، تكون خدمات الطوارئ والرعاية المتخصصة هي الأولوية.</p>
          </article>
          <article className="taxonomy-root-card">
            <h3>لماذا التدريب الرسمي مهم؟</h3>
            <p>الجودة لا تعتمد على الاسم فقط. الشبكة الدولية تستخدم مزودين مرخّصين، ومدربين معتمدين، ومناهج خضعت للتكييف المحلي وضبط الجودة؛ لذلك يجب التحقق من الجهة قبل التسجيل.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="jordan-status">
        <div className="section-mini-heading"><div><span className="eyebrow">الأردن</span><h2 id="jordan-status">ما وضع الأردن حالياً؟</h2></div><span>تم التحقق: 8 سبتمبر 2026</span></div>
        <div className="rawafid-empty">
          <p>حتى تاريخ المراجعة، <strong>الأردن غير مدرج في قائمة الشركاء المرخّصين المنشورة من MHFA International</strong>. هذا لا يعني أن الوصول إلى تدريب رسمي مستحيل؛ بل يعني أن نقطة البداية الصحيحة هي التحقق من <span lang="en">Global MHFA</span> أو التواصل مع MHFA International بشأن المسار المناسب، مع إعادة فحص القائمة الرسمية عند كل استخدام.</p>
          <p><a href="https://mhfainternational.org/international-mental-health-first-aid-programs/" rel="noopener noreferrer">تحقق الآن من قائمة الشركاء الرسمية ←</a></p>
        </div>
      </section>

      <section aria-labelledby="official-routes">
        <div className="section-mini-heading"><div><span className="eyebrow">المسارات الرسمية</span><h2 id="official-routes">من أين تبدأ حسب هدفك؟</h2></div><span>روابط MHFA International فقط</span></div>
        <div className="institutional-sector-grid">
          {officialRoutes.map((route, index) => <a className="institutional-sector-card" href={route.href} rel="noopener noreferrer" key={route.href}>
            <span className="sector-number">{String(index + 1).padStart(2, '0')}</span>
            <h3>{route.title}</h3>
            <p>{route.summary}</p>
            <span className="sector-open">{route.action} ←</span>
          </a>)}
        </div>
      </section>

      <section aria-labelledby="global-mhfa-details">
        <div className="section-mini-heading"><div><span className="eyebrow">Global MHFA</span><h2 id="global-mhfa-details">المسار الأكثر صلة بالدول دون شريك مرخّص</h2></div><span>المصدر: MHFA International</span></div>
        <div className="taxonomy-root-grid">
          <article className="taxonomy-root-card"><h3>لمن؟</h3><p>للبالغين المقيمين في دول لا يوجد فيها شريك MHFA مرخّص، ويمكن تقديمه لمجموعات مجتمعية وأماكن عمل ومؤسسات تعليمية وصحية واجتماعية وجهات حكومية ومجموعات تطوعية.</p></article>
          <article className="taxonomy-root-card"><h3>المدة والشكل</h3><p>تذكر الصفحة الرسمية أنه برنامج لمدة يومين بإجمالي 12 ساعة، مع إمكان التقديم افتراضياً بقيادة مدرب أو حضورياً بحسب الموقع وتوافر المدرب.</p></article>
          <article className="taxonomy-root-card"><h3>ما الذي يتعلمه المشاركون؟</h3><p>التعرف إلى مؤشرات المشكلات النفسية، الاستجابة بثقة باستخدام خطة عمل مبنية على الدليل، تقديم دعم أولي ومعلومات واضحة، وتشجيع الوصول إلى مساعدة مهنية أو دعم إضافي.</p></article>
          <article className="taxonomy-root-card"><h3>لا معرفة مسبقة مطلوبة</h3><p>وفق الصفحة الرسمية، لا يشترط امتلاك معرفة سابقة بالصحة النفسية للمشاركة. التوافر الفعلي للحجز يعتمد على الموقع والمدربين، لذلك المرجع هو صفحة Global MHFA نفسها.</p></article>
        </div>
      </section>

      <section aria-labelledby="verify-provider">
        <div className="section-mini-heading"><div><span className="eyebrow">تحقق قبل التسجيل</span><h2 id="verify-provider">خمس خطوات لتجنب الدورات المضللة</h2></div><span>قاعدة عملية</span></div>
        <div className="institutional-sector-grid">
          {verificationSteps.map(([number, title, description]) => <article className="institutional-sector-card" key={number}>
            <span className="sector-number">{number}</span><h3>{title}</h3><p>{description}</p>
          </article>)}
        </div>
      </section>

      <section aria-labelledby="evidence">
        <div className="section-mini-heading"><div><span className="eyebrow">قاعدة الدليل</span><h2 id="evidence">ماذا تقول الدراسات عن أثر تدريب MHFA؟</h2></div><span>قراءة متوازنة</span></div>
        <div className="rawafid-empty">
          <p>مراجعة منهجية وتحليل تلوي منشور في <span lang="en">PLOS ONE</span> عام 2018 جمع <strong>18 دراسة مضبوطة و5,936 مشاركاً</strong>. وجد الباحثون تحسناً في معرفة الإسعافات الأولية للصحة النفسية، والتعرف إلى الاضطرابات، ومعرفة العلاجات، والثقة والنية في تقديم المساعدة، مع انخفاضات صغيرة في الوصمة. كانت التأثيرات عموماً صغيرة إلى متوسطة مباشرة بعد التدريب وحتى ستة أشهر.</p>
          <p>لكن يجب تفسير النتائج بدقة: التحسن في <strong>كمية</strong> المساعدة المقدمة كان صغيراً، بينما ظل أثر التدريب على <strong>جودة</strong> سلوك المساعدة أقل وضوحاً، وكانت النتائج على مدد أطول مثل 12 شهراً أكثر عدم يقين. لذلك لا ينبغي تحويل الدليل إلى ادعاء أن الدورة تمنع الأزمات أو تعالج الاضطرابات النفسية.</p>
          <p><a href="https://doi.org/10.1371/journal.pone.0197102" rel="noopener noreferrer">قراءة المراجعة المنهجية الأصلية ←</a></p>
        </div>
      </section>

      <section aria-labelledby="national-license">
        <div className="section-mini-heading"><div><span className="eyebrow">للمؤسسات</span><h2 id="national-license">ماذا يتطلب إنشاء برنامج MHFA وطني؟</h2></div><span>ليس طلب اعتماد بسيطاً</span></div>
        <div className="rawafid-empty">
          <p>توضح MHFA International أن الترخيص الوطني عملية مؤسسية طويلة قد تمتد تقريباً من <strong>18 شهراً إلى سنتين ونصف</strong>، وأن تكييف المنهج للغة والنظام الصحي والثقافة المحلية يستغرق عادةً <strong>12 شهراً على الأقل</strong>. كما تشير إلى تفضيل العمل مع جهة وطنية واحدة قادرة على التطوير والتوسع وإعادة استثمار العوائد لخدمة المجتمع.</p>
        </div>
        <div className="taxonomy-root-grid">
          {licensingCriteria.map((criterion, index) => <article className="taxonomy-root-card" key={criterion}>
            <h3>متطلب {index + 1}</h3><p>{criterion}</p>
          </article>)}
        </div>
        <p><a href="https://mhfainternational.org/license-mhfa/" rel="noopener noreferrer">راجع قائمة الأهلية الرسمية الكاملة قبل أي Expression of Interest ←</a></p>
      </section>

      <section aria-labelledby="rawafid-role">
        <div className="section-mini-heading"><div><span className="eyebrow">دور روافد</span><h2 id="rawafid-role">ما الذي نقوم به هنا — وما الذي لا نقوم به؟</h2></div><span>فصل الحقوق عن التثقيف</span></div>
        <div className="taxonomy-root-grid">
          <article className="taxonomy-root-card"><h3>نقوم به</h3><p>توجيه المستخدم العربي إلى المصادر الأصلية، شرح الفرق بين المسارات، دعم التحقق من المزود، وتحديث حالة الوصول عندما تتغير المصادر الرسمية.</p></article>
          <article className="taxonomy-root-card"><h3>لا نقوم به</h3><p>لا ننسخ كتيبات أو عروضاً أو اختبارات أو خطط عمل تدريبية محمية، ولا نعيد إنتاج منهج MHFA، ولا نستخدم الصفحة للادعاء بوجود اعتماد أو ترخيص أو شراكة.</p></article>
          <article className="taxonomy-root-card"><h3>لماذا هذا الفصل؟</h3><p>حتى يبقى القارئ قادراً على التمييز بين المعرفة العامة وبين التدريب الرسمي، وتظل حقوق صاحب البرنامج ونطاق الاعتماد واضحة وغير قابلة للالتباس.</p></article>
        </div>
      </section>

      <section aria-labelledby="mhfa-faq">
        <div className="section-mini-heading"><div><span className="eyebrow">أسئلة عملية</span><h2 id="mhfa-faq">أسئلة شائعة</h2></div><span>{faq.length} إجابات مباشرة</span></div>
        <div className="taxonomy-root-grid">
          {faq.map((item) => <article className="taxonomy-root-card" key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="mhfa-sources">
        <div className="section-mini-heading"><div><span className="eyebrow">المصادر</span><h2 id="mhfa-sources">المراجع المستخدمة في هذه الصفحة</h2></div><span>روابط أولية قابلة للتحقق</span></div>
        <div className="institutional-sector-grid">
          {sources.map(([title, href, note], index) => <a className="institutional-sector-card" href={href} rel="noopener noreferrer" key={href}>
            <span className="sector-number">{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{note}</p><span className="sector-open">فتح المصدر ←</span>
          </a>)}
        </div>
        <aside className="rawafid-empty" aria-label="ملاحظة التحديث">
          <h2>ملاحظة التحديث</h2>
          <p>تمت مراجعة حالة الروابط والمعلومات المؤسسية في 8 سبتمبر 2026. لأن قوائم الشركاء والبرامج والتوافر قد تتغير، فإن المصدر الرسمي في يوم الاستخدام يتقدم على أي ملخص ثابت في هذه الصفحة.</p>
        </aside>
      </section>
    </main>
    <SiteFooter />
  </>;
}
