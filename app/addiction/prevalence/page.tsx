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
    title: 'انتشار استخدام المواد والإدمان: كيف تُقرأ الأرقام؟',
    description: 'بيانات موثقة عن انتشار استخدام المواد واضطرابات الاستخدام مع السنة والجغرافيا والسكان وتعريف المؤشر والمصدر، دون تعميم أرقام دولة أو فئة على مادة أخرى.',
    path: '/addiction/prevalence/', index: true, follow: true, type: 'article',
    keywords: ['انتشار المخدرات', 'إحصاءات الإدمان', 'انتشار القنب', 'اضطراب استخدام الكحول', 'المواد النفسية الجديدة'],
  });
}

function formatValue(value: number, qualifier?: string) {
  const prefix = qualifier === 'approximately' || qualifier === 'around' ? 'نحو ' : qualifier === 'more_than' ? 'أكثر من ' : '';
  return `${prefix}${new Intl.NumberFormat('ar').format(value)}`;
}

function geographyLabel(value: string) {
  if (value === 'global') return 'عالمي';
  if (value === 'global/member-state reporting') return 'عالمي / تقارير الدول الأعضاء';
  return value;
}

export default async function AddictionPrevalencePage() {
  const atlas = await getAddictionAtlas();
  const url = `${SITE_URL}/addiction/prevalence/`;
  const schemas = [
    breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'الانتشار', path: '/addiction/prevalence/' }]),
    { '@context': 'https://schema.org', '@type': 'Dataset', '@id': `${url}#dataset`, name: 'بيانات انتشار استخدام المواد واضطرابات الاستخدام — روافد', description: 'سجلات انتشار مختارة مع السنة والجغرافيا وتعريف المؤشر والمصدر.', url, inLanguage: 'ar', dateModified: atlas.updatedOn, creator: { '@id': `${SITE_URL}/#organization` }, publisher: { '@id': `${SITE_URL}/#organization` } },
  ];

  return <><SiteHeader /><main className={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><span aria-current="page">الانتشار</span></nav>
    <header className={styles.hero}><span className={styles.eyebrow}>تمت المراجعة من قبل فريق روافد · السنة والجغرافيا جزء من الرقم</span><h1>انتشار استخدام المواد والإدمان</h1><p>لا توجد «نسبة انتشار واحدة» تصلح لكل المواد والسكان. تعرض هذه الصفحة سجلات قابلة للتتبع، وتُبقي تعريف المؤشر والسنة والجغرافيا والسكان ملازمة للرقم حتى لا يتحول تقدير فئوي أو وطني إلى ادعاء عالمي أو خاص بمادة منفردة.</p><div className={styles.actions}><Link href="/addiction/substances/">فتح أطلس المواد</Link><Link href="/addiction/mortality/">الوفيات والأضرار</Link><Link href="/addiction/methodology/">المنهجية</Link><button type="button" onClick={undefined} hidden aria-hidden="true">طباعة</button></div></header>
    <aside className={styles.notice}><strong>قاعدة قراءة</strong><p>عدد المستخدمين، انتشار الاستخدام، اضطراب الاستخدام، والاعتماد مؤشرات مختلفة. لا يجوز مقارنتها أو جمعها كما لو كانت المقياس نفسه.</p></aside>
    <section className={styles.section}><h2>السجلات الموثقة</h2><div className={styles.statsGrid}>{atlas.epidemiology.map((record) => { const source = getAtlasSource(atlas, record.source_id); return <article className={styles.statCard} key={record.id}><div className={styles.statTop}><strong>{formatValue(record.value, record.qualifier)}</strong><span>{record.year}</span></div><p>{record.definition_ar}</p><dl className={styles.metaList}><div><dt>الجغرافيا</dt><dd>{geographyLabel(record.geography)}</dd></div>{record.population ? <div><dt>السكان/النطاق</dt><dd>{record.population}</dd></div> : null}<div><dt>المؤشر</dt><dd dir="ltr">{record.metric}</dd></div></dl>{source ? <p className={styles.sourceLine}><strong>المصدر:</strong> <a href={source.url} target="_blank" rel="noopener noreferrer">{source.organization} — {source.title}</a></p> : <p>معرّف المصدر: {record.source_id}</p>}</article>; })}</div></section>
    <section className={styles.section}><h2>قواعد تمنع إساءة تفسير البيانات</h2><ol>{atlas.epidemiologyRules.map((rule) => <li key={rule}>{rule}</li>)}</ol></section>
    <section className={styles.section}><h2>ما الذي لا تقوله هذه الأرقام؟</h2><div className={styles.grid}><article className={styles.card}><h3>لا تحدد خطر شخص بعينه</h3><p>بيانات السكان لا تتحول إلى احتمال شخصي للإدمان أو التسمم، ولا تصف أثر جرعة أو تعرض فردي.</p></article><article className={styles.card}><h3>لا تنقل رقم الفئة إلى مادة مفردة</h3><p>رقم الأفيونات غير الطبية مثلًا لا يساوي عدد مستخدمي الفنتانيل أو الهيروين منفردًا ما لم يقدم المصدر تفصيلًا خاصًا بهما.</p></article></div></section>
    <p className={styles.updateLine}>آخر تحديث لنسخة البيانات المثبتة: <time dateTime={atlas.updatedOn}>{atlas.updatedOn}</time>.</p>
  </main><SiteFooter /></>;
}
