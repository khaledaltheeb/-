import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export default async function SectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from('categories')
    .select('id,sector_id,parent_id,slug,name_ar,description')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!category) notFound();

  const [{ data: sector }, { data: parent }, { data: children }] = await Promise.all([
    category.sector_id
      ? supabase.from('sectors').select('slug,name_ar').eq('id', category.sector_id).eq('is_active', true).maybeSingle()
      : Promise.resolve({ data: null }),
    category.parent_id
      ? supabase.from('categories').select('slug,name_ar').eq('id', category.parent_id).eq('is_active', true).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('categories').select('id,slug,name_ar,description').eq('parent_id', category.id).eq('is_active', true).order('sort_order').order('name_ar'),
  ]);

  return (
    <main className="site-shell sector-page">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="منصة روافد الرئيسية">
          <span className="brand-mark">ر</span>
          <span><strong>روافد</strong><small>Rawafid</small></span>
        </Link>
        {sector && <Link className="button" href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link>}
      </header>

      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link>
        {sector && <><span>/</span><Link href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link></>}
        {parent && <><span>/</span><Link href={`/sections/${parent.slug}`}>{parent.name_ar}</Link></>}
        <span>/</span><span aria-current="page">{category.name_ar}</span>
      </nav>

      <section className="sector-hero compact-hero">
        <span className="eyebrow">قسم ديناميكي</span>
        <h1>{category.name_ar}</h1>
        <p>{category.description || 'قسم معرفي متخصص ضمن منصة روافد.'}</p>
      </section>

      <section className="section">
        <div className="section-mini-heading"><h2>الأقسام الفرعية</h2><span>{children?.length ?? 0} قسم</span></div>
        <div className="category-public-grid">
          {(children ?? []).map((child) => (
            <article className="public-category-card" key={child.id}>
              <Link href={`/sections/${child.slug}`}><h3>{child.name_ar}</h3></Link>
              <p>{child.description || 'قسم فرعي ضمن البنية التحريرية.'}</p>
            </article>
          ))}
          {!children?.length && <p className="empty-state">لا توجد أقسام فرعية بعد. المحتوى سيُضاف لاحقًا بعد اكتمال الثيم.</p>}
        </div>
      </section>
    </main>
  );
}
