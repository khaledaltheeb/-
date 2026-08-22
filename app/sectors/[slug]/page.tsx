import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentRenderer from '@/components/content-renderer';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import PublicCategoryTree from '@/components/public-category-tree';
import PublicPagination from '@/components/public-pagination';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';
import { buildPublicCategoryForest, countPublicCategoryNodes } from '@/lib/public-category-tree';
import { resolveSectorAccent } from '@/lib/theme';
import { publicContentHref, publicContentTypeLabel } from '@/lib/public-content-routing';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ page?: string | string[] }>;
type Sector = { id: string; slug: string; name_ar: string; description: string | null; accent: string | null; seo_title: string | null; seo_description: string | null; editorial_content_id: string | null };
type Category = { id: string; slug: string; name_ar: string; description: string | null; parent_id: string | null; sort_order: number };
type PublishedItem = { id: string; slug: string; title: string; excerpt: string | null; content_type: string; published_at: string | null; canonical_url: string | null };
type EditorialContent = { id: string; title: string; excerpt: string | null; body_json: unknown; body_text: string | null };
const PAGE_SIZE = 24;
const CONTENT_SELECT = 'id,slug,title,excerpt,content_type,published_at,canonical_url,content_categories!inner(category_id)';
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? '' : value ?? '';
const pageNo = (value: string) => { const n = Number(value); return Number.isInteger(n) && n > 0 && n < 10000 ? n : 1; };
const pageHref = (slug: string, page: number) => `/sectors/${slug}${page > 1 ? `?page=${page}` : ''}#sector-content`;
const metadataPath = (slug: string, page: number) => `/sectors/${slug}${page > 1 ? `?page=${page}` : ''}`;
const legacyRoute = (slug: string) => `/sectors/${slug}/`;

async function getSector(slug: string): Promise<Sector | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('sectors').select('id,slug,name_ar,description,accent,seo_title,seo_description,editorial_content_id').eq('slug', slug).eq('is_active', true).eq('visibility', 'public').maybeSingle();
  return data as Sector | null;
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const page = pageNo(one(raw.page));
  const sector = await getSector(slug);
  if (!sector) {
    const route = legacyRoute(slug);
    return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
  }
  return buildSeoMetadata({
    title: page > 1 ? `${sector.seo_title || sector.name_ar} — الصفحة ${page}` : sector.seo_title || sector.name_ar,
    description: sector.seo_description || sector.description || `${sector.name_ar} في منصة روافد: أقسام مترابطة ومحتوى عربي موثوق ومسارات وصول منظمة حسب احتياج المستخدم.`,
    path: metadataPath(sector.slug, page),
    index: true,
    keywords: [sector.name_ar, 'منصة روافد'],
  });
}

export default async function SectorPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const page = pageNo(one(raw.page));
  const sector = await getSector(slug);
  if (!sector) {
    const route = legacyRoute(slug);
    const preserved = await getLegacyPreservedPage(route);
    if (!preserved) notFound();
    return <LegacyPreservedPageView page={preserved} route={route} />;
  }
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [{ data: categories }, editorialResult] = await Promise.all([
    supabase.from('categories').select('id,slug,name_ar,description,parent_id,sort_order').eq('sector_id', sector.id).eq('is_active', true).eq('visibility', 'public').order('sort_order').order('name_ar'),
    sector.editorial_content_id
      ? supabase.from('content').select('id,title,excerpt,body_json,body_text').eq('id', sector.editorial_content_id).eq('status', 'published').lte('published_at', now).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const editorialContent = editorialResult.data as EditorialContent | null;
  const categoryRows = (categories ?? []) as Category[];
  const categoryIds = categoryRows.map((category) => category.id);
  const categoryForest = buildPublicCategoryForest(categoryRows);

  let contentRows: PublishedItem[] = [];
  let totalContent = 0;
  if (categoryIds.length > 0) {
    const { data: content, count, error } = await supabase.from('content')
      .select(CONTENT_SELECT, { count: 'exact' })
      .eq('content_categories.is_primary', true)
      .in('content_categories.category_id', categoryIds)
      .eq('status', 'published')
      .lte('published_at', now)
      .order('published_at', { ascending: false })
      .order('title')
      .order('id')
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (error) console.error('sector paginated content read failed', { slug, code: error.code });
    contentRows = (content ?? []) as unknown as PublishedItem[];
    totalContent = count ?? 0;
  }

  const contentPages = Math.max(1, Math.ceil(totalContent / PAGE_SIZE));
  const paginationPage = Math.min(page, contentPages);
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'القطاعات', path: '/sectors' }, { name: sector.name_ar, path: `/sectors/${sector.slug}` }]);
  const accentStyle = { '--accent': resolveSectorAccent(sector.accent) } as CSSProperties;
  const sectorQuery = encodeURIComponent(sector.name_ar);

  return <>
    <SiteHeader />
    <main className="site-shell sector-page" style={accentStyle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors">القطاعات</Link><span>/</span><span aria-current="page">{sector.name_ar}</span></nav>
      <section className="sector-hero"><span className="eyebrow">قطاع رئيسي</span><h1>{sector.name_ar}</h1><p>{sector.description || 'قطاع رئيسي يجمع موضوعات مترابطة ضمن منصة روافد.'}</p><div className="public-stat-strip"><span>{categoryForest.length.toLocaleString('ar')} أقسام رئيسية</span><span>{categoryRows.length.toLocaleString('ar')} قسمًا وقسمًا فرعيًا</span>{totalContent > 0 && <span>{totalContent.toLocaleString('ar')} صفحة منشورة</span>}</div><form className="sector-search" action="/search" method="get"><label className="sr-only" htmlFor="sector-search">ابحث في منصة روافد</label><input id="sector-search" name="q" defaultValue={sector.name_ar} aria-label={`ابحث عن موضوع مرتبط بـ ${sector.name_ar}`} /><button type="submit">بحث</button></form></section>
      <nav className="sector-quick-nav" aria-label={`وصول سريع داخل ${sector.name_ar}`}>
        <a href="#sector-categories">الأقسام الرئيسية</a>
        {totalContent > 0 && <a href="#sector-content">كل محتوى القطاع</a>}
        <Link href={`/search?q=${sectorQuery}`}>البحث في القطاع</Link>
        <Link href="/all-pages">فهرس المحتوى</Link>
        <Link href="/care-guides/">أدلة التعامل والرعاية</Link>
        <Link href="/evidence-guides/">الأدلة العلمية</Link>
        {sector.slug === 'pediatric-oncology' && <Link href="/search?q=سرطان+الأطفال+دعم+الأسرة">دعم أسرة طفل السرطان</Link>}
      </nav>
      {editorialContent && <section className="section sector-editorial-content" aria-labelledby="sector-editorial-title"><div className="section-heading"><span>الدليل التحريري للقطاع</span><h2 id="sector-editorial-title">{editorialContent.title}</h2>{editorialContent.excerpt && <p>{editorialContent.excerpt}</p>}</div><div className="article-body"><ContentRenderer bodyJson={editorialContent.body_json} bodyText={editorialContent.body_text} recordId={editorialContent.id} /></div></section>}
      <section className="section" id="sector-categories"><div className="section-mini-heading"><div><span className="eyebrow">موضوعات القطاع</span><h2>الأقسام الرئيسية</h2></div><span>{categoryRows.length.toLocaleString('ar')} قسمًا إجمالًا</span></div><div className="category-public-grid">
        {categoryForest.map((node) => { const descendants = countPublicCategoryNodes(node.children); return <article className="public-category-card" key={node.category.id}><Link href={`/sections/${node.category.slug}`}><h3>{node.category.name_ar}</h3></Link><p>{node.category.description || 'قسم متخصص ضمن هذا القطاع.'}</p><PublicCategoryTree nodes={node.children} ariaLabel={`الأقسام المتفرعة من ${node.category.name_ar}`} />{descendants > 0 && <span className="category-descendant-count">{descendants.toLocaleString('ar')} أقسام متفرعة</span>}<Link href={`/sections/${node.category.slug}`}>استعراض القسم ←</Link></article>; })}
        {!categoryForest.length && <div className="empty-state"><strong>لا توجد أقسام عامة متاحة في هذا القطاع حاليًا.</strong></div>}
      </div></section>
      {totalContent > 0 && <section className="section related-content-section" id="sector-content"><div className="section-heading"><span>مكتبة القطاع</span><h2>كل المحتوى المنشور في {sector.name_ar}</h2><p>كل الصفحات المنشورة المصنفة تحت أقسام هذا القطاع تظهر داخليًا هنا؛ قرار فهرسة محركات البحث يبقى مستقلًا على مستوى الصفحة.</p></div>{contentRows.length > 0 ? <><div className="related-content-grid">{contentRows.map((item) => { const href = publicContentHref(item); return <article key={item.id}><span className="content-type-pill">{publicContentTypeLabel(item.content_type)}</span><h3><Link href={href}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}<Link href={href}>قراءة الصفحة ←</Link></article>; })}</div><PublicPagination currentPage={paginationPage} totalPages={contentPages} hrefForPage={(targetPage) => pageHref(sector.slug, targetPage)} ariaLabel={`صفحات محتوى قطاع ${sector.name_ar}`} /></> : <div className="empty-state"><strong>هذه الصفحة خارج نطاق النتائج المتاحة.</strong><span>استخدم أرقام الصفحات للعودة إلى محتوى القطاع.</span><PublicPagination currentPage={paginationPage} totalPages={contentPages} hrefForPage={(targetPage) => pageHref(sector.slug, targetPage)} ariaLabel={`صفحات محتوى قطاع ${sector.name_ar}`} /></div>}</section>}
    </main>
    <SiteFooter />
  </>;
}
