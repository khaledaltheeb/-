import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PrintPageButton from '@/components/print-page-button';
import { getAddictionAtlas, getAtlasComparison, getAtlasSource, RISK_KEYS, type RiskKey } from '@/lib/addiction-atlas';
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
  return buildSeoMetadata({ title: comparison.title_ar, description: `${comparison.intent_ar}. مقارنة متعددة المحاور بين ${a.display_name_ar} و${b.display_name_ar} تشمل المخاطر، الضرر من تعرض واحد، الانسحاب، العلاج والمصادر.`, path: `/addiction/compare/${comparison.slug}/`, index: true, follow: true, type: 'article', keywords: [a.display_name_ar, a.display_name_en, b.display_name_ar, b.display_name_en, comparison.title_ar], relatedTerms: [...(a.search_aliases_ar ?? []), ...(b.search_aliases_ar ?? [])], searchIntents: [comparison.title_ar, `الفرق بين ${a.display_name_ar} و${b.display_name_ar}`], modifiedTime: atlas.updatedOn });
}

function axisSynthesis(key: RiskKey, a: Awaited<ReturnType<typeof getAtlasComparison>> extends infer T ? never : never) {
  void key; void a;
  return '';
}

export default async function ComparisonPage({ params }: { params: Params }) {
  const { slug } = await params;
  const result = await getAtlasComparison(slug);
  if (!result) notFound();
  const { comparison, a, b, atlas } = result;
  const url = `${SITE_URL}/addiction/compare/${comparison.slug}/`;
  const sources = [...new Set([...a.source_urls, ...b.source_urls])];
  const exactEpidemiology = atlas.epidemiology.filter((record) => record.scope_slug === a.slug || record.scope_slug === b.slug);
  const exactMortality = atlas.mortality.filter((record) => record.scope_slug === a.slug || record.scope_slug === b.slug);
  const syntheses = RISK_KEYS.map((key) => {
    const av = a.risk[key];
    const bv = b.risk[key];
    const label = atlas.methodology.risk_dimensions[key].label_ar;
    if (av == null || bv == null) return { key, label, text: `لا تسمح البيانات الحالية بمقارنة رقمية محسومة بين المادتين في محور ${label} لأن قيمة واحدة على الأقل غير محسومة.` };
    if (av === bv) return { key, label, text: `الدرجتان الترتيبيتان متساويتان (${av}/5) في محور ${label}. هذا لا يعني تطابق الخطر السريري أو السياق بين المادتين.` };
    const higher = av > bv ? a : b;
    const higherValue = Math.max(av, bv);
    const lowerValue = Math.min(av, bv);
    return { key, label, text: `الدرجة الترتيبية أعلى لـ${higher.display_name_ar} في محور ${label} (${higherValue}/5 مقابل ${lowerValue}/5). هذه ملاحظة خاصة بهذا المحور وليست حكماً بأن المادة الأخرى آمنة أو أفضل إجمالاً.` };
  });
  const schemas = [breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'المقارنات', path: '/addiction/compare/' }, { name: comparison.title_ar, path: `/addiction/compare/${comparison.slug}/` }]), { '@context': 'https://schema.org', '@type': 'Article', '@id': `${url}#article`, url, headline: comparison.title_ar, description: comparison.intent_ar, inLanguage: 'ar', dateModified: atlas.updatedOn, lastReviewed: atlas.updatedOn, publisher: { '@id': `${SITE_URL}/#organization` }, reviewedBy: { '@id': `${SITE_URL}/#organization` }, about: [{ '@type': 'Thing', name: a.display_name_en }, { '@type': 'Thing', name: b.display_name_en }], citation: sources }];
  return <><SiteHeader /><main className={styles.shell}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} /><nav className="breadcrumbs"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><Link href="/addiction/compare/">المقارنات</Link><span>/</span><span>{comparison.title_ar}</span></nav><header className={styles.hero}><span className={styles.eyebrow}>تمت المراجعة من قبل فريق روافد · مقارنة متعددة المحاور</span><h1>{comparison.title_ar}</h1><p>{comparison.intent_ar}</p><div className={styles.actions}><Link href={`/addiction/substances/${a.slug}/`}>{a.display_name_ar}</Link><Link href={`/addiction/substances/${b.slug}/`}>{b.display_name_ar}</Link><Link href="/addiction/prevalence/">الانتشار</Link><Link href="/addiction/mortality/">الوفيات</Link><Link href="/addiction/methodology/">المنهجية</Link><PrintPageButton /></div></header><aside className={styles.notice}><strong>قاعدة تفسير أساسية</strong><p>هذه المقارنة لا تجيب عن «أي مادة آمنة؟». اختلاف الدرجات بين المحاور لا يساوي توصية بالاستخدام، والخطر الفردي يتغير بحسب الجرعة والتداخلات والحالة الصحية وتركيب المنتج والسياق.</p></aside>
    <section className={styles.section}><h2>الخلاصة العلمية</h2><div className={styles.grid}><article className={styles.card}><h3>{a.display_name_ar} <small dir="ltr">{a.display_name_en}</small></h3><p><strong>الفئة:</strong> {a.class_ar} <span dir="ltr">({a.class_en})</span></p><p>{a.summary_ar}</p><p><strong>الآلية:</strong> {a.mechanism_ar}</p>{a.forms_ar?.length ? <p><strong>الأشكال الموصوفة:</strong> {a.forms_ar.join('، ')}</p> : null}</article><article className={styles.card}><h3>{b.display_name_ar} <small dir="ltr">{b.display_name_en}</small></h3><p><strong>الفئة:</strong> {b.class_ar} <span dir="ltr">({b.class_en})</span></p><p>{b.summary_ar}</p><p><strong>الآلية:</strong> {b.mechanism_ar}</p>{b.forms_ar?.length ? <p><strong>الأشكال الموصوفة:</strong> {b.forms_ar.join('، ')}</p> : null}</article></div><p><strong>مهم:</strong> شكل المنتج لا يثبت الهوية أو النقاوة أو التركيز أو محتويات المنتج.</p></section>
    <section className={styles.section}><h2>المقارنة عبر محاور الخطر الثمانية</h2><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>المحور</th><th>{a.display_name_ar}</th><th>{b.display_name_ar}</th><th>ماذا يعني المحور؟</th></tr></thead><tbody>{RISK_KEYS.map((key) => <tr key={key}><th>{atlas.methodology.risk_dimensions[key].label_ar}</th><td>{a.risk[key] == null ? 'غير محسوم' : `${a.risk[key]}/5`}</td><td>{b.risk[key] == null ? 'غير محسوم' : `${b.risk[key]}/5`}</td><td>{atlas.methodology.risk_dimensions[key].definition_ar}</td></tr>)}</tbody></table></div></section>
    <section className={styles.section}><h2>أين تختلف الدرجات؟</h2><div className={styles.grid}>{syntheses.map((item) => <article className={styles.card} key={item.key}><h3>{item.label}</h3><p>{item.text}</p></article>)}</div></section>
    <section className={styles.section}><h2>التأثيرات الحادة</h2><div className={styles.grid}><article className={styles.card}><h3>{a.display_name_ar}</h3><ul>{a.acute_effects_ar.map((value) => <li key={value}>{value}</li>)}</ul></article><article className={styles.card}><h3>{b.display_name_ar}</h3><ul>{b.acute_effects_ar.map((value) => <li key={value}>{value}</li>)}</ul></article></div></section>
    <section className={styles.section}><h2>الضرر من تعرض واحد والأضرار طويلة المدى</h2><div className={styles.grid}><article className={styles.card}><h3>{a.display_name_ar}</h3><p><strong>تعرض واحد:</strong> {a.single_exposure_harm_ar}</p><h4>مع الاستخدام المتكرر</h4><ul>{a.long_term_harms_ar.map((value) => <li key={value}>{value}</li>)}</ul></article><article className={styles.card}><h3>{b.display_name_ar}</h3><p><strong>تعرض واحد:</strong> {b.single_exposure_harm_ar}</p><h4>مع الاستخدام المتكرر</h4><ul>{b.long_term_harms_ar.map((value) => <li key={value}>{value}</li>)}</ul></article></div></section>
    <section className={styles.section}><h2>الانسحاب والعلاج</h2><div className={styles.grid}><article className={styles.card}><h3>{a.display_name_ar}</h3><p><strong>الانسحاب:</strong> {a.withdrawal_ar}</p><p><strong>العلاج:</strong> {a.treatment_ar}</p></article><article className={styles.card}><h3>{b.display_name_ar}</h3><p><strong>الانسحاب:</strong> {b.withdrawal_ar}</p><p><strong>العلاج:</strong> {b.treatment_ar}</p></article></div></section>
    <section className={styles.section}><h2>علامات الطوارئ</h2><div className={styles.grid}><article className={styles.card}><h3>{a.display_name_ar}</h3><p>{a.emergency_response_ar}</p></article><article className={styles.card}><h3>{b.display_name_ar}</h3><p>{b.emergency_response_ar}</p></article></div></section>
    {exactEpidemiology.length || exactMortality.length ? <section className={styles.section}><h2>بيانات سكانية مرتبطة مباشرة بأحد السجلين</h2><p>تظهر هنا فقط السجلات التي يطابق نطاقها اسم المادة/السجل مباشرة؛ لا ننقل أرقام فئة واسعة إلى مادة مفردة.</p><div className={styles.statsGrid}>{exactEpidemiology.map((record) => { const source = getAtlasSource(atlas, record.source_id); return <article className={styles.statCard} key={record.id}><div className={styles.statTop}><strong>{new Intl.NumberFormat('ar').format(record.value)}</strong><span>{record.year}</span></div><p>{record.definition_ar}</p>{source ? <p className={styles.sourceLine}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.organization} — {source.title}</a></p> : null}</article>; })}{exactMortality.map((record) => { const source = getAtlasSource(atlas, record.source_id); return <article className={styles.statCard} key={record.id}><div className={styles.statTop}><strong>{new Intl.NumberFormat('ar').format(record.value)}</strong><span>{record.year}</span></div><p>{record.definition_ar}</p>{source ? <p className={styles.sourceLine}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.organization} — {source.title}</a></p> : null}</article>; })}</div></section> : null}
    <section className={styles.section}><h2>المصادر</h2><ol className={styles.sources}>{sources.map((source) => <li key={source}><a href={source} target="_blank" rel="noopener noreferrer">{source}</a></li>)}</ol><p>قوة الدليل العامة: {a.display_name_ar} <strong>{a.evidence_grade}</strong>، {b.display_name_ar} <strong>{b.evidence_grade}</strong>. لا تعني الدرجة العامة أن كل محور مدعوم بنفس مستوى الدليل.</p><p className={styles.updateLine}>آخر مراجعة لنسخة بيانات الأطلس: <time dateTime={atlas.updatedOn}>{atlas.updatedOn}</time>.</p></section>
  </main><SiteFooter /></>;
}
