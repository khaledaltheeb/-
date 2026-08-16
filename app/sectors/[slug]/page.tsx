import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentRenderer from '@/components/content-renderer';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { resolveSectorAccent } from '@/lib/theme';
import { publicContentHref, publicContentTypeLabel } from '@/lib/public-content-routing';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
type Sector = { id: string; slug: string; name_ar: string; description: string | null; accent: string | null; seo_title: string | null; seo_description: string | null; editorial_content_id: string | null };
type Category = { id: string; slug: string; name_ar: string; description: string | null; parent_id: string | null; sort_order: number };
type PublishedItem = { id: string; slug: string; title: string; excerpt: string | null; content_type: string; published_at: string | null; canonical_url: string | null };
type EditorialContent = { id: string; title: string; excerpt: string | null; body_json: unknown; body_text: string | null };

async function getSector(slug: string): Promise<Sector | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('sectors').select('id,slug,name_ar,description,accent,seo_title,seo_description,editorial_content_id').eq('slug', slug).eq('is_active', true).eq('visibility', 'public').maybeSingle();
  return data as Sector | null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const sector = await getSector(slug);
  if (!sector) return {};
  return buildSeoMetadata({
    title: sector.seo_title || sector.name_ar,
    description: sector.seo_description || sector.description || `${sector.name_ar} في منصة روافد: أقسام مترابطة ومحتوى عربي موثوق ومسارات وصول منظمة حسب احتياج المستخدم.`,
    path: `/sectors/${sector.slug}`,
    index: true,
    keywords: [sector.name_ar, 'منصة روافد'],
  });
}

export default async function SectorPage({ params }: { params: Params }) {
  const { slug } = await params;
  const sector = await getSector(slug);
  if (!sector) notFound();
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

  let contentRows: PublishedItem[] = [];
  if (categoryIds.length > 0) {
    const { data: mappings } = await supabase.from('content_categories').select('content_id').eq('is_primary', true).in('category_id', categoryIds);
    const contentIds = [...new Set((mappings ?? []).map((mapping) => mapping.content_id).filter(Boolean))] as string[];
    if (contentIds.length > 0) {
      const { data: content } = await supabase.from('content').select('id,slug,title,excerpt,content_type,published_at,canonical_url').in('id', contentIds).eq('status', 'published').lte('published_at', now).eq('robots_index', true).order('published_at', { ascending: false }).limit(18);
      contentRows = (content ?? []) as PublishedItem[];
    }
  }

  const roots = categoryRows.filter((category) => !category.parent_id);
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'القطاعات', path: '/sectors' }, { name: sector.name_ar, path: `/sectors/${sector.slug}` }]);
  const accentStyle = { '--accent': resolveSectorAccent(sector.accent) } as CSSProperties;

  return <>
    <SiteHeader />
    <main className="site-shell sector-page" style={accentStyle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors">القطاعات</Link><span>/</span><span aria-current="page">{sector.name_ar}</span></nav>

      <section className="sector-hero">
        <span className="eyebrow">قطاع رئيسي</span>
        <h1>{sector.name_ar}</h1>
        <p>{sector.description || 'قطاع رئيسي يجمع موضوعات مترابطة ضمن منصة روافد.'}</p>
        <div className="public-stat-strip"><span>{roots.length.toLocaleString('ar')} أقسام رئيسية</span><span>{categoryRows.length.toLocaleString('ar')} قسمًا وقسمًا فرعيًا</span>{contentRows.length > 0 && <span>محتوى منشور ومترابط</span>}</div>
        <form className="sector-search" action="/search" method="get"><label className="sr-only" htmlFor="sector-search">ابحث في منصة روافد</label><input id="sector-search" name="q" placeholder={`ابحث عن موضوع مرتبط بـ ${sector.name_ar}`} maxLength={160} /><button type="submit">بحث</button></form>
      </section>

      {editorialContent && <section className="section sector-editorial-content" aria-labelledby="sector-editorial-title"><div className="section-heading"><span>الدليل التحريري للقطاع</span><h2 id="sector-editorial-title">{editorialContent.title}</h2>{editorialContent.excerpt && <p>{editorialContent.excerpt}</p>}</div><div className="article-body"><ContentRenderer bodyJson={editorialContent.body_json} bodyText={editorialContent.body_text} recordId={editorialContent.id} /></div></section>}

      <section className="section">
        <div className="section-mini-heading"><div><span className="eyebrow">موضوعات القطاع</span><h2>الأقسام الرئيسية</h2></div><span>{categoryRows.length.toLocaleString('ar')} قسمًا إجمالًا</span></div>
        <div className="category-public-grid">
          {roots.map((category) => {
            const children = categoryRows.filter((candidate) => candidate.parent_id === category.id);
            return <article className="public-category-card" key={category.id}>
              <Link href={`/sections/${category.slug}`}><h3>{category.name_ar}</h3></Link>
              <p>{category.description || 'قسم متخصص ضمن هذا القطاع.'}</p>
              {children.length > 0 && <div className="subcategories">{children.map((child) => <Link href={`/sections/${child.slug}`} key={child.id}>{child.name_ar}</Link>)}</div>}
              <Link href={`/sections/${category.slug}`}>استعراض القسم ←</Link>
            </article>;
          })}
          {!roots.length && <div className="empty-state"><strong>لا توجد أقسام عامة متاحة في هذا القطاع حاليًا.</strong></div>}
        </div>
      </section>

      {contentRows.length > 0 && <section className="section related-content-section">
        <div className="section-heading"><span>مختارات حديثة</span><h2>أحدث المحتوى في {sector.name_ar}</h2><p>مواد منشورة ومصنفة ضمن أقسام هذا القطاع، مع فتح كل مادة على عنوانها العام المعتمد.</p></div>
        <div className="related-content-grid">{contentRows.map((item) => {
          const href = publicContentHref(item);
          return <article key={item.id}><span className="content-type-pill">{publicContentTypeLabel(item.content_type)}</span><h3><Link href={href}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}<Link href={href}>قراءة الصفحة ←</Link></article>;
        })}</div>
      </section>}
    </main>
    <SiteFooter />
  </>;
}