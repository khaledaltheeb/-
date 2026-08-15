import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { resolveSectorAccent } from '@/lib/theme';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildSeoMetadata({
  title: 'قطاعات منصة روافد',
  description: 'استكشف قطاعات منصة روافد المنظمة للصحة النفسية والاحتياجات الخاصة والتربية الدامجة والأسرة والتعافي والمعرفة والمشاركة المجتمعية.',
  path: '/sectors',
  index: true,
  keywords: ['قطاعات روافد', 'الصحة النفسية', 'الاحتياجات الخاصة', 'التربية الدامجة', 'الإدمان والتعافي', 'المعرفة النفسية'],
});

type Sector = { id: string; slug: string; name_ar: string; description: string | null; accent: string | null; sort_order: number };
type Category = { id: string; sector_id: string | null; parent_id: string | null };

export default async function SectorsIndex() {
  const supabase = await createClient();
  const [{ data: sectors }, { data: categories }] = await Promise.all([
    supabase.from('sectors').select('id,slug,name_ar,description,accent,sort_order').eq('is_active', true).eq('visibility', 'public').order('sort_order').order('name_ar'),
    supabase.from('categories').select('id,sector_id,parent_id').eq('is_active', true).eq('visibility', 'public'),
  ]);
  const rows = (sectors ?? []) as Sector[];
  const categoryRows = (categories ?? []) as Category[];
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'القطاعات', path: '/sectors' }]);

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">القطاعات</span></nav>

      <section className="public-index-hero" aria-labelledby="sectors-title">
        <span className="eyebrow">الخريطة الرئيسية للمنصة</span>
        <h1 id="sectors-title">قطاعات روافد</h1>
        <p>بوابات رئيسية تجمع المعرفة والأدلة والخدمات في مجالات واضحة. يبدأ كل قطاع بموضوعاته الأساسية، ثم يتفرع إلى أقسام أكثر تخصصًا لتسهيل الوصول وبناء رحلة تصفح مترابطة.</p>
        <div className="public-stat-strip"><span>{rows.length.toLocaleString('ar')} قطاعات رئيسية</span><span>{categoryRows.length.toLocaleString('ar')} قسمًا وقسمًا فرعيًا</span><span>تصنيف موحد للمحتوى المنشور</span></div>
      </section>

      {rows.length > 0 ? <section className="institutional-sector-grid" aria-label="قطاعات منصة روافد">
        {rows.map((sector, index) => {
          const sectorCategories = categoryRows.filter((category) => category.sector_id === sector.id);
          const rootCount = sectorCategories.filter((category) => !category.parent_id).length;
          const childCount = sectorCategories.length - rootCount;
          const style = { '--sector-color': resolveSectorAccent(sector.accent) } as CSSProperties;
          return <Link className="institutional-sector-card" href={`/sectors/${sector.slug}`} key={sector.id} style={style}>
            <span className="sector-number">{String(index + 1).padStart(2, '0')}</span>
            <h2>{sector.name_ar}</h2>
            <p>{sector.description || 'قطاع رئيسي يجمع موضوعات مترابطة ضمن بنية معرفية وخدمية واضحة.'}</p>
            <div className="sector-metrics"><span>{rootCount.toLocaleString('ar')} أقسام رئيسية</span>{childCount > 0 && <span>{childCount.toLocaleString('ar')} أقسام فرعية</span>}</div>
            <span className="sector-open">استكشف القطاع ←</span>
          </Link>;
        })}
      </section> : <div className="rawafid-empty"><h2>لا توجد قطاعات عامة متاحة حاليًا.</h2><p>ستظهر القطاعات هنا بعد اعتمادها للنشر العام.</p></div>}
    </main>
    <SiteFooter />
  </>;
}
