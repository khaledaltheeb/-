import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import KidsLabPrintButton from '@/components/kids-lab-print-button';
import { buildSeoMetadata } from '@/lib/seo';
import { getVisualPerceptionActivitiesForSeries, getVisualPerceptionActivity, getVisualPerceptionSeries, visualPerceptionActivities } from '@/lib/capabilities/visual-perception-lab';
import styles from '../../../kids-lab.module.css';

type Props = { params: Promise<{ series: string; activity: string }> };
export function generateStaticParams() { return visualPerceptionActivities.map((activity)=>({series:activity.seriesSlug,activity:activity.slug})); }
export async function generateMetadata({params}:Props):Promise<Metadata>{const {series,activity}=await params;const item=getVisualPerceptionActivity(series,activity);if(!item)return{};return buildSeoMetadata({title:`${item.seriesTitle} - ${item.label} | نشاط إدراك بصري قابل للطباعة`,description:`${item.purpose} ${item.instruction}`,path:`/capabilities/kids-lab/visual-perception/${series}/${activity}/`,index:true,keywords:[item.seriesTitle,'الإدراك البصري للأطفال','نشاط قابل للطباعة',item.label]});}

export default async function VisualPerceptionActivityPage({params}:Props){const {series:seriesSlug,activity:activitySlug}=await params;const series=getVisualPerceptionSeries(seriesSlug);const activity=getVisualPerceptionActivity(seriesSlug,activitySlug);if(!series||!activity)notFound();const seriesActivities=getVisualPerceptionActivitiesForSeries(seriesSlug);const index=seriesActivities.findIndex((item)=>item.slug===activity.slug);const previous=index>0?seriesActivities[index-1]:null;const next=index<seriesActivities.length-1?seriesActivities[index+1]:null;const imageUrl=`/capabilities/kids-lab/visual-perception/${seriesSlug}/${activity.slug}/image/`;
return <><div className={styles.noPrint}><SiteHeader/></div><main className={styles.shell}>
<nav className={`breadcrumbs ${styles.noPrint}`} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><Link href="/capabilities/kids-lab/visual-perception/">الإدراك البصري</Link><span>/</span><Link href={`/capabilities/kids-lab/visual-perception/${series.slug}/`}>{series.title}</Link><span>/</span><span aria-current="page">{activity.label}</span></nav>
<div className={styles.activityLayout}><section className={styles.worksheetFrame} aria-label="معاينة ورقة الإدراك البصري">
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={imageUrl} alt={`${activity.seriesTitle} - ${activity.label}`}/>
</section><aside className={`${styles.sidePanel} ${styles.noPrint}`}>
<section className={styles.infoCard}><span className={styles.kicker}>{activity.label}</span><h1>{activity.seriesTitle}</h1><div className={styles.metaRow}><span className={styles.metaChip}>العمر: {activity.age}</span><span className={styles.metaChip}>المدة: {activity.duration}</span><span className={styles.metaChip}>المستوى: {activity.level}/5</span></div><p><strong>لماذا تستخدم؟</strong><br/>{activity.purpose}</p><p><strong>تعليمات سريعة:</strong><br/>{activity.instruction}</p><p><strong>درجة هذا المستوى:</strong><br/>{activity.progression}</p></section>
<section className={styles.infoCard}><h2>المعاينة والطباعة</h2><p>عاين الورقة أولًا، ثم اطبعها مباشرة أو احفظها PDF من نافذة الطباعة. نسخة SVG تحافظ على الدقة عند التكبير والطباعة.</p><div className={styles.actions}><KidsLabPrintButton/><a className={styles.secondaryButton} href={imageUrl} download={`${series.slug}-${activity.slug}.svg`}>تنزيل الصورة SVG</a></div></section>
<section className={styles.infoCard}><h3>{activity.kind==='test'?'معيار إتقان المستوى':'ما الذي نراقبه؟'}</h3><p>{activity.kind==='test'?activity.mastery:activity.metric}</p><p><strong>تكييف سريع:</strong> {activity.supportTip}</p>{activity.kind==='test'&&<p><strong>تنبيه:</strong> اختبار الإتقان هذا خاص بهذه المهمة وليس اختبار إدراك بصري معياريًا أو تشخيصيًا.</p>}</section>
<div className={styles.actions}>{previous&&<Link className={styles.secondaryButton} href={`/capabilities/kids-lab/visual-perception/${series.slug}/${previous.slug}/`}>السابق</Link>}{next&&<Link className={styles.primaryButton} href={`/capabilities/kids-lab/visual-perception/${series.slug}/${next.slug}/`}>التالي</Link>}</div>
</aside></div></main><div className={styles.noPrint}><SiteFooter/></div></>;
}
