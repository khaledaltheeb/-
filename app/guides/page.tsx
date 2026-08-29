import type { Metadata } from 'next';
import Link from 'next/link';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { legacyGuides } from '@/lib/legacy-guides';
import { buildSeoMetadata } from '@/lib/seo';
import styles from './legacy-guides.module.css';

export const metadata: Metadata = buildSeoMetadata({ title:'الأدلة المنقولة والمطورة', description:'الأدلة التاريخية في روافد بعد نقل محتواها إلى التطبيق الجديد بدل تحويل الروابط، مع مصادر رسمية ومسارات أعمق داخل المنصة.', path:'/guides', index:true, follow:true });

export default function GuidesPage(){return <><SiteHeader/><main className={styles.page}><section className={styles.hero}><div className={styles.shell}><span className={styles.eyebrow}>نقل محتوى فعلي</span><h1>الأدلة التاريخية أصبحت صفحات حقيقية داخل روافد الجديدة</h1><p className={styles.lead}>هذه المجموعة تحفظ محتوى الأدلة القصيرة القديمة داخل المسارات نفسها بدل استخدام redirects. كل صفحة تحتفظ بالفكرة الأصلية وتضيف أسئلة عملية ومصدرًا رسميًا وحدودًا واضحة، ثم تشير إلى المحتوى الأعمق عند توفره.</p></div></section><section className={`${styles.shell} ${styles.grid}`}>{legacyGuides.map((guide)=><article className={styles.card} key={guide.slug}><span className={styles.eyebrow}>{guide.englishLabel}</span><h2>{guide.title}</h2><p>{guide.definition}</p><Link href={`/guides/${guide.slug}`}>فتح الدليل المنقول</Link></article>)}</section></main><SiteFooter/></>}
