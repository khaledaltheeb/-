import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import foundations from '@/data/cochrane/guides-foundations-v1.json';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildSeoMetadata({
  title: 'أدلة منهجية لقراءة وبناء المراجعات المنهجية',
  description: 'مسار عربي أصلي من روافد يشرح تصميم المراجعات المنهجية، صياغة السؤال، معايير الأهلية، اختيار النتائج، الأضرار، التحيز والتركيب مع مصادر أولية قابلة للتتبع.',
  path: '/cochrane/guides/',
  index: false,
  follow: true,
  type: 'website',
  keywords: ['المراجعات المنهجية', 'Cochrane Handbook', 'الطب المبني على الدليل', 'PICO', 'GRADE'],
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
        <p>هذه الصفحات جزء من حزمة الخمسين صفحة الجاري بناؤها. كل صفحة لها سؤال مستقل، محتوى عربي أصلي، قائمة فحص، ومصادر أولية. الصفحات غير مفهرسة حالياً إلى أن تكتمل جولات التدقيق العلمي والتحريري والحقوقي والتقني.</p>
        <div className="public-stat-strip"><span>{foundations.guides.length} صفحات مكتوبة</span><span>هدف الإصدار: 50 صفحة</span><span>لا فهرسة قبل Quality Gate</span></div>
      </section>

      <section>
        <div className="section-mini-heading"><div><span className="eyebrow">Foundation batch</span><h2>الدفعة الأولى</h2></div><span>{foundations.updated_on}</span></div>
        <div className="institutional-sector-grid">
          {foundations.guides.map((guide, index) => <Link className="institutional-sector-card" href={`/cochrane/guides/${guide.slug}/`} key={guide.slug}>
            <span className="sector-number">{String(index + 1).padStart(2, '0')}</span>
            <h3>{guide.title_ar}</h3>
            <p>{guide.description_ar}</p>
            <span className="sector-open">فتح الصفحة ←</span>
          </Link>)}
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
