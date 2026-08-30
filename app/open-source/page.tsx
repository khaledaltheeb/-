import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';

const TOOLKIT_PATH = '/open-source/arabic-rtl-a11y-toolkit';
const TOOLKIT_REPOSITORY = 'https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit';

export const metadata: Metadata = buildSeoMetadata({
  title: 'المصدر المفتوح في منصة روافد',
  description: 'المركز الرسمي للمشروعات البرمجية مفتوحة المصدر المرتبطة بمنصة روافد، مع فصل واضح عن المحتوى العلمي والتحريري وبيانات المستخدمين.',
  path: '/open-source',
  index: true,
  follow: true,
  keywords: ['روافد مفتوح المصدر', 'Arabic open source', 'RTL open source', 'Arabic accessibility', 'Arabic localization'],
  relatedTerms: ['Apache-2.0', 'TypeScript', 'RTL', 'accessibility', 'internationalization'],
  searchIntents: ['Rawafid open source', 'Health Renewal open source', 'Arabic RTL open source toolkit'],
});

export default function OpenSourceHubPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'المصدر المفتوح', path: '/open-source' },
  ]);

  const hubJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${absoluteSiteUrl('/open-source')}#page`,
    name: 'المصدر المفتوح في منصة روافد',
    url: absoluteSiteUrl('/open-source'),
    description: 'Official open-source engineering hub associated with Health Renewal / Rawafid.',
    inLanguage: ['ar', 'en'],
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: 1,
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        url: absoluteSiteUrl(TOOLKIT_PATH),
        name: 'Health Renewal Arabic/RTL Accessibility & Localization Toolkit',
      }],
    },
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, hubJsonLd]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">المصدر المفتوح</span></nav>

      <section className="public-index-hero" aria-labelledby="open-source-title">
        <span className="eyebrow">Open-source engineering · نطاق عام منفصل</span>
        <h1 id="open-source-title">المصدر المفتوح في منصة روافد</h1>
        <p>ينشر هذا المسار البرمجيات والهندسة العامة التي يمكن للمجتمع مراجعتها وإعادة استخدامها والمساهمة فيها. وهو منفصل عمدًا عن المحتوى العلمي والتحريري لمنصة روافد، وعن بيانات المستخدمين والتحليلات وأسرار الإنتاج ومنطق النشر الخاص بالمنصة.</p>
        <p lang="en" dir="ltr">This is the official open-source hub associated with Health Renewal / Rawafid. Public repositories contain reusable engineering assets only; they are not mirrors of the production knowledge platform.</p>
        <div className="public-stat-strip"><span>Public source</span><span>OSI-approved licensing</span><span>Reproducible evidence</span><span>Community contributions</span></div>
      </section>

      <section aria-labelledby="projects-title">
        <div className="section-mini-heading"><div><span className="eyebrow">المشروعات الحالية</span><h2 id="projects-title">مشروعات برمجية عامة قابلة للفحص</h2></div><span>لا نعرض مشروعًا على أنه منشور أو معتمد قبل وجود الدليل العام.</span></div>
        <div className="institutional-sector-grid">
          <Link className="institutional-sector-card" href={TOOLKIT_PATH}>
            <span className="eyebrow">Apache-2.0 · TypeScript</span>
            <h3>العربية وRTL والوصولية والتوطين</h3>
            <p>أداة عامة للعربية والواجهات ثنائية الاتجاه وUnicode bidi والتوطين وأنماط التفاعل والوصولية، مع اختبارات متصفح وعقود تشغيل بيني قابلة للتدقيق.</p>
            <span className="sector-open">فتح الصفحة الرسمية للمشروع ←</span>
          </Link>
          <a className="institutional-sector-card" href={TOOLKIT_REPOSITORY} target="_blank" rel="noreferrer">
            <span className="eyebrow">Canonical source</span>
            <h3>المستودع العام على GitHub</h3>
            <p>الكود والتاريخ والإصدارات والقضايا وPull Requests والسياسات الأمنية وأدلة الاختبار العامة للمشروع.</p>
            <span className="sector-open">فتح GitHub ↗</span>
          </a>
        </div>
      </section>

      <section aria-labelledby="boundary-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Public-scope boundary</span><h2 id="boundary-title">ما الذي لا ينتقل إلى المستودعات العامة؟</h2></div></div>
        <div className="content-card"><ul>
          <li>المقالات العلمية والتحريرية وقواعد محتوى روافد.</li>
          <li>بيانات المستخدمين أو الحسابات أو التحليلات أو مجموعات البيانات الخاصة.</li>
          <li>أسرار الإنتاج والمفاتيح والتهيئة الداخلية.</li>
          <li>منطق النشر والترتيب وSEO الخاص بالمنصة أو أي مادة لا نملك حق إعادة توزيعها.</li>
        </ul></div>
      </section>

      <section aria-labelledby="principles-title">
        <div className="section-mini-heading"><div><span className="eyebrow">مبادئ النشر</span><h2 id="principles-title">الترخيص، المساهمة، والأدلة</h2></div></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><span className="eyebrow">الترخيص</span><h3>حقوق إعادة الاستخدام واضحة</h3><p>المشروع الحالي منشور تحت Apache-2.0، مع LICENSE وNOTICE وحدود نطاق عامة داخل المستودع.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">المساهمة</span><h3>Issues وPull Requests علنية</h3><p>نتوقع تغييرات قابلة للاختبار ومبررة بالمعايير، ونوفر good first issues وhelp wanted للمراجعين والمساهمين المستقلين.</p></article>
          <article className="institutional-sector-card"><span className="eyebrow">عدم المبالغة</span><h3>الدليل قبل الشارة</h3><p>لا نعرض اعتمادًا أو شريكًا أو نشر npm أو تدقيقًا خارجيًا أو تبنيًا واسعًا ما لم يصبح ذلك قابلًا للتحقق من مصدره الرسمي.</p></article>
        </div>
      </section>

      <section aria-labelledby="contact-title">
        <div className="section-mini-heading"><div><span className="eyebrow">التواصل</span><h2 id="contact-title">مراجعة تقنية أو مساهمة أو تشغيل بيني</h2></div></div>
        <div className="content-card"><p>التواصل المؤسسي للمشروعات المفتوحة: <a href="mailto:contact@healthrenewal.org">contact@healthrenewal.org</a>. وللتغييرات البرمجية، نفضّل Issue أو Pull Request علنيًا ما لم تكن المسألة أمنية حساسة.</p></div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
