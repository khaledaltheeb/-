import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PrintPageButton from '@/components/print-page-button';
import { getAddictionAtlas, getAtlasSource, getAtlasSubstance, RISK_KEYS } from '@/lib/addiction-atlas';
import { getAtlasRiskEvidence } from '@/lib/addiction-atlas-evidence';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/addiction-atlas.module.css';

type Params = Promise<{ slug: string }>;
export const revalidate = 86400;

export async function generateStaticParams() {
  const atlas = await getAddictionAtlas();
  return atlas.substances.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getAtlasSubstance(slug);
  if (!item) return buildSeoMetadata({ title: 'المادة غير موجودة', path: `/addiction/substances/${slug}/`, index: false, follow: true });
  const aliases = [...(item.english_name_ar_transliteration ?? []), ...(item.search_aliases_ar ?? []), ...(item.search_aliases_en ?? []), ...(item.common_misspellings_ar ?? [])];
  return buildSeoMetadata({
    title: `${item.display_name_ar} (${item.display_name_en}): الأضرار والانسحاب والعلاج`,
    description: item.summary_ar,
    path: `/addiction/substances/${item.slug}/`, index: true, follow: true, type: 'article',
    keywords: [item.display_name_ar, item.display_name_en, item.class_ar, item.common_name_ar || '', item.common_name_en || ''].filter(Boolean),
    relatedTerms: aliases,
    searchIntents: [`ما هو ${item.display_name_ar}`, `أضرار ${item.display_name_ar}`, `انسحاب ${item.display_name_ar}`, `علاج إدمان ${item.display_name_ar}`],
    modifiedTime: (await getAddictionAtlas()).updatedOn,
  });
}

export default async function SubstancePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [item, atlas] = await Promise.all([getAtlasSubstance(slug), getAddictionAtlas()]);
  if (!item) notFound();
  const riskEvidence = getAtlasRiskEvidence(item.slug);
  const url = `${SITE_URL}/addiction/substances/${item.slug}/`;
  const relatedComparisons = atlas.comparisons.filter((comparison) => comparison.indexable && (comparison.a === item.slug || comparison.b === item.slug));
  const relatedInteractions = atlas.interactions.filter((interaction) => interaction.a === item.slug || interaction.b === item.slug);
  const bySlug = new Map(atlas.substances.map((substance) => [substance.slug, substance]));
  const schemas = [
    breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'أطلس المواد', path: '/addiction/substances/' }, { name: item.display_name_ar, path: `/addiction/substances/${item.slug}/` }]),
    { '@context': 'https://schema.org', '@type': 'MedicalWebPage', '@id': `${url}#medical-page`, url, name: `${item.display_name_ar} — ${item.display_name_en}`, headline: `${item.display_name_ar} (${item.display_name_en})`, description: item.summary_ar, inLanguage: 'ar', dateModified: atlas.updatedOn, lastReviewed: atlas.updatedOn, reviewedBy: { '@id': `${SITE_URL}/#organization` }, publisher: { '@id': `${SITE_URL}/#organization` }, about: { '@type': 'Thing', name: item.display_name_en, alternateName: [item.display_name_ar, item.common_name_ar, item.common_name_en].filter(Boolean) }, citation: item.source_urls },
  ];
  return <><SiteHeader /><main className={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><Link href="/addiction/substances/">أطلس المواد</Link><span>/</span><span aria-current="page">{item.display_name_ar}</span></nav>
    <header className={styles.hero}><span className={styles.eyebrow}>تمت المراجعة من قبل فريق روافد · قوة الدليل {item.evidence_grade}</span><h1>{item.display_name_ar} <small dir="ltr">({item.display_name_en})</small></h1><p>{item.summary_ar}</p><div className={styles.actions}><Link href="/addiction/substances/">كل المواد</Link><Link href="/addiction/compare/">المقارنات</Link><Link href="/addiction/interactions/">التفاعلات</Link><Link href="/addiction/prevalence/">الانتشار</Link><Link href="/addiction/mortality/">الوفيات</Link><Link href="/addiction/methodology/">المنهجية</Link>{item.related_condition ? <Link href={item.related_condition}>المسار العلاجي المرتبط</Link> : null}<PrintPageButton /></div></header>
    <aside className={styles.notice}><strong>السلامة أولًا</strong><p>{item.emergency_response_ar}</p></aside>
    <section className={styles.section}><h2>بطاقة تعريف علمية</h2><div className={styles.detailGrid}><article className={styles.card}><h3>التصنيف</h3><p>{item.class_ar} <span dir="ltr">({item.class_en})</span></p>{item.scientific_name ? <p><strong>الاسم العلمي:</strong> <span dir="ltr">{item.scientific_name}</span></p> : null}{item.common_name_ar && item.common_name_ar !== item.display_name_ar ? <p><strong>الاسم الشائع:</strong> {item.common_name_ar}</p> : null}{item.medical_use_ar ? <><h3>الاستخدام الطبي</h3><p>{item.medical_use_ar}</p></> : null}</article><article className={styles.card}><h3>الآلية</h3><p>{item.mechanism_ar}</p>{item.forms_ar?.length ? <><h3>أشكال قد توجد فيها المادة</h3><ul>{item.forms_ar.map((value) => <li key={value}>{value}</li>)}</ul><p><strong>تنبيه الهوية:</strong> المظهر أو الشكل وحده لا يثبت هوية المادة أو نقاوتها أو تركيزها أو محتويات المنتج.</p></> : null}</article></div></section>
    <section className={styles.section}><h2>محاور الخطر الثمانية</h2><div className={styles.riskGrid}>{RISK_KEYS.map((key) => { const evidence = riskEvidence?.dimensions[key]; return <article className={styles.riskCard} key={key}><strong><span>{atlas.methodology.risk_dimensions[key].label_ar}</span><span>{item.risk[key] == null ? 'غير محسوم' : `${item.risk[key]}/5`}</span></strong><p>{atlas.methodology.risk_dimensions[key].definition_ar}</p>{evidence ? <details><summary>الدليل وراء هذا المحور · {evidence.evidence_grade}</summary><p><strong>السياق:</strong> {evidence.context_ar}</p><p><strong>المبرر:</strong> {evidence.rationale_ar}</p><p><strong>قوة الدليل:</strong> {evidence.evidence_grade} — {atlas.methodology.evidence_grades[evidence.evidence_grade].label_ar}</p>{evidence.source_ids.length ? <ul>{evidence.source_ids.map((sourceId) => { const source = getAtlasSource(atlas, sourceId); return <li key={sourceId}>{source ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.organization}: {source.title}</a> : <span>{sourceId}</span>}</li>; })}</ul> : null}</details> : <p><small>لم تكتمل بعد مراجعة هذا المحور على مستوى الادعاء؛ تُعرض الدرجة الحالية من ملف المادة ولا تُرفع قوة اليقين تلقائيًا.</small></p>}</article>; })}</div><p>الدرجة ترتيبية داخل المحور وليست احتمالًا شخصيًا ولا يجوز جمع المحاور في «درجة خطر كلية». تعني «غير محسوم» أن الدليل الحالي لا يبرر رقماً مسؤولًا لذلك المحور.</p>{riskEvidence ? <p><strong>طبقة التتبع العلمي:</strong> هذه المادة تمتلك مراجعة مستقلة على مستوى كل محور، بحيث يمكن أن تكون قوة الدليل مختلفة بين الاعتماد والانسحاب والقلب والتنفس داخل المادة نفسها.</p> : <p><strong>حالة التتبع العلمي:</strong> لم تصل هذه المادة بعد إلى طبقة المراجعة محورًا بمحور؛ وهذا لا يعني ضعف المادة كلها ولا يسمح بافتراض قوة دليل غير موثقة.</p>}</section>
    <section className={styles.section}><div className={styles.grid}><article className={styles.card}><h2>التأثيرات الحادة</h2><ul>{item.acute_effects_ar.map((value) => <li key={value}>{value}</li>)}</ul></article><article className={styles.card}><h2>الأضرار مع الاستخدام المتكرر</h2><ul>{item.long_term_harms_ar.map((value) => <li key={value}>{value}</li>)}</ul></article><article className={styles.card}><h2>هل يمكن أن يحدث ضرر من تعرض واحد؟</h2><p>{item.single_exposure_harm_ar}</p></article><article className={styles.card}><h2>الانسحاب</h2><p>{item.withdrawal_ar}</p></article><article className={styles.card}><h2>العلاج والرعاية</h2><p>{item.treatment_ar}</p></article><article className={styles.card}><h2>متى تكون الحالة طارئة؟</h2><p>{item.emergency_response_ar}</p></article></div></section>
    {relatedInteractions.length ? <section className={styles.section}><h2>تفاعلات عالية الأهمية تمت مراجعتها</h2><p>لا يعني عدم ظهور مادة أخرى هنا أنها آمنة مع {item.display_name_ar}؛ هذه القائمة تعرض الأزواج التي اكتملت مراجعتها فقط.</p><div className={styles.grid}>{relatedInteractions.map((interaction) => { const otherSlug = interaction.a === item.slug ? interaction.b : interaction.a; const other = bySlug.get(otherSlug); return <article className={styles.card} key={interaction.id}><h3>{item.display_name_ar} + <Link href={`/addiction/substances/${otherSlug}/`}>{other?.display_name_ar}</Link></h3><p><strong>{interaction.severity === 'critical' ? 'تنبيه حرج' : interaction.severity === 'high' ? 'تنبيه مرتفع' : 'تنبيه متوسط'}</strong> · دليل {interaction.evidence_grade}</p><p>{interaction.risk_ar}</p><p><Link href="/addiction/interactions/">افتح طبقة التفاعلات والتفسير الكامل</Link></p></article>; })}</div></section> : null}
    {relatedComparisons.length ? <section className={styles.section}><h2>مقارنات موثقة مرتبطة بهذه المادة</h2><div className={styles.grid}>{relatedComparisons.map((comparison) => <article className={styles.card} key={comparison.slug}><h3><Link href={`/addiction/compare/${comparison.slug}/`}>{comparison.title_ar}</Link></h3><p>{comparison.intent_ar}</p></article>)}</div></section> : null}
    <section className={styles.section}><h2>المصادر المباشرة</h2><ol className={styles.sources}>{item.source_urls.map((source) => <li key={source}><a href={source} target="_blank" rel="noopener noreferrer">{source}</a></li>)}</ol><p>قوة الدليل: <strong>{item.evidence_grade} — {atlas.methodology.evidence_grades[item.evidence_grade].label_ar}</strong>. {atlas.methodology.evidence_grades[item.evidence_grade].definition_ar}</p><p className={styles.updateLine}>آخر مراجعة لنسخة بيانات الأطلس: <time dateTime={atlas.updatedOn}>{atlas.updatedOn}</time>.</p></section>
  </main><SiteFooter /></>;
}
