import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildSeoMetadata({
  title: 'أقسام منصة روافد',
  description: 'تصفح أقسام منصة روافد مرتبة تحت قطاعاتها الرئيسية، مع موضوعات فرعية واضحة للصحة النفسية وذوي الاحتياجات الخاصة والدمج والأسرة والتعافي والمعرفة.',
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
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الأقسام', path: '/sections' }]);
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/sections#collection`,
    url: `${SITE_URL}/sections`,
    name: 'أقسام روافد',
    description: 'الخريطة الموضوعية لأقسام منصة روافد تحت القطاعات الرئيسية.',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: categoryRows.length,
      itemListElement: categoryRows.map((category, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: category.name_ar,
        description: category.description || undefined,
        url: `${SITE_URL}/sections/${category.slug}`,
      })),
    },
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collection]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الأقسام</span></nav>

      <section className="public-index-hero" aria-labelledby="sections-title">
        <span className="eyebrow"><PlatformIcon name="knowledge" size={18} /> دليل الموضوعات</span>
        <h1 id="sections-title">أقسام روافد</h1>
        <p>خريطة موضوعية مرتبة حسب القطاعات الرئيسية، من الصحة النفسية وذوي الاحتياجات الخاصة والدمج إلى الأسرة والتعافي والمعرفة. ابدأ بالمجال الأقرب لاحتياجك، ثم انتقل إلى القسم المتخصص أو أحد موضوعاته الفرعية.</p>
        <div className="public-stat-strip"><span>{sectorRows.length.toLocaleString('ar')} قطاعات</span><span>{categoryRows.length.toLocaleString('ar')} قسمًا وقسمًا فرعيًا</span><span>تنقل هرمي واضح</span></div>
        <form className="sector-search" action="/search" method="get" role="search"><label className="sr-only" htmlFor="sections-search">البحث في روافد</label><input id="sections-search" name="q" placeholder="ابحث عن موضوع أو حالة أو سؤال" maxLength={160} /><button type="submit">بحث</button></form>
      </section>

      <nav className="sector-quick-nav" aria-label="مسارات مباشرة من دليل الأقسام">
        <Link href="/sectors">كل القطاعات</Link>
        <Link href="/sectors/pediatric-oncology">سرطان الأطفال</Link>
        <Link href="/care-guides/">أدلة التعامل والرعاية</Link>
        <Link href="/evidence-guides/">الأدلة العلمية</Link>
        <Link href="/encyclopedia/">الموسوعة المختصرة — الصفحات المحفوظة</Link>
      </nav>

      <section className="taxonomy-sector-stack" aria-label="الأقسام مرتبة حسب القطاع">
        {sectorRows.map((sector) => {
          const sectorCategories = categoryRows.filter((category) => category.sector_id === sector.id);
          const roots = sectorCategories.filter((category) => !category.parent_id);
          return <article className="taxonomy-sector-group" key={sector.id}>
            <header className="taxonomy-sector-heading">
              <div><span className="eyebrow">قطاع رئيسي</span><h2>{sector.name_ar}</h2><p>{sector.description || 'موضوعات مترابطة تجمع المعرفة والأدلة والخدمات ضمن هذا المجال.'}</p></div>
              <Link href={`/sectors/${sector.slug}`}>صفحة القطاع ←</Link>
            </header>
            <div className="taxonomy-root-grid">
              {roots.map((category) => {
                const children = sectorCategories.filter((candidate) => candidate.parent_id === category.id);
                return <section className="taxonomy-root-card" key={category.id}>
                  <h3><Link href={`/sections/${category.slug}`}>{category.name_ar}</Link></h3>
                  <p>{category.description || 'قسم متخصص ضمن هذا القطاع.'}</p>
                  {children.length > 0 && <div className="taxonomy-child-links" aria-label={`الأقسام الفرعية في ${category.name_ar}`}>{children.map((child) => <Link href={`/sections/${child.slug}`} key={child.id}>{child.name_ar}</Link>)}</div>}
                </section>;
              })}
              {roots.length === 0 && <div className="empty-state"><strong>هذا القطاع يعمل كمسار متخصص مباشر.</strong><p>لا يحتاج إلى طبقة أقسام مستقلة للوصول إلى محتواه الحالي.</p><Link href={`/sectors/${sector.slug}`}>فتح صفحة القطاع ←</Link></div>}
            </div>
          </article>;
        })}
      </section>
    </main>
    <SiteFooter />
  </>;
}
