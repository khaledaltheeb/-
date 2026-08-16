import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata } from '@/lib/seo';
import styles from './audiences.module.css';

export const metadata: Metadata = buildSeoMetadata({ title:'مسارات روافد حسب دور القارئ', description:'مسارات فعلية للأفراد والأسر والمعلمين والطلاب والمختصين، منقولة من صفحات الجمهور القديمة ومطورة داخل الموقع الجديد.', path:'/audiences', index:true, follow:true });
const roles=[['person','لنفسي','فهم تجربة أو تغير نفسي دون تحويل القراءة إلى تشخيص ذاتي.'],['family','للأسرة ومقدمي الرعاية','تحويل الملاحظات اليومية إلى دعم منظم يحفظ الكرامة والاستقلال.'],['teacher','للمعلمين والمرشدين','فهم الحواجز التعليمية والبيئية وبناء تكييفات قابلة للملاحظة.'],['student','للطلاب والمتعلمين','تنظيم الصعوبات الدراسية والنوم والقلق والتركيز وطلب الدعم المناسب.'],['professional','للمختصين والمتدربين','استخدام روافد كطبقة معرفة ومصادر وإحالة مع احترام حدود الممارسة المهنية.']] as const;
export default function AudiencesPage(){return <><SiteHeader/><main className={styles.page}><section className={styles.hero}><div className={styles.shell}><span className={styles.eyebrow}>مسارات الجمهور المنقولة</span><h1>اختر المسار بحسب دورك</h1><p>بدل تحويل صفحات الجمهور القديمة إلى صفحة واحدة، أصبحت كل فئة صفحة فعلية تحتفظ بهدفها ومحتواها وتضيف مسارًا عمليًا مناسبًا للقارئ.</p></div></section><section className={`${styles.shell} ${styles.grid}`}>{roles.map(([slug,title,body])=><article key={slug} className={styles.card}><h2>{title}</h2><p>{body}</p><Link href={`/audiences/${slug}`}>فتح المسار</Link></article>)}</section></main><SiteFooter/></>}
