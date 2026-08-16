import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildSeoMetadata({
  title: 'أقسام المنصة',
  description: 'تصفح أقسام منصة روافد المنظمة حسب القطاعات، مع بنية ديناميكية تسهّل الوصول إلى المعرفة والخدمات والمحتوى المتخصص.',
  path: '/sections',
  index: true,
  keywords: ['أقسام روافد', 'أدلة الصحة النفسية', 'التعافي', 'ذوو الاحتياجات الخاصة', 'الدمج', 'المعرفة الصحية'],
});

type SectorRef = {
  slug: string;
  name_ar: string;
  accent: string | null;
  sort_order: number | null;
};

type CategoryRow = {
  id: string;
  slug: string;
  name_ar: string;
  description: string | null;
  sector_id: string | null;
  parent_id: string | null;
  sort_order: number | null;
  sectors: SectorRef | SectorRef[] | null;
};

const sectorOf = (category: CategoryRow): SectorRef | null => Array.isArray(category.sectors) ? category.sectors[0] ?? null : category.sectors;

export default async function SectionsIndex() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id,slug,name_ar,description,sector_id,parent_id,sort_order,sectors(slug,name_ar,accent,sort_order)')
    .eq('is_active', true)
    .eq('visibility', 'public')
    .order('sort_order')
    .order('name_ar');

  const rows = (categories ?? []) as CategoryRow[];
  const rowIds = new Set(rows.map((category) => category.id));
  const roots = rows.filter((category) => !category.parent_id || !rowIds.has(category.parent_id));
  const childrenByParent = new Map<string, CategoryRow[]>();

  for (const category of rows) {
    if (!category.parent_id || !rowIds.has(category.parent_id)) continue;
    const children = childrenByParent.get(category.parent_id) ?? [];
    children.push(category);
    childrenByParent.set(category.parent_id, children);
  }

  const groupMap = new Map<string, { sector: SectorRef | null; roots: CategoryRow[] }>();
  for (const category of roots) {
    const sector = sectorOf(category);
    const key = sector?.slug ?? '__general__';
    const group = groupMap.get(key) ?? { sector, roots: [] };
    group.roots.push(category);
    groupMap.set(key, group);
  }

  const groups = [...groupMap.values()].sort((a, b) => {
    if (!a.sector && b.sector) return 1;
    if (a.sector && !b.sector) return -1;
    const order = (a.sector?.sort_order ?? 9999) - (b.sector?.sort_order ?? 9999);
    return order || (a.sector?.name_ar ?? 'أقسام عامة').localeCompare(b.sector?.name_ar ?? 'أقسام عامة', 'ar');
  });

  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الأقسام', path: '/sections' }]);

  return <>
    <SiteHeader />
    <main className="sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link prefetch={false} href="/">الرئيسية</Link><span>/</span><span aria-current="page">الأقسام</span></nav>
      <section className="sector-hero"><span className="eyebrow">التصفح حسب القسم</span><h1>أقسام روافد</h1><p>تجمع أقسام روافد الموضوعات والخدمات ضمن مسارات واضحة تحت كل قطاع، من الصحة النفسية والتعافي إلى ذوي الاحتياجات الخاصة والدمج والتمكين، لتسهيل الوصول من المجال العام إلى الموضوع الأكثر تحديدًا.</p></section>
      <section className="rawafid-section">
        <div className="rawafid-section-head">
          <div className="rawafid-section-title"><span>التصنيف</span><h2>الأقسام العامة</h2><p>{rows.length ? `${rows.length} قسمًا متاحًا حاليًا، مرتبة تحت قطاعاتها لتسهيل التصفح.` : 'لا توجد أقسام منشورة حاليًا.'}</p></div>
          <Link prefetch={false} className="section-text-link" href="/sectors">استعرض القطاعات أولًا ←</Link>
        </div>

        {groups.length ? groups.map((group) => {
          const heading = group.sector?.name_ar ?? 'أقسام عامة';
          const headingId = group.sector ? `sections-sector-${group.sector.slug}` : 'sections-general';
          return <section className="section" key={group.sector?.slug ?? '__general__'} aria-labelledby={headingId}>
            <div className="section-mini-heading">
              <div><span className="eyebrow">{group.sector ? 'قطاع' : 'تصنيف عام'}</span><h2 id={headingId}>{heading}</h2></div>
              {group.sector ? <Link prefetch={false} className="section-text-link" href={`/sectors/${group.sector.slug}`}>فتح القطاع ←</Link> : <span>{group.roots.length.toLocaleString('ar')} أقسام</span>}
            </div>
            <div className="category-public-grid">
              {group.roots.map((category) => {
                const children = childrenByParent.get(category.id) ?? [];
                return <article className="public-category-card" key={category.id}>
                  <Link prefetch={false} href={`/sections/${category.slug}`}><h3>{category.name_ar}</h3></Link>
                  <p>{category.description || 'قسم معرفي منظم ضمن بنية روافد.'}</p>
                  {children.length > 0 && <div className="subcategories" aria-label={`أقسام فرعية ضمن ${category.name_ar}`}>{children.map((child) => <Link prefetch={false} href={`/sections/${child.slug}`} key={child.id}>{child.name_ar}</Link>)}</div>}
                  <Link prefetch={false} href={`/sections/${category.slug}`}>فتح القسم ←</Link>
                </article>;
              })}
            </div>
          </section>;
        }) : <div className="rawafid-empty"><div className="rawafid-empty-icon"><PlatformIcon name="knowledge" size={30} /></div><h3>لا توجد أقسام منشورة حاليًا</h3><p>ستظهر الأقسام هنا عند إتاحتها للنشر ضمن القطاعات.</p><Link prefetch={false} className="section-text-link" href="/sectors">تصفح القطاعات ←</Link></div>}
      </section>
    </main>
    <SiteFooter />
  </>;
}
