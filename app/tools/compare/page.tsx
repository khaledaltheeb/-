import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata } from '@/lib/seo';
import { getTerminologyToolTerms } from '@/lib/terminology-tools';
import styles from '../tools.module.css';

export const dynamic = 'force-dynamic';
export const metadata = buildSeoMetadata({
  title: 'مقارنة مصطلحين نفسيين',
  description: 'قارن تعريفين مختصرين لمصطلحين منشورين في موسوعة روافد وافتح الصفحتين الكاملتين للتحقق من الفروق والسياق.',
  path: '/tools/compare',
  index: true,
});
type SP = Promise<{ a?: string; b?: string }>;

export default async function CompareTermsPage({ searchParams }: { searchParams: SP }) {
  const terms = await getTerminologyToolTerms(); const params = await searchParams; const bySlug = new Map(terms.map((term)=>[term.slug,term]));
  const first = bySlug.get(String(params.a||'')) ?? terms[0]; const secondCandidate = bySlug.get(String(params.b||'')) ?? terms.find((term)=>term.slug!==first?.slug); const second = secondCandidate?.slug===first?.slug ? terms.find((term)=>term.slug!==first.slug) : secondCandidate;
  return <><SiteHeader/><main className={styles.page}><section className={styles.hero}><div className={styles.shell}><span className={styles.eyebrow}>أداة تعليمية</span><h1>مقارنة مصطلحين</h1><p>المقارنة لا تستنتج تشخيصًا؛ تعرض الوصف المنشور لكل مفهوم وتفتح المصدر الموسوعي الكامل عند الحاجة.</p></div></section><section className={`${styles.shell} ${styles.section}`}><div className={styles.panel}><form className={styles.form} method="get"><label>المصطلح الأول<select name="a" defaultValue={first?.slug}>{terms.map((term)=><option value={term.slug} key={term.slug}>{term.title}</option>)}</select></label><label>المصطلح الثاني<select name="b" defaultValue={second?.slug}>{terms.map((term)=><option value={term.slug} key={term.slug}>{term.title}</option>)}</select></label><button type="submit">عرض المقارنة</button></form>{first&&second?<div className={styles.compare}><article><h2>{first.title}</h2><p>{first.excerpt||'افتح الصفحة الكاملة لقراءة التعريف والسياق.'}</p><Link className={styles.link} href={first.canonicalUrl}>المقال الكامل</Link></article><article><h2>{second.title}</h2><p>{second.excerpt||'افتح الصفحة الكاملة لقراءة التعريف والسياق.'}</p><Link className={styles.link} href={second.canonicalUrl}>المقال الكامل</Link></article></div>:<p>لا توجد مصطلحات منشورة كافية للمقارنة حاليًا.</p>}</div></section></main><SiteFooter/></>;
}
