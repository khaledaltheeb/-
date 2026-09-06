import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import KidsLabPrintButton from '@/components/kids-lab-print-button';
import { buildSeoMetadata } from '@/lib/seo';
import { getVisualMotorActivitiesForSeries, getVisualMotorActivity, getVisualMotorSeries, visualMotorActivities } from '@/lib/capabilities/visual-motor-lab';
import styles from '../../../kids-lab.module.css';

type Props={params:Promise<{series:string;activity:string}>};
export function generateStaticParams(){return visualMotorActivities.map((activity)=>({series:activity.seriesSlug,activity:activity.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {series,activity}=await params;const item=getVisualMotorActivity(series,activity);if(!item)return{};return buildSeoMetadata({title:`${item.seriesTitle} - ${item.label} | نشاط قابل للطباعة`,description:`${item.purpose} ${item.instruction}`,path:`/capabilities/kids-lab/visual-motor/${series}/${activity}/`,index:true,keywords:[item.seriesTitle,'التكامل البصري الحركي','نشاط قابل للطباعة',item.label]});}

export default async function VisualMotorActivityPage({params}:Props){const {series:seriesSlug,activity:activitySlug}=await params;const series=getVisualMotorSeries(seriesSlug),activity=getVisualMotorActivity(seriesSlug,activitySlug);if(!series||!activity)notFound();const items=getVisualMotorActivitiesForSeries(seriesSlug),idx=items.findIndex((i)=>i.slug===activity.slug),previous=idx>0?items[idx-1]:null,next=idx<items.length-1?items[idx+1]:null,imageUrl=`/capabilities/kids-lab/visual-motor/${seriesSlug}/${activity.slug}/image/`;return <><div className={styles.noPrint}><SiteHeader/></div><main className={styles.shell}>
<nav className={`breadcrumbs ${styles.noPrint}`} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/capabilities/kids-lab/">مختبر الأطفال</Link><span>/</span><Link href="/capabilities/kids-lab/visual-motor/">التكامل البصري الحركي</Link><span>/</span><Link href={`/capabilities/kids-lab/visual-motor/${series.slug}/`}>{series.title}</Link><span>/</span><span aria-current="page">{activity.label}</span></nav>
<div className={styles.activityLayout}><section className={styles.worksheetFrame} aria-label="معاينة ورقة النشاط">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={imageUrl} alt={`${activity.seriesTitle} - ${activity.label}`}/></section><aside className={`${styles.sidePanel} ${styles.noPrint}`}>
<section className={styles.infoCard}><span className={styles.kicker}>{activity.label}</span><h1>{activity.seriesTitle}</h1><div className={styles.metaRow}><span className={styles.metaChip}>العمر: {activity.age}</span><span className={styles.metaChip}>المدة: {activity.duration}</span><span className={styles.metaChip}>المستوى: {activity.level}/5</span></div><p><strong>لماذا تستخدم؟</strong><br/>{activity.purpose}</p><p><strong>تعليمات سريعة:</strong><br/>{activity.instruction}</p><p><strong>درجة هذا المستوى:</strong><br/>{activity.progression}</p></section>
<section className={styles.infoCard}><h2>المعاينة والطباعة</h2><p>شاهد الورقة بالحجم الكامل قبل الاستخدام. يمكن طباعتها مباشرة أو حفظها PDF، أو تنزيل SVG للطباعة عالية الدقة.</p><div className={styles.actions}><KidsLabPrintButton/><a className={styles.secondaryButton} href={imageUrl} download={`${series.slug}-${activity.slug}.svg`}>تنزيل الصورة SVG</a></div></section>
<section className={styles.infoCard}><h3>{activity.kind==='test'?'معيار إتقان المستوى':'ما الذي نراقبه؟'}</h3><p>{activity.kind==='test'?activity.mastery:activity.observation}</p>{activity.kind==='test'&&<p><strong>تنبيه:</strong> هذا اختبار إتقان للمهمة داخل السلسلة، وليس اختبارًا معياريًا للتكامل البصري الحركي أو أداة تشخيص.</p>}</section>
<div className={styles.actions}>{previous&&<Link className={styles.secondaryButton} href={`/capabilities/kids-lab/visual-motor/${series.slug}/${previous.slug}/`}>السابق</Link>}{next&&<Link className={styles.primaryButton} href={`/capabilities/kids-lab/visual-motor/${series.slug}/${next.slug}/`}>التالي</Link>}</div>
</aside></div></main><div className={styles.noPrint}><SiteFooter/></div></>}
