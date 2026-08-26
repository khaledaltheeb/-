import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getAddictionAtlas } from '@/lib/addiction-atlas';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/addiction-atlas.module.css';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({ title: 'مقارنات المواد والمخدرات: فروق علمية موثقة', description: 'مقارنات عربية موثقة بين مواد متقاربة أو يكثر السؤال عن الفرق بينها، عبر ثمانية محاور مستقلة مع آلية التأثير والانسحاب والعلاج والمصادر.', path: '/addiction/compare/', index: true, follow: true, type: 'website', keywords: ['الفرق بين المخدرات', 'مقارنة المخدرات', 'فنتانيل وهيروين', 'كوكايين وميثامفيتامين', 'ترامادول ومورفين'] });
}

export default async function ComparisonHubPage() {
  const atlas = await getAddictionAtlas();
  const comparisons = atlas.comparisons.filter((item) => item.indexable);
  const schemas = [breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'الإدمان والتعافي', path: '/addiction/' }, { name: 'المقارنات', path: '/addiction/compare/' }]), { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${SITE_URL}/addiction/compare/#collection`, url: `${SITE_URL}/addiction/compare/`, name: 'مقارنات المواد والمخدرات', inLanguage: 'ar', dateModified: atlas.updatedOn, publisher: { '@id': `${SITE_URL}/#organization` }, mainEntity: { '@type': 'ItemList', numberOfItems: comparisons.length, itemListElement: comparisons.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.title_ar, url: `${SITE_URL}/addiction/compare/${item.slug}/` })) } }];
  return <><SiteHeader /><main className={styles.shell}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} /><nav className="breadcrumbs"><Link href="/">الرئيسية</Link><span>/</span><Link href="/addiction/">الإدمان والتعافي</Link><span>/</span><span>المقارنات</span></nav><header className={styles.hero}><span className={styles.eyebrow}>تمت المراجعة من قبل فريق روافد · مقارنات ذات نية بحث حقيقية</span><h1>مقارنات المواد والمخدرات</h1><p>{atlas.comparisonPolicy}</p><div className={styles.actions}><Link href="/addiction/substances/">الأطلس التفاعلي</Link><Link href="/addiction/methodology/">منهجية المقارنة</Link></div></header><section className={styles.section}><h2>{comparisons.length} مقارنة تحريرية</h2><div className={styles.grid}>{comparisons.map((item) => <article className={styles.card} key={item.slug}><h3><Link href={`/addiction/compare/${item.slug}/`}>{item.title_ar}</Link></h3><p>{item.intent_ar}</p><Link href={`/addiction/compare/${item.slug}/`}>فتح المقارنة التفصيلية</Link></article>)}</div></section></main><SiteFooter /></>;
}
