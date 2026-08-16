import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildSeoMetadata({
  title: 'الموارد العملية في روافد',
  description: 'فهرس حي للموارد العملية المنشورة في روافد: أوراق متابعة قابلة للطباعة، أدوات تنظيم غير تشخيصية، وأدلة منهجية للقياس والبحث وقراءة الدليل.',
  path: '/resources',
  index: true,
  follow: true,
  keywords: ['موارد روافد', 'أوراق عمل قابلة للطباعة', 'أدوات غير تشخيصية', 'القياس النفسي', 'قراءة الدليل'],
});

type ResourceRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  canonical_url: string | null;
  audience: string[] | null;
  published_at: string | null;
};

function resourceHref(row: ResourceRow) {
  const canonical = row.canonical_url?.trim();
  if (canonical?.startsWith('/')) return canonical;
  return `/resources/${row.slug}`;
}

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,canonical_url,audience,published_at')
    .eq('status', 'published')
    .eq('content_type', 'resource')
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(0, 199);
  const resources = (data ?? []) as ResourceRow[];
  const printable = resources.filter((row) => /printable|قابل للطباعة|ورقة|سجل متابعة/i.test(`${row.slug} ${row.title}`));
  const methodology = resources.filter((row) => !printable.includes(row));
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الموارد', path: '/resources' }]);

  const renderCards = (rows: ResourceRow[]) => rows.map((row) => <Link className="institutional-sector-card" href={resourceHref(row)} key={row.id}>
    <span className="eyebrow">مورد منشور</span>
    <h3>{row.title}</h3>
    <p>{row.excerpt || 'مورد عملي منشور ضمن روافد مع مسار قراءة واستخدام واضح.'}</p>
    {row.audience?.length ? <div className="sector-metrics"><span>{row.audience.slice(0, 3).join(' · ')}</span></div> : null}
    <span className="sector-open">فتح المورد ←</span>
  </Link>);

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الموارد</span></nav>
      <section className="public-index-hero" aria-labelledby="resources-title">
        <span className="eyebrow">مكتبة عملية متجددة</span>
        <h1 id="resources-title">الموارد العملية</h1>
        <p>هذه الصفحة تستبدل الفهرس التاريخي القصير بفهرس حي يعتمد على الموارد المنشورة فعليًا في قاعدة روافد. لا تُعرض مسودات الهجرة ولا المواد غير المعتمدة، ويقود كل رابط إلى الـcanonical الحالي للمورد.</p>
        <div className="public-stat-strip"><span>{resources.length.toLocaleString('ar')} موردًا منشورًا</span><span>{printable.length.toLocaleString('ar')} موردًا عمليًا/قابلًا للطباعة</span><span>لا درجات تشخيصية ضمن الفهرس</span></div>
      </section>

      {printable.length ? <section aria-labelledby="printable-title"><div className="section-mini-heading"><div><span className="eyebrow">للاستخدام اليومي</span><h2 id="printable-title">أوراق وسجلات عملية</h2></div><span>للملاحظة والتنظيم والتحضير، لا للتشخيص الذاتي.</span></div><div className="institutional-sector-grid">{renderCards(printable)}</div></section> : null}

      {methodology.length ? <section aria-labelledby="method-title"><div className="section-mini-heading"><div><span className="eyebrow">لفهم القياس والدليل</span><h2 id="method-title">موارد منهجية ومعرفية</h2></div><span>تصاميم بحث، قياس، تفسير نتائج، وشفافية المصادر.</span></div><div className="institutional-sector-grid">{renderCards(methodology)}</div></section> : null}

      {!resources.length ? <div className="rawafid-empty"><h2>لا توجد موارد عامة متاحة حاليًا.</h2><p>ستظهر الموارد هنا بعد اعتمادها للنشر العام.</p></div> : null}
    </main>
    <SiteFooter />
  </>;
}
