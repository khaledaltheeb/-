import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import AddictionComparisonExplorer from '@/components/addiction-comparison-explorer';
import { getAddictionAtlas } from '@/lib/addiction-atlas';
import { ADF_PROVENANCE_NOTE_AR, ADF_RESOURCES, countAdfDrugFactReferences } from '@/lib/adf-addiction';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/addiction-atlas.module.css';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'مقارنة المخدرات والمواد تفاعليًا | فروق علمية موثقة',
    description: 'مقارنة تفاعلية بين المواد عبر ثمانية محاور مستقلة وطبقة سريرية تشمل التأثيرات والانسحاب والعلاج والطوارئ والتفاعلات، مع مقارنات تحريرية موثقة.',
    path: '/addiction/compare/', index: true, follow: true, type: 'website',
    keywords: ['الفرق بين المخدرات', 'مقارنة المخدرات', 'تداخلات المخدرات', 'انسحاب المخدرات', 'فنتانيل وهيروين', 'كوكايين وميثامفيتامين', 'ترامادول ومورفين'],
    relatedTerms: ['drug comparison', 'drug interactions', 'withdrawal comparison', 'fentanyl vs heroin', 'cocaine vs methamphetamine', 'tramadol vs morphine'],
  });
}

export default async function ComparisonHubPage() {
  const atlas = await getAddictionAtlas();
  const comparisons = atlas.comparisons.filter((item) => item.indexable);
  const adfCoverage = countAdfDrugFactReferences(atlas.substances);
  const schemas = [
    breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'المقارنات', path: '/addiction/compare/' }]),
    { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${SITE_URL}/addiction/compare/#collection`, url: `${SITE_URL}/addiction/compare/`, name: 'مقارنات المواد والمخدرات', inLanguage: 'ar', dateModified: atlas.updatedOn, publisher: { '@id': `${SITE_URL}/#organization` }, mainEntity: { '@type': 'ItemList', numberOfItems: comparisons.length, itemListElement: comparisons.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title_ar, url: `${SITE_URL}/addiction/compare/${item.slug}/` })) } },
  ];

  return <>
    <SiteHeader />
    <main className={styles.shell}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><span aria-current="page">المقارنات</span></nav>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>تمت المراجعة من قبل فريق روافد · تفاعل فوري + مقارنات تحريرية مستقلة</span>
        <h1>مقارنة المواد والمخدرات</h1>
        <p>{atlas.comparisonPolicy}</p>
        <div className={styles.actions}><Link href="/addiction/substances/">الأطلس التفاعلي</Link><Link href="/addiction/interactions/">التفاعلات المراجعة</Link><Link href="/addiction/methodology/">منهجية المقارنة</Link><Link href="/addiction/evidence-standards/">معايير الأدلة واللغة</Link></div>
      </header>

      <section className={styles.section} aria-labelledby="external-crosscheck-title">
        <div className={styles.card}>
          <span className={styles.eyebrow}>طبقة تحقق خارجية موازية</span>
          <h2 id="external-crosscheck-title">ADF Drug Facts + Power of Words</h2>
          <p>أضفنا خريطة إحالة مباشرة لـ {adfCoverage} سجلًا من سجلات الأطلس إلى صفحات Drug Facts العامة المناسبة عندما توجد مطابقة موثوقة، واستخدمنا Power of Words كمعيار تحريري للغة غير الوصمية.</p>
          <p>{ADF_PROVENANCE_NOTE_AR}</p>
          <div className={styles.actions}><a href={ADF_RESOURCES.drugFacts} target="_blank" rel="noopener noreferrer">ADF Drug Facts</a><a href={ADF_RESOURCES.powerOfWords} target="_blank" rel="noopener noreferrer">ADF Power of Words</a><Link href="/addiction/evidence-standards/">افتح مصفوفة التغطية</Link></div>
        </div>
      </section>

      <AddictionComparisonExplorer substances={atlas.substances} methodology={atlas.methodology} comparisons={atlas.comparisons} interactions={atlas.interactions} />

      <section className={styles.section} aria-labelledby="editorial-comparisons-title">
        <h2 id="editorial-comparisons-title">{comparisons.length} مقارنة تحريرية مراجعة</h2>
        <p>هذه الصفحات مخصصة لأزواج ذات قيمة تفسيرية أو نية بحث حقيقية. لا ننشئ صفحة مفهرسة لكل تركيبة ممكنة حتى لا يتحول الأطلس إلى صفحات مولدة قليلة القيمة.</p>
        <div className={styles.grid}>{comparisons.map((item) => <article className={styles.card} key={item.slug}><h3><Link href={`/addiction/compare/${item.slug}/`}>{item.title_ar}</Link></h3><p>{item.intent_ar}</p><Link href={`/addiction/compare/${item.slug}/`}>فتح المقارنة التفصيلية ←</Link></article>)}</div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
