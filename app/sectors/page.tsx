import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd } from '@/lib/seo';

export const dynamic='force-dynamic';
export const metadata:Metadata=buildSeoMetadata({title:'قطاعات المنصة',description:'استكشف قطاعات منصة روافد المعرفية والخدمية المنظمة، وانتقل إلى الأقسام والصفحات والخدمات المرتبطة بكل قطاع.',path:'/sectors',index:true,keywords:['قطاعات روافد','الصحة النفسية','التعافي','الدمج','التمكين']});

export default async function SectorsIndex(){
  const supabase=await createClient();
  const {data:sectors}=await supabase.from('sectors').select('id,slug,name_ar,description,accent,sort_order').eq('is_active',true).eq('visibility','public').order('sort_order').order('name_ar');
  const rows=sectors??[];
  const breadcrumbs=breadcrumbJsonLd([{name:'الرئيسية',path:'/'},{name:'القطاعات',path:'/sectors'}]);
  return <><SiteHeader/><main className="sector-page-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbs).replace(/</g,'\\u003c')}}/><nav className="breadcrumbs" aria-label="مسار الصفحة"><Link prefetch={false} href="/">الرئيسية</Link><span>/</span><span aria-current="page">القطاعات</span></nav>
    <section className="sector-hero"><span className="eyebrow">Platform Taxonomy</span><h1>قطاعات روافد</h1><p>طبقة التصنيف العليا في المنصة. أي قطاع يضيفه المدير ويجعله عامًا يظهر هنا تلقائيًا ويصبح جاهزًا لاستقبال الأقسام والمحتوى.</p></section>
    <section className="rawafid-section"><div className="rawafid-section-head"><div className="rawafid-section-title"><span>استكشف</span><h2>القطاعات النشطة</h2><p>{rows.length?`${rows.length} قطاعًا متاحًا حاليًا.`:'لا توجد قطاعات منشورة بعد لأننا ما زلنا في مرحلة الثيم الفارغ.'}</p></div></div>
      {rows.length?<div className="rawafid-sector-grid">{rows.map((sector,index)=><Link prefetch={false} className="rawafid-sector-card" href={`/sectors/${sector.slug}`} key={sector.id} style={{'--sector-color':sector.accent||'#08716d'} as React.CSSProperties}><div className="rawafid-sector-top"><span className="rawafid-sector-index">{String(index+1).padStart(2,'0')}</span><span className="rawafid-sector-icon"><PlatformIcon name="knowledge" size={26}/></span></div><h3>{sector.name_ar}</h3><p>{sector.description||'قطاع منظم ضمن منصة روافد.'}</p><span className="rawafid-sector-link">فتح القطاع ←</span></Link>)}</div>:<div className="rawafid-empty"><div className="rawafid-empty-icon"><PlatformIcon name="knowledge" size={30}/></div><h3>الثيم جاهز للقطاعات</h3><p>عند إضافة أول قطاع من لوحة الإدارة سيظهر هنا وفي Mega Menu والبحث وخريطة الموقع تلقائيًا.</p></div>}
    </section>
  </main><SiteFooter/></>;
}
