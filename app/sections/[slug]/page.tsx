import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
type Category = { id: string; sector_id: string | null; parent_id: string | null; slug: string; name_ar: string; description: string | null; seo_title: string | null; seo_description: string | null };
type PublishedItem = { id: string; slug: string; title: string; excerpt: string | null; content_type: string; published_at: string | null };

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('id,sector_id,parent_id,slug,name_ar,description,seo_title,seo_description').eq('slug', slug).eq('is_active', true).eq('visibility', 'public').maybeSingle();
  return data as Category | null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return buildSeoMetadata({
    title: category.seo_title || category.name_ar,
    description: category.seo_description || category.description || `${category.name_ar} في منصة روافد: محتوى منشور وأقسام فرعية مترابطة ضمن بنية معرفية واضحة وقابلة للتوسع.`,
    path: `/sections/${category.slug}`,
    index: true,
    keywords: [category.name_ar, 'منصة روافد'],
  });
}

export default async function SectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [{ data: sector }, { data: parent }, { data: children }, { data: content }] = await Promise.all([
    category.sector_id ? supabase.from('sectors').select('slug,name_ar').eq('id', category.sector_id).eq('is_active', true).eq('visibility', 'public').maybeSingle() : Promise.resolve({ data: null }),
    category.parent_id ? supabase.from('categories').select('slug,name_ar').eq('id', category.parent_id).eq('is_active', true).eq('visibility', 'public').maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('categories').select('id,slug,name_ar,description').eq('parent_id', category.id).eq('is_active', true).eq('visibility', 'public').order('sort_order').order('name_ar'),
    supabase.from('content').select('id,slug,title,excerpt,content_type,published_at').eq('category_id', category.id).eq('status', 'published').lte('published_at', now).eq('robots_index', true).order('published_at', { ascending: false }).limit(24),
  ]);

  const contentRows = (content ?? []) as PublishedItem[];
  const breadcrumbItems = [
    { name: 'الرئيسية', path: '/' },
    ...(sector ? [{ name: sector.name_ar, path: `/sectors/${sector.slug}` }] : []),
    ...(parent ? [{ name: parent.name_ar, path: `/sections/${parent.slug}` }] : []),
    { name: category.name_ar, path: `/sections/${category.slug}` },
  ];
  const breadcrumbs = breadcrumbJsonLd(breadcrumbItems);

  return (
    <>
      <SiteHeader />
      <main className="site-shell sector-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link>
          {sector && <><span>/</span><Link href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link></>}
          {parent && <><span>/</span><Link href={`/sections/${parent.slug}`}>{parent.name_ar}</Link></>}
          <span>/</span><span aria-current="page">{category.name_ar}</span>
        </nav>

        <section className="sector-hero compact-hero">
          <span className="eyebrow">قسم ديناميكي</span><h1>{category.name_ar}</h1><p>{category.description || 'قسم معرفي متخصص ضمن منصة روافد.'}</p>
          <form className="sector-search" action="/search" method="get"><label className="sr-only" htmlFor="section-search">البحث في روافد</label><input id="section-search" name="q" placeholder={`ابحث عن موضوع مرتبط بـ ${category.name_ar}`} maxLength={160} /><button type="submit">بحث</button></form>
        </section>

        {(children?.length ?? 0) > 0 && <section className="section"><div className="section-mini-heading"><div><span className="eyebrow">Subsections</span><h2>الأقسام الفرعية</h2></div><span>{children?.length ?? 0} قسم</span></div><div className="category-public-grid">{(children ?? []).map((child) => <article className="public-category-card" key={child.id}><Link href={`/sections/${child.slug}`}><h3>{child.name_ar}</h3></Link><p>{child.description || 'قسم فرعي ضمن البنية المعرفية.'}</p></article>)}</div></section>}

        <section className="section related-content-section">
          <div className="section-heading"><span>Topical Authority</span><h2>المحتوى المنشور في هذا القسم</h2><p>تُبنى الروابط الداخلية من علاقة الصفحة بالقطاع والقسم، وتظهر المواد المنشورة المعتمدة فقط.</p></div>
          {contentRows.length > 0 ? <div className="related-content-grid">{contentRows.map((item) => <article key={item.id}><span>{item.content_type}</span><h3><Link href={`/content/${item.slug}`}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}<Link href={`/content/${item.slug}`}>قراءة الصفحة ←</Link></article>)}</div> : <div className="empty-state"><strong>لا يوجد محتوى منشور في هذا القسم بعد.</strong><span>البنية جاهزة لإضافة المحتوى بعد اكتمال الثيم والاختبارات.</span></div>}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
