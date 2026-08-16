import type { Metadata } from 'next';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import TermFavorites from '@/components/term-favorites';
import { getTerminologyToolTerms } from '@/lib/terminology-tools';
import styles from '../tools.module.css';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'محفوظات مصطلحات علم النفس',description:'احفظ روابط المصطلحات النفسية التي تريد الرجوع إليها محليًا على جهازك، دون رفع قائمة المحفوظات إلى الخادم أو ربطها بحسابك.',alternates:{canonical:'/tools/favorites'},robots:{index:false,follow:true,noarchive:true}};
export default async function FavoritesPage(){const terms=await getTerminologyToolTerms();return <><SiteHeader/><main className={styles.page}><section className={styles.hero}><div className={styles.shell}><span className={styles.eyebrow}>محفوظات محلية</span><h1>المصطلحات المحفوظة</h1><p>استعدنا وظيفة المحفوظات القديمة لكن ربطناها بالمصطلحات المنشورة الحالية وحدها.</p></div></section><section className={`${styles.shell} ${styles.section}`}><TermFavorites terms={terms}/></section></main><SiteFooter/></>}
