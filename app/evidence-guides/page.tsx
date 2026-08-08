import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import { evidenceGuideCategory, getEvidenceGuideHub, getEvidenceGuideItems } from '@/lib/evidence-guides';
import styles from '@/components/evidence-guides.module.css';

export const dynamic='force-dynamic';

export async function generateMetadata():Promise<Metadata>{
 const hub=await getEvidenceGuideHub();
 return buildSeoMetadata({title:hub?.seo_title||hub?.title||'الأدلة العربية المبنية على المصادر',description:hub?.seo_description||hub?.excerpt,path:'/evidence-guides/',index:hub?.robots_index!==false,follow:hub?.robots_follow!==false,type:'website',keywords:[hub?.primary_keyword??'أدلة مبنية على المصادر',...(hub?.semantic_terms??[])]});
}

export default async function EvidenceGuidesPage(){
 const [hub,items]=await Promise.all([getEvidenceGuideHub(),getEvidenceGuideItems()]);
 const grouped=new Map<string,typeof items>(); for(const item of items){const key=evidenceGuideCategory(item); grouped.set(key,[...(grouped.get(key)??[]),item]);}
 const schema={'@context':'https://schema.org','@type':'CollectionPage','@id':`${SITE_URL}/evidence-guides/#page`,url:`${SITE_URL}/evidence-guides/`,name:hub?.title||'الأدلة العربية المبنية على المصادر',description:hub?.excerpt||undefined,inLanguage:'ar',isPartOf:{'@id':`${SITE_URL}/#website`},publisher:{'@id':`${SITE_URL}/#organization`},mainEntity:{'@type':'ItemList',numberOfItems:items.length,itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.title,url:`${SITE_URL}${item.canonical_url}`}))}};
 return <><SiteHeader/><main className={styles.shell}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/><nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الأدلة المبنية على المصادر</span></nav><section className={styles.hero}><span className="eyebrow">مكتبة عملية قابلة للتدقيق</span><h1>{hub?.title||'الأدلة العربية المبنية على المصادر'}</h1><p>{hub?.excerpt||'أدلة عربية عملية تربط الفهم بالمصادر الأصلية وحدود الاستخدام.'}</p><div className={styles.stats}><strong>{items.length}</strong><span>دليلًا منشورًا · مصادر أصلية · مسارات محفوظة</span></div></section><section className={styles.guideIntro}><h2>كيف تستخدم هذه المكتبة؟</h2><p>ابدأ بالمشكلة أو السؤال الأقرب لاحتياجك. افحص الفروق المهمة، مؤشرات التقييم، الخطوات منخفضة المخاطر وحدود الدليل، ثم ارجع إلى المصادر الأصلية المرفقة. هذه الصفحات للتثقيف ولا تحول المعلومات العامة إلى تشخيص أو خطة علاج فردية.</p></section>{[...grouped.entries()].map(([category,rows])=><section className={styles.group} key={category}><div className={styles.groupHead}><h2>{category}</h2><span>{rows.length} دليل</span></div><div className={styles.grid}>{rows.map((item)=><article className={styles.card} key={item.id}><span>{item.references_json?.length??0} مصادر</span><h3><Link href={item.canonical_url||`/evidence-guides/${item.slug.replace(/^evidence-guides-/,'')}/`}>{item.title}</Link></h3>{item.excerpt&&<p>{item.excerpt}</p>}<Link className={styles.read} href={item.canonical_url||'#'}>فتح الدليل ←</Link></article>)}</div></section>)}</main><SiteFooter/></>;
}
