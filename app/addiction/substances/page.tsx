import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import AddictionAtlasBrowser from '@/components/addiction-atlas-browser';
import { getAddictionAtlas } from '@/lib/addiction-atlas';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/addiction-atlas.module.css';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'الأطلس العربي التفاعلي للمواد والإدمان',
    description: 'أطلس عربي تفاعلي موثق للمواد ذات الصلة بالإدمان: الأسماء العربية والإنجليزية، ثمانية محاور للمخاطر، الانتشار، الوفيات، الانسحاب، الطوارئ، العلاج والمقارنات.',
    path: '/addiction/substances/', index: true, follow: true, type: 'website',
    keywords: ['أطلس المخدرات', 'المواد المسببة للإدمان', 'أضرار المخدرات', 'الجرعة الزائدة', 'انسحاب المخدرات', 'علاج الإدمان'],
    relatedTerms: ['opioids', 'stimulants', 'benzodiazepines', 'cannabis', 'hallucinogens', 'inhalants'],
  });
}

export default async function AddictionSubstancesPage() {
  const atlas = await getAddictionAtlas();
  const indexableComparisons = atlas.comparisons.filter((item) => item.indexable);
  const schemas = [
    breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'أطلس المواد', path: '/addiction/substances/' }]),
    { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${SITE_URL}/addiction/substances/#collection`, url: `${SITE_URL}/addiction/substances/`, name: 'الأطلس العربي التفاعلي للمواد والإدمان', inLanguage: 'ar', dateModified: atlas.updatedOn, publisher: { '@id': `${SITE_URL}/#organization` }, mainEntity: { '@type': 'ItemList', numberOfItems: atlas.substances.length, itemListElement: atlas.substances.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: `${item.display_name_ar} — ${item.display_name_en}`, url: `${SITE_URL}/addiction/substances/${item.slug}/` })) } },
  ];
  return <><SiteHeader /><main className={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><span aria-current="page">أطلس المواد</span></nav>
    <header className={styles.hero}><span className={styles.eyebrow}>تمت المراجعة من قبل فريق روافد · 8 محاور مستقلة · عدم اليقين ظاهر</span><h1>الأطلس العربي التفاعلي للمواد والإدمان</h1><p>مكتبة منظمة تضم {atlas.substances.length} مادة أو عائلة دوائية/نفسية مع أسماء عربية وإنجليزية، معلومات سريرية موجزة، مخاطر متعددة المحاور، وطبقات مستقلة للانتشار والوفيات. لا تختزل الخطورة في رقم واحد ولا تعتبر القيم الأقل دليلاً على الأمان.</p><div className={styles.actions}><Link href="/addiction/compare/">{indexableComparisons.length} مقارنة تحريرية</Link><Link href="/addiction/prevalence/">الانتشار والإحصاءات</Link><Link href="/addiction/mortality/">الوفيات والجرعات الزائدة</Link><Link href="/addiction/methodology/">اقرأ المنهجية</Link><Link href="/addiction/withdrawal-safety/">سلامة الانسحاب والطوارئ</Link></div></header>
    <aside className={styles.notice}><strong>تنبيه طبي</strong><p>إذا كان هناك عدم استجابة، بطء أو توقف في التنفس، اختلاج، ألم صدر، فرط حرارة شديد، ارتباك حاد أو خطر مباشر على النفس أو الآخرين، فالأولوية لخدمات الطوارئ المحلية. الأطلس للتثقيف ولا يقدم جرعات استخدام أو وصفات خلط أو خطة انسحاب ذاتية.</p></aside>
    <section className={styles.statsSummary} aria-label="نطاق بيانات الأطلس"><article><strong>{atlas.substances.length}</strong><span>مادة/عائلة</span></article><article><strong>{indexableComparisons.length}</strong><span>مقارنة تحريرية</span></article><article><strong>{atlas.epidemiology.length}</strong><span>سجلات انتشار موثقة</span></article><article><strong>{atlas.mortality.length}</strong><span>سجلات وفيات موثقة</span></article></section>
    <AddictionAtlasBrowser substances={atlas.substances} methodology={atlas.methodology} comparisons={atlas.comparisons} />
    <section className={styles.section}><h2>كيف تقرأ الأطلس؟</h2><div className={styles.grid}><article className={styles.card}><h3>ثمانية محاور بدل «درجة خطر كلية»</h3><p>السمية الحادة، الجرعة الزائدة، الاعتماد، خطورة الانسحاب، الضرر العصبي، القلبي، التنفسي، وخطر الخلط تقرأ منفصلة لأن المادة قد تكون شديدة في محور وأقل في آخر.</p></article><article className={styles.card}><h3>الاسم والبحث دون حشو</h3><p>يستخدم البحث المرادفات والكتابة العربية للاسم الإنجليزي والأخطاء الشائعة للوصول إلى السجل الصحيح، لكن هذه الكلمات لا تحقن كنصوص مخفية أو حشو للمستخدم ومحركات البحث.</p></article><article className={styles.card}><h3>الإحصاء ليس درجة خطر</h3><p>الانتشار والوفيات طبقات رصد سكاني مستقلة عن درجات المخاطر. كل رقم يبقى مرتبطًا بالسنة والجغرافيا وتعريف المؤشر ومصدره.</p></article><article className={styles.card}><h3>نسخة بيانات ثابتة قابلة للمراجعة</h3><p>تشغّل الواجهة نسخة بيانات موثقة ومضمّنة في المستودع بدل الاعتماد وقت العرض على مصدر خارجي متحرك.</p></article></div></section>
    <section className={styles.section}><h2>حدود التفسير</h2><p>{atlas.comparisonPolicy}</p><p>آخر تحديث لنسخة البيانات المثبتة: <time dateTime={atlas.updatedOn}>{atlas.updatedOn}</time>.</p></section>
  </main><SiteFooter /></>;
}
