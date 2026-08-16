import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getTerminologyToolTerms } from '@/lib/terminology-tools';
import styles from '../tools.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'مصطلح اليوم', description: 'مصطلح نفسي عربي يتغير يوميًا من بين المواد المنشورة والمراجعة في روافد، مع تعريف مختصر ورابط للمقال الكامل.', alternates: { canonical: '/tools/daily-term' } };

export default async function DailyTermPage() {
  const terms=await getTerminologyToolTerms(); const now=new Date(); const day=Math.floor(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())/86400000); const term=terms.length?terms[((day%terms.length)+terms.length)%terms.length]:null;
  return <><SiteHeader/><main className={styles.page}><section className={styles.hero}><div className={styles.shell}><span className={styles.eyebrow}>يتغير مرة كل يوم</span><h1>مصطلح اليوم</h1><p>الاختيار حتمي حسب التاريخ ويأتي فقط من المصطلحات المنشورة، لذلك يرى الزوار المصطلح نفسه في اليوم نفسه.</p></div></section><section className={`${styles.shell} ${styles.section}`}><article className={styles.panel}>{term?<><h2>{term.title}</h2><p>{term.excerpt||'اقرأ المقال الموسوعي الكامل لفهم المصطلح وحدوده.'}</p><Link className={styles.button} href={term.canonicalUrl}>قراءة المصطلح كاملًا</Link></>:<><h2>لا يوجد مصطلح متاح الآن</h2><p>تعذر تحميل قائمة المصطلحات المنشورة.</p></>}</article></section></main><SiteFooter/></>;
}
