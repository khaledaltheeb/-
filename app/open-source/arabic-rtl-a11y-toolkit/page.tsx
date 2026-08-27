import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';

const REPOSITORY = 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit';
const PROJECT_PATH = '/open-source/arabic-rtl-a11y-toolkit';

export const metadata: Metadata = buildSeoMetadata({
  title: 'أداة روافد المفتوحة للعربية وRTL والوصولية',
  description: 'المصدر الرسمي لأداة روافد المفتوحة للعربية وواجهات RTL والوصولية والتوطين: نطاق المشروع، الكود العام، الاختبارات، الأمن، المساهمة وأدلة التشغيل البيني.',
  path: PROJECT_PATH,
  index: true,
  follow: true,
  keywords: [
    'Arabic RTL toolkit',
    'Arabic accessibility',
    'RTL accessibility',
    'Arabic localization',
    'internationalization',
    'bidi Unicode',
    'أدوات RTL',
    'الوصولية العربية',
    'التوطين العربي',
    'البرمجيات مفتوحة المصدر',
  ],
  relatedTerms: ['WCAG 2.2', 'Unicode bidi', 'WAI-ARIA', 'ECMA-402', 'BCP 47', 'TypeScript'],
  searchIntents: [
    'Arabic RTL open source toolkit',
    'Arabic accessibility TypeScript library',
    'RTL localization testing toolkit',
    'مكتبة برمجية للعربية RTL',
    'أداة وصولية وتوطين عربية مفتوحة المصدر',
  ],
});

const evidence = [
  {
    title: 'الكود والترخيص',
    text: 'المستودع عام ومستقل عن المحتوى العلمي والتحريري لمنصة روافد، ويصدر بترخيص Apache-2.0.',
    href: REPOSITORY,
    label: 'فتح المستودع العام',
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

const capabilities = [
  'اتجاه النص والواجهة وفق النص والـscript الفعلي بدل افتراضات اسم اللغة.',
  'عزل القيم المختلطة الاتجاه وكشف ضوابط bidi القديمة أو الخطرة في سياق العرض.',
  'توحيد واختيار locale مع منع fallback صامت يعبر بين scripts مختلفة.',
  'تنسيق الأرقام والتواريخ والقوائم والنسب عبر Intl مع واجهات formatToParts منظمة.',
  'تقسيم graphemes والكلمات والجمل بصورة تحترم حدود Unicode/Intl بدل قص UTF-16 الخام.',
  'نماذج تفاعل للتركيز وtypeahead والاختيار والشبكات تراعي الاتجاه RTL/LTR.',
  'أدوات CSS منطقية ووصولية واختبارات متصفح حقيقية لسيناريوهات عربية وثنائية الاتجاه.',
];

export default function OpenSourceToolkitPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'المصدر المفتوح', path: PROJECT_PATH },
    { name: 'أداة العربية وRTL والوصولية', path: PROJECT_PATH },
  ]);

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    '@id': `${absoluteSiteUrl(PROJECT_PATH)}#software`,
    name: 'Rawafid Arabic/RTL Accessibility & Localization Toolkit',
    alternateName: 'أداة روافد المفتوحة للعربية وRTL والوصولية والتوطين',
    description: 'Framework-agnostic TypeScript toolkit for Arabic/RTL, localization, Unicode bidi safety, accessibility and direction-aware web interaction.',
    url: absoluteSiteUrl(PROJECT_PATH),
    codeRepository: REPOSITORY,
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'Web / Node.js',
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
    isAccessibleForFree: true,
    inLanguage: ['en', 'ar'],
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

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, softwareJsonLd]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span>المصدر المفتوح</span><span>/</span><span aria-current="page">أداة العربية وRTL</span></nav>

      <section className="public-index-hero" aria-labelledby="toolkit-title">
        <span className="eyebrow">مشروع برمجي عام مستقل · Apache-2.0</span>
        <h1 id="toolkit-title">أداة روافد المفتوحة للعربية وRTL والوصولية والتوطين</h1>
        <p>طبقة هندسية TypeScript عامة وقابلة لإعادة الاستخدام لبناء واختبار واجهات عربية وثنائية الاتجاه بصورة أدق: اتجاه النص والـlocale، Unicode bidi، التوطين، التقسيم الآمن للنص، أنماط التفاعل، CSS المنطقي، والوصولية في المتصفح.</p>
        <p lang="en" dir="ltr"><strong>Rawafid Arabic/RTL Accessibility &amp; Localization Toolkit</strong> is a framework-agnostic, zero-runtime-dependency open-source engineering component for Arabic and bidirectional web applications.</p>
        <div className="public-stat-strip">
          <span>Apache-2.0</span>
          <span>TypeScript</span>
          <span>0 runtime dependencies</span>
          <span>Chromium · Firefox · WebKit</span>
        </div>
        <div className="hero-actions">
          <a className="primary-link" href={REPOSITORY} target="_blank" rel="noreferrer">GitHub — المصدر والكود ↗</a>
          <a className="secondary-link" href={`${REPOSITORY}/blob/main/README.md`} target="_blank" rel="noreferrer">README والدليل التقني ↗</a>
        </div>
      </section>

      <section aria-labelledby="boundary-title">
        <div className="section-mini-heading"><div><span className="eyebrow">حدود واضحة</span><h2 id="boundary-title">ما هو المشروع — وما ليس هو</h2></div><span>فصل متعمد بين البرمجيات العامة ومحتوى منصة روافد.</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><span className="eyebrow">داخل المستودع</span><h3>هندسة عامة قابلة لإعادة الاستخدام</h3><p>كود وأدوات واختبارات عامة للعربية وRTL والتوطين والوصولية وUnicode والتفاعل، مع وثائق وعقود قابلة للمراجعة الخارجية.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">خارج المستودع</span><h3>لا يحتوي corpus روافد العلمي</h3><p>لا يتضمن مقالات الموسوعة، قواعد المحتوى العلمي، بيانات المستخدمين، التحليلات، أسرار الإنتاج، أو منطق النشر والترتيب الخاص بالمنصة.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">الوضع الحالي</span><h3>GitHub هو قناة التوزيع المؤكدة الآن</h3><p>المصدر والإصدارات وأدلة التحقق متاحة على GitHub. حزمة npm مخطط لها، لكن لا تُعرض هنا كحزمة منشورة إلى أن يكتمل bootstrap للسجل ويُتحقق منه فعليًا.</p></article>
        </div>
      </section>

      <section aria-labelledby="capabilities-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Capability map</span><h2 id="capabilities-title">المشكلات التي صُممت الأداة لمعالجتها</h2></div><span>العربية ليست مجرد قلب واجهة من اليمين إلى اليسار.</span></div>
        <div className="content-card"><ul>{capabilities.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <section aria-labelledby="evidence-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Due diligence</span><h2 id="evidence-title">أدلة يمكن فحصها مباشرة</h2></div><span>المراجعة لا تعتمد على وصف تسويقي.</span></div>
        <div className="institutional-sector-grid">
          {evidence.map((item) => <a className="institutional-sector-card" href={item.href} target="_blank" rel="noreferrer" key={item.title}>
            <span className="eyebrow">دليل عام</span><h3>{item.title}</h3><p>{item.text}</p><span className="sector-open">{item.label} ↗</span>
          </a>)}
        </div>
      </section>

      <section aria-labelledby="standards-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Standards-backed</span><h2 id="standards-title">مرجعية المعايير</h2></div><span>الالتزام بالمعايير لا يعني ادعاء مطابقة تلقائية.</span></div>
        <div className="content-card">
          <p>يعتمد المشروع على مفاهيم وإرشادات W3C WCAG 2.2 وWAI-ARIA Authoring Practices وW3C Internationalization، وعلى Unicode Bidirectional Algorithm ومبادئ أمان Unicode، وBCP 47 وواجهات ECMA-402 / <code>Intl</code> وCSS Logical Properties.</p>
          <p>هذه المراجع تحدد خطًا هندسيًا، لكنها لا تجعل كل واجهة تستخدم المكتبة متوافقة تلقائيًا مع WCAG ولا تثبت صحة لغوية لكل locale. التطبيق المستهلك يبقى مسؤولًا عن الدلالات والاختبار والسياق.</p>
          <a href={`${REPOSITORY}/blob/main/docs/STANDARDS.md`} target="_blank" rel="noreferrer">قراءة خريطة المعايير والحدود ↗</a>
        </div>
      </section>

      <section aria-labelledby="contribute-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Open collaboration</span><h2 id="contribute-title">للمساهمين والمراجعين</h2></div><span>نبحث عن أدلة ومساهمات قابلة لإعادة الإنتاج، لا عن أرقام شكلية.</span></div>
        <div className="institutional-sector-grid">
          <a className="institutional-sector-card" href={`${REPOSITORY}/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22`} target="_blank" rel="noreferrer"><span className="eyebrow">ابدأ بمهمة محددة</span><h3>Good first issues</h3><p>مهام ذات حدود قبول واضحة لا تتطلب الوصول إلى سياق خاص بروافد.</p><span className="sector-open">عرض المهام ↗</span></a>
          <a className="institutional-sector-card" href={`${REPOSITORY}/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22help%20wanted%22`} target="_blank" rel="noreferrer"><span className="eyebrow">خبرة خارجية</span><h3>Help wanted</h3><p>مسارات نحتاج فيها أدلة متصفح أو وصولية أو i18n أو معايير أو تشغيل بيني من مراجعين مستقلين.</p><span className="sector-open">عرض المسارات ↗</span></a>
          <a className="institutional-sector-card" href={`${REPOSITORY}/blob/main/SECURITY.md`} target="_blank" rel="noreferrer"><span className="eyebrow">بلاغ حساس</span><h3>الأمن</h3><p>لا تنشر exploit details في Issue عام. اتبع مسار الإبلاغ الخاص المنشور في سياسة الأمن.</p><span className="sector-open">سياسة الإبلاغ ↗</span></a>
        </div>
      </section>

      <section aria-labelledby="contact-title">
        <div className="section-mini-heading"><div><span className="eyebrow">التواصل التقني</span><h2 id="contact-title">مراجعة، تشغيل بيني، أو مساهمة upstream</h2></div></div>
        <div className="content-card"><p>للتواصل المؤسسي أو التقني حول المشروع المفتوح، استخدم <a href="mailto:contact@healthrenewal.org">contact@healthrenewal.org</a>. لا تُعرض أي جهة على أنها شريك أو داعم أو جهة مراجعة إلا بعد وجود أساس مكتوب لذلك.</p></div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
