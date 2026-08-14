import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getEncyclopediaCount, getEncyclopediaItems } from '@/lib/encyclopedia';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: 'موسوعة روافد | الصحة النفسية والإعاقة والنمو والتعلم والدمج',
    description: 'موسوعة عربية علمية للحالات والاضطرابات النفسية والنمائية والإعاقات والمتلازمات وصعوبات التعلم والتواصل: التعريف، العلامات، الأسباب، التقييم، الدعم والتعليم الدامج والمراجع.',
    path: '/encyclopedia/',
    index: true,
    follow: true,
    type: 'website',
    keywords: ['موسوعة روافد', 'الموسوعة النفسية', 'ذوو الاحتياجات الخاصة', 'الإعاقة', 'التربية الخاصة', 'التعليم الدامج', 'اضطرابات النمو', 'صعوبات التعلم', 'المتلازمات', 'الاضطرابات النفسية'],
  });
}

export default async function EncyclopediaHubPage() {
  const [items, total] = await Promise.all([getEncyclopediaItems(60), getEncyclopediaCount()]);
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'موسوعة روافد', path: '/encyclopedia/' },
  ]);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/encyclopedia/#page`,
    url: `${SITE_URL}/encyclopedia/`,
    name: 'موسوعة روافد',
    alternateName: ['الموسوعة النفسية', 'موسوعة الإعاقة والدمج'],
    description: 'مرجع عربي علمي موحد للصحة النفسية والنمو العصبي والإعاقة والتعلم والتواصل والمتلازمات والتعليم الدامج، مبني على مصادر صحية وتعليمية ومهنية وبحثية موثوقة.',
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

  return <><SiteHeader /><main className="article-shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, schema]).replace(/</g, '\\u003c') }} />
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">موسوعة روافد</span></nav>
    <section className="article-hero">
      <span className="eyebrow">مرجع علمي عربي موحد</span>
      <h1>موسوعة روافد</h1>
      <p>مرجع عربي للحالات والاضطرابات النفسية والنمائية، والإعاقات والمتلازمات وصعوبات التعلم والتواصل، مع التقييم والدعم والتأهيل والتعليم الدامج والأسئلة التي يبحث عنها المستخدمون. لا تُنشأ صفحة لمجرد اختلاف الاسم أو العبارة؛ لكل صفحة كيان Canonical ونية مستقلة وأدلة قابلة للتتبع.</p>
      <div className="tag-list"><span>{total} صفحة حالة منشورة</span><span>مصادر علمية موثقة</span><span>مراجعة قبل الفهرسة</span><span>الصحة النفسية</span><span>الإعاقة والدمج</span></div>
    </section>
    <nav className="article-related" aria-label="أدوات الموسوعة">
      <Link href="/encyclopedia/index/1/">الفهرس الكامل</Link> · <Link href="/search/?type=condition">البحث في الحالات</Link> · <Link href="/specialists/">دليل المختصين</Link>
    </nav>
    <section className="article-related" aria-labelledby="encyclopedia-index-title">
      <div className="section-mini-heading"><div><span className="eyebrow">مدخل الفهرس</span><h2 id="encyclopedia-index-title">أول الصفحات أبجديًا</h2></div><span>نعرض 60 صفحة فقط هنا لحماية سرعة صفحة المدخل</span></div>
      <div className="related-content-grid">
        {items.map((item) => <article key={item.id}><span>صفحة موسوعية</span><h3><Link href={item.canonicalUrl}>{item.title}</Link></h3>{item.excerpt ? <p>{item.excerpt}</p> : null}<Link href={item.canonicalUrl}>قراءة الدليل ←</Link></article>)}
      </div>
      {total > items.length ? <p><Link href="/encyclopedia/index/1/">استعراض الفهرس الكامل للموسوعة ←</Link></p> : null}
    </section>
    <section className="article-body">
      <h2>كيف تُبنى صفحات موسوعة روافد؟</h2>
      <p>كل صفحة تُبنى حول نية بحث مستقلة وتبدأ بالتعريف العلمي، ثم السمات أو العلامات والأعراض عند انطباقها، الأسباب وعوامل الخطورة، التقييم والتشخيص أو الوصف الوظيفي، الفروق المهمة، خيارات العلاج أو التأهيل أو الدعم، التعليم الدامج والتسهيلات عندما تكون ذات صلة، ثم أسئلة شائعة بصياغة قريبة من لغة البحث. تُوثق الادعاءات الأساسية بمصادر رسمية وإرشادات سريرية وتربوية ومراجعات علمية وكتب أكاديمية معتبرة بحسب نوع الموضوع.</p>
      <h2>كيف نتوسع إلى آلاف الصفحات دون محتوى رقيق؟</h2>
      <p>صفحة المدخل لا تحمل آلاف الروابط والبطاقات دفعة واحدة. الفهرس الكامل مقسم إلى صفحات ثابتة الحجم، بينما تبقى خريطة الموقع مسؤولة عن اكتشاف كل صفحة منشورة. المرادفات تُدمج في الصفحة الأساسية نفسها، وتُمنع الصفحات المتنافسة على الكيان أو النية نفسها، وتخضع الدفعات لاختبارات تشابه ومصادر وCanonical قبل النشر.</p>
      <h2>الصحة النفسية والإعاقة ضمن موسوعة واحدة</h2>
      <p>تعامل الموسوعة الصحة النفسية والنمو العصبي والإعاقة والتعلم والتواصل بوصفها مجالات مترابطة لا متطابقة. لا تُحوّل الإعاقة إلى مرض لمجرد وجودها داخل موسوعة صحية، ولا تُختزل الحالة الطبية في تشخيص وظيفي واحد. عند موضوعات الإعاقة والدمج يُراعى الأداء والمشاركة والحواجز البيئية والتقنية المساعدة وحقوق الوصول، إلى جانب المعلومات الصحية عند الحاجة.</p>
      <h2>حدود المحتوى الطبي والتربوي</h2>
      <p>الموسوعة للتثقيف ولا تستبدل التقييم الفردي. لا تقدم جرعات دوائية أو تشخيصًا ذاتيًا أو برنامجًا علاجيًا موحدًا، ولا تعتبر اختبار الإنترنت بديلًا عن المختص. كما لا تحدد التسهيلات التعليمية من اسم التشخيص وحده؛ بل تربطها بالعائق والهدف والاحتياج الفردي. عند وجود خطر مباشر على السلامة أو أعراض شديدة مفاجئة تكون الأولوية لخدمات الطوارئ والرعاية المحلية المناسبة.</p>
    </section>
  </main><SiteFooter /></>;
}
