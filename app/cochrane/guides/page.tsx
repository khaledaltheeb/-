import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import foundations from '@/data/cochrane/guides-foundations-v1.json';
import searchBias from '@/data/cochrane/guides-search-bias-v1.json';

export const dynamic = 'force-dynamic';

const batches = [
  { id: 'foundations', title: 'الأساس وتصميم المراجعة', eyebrow: 'Foundation & review design', updated_on: foundations.updated_on, guides: foundations.guides },
  { id: 'search-bias', title: 'البحث والاختيار واستخراج البيانات وخطر التحيز', eyebrow: 'Search · selection · bias', updated_on: searchBias.updated_on, guides: searchBias.guides },
];
const guideCount = batches.reduce((sum, batch) => sum + batch.guides.length, 0);

export const metadata: Metadata = buildSeoMetadata({
  title: 'أدلة منهجية لقراءة وبناء المراجعات المنهجية',
  description: 'مسار عربي أصلي من روافد يغطي تصميم المراجعة والبحث واختيار الدراسات واستخراج البيانات وخطر التحيز والتركيب واليقين، مع مصادر أولية قابلة للتتبع.',
  path: '/cochrane/guides/',
  index: false,
  follow: true,
  type: 'website',
  keywords: ['المراجعات المنهجية', 'Cochrane Handbook', 'RoB 2', 'ROBINS-I', 'GRADE'],
  relatedTerms: ['Cochrane', 'evidence synthesis', 'systematic review methods', 'منصة روافد'],
});

export default function CochraneGuidesIndex() {
  const crumbs = [
    { name: 'الرئيسية', path: '/' },
    { name: 'موارد كوكرين', path: '/cochrane/' },
    { name: 'الأدلة المنهجية', path: '/cochrane/guides/' },
  ];

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link><span>/</span>
        <Link href="/cochrane/">موارد كوكرين</Link><span>/</span>
        <span aria-current="page">الأدلة المنهجية</span>
      </nav>

      <section className="public-index-hero">
        <span className="eyebrow">Gold-standard build · pre-release</span>
        <h1>الأدلة المنهجية لقراءة وبناء المراجعات المنهجية</h1>
        <p>مسار واحد مترابط يبدأ من السؤال وتصميم المراجعة، ثم البحث واختيار الدراسات واستخراج البيانات وخطر التحيز، ويستمر لاحقاً إلى مقاييس الأثر والتركيب وGRADE ونقل الدليل إلى القرار. المحتوى عربي أصلي، والمصدر المنهجي الأولي ظاهر، ولا تُفهرس الصفحات قبل اكتمال دورة الجودة الكاملة.</p>
        <div className="public-stat-strip"><span>{guideCount} صفحة مكتوبة حتى الآن</span><span>هدف الإصدار: 50 صفحة جوهرية</span><span>لا فهرسة قبل Quality Gate</span></div>
      </section>

      {batches.map((batch, batchIndex) => <section key={batch.id}>
        <div className="section-mini-heading"><div><span className="eyebrow">{batch.eyebrow}</span><h2>{batch.title}</h2></div><span>{batch.guides.length} صفحات · {batch.updated_on}</span></div>
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
