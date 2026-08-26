import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
  title: 'المصدر المفتوح في Health Renewal',
  description: 'المشروعات البرمجية العامة مفتوحة المصدر المرتبطة بمنصة روافد على النطاق الرسمي healthrenewal.org، مع فصل واضح بين الأدوات الهندسية العامة والمحتوى العلمي والتحريري للمنصة.',
  path: '/open-source',
  index: true,
  follow: true,
  keywords: ['Health Renewal open source', 'Arabic RTL toolkit', 'أدوات عربية مفتوحة المصدر', 'الوصولية', 'التدويل', 'RTL'],
  relatedTerms: ['Arabic accessibility', 'bidirectional text', 'internationalization', 'localization', 'Apache-2.0'],
  searchIntents: ['أدوات RTL عربية مفتوحة المصدر', 'Arabic RTL accessibility toolkit', 'Health Renewal GitHub'],
});

const repoUrl = 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit';

export default function OpenSourcePage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'المصدر المفتوح', path: '/open-source' },
  ]);
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${absoluteSiteUrl('/open-source')}#page`,
    url: absoluteSiteUrl('/open-source'),
    name: 'Health Renewal Open Source',
    inLanguage: ['ar', 'en'],
    isPartOf: { '@id': `${absoluteSiteUrl('/')}#website` },
    hasPart: [{
      '@type': 'SoftwareSourceCode',
      name: 'Health Renewal Arabic/RTL Accessibility & Localization Toolkit',
      url: absoluteSiteUrl('/open-source/arabic-rtl-a11y-toolkit'),
      codeRepository: repoUrl,
      license: 'https://spdx.org/licenses/Apache-2.0',
      programmingLanguage: ['TypeScript', 'JavaScript', 'CSS', 'HTML'],
    }],
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collection]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">المصدر المفتوح</span></nav>

      <section className="public-index-hero" aria-labelledby="open-source-title">
        <span className="eyebrow">Health Renewal · Open Source</span>
        <h1 id="open-source-title">المصدر المفتوح</h1>
        <p>هذه هي الصفحة الرسمية للمشروعات البرمجية العامة المرتبطة بـ Health Renewal على النطاق المملوك للمنصة. ننشر هنا فقط الأدوات الهندسية القابلة لإعادة الاستخدام، مع إبقاء المحتوى العلمي والتحريري وبيانات المستخدمين وأسرار الإنتاج خارج المستودعات العامة.</p>
        <div className="public-stat-strip"><span>نطاق رسمي: healthrenewal.org</span><span>تراخيص مفتوحة واضحة</span><span>فصل صارم عن المحتوى العلمي الخاص بالمنصة</span></div>
      </section>

      <section aria-labelledby="toolkit-title">
        <div className="section-mini-heading"><div><span className="eyebrow">المشروع العام الأول</span><h2 id="toolkit-title">Arabic/RTL Accessibility & Localization Toolkit</h2></div><span>TypeScript · Apache-2.0 · بدون اعتماد runtime</span></div>
        <div className="institutional-sector-grid">
          <Link className="institutional-sector-card" href="/open-source/arabic-rtl-a11y-toolkit">
            <span className="eyebrow">Developer toolkit</span>
            <h3>Health Renewal Arabic/RTL Accessibility & Localization Toolkit</h3>
            <p>طبقة هندسية عامة للعربية وRTL والنص ثنائي الاتجاه والتدويل والوصولية والتنقل المراعي للاتجاه، مع اختبارات وحدوية ومصفوفة متصفحات حقيقية وأدلة توافق قابلة للمراجعة.</p>
            <div className="sector-metrics"><span>Apache-2.0</span><span>82 public exports</span><span>Node 22/24/26</span></div>
            <span className="sector-open">فتح الصفحة الرسمية ←</span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="scope-title">
        <div className="section-mini-heading"><div><span className="eyebrow">حدود النشر</span><h2 id="scope-title">ما الذي يدخل في المصدر المفتوح؟</h2></div><span>الشفافية لا تعني نشر كل شيء.</span></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>ينشر</h3><p>أدوات RTL والعربية، i18n/localization، الوصولية، Unicode/bidi، CSS المنطقي، fixtures واختبارات عامة قابلة لإعادة الاستخدام.</p></article>
          <article className="institutional-sector-card"><h3>لا ينشر</h3><p>قاعدة المحتوى العلمي، المقالات، بيانات المستخدمين، أسرار الإنتاج، منطق النشر الخاص، مفاتيح الخدمات، أو أي مادة لا يملك المشروع حق توزيعها.</p></article>
          <article className="institutional-sector-card"><h3>إثبات الجودة</h3><p>المستودع العام يحتفظ باختبارات CI، CodeQL، Dependency Review، اختبارات Playwright وaxe، عقود الحزمة، وبناء قابل لإعادة الإنتاج.</p></article>
        </div>
      </section>

      <section className="rawafid-empty" aria-labelledby="source-links-title">
        <h2 id="source-links-title">المصدر والمراجعة الخارجية</h2>
        <p>المستودع العام هو مرجع الكود وتاريخ المساهمات والمشكلات. هذه الصفحة على healthrenewal.org هي المرجع الرسمي لهوية المشروع وروابطه العامة.</p>
        <p><a href={repoUrl} rel="external">GitHub repository ↗</a> · <a href={`${repoUrl}/issues`} rel="external">Issues ↗</a></p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
