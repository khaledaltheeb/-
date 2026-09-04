import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import foundations from '@/data/cochrane/guides-foundations-v1.json';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;
type Guide = (typeof foundations.guides)[number];

function getGuide(slug: string): Guide | undefined {
  return foundations.guides.find((guide) => guide.slug === slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return buildSeoMetadata({
    title: guide.title_ar,
    description: guide.description_ar,
    path: `/cochrane/guides/${guide.slug}/`,
    index: false,
    follow: true,
    type: 'article',
    keywords: ['كوكرين', 'المراجعات المنهجية', 'الطب المبني على الدليل', guide.intent_ar],
    relatedTerms: ['Cochrane Handbook', 'systematic review', 'evidence synthesis', 'منصة روافد'],
  });
}

export default async function CochraneGuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const path = `/cochrane/guides/${guide.slug}/`;
  const crumbs = [
    { name: 'الرئيسية', path: '/' },
    { name: 'موارد كوكرين', path: '/cochrane/' },
    { name: 'الأدلة المنهجية', path: '/cochrane/guides/' },
    { name: guide.title_ar, path },
  ];

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link><span>/</span>
        <Link href="/cochrane/">موارد كوكرين</Link><span>/</span>
        <Link href="/cochrane/guides/">الأدلة المنهجية</Link><span>/</span>
        <span aria-current="page">{guide.title_ar}</span>
      </nav>

      <section className="public-index-hero" aria-labelledby="cochrane-guide-title">
        <span className="eyebrow">Rawafid original methodology guide · pre-release review</span>
        <h1 id="cochrane-guide-title">{guide.title_ar}</h1>
        <p>{guide.description_ar}</p>
        <div className="public-stat-strip">
          <span>محتوى عربي أصلي</span>
          <span>مصادر أولية قابلة للتتبع</span>
          <span>غير مفهرس حتى اكتمال التدقيق</span>
        </div>
      </section>

      <aside className="rawafid-empty" aria-label="حدود النسب">
        <h2>حدود النسب والمنهج</h2>
        <p>{foundations.editorial_note_ar}</p>
        <p><strong>نية الصفحة:</strong> {guide.intent_ar}</p>
      </aside>

      <section>
        <div className="section-mini-heading"><div><span className="eyebrow">منهج القراءة</span><h2>الشرح العملي</h2></div></div>
        <div className="institutional-sector-grid">
          {guide.sections.map((section, index) => <article className="institutional-sector-card" key={section.heading_ar}>
            <span className="sector-number">{String(index + 1).padStart(2, '0')}</span>
            <h3>{section.heading_ar}</h3>
            <p>{section.body_ar}</p>
          </article>)}
        </div>
      </section>

      <section>
        <div className="section-mini-heading"><div><span className="eyebrow">Quality check</span><h2>أسئلة فحص سريعة</h2></div></div>
        <div className="institutional-sector-grid">
          {guide.checklist_ar.map((item, index) => <article className="institutional-sector-card" key={item}>
            <span className="sector-number">{String(index + 1).padStart(2, '0')}</span>
            <p>{item}</p>
          </article>)}
        </div>
      </section>

      <section>
        <div className="section-mini-heading"><div><span className="eyebrow">Primary sources</span><h2>المصادر المستخدمة</h2></div><span>{guide.sources.length} مصادر</span></div>
        <div className="institutional-sector-grid">
          {guide.sources.map((source) => <article className="institutional-sector-card" key={source.url}>
            <span className="eyebrow">{source.kind}</span>
            <h3>{source.label}</h3>
            <a className="sector-open" href={source.url} target="_blank" rel="noopener noreferrer">فتح المصدر الأصلي ↗</a>
          </article>)}
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
