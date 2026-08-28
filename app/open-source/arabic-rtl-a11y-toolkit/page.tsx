import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';

const REPOSITORY = 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit';
const PROJECT_PATH = '/open-source/arabic-rtl-a11y-toolkit';
const RELEASE = `${REPOSITORY}/releases/tag/v0.2.0`;
const AUDIT_DOC = `${REPOSITORY}/blob/main/docs/SOURCE-AUDIT.md`;
const POLICY_SCHEMA = `${REPOSITORY}/blob/main/schemas/rtl-audit-config.schema.json`;

export const metadata: Metadata = buildSeoMetadata({
  title: 'أداة عربية وRTL للوصولية والتوطين وCI | Rawafid RTL Toolkit',
  description: 'مشروع روافد المفتوح للعربية وRTL: مكتبة TypeScript ومحرك Source Audit للـbidi وCSS المنطقي وlang/dir والتوطين، مع SARIF وCI وسياسات قابلة للمراجعة واختبارات متصفح فعلية.',
  path: PROJECT_PATH,
  index: true,
  follow: true,
  keywords: [
    'Arabic RTL toolkit',
    'Arabic RTL source audit',
    'RTL CI audit',
    'Arabic accessibility testing',
    'RTL accessibility',
    'Arabic localization QA',
    'Unicode bidi audit',
    'bidirectional text security',
    'CSS logical properties RTL',
    'SARIF RTL',
    'RTL design system testing',
    'Arabic web accessibility CI',
    'internationalization testing',
    'أداة فحص RTL',
    'اختبار الوصولية العربية',
    'التوطين العربي',
    'فحص bidi',
    'البرمجيات مفتوحة المصدر',
  ],
  relatedTerms: ['WCAG 2.2', 'ISO/IEC 40500:2025', 'Unicode UAX #9', 'WAI-ARIA', 'ECMA-402', 'BCP 47', 'SARIF 2.1.0', 'CSS Logical Properties', 'TypeScript'],
  searchIntents: [
    'Arabic RTL open source toolkit',
    'Arabic RTL CI testing tool',
    'RTL source code audit SARIF',
    'Arabic accessibility TypeScript library',
    'bidirectional text audit tool',
    'RTL design system testing',
    'Arabic localization testing toolkit',
    'مكتبة برمجية للعربية RTL',
    'فحص مشاكل RTL في المواقع',
    'أداة وصولية وتوطين عربية مفتوحة المصدر',
  ],
});

const capabilities = [
  'اتجاه النص والواجهة وفق النص والـscript الفعلي بدل افتراضات اسم اللغة.',
  'عزل القيم المختلطة الاتجاه وكشف ضوابط bidi القديمة أو الخطرة في سياق العرض والمصدر.',
  'توحيد واختيار locale مع منع fallback صامت يعبر بين scripts مختلفة.',
  'تنسيق الأرقام والتواريخ والقوائم والنسب عبر Intl مع واجهات formatToParts منظمة.',
  'تحليل إدخال الأرقام المحلية مع أنظمة latn وarab وarabext والتحقق من grouping بدل افتراض نمط غربي واحد.',
  'تقسيم graphemes والكلمات والجمل بصورة تحترم حدود Unicode/Intl بدل قص UTF-16 الخام.',
  'نماذج تفاعل للتركيز وtypeahead والاختيار والشبكات تراعي الاتجاه RTL/LTR.',
  'أدوات CSS منطقية ووصولية واختبارات متصفح حقيقية لسيناريوهات عربية وثنائية الاتجاه.',
  'Source Audit يعمل دون شبكة لاكتشاف مخاطر lang/dir وbidi وCSS الفيزيائي وترتيب العرض قبل وصولها إلى الإنتاج.',
  'SARIF 2.1.0 وJSON وسياسات CI قابلة للمراجعة مع baseline تدريجي للمستودعات القديمة.',
];

const enterpriseProblems = [
  {
    title: 'الاختبار العام لا يرى كل مشاكل RTL',
    text: 'فحص WCAG الآلي مهم، لكنه لا يقرر وحده إن كان اتجاه القيمة المختلطة صحيحًا، أو إن كانت خصائص left/right ستنكسر عند التحويل، أو إن كان fallback عبر script غير مقصود.',
  },
  {
    title: 'Bidi قد يغيّر ما يراه المستخدم',
    text: 'البريد الإلكتروني والأرقام والإصدارات والمعرّفات داخل العربية قد تُعرض بترتيب مربك. المشروع يوفر isolation primitives وفحوصًا لضوابط Unicode bidi والمخاطر المرتبطة بها.',
  },
  {
    title: 'Design Systems تتسرب منها الافتراضات الفيزيائية',
    text: 'margin-left وright وtext-align:left وshorthands غير المتناظرة قد تبدو صحيحة في LTR وتفشل عند RTL. Source Audit يحول هذه الأنماط إلى نتائج قابلة للمراجعة.',
  },
  {
    title: 'التوطين أوسع من ترجمة النص',
    text: 'locale وscript والأرقام والتجميع والpluralization والتقطيع وتنسيق الأجزاء كلها حدود برمجية يمكن أن تفشل حتى عندما تكون الترجمة اللغوية نفسها صحيحة.',
  },
  {
    title: 'الترتيب المرئي ليس ترتيب القراءة دائمًا',
    text: 'row-reverse وorder قد يغيّران الصورة دون DOM أو ترتيب التركيز. الأداة ترفع هذه الحالات للمراجعة بدل افتراض أنها خطأ أو تجاهلها بالكامل.',
  },
  {
    title: 'المستودعات القديمة تحتاج انتقالًا واقعيًا',
    text: 'baseline محدود بالعدد وبصمات SHA-256 يسمح بتوثيق الدين القديم ومنع العيوب الجديدة فورًا، من دون منح استثناء غير محدود لنمط الخطأ نفسه.',
  },
];

const enterpriseTracks = [
  {
    title: 'Design Systems & UI Libraries',
    text: 'فحص primitives والمكونات والقواعد المنطقية والـRTL keyboard behavior، مع fixtures قابلة لإعادة الإنتاج يمكن تحويلها إلى regression tests داخل النظام التصميمي.',
  },
  {
    title: 'Accessibility & QA Teams',
    text: 'إضافة طبقة متخصصة للعربية وbidi فوق axe/browser/manual testing، مع نتائج SARIF قابلة للربط ببوابات الجودة الحالية بدل إنشاء نظام منفصل.',
  },
  {
    title: 'Localization & i18n Platforms',
    text: 'اختبار catalog parity وplaceholders وlocale fallback والأرقام والتقسيم وpseudo-localization، مع فصل واضح بين صحة البرمجيات والمراجعة اللغوية البشرية.',
  },
  {
    title: 'DevSecOps / AppSec',
    text: 'إشارات مصدر لضوابط bidi والـoverrides وzero-width/mixed-script diagnostics مع fail-closed policy وSARIF، دون ادعاء أنه بديل كامل لتحليل Unicode security.',
  },
  {
    title: 'Global Products & MENA Expansion',
    text: 'قاعدة framework-agnostic لتقليل تكلفة إدخال العربية وRTL في منتج قائم بدل إعادة حل المشكلات نفسها داخل كل فريق أو تطبيق.',
  },
  {
    title: 'Open-source Maintainers',
    text: 'حالات اختبار ومعايير ومشكلات قابلة للعزل يمكن استخدامها upstream لتحسين RTL في المكتبات العامة بدل بناء حلول مغلقة خاصة بروافد.',
  },
];

const evidence = [
  {
    title: 'Source Audit وCI',
    text: 'محرك فحص دون runtime dependencies، مع SARIF/JSON، سياسة versioned، baseline تدريجي وقواعد RTL/bidi/CSS قابلة للمراجعة.',
    href: AUDIT_DOC,
    label: 'قراءة عقد Source Audit',
  },
  {
    title: 'الإصدار العام v0.2.0',
    text: 'GitHub Release عام موثق، منفصل عن حالة نشر npm، ويوفر نقطة مرجعية ثابتة للمراجعين والجهات التقنية.',
    href: RELEASE,
    label: 'فتح الإصدار العام',
  },
  {
    title: 'الكود والترخيص',
    text: 'المستودع عام ومستقل عن المحتوى العلمي والتحريري لمنصة روافد، ويصدر بترخيص Apache-2.0.',
    href: REPOSITORY,
    label: 'فتح المستودع العام',
  },
  {
    title: 'سياسة قابلة للتحقق آليًا',
    text: 'JSON Schema منشور للسياسة، وتتحقق CI من تطابق كل Rule ID في المحرك مع الـschema حتى لا ينجرف العقد بصمت.',
    href: POLICY_SCHEMA,
    label: 'فتح Policy Schema',
  },
  {
    title: 'العقود والواجهات',
    text: 'توثيق للواجهات العامة، حدود الاستقرار، سلوك الاتجاه، Unicode، Intl، الوصولية والتفاعل.',
    href: `${REPOSITORY}/blob/main/docs/API-CONTRACT.md`,
    label: 'قراءة عقد API',
  },
  {
    title: 'الأمن وسلسلة التوريد',
    text: 'سياسة إبلاغ أمني، نموذج تهديد، CodeQL، Dependency Review، OpenSSF Scorecard، وتثبيت GitHub Actions على SHA كاملة.',
    href: `${REPOSITORY}/blob/main/SECURITY.md`,
    label: 'قراءة سياسة الأمن',
  },
  {
    title: 'التحقق في المتصفحات',
    text: 'اختبارات Playwright عبر Chromium وFirefox وWebKit والجوال، مع فحوص axe-core وحالات RTL/LTR واتجاهات مختلطة.',
    href: `${REPOSITORY}/blob/main/docs/TEST-MATRIX.md`,
    label: 'عرض مصفوفة الاختبار',
  },
  {
    title: 'التشغيل البيني',
    text: 'أدلة machine-readable وقائمة عمل شريك قابلة للتنفيذ بدل الاكتفاء بادعاءات وصفية.',
    href: `${REPOSITORY}/blob/main/docs/PARTNER-INTEROPERABILITY.md`,
    label: 'فحص أدلة التشغيل البيني',
  },
  {
    title: 'المساهمة والحوكمة',
    text: 'مسار علني للقضايا وPull Requests، مهام good first issue، متطلبات اختبار واضحة وحدود لما يجوز إدخاله إلى المستودع العام.',
    href: `${REPOSITORY}/blob/main/CONTRIBUTING.md`,
    label: 'قراءة دليل المساهمة',
  },
];

const adoptionSteps = [
  'تشغيل الفحص في وضع reporting-only للحصول على صورة أولية بلا كسر CI.',
  'مراجعة النتائج وفصل الأخطاء الحقيقية عن الحالات الفيزيائية المقصودة في المنتج.',
  'إنشاء baseline للدين التاريخي، ثم منع العيوب الجديدة عبر fail-on error أو warning.',
  'تقليص baseline تدريجيًا وربط النتائج بـSARIF/Code Scanning والاختبارات المرئية/الوصولية القائمة.',
];

const faqs = [
  {
    question: 'هل الأداة بديل عن axe أو فحوص WCAG؟',
    answer: 'لا. هي طبقة متخصصة للعربية وRTL وbidi والتوطين تكمل أدوات الوصولية العامة واختبارات المتصفح والمراجعة اليدوية، ولا تدعي إثبات المطابقة الكاملة لـWCAG.',
  },
  {
    question: 'هل نجاح الفحص يعني أن الموقع متوافق مع WCAG 2.2 أو ISO/IEC 40500:2025؟',
    answer: 'لا. المعايير تستخدم كمرجعية هندسية للقواعد ذات الصلة، لكن المطابقة القانونية أو المعيارية تحتاج نطاق تقييم أوسع واختبارات بشرية وتقنية بحسب المنتج.',
  },
  {
    question: 'هل يرسل Source Audit كود الشركة إلى خدمة خارجية؟',
    answer: 'لا في تصميمه الحالي. الفحص يعمل محليًا ودون طلبات شبكة، ولا ينفذ كود المشروع الذي يفحصه. تقارير baseline تحفظ بصمات وعدد الحالات بدل حفظ سطر المصدر.',
  },
  {
    question: 'هل يمكن إدخاله في مشروع قديم مليء بمشاكل RTL؟',
    answer: 'نعم. baseline المراجع يسمح بتوثيق الحالات القديمة ومنع الحالات الجديدة فورًا، ثم تقليل الدين تدريجيًا بدل اشتراط إصلاح المستودع كاملًا قبل بدء الحماية.',
  },
  {
    question: 'هل المشروع مرتبط بإطار مثل React أو Next.js؟',
    answer: 'النواة framework-agnostic ولا تضيف framework runtime dependencies. محرك المصدر يفحص صيغ ويب شائعة، بينما يبقى التطبيق المستهلك مسؤولًا عن lifecycle والدلالات الخاصة بإطاره.',
  },
  {
    question: 'كيف يمكن تجربة المشروع الآن؟',
    answer: 'المصدر وGitHub Release v0.2.0 وأدلة التحقق متاحة علنًا. نشر npm يبقى خطوة توزيع مستقلة ولا يُعرض على أنه مكتمل قبل التحقق من النشر الفعلي.',
  },
];

export default function OpenSourceToolkitPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'المصدر المفتوح', path: '/open-source' },
    { name: 'أداة العربية وRTL والوصولية', path: PROJECT_PATH },
  ]);

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    '@id': `${absoluteSiteUrl(PROJECT_PATH)}#software`,
    name: 'Rawafid Arabic/RTL Accessibility & Localization Toolkit',
    alternateName: 'أداة روافد المفتوحة للعربية وRTL والوصولية والتوطين',
    description: 'Framework-agnostic TypeScript toolkit and source-audit layer for Arabic/RTL, localization, Unicode bidi safety, accessibility, logical CSS and direction-aware web interaction.',
    url: absoluteSiteUrl(PROJECT_PATH),
    codeRepository: REPOSITORY,
    version: '0.2.0',
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'Web / Node.js >= 22',
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
    isAccessibleForFree: true,
    inLanguage: ['en', 'ar'],
    featureList: capabilities,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'منصة روافد',
      url: `${SITE_URL}/`,
    },
    maintainer: {
      '@type': 'Person',
      name: 'Khaled Altheeb',
      url: `${REPOSITORY}/commits?author=khaledaltheeb`,
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, softwareJsonLd, faqJsonLd]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/open-source">المصدر المفتوح</Link><span>/</span><span aria-current="page">أداة العربية وRTL</span></nav>

      <section className="public-index-hero" aria-labelledby="toolkit-title">
        <span className="eyebrow">Open-source engineering infrastructure · Apache-2.0 · v0.2.0</span>
        <h1 id="toolkit-title">طبقة هندسية للعربية وRTL تكتشف العيوب قبل أن تصل إلى الإنتاج</h1>
        <p>ليست مكتبة لقلب الواجهة من اليمين إلى اليسار فقط. المشروع يجمع primitives للعربية وUnicode وIntl والوصولية مع <strong>Source Audit قابل للإدخال في CI</strong> لاكتشاف فئات من أخطاء bidi وlang/dir وCSS الفيزيائي وترتيب العرض والتوطين التي قد تبقى خارج نطاق الفحوص العامة.</p>
        <p lang="en" dir="ltr"><strong>Rawafid Arabic/RTL Accessibility &amp; Localization Toolkit</strong> is an open-source engineering layer for teams shipping Arabic and bidirectional products: framework-agnostic primitives, real-browser evidence, and a zero-runtime-dependency source audit with SARIF and reviewable CI policy.</p>
        <div className="public-stat-strip">
          <span>18 source-audit rules</span>
          <span>SARIF 2.1.0</span>
          <span>0 runtime dependencies</span>
          <span>Node 22 · 24 · 26</span>
          <span>Chromium · Firefox · WebKit · Mobile</span>
        </div>
        <div className="hero-actions">
          <a className="primary-link" href={REPOSITORY} target="_blank" rel="noreferrer">GitHub — المصدر والكود ↗</a>
          <a className="secondary-link" href={AUDIT_DOC} target="_blank" rel="noreferrer">Source Audit وCI ↗</a>
          <a className="secondary-link" href={RELEASE} target="_blank" rel="noreferrer">الإصدار v0.2.0 ↗</a>
        </div>
      </section>

      <section aria-labelledby="problem-title">
        <div className="section-mini-heading"><div><span className="eyebrow">The engineering gap</span><h2 id="problem-title">المشكلات التي نحاول إغلاقها للشركات والمنتجات العالمية</h2></div><span>RTL ليس translation switch، والوصولية ليست scanner واحدًا.</span></div>
        <div className="institutional-sector-grid">
          {enterpriseProblems.map((item) => <article className="institutional-sector-card" key={item.title}><span className="eyebrow">مشكلة إنتاجية</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="audit-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Source Audit for CI</span><h2 id="audit-title">من دليل إرشادي إلى بوابة تمنع العيب الجديد</h2></div><span>Offline · deterministic · policy-driven · no source execution</span></div>
        <div className="content-card">
          <p>يمكن للفريق تشغيل الفحص في وضع تقارير فقط، ثم اعتماد policy موحدة داخل المستودع، وإنشاء baseline محدود للحالات التاريخية، ورفع SARIF إلى نظام code scanning. الأخطاء في ملف السياسة نفسها تفشل بصورة صريحة بدل أن تُضعف الحماية بصمت.</p>
          <pre dir="ltr"><code>{`rawafid-rtl-audit --config rawafid-rtl-audit.json
rawafid-rtl-audit --config rawafid-rtl-audit.json --format sarif --out rawafid-rtl.sarif`}</code></pre>
          <ul>
            <li>سياسة JSON ذات schemaVersion وقواعد يمكن ضبطها إلى off / note / warning / error.</li>
            <li>نتائج SARIF 2.1.0 ببصمات مستقرة نسبيًا لتسهيل تتبع finding عبر تحرك الأسطر.</li>
            <li>baseline يحتفظ بـSHA-256 fingerprint والعدد، ولا يحفظ سطر المصدر داخل ملف الاستثناء.</li>
            <li>الـbaseline لا يعطي استثناءً غير محدود: نسخة جديدة إضافية من العيب نفسه تبقى finding نشطة.</li>
            <li>لا توجد runtime dependencies ولا اتصالات شبكة أثناء المسح، ولا يتم تنفيذ كود المشروع المفحوص.</li>
          </ul>
          <div className="hero-actions">
            <a className="primary-link" href={AUDIT_DOC} target="_blank" rel="noreferrer">وثائق Source Audit ↗</a>
            <a className="secondary-link" href={POLICY_SCHEMA} target="_blank" rel="noreferrer">JSON Policy Schema ↗</a>
          </div>
        </div>
      </section>

      <section aria-labelledby="tracks-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Adoption tracks</span><h2 id="tracks-title">أين يمكن أن يزيل المشروع تكلفة حقيقية؟</h2></div><span>مسارات تكامل قابلة للعزل بدل عرض عام مبهم.</span></div>
        <div className="institutional-sector-grid">
          {enterpriseTracks.map((item) => <article className="institutional-sector-card" key={item.title}><span className="eyebrow">مسار استخدام</span><h3 dir="auto">{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="adoption-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Brownfield-ready</span><h2 id="adoption-title">إدخال تدريجي دون مطالبة المؤسسة بإصلاح كل شيء أولًا</h2></div><span>Prevent new debt first, then reduce old debt.</span></div>
        <div className="content-card">
          <ol>{adoptionSteps.map((item) => <li key={item}>{item}</li>)}</ol>
          <p>هذا المسار يجعل تجربة المشروع قابلة للعكس: يمكن تشغيله reporting-only، مراجعة القيمة والـfalse positives على كود حقيقي، ثم اتخاذ قرار enforcement بناءً على دليل داخل بيئة الفريق نفسه.</p>
        </div>
      </section>

      <section aria-labelledby="capabilities-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Capability map</span><h2 id="capabilities-title">طبقة واحدة تغطي اتجاه النص والتوطين والتفاعل والتحقق</h2></div><span>العربية ليست مجرد قلب واجهة من اليمين إلى اليسار.</span></div>
        <div className="content-card"><ul>{capabilities.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <section aria-labelledby="boundary-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Clear boundaries</span><h2 id="boundary-title">لماذا يمكن لمراجع خارجي الوثوق بما ندعيه؟</h2></div><span>الحدود جزء من المنتج وليست هامشًا قانونيًا.</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><span className="eyebrow">داخل المستودع</span><h3>هندسة عامة قابلة لإعادة الاستخدام</h3><p>كود وأدوات واختبارات عامة للعربية وRTL والتوطين والوصولية وUnicode والتفاعل، مع وثائق وعقود قابلة للمراجعة الخارجية.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">خارج المستودع</span><h3>لا يحتوي corpus روافد العلمي أو بيانات المستخدمين</h3><p>لا يتضمن مقالات الموسوعة، بيانات المستخدمين، أسرار الإنتاج، أو منطق النشر والترتيب الخاص بالمنصة.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">Non-claim</span><h3>لا نبيع شهادة امتثال آلية</h3><p>نجاح الأداة لا يساوي وحده WCAG أو EN 301 549 أو EAA compliance ولا يثبت الصحة اللغوية. نعرض ما يتم اختباره فعليًا وما يبقى مسؤولية المنتج.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">التوزيع الحالي</span><h3>GitHub Release متاح؛ npm منفصل</h3><p>المصدر وGitHub Release v0.2.0 وأدلة التحقق متاحة علنًا. لا نعرض npm على أنه منشور قبل اكتمال bootstrap والتحقق من السجل فعليًا.</p></article>
        </div>
      </section>

      <section aria-labelledby="evidence-title">
        <div className="section-mini-heading"><div><span className="eyebrow">One-minute due diligence</span><h2 id="evidence-title">لا تطلب منا تصديق وصف تسويقي — افحص الدليل</h2></div><span>روابط مباشرة إلى العقود والاختبارات والإصدار والسياسات.</span></div>
        <div className="institutional-sector-grid">
          {evidence.map((item) => <a className="institutional-sector-card" href={item.href} target="_blank" rel="noreferrer" key={item.title}>
            <span className="eyebrow">دليل عام</span><h3>{item.title}</h3><p>{item.text}</p><span className="sector-open">{item.label} ↗</span>
          </a>)}
        </div>
      </section>

      <section aria-labelledby="standards-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Standards-backed</span><h2 id="standards-title">مرجعية معايير عالمية، مع حدود ادعاء دقيقة</h2></div><span>Standards-informed ≠ automatic certification.</span></div>
        <div className="content-card">
          <p>يعتمد المشروع على W3C WCAG 2.2 — المعتمد أيضًا كـISO/IEC 40500:2025 — وعلى WAI-ARIA Authoring Practices وW3C Internationalization، وUnicode Bidirectional Algorithm (UAX #9)، وBCP 47 وواجهات ECMA-402 / <code>Intl</code> وCSS Logical Properties.</p>
          <p>هذه المراجع تحدد خطًا هندسيًا وقواعد قابلة للاختبار، لكنها لا تجعل كل واجهة تستخدم المكتبة متوافقة تلقائيًا مع معيار أو قانون. التطبيق المستهلك يبقى مسؤولًا عن الدلالات والسياق والاختبار اليدوي والتقنيات المساعدة والمراجعة اللغوية المناسبة.</p>
          <div className="hero-actions">
            <a href={`${REPOSITORY}/blob/main/docs/STANDARDS.md`} target="_blank" rel="noreferrer">خريطة المعايير والحدود ↗</a>
            <a href="https://www.w3.org/International/questions/qa-html-dir.en.html" target="_blank" rel="noreferrer">W3C: RTL وlogical properties ↗</a>
            <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noreferrer">W3C: WCAG 2 ↗</a>
          </div>
        </div>
      </section>

      <section aria-labelledby="partner-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Low-friction evaluation</span><h2 id="partner-title">ما الذي يجعل تجربة المشروع منخفضة المخاطر للجهة؟</h2></div><span>ابدأ بالدليل داخل بيئتك، لا بالالتزام.</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><span className="eyebrow">1 · Inspect</span><h3>كل شيء أساسي قابل للمراجعة</h3><p>الكود، الترخيص، القواعد، schema، الاختبارات، CI، التهديدات والحدود منشورة. يمكن للفريق تقييمها قبل إدخال أي أداة إلى pipeline.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">2 · Run locally</span><h3>الفحص لا يحتاج إرسال المصدر لنا</h3><p>يمكن تشغيل Source Audit داخل بيئة المؤسسة ودون شبكة؛ القيمة يمكن قياسها على كود حقيقي من دون منح روافد وصولًا إلى المستودع.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">3 · Integrate incrementally</span><h3>لا حاجة لكسر المشروع القديم</h3><p>reporting-only ثم baseline ثم enforcement. المؤسسة تختار شدة كل قاعدة وتستطيع تعطيل الحالة التي ثبت أنها مقصودة.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">4 · Upstream-friendly</span><h3>لا lock-in إلى إطار أو خدمة مغلقة</h3><p>Apache-2.0، zero runtime dependencies، عقود machine-readable، وتنسيقات قياسية مثل SARIF تجعل الاستفادة ممكنة حتى لو لم تستخدم الجهة بقية منصة روافد.</p></article>
        </div>
      </section>

      <section aria-labelledby="faq-title">
        <div className="section-mini-heading"><div><span className="eyebrow">FAQ</span><h2 id="faq-title">أسئلة المراجعة التقنية قبل التبني</h2></div></div>
        <div className="institutional-sector-grid">
          {faqs.map((item) => <article className="institutional-sector-card" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="contribute-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Open collaboration</span><h2 id="contribute-title">للمساهمين والمراجعين وفرق المنصات</h2></div><span>نبحث عن أدلة ومساهمات قابلة لإعادة الإنتاج، لا عن أرقام شكلية.</span></div>
        <div className="institutional-sector-grid">
          <a className="institutional-sector-card" href={`${REPOSITORY}/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22`} target="_blank" rel="noreferrer"><span className="eyebrow">ابدأ بمهمة محددة</span><h3>Good first issues</h3><p>مهام ذات حدود قبول واضحة لا تتطلب الوصول إلى سياق خاص بروافد.</p><span className="sector-open">عرض المهام ↗</span></a>
          <a className="institutional-sector-card" href={`${REPOSITORY}/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22help%20wanted%22`} target="_blank" rel="noreferrer"><span className="eyebrow">خبرة خارجية</span><h3>Help wanted</h3><p>مسارات نحتاج فيها أدلة متصفح أو وصولية أو i18n أو معايير أو تشغيل بيني من مراجعين مستقلين.</p><span className="sector-open">عرض المسارات ↗</span></a>
          <a className="institutional-sector-card" href={`${REPOSITORY}/blob/main/SECURITY.md`} target="_blank" rel="noreferrer"><span className="eyebrow">بلاغ حساس</span><h3>الأمن</h3><p>لا تنشر exploit details في Issue عام. اتبع مسار الإبلاغ الخاص المنشور في سياسة الأمن.</p><span className="sector-open">سياسة الإبلاغ ↗</span></a>
        </div>
      </section>

      <section aria-labelledby="contact-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Technical & institutional contact</span><h2 id="contact-title">اختبار تكامل، مراجعة تقنية، أو مساهمة upstream</h2></div></div>
        <div className="content-card">
          <p>للفرق التي تريد تقييم المشروع على design system أو مسار localization أو CI حقيقي، يمكن بدء النقاش من مشكلة محددة قابلة لإعادة الإنتاج بدل عرض شراكة عام. للتواصل المؤسسي أو التقني: <a href="mailto:contact@healthrenewal.org">contact@healthrenewal.org</a>.</p>
          <p>لا تُعرض أي جهة على أنها شريك أو داعم أو جهة مراجعة إلا بعد وجود أساس مكتوب لذلك.</p>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
