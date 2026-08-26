import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import AddictionInteractionBrowser from '@/components/addiction-interaction-browser';
import PrintPageButton from '@/components/print-page-button';
import { getAddictionAtlas } from '@/lib/addiction-atlas';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/addiction-atlas.module.css';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'تفاعلات المواد والأدوية في أطلس الإدمان',
    description: 'مصفوفة عربية موثقة للتفاعلات عالية الخطورة بين المواد والأدوية ذات الصلة بالإدمان، مع تفسير الآلية، مستوى الدليل وإرشادات الطوارئ دون استنتاجات آلية غير موثقة.',
    path: '/addiction/interactions/', index: true, follow: true, type: 'website',
    keywords: ['تفاعلات المخدرات', 'خلط الأدوية', 'الفنتانيل والبنزوديازيبين', 'الأفيونات والكحول', 'الفنتانيل والزيلازين'],
    relatedTerms: ['drug interactions', 'opioids benzodiazepines', 'gabapentin opioids', 'xylazine fentanyl'],
  });
}

export default async function AddictionInteractionsPage() {
  const atlas = await getAddictionAtlas();
  const bySlug = new Map(atlas.substances.map((item) => [item.slug, item]));
  const schemas = [
    breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'أطلس المواد', path: '/addiction/substances/' }, { name: 'التفاعلات', path: '/addiction/interactions/' }]),
    { '@context': 'https://schema.org', '@type': 'Dataset', '@id': `${SITE_URL}/addiction/interactions/#dataset`, name: 'طبقة تفاعلات المواد في أطلس روافد', description: atlas.interactionPolicy, url: `${SITE_URL}/addiction/interactions/`, inLanguage: 'ar', dateModified: atlas.updatedOn, publisher: { '@id': `${SITE_URL}/#organization` }, variableMeasured: ['severity', 'evidence_grade', 'evidence_scope', 'mechanism', 'clinical_risk', 'emergency_response'] },
  ];

  return <><SiteHeader /><main className={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><Link href="/addiction/substances/">أطلس المواد</Link><span>/</span><span aria-current="page">التفاعلات</span></nav>
    <header className={styles.hero}><span className={styles.eyebrow}>تمت المراجعة من قبل فريق روافد · تفاعلات موثقة فقط</span><h1>تفاعلات المواد والأدوية: ما الذي يجعل بعض التركيبات أخطر؟</h1><p>هذه الطبقة لا تبني «حاسبة خلط» ولا تقترح كمية أو توقيتاً آمناً. تعرض فقط التفاعلات التي راجعنا لها دليلاً مباشراً أو تحذيراً مؤسسياً ينطبق على الفئات المعنية، وتُظهر بوضوح نوع الدليل وحدوده.</p><div className={styles.actions}><Link href="/addiction/substances/">العودة إلى الأطلس</Link><Link href="/addiction/compare/">المقارنات</Link><Link href="/addiction/mortality/">الوفيات والجرعات الزائدة</Link><Link href="/addiction/methodology/">المنهجية</Link><PrintPageButton label="طباعة / حفظ PDF" /></div></header>
    <aside className={styles.notice}><strong>تنبيه طارئ</strong><p>عدم الاستجابة، التنفس البطيء أو المتوقف، ازرقاق الشفاه، الاختلاج، ألم الصدر أو الارتباك الشديد علامات تستلزم خدمات الطوارئ المحلية فوراً. إذا اشتبه بوجود أفيون وكان النالوكسون متاحاً، يستخدم وفق الإرشادات المحلية؛ لكنه لا يعكس كل المواد غير الأفيونية.</p></aside>
    <section className={styles.statsSummary} aria-label="نطاق طبقة التفاعلات"><article><strong>{atlas.interactions.length}</strong><span>تفاعلات راجعناها</span></article><article><strong>{atlas.interactions.filter((item) => item.severity === 'critical').length}</strong><span>تنبيهات حرجة</span></article><article><strong>{atlas.interactions.filter((item) => item.evidence_scope === 'direct-pair').length}</strong><span>دليل مباشر للزوج</span></article><article><strong>{new Set(atlas.interactions.flatMap((item) => [item.a, item.b])).size}</strong><span>مواد ممثلة</span></article></section>
    <AddictionInteractionBrowser substances={atlas.substances} interactions={atlas.interactions} />
    <section className={styles.section}><h2>سجل التفاعلات المراجعة</h2><div className={styles.statsGrid}>{atlas.interactions.map((item) => { const a = bySlug.get(item.a); const b = bySlug.get(item.b); return <article className={styles.statCard} key={item.id}><div className={styles.statTop}><strong>{a?.display_name_ar} + {b?.display_name_ar}</strong><span>{item.severity === 'critical' ? 'حرج' : item.severity === 'high' ? 'مرتفع' : 'متوسط'}</span></div><p>{item.risk_ar}</p><dl className={styles.metaList}><div><dt>قوة الدليل</dt><dd>{item.evidence_grade}</dd></div><div><dt>نطاق الدليل</dt><dd>{item.evidence_scope === 'direct-pair' ? 'دليل مباشر لهذا الزوج' : item.evidence_scope === 'class-to-substance' ? 'دليل على مستوى الفئة ينطبق على المادة' : 'دليل بين فئتين'}</dd></div></dl><p><Link href={`/addiction/substances/${item.a}/`}>{a?.display_name_ar}</Link> · <Link href={`/addiction/substances/${item.b}/`}>{b?.display_name_ar}</Link></p></article>; })}</div></section>
    <section className={styles.section}><h2>قاعدة التفسير</h2><p>{atlas.interactionPolicy}</p><p>هذه النسخة تبدأ بالأزواج الأعلى أولوية من ناحية السلامة العامة. توسيع المصفوفة يتم فقط بعد تثبيت مصادر مناسبة لكل زوج، لا بالاستنتاج من التشابه أو درجات المخاطر.</p></section>
  </main><SiteFooter /></>;
}
