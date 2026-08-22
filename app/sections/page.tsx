import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import PublicCategoryTree from '@/components/public-category-tree';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { buildPublicCategoryForest, countPublicCategoryNodes } from '@/lib/public-category-tree';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildSeoMetadata({
  title: 'أقسام منصة روافد',
  description: 'تصفح أقسام منصة روافد مرتبة تحت قطاعاتها الرئيسية ضمن شجرة تصنيف كاملة تحافظ على الوصول إلى جميع الأقسام العامة مهما ازداد عمقها.',
  path: '/sections',
  index: true,
  keywords: ['أقسام روافد', 'الصحة النفسية', 'ذوي الاحتياجات الخاصة والدمج', 'التربية الدامجة', 'التعافي', 'المعرفة النفسية'],
});

type Sector = { id: string; slug: string; name_ar: string; description: string | null; sort_order: number };
type Category = { id: string; slug: string; name_ar: string; description: string | null; sector_id: string | null; parent_id: string | null; sort_order: number };

export default async function SectionsIndex() {
  const supabase = await createClient();
  const [{ data: sectors }, { data: categories }] = await Promise.all([
    supabase.from('sectors').select('id,slug,name_ar,description,sort_order').eq('is_active', true).eq('visibility', 'public').order('sort_order').order('name_ar'),
    supabase.from('categories').select('id,slug,name_ar,description,sector_id,parent_id,sort_order').eq('is_active', true).eq('visibility', 'public').order('sort_order').order('name_ar'),
  ]);
  const sectorRows = (sectors ?? []) as Sector[];
  const categoryRows = (categories ?? []) as Category[];
  const publicSectorIds = new Set(sectorRows.map((sector) => sector.id));
  const unassignedCategories = categoryRows.filter((category) => !category.sector_id || !publicSectorIds.has(category.sector_id));
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الأقسام', path: '/sections' }]);

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الأقسام</span></nav>

      <section className="public-index-hero" aria-labelledby="sections-title">
        <span className="eyebrow"><PlatformIcon name="knowledge" size={18} /> دليل الموضوعات</span>
        <h1 id="sections-title">أقسام روافد</h1>
        <p>خريطة موضوعية كاملة مرتبة حسب القطاعات الرئيسية. تعرض البنية الهرمية للأقسام مهما ازداد عمقها، وتبقي الأقسام العامة قابلة للوصول حتى أثناء تحديث التصنيف.</p>
        <div className="public-stat-strip"><span>{sectorRows.length.toLocaleString('ar')} قطاعات</span><span>{categoryRows.length.toLocaleString('ar')} قسمًا وقسمًا فرعيًا</span><span>شجرة تصنيف كاملة دون إسقاط مستويات</span></div>
        <form className="sector-search" action="/search" method="get" role="search"><label className="sr-only" htmlFor="sections-search">البحث في روافد</label><input id="sections-search" name="q" placeholder="ابحث عن موضوع أو حالة أو سؤال" maxLength={160} /><button type="submit">بحث</button></form>
      </section>

      <nav className="sector-quick-nav" aria-label="مسارات مباشرة من دليل الأقسام">
        <Link href="/sectors">كل القطاعات</Link>
        <Link href="/all-pages">فهرس المحتوى</Link>
        <Link href="/sectors/pediatric-oncology">سرطان الأطفال</Link>
        <Link href="/care-guides/">أدلة التعامل والرعاية</Link>
        <Link href="/evidence-guides/">الأدلة العلمية</Link>
        <Link href="/encyclopedia/">الموسوعة</Link>
      </nav>

      <section className="taxonomy-sector-stack" aria-label="الأقسام مرتبة حسب القطاع">
        {sectorRows.map((sector) => {
          const sectorCategories = categoryRows.filter((category) => category.sector_id === sector.id);
          const forest = buildPublicCategoryForest(sectorCategories);
          return <article className="taxonomy-sector-group" key={sector.id}>
            <header className="taxonomy-sector-heading">
              <div><span className="eyebrow">قطاع رئيسي</span><h2>{sector.name_ar}</h2><p>{sector.description || 'موضوعات مترابطة تجمع المعرفة والأدلة والخدمات ضمن هذا المجال.'}</p></div>
              <Link href={`/sectors/${sector.slug}`}>صفحة القطاع ←</Link>
            </header>
            <div className="taxonomy-root-grid">
              {forest.map((node) => {
                const descendants = countPublicCategoryNodes(node.children);
                return <section className="taxonomy-root-card" key={node.category.id}>
                  <h3><Link href={`/sections/${node.category.slug}`}>{node.category.name_ar}</Link></h3>
                  <p>{node.category.description || 'قسم متخصص ضمن هذا القطاع.'}</p>
                  <PublicCategoryTree nodes={node.children} ariaLabel={`الأقسام المتفرعة من ${node.category.name_ar}`} />
                  <div className="taxonomy-root-meta"><Link href={`/sections/${node.category.slug}`}>فتح القسم ←</Link>{descendants > 0 && <span>{descendants.toLocaleString('ar')} أقسام متفرعة</span>}</div>
                </section>;
              })}
              {forest.length === 0 && <div className="empty-state"><strong>لا توجد أقسام عامة في هذا القطاع حاليًا.</strong></div>}
            </div>
          </article>;
        })}

        {unassignedCategories.length > 0 && (() => {
          const forest = buildPublicCategoryForest(unassignedCategories);
          return <article className="taxonomy-sector-group taxonomy-sector-group--fallback">
            <header className="taxonomy-sector-heading"><div><span className="eyebrow">وصول احتياطي</span><h2>أقسام عامة إضافية</h2><p>أقسام منشورة لا ترتبط حاليًا بقطاع عام ظاهر. تبقى معروضة هنا حتى لا يؤدي أي تعديل تصنيفي إلى إخفائها عن المستخدم.</p></div></header>
            <div className="taxonomy-root-grid">{forest.map((node) => <section className="taxonomy-root-card" key={node.category.id}><h3><Link href={`/sections/${node.category.slug}`}>{node.category.name_ar}</Link></h3><p>{node.category.description || 'قسم عام في منصة روافد.'}</p><PublicCategoryTree nodes={node.children} ariaLabel={`الأقسام المتفرعة من ${node.category.name_ar}`} /><div className="taxonomy-root-meta"><Link href={`/sections/${node.category.slug}`}>فتح القسم ←</Link></div></section>)}</div>
          </article>;
        })()}
      </section>
    </main>
    <SiteFooter />
  </>;
}
