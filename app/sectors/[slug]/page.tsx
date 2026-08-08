import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { resolveSectorAccent } from '@/lib/theme';

export const dynamic = 'force-dynamic';
type Params = Promise<{ slug: string }>;
type Sector = { id: string; slug: string; name_ar: string; description: string | null; accent: string | null; seo_title: string | null; seo_description: string | null };
type PublishedItem = { id: string; slug: string; title: string; excerpt: string | null; content_type: string; published_at: string | null };

async function getSector(slug: string): Promise<Sector | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('sectors').select('id,slug,name_ar,description,accent,seo_title,seo_description').eq('slug', slug).eq('is_active', true).eq('visibility', 'public').maybeSingle();
  return data as Sector | null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const sector = await getSector(slug);
  if (!sector) return {};
  return buildSeoMetadata({
    title: sector.seo_title || sector.name_ar,
    description: sector.seo_description || sector.description || `${sector.name_ar} في منصة روافد: أقسام مترابطة ومحتوى منشور موثوق ومسارات وصول منظمة حسب احتياج المستخدم.`,
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
  const [{ data: categories }, { data: content }] = await Promise.all([
    supabase.from('categories').select('id,slug,name_ar,description,parent_id,sort_order').eq('sector_id', sector.id).eq('is_active', true).eq('visibility', 'public').order('sort_order').order('name_ar'),
    supabase.from('content').select('id,slug,title,excerpt,content_type,published_at').eq('sector_id', sector.id).eq('status', 'published').lte('published_at', now).eq('robots_index', true).order('published_at', { ascending: false }).limit(18),
  ]);
  const categoryRows = categories ?? [];
  const roots = categoryRows.filter((category) => !category.parent_id);
  const contentRows = (content ?? []) as PublishedItem[];
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: sector.name_ar, path: `/sectors/${sector.slug}` }]);
  const accentStyle = { '--accent': resolveSectorAccent(sector.accent) } as CSSProperties;

  return (
    <>
      <SiteHeader />
      <main className="site-shell sector-page" style={accentStyle}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">{sector.name_ar}</span></nav>
        <section className="sector-hero">
          <span className="eyebrow">قطاع ديناميكي</span><h1>{sector.name_ar}</h1><p>{sector.description || 'قطاع معرفي وخدمي ضمن منصة روافد.'}</p>
          <form className="sector-search" action="/search" method="get"><label className="sr-only" htmlFor="sector-search">ابحث في منصة روافد</label><input id="sector-search" name="q" placeholder={`ابحث عن موضوع مرتبط بـ ${sector.name_ar}`} maxLength={160} /><button type="submit">بحث</button></form>
        </section>

        <section className="section">
          <div className="section-mini-heading"><div><span className="eyebrow">Taxonomy</span><h2>الأقسام</h2></div><span>{categoryRows.length} قسم</span></div>
          <div className="category-public-grid">
            {roots.map((category) => {
              const children = categoryRows.filter((candidate) => candidate.parent_id === category.id);
              return <article className="public-category-card" key={category.id}><Link href={`/sections/${category.slug}`}><h3>{category.name_ar}</h3></Link><p>{category.description || 'قسم متخصص ضمن هذا القطاع.'}</p>{children.length > 0 && <div className="subcategories">{children.map((child) => <Link href={`/sections/${child.slug}`} key={child.id}>{child.name_ar}</Link>)}</div>}</article>;
            })}
            {!roots.length && <div className="empty-state"><strong>لم تُضف أقسام عامة لهذا القطاع بعد.</strong><span>يمكن إضافتها من لوحة الإدارة دون إنشاء صفحة برمجية جديدة.</span></div>}
          </div>
        </section>

        {contentRows.length > 0 && <section className="section related-content-section"><div className="section-heading"><span>Published Knowledge</span><h2>أحدث المحتوى في القطاع</h2><p>روابط داخلية إلى المواد المنشورة المعتمدة ضمن هذا القطاع.</p></div><div className="related-content-grid">{contentRows.map((item) => <article key={item.id}><span>{item.content_type}</span><h3><Link href={`/content/${item.slug}`}>{item.title}</Link></h3>{item.excerpt && <p>{item.excerpt}</p>}<Link href={`/content/${item.slug}`}>قراءة الصفحة ←</Link></article>)}</div></section>}
      </main>
      <SiteFooter />
    </>
  );
}
