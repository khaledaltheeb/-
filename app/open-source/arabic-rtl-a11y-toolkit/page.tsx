import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Arabic/RTL Accessibility & Localization Toolkit',
  description: 'الصفحة الرسمية على healthrenewal.org لأداة Health Renewal العامة للعربية وRTL والوصولية والتدويل والنص ثنائي الاتجاه، مع مستودع GitHub واختبارات توافق قابلة للمراجعة.',
  path: '/open-source/arabic-rtl-a11y-toolkit',
  index: true,
  follow: true,
  keywords: ['Arabic RTL toolkit', 'Arabic accessibility', 'RTL TypeScript', 'Arabic localization', 'bidi Unicode', 'WCAG Arabic'],
  relatedTerms: ['internationalization', 'localization', 'accessibility', 'bidirectional text', 'logical CSS'],
  searchIntents: ['Arabic RTL accessibility toolkit', 'TypeScript Arabic localization library', 'open source Arabic accessibility'],
});

const repoUrl = 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit';

export default function ToolkitPage() {
  const canonical = absoluteSiteUrl('/open-source/arabic-rtl-a11y-toolkit');
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'المصدر المفتوح', path: '/open-source' },
    { name: 'Arabic/RTL Toolkit', path: '/open-source/arabic-rtl-a11y-toolkit' },
  ]);
  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    '@id': `${canonical}#software`,
    name: 'Health Renewal Arabic/RTL Accessibility & Localization Toolkit',
    alternateName: 'Rawafid Arabic/RTL Accessibility & Localization Toolkit',
    url: canonical,
    codeRepository: repoUrl,
    license: 'https://spdx.org/licenses/Apache-2.0',
    programmingLanguage: ['TypeScript', 'JavaScript', 'CSS', 'HTML'],
    runtimePlatform: 'Node.js >=22; modern web browsers',
    description: 'Framework-agnostic engineering toolkit for Arabic and RTL interfaces, localization, accessibility, Unicode-safe text, bidi safety, and direction-aware UI behavior.',
    isAccessibleForFree: true,
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, software]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/open-source">المصدر المفتوح</Link><span>/</span><span aria-current="page">Arabic/RTL Toolkit</span></nav>

      <section className="public-index-hero" aria-labelledby="toolkit-page-title">
        <span className="eyebrow">Health Renewal Open Source</span>
        <h1 id="toolkit-page-title">Arabic/RTL Accessibility & Localization Toolkit</h1>
        <p>أداة هندسية عامة مستقلة عن قاعدة المحتوى العلمي للمنصة، صُممت لتقليل الأخطاء المتكررة عند بناء واجهات عربية وثنائية الاتجاه قابلة للوصول وقابلة للتدويل. الصفحة الحالية على <strong>healthrenewal.org</strong> هي المرجع الرسمي لهوية المشروع؛ أما GitHub فهو مرجع المصدر والتاريخ الهندسي.</p>
        <div className="public-stat-strip"><span>Apache-2.0</span><span>TypeScript</span><span>Framework-agnostic</span><span>Zero runtime dependencies</span></div>
      </section>

      <section aria-labelledby="capability-title">
        <div className="section-mini-heading"><div><span className="eyebrow">النطاق الهندسي</span><h2 id="capability-title">ماذا يوفر المشروع؟</h2></div><span>طبقة أدوات عامة، لا إطار واجهات جديد.</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>Arabic / RTL / bidi</h3><p>تحديد اتجاه النص واللغة، معالجة النص المختلط، Unicode isolation، CSS logical properties، وسلوك واجهة يراعي اتجاه القراءة.</p></article>
          <article className="institutional-sector-card"><h3>i18n / localization</h3><p>تفاوض locale آمن بالنسبة للـscript، تنسيق Intl، plural rules، segmentation، display names، parsing للأرقام، وفحوص catalog قابلة للتشغيل آليًا.</p></article>
          <article className="institutional-sector-card"><h3>Accessibility</h3><p>نماذج مرجعية للـdisclosure وmenu button وmodal وtabs وpagination والتنقل المركب، مع axe واختبارات متصفحات فعلية.</p></article>
          <article className="institutional-sector-card"><h3>Quality & supply chain</h3><p>اختبارات Node 22/24/26، Playwright على Chromium وFirefox وWebKit وموبايل Chromium، CodeQL، Dependency Review، package contracts، وreproducible builds.</p></article>
        </div>
      </section>

      <section aria-labelledby="identity-title">
        <div className="section-mini-heading"><div><span className="eyebrow">هوية المشروع</span><h2 id="identity-title">الدومين الرسمي والمستودع</h2></div><span>فصل واضح بين المرجع المؤسسي ومرجع الكود.</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>Official project home</h3><p><a href={canonical}>healthrenewal.org/open-source/arabic-rtl-a11y-toolkit</a></p><p>هذا هو الرابط الرسمي الذي يُستخدم في الملفات التعريفية والنماذج المؤسسية وبيانات المشروع.</p></article>
          <article className="institutional-sector-card"><h3>Source repository</h3><p><a href={repoUrl} rel="external">github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit ↗</a></p><p>مرجع الكود، CI، المشكلات، تاريخ المساهمات والتراخيص.</p></article>
          <article className="institutional-sector-card"><h3>Package identity</h3><p><code>@rawafid/arabic-rtl-a11y-toolkit</code></p><p>يبقى معرف npm الحالي كما هو إلى أن يتم امتلاك وتهيئة scope بديل فعليًا؛ تغيير الدومين لا يبرر كسر معرف الحزمة أو ادعاء namespace غير مملوك.</p></article>
        </div>
      </section>

      <section className="rawafid-empty" aria-labelledby="scope-boundary-title">
        <h2 id="scope-boundary-title">حدود مفتوحة المصدر</h2>
        <p>المستودع لا يحتوي المقالات أو قاعدة المعرفة الصحية والنفسية أو بيانات المستخدمين أو أسرار الإنتاج أو منطق النشر الخاص. الترخيص المفتوح ينطبق على الأصول العامة الموجودة في المستودع فقط.</p>
        <p><a href={`${repoUrl}/blob/main/OPEN_SOURCE_SCOPE.md`} rel="external">Open-source scope ↗</a> · <a href={`${repoUrl}/blob/main/SECURITY.md`} rel="external">Security policy ↗</a> · <a href={`${repoUrl}/actions`} rel="external">CI evidence ↗</a></p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
