import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getAddictionAtlas, getAtlasComparison, RISK_KEYS } from '@/lib/addiction-atlas';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/addiction-atlas.module.css';

type Params = Promise<{ slug: string }>;
export const revalidate = 86400;

export async function generateStaticParams() {
  const atlas = await getAddictionAtlas();
  return atlas.comparisons.filter((item) => item.indexable).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getAtlasComparison(slug);
  if (!result) return buildSeoMetadata({ title: 'المقارنة غير موجودة', path: `/addiction/compare/${slug}/`, index: false, follow: true });
  const { comparison, a, b, atlas } = result;
  return buildSeoMetadata({ title: comparison.title_ar, description: `${comparison.intent_ar}. مقارنة متعددة المحاور بين ${a.display_name_ar} و${b.display_name_ar} مع الانسحاب والعلاج والمصادر.`, path: `/addiction/compare/${comparison.slug}/`, index: true, follow: true, type: 'article', keywords: [a.display_name_ar, a.display_name_en, b.display_name_ar, b.display_name_en, comparison.title_ar], relatedTerms: [...(a.search_aliases_ar ?? []), ...(b.search_aliases_ar ?? [])], searchIntents: [comparison.title_ar, `الفرق بين ${a.display_name_ar} و${b.display_name_ar}`], modifiedTime: atlas.updatedOn });
}

export default async function ComparisonPage({ params }: { params: Params }) {
  const { slug } = await params;
  const result = await getAtlasComparison(slug);
  if (!result) notFound();
  const { comparison, a, b, atlas } = result;
  const url = `${SITE_URL}/addiction/compare/${comparison.slug}/`;
  const sources = [...new Set([...a.source_urls, ...b.source_urls])];
  const schemas = [breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'المقارنات', path: '/addiction/compare/' }, { name: comparison.title_ar, path: `/addiction/compare/${comparison.slug}/` }]), { '@context': 'https://schema.org', '@type': 'Article', '@id': `${url}#article`, url, headline: comparison.title_ar, description: comparison.intent_ar, inLanguage: 'ar', dateModified: atlas.updatedOn, lastReviewed: atlas.updatedOn, publisher: { '@id': `${SITE_URL}/#organization` }, reviewedBy: { '@id': `${SITE_URL}/#organization` }, about: [{ '@type': 'Thing', name: a.display_name_en }, { '@type': 'Thing', name: b.display_name_en }], citation: sources }];
  return <><SiteHeader /><main className={styles.shell}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} /><nav className="breadcrumbs"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><Link href="/addiction/compare/">المقارنات</Link><span>/</span><span>{comparison.title_ar}</span></nav><header className={styles.hero}><span className={styles.eyebrow}>تمت المراجعة من قبل فريق روافد · مقارنة متعددة المحاور</span><h1>{comparison.title_ar}</h1><p>{comparison.intent_ar}</p><div className={styles.actions}><Link href={`/addiction/substances/${a.slug}/`}>{a.display_name_ar}</Link><Link href={`/addiction/substances/${b.slug}/`}>{b.display_name_ar}</Link><Link href="/addiction/methodology/">المنهجية</Link></div></header><aside className={styles.notice}><strong>قاعدة تفسير أساسية</strong><p>هذه المقارنة لا تجيب عن «أي مادة آمنة؟». اختلاف الدرجات بين المحاور لا يساوي توصية بالاستخدام، والخطر الفردي يتغير بحسب الجرعة والتداخلات والحالة الصحية وتركيب المنتج والسياق.</p></aside>
    <section className={styles.section}><h2>الخلاصة العلمية</h2><div className={styles.grid}><article className={styles.card}><h3>{a.display_name_ar} <small dir="ltr">{a.display_name_en}</small></h3><p>{a.summary_ar}</p><p><strong>الآلية:</strong> {a.mechanism_ar}</p></article><article className={styles.card}><h3>{b.display_name_ar} <small dir="ltr">{b.display_name_en}</small></h3><p>{b.summary_ar}</p><p><strong>الآلية:</strong> {b.mechanism_ar}</p></article></div></section>
    <section className={styles.section}><h2>المقارنة عبر محاور الخطر الثمانية</h2><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>المحور</th><th>{a.display_name_ar}</th><th>{b.display_name_ar}</th><th>ماذا يعني المحور؟</th></tr></thead><tbody>{RISK_KEYS.map((key) => <tr key={key}><th>{atlas.methodology.risk_dimensions[key].label_ar}</th><td>{a.risk[key] == null ? 'غير محسوم' : `${a.risk[key]}/5`}</td><td>{b.risk[key] == null ? 'غير محسوم' : `${b.risk[key]}/5`}</td><td>{atlas.methodology.risk_dimensions[key].definition_ar}</td></tr>)}</tbody></table></div></section>
    <section className={styles.section}><h2>التأثيرات الحادة</h2><div className={styles.grid}><article className={styles.card}><h3>{a.display_name_ar}</h3><ul>{a.acute_effects_ar.map((value) => <li key={value}>{value}</li>)}</ul></article><article className={styles.card}><h3>{b.display_name_ar}</h3><ul>{b.acute_effects_ar.map((value) => <li key={value}>{value}</li>)}</ul></article></div></section>
    <section className={styles.section}><h2>الانسحاب والعلاج</h2><div className={styles.grid}><article className={styles.card}><h3>{a.display_name_ar}</h3><p><strong>الانسحاب:</strong> {a.withdrawal_ar}</p><p><strong>العلاج:</strong> {a.treatment_ar}</p></article><article className={styles.card}><h3>{b.display_name_ar}</h3><p><strong>الانسحاب:</strong> {b.withdrawal_ar}</p><p><strong>العلاج:</strong> {b.treatment_ar}</p></article></div></section>
    <section className={styles.section}><h2>علامات الطوارئ</h2><div className={styles.grid}><article className={styles.card}><h3>{a.display_name_ar}</h3><p>{a.emergency_response_ar}</p></article><article className={styles.card}><h3>{b.display_name_ar}</h3><p>{b.emergency_response_ar}</p></article></div></section>
    <section className={styles.section}><h2>المصادر</h2><ol className={styles.sources}>{sources.map((source) => <li key={source}><a href={source} target="_blank" rel="noopener noreferrer">{source}</a></li>)}</ol><p>قوة الدليل: {a.display_name_ar} <strong>{a.evidence_grade}</strong>، {b.display_name_ar} <strong>{b.evidence_grade}</strong>.</p></section>
  </main><SiteFooter /></>;
}
