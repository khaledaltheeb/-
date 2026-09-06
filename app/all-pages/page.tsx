import type { Metadata } from 'next';
import Link from 'next/link';
import PlatformIcon from '@/components/platform-icon';
import PublicPagination from '@/components/public-pagination';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { publicContentHref, publicContentTypeLabel } from '@/lib/public-content-routing';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ page?: string | string[]; q?: string | string[]; scope?: string | string[] }>;
type PublishedItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_type: string;
  published_at: string | null;
  canonical_url: string | null;
  robots_index: boolean;
};
type Category = { id: string; slug: string; name_ar: string; sector_id: string | null };
type Sector = { id: string; slug: string; name_ar: string };

const PAGE_SIZE = 24;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? '' : value ?? '';
const pageNo = (value: string) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed < 10000 ? parsed : 1;
};
const qSafe = (value: string) => value.trim().replace(/[%_(),]/g, ' ').replace(/\s+/g, ' ').slice(0, 120);
const scopeSafe = (value: string) => value === 'published' ? 'published' : 'indexable';
const pageHref = (page: number, query: string, scope: 'indexable' | 'published') => {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (scope === 'published') params.set('scope', 'published');
  if (page > 1) params.set('page', String(page));
  return `/all-pages${params.size ? `?${params.toString()}` : ''}`;
};

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const raw = await searchParams;
  const page = pageNo(one(raw.page));
  const query = qSafe(one(raw.q));
  const scope = scopeSafe(one(raw.scope));
  const indexableState = !query && scope === 'indexable';
  return buildSeoMetadata({
    title: query
      ? `نتائج فهرس المحتوى: ${query}`
      : scope === 'published'
        ? 'فهرس كل المحتوى المنشور'
        : page > 1
          ? `فهرس المحتوى القابل للفهرسة — الصفحة ${page}`
          : 'فهرس المحتوى المنشور',
    description: scope === 'published'
      ? 'فهرس وصول داخلي لكل سجلات المحتوى المنشورة في منصة روافد، بما فيها الصفحات التي لا تسمح سياسة المراجعة الحالية بفهرستها في محركات البحث.'
      : 'فهرس منظم للمحتوى المنشور والقابل للفهرسة في منصة روافد، مع ربط كل صفحة بمسارها العام وتصنيفها الأساسي.',
    path: pageHref(page, query, scope),
    index: indexableState,
    follow: true,
    keywords: ['فهرس روافد', 'صفحات روافد', 'المحتوى المنشور', 'دليل المحتوى'],
  });
}

export default async function AllPagesIndex({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const page = pageNo(one(raw.page));
  const query = qSafe(one(raw.q));
  const scope = scopeSafe(one(raw.scope));
  const now = new Date().toISOString();
  const supabase = await createClient();

  let contentQuery = supabase
    .from('content')
    .select('id,slug,title,excerpt,content_type,published_at,canonical_url,robots_index', { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', now)
    .order('published_at', { ascending: false })
    .order('title', { ascending: true })
    .order('id', { ascending: true });
  if (scope === 'indexable') contentQuery = contentQuery.eq('robots_index', true);
  if (query) contentQuery = contentQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);

  const { data, count, error } = await contentQuery.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const rows = (Array.isArray(data) ? data : []) as PublishedItem[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginationPage = Math.min(page, totalPages);

  const categoryByContent = new Map<string, Category>();
  const sectorById = new Map<string, Sector>();
  const contentIds = rows.map((item) => item.id);
  if (contentIds.length > 0) {
    const { data: mappings } = await supabase
      .from('content_categories')
      .select('content_id,category_id')
      .eq('is_primary', true)
      .in('content_id', contentIds);
    const categoryIds = [...new Set((mappings ?? []).map((mapping) => mapping.category_id).filter(Boolean))] as string[];
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id,slug,name_ar,sector_id')
        .in('id', categoryIds);
      const categoryRows = (categories ?? []) as Category[];
      const categoryById = new Map(categoryRows.map((category) => [category.id, category]));
      for (const mapping of mappings ?? []) {
        const category = categoryById.get(mapping.category_id);
        if (category) categoryByContent.set(mapping.content_id, category);
      }
      const sectorIds = [...new Set(categoryRows.map((category) => category.sector_id).filter(Boolean))] as string[];
      if (sectorIds.length > 0) {
        const { data: sectors } = await supabase.from('sectors').select('id,slug,name_ar').in('id', sectorIds);
        for (const sector of (sectors ?? []) as Sector[]) sectorById.set(sector.id, sector);
      }
    }
  }

  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'فهرس المحتوى', path: '/all-pages' }]);
  const currentPath = pageHref(page, query, scope);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}${currentPath}#collection`,
    url: `${SITE_URL}${currentPath}`,
    name: query ? `نتائج فهرس المحتوى عن ${query}` : 'فهرس المحتوى المنشور في منصة روافد',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: rows.length,
      itemListElement: rows.map((item, index) => ({
        '@type': 'ListItem',
        position: (page - 1) * PAGE_SIZE + index + 1,
        name: item.title,
        url: `${SITE_URL}${publicContentHref(item)}`,
      })),
    },
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell all-pages-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, schema]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">فهرس المحتوى</span></nav>

      <section className="public-index-hero" aria-labelledby="all-pages-title">
        <span className="eyebrow"><PlatformIcon name="knowledge" size={18} /> فهرس وصول مستقل</span>
        <h1 id="all-pages-title">فهرس المحتوى المنشور</h1>
        <p>بوابة مستقلة عن ترتيب القطاعات والأقسام تمنع اختفاء الصفحات داخل بنية معلوماتية كبيرة. العرض الافتراضي يقتصر على المحتوى القابل للفهرسة؛ ويمكن عرض كل المنشور، بما فيه الصفحات غير المفهرسة، في حالة وصول مستقلة لا تُفهرس هي نفسها.</p>
        <div className="public-stat-strip"><span>{total.toLocaleString('ar')} {query ? 'نتيجة مطابقة' : 'سجلًا في هذا النطاق'}</span><span>{totalPages.toLocaleString('ar')} صفحات فهرس</span><span>{scope === 'published' ? 'كل المنشور · حالة noindex' : 'المحتوى القابل للفهرسة'}</span></div>
        <form className="sector-search" action="/all-pages" method="get" role="search">
          <label className="sr-only" htmlFor="all-pages-search">البحث في المحتوى المنشور</label>
          <input id="all-pages-search" name="q" defaultValue={query} placeholder="ابحث بعنوان الصفحة أو وصفها" maxLength={120} />
          {scope === 'published' && <input type="hidden" name="scope" value="published" />}
          <button type="submit">بحث</button>
        </form>
        <div className="content-index-scope" aria-label="نطاق الفهرس">
          <Link className={scope === 'indexable' ? 'is-active' : ''} href="/all-pages">القابل للفهرسة</Link>
          <Link className={scope === 'published' ? 'is-active' : ''} href="/all-pages?scope=published">كل المنشور</Link>
          {query && <Link href={scope === 'published' ? '/all-pages?scope=published' : '/all-pages'}>مسح البحث</Link>}
        </div>
      </section>

      <nav className="sector-quick-nav" aria-label="مسارات فهرس المحتوى">
        <Link href="/sectors">القطاعات</Link>
        <Link href="/sections">الأقسام</Link>
        <Link href="/search">البحث المتقدم</Link>
        <Link href="/care-guides/">أدلة الرعاية</Link>
        <Link href="/evidence-guides/">الأدلة العلمية</Link>
      </nav>

      <section className="section related-content-section" aria-labelledby="content-index-title">
        <div className="section-heading"><span>المحتوى المنشور</span><h2 id="content-index-title">{query ? `نتائج «${query}»` : `الصفحة ${page.toLocaleString('ar')} من الفهرس`}</h2><p>كل بطاقة ترتبط بالمسار العام الفعلي للصفحة وتعرض القطاع والقسم الأساسيين عندما يكون التصنيف متاحًا.</p></div>
        {error ? <div className="search-state error"><h2>تعذر تحميل فهرس المحتوى</h2><p>لم تُعرض نتائج جزئية على أنها فهرس كامل. حاول مرة أخرى لاحقًا.</p></div> : rows.length > 0 ? <>
          <div className="content-index-grid">
            {rows.map((item) => {
              const href = publicContentHref(item);
              const category = categoryByContent.get(item.id);
              const sector = category?.sector_id ? sectorById.get(category.sector_id) : undefined;
              return <article className="content-index-card" key={item.id}>
                <div className="content-index-card__meta"><span className="content-type-pill">{publicContentTypeLabel(item.content_type)}</span>{!item.robots_index && <span className="content-index-status">غير مفهرس</span>}{sector && <Link href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link>}{category && <Link href={`/sections/${category.slug}`}>{category.name_ar}</Link>}</div>
                <h3><Link href={href}>{item.title}</Link></h3>
                {item.excerpt && <p>{item.excerpt}</p>}
                <div className="content-index-card__footer"><Link href={href}>قراءة الصفحة ←</Link>{item.published_at && <time dateTime={item.published_at}>{new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(item.published_at))}</time>}</div>
              </article>;
            })}
          </div>
          <PublicPagination currentPage={paginationPage} totalPages={totalPages} hrefForPage={(targetPage) => pageHref(targetPage, query, scope)} ariaLabel="صفحات فهرس المحتوى المنشور" />
        </> : <div className="empty-state"><strong>{query ? 'لا توجد صفحات مطابقة للبحث.' : total > 0 ? 'هذه الصفحة خارج نطاق الفهرس الحالي.' : 'لا توجد سجلات محتوى منشورة متاحة في هذا النطاق.'}</strong><span>{query ? 'جرّب عبارة أقصر أو انتقل إلى دليل الأقسام.' : total > 0 ? 'استخدم أرقام الصفحات للعودة إلى المحتوى المنشور.' : 'سيظهر المحتوى هنا فور نشره وفق هذا النطاق.'}</span>{total > 0 && <PublicPagination currentPage={paginationPage} totalPages={totalPages} hrefForPage={(targetPage) => pageHref(targetPage, query, scope)} ariaLabel="صفحات فهرس المحتوى المنشور" />}</div>}
      </section>
    </main>
    <SiteFooter />
  </>;
}
