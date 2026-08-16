import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { COGNITIVE_ROOT_SLUG, getCognitiveCategories, getCognitiveCategory, getCognitivePageIndex } from '@/lib/cognitive-program';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ page?: string | string[]; q?: string | string[] }>;
type Category = { id: string; sector_id: string | null; parent_id: string | null; slug: string; name_ar: string; description: string | null; seo_title: string | null; seo_description: string | null };
type Item = { id: string; slug: string; title: string; excerpt: string | null; content_type: string; published_at: string | null };

const PAGE_SIZE = 24;
const CONTENT_TYPE_LABELS: Record<string, string> = {
  article: 'مقال', guide: 'دليل', condition: 'حالة', research: 'بحث/دراسة', comparison: 'مقارنة',
  tool: 'أداة', assessment: 'تقييم', intervention: 'تدخل', protocol: 'بروتوكول', course: 'دورة',
  learning_path: 'مسار تعلم', resource: 'مورد', calendar: 'تقويم', glossary_term: 'مصطلح',
  faq: 'أسئلة شائعة', directory_page: 'صفحة دليل', news: 'خبر', sector_page: 'صفحة قطاع', landing_page: 'صفحة تعريفية',
};

const contentTypeLabel = (value: string) => CONTENT_TYPE_LABELS[value] ?? 'محتوى';
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? '' : value ?? '';
const pageNo = (value: string) => { const number = Number(value); return Number.isInteger(number) && number > 0 && number < 10000 ? number : 1; };
const qSafe = (value: string) => value.trim().replace(/[%_(),]/g, ' ').replace(/\s+/g, ' ').slice(0, 100);
const href = (slug: string, page: number, query: string) => { const params = new URLSearchParams(); if (page > 1) params.set('page', String(page)); if (query) params.set('q', query); return `/sections/${slug}${params.size ? `?${params}` : ''}`; };

async function dbCategory(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('id,sector_id,parent_id,slug,name_ar,description,seo_title,seo_description').eq('slug', slug).eq('is_active', true).eq('visibility', 'public').maybeSingle();
  return data as Category | null;
}

function virtualCategory(slug: string): Category | null {
  const category = getCognitiveCategory(slug);
  return category ? { id: `virtual:${slug}`, sector_id: 'f9af56ce-734c-4867-9999-957db0933414', parent_id: '369841c2-d33b-43a5-ad04-8dff6f40747e', slug, name_ar: category.name, description: category.description, seo_title: null, seo_description: null } : null;
}

async function resolvedCategory(slug: string) {
  return await dbCategory(slug) ?? virtualCategory(slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await resolvedCategory(slug);
  if (!category) return {};
  return buildSeoMetadata({
    title: category.seo_title || category.name_ar,
    description: category.seo_description || category.description || `${category.name_ar} في منصة روافد: محتوى عربي موثوق ومترابط.`,
    path: `/sections/${slug}`,
    index: true,
    keywords: [category.name_ar, 'العمليات المعرفية', 'علم النفس المعرفي', 'منصة روافد'],
  });
}

export default async function SectionPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const category = await resolvedCategory(slug);
  if (!category) notFound();

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

  if (isRoot || virtual) {
    const generated = getCognitivePageIndex()
      .filter((item) => isRoot || item.categorySlug === slug)
      .map((item) => ({ id: `cognitive:${item.slug}`, slug: item.slug, title: item.title, excerpt: item.excerpt, content_type: item.contentType, published_at: '2026-08-14T00:00:00.000Z' }));
    let existing: Item[] = [];
    if (isRoot) {
      const { data } = await supabase.from('content').select('id,slug,title,excerpt,content_type,published_at').eq('category_id', category.id).eq('status', 'published').lte('published_at', now).eq('robots_index', true).order('title');
      existing = (data ?? []) as Item[];
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
    const [{ data: sectorData }, { data: parentData }, { data: children }] = await Promise.all([
      category.sector_id ? supabase.from('sectors').select('slug,name_ar').eq('id', category.sector_id).maybeSingle() : Promise.resolve({ data: null }),
      category.parent_id ? supabase.from('categories').select('slug,name_ar').eq('id', category.parent_id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from('categories').select('slug,name_ar,description').eq('parent_id', category.id).eq('is_active', true).eq('visibility', 'public').order('sort_order'),
    ]);
    sector = sectorData as typeof sector;
    parent = parentData as typeof parent;
    childCards = (children ?? []) as typeof childCards;
    let contentQuery = supabase.from('content').select('id,slug,title,excerpt,content_type,published_at', { count: 'exact' }).eq('category_id', category.id).eq('status', 'published').lte('published_at', now).eq('robots_index', true).order('published_at', { ascending: false }).order('title');
    if (query) contentQuery = contentQuery.ilike('title', `%${query}%`);
    const { data, count } = await contentQuery.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    rows = (data ?? []) as Item[];
    total = count ?? 0;
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canonical = `${SITE_URL}/sections/${slug}`;
  const schemas = [
    breadcrumbJsonLd([
      { name: 'الرئيسية', path: '/' },
      { name: 'القطاعات', path: '/sectors' },
      ...(sector ? [{ name: sector.name_ar, path: `/sectors/${sector.slug}` }] : []),
      ...(parent ? [{ name: parent.name_ar, path: `/sections/${parent.slug}` }] : []),
      { name: category.name_ar, path: `/sections/${slug}` },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${canonical}#collection`,
      url: canonical,
      name: category.name_ar,
      description: category.description || undefined,
      inLanguage: 'ar',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: total,
        itemListElement: rows.map((item, index) => ({ '@type': 'ListItem', position: (page - 1) * PAGE_SIZE + index + 1, name: item.title, url: `${SITE_URL}/content/${item.slug}` })),
      },
    },
  ];

  return <>
    <SiteHeader />
    <main className="site-shell sector-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link prefetch={false} href="/">الرئيسية</Link><span>/</span><Link prefetch={false} href="/sectors">القطاعات</Link>
        {sector && <><span>/</span><Link prefetch={false} href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link></>}
        {parent && <><span>/</span><Link prefetch={false} href={`/sections/${parent.slug}`}>{parent.name_ar}</Link></>}
        <span>/</span><span aria-current="page">{category.name_ar}</span>
      </nav>
      <section className="sector-hero compact-hero">
        <span className="eyebrow">موسوعة موضوعية مترابطة</span><h1>{category.name_ar}</h1><p>{category.description}</p>
        <div className="tag-list"><span>{total.toLocaleString('ar')} صفحة</span>{childCards.length > 0 && <span>{childCards.length.toLocaleString('ar')} مجموعات موضوعية</span>}</div>
        <form className="sector-search" action={`/sections/${slug}`} method="get"><label className="sr-only" htmlFor="section-search">البحث داخل القسم</label><input id="section-search" name="q" defaultValue={query} placeholder={`ابحث داخل ${category.name_ar}`} maxLength={100} /><button type="submit">بحث</button></form>
      </section>

      {childCards.length > 0 && <section className="section"><div className="section-mini-heading"><div><span className="eyebrow">مسارات مترابطة</span><h2>المجموعات الموضوعية</h2></div><Link prefetch={false} className="section-text-link" href="/sections">جميع الأقسام ←</Link></div><div className="category-public-grid">{childCards.map((child) => <article className="public-category-card" key={child.slug}><Link prefetch={false} href={`/sections/${child.slug}`}><h3>{child.name_ar}</h3></Link><p>{child.description}</p><Link prefetch={false} href={`/sections/${child.slug}`}>استعراض الصفحات ←</Link></article>)}</div></section>}

      <section className="section related-content-section">
        <div className="section-heading"><span>محتوى القسم</span><h2>{query ? `نتائج البحث عن «${query}»` : 'المحتوى المنشور في هذا القسم'}</h2><p>مواد مرتبطة بموضوع القسم، منظمة لتسهيل الوصول إلى الشرح والأدلة والموارد ذات الصلة.</p></div>
        {rows.length ? <><div className="related-content-grid">{rows.map((item) => <article key={item.id}><span>{contentTypeLabel(item.content_type)}</span><h3><Link prefetch={false} href={`/content/${item.slug}`}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}<Link prefetch={false} href={`/content/${item.slug}`}>قراءة الصفحة ←</Link></article>)}</div>{pages > 1 && <nav className="section-pagination" aria-label="صفحات نتائج القسم">{page > 1 && <Link prefetch={false} href={href(slug, page - 1, query)} rel="prev">الصفحة السابقة</Link>}<span>الصفحة {page.toLocaleString('ar')} من {pages.toLocaleString('ar')}</span>{page < pages && <Link prefetch={false} href={href(slug, page + 1, query)} rel="next">الصفحة التالية</Link>}</nav>}</> : <div className="empty-state"><strong>لا توجد نتيجة مطابقة.</strong><span>جرّب مصطلحًا أقصر أو انتقل إلى مجموعة موضوعية.</span><Link prefetch={false} href="/sections">تصفح جميع الأقسام ←</Link></div>}
      </section>
    </main>
    <SiteFooter />
  </>;
}
