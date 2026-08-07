import type { CSSProperties } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export default async function SectorPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: sector } = await supabase
    .from('sectors')
    .select('id,slug,name_ar,description,accent')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!sector) notFound();

  const { data: categories } = await supabase
    .from('categories')
    .select('id,slug,name_ar,description,parent_id,sort_order')
    .eq('sector_id', sector.id)
    .eq('is_active', true)
    .order('sort_order')
    .order('name_ar');

  const categoryRows = categories ?? [];
  const roots = categoryRows.filter((category) => !category.parent_id);
  const accentStyle = { '--accent': sector.accent || '#0f8f88' } as CSSProperties;

  return (
    <main className="site-shell sector-page" style={accentStyle}>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="منصة روافد الرئيسية">
          <span className="brand-mark">ر</span>
          <span><strong>روافد</strong><small>Rawafid</small></span>
        </Link>
        <Link className="button" href="/#sectors">كل القطاعات</Link>
      </header>

      <section className="sector-hero">
        <span className="eyebrow">قطاع ديناميكي</span>
        <h1>{sector.name_ar}</h1>
        <p>{sector.description || 'قطاع معرفي وخدمي ضمن منصة روافد.'}</p>
      </section>

      <section className="section">
        <div className="section-mini-heading">
          <h2>الأقسام</h2>
          <span>{categoryRows.length} قسم</span>
        </div>
        <div className="category-public-grid">
          {roots.map((category) => {
            const children = categoryRows.filter((candidate) => candidate.parent_id === category.id);
            return (
              <article className="public-category-card" key={category.id}>
                <Link href={`/sections/${category.slug}`}><h3>{category.name_ar}</h3></Link>
                <p>{category.description || 'قسم متخصص ضمن هذا القطاع.'}</p>
                {children.length > 0 && (
                  <div className="subcategories">
                    {children.map((child) => <Link href={`/sections/${child.slug}`} key={child.id}>{child.name_ar}</Link>)}
                  </div>
                )}
              </article>
            );
          })}
          {!roots.length && <p className="empty-state">لم تُضف أقسام لهذا القطاع بعد.</p>}
        </div>
      </section>

      <footer><strong>{sector.name_ar}</strong><span>البنية جاهزة لإضافة المحتوى لاحقًا بعد أمر الترحيل.</span></footer>
    </main>
  );
}
