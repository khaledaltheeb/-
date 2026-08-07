import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd } from '@/lib/seo';

export const dynamic='force-dynamic';
export const metadata:Metadata=buildSeoMetadata({title:'أقسام المنصة',description:'تصفح أقسام منصة روافد المنظمة حسب القطاعات، مع بنية ديناميكية تسهّل الوصول إلى المعرفة والخدمات والمحتوى المتخصص.',path:'/sections',index:true,keywords:['أقسام روافد','أدلة الصحة النفسية','التعافي','ذوو الاحتياجات الخاصة','الدمج','المعرفة الصحية']});

export default async function SectionsIndex(){
  const supabase=await createClient();
  const {data:categories}=await supabase.from('categories').select('id,slug,name_ar,description,sector_id,parent_id,sort_order,sectors(slug,name_ar,accent)').eq('is_active',true).eq('visibility','public').order('sort_order').order('name_ar');
  const rows=categories??[];
  const breadcrumbs=breadcrumbJsonLd([{name:'الرئيسية',path:'/'},{name:'الأقسام',path:'/sections'}]);
  return <><SiteHeader/><main className="sector-page-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbs).replace(/</g,'\\u003c')}}/><nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الأقسام</span></nav>
    <section className="sector-hero"><span className="eyebrow">Dynamic Sections</span><h1>أقسام روافد</h1><p>الأقسام هي الطبقة التنظيمية تحت القطاعات، وتظهر هنا تلقائيًا عند تفعيلها للعامة. صُممت البنية لاستيعاب القطاعات الواسعة مثل ذوي الاحتياجات الخاصة والدمج بعدد كبير من الأقسام والأقسام الفرعية دون إنشاء ملفات Route جديدة.</p></section>
    <section className="rawafid-section"><div className="rawafid-section-head"><div className="rawafid-section-title"><span>التصنيف</span><h2>الأقسام العامة</h2><p>{rows.length?`${rows.length} قسمًا متاحًا حاليًا.`:'لا توجد أقسام منشورة بعد.'}</p></div></div>
      {rows.length?<div className="directory-grid">{rows.map((category)=>{const sector=Array.isArray(category.sectors)?category.sectors[0]:category.sectors;return <article className="directory-card" key={category.id}><div className="directory-card-top"><div className="profile-placeholder"><PlatformIcon name="knowledge" size={22}/></div><div>{sector&&<span className="verified-label">{sector.name_ar}</span>}<h2>{category.name_ar}</h2>{category.parent_id&&<p className="professional-title">قسم فرعي</p>}</div></div><p className="directory-bio">{category.description||'قسم معرفي منظم ضمن بنية روافد.'}</p><div className="directory-meta">{sector&&<span>{sector.name_ar}</span>}<span>قسم ديناميكي</span></div><Link className="directory-open" href={`/sections/${category.slug}`}>فتح القسم</Link></article>})}</div>:<div className="rawafid-empty"><div className="rawafid-empty-icon"><PlatformIcon name="knowledge" size={30}/></div><h3>الثيم جاهز للأقسام</h3><p>أضف قطاعًا ثم أقسامه من لوحة الإدارة. ستظهر هنا وفي صفحات القطاع والبحث تلقائيًا.</p></div>}
    </section>
  </main><SiteFooter/></>;
}
