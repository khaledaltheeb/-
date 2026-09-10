import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import ContentRenderer from '@/components/content-renderer';
import { buildSeoMetadata } from '@/lib/seo';
import styles from '@/components/evidence-guides.module.css';

const CANONICAL='/evidence-guides/dyslexia-norway-school-observation-toolkit/';
const FALLBACK_TITLE='حزمة المدرسة لملاحظة صعوبات القراءة والرياضيات واللغة: من الملاحظة إلى الإحالة';
const FALLBACK_DESCRIPTION='أداة مدرسية عربية لتوثيق صعوبات القراءة والرياضيات واللغة، وتجربة دعم أولي وقياس الاستجابة وتجهيز إحالة منظمة ودقيقة.';

export const dynamic='force-static';
export const revalidate=3600;

type RecordRow={
 id:string; title:string; excerpt:string|null; body_json:unknown; body_text:string|null;
 seo_title:string|null; seo_description:string|null; canonical_url:string|null;
};

async function getToolkit():Promise<RecordRow|null>{
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,'');
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!base||!key)return null;
 const params=new URLSearchParams({
   select:'id,title,excerpt,body_json,body_text,seo_title,seo_description,canonical_url',
   status:'eq.published',
   content_type:'eq.guide',
   canonical_url:`eq.${CANONICAL}`,
   limit:'1',
 });
 try{
  const response=await fetch(`${base}/rest/v1/content?${params.toString()}`,{
   headers:{apikey:key,Authorization:`Bearer ${key}`,Accept:'application/json'},
   next:{revalidate:3600,tags:['dyslexia-norway-school-toolkit']},
  });
  if(!response.ok)return null;
  const rows=await response.json() as unknown;
  return Array.isArray(rows)&&rows[0]&&typeof rows[0]==='object'?rows[0] as RecordRow:null;
 }catch{return null;}
}

export async function generateMetadata():Promise<Metadata>{
 const record=await getToolkit();
 return buildSeoMetadata({
  title:record?.seo_title||record?.title||FALLBACK_TITLE,
  description:record?.seo_description||record?.excerpt||FALLBACK_DESCRIPTION,
  path:record?.canonical_url||CANONICAL,
  index:true,
  follow:true,
  type:'article',
  keywords:['عسر القراءة','الديسلكسيا','عسر الحساب','اضطراب اللغة النمائي','ملاحظة صعوبات التعلم','الإحالة المدرسية','دعم التعلم المدرسي'],
 });
}

export default async function SchoolObservationToolkitPage(){
 const record=await getToolkit();
 if(!record)notFound();
 return <><SiteHeader/><main className={styles.shell}>
  <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/evidence-guides/">الأدلة المبنية على المصادر</Link><span>/</span><span aria-current="page">حزمة المدرسة</span></nav>
  <article>
   <header className={styles.articleHero}><span className="eyebrow">صعوبات التعلم والدعم المدرسي</span><h1>{record.title}</h1>{record.excerpt&&<p>{record.excerpt}</p>}</header>
   <nav className={styles.localNav} aria-label="موارد الحزمة"><Link href="/resources/worksheets/dyslexia-reading-observation">ملاحظة القراءة</Link><Link href="/resources/worksheets/dyscalculia-math-observation">ملاحظة الرياضيات</Link><Link href="/resources/worksheets/dld-language-observation">ملاحظة اللغة DLD</Link><Link href="/resources/worksheets/learning-support-four-week-log">متابعة 4 أسابيع</Link></nav>
   <div className={`article-body ${styles.body}`}><ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id}/></div>
   <section className={styles.related} aria-labelledby="toolkit-worksheets"><div className={styles.groupHead}><h2 id="toolkit-worksheets">أوراق العمل المرتبطة</h2><span>للطباعة والاستخدام المدرسي</span></div><div className={styles.grid}>
    <article className={styles.card}><h3><Link href="/resources/worksheets/learning-referral-evidence-pack">حزمة الإحالة</Link></h3><p>تنظيم الأدلة المدرسية والسياقية قبل الإحالة المتخصصة.</p></article>
    <article className={styles.card}><h3><Link href="/resources/worksheets/family-school-learning-communication">تنسيق الأسرة والمدرسة</Link></h3><p>توحيد الملاحظات والأهداف والمتابعة بين المنزل والمدرسة.</p></article>
   </div></section>
  </article>
 </main><SiteFooter/></>;
}
