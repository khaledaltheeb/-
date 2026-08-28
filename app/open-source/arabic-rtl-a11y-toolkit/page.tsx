import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';

const REPOSITORY = 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit';
const PROJECT_PATH = '/open-source/arabic-rtl-a11y-toolkit';
const AUDIT_DOC = `${REPOSITORY}/blob/main/docs/SOURCE-AUDIT.md`;
const ACTION_DOC = `${REPOSITORY}/blob/main/docs/GITHUB-ACTION.md`;
const EVALUATION_DOC = `${REPOSITORY}/blob/main/docs/ENTERPRISE-EVALUATION.md`;
const EVALUATION_PLAN = `${REPOSITORY}/blob/main/enterprise/evaluation-plan.json`;
const POLICY_SCHEMA = `${REPOSITORY}/blob/main/schemas/rtl-audit-config.schema.json`;
const RELEASE = `${REPOSITORY}/releases/tag/v0.2.0`;

export const metadata: Metadata = buildSeoMetadata({
  title: 'Arabic RTL Source Audit وAccessibility CI | أداة روافد المفتوحة',
  description: 'طبقة هندسية مفتوحة للعربية وRTL وUnicode bidi والتوطين والوصولية: Source Audit دون runtime dependencies، GitHub Action، SARIF، سياسات CI، اختبارات متصفح وحزمة تقييم مؤسسي قابلة للقياس.',
  path: PROJECT_PATH,
  index: true,
  follow: true,
  keywords: [
    'Arabic RTL source audit',
    'Arabic RTL toolkit',
    'RTL CI testing',
    'Arabic accessibility testing',
    'Unicode bidi audit',
    'bidirectional text testing',
    'RTL design system testing',
    'Arabic localization QA',
    'CSS logical properties audit',
    'SARIF RTL',
    'GitHub Action RTL',
    'Arabic web accessibility',
    'internationalization testing',
    'فحص RTL',
    'اختبار المواقع العربية',
    'الوصولية العربية',
    'فحص bidi',
    'التوطين العربي',
  ],
  relatedTerms: ['WCAG 2.2', 'ISO/IEC 40500:2025', 'Unicode UAX #9', 'WAI-ARIA', 'ECMA-402', 'BCP 47', 'SARIF 2.1.0', 'CSS Logical Properties', 'TypeScript'],
  searchIntents: [
    'Arabic RTL testing tool for CI',
    'Arabic RTL source code audit',
    'RTL accessibility testing GitHub Action',
    'Unicode bidi source scanner',
    'Arabic design system RTL testing',
    'Arabic localization QA toolkit',
    'مكتبة برمجية للعربية RTL',
    'فحص مشاكل RTL في الموقع',
    'أداة وصولية عربية مفتوحة المصدر',
  ],
});

const problems = [
  {
    title: 'الاختبار العام لا يرى كل عيوب RTL',
    text: 'قد يمر المكوّن من فحص وصولية عام بينما يبقى فيه افتراض left/right، اتجاه قيمة مختلطة غير معزول، أو fallback عبر script لم يقصده الفريق.',
  },
  {
    title: 'Bidi يغيّر العرض من دون تغيير البيانات',
    text: 'البريد الإلكتروني والأرقام والإصدارات والمعرّفات داخل العربية قد تظهر بترتيب مربك. المشروع يوفّر primitives للعزل وفحوصًا لضوابط Unicode bidi ومخاطر العرض.',
  },
  {
    title: 'Design Systems تسرّب افتراضات فيزيائية',
    text: 'خصائص margin-left وright وtext-align:left وshorthands غير المتناظرة قد تبدو سليمة في LTR ثم تفشل عند RTL أو عند إعادة استخدام المكوّن عالميًا.',
  },
  {
    title: 'التوطين ليس ترجمة نصوص فقط',
    text: 'locale وscript والأرقام والتجميع وpluralization والتقطيع وformatToParts وحدود fallback كلها سلوكيات برمجية يمكن أن تفشل حتى عندما تكون الترجمة اللغوية صحيحة.',
  },
  {
    title: 'الترتيب المرئي قد يختلف عن القراءة والتركيز',
    text: 'Flexbox reverse وorder تستطيع تغيير الصورة من دون تغيير DOM. الأداة ترفع الحالات للمراجعة ولا تفترض تلقائيًا أنها خطأ أو أنها آمنة.',
  },
  {
    title: 'المستودعات القديمة تحتاج انتقالًا واقعيًا',
    text: 'baseline محدود بالعدد وبصمة SHA-256 يسمح بتوثيق الدين القديم ومنع الحالات الجديدة، من دون تحويل الاستثناء التاريخي إلى إعفاء دائم للنمط نفسه.',
  },
];

const capabilities = [
  'اتجاه النص والواجهة وفق النص والـscript الفعلي بدل افتراض اللغة وحدها.',
  'Unicode bidi isolation وتشخيص controls وoverrides وisolate balance ومخاطر العرض المختارة.',
  'BCP 47 locale negotiation مع حماية حدود الـscript من fallback الصامت.',
  'Intl للأرقام والتواريخ والقوائم والنسب والأسماء وformatToParts بصورة قابلة للتركيب.',
  'تحليل إدخال الأرقام المحلية مع latn وarab وarabext والتحقق من grouping بدل افتراض نمط غربي واحد.',
  'Grapheme-safe slicing/truncation وتقسيم الكلمات والجمل عبر Intl.Segmenter.',
  'Typeahead واختيار وشبكات وroving focus وحركة لوحة مفاتيح تراعي RTL/LTR.',
  'CSS logical utilities واختبارات paired RTL/LTR ونوافذ ضيقة ومتصفحات متعددة.',
  'Source Audit يعمل محليًا ودون شبكة لاكتشاف lang/dir وbidi وCSS الفيزيائي ومخاطر ترتيب العرض.',
  'SARIF 2.1.0 وJSON وسياسة versioned وbaseline قابل للمراجعة للمؤسسات.',
  'First-party GitHub Action لتشغيل نفس المحرك دون انتظار نشر npm.',
  'Enterprise Evaluation Kit بأربعة pilots ومقاييس قرار بدل تقييم تسويقي غير قابل للقياس.',
];

const tracks = [
  {
    title: 'Design Systems & UI Libraries',
    text: 'فحص primitives والمكوّنات والقواعد المنطقية والـRTL keyboard behavior، مع fixtures ثابتة يمكن إدخالها في regression testing للنظام التصميمي.',
  },
  {
    title: 'Accessibility & QA',
    text: 'إضافة طبقة متخصصة بالعربية وbidi فوق axe والمتصفح والاختبار اليدوي، مع SARIF ونتائج يمكن دمجها في بوابات الجودة الموجودة بدل إنشاء منصة منفصلة.',
  },
  {
    title: 'Localization & i18n',
    text: 'فحص catalog structure وlocale fallback والأرقام والتقطيع وpseudo-localization مع فصل واضح بين صحة البنية البرمجية والمراجعة اللغوية البشرية.',
  },
  {
    title: 'DevSecOps / AppSec',
    text: 'إشارات مصدر لضوابط bidi والـoverrides ومخاطر العرض المختارة مع سياسة fail-closed وSARIF، من دون ادعاء أنه بديل كامل عن Unicode security tooling.',
  },
  {
    title: 'Global Products & MENA Expansion',
    text: 'طبقة framework-agnostic تقلل إعادة حل مشاكل العربية وRTL في كل فريق وتسمح بقياس الجاهزية قبل توسيع منتج قائم إلى أسواق عربية.',
  },
  {
    title: 'Open-source Maintainers',
    text: 'حالات اختبار وعقود قابلة لإعادة الإنتاج يمكن upstreaming ما يلزم منها إلى المكتبات العامة بدل إبقاء إصلاحات RTL محلية ومغلقة.',
  },
];

const evaluation = [
  {
    step: '01 · Inspect',
    title: 'افحص قبل أن تثق',
    text: 'الكود، الترخيص، القواعد، schema، التهديدات، اختبارات المتصفح، CI والـnon-claims كلها عامة وقابلة للمراجعة.',
  },
  {
    step: '02 · Run',
    title: 'شغّل داخل بيئتك',
    text: 'ابدأ reporting-only على مستودع حقيقي أو scope ممثل. Source Audit لا يحتاج إرسال المصدر إلى روافد ولا ينفذ كود المشروع المفحوص.',
  },
  {
    step: '03 · Measure',
    title: 'قس القيمة والضوضاء معًا',
    text: 'سجّل unique actionable findings وfalse positives والمقارنة مع أدواتك الحالية. العدد الكبير من النتائج ليس هدفًا بحد ذاته.',
  },
  {
    step: '04 · Adopt',
    title: 'شدّد فقط بناءً على الدليل',
    text: 'اعتمد policy وbaseline مراجعين، ثم ارفع threshold إلى warning أو error فقط عندما يكون ذلك مناسبًا لمنتجك.',
  },
];

const evidence = [
  { title: 'Source Audit contract', text: 'القواعد، CI exits، policy، baseline، SARIF وحدود الادعاء موثقة في عقد مستقل.', href: AUDIT_DOC, label: 'فتح Source Audit' },
  { title: 'First-party GitHub Action', text: 'تكامل JavaScript Action يستخدم Node 24 المُدار من GitHub ويُبقي scan/config/baseline/output داخل workspace.', href: ACTION_DOC, label: 'فتح دليل Action' },
  { title: 'Enterprise Evaluation Kit', text: 'أربعة مسارات pilot مع inputs وoutputs ومقاييس قرار وnon-claims لاختبار القيمة على منتج حقيقي.', href: EVALUATION_DOC, label: 'فتح حزمة التقييم' },
  { title: 'Machine-readable pilot plan', text: 'خطة تقييم JSON قابلة للاستهلاك الآلي، مرتبطة بـJSON Schema ويختبرها CI.', href: EVALUATION_PLAN, label: 'فتح evaluation-plan.json' },
  { title: 'Versioned policy schema', text: 'سياسة فحص ذات schemaVersion وقيم severity محددة، مع fail-closed عند Rule ID أو إعداد غير صالح.', href: POLICY_SCHEMA, label: 'فتح Policy Schema' },
  { title: 'Browser evidence', text: 'Playwright عبر Chromium وFirefox وWebKit والجوال، مع axe وحالات RTL/LTR واتجاهات مختلطة.', href: `${REPOSITORY}/blob/main/docs/TEST-MATRIX.md`, label: 'عرض Test Matrix' },
  { title: 'Security & supply chain', text: 'Threat model، Security policy، CodeQL، Dependency Review، OpenSSF Scorecard، SHA-pinned Actions وسياسات release/provenance.', href: `${REPOSITORY}/blob/main/SECURITY.md`, label: 'فتح Security Policy' },
  { title: 'OpenSSF OSPS mapping', text: 'خريطة evidence إلى OSPS Baseline مع التصريح بالفجوات التي لا تزال owner-level بدل ادعاء اكتمال غير مثبت.', href: `${REPOSITORY}/blob/main/docs/OSPS-BASELINE.md`, label: 'فتح OSPS map' },
  { title: 'Public release', text: 'GitHub Release v0.2.0 متاح كنقطة مرجعية عامة. التطوير الحالي على main أوسع منه؛ نشر npm يبقى خطوة منفصلة غير مدعاة.', href: RELEASE, label: 'فتح v0.2.0' },
];

const faqs = [
  {
    question: 'هل الأداة بديل عن axe أو فحوص WCAG؟',
    answer: 'لا. هي طبقة متخصصة بالعربية وRTL وbidi والتوطين تكمل الفحص العام واختبارات المتصفح والتقنيات المساعدة والمراجعة اليدوية.',
  },
  {
    question: 'هل نجاح الفحص يثبت WCAG أو ISO/IEC 40500:2025؟',
    answer: 'لا. المعايير مرجعية هندسية للقواعد ذات الصلة، لكن المطابقة الكاملة أو القانونية تحتاج نطاق تقييم أوسع بحسب المنتج والسياق.',
  },
  {
    question: 'هل يجب أن نرسل مستودعنا إلى روافد؟',
    answer: 'لا لتقييم Source Audit. التصميم الحالي يعمل محليًا ودون شبكة ولا ينفذ كود المشروع المفحوص. المؤسسة تستطيع الاحتفاظ بالمصدر والنتائج داخل بيئتها.',
  },
  {
    question: 'هل يمكن تجربتها قبل npm؟',
    answer: 'نعم. المصدر عام، ويمكن تشغيل CLI من checkout، ويوجد First-party GitHub Action يعمل مباشرة من مرجع Git مُثبت. لا نعرض npm على أنه منشور قبل تحقق فعلي من السجل.',
  },
  {
    question: 'كيف نتعامل مع مشروع قديم مليء بديون RTL؟',
    answer: 'ابدأ reporting-only، راجع النتائج، ثم أنشئ baseline محدودًا للحالات التاريخية. النسخة الإضافية الجديدة من finding مماثلة لا تحصل تلقائيًا على إعفاء غير محدود.',
  },
  {
    question: 'كيف نقرر إن كانت الأداة تستحق التبني؟',
    answer: 'استخدم Enterprise Evaluation Kit: اختبر scope ممثلًا، قس التغطية الإضافية والـfalse positives، ثم اتخذ قرار adopt/report-only/request changes/not adopt مع دليل قابل لإعادة الإنتاج.',
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
    description: 'Framework-agnostic TypeScript toolkit and source-audit layer for Arabic/RTL, Unicode bidi safety, localization, accessibility, logical CSS and direction-aware web interaction.',
    url: absoluteSiteUrl(PROJECT_PATH),
    codeRepository: REPOSITORY,
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'Web / Node.js >= 22',
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
    isAccessibleForFree: true,
    inLanguage: ['en', 'ar'],
    featureList: capabilities,
    isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'منصة روافد', url: `${SITE_URL}/` },
    maintainer: { '@type': 'Person', name: 'Khaled Altheeb', url: `${REPOSITORY}/commits?author=khaledaltheeb` },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, softwareJsonLd, faqJsonLd]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/open-source">المصدر المفتوح</Link><span>/</span><span aria-current="page">أداة العربية وRTL</span></nav>

      <section className="public-index-hero" aria-labelledby="toolkit-title">
        <span className="eyebrow">Open-source RTL engineering assurance · Apache-2.0</span>
        <h1 id="toolkit-title">طبقة هندسية للعربية وRTL تكشف العيوب قبل أن تصل إلى الإنتاج</h1>
        <p>المشكلة ليست «قلب الواجهة». المنتجات العالمية تحتاج ضبط اتجاه النص والقيم المختلطة وUnicode bidi وlocale/script وCSS المنطقي ولوحة المفاتيح والوصولية والتوطين، ثم تحتاج طريقة قابلة للقياس لمنع الانحدار داخل CI.</p>
        <p lang="en" dir="ltr"><strong>Rawafid Arabic/RTL Accessibility &amp; Localization Toolkit</strong> combines framework-agnostic primitives, real-browser evidence, an offline source audit, a first-party GitHub Action, SARIF, reviewable policy, and a reproducible enterprise evaluation kit.</p>
        <div className="public-stat-strip">
          <span>Apache-2.0</span>
          <span>0 runtime dependencies</span>
          <span>SARIF 2.1.0</span>
          <span>Node 22 · 24 · 26</span>
          <span>Chromium · Firefox · WebKit · Mobile</span>
        </div>
        <div className="hero-actions">
          <a className="primary-link" href={REPOSITORY} target="_blank" rel="noreferrer">افحص الكود على GitHub ↗</a>
          <a className="secondary-link" href={ACTION_DOC} target="_blank" rel="noreferrer">شغّل GitHub Action ↗</a>
          <a className="secondary-link" href={EVALUATION_DOC} target="_blank" rel="noreferrer">ابدأ تقييمًا مؤسسيًا ↗</a>
        </div>
      </section>

      <section aria-labelledby="gap-title">
        <div className="section-mini-heading"><div><span className="eyebrow">The engineering gap</span><h2 id="gap-title">المشكلات التي لا يكفي معها RTL switch أو scanner عام</h2></div><span>المعيار هو تقليل أخطاء الإنتاج، لا زيادة قائمة الميزات.</span></div>
        <div className="institutional-sector-grid">
          {problems.map((item) => <article className="institutional-sector-card" key={item.title}><span className="eyebrow">مشكلة فعلية</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="workflow-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Inspect → Run → Measure → Adopt</span><h2 id="workflow-title">تقييم قابل للعكس بدل طلب ثقة مسبقة</h2></div><span>لا تحتاج الجهة إلى شراكة أو إرسال المصدر كي تعرف إن كانت الأداة مفيدة.</span></div>
        <div className="institutional-sector-grid">
          {evaluation.map((item) => <article className="institutional-sector-card" key={item.step}><span className="eyebrow">{item.step}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
        <div className="content-card">
          <p><strong>حزمة التقييم المؤسسي</strong> لا تقيس النجاح بعدد findings الخام. تقيس التغطية الإضافية القابلة للتنفيذ، false positives، قابلية إعادة الإنتاج، ومدى صلاحية القاعدة لأن تبقى advisory أو تصبح blocking داخل بيئة الجهة.</p>
          <div className="hero-actions"><a className="primary-link" href={EVALUATION_DOC} target="_blank" rel="noreferrer">دليل التقييم ↗</a><a className="secondary-link" href={EVALUATION_PLAN} target="_blank" rel="noreferrer">الخطة machine-readable ↗</a></div>
        </div>
      </section>

      <section aria-labelledby="ci-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Source Audit + CI</span><h2 id="ci-title">من توصيات RTL إلى بوابة تمنع العيب الجديد</h2></div><span>Offline · deterministic · policy-driven · no audited-source execution</span></div>
        <div className="content-card">
          <p>محرك <code>rawafid-rtl-audit</code> يفحص فئات مختارة من أخطاء bidi وlang/dir وCSS الفيزيائي والشورت هاند وترتيب العرض. يمكنه إخراج JSON أو SARIF 2.1.0، واستخدام policy versioned، وإدخال brownfield baseline دون إخفاء نسخة جديدة إضافية من العيب نفسه.</p>
          <pre dir="ltr"><code>{`rawafid-rtl-audit --config rawafid-rtl-audit.json
rawafid-rtl-audit --config rawafid-rtl-audit.json --format sarif --out rawafid-rtl.sarif`}</code></pre>
          <ul>
            <li>السياسة تفشل fail-closed عند Rule ID أو إعداد غير معروف بدل تجاهله بصمت.</li>
            <li>baseline يخزن بصمات SHA-256 وعدد الحالات بدل تخزين أسطر المصدر.</li>
            <li>GitHub Action تستخدم نفس المحرك وتُبقي scan/config/baseline/SARIF داخل workspace.</li>
            <li>يمكن البدء بـreporting-only ثم رفع threshold بعد مراجعة النتائج.</li>
          </ul>
          <div className="hero-actions"><a className="primary-link" href={ACTION_DOC} target="_blank" rel="noreferrer">GitHub Action ↗</a><a className="secondary-link" href={AUDIT_DOC} target="_blank" rel="noreferrer">Source Audit contract ↗</a><a className="secondary-link" href={POLICY_SCHEMA} target="_blank" rel="noreferrer">Policy Schema ↗</a></div>
        </div>
      </section>

      <section aria-labelledby="dogfood-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Dogfooded in Rawafid</span><h2 id="dogfood-title">نستخدم طبقة الفحص على كود روافد نفسه</h2></div><span>الأداة تُختبر كمستهلك خارجي، لا داخل fixtures فقط.</span></div>
        <div className="content-card">
          <p>شغّلنا GitHub Action على نطاقات الإنتاج <code>app</code> و<code>components</code> و<code>lib</code>. أول تشغيل كشف ضوضاء فعلية في قاعدة utility classes؛ تم إصلاح السبب في toolkit وإضافة regression test، ثم أُعيد الفحص. هذه الحلقة مقصودة: أي قاعدة لا تتحمل كودًا إنتاجيًا كبيرًا لا ينبغي تقديمها للشركات كقاعدة blocking.</p>
          <p>سياسة روافد تبدأ بمنع <strong>الأخطاء عالية الثقة</strong> فقط، وتُبقي التحذيرات والملاحظات مرئية للمراجعة بدل إخفائها بbaseline جماعي. الهدف رفع الدقة أولًا ثم تشديد السياسة بناءً على evidence.</p>
        </div>
      </section>

      <section aria-labelledby="tracks-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Adoption tracks</span><h2 id="tracks-title">أين يمكن أن يزيل المشروع تكلفة هندسية حقيقية؟</h2></div><span>اختر المشكلة الفعلية، لا «شراكة عامة» غير محددة.</span></div>
        <div className="institutional-sector-grid">
          {tracks.map((item) => <article className="institutional-sector-card" key={item.title}><span className="eyebrow">مسار استخدام</span><h3 dir="auto">{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="capabilities-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Capability map</span><h2 id="capabilities-title">سطح هندسي متكامل بدل حلول RTL متناثرة</h2></div><span>Core primitives + verification + source assurance.</span></div>
        <div className="content-card"><ul>{capabilities.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <section aria-labelledby="evidence-title">
        <div className="section-mini-heading"><div><span className="eyebrow">One-minute due diligence</span><h2 id="evidence-title">لا تعتمد على الوصف — افتح الدليل مباشرة</h2></div><span>كل رابط أدناه يقود إلى artifact أو عقد يمكن مراجعته.</span></div>
        <div className="institutional-sector-grid">
          {evidence.map((item) => <a className="institutional-sector-card" href={item.href} target="_blank" rel="noreferrer" key={item.title}><span className="eyebrow">دليل عام</span><h3>{item.title}</h3><p>{item.text}</p><span className="sector-open">{item.label} ↗</span></a>)}
        </div>
      </section>

      <section aria-labelledby="boundary-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Clear boundaries</span><h2 id="boundary-title">الثقة تبدأ من معرفة ما لا تدعيه الأداة</h2></div><span>Standards-informed لا تعني certification تلقائية.</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><span className="eyebrow">Accessibility</span><h3>ليست شهادة WCAG</h3><p>نجاح الفحص لا يثبت وحده WCAG 2.2 أو ISO/IEC 40500:2025 أو EN 301 549 أو EAA. يلزم تقييم أوسع وفق المنتج والسياق.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">Unicode security</span><h3>ليست UTS #39 كاملة</h3><p>المشروع يوفّر display-risk وbidi signals محددة، ولا يدعي complete confusable detection أو identifier profiles أو Trojan Source analysis كاملًا.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">Localization</span><h3>لا يستبدل المراجع اللغوي</h3><p>يمكنه فحص البنية وruntime locale invariants، لكنه لا يثبت جودة الصياغة أو الملاءمة الثقافية أو صحة المصطلح المتخصص.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">Distribution</span><h3>لا ندعي npm قبل النشر</h3><p>الكود وGitHub Action وGitHub Release متاحة. npm Trusted Publishing/bootstrap خطوة منفصلة ولا تُعرض هنا كمنجزة قبل تحقق السجل.</p></article>
        </div>
      </section>

      <section aria-labelledby="standards-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Standards-backed</span><h2 id="standards-title">مرجعية هندسية عالمية مع claim discipline</h2></div><span>القواعد أضيق من المعايير التي تستند إليها.</span></div>
        <div className="content-card">
          <p>يعتمد المشروع على WCAG 2.2، WAI-ARIA Authoring Practices، W3C Internationalization، Unicode Bidirectional Algorithm (UAX #9)، BCP 47، ECMA-402 / <code>Intl</code>، CSS Logical Properties وSARIF حيث تنطبق. توجد خريطة OpenSSF OSPS للأدلة الأمنية وسلسلة التوريد، مع إبقاء المتطلبات غير المثبتة كفجوات صريحة.</p>
          <div className="hero-actions"><a href={`${REPOSITORY}/blob/main/docs/STANDARDS.md`} target="_blank" rel="noreferrer">خريطة المعايير ↗</a><a href={`${REPOSITORY}/blob/main/docs/OSPS-BASELINE.md`} target="_blank" rel="noreferrer">OpenSSF OSPS evidence ↗</a></div>
        </div>
      </section>

      <section aria-labelledby="faq-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Technical review FAQ</span><h2 id="faq-title">أسئلة يجب أن يطرحها أي فريق قبل التبني</h2></div></div>
        <div className="institutional-sector-grid">{faqs.map((item) => <article className="institutional-sector-card" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div>
      </section>

      <section aria-labelledby="contact-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Technical evaluation</span><h2 id="contact-title">ابدأ بمشكلة قابلة لإعادة الإنتاج، لا بعرض عام</h2></div></div>
        <div className="content-card">
          <p>يمكن لأي فريق بدء التقييم ذاتيًا من GitHub Action أو Enterprise Evaluation Kit. إذا ظهرت حالة RTL/bidi/i18n حقيقية لا يغطيها المشروع، فالأفضل فتح Issue قابل لإعادة الإنتاج أو التواصل تقنيًا عبر <a href="mailto:contact@healthrenewal.org">contact@healthrenewal.org</a>.</p>
          <p>لا تُعرض أي جهة على أنها شريك أو داعم أو جهة مراجعة إلا بعد وجود أساس مكتوب لذلك.</p>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
