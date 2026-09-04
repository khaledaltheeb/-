import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import foundations from '@/data/cochrane/guides-foundations-v1.json';
import searchBias from '@/data/cochrane/guides-search-bias-v1.json';
import statistics from '@/data/cochrane/guides-statistics-v1.json';
import gradeDecision from '@/data/cochrane/guides-grade-decision-v1.json';
import msGovernance from '@/data/cochrane/guides-ms-arabic-governance-v1.json';

export const dynamic = 'force-dynamic';

const batches = [
  { id: 'foundations', title: 'الأساس وتصميم المراجعة', eyebrow: 'الأساس وتصميم المراجعة', updated_on: foundations.updated_on, guides: foundations.guides },
  { id: 'search-bias', title: 'البحث والاختيار واستخراج البيانات وخطر التحيز', eyebrow: 'البحث والاختيار والتحيز', updated_on: searchBias.updated_on, guides: searchBias.guides },
  { id: 'statistics', title: 'مقاييس الأثر والتركيب الإحصائي', eyebrow: 'مقاييس الأثر والتركيب', updated_on: statistics.updated_on, guides: statistics.guides },
  { id: 'grade-decision', title: 'GRADE ومن الدليل إلى القرار', eyebrow: 'اليقين واستخدام الدليل', updated_on: gradeDecision.updated_on, guides: gradeDecision.guides },
  { id: 'ms-governance', title: 'تطبيقات MS والترجمة العربية والحوكمة', eyebrow: 'تطبيقات عملية وحوكمة عربية', updated_on: msGovernance.updated_on, guides: msGovernance.guides },
];
const guideCount = batches.reduce((sum, batch) => sum + batch.guides.length, 0);
const allGuides = batches.flatMap((batch) => batch.guides);

export const metadata: Metadata = buildSeoMetadata({
  title: 'أدلة منهجية لقراءة وبناء المراجعات المنهجية',
  description: 'مسار عربي أصلي من روافد يغطي تصميم المراجعة والبحث واختيار الدراسات واستخراج البيانات وخطر التحيز ومقاييس الأثر والتركيب وGRADE ونقل الدليل إلى القرار.',
  path: '/cochrane/guides/',
  index: false,
  follow: true,
  type: 'website',
  keywords: ['المراجعات المنهجية', 'Cochrane Handbook', 'RoB 2', 'ROBINS-I', 'ROB-ME', 'GRADE', 'meta-analysis'],
  relatedTerms: ['Cochrane', 'evidence synthesis', 'systematic review methods', 'منصة روافد'],
});

export default function CochraneGuidesIndex() {
  const path = '/cochrane/guides/';
  const url = `${SITE_URL}${path}`;
  const crumbs = [
    { name: 'الرئيسية', path: '/' },
    { name: 'موارد كوكرين', path: '/cochrane/' },
    { name: 'الأدلة المنهجية', path },
  ];
  const breadcrumbs = breadcrumbJsonLd(crumbs);
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name: 'الأدلة المنهجية لقراءة وبناء المراجعات المنهجية',
    description: 'مسار عربي أصلي من روافد يضم خمسين دليلاً مترابطاً في منهجيات المراجعات المنهجية وعلوم الدليل.',
    inLanguage: 'ar',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: guideCount,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: allGuides.map((guide, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: guide.title_ar,
        url: `${SITE_URL}/cochrane/guides/${guide.slug}/`,
      })),
    },
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell" lang="ar" dir="rtl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collectionSchema]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link><span aria-hidden="true">/</span>
        <Link href="/cochrane/">موارد كوكرين</Link><span aria-hidden="true">/</span>
        <span aria-current="page">الأدلة المنهجية</span>
      </nav>

      <section className="public-index-hero" aria-labelledby="cochrane-guides-title">
        <span className="eyebrow">بناء بالمعيار الذهبي · <span lang="en">50-guide pre-release corpus</span></span>
        <h1 id="cochrane-guides-title">الأدلة المنهجية لقراءة وبناء المراجعات المنهجية</h1>
        <p>خمسون دليلاً عربياً أصلياً في مسار واحد يبدأ من السؤال والبروتوكول، يمر بالبحث والاختيار واستخراج البيانات وخطر التحيز، ثم مقاييس الأثر والتركيب وGRADE، وينتهي بقابلية التطبيق والقرار وتطبيقات واقعية وحوكمة الترجمة العلمية. كل صفحة لها سؤال مستقل ومصادر أولية وروابط إلى الصفحات التي تكمل منطقها.</p>
        <div className="public-stat-strip"><span>{guideCount} صفحة مكتوبة</span><span>5 طبقات مترابطة</span><span>لا فهرسة قبل بوابة الجودة النهائية</span></div>
      </section>

      <aside className="rawafid-empty" aria-label="سياسة الإصدار">
        <h2>قاعدة الإصدار</h2>
        <p>اكتمال العدد لا يعني الجاهزية للنشر. تبقى هذه الحزمة غير مفهرسة حتى تمر على التدقيق العلمي، سلامة المصادر والروابط، التكرار، الحقوق والنسب، العربية وRTL، SEO والبيانات المنظمة، الوصولية والموبايل، ثم المراجعة التحريرية النهائية.</p>
      </aside>

      {batches.map((batch, batchIndex) => <section key={batch.id} aria-labelledby={`cochrane-batch-${batch.id}`}>
        <div className="section-mini-heading"><div><span className="eyebrow">{batch.eyebrow}</span><h2 id={`cochrane-batch-${batch.id}`}>{batch.title}</h2></div><span>{batch.guides.length} صفحات · {batch.updated_on}</span></div>
        <div className="institutional-sector-grid">
          {batch.guides.map((guide, index) => <Link className="institutional-sector-card" href={`/cochrane/guides/${guide.slug}/`} key={guide.slug}>
            <span className="sector-number">{String(batches.slice(0, batchIndex).reduce((sum, item) => sum + item.guides.length, 0) + index + 1).padStart(2, '0')}</span>
            <h3>{guide.title_ar}</h3>
            <p>{guide.description_ar}</p>
            <span className="sector-open">فتح الصفحة ←</span>
          </Link>)}
        </div>
      </section>)}
    </main>
    <SiteFooter />
  </>;
}
