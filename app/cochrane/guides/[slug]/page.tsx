import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import foundations from '@/data/cochrane/guides-foundations-v1.json';
import searchBias from '@/data/cochrane/guides-search-bias-v1.json';
import statistics from '@/data/cochrane/guides-statistics-v1.json';
import gradeDecision from '@/data/cochrane/guides-grade-decision-v1.json';
import msGovernance from '@/data/cochrane/guides-ms-arabic-governance-v1.json';
import methodsProvenance from '@/data/cochrane/methods-provenance-v1.json';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;
type FoundationGuide = (typeof foundations.guides)[number];
type SearchBiasGuide = (typeof searchBias.guides)[number];
type StatisticsGuide = (typeof statistics.guides)[number];
type GradeDecisionGuide = (typeof gradeDecision.guides)[number];
type MsGovernanceGuide = (typeof msGovernance.guides)[number];
type Guide = FoundationGuide | SearchBiasGuide | StatisticsGuide | GradeDecisionGuide | MsGovernanceGuide;
type ProvenanceRecord = (typeof methodsProvenance.records)[number];

const batches = [foundations, searchBias, statistics, gradeDecision, msGovernance] as const;
const guides: Guide[] = batches.flatMap((batch) => batch.guides) as Guide[];

const SOURCE_URL_CANONICAL_OVERRIDES: Record<string, string> = {
  'https://www.riskofbias.info/welcome/home/current-version-of-robins-i': 'https://www.riskofbias.info/welcome/robins-i-v2',
  'https://www.cochrane.org/join-cochrane/translate': 'https://www.cochrane.org/get-involved/translate-our-evidence',
};

function canonicalSourceUrl(sourceUrl: string) {
  return SOURCE_URL_CANONICAL_OVERRIDES[sourceUrl] ?? sourceUrl;
}

function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}

function guideBatch(guide: Guide) {
  return batches.find((candidate) => candidate.guides.some((item) => item.slug === guide.slug));
}

function guideEditorialNote(guide: Guide) {
  return guideBatch(guide)?.editorial_note_ar ?? foundations.editorial_note_ar;
}

function sourceFreshness(sourceUrl: string): ProvenanceRecord | undefined {
  const canonicalUrl = canonicalSourceUrl(sourceUrl);
  return methodsProvenance.records.find((record) => record.url === canonicalUrl || record.source_of_status === canonicalUrl);
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
    modifiedTime: guideBatch(guide)?.updated_on,
    keywords: ['كوكرين', 'المراجعات المنهجية', 'الطب المبني على الدليل', guide.intent_ar],
    relatedTerms: ['Cochrane Handbook', 'systematic review', 'evidence synthesis', 'GRADE', 'منصة روافد'],
  });
}

export default async function CochraneGuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const path = `/cochrane/guides/${guide.slug}/`;
  const url = `${SITE_URL}${path}`;
  const crumbs = [
    { name: 'الرئيسية', path: '/' },
    { name: 'موارد كوكرين', path: '/cochrane/' },
    { name: 'الأدلة المنهجية', path: '/cochrane/guides/' },
    { name: guide.title_ar, path },
  ];
  const breadcrumbs = breadcrumbJsonLd(crumbs);
  const batch = guideBatch(guide);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    url,
    headline: guide.title_ar,
    description: guide.description_ar,
    inLanguage: 'ar',
    articleSection: 'المراجعات المنهجية وعلوم الدليل',
    dateModified: batch?.updated_on,
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    citation: guide.sources.map((source) => canonicalSourceUrl(source.url)),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  const pitfalls = 'pitfalls_ar' in guide ? guide.pitfalls_ar : [];
  const connections = 'connections' in guide ? guide.connections.map((linkedSlug) => getGuide(linkedSlug)).filter(Boolean) as Guide[] : [];
  const provenanceRecords = guide.sources.map((source) => sourceFreshness(source.url)).filter(Boolean) as ProvenanceRecord[];
  const robinsDraft = guide.slug === 'robins-i-v2-nonrandomized'
    ? methodsProvenance.records.find((record) => record.id === 'robins-i-v2')
    : undefined;

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, articleSchema]).replace(/</g, '\\u003c') }} />
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
        <p>{guideEditorialNote(guide)}</p>
        <p><strong>نية الصفحة:</strong> {guide.intent_ar}</p>
      </aside>

      {robinsDraft ? <aside className="rawafid-empty" aria-label="تنبيه حالة الأداة">
        <h2>تنبيه منهجي: ROBINS-I V2 ما يزال مسودة</h2>
        <p>{robinsDraft.note_ar}</p>
        <p><strong>الحالة المتحققة:</strong> {robinsDraft.version_label} · <strong>تاريخ تحقق روافد:</strong> {robinsDraft.verified_on}</p>
        <a className="sector-open" href={robinsDraft.url} target="_blank" rel="noopener noreferrer">فتح صفحة الحالة الرسمية ↗</a>
      </aside> : null}

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

      {pitfalls.length ? <section>
        <div className="section-mini-heading"><div><span className="eyebrow">Common failure modes</span><h2>أخطاء شائعة يجب تجنبها</h2></div></div>
        <div className="institutional-sector-grid">
          {pitfalls.map((item, index) => <article className="institutional-sector-card" key={item}>
            <span className="sector-number">{String(index + 1).padStart(2, '0')}</span><p>{item}</p>
          </article>)}
        </div>
      </section> : null}

      <section>
        <div className="section-mini-heading"><div><span className="eyebrow">Quality check</span><h2>أسئلة فحص سريعة</h2></div></div>
        <div className="institutional-sector-grid">
          {guide.checklist_ar.map((item, index) => <article className="institutional-sector-card" key={item}>
            <span className="sector-number">{String(index + 1).padStart(2, '0')}</span>
            <p>{item}</p>
          </article>)}
        </div>
      </section>

      {connections.length ? <section>
        <div className="section-mini-heading"><div><span className="eyebrow">Connected learning path</span><h2>صفحات مرتبطة تكمل الفكرة</h2></div></div>
        <div className="institutional-sector-grid">
          {connections.map((linkedGuide) => <Link className="institutional-sector-card" href={`/cochrane/guides/${linkedGuide.slug}/`} key={linkedGuide.slug}>
            <h3>{linkedGuide.title_ar}</h3><p>{linkedGuide.description_ar}</p><span className="sector-open">متابعة المسار ←</span>
          </Link>)}
        </div>
      </section> : null}

      <section>
        <div className="section-mini-heading"><div><span className="eyebrow">Primary sources</span><h2>المصادر المستخدمة</h2></div><span>{guide.sources.length} مصادر</span></div>
        <div className="institutional-sector-grid">
          {guide.sources.map((source) => {
            const sourceUrl = canonicalSourceUrl(source.url);
            const freshness = sourceFreshness(sourceUrl);
            return <article className="institutional-sector-card" key={sourceUrl}>
              <span className="eyebrow">{source.kind}</span>
              <h3>{source.label}</h3>
              {freshness ? <><p><strong>حالة المصدر:</strong> {freshness.version_label}</p><p>{freshness.note_ar}</p><p><strong>تحقق روافد:</strong> {freshness.verified_on}</p></> : null}
              <a className="sector-open" href={sourceUrl} target="_blank" rel="noopener noreferrer">فتح المصدر الأصلي ↗</a>
            </article>;
          })}
        </div>
      </section>

      {provenanceRecords.length ? <aside className="rawafid-empty" aria-label="سجل حداثة المصادر">
        <h2>سجل حداثة المصادر</h2>
        <p>تاريخ مراجعة سجل المصادر المنهجية: {methodsProvenance.reviewed_on}. التحقق من حداثة المرجع منفصل عن تاريخ نشر صفحة روافد، ولا يعني أن كل فصل أو أداة تغيرت في التاريخ نفسه.</p>
      </aside> : null}
    </main>
    <SiteFooter />
  </>;
}
