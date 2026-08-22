import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentRenderer from '@/components/content-renderer';
import LegacyPreservedPageView from '@/components/legacy-preserved-page';
import PublicPagination from '@/components/public-pagination';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { getLegacyPreservedPage, legacyPreservedMetadata } from '@/lib/legacy-preserved-page';
import { COGNITIVE_ROOT_SLUG, getCognitiveCategories, getCognitiveCategory, getCognitivePageIndex } from '@/lib/cognitive-program';
import { publicContentHref, publicContentTypeLabel } from '@/lib/public-content-routing';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ page?: string | string[]; q?: string | string[] }>;
type Category = { id: string; sector_id: string | null; parent_id: string | null; slug: string; name_ar: string; description: string | null; seo_title: string | null; seo_description: string | null; editorial_content_id: string | null };
type Item = { id: string; slug: string; title: string; excerpt: string | null; content_type: string; published_at: string | null; canonical_url: string | null };
type EditorialContent = { id: string; title: string; excerpt: string | null; body_json: unknown; body_text: string | null };
const PAGE_SIZE = 24;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? '' : value ?? '';
const pageNo = (value: string) => { const n = Number(value); return Number.isInteger(n) && n > 0 && n < 10000 ? n : 1; };
const qSafe = (value: string) => value.trim().replace(/[%_(),]/g, ' ').replace(/\s+/g, ' ').slice(0, 100);
const pageHref = (slug: string, page: number, q: string) => { const params = new URLSearchParams(); if (page > 1) params.set('page', String(page)); if (q) params.set('q', q); return `/sections/${slug}${params.size ? `?${params}` : ''}`; };
const legacyRoute = (slug: string) => `/sections/${slug}/`;

async function dbCategory(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('id,sector_id,parent_id,slug,name_ar,description,seo_title,seo_description,editorial_content_id').eq('slug', slug).eq('is_active', true).eq('visibility', 'public').maybeSingle();
  return data as Category | null;
}

function virtualCategory(slug: string): Category | null {
  const category = getCognitiveCategory(slug);
  return category ? { id: `virtual:${slug}`, sector_id: 'f9af56ce-734c-4867-9999-957db0933414', parent_id: '369841c2-d33b-43a5-ad04-8dff6f40747e', slug, name_ar: category.name, description: category.description, seo_title: null, seo_description: null, editorial_content_id: null } : null;
}
async function resolvedCategory(slug: string) { return await dbCategory(slug) ?? virtualCategory(slug); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await resolvedCategory(slug);
  if (!category) {
    const route = legacyRoute(slug);
    return legacyPreservedMetadata(await getLegacyPreservedPage(route), route);
  }
  return buildSeoMetadata({ title: category.seo_title || category.name_ar, description: category.seo_description || category.description || `${category.name_ar} في منصة روافد: محتوى عربي موثوق ومترابط.`, path: `/sections/${slug}`, index: true, keywords: [category.name_ar, 'منصة روافد', 'دليل موضوعي'] });
}

export default async function SectionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const category = await resolvedCategory(slug);
  if (!category) {
    const route = legacyRoute(slug);
    const preserved = await getLegacyPreservedPage(route);
    if (!preserved) notFound();
    return <LegacyPreservedPageView page={preserved} route={route} />;
  }
  const page = pageNo(one(raw.page));
  const query = qSafe(one(raw.q));
  const supabase = await createClient();
  const now = new Date().toISOString();
  const isRoot = slug === COGNITIVE_ROOT_SLUG;
  const virtual = Boolean(getCognitiveCategory(slug));

  let rows: Item[] = [];
  let total = 0;
  let childCards: Array<{ slug: string; name_ar: string; description: string | null }> = [];
  let sector: { slug: string; name_ar: string } | null = null;
  let parent: { slug: string; name_ar: string } | null = null;
  let editorialContent: EditorialContent | null = null;

  if (!virtual && category.editorial_content_id) {
    const { data } = await supabase.from('content').select('id,title,excerpt,body_json,body_text').eq('id', category.editorial_content_id).eq('status', 'published').lte('published_at', now).maybeSingle();
    editorialContent = data as EditorialContent | null;
  }

  if (isRoot || virtual) {
    const generated = getCognitivePageIndex().filter((item) => isRoot || item.categorySlug === slug).map((item) => ({ id: `cognitive:${item.slug}`, slug: item.slug, title: item.title, excerpt: item.excerpt, content_type: item.contentType, published_at: '2026-08-14T00:00:00.000Z', canonical_url: null }));
    let existing: Item[] = [];
    if (isRoot) {
      const { data: mappings } = await supabase.from('content_categories').select('content_id').eq('category_id', category.id).eq('is_primary', true);
      const ids = [...new Set((mappings ?? []).map((mapping) => mapping.content_id).filter(Boolean))] as string[];
      if (ids.length > 0) {
        const { data } = await supabase.from('content').select('id,slug,title,excerpt,content_type,published_at,canonical_url').in('id', ids).eq('status', 'published').lte('published_at', now).eq('robots_index', true).order('title');
        existing = (data ?? []) as Item[];
      }
      childCards = getCognitiveCategories().map((item) => ({ slug: item.slug, name_ar: item.name, description: item.description }));
    } else {
      parent = { slug: COGNITIVE_ROOT_SLUG, name_ar: 'المصطلحات والعمليات المعرفية' };
    }
    sector = { slug: 'knowledge', name_ar: 'المعرفة والموسوعة' };
    const bySlug = new Map<string, Item>();
    for (const item of [...existing, ...generated]) if (!bySlug.has(item.slug)) bySlug.set(item.slug, item);
    let all = [...bySlug.values()];
    if (query) all = all.filter((item) => `${item.title} ${item.excerpt ?? ''}`.includes(query));
    all.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    total = all.length;
    rows = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  } else {
    const [{ data: sec }, { data: par }, { data: children }, { data: mappings }] = await Promise.all([
      category.sector_id ? supabase.from('sectors').select('slug,name_ar').eq('id', category.sector_id).maybeSingle() : Promise.resolve({ data: null }),
      category.parent_id ? supabase.from('categories').select('slug,name_ar').eq('id', category.parent_id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from('categories').select('slug,name_ar,description').eq('parent_id', category.id).eq('is_active', true).eq('visibility', 'public').order('sort_order'),
      supabase.from('content_categories').select('content_id').eq('category_id', category.id).eq('is_primary', true),
    ]);
    sector = sec as typeof sector;
    parent = par as typeof parent;
    childCards = (children ?? []) as typeof childCards;
    const ids = [...new Set((mappings ?? []).map((mapping) => mapping.content_id).filter(Boolean))] as string[];
    if (ids.length > 0) {
      let contentQuery = supabase.from('content').select('id,slug,title,excerpt,content_type,published_at,canonical_url', { count: 'exact' }).in('id', ids).eq('status', 'published').lte('published_at', now).eq('robots_index', true).order('published_at', { ascending: false }).order('title');
      if (query) contentQuery = contentQuery.ilike('title', `%${query}%`);
      const { data, count } = await contentQuery.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      rows = (data ?? []) as Item[];
      total = count ?? 0;
    }
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canonical = `${SITE_URL}/sections/${slug}`;
  const schemas = [
    breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الأقسام', path: '/sections' }, ...(sector ? [{ name: sector.name_ar, path: `/sectors/${sector.slug}` }] : []), ...(parent ? [{ name: parent.name_ar, path: `/sections/${parent.slug}` }] : []), { name: category.name_ar, path: `/sections/${slug}` }]),
    { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${canonical}#collection`, url: canonical, name: category.name_ar, description: category.description || undefined, inLanguage: 'ar', isPartOf: { '@id': `${SITE_URL}/#website` }, mainEntity: { '@type': 'ItemList', numberOfItems: total, itemListElement: rows.map((item, index) => ({ '@type': 'ListItem', position: (page - 1) * PAGE_SIZE + index + 1, name: item.title, url: `${SITE_URL}${publicContentHref(item)}` })) } },
  ];

  return <>
    <SiteHeader />
    <main className="site-shell sector-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/sections">الأقسام</Link>{sector && <><span>/</span><Link href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link></>}{parent && <><span>/</span><Link href={`/sections/${parent.slug}`}>{parent.name_ar}</Link></>}<span>/</span><span aria-current="page">{category.name_ar}</span></nav>
      <section className="sector-hero compact-hero"><span className="eyebrow">قسم معرفي</span><h1>{category.name_ar}</h1><p>{category.description || 'محتوى متخصص ومنظم ضمن منصة روافد.'}</p><div className="public-stat-strip"><span>{total.toLocaleString('ar')} صفحة منشورة</span>{childCards.length > 0 && <span>{childCards.length.toLocaleString('ar')} موضوعات فرعية</span>}</div><form className="sector-search" action={`/sections/${slug}`} method="get"><label className="sr-only" htmlFor="section-search">البحث داخل القسم</label><input id="section-search" name="q" defaultValue={query} placeholder={`ابحث داخل ${category.name_ar}`} maxLength={100} /><button type="submit">بحث</button></form></section>
      <nav className="sector-quick-nav" aria-label={`وصول سريع داخل قسم ${category.name_ar}`}>
        {childCards.length > 0 && <a href="#section-children">الموضوعات الفرعية</a>}
        <a href="#section-content">المحتوى المنشور</a>
        {sector && <Link href={`/sectors/${sector.slug}`}>العودة إلى {sector.name_ar}</Link>}
        {parent && <Link href={`/sections/${parent.slug}`}>القسم الأب: {parent.name_ar}</Link>}
        <Link href="/care-guides/">أدلة التعامل والرعاية</Link>
        <Link href="/evidence-guides/">الأدلة العلمية</Link>
      </nav>
      {editorialContent && <section className="section category-editorial-content" aria-labelledby="category-editorial-title"><div className="section-heading"><span>الدليل التحريري للقسم</span><h2 id="category-editorial-title">{editorialContent.title}</h2>{editorialContent.excerpt && <p>{editorialContent.excerpt}</p>}</div><div className="article-body"><ContentRenderer bodyJson={editorialContent.body_json} bodyText={editorialContent.body_text} recordId={editorialContent.id} /></div></section>}
      {childCards.length > 0 && <section className="section" id="section-children"><div className="section-mini-heading"><div><span className="eyebrow">موضوعات فرعية</span><h2>استكشف داخل القسم</h2></div><span>{childCards.length.toLocaleString('ar')} موضوعات</span></div><div className="category-public-grid">{childCards.map((child) => <article className="public-category-card" key={child.slug}><Link href={`/sections/${child.slug}`}><h3>{child.name_ar}</h3></Link><p>{child.description}</p><Link href={`/sections/${child.slug}`}>استعراض الصفحات ←</Link></article>)}</div></section>}
      <section className="section related-content-section" id="section-content"><div className="section-heading"><span>المحتوى المنشور</span><h2>{query ? `نتائج البحث عن «${query}»` : `محتوى ${category.name_ar}`}</h2><p>صفحات مرتبة ضمن هذا القسم وفق التصنيف الأساسي المعتمد، وتفتح على عناوينها العامة الأصلية.</p></div>{rows.length ? <><div className="related-content-grid">{rows.map((item) => { const href = publicContentHref(item); return <article key={item.id}><span className="content-type-pill">{publicContentTypeLabel(item.content_type)}</span><h3><Link href={href}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}<Link href={href}>قراءة الصفحة ←</Link></article>; })}</div><PublicPagination currentPage={page} totalPages={pages} hrefForPage={(targetPage) => pageHref(slug, targetPage, query)} ariaLabel={`صفحات محتوى قسم ${category.name_ar}`} /></> : <div className="empty-state"><strong>لا توجد نتيجة مطابقة.</strong><span>جرّب مصطلحًا أقصر أو انتقل إلى أحد الموضوعات الفرعية.</span></div>}</section>
    </main>
    <SiteFooter />
  </>;
}