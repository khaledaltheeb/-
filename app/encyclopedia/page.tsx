import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getEncyclopediaCount, getEncyclopediaItems } from '@/lib/encyclopedia';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'الموسوعة المختصرة: الحالات والاضطرابات النفسية من مصادر موثوقة',
    description: 'الموسوعة المختصرة في منصة روافد تحفظ الصفحات النفسية الحالية وتعرض تعريف الحالات والأعراض والأسباب والتقييم والعلاج والأسئلة الشائعة بمراجع موثوقة.',
    path: '/encyclopedia/',
    index: true,
    follow: true,
    type: 'website',
    keywords: ['الموسوعة المختصرة', 'الموسوعة النفسية المختصرة', 'الاضطرابات النفسية', 'الحالات النفسية', 'أعراض الاضطرابات النفسية'],
  });
}

export default async function EncyclopediaHubPage() {
  const [items, total] = await Promise.all([getEncyclopediaItems(60), getEncyclopediaCount()]);
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الموسوعة المختصرة', path: '/encyclopedia/' },
  ]);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/encyclopedia/#page`,
    url: `${SITE_URL}/encyclopedia/`,
    name: 'الموسوعة المختصرة',
    description: 'مرجع عربي مختصر يحفظ صفحات الحالات والاضطرابات النفسية الحالية بمصادر صحية ومهنية وبحثية موثوقة.',
    inLanguage: 'ar',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.title,
        url: `${SITE_URL}${item.canonicalUrl}`,
      })),
    },
  };

  return <><SiteHeader /><main className="article-shell encyclopedia-hub">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, schema]).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors/short-encyclopedia">قطاع الموسوعة المختصرة</Link><span>/</span><span aria-current="page">الموسوعة المختصرة</span></nav>
    <section className="article-hero encyclopedia-hero">
      <span className="eyebrow">مرجع نفسي مختصر</span>
      <h1>الموسوعة المختصرة</h1>
      <p>هذه هي الموسوعة النفسية الحالية بعد فصلها تنظيميًا عن مشروع الموسوعة الموسعة. جميع الصفحات القديمة محفوظة في مساراتها الأصلية دون حذف أو تغيير للروابط القانونية، وتقدم تعريفات موثقة للحالات والاضطرابات النفسية مع الأعراض والأسباب وعوامل الخطورة والتقييم وخيارات العلاج والدعم والأسئلة التي يبحث عنها المستخدمون.</p>
      <div className="tag-list"><span>{total} حالة منشورة</span><span>المسارات القديمة محفوظة</span><span>مراجع موثقة</span><span>لا صفحات مكررة</span></div>
      <form className="encyclopedia-search" action="/search" method="get" role="search"><label className="sr-only" htmlFor="encyclopedia-search">البحث في الموسوعة المختصرة</label><input id="encyclopedia-search" name="q" type="search" placeholder="ابحث عن حالة أو اضطراب أو عرض نفسي" maxLength={160}/><input type="hidden" name="type" value="condition"/><button type="submit">بحث في الموسوعة</button></form>
      <nav className="encyclopedia-nav" aria-label="أدوات الموسوعة"><Link href="/sectors/short-encyclopedia">قطاع الموسوعة المختصرة</Link><Link href="/encyclopedia/index/1/">الفهرس الكامل</Link><Link href="/search/?type=condition">البحث في الحالات</Link><Link href="/sections/cognitive-processes">الموسوعة الموسعة</Link><Link href="/care-guides/">أدلة الرعاية</Link><Link href="/evidence-guides/">الأدلة العلمية</Link></nav>
    </section>
    <section className="article-related encyclopedia-index-preview" aria-labelledby="encyclopedia-index-title">
      <div className="section-mini-heading"><div><span className="eyebrow">مدخل الفهرس</span><h2 id="encyclopedia-index-title">أول الحالات أبجديًا</h2></div><span>نعرض 60 صفحة فقط هنا لحماية سرعة صفحة المدخل</span></div>
      <div className="related-content-grid">
        {items.map((item) => <article key={item.id}><span>حالة نفسية</span><h3><Link href={item.canonicalUrl}>{item.title}</Link></h3>{item.excerpt ? <p>{item.excerpt}</p> : null}<Link href={item.canonicalUrl}>قراءة الدليل ←</Link></article>)}
      </div>
      {total > items.length ? <p className="encyclopedia-full-index"><Link href="/encyclopedia/index/1/">استعراض الفهرس الكامل للموسوعة المختصرة ←</Link></p> : null}
    </section>
    <section className="article-body encyclopedia-method">
      <h2>لماذا أصبحت هذه «الموسوعة المختصرة»؟</h2>
      <p>تم فصل هذه المجموعة عن مشروع الموسوعة الموسعة للحفاظ على الصفحات المنشورة القديمة دون حذفها أو تغيير مساراتها، ولمنع تعارض نية البحث أو إنشاء صفحتين للمصطلح نفسه. تبقى كل صفحة هنا Canonical في مسارها الحالي، بينما تتوسع الموسوعة الجديدة بمصطلحات إضافية لا تكرر الموجود.</p>
      <h2>كيف تُبنى صفحات الموسوعة المختصرة؟</h2>
      <p>كل صفحة تُبنى حول نية بحث مستقلة، وتبدأ بالتعريف العلمي ثم العلامات والأعراض، الأسباب وعوامل الخطورة، التشخيص والتقييم، التشخيص التفريقي عند الحاجة، خيارات العلاج والدعم، متى تُطلب المساعدة، ثم أسئلة شائعة بصياغة قريبة من لغة البحث. تُوثق الادعاءات الأساسية بمراجع رسمية وإرشادات سريرية ومراجعات علمية كلما أمكن.</p>
      <h2>كيف نمنع التكرار مع الموسوعة الموسعة؟</h2>
      <p>كل مصطلح يملك صفحة Canonical واحدة فقط. المرادفات والاختصارات والتهجئات البديلة تُعامل ككلمات بحث وأسماء بديلة لا كصفحات جديدة. وقبل إدخال أي مصطلح إلى الموسوعة الموسعة يُفحص مقابل هذه المجموعة والمحتوى المنشور في المنصة.</p>
      <h2>حدود المحتوى الطبي</h2>
      <p>الموسوعة للتثقيف ولا تستبدل التقييم الفردي. لا تقدم جرعات دوائية أو تشخيصًا ذاتيًا، ولا تعتبر اختبار الإنترنت بديلًا عن المختص. عند وجود خطر مباشر على السلامة أو أعراض شديدة مفاجئة تكون الأولوية لخدمات الطوارئ والرعاية المحلية المناسبة.</p>
    </section>
  </main><SiteFooter /></>;
}
