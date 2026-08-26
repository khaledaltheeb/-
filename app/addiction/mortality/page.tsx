import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getAddictionAtlas, getAtlasSource } from '@/lib/addiction-atlas';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/addiction-atlas.module.css';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'وفيات المواد والجرعات الزائدة: قراءة صحيحة للبيانات',
    description: 'بيانات موثقة عن الوفيات المنسوبة والجرعات الزائدة مع فصل نوع المؤشر والسنة والجغرافيا وحالة البيانات، ومنع نسبة وفيات متعددة المواد إلى مادة واحدة دون دليل.',
    path: '/addiction/mortality/', index: true, follow: true, type: 'article',
    keywords: ['وفيات الجرعات الزائدة', 'وفيات المخدرات', 'وفيات الأفيونات', 'وفيات الكحول', 'وفيات التبغ'],
  });
}

function formatValue(value: number, qualifier?: string) {
  const prefix = qualifier === 'approximately' || qualifier === 'around' ? 'نحو ' : qualifier === 'more_than' ? 'أكثر من ' : '';
  return `${prefix}${new Intl.NumberFormat('ar').format(value)}`;
}

function geographyLabel(value: string) {
  if (value === 'global') return 'عالمي';
  if (value === 'United States') return 'الولايات المتحدة';
  return value;
}

export default async function AddictionMortalityPage() {
  const atlas = await getAddictionAtlas();
  const url = `${SITE_URL}/addiction/mortality/`;
  const schemas = [
    breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'الوفيات والأضرار', path: '/addiction/mortality/' }]),
    { '@context': 'https://schema.org', '@type': 'Dataset', '@id': `${url}#dataset`, name: 'بيانات الوفيات المرتبطة بالمواد والجرعات الزائدة — روافد', description: 'سجلات وفيات مختارة مع نوع المؤشر والسنة والجغرافيا والمصدر.', url, inLanguage: 'ar', dateModified: atlas.updatedOn, creator: { '@id': `${SITE_URL}/#organization` }, publisher: { '@id': `${SITE_URL}/#organization` } },
  ];

  return <><SiteHeader /><main className={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><span aria-current="page">الوفيات والأضرار</span></nav>
    <header className={styles.hero}><span className={styles.eyebrow}>تمت المراجعة من قبل فريق روافد · لا خلط بين المؤشرات</span><h1>وفيات المواد والجرعات الزائدة</h1><p>قد يعني رقم الوفاة تسممًا حادًا، أو وفاة تضمنت مادة، أو عبئًا منسوبًا لمادة عبر أمراض وإصابات عديدة. لذلك يعرض الأطلس نوع المؤشر والسنة والجغرافيا وحالة البيانات مع كل رقم بدل وضع أرقام غير متجانسة في ترتيب مضلل.</p><div className={styles.actions}><Link href="/addiction/substances/">فتح أطلس المواد</Link><Link href="/addiction/prevalence/">الانتشار</Link><Link href="/addiction/methodology/">المنهجية</Link></div></header>
    <aside className={styles.notice}><strong>قاعدة تفسير أساسية</strong><p>لا يجوز مقارنة «وفيات منسوبة عالميًا» مباشرة مع «وفيات جرعة زائدة مؤقتة في دولة واحدة» كأنهما المقياس نفسه، ولا يجوز تقسيم وفاة متعددة المواد قسرًا على مادة واحدة.</p></aside>
    <section className={styles.section}><h2>السجلات الموثقة</h2><div className={styles.statsGrid}>{atlas.mortality.map((record) => { const source = getAtlasSource(atlas, record.source_id); return <article className={styles.statCard} key={record.id}><div className={styles.statTop}><strong>{formatValue(record.value, record.qualifier)}</strong><span>{record.year}</span></div><p>{record.definition_ar}</p><dl className={styles.metaList}><div><dt>الجغرافيا</dt><dd>{geographyLabel(record.geography)}</dd></div><div><dt>نوع المؤشر</dt><dd dir="ltr">{record.metric_type}</dd></div>{record.status ? <div><dt>حالة البيانات</dt><dd>{record.status === 'provisional' ? 'مؤقتة / Provisional' : record.status}</dd></div> : null}</dl>{source ? <p className={styles.sourceLine}><strong>المصدر:</strong> <a href={source.url} target="_blank" rel="noopener noreferrer">{source.organization} — {source.title}</a></p> : <p>معرّف المصدر: {record.source_id}</p>}</article>; })}</div></section>
    <section className={styles.section}><h2>قواعد تمنع التضليل الإحصائي</h2><ol>{atlas.mortalityRules.map((rule) => <li key={rule}>{rule}</li>)}</ol></section>
    <section className={styles.section}><h2>ثلاثة أسئلة قبل مقارنة رقمين</h2><div className={styles.grid}><article className={styles.card}><h3>هل نوع الوفاة واحد؟</h3><p>الوفاة المنسوبة، والجرعة الزائدة، ووجود المادة في علم السموم ليست تعريفات مترادفة.</p></article><article className={styles.card}><h3>هل السنة والجغرافيا متوافقتان؟</h3><p>لا يُستخدم رقم وطني مؤقت بوصفه تقديرًا عالميًا، ولا تُخفى سنة البيانات خلف تاريخ نشر أحدث.</p></article></div></section>
    <p className={styles.updateLine}>آخر تحديث لنسخة البيانات المثبتة: <time dateTime={atlas.updatedOn}>{atlas.updatedOn}</time>.</p>
  </main><SiteFooter /></>;
}
