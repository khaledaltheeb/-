import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getEncyclopediaIndexPage } from '@/lib/encyclopedia';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ page: string }>;

function parsePage(value: string) {
  if (!/^[1-9][0-9]{0,3}$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? page : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { page: rawPage } = await params;
  const page = parsePage(rawPage);
  if (!page) return {};
  const result = await getEncyclopediaIndexPage(page);
  if (result.page !== page) return {};
  return buildSeoMetadata({
    title: `فهرس الموسوعة النفسية — الصفحة ${page}`,
    description: `الصفحة ${page} من الفهرس الأبجدي الكامل للموسوعة النفسية في روافد، مع روابط مباشرة إلى الحالات والاضطرابات النفسية المنشورة والمراجعة.`,
    path: `/encyclopedia/index/${page}/`,
    index: true,
    follow: true,
    type: 'website',
    keywords: ['فهرس الموسوعة النفسية', 'الحالات النفسية', 'الاضطرابات النفسية'],
  });
}

export default async function EncyclopediaIndexPage({ params }: { params: Params }) {
  const { page: rawPage } = await params;
  const requestedPage = parsePage(rawPage);
  if (!requestedPage) notFound();
  const result = await getEncyclopediaIndexPage(requestedPage);
  if (result.page !== requestedPage || (result.total === 0 && requestedPage !== 1)) notFound();

  const canonical = `/encyclopedia/index/${result.page}/`;
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الموسوعة النفسية', path: '/encyclopedia/' },
    { name: 'الفهرس الكامل', path: '/encyclopedia/index/1/' },
    { name: `الصفحة ${result.page}`, path: canonical },
  ]);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}${canonical}#page`,
    url: `${SITE_URL}${canonical}`,
    name: `فهرس الموسوعة النفسية — الصفحة ${result.page}`,
    inLanguage: 'ar',
    isPartOf: { '@id': `${SITE_URL}/encyclopedia/#page` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: result.items.length,
      itemListElement: result.items.map((item, index) => ({
        '@type': 'ListItem',
        position: (result.page - 1) * result.pageSize + index + 1,
        name: item.title,
        url: `${SITE_URL}${item.canonicalUrl}`,
      })),
    },
  };

  const pageLinks = Array.from({ length: result.totalPages }, (_, index) => index + 1)
    .filter((page) => page === 1 || page === result.totalPages || Math.abs(page - result.page) <= 2);

  return <><SiteHeader /><main className="article-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, schema]).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/encyclopedia/">الموسوعة النفسية</Link><span>/</span><span aria-current="page">الفهرس {result.page}</span></nav>
    <section className="article-hero">
      <span className="eyebrow">الفهرس الأبجدي الكامل</span>
      <h1>فهرس الموسوعة النفسية — الصفحة {result.page}</h1>
      <p>يعرض هذا الفهرس {result.pageSize} صفحة في كل جزء للحفاظ على سرعة التحميل وقابلية الزحف. إجمالي الحالات المنشورة حاليًا {result.total} موزعة على {result.totalPages} صفحة فهرس.</p>
    </section>
    <nav className="article-related" aria-label="التنقل بين صفحات الفهرس">
      {result.page > 1 ? <Link rel="prev" href={`/encyclopedia/index/${result.page - 1}/`}>← الصفحة السابقة</Link> : <Link href="/encyclopedia/">← مدخل الموسوعة</Link>}
      {' · '}
      <Link href="/search/?type=condition">البحث في الموسوعة</Link>
      {' · '}
      {result.page < result.totalPages ? <Link rel="next" href={`/encyclopedia/index/${result.page + 1}/`}>الصفحة التالية →</Link> : <Link href="/encyclopedia/">مدخل الموسوعة →</Link>}
    </nav>
    <section className="article-related" aria-labelledby="full-index-title">
      <div className="section-mini-heading"><div><span className="eyebrow">{result.total} حالة</span><h2 id="full-index-title">الحالات في هذه الصفحة</h2></div><span>{result.items.length} نتيجة</span></div>
      <div className="related-content-grid">
        {result.items.map((item) => <article key={item.id}><span>حالة نفسية</span><h3><Link href={item.canonicalUrl}>{item.title}</Link></h3>{item.excerpt ? <p>{item.excerpt}</p> : null}<Link href={item.canonicalUrl}>قراءة الدليل ←</Link></article>)}
      </div>
    </section>
    {result.totalPages > 1 ? <nav className="article-related" aria-label="أرقام صفحات الفهرس">
      {pageLinks.map((page, index) => <span key={page}>{index > 0 && pageLinks[index - 1] !== page - 1 ? ' … ' : ' '}<Link aria-current={page === result.page ? 'page' : undefined} href={`/encyclopedia/index/${page}/`}>{page}</Link></span>)}
    </nav> : null}
  </main><SiteFooter /></>;
}
