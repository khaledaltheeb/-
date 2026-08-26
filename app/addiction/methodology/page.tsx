import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getAddictionAtlas, RISK_KEYS } from '@/lib/addiction-atlas';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/addiction-atlas.module.css';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({ title: 'منهجية أطلس الإدمان التفاعلي', description: 'منهجية روافد لتقييم مخاطر المواد عبر ثمانية محاور مستقلة ودرجات قوة الدليل وعدم اليقين، دون اختزال الخطر في رقم واحد.', path: '/addiction/methodology/', index: true, follow: true, type: 'article', keywords: ['منهجية أطلس الإدمان', 'تقييم مخاطر المخدرات', 'قوة الدليل', 'السمية الحادة', 'الانسحاب'] });
}

export default async function AddictionMethodologyPage() {
  const atlas = await getAddictionAtlas();
  const method = atlas.methodology;
  const schemas = [breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'منهجية الأطلس', path: '/addiction/methodology/' }]), { '@context': 'https://schema.org', '@type': 'Article', '@id': `${SITE_URL}/addiction/methodology/#article`, url: `${SITE_URL}/addiction/methodology/`, headline: 'منهجية أطلس الإدمان التفاعلي', inLanguage: 'ar', dateModified: atlas.updatedOn, lastReviewed: atlas.updatedOn, publisher: { '@id': `${SITE_URL}/#organization` }, reviewedBy: { '@id': `${SITE_URL}/#organization` } }];
  return <><SiteHeader /><main className={styles.shell}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} /><nav className="breadcrumbs"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><span>منهجية الأطلس</span></nav><header className={styles.hero}><span className={styles.eyebrow}>تمت المراجعة من قبل فريق روافد · منهجية معلنة · عدم اليقين ظاهر</span><h1>منهجية أطلس الإدمان التفاعلي</h1><p>{method.scope}</p><div className={styles.actions}><Link href="/addiction/substances/">فتح الأطلس</Link><Link href="/addiction/compare/">المقارنات</Link></div></header>
    <section className={styles.section}><h2>المبادئ</h2><ol>{method.principles.map((value) => <li key={value}>{value}</li>)}</ol></section>
    <section className={styles.section}><h2>محاور الخطر الثمانية</h2><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>المحور</th><th>التعريف التشغيلي</th></tr></thead><tbody>{RISK_KEYS.map((key) => <tr key={key}><th>{method.risk_dimensions[key].label_ar}</th><td>{method.risk_dimensions[key].definition_ar}</td></tr>)}</tbody></table></div></section>
    <section className={styles.section}><h2>الدرجات الترتيبية</h2><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>الدرجة</th><th>التسمية</th><th>المعنى</th></tr></thead><tbody>{Object.entries(method.ordinal_scale).map(([key, value]) => <tr key={key}><th>{key}/5</th><td>{value.label_ar}</td><td>{value.definition_ar}</td></tr>)}</tbody></table></div></section>
    <section className={styles.section}><h2>قوة الدليل</h2><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>الدرجة</th><th>التسمية</th><th>المعنى</th></tr></thead><tbody>{Object.entries(method.evidence_grades).map(([key, value]) => <tr key={key}><th>{key}</th><td>{value.label_ar}</td><td>{value.definition_ar}</td></tr>)}</tbody></table></div></section>
    <section className={styles.section}><div className={styles.grid}><article className={styles.card}><h2>قاعدة الفرز</h2><p>{method.sorting_rule}</p></article><article className={styles.card}><h2>دورة المراجعة</h2><p>{method.review_cycle}</p></article></div></section><aside className={styles.notice}><strong>تنبيه سلامة</strong><p>{method.safety_note}</p></aside>
  </main><SiteFooter /></>;
}
