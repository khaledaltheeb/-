import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { getQuickInfoItems } from '@/lib/quick-info';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildSeoMetadata({
  title: 'معلومات سريعة | روافد',
  description: 'مكتبة عربية موثقة للأسئلة النفسية والاجتماعية اليومية: مقارنات وفحوص تثقيفية وعوامل محتملة وخطوات عملية دون تشخيص ذاتي.',
  path: '/quick-info/',
  index: true,
  follow: true,
  type: 'website',
});

export default async function QuickInfoPage() {
  const items = await getQuickInfoItems();
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'معلومات سريعة', path: '/quick-info/' },
  ]);
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/quick-info/#collection`,
    url: `${SITE_URL}/quick-info/`,
    name: 'معلومات سريعة',
    inLanguage: 'ar',
    numberOfItems: items.length,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.slice(0, 395).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.title,
        url: `${SITE_URL}${item.canonicalUrl}`,
      })),
    },
  };

  return <>
    <SiteHeader />
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, itemList]).replace(/</g, '\\u003c') }} />
      <section className="section-shell">
        <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link prefetch={false} href="/">الرئيسية</Link><span>/</span><span aria-current="page">معلومات سريعة</span></nav>
        <header className="section-heading">
          <span className="eyebrow">معرفة مختصرة، لا تشخيص سريع</span>
          <h1>معلومات سريعة</h1>
          <p>صفحات عملية للأسئلة النفسية والاجتماعية اليومية، مع الحفاظ على الحدود العلمية والمصادر والتنبيه إلى متى يلزم التقييم المهني.</p>
          <div className="tag-list"><span>{items.length} صفحة منشورة</span><span>محتوى تثقيفي</span><span>مصادر خارجية</span></div>
        </header>
        {items.length === 0 ? <section className="content-callout warning" aria-label="حالة القسم">
          <strong>المحتوى قيد الترحيل والمراجعة</strong>
          <p>لا تُعرض صفحات قديمة تلقائيًا قبل اجتياز عقد الترحيل والمراجعة التحريرية.</p>
        </section> : <section className="related-content-grid" aria-label="صفحات المعلومات السريعة">
          {items.map((item) => <article key={item.id}>
            {item.featuredImageUrl && <Image src={item.featuredImageUrl} alt={item.title} width={640} height={360} sizes="(max-width: 760px) 100vw, 33vw" unoptimized />}
            <span>معلومات سريعة</span>
            <h2><Link prefetch={false} href={item.canonicalUrl}>{item.title}</Link></h2>
            {item.excerpt && <p>{item.excerpt}</p>}
            <Link prefetch={false} href={item.canonicalUrl}>قراءة الصفحة ←</Link>
          </article>)}
        </section>}
      </section>
    </main>
    <SiteFooter />
  </>;
}
