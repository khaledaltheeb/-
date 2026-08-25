import type { CSSProperties } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import { getPublicSectors } from '@/lib/public-taxonomy';
import { getHomepageContent } from '@/lib/public-content';
import { publicContentHref, publicContentTypeLabel } from '@/lib/public-content-routing';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const revalidate = 300;

export const metadata = buildSeoMetadata({
  title: 'منصة روافد: الصحة النفسية والتربية الخاصة وسرطان الأطفال',
  description: 'منصة روافد منصة عربية مؤسسية للمعرفة الموثوقة في الصحة النفسية والتربية الخاصة والتوحد وصعوبات التعلم وسرطان الأطفال والتعافي، مع أدلة عملية ومختصين ومراكز.',
  path: '/',
  index: true,
  keywords: ['روافد', 'منصة روافد', 'الصحة النفسية', 'التربية الخاصة', 'التوحد', 'صعوبات التعلم', 'سرطان الأطفال', 'التربية الدامجة', 'الإدمان والتعافي', 'دعم الأسرة'],
});

const quickLinks = [
  ['الصحة النفسية', '/sectors/mental-health'],
  ['التوحد', '/sections/autism'],
  ['صعوبات التعلم', '/sections/special-ed-learning-disabilities'],
  ['سرطان الأطفال', '/sectors/pediatric-oncology'],
  ['الإدمان والتعافي', '/sectors/addiction-recovery'],
  ['دعم الأسرة', '/sections/parenting-family'],
] as const;

const homepageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/#homepage`,
  url: `${SITE_URL}/`,
  name: 'منصة روافد | الصحة النفسية والتربية الخاصة وسرطان الأطفال',
  description: 'منصة روافد منصة عربية مؤسسية للمعرفة الموثوقة في الصحة النفسية والتربية الخاصة والتوحد وصعوبات التعلم وسرطان الأطفال والتعافي، مع أدلة عملية ومختصين ومراكز.',
  inLanguage: 'ar',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: [
    'الصحة النفسية',
    'التربية الخاصة',
    'اضطراب طيف التوحد',
    'صعوبات التعلم',
    'التربية الدامجة',
    'سرطان الأطفال',
    'الإدمان والتعافي',
    'دعم الأسرة',
  ].map((name) => ({ '@type': 'Thing', name })),
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/pwa-icon-512`,
    width: 512,
    height: 512,
  },
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export default async function HomePage() {
  const [sectors, latestContent] = await Promise.all([
    getPublicSectors(12),
    getHomepageContent(6),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd).replace(/</g, '\\u003c') }} />
      <SiteHeader />
      <main className="site-shell rawafid-home">
        <section className="rawafid-hero" aria-labelledby="home-title">
          <div className="rawafid-hero-copy">
            <span className="rawafid-kicker">منصة روافد — معرفة عربية موثوقة تقودك إلى الخطوة التالية</span>
            <h1 id="home-title">منصة روافد: <em>الصحة النفسية والتربية الخاصة</em> في منظومة معرفية مترابطة.</h1>
            <p>استكشف محتوى عربيًا موثوقًا في الصحة النفسية، التوحد، صعوبات التعلم، التربية الخاصة والدامجة، سرطان الأطفال، الإدمان والتعافي ودعم الأسرة؛ مع أدلة عملية ودليل للمختصين والمراكز.</p>

            <form className="search rawafid-search" action="/search" method="get" role="search">
              <label className="sr-only" htmlFor="home-search">البحث في منصة روافد</label>
              <input id="home-search" name="q" type="search" minLength={2} maxLength={160} autoComplete="off" placeholder="ابحث عن حالة، توحد، صعوبات تعلم، سرطان أطفال، مختص، مركز، دليل أو سؤال..." />
              <button type="submit">ابحث في روافد</button>
            </form>

            <div className="rawafid-quick-links" aria-label="موضوعات شائعة في منصة روافد">
              {quickLinks.map(([label, href]) => <Link prefetch={false} key={label} href={href}>{label}</Link>)}
            </div>
          </div>

          <aside className="rawafid-hero-visual" aria-label="مسارات البدء في منصة روافد">
            <div className="hero-pathway-heading">
              <span className="rawafid-visual-badge"><i className="rawafid-visual-status" aria-hidden="true" />ابدأ بخطوة بسيطة</span>
              <h2>ما الأقرب إلى احتياجك الآن؟</h2>
              <p>اختر مسارًا، ويمكنك تغييره في أي وقت.</p>
            </div>
            <div className="hero-pathway-list">
              <Link prefetch={false} href="/sectors/pediatric-oncology"><span><PlatformIcon name="review" /></span><div><strong>أبحث عن معلومات عن سرطان الأطفال</strong><small>التشخيص والعلاج والأبحاث والدعم النفسي والأسري والنجاة</small></div><i aria-hidden="true">←</i></Link>
              <Link prefetch={false} href="/care-guides/"><span><PlatformIcon name="knowledge" /></span><div><strong>أحتاج دليلًا عمليًا للرعاية</strong><small>أدلة للأسرة والتعامل اليومي والخطوات العملية</small></div><i aria-hidden="true">←</i></Link>
              <Link prefetch={false} href="/specialists"><span><PlatformIcon name="specialist" /></span><div><strong>أبحث عن مساعدة مهنية</strong><small>مختصون ومراكز ضمن دليل واضح</small></div><i aria-hidden="true">←</i></Link>
              <Link prefetch={false} href="/sections/parenting-family"><span><PlatformIcon name="community" /></span><div><strong>أساند قريبًا أو أسرة</strong><small>مسارات عملية لمقدمي الدعم والرعاية</small></div><i aria-hidden="true">←</i></Link>
            </div>
            <p className="hero-safety-note"><PlatformIcon name="secure" size={18} />إذا كان هناك خطر مباشر، تواصل فورًا مع خدمات الطوارئ المحلية في بلدك.</p>
          </aside>
        </section>

        <section className="rawafid-trust-bar" aria-label="معايير الثقة في منصة روافد">
          <div className="rawafid-trust-item"><PlatformIcon name="review" /><div><strong>مراجعة واضحة</strong><span>مراحل علمية وتحريرية قبل النشر</span></div></div>
          <div className="rawafid-trust-item"><PlatformIcon name="knowledge" /><div><strong>مصادر قابلة للتتبع</strong><span>مراجع وتاريخ مراجعة حيث يلزم</span></div></div>
          <div className="rawafid-trust-item"><PlatformIcon name="secure" /><div><strong>خصوصيتك أولًا</strong><span>بياناتك لا تظهر خارج الغرض المصرح به</span></div></div>
          <div className="rawafid-trust-item"><PlatformIcon name="tools" /><div><strong>إرشاد مسؤول</strong><span>المعرفة لا تستبدل التشخيص الفردي</span></div></div>
        </section>

        <section className="rawafid-section" id="sectors" aria-labelledby="sectors-title">
          <div className="rawafid-section-head">
            <div className="rawafid-section-title"><span>مجالات منصة روافد</span><h2 id="sectors-title">استكشف المعرفة حسب المجال</h2><p>قطاعات مترابطة تشمل الصحة النفسية، التوحد وصعوبات التعلم، التربية الخاصة والدامجة، سرطان الأطفال، التعافي ودعم الأسرة؛ لتسهيل الانتقال من السؤال إلى المعرفة المناسبة.</p></div>
            <Link prefetch={false} className="section-text-link" href="/sectors">عرض جميع القطاعات ←</Link>
          </div>

          {sectors.length > 0 ? (
            <div className="rawafid-sector-grid">
              {sectors.map((sector) => {
                const style = { '--sector-accent': sector.accent || '#0b8f92' } as CSSProperties;
                return <Link prefetch={false} className="rawafid-sector-card" style={style} href={`/sectors/${sector.slug}`} key={sector.slug}>
                  <div className="sector-dot" aria-hidden="true" />
                  <h3>{sector.name_ar}</h3>
                  <p>{sector.description || 'قطاع ضمن الهيكل المؤسسي لمنصة روافد.'}</p>
                  <span>استكشف القطاع ←</span>
                </Link>;
              })}
            </div>
          ) : (
            <div className="rawafid-empty">
              <div className="rawafid-empty-icon"><PlatformIcon name="knowledge" size={30} /></div>
              <h3>لا توجد قطاعات منشورة حاليًا</h3>
              <p>يمكنك استخدام البحث أو تصفح الأقسام للوصول إلى المعرفة المتاحة.</p>
              <Link prefetch={false} className="section-text-link" href="/sections">تصفح الأقسام ←</Link>
            </div>
          )}
        </section>

        <section className="rawafid-section rawafid-pathways" aria-labelledby="pathways-title">
          <div className="rawafid-section-head">
            <div className="rawafid-section-title"><span>مسارات مباشرة</span><h2 id="pathways-title">ابدأ من نوع المحتوى الذي تحتاجه</h2><p>روابط واضحة إلى أكثر المسارات استخدامًا بدل الاعتماد على البحث فقط.</p></div>
          </div>
          <div className="rawafid-platform-grid">
            <Link prefetch={false} className="rawafid-platform-card" href="/care-guides/"><div className="icon-shell"><PlatformIcon name="knowledge" /></div><h3>أدلة التعامل والرعاية</h3><p>أدلة عملية للأسرة والمريض ومقدم الرعاية، منظمة حسب الحاجة والموقف.</p><span>استكشف الأدلة ←</span></Link>
            <Link prefetch={false} className="rawafid-platform-card" href="/evidence-guides/"><div className="icon-shell"><PlatformIcon name="review" /></div><h3>الأدلة العلمية</h3><p>صفحات تلخص الأدلة والدراسات والمصادر مع سياق منهجي واضح.</p><span>استكشف الأدلة العلمية ←</span></Link>
            <Link prefetch={false} className="rawafid-platform-card" href="/sectors/pediatric-oncology"><div className="icon-shell"><PlatformIcon name="community" /></div><h3>مركز سرطان الأطفال</h3><p>مسار موحد للتشخيص والعلاج والدعم النفسي والأسري والنجاة والمتابعة.</p><span>فتح المركز ←</span></Link>
          </div>
        </section>

        {latestContent.length > 0 && <section className="rawafid-section rawafid-editorial-section" aria-labelledby="latest-content-title">
          <div className="rawafid-section-head">
            <div className="rawafid-section-title"><span>مختارات المعرفة</span><h2 id="latest-content-title">محتوى حديث من مكتبة منصة روافد</h2><p>صفحات منشورة من قاعدة المعرفة، تظهر هنا تلقائيًا عند تحديثها واعتمادها.</p></div>
            <Link prefetch={false} className="section-text-link" href="/search">استكشف كل المعرفة ←</Link>
          </div>
          <div className="rawafid-editorial-grid">
            {latestContent.map((item, index) => {
              const href = publicContentHref(item);
              return <article className={index === 0 ? 'featured' : ''} key={item.slug}>
                <div className="editorial-card-meta"><span>{publicContentTypeLabel(item.content_type)}</span><time dateTime={item.published_at ?? item.updated_at}>{new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(item.published_at ?? item.updated_at))}</time></div>
                <h3><Link prefetch={false} href={href}>{item.title}</Link></h3>
                {item.excerpt && <p>{item.excerpt}</p>}
                <Link prefetch={false} className="editorial-card-link" href={href}>اقرأ الصفحة ←</Link>
              </article>;
            })}
          </div>
        </section>}

        <section className="rawafid-section">
          <div className="rawafid-directory-band">
            <div>
              <span className="rawafid-kicker">الدليل المهني</span>
              <h2>اعثر على مختص أو مركز بمعلومات أوضح وثقة أكبر</h2>
              <p>ملفات مهنية منظمة، حالة توثيق ظاهرة، تخصصات وخدمات ومواقع وطرق تواصل تساعدك على مقارنة الخيارات قبل اتخاذ القرار.</p>
              <div className="rawafid-directory-actions"><Link prefetch={false} className="primary-link" href="/specialists">دليل المختصين</Link><Link prefetch={false} className="button" href="/centers">دليل المراكز</Link></div>
            </div>
            <div className="rawafid-directory-panel" aria-label="خصائص الدليل">
              <div><PlatformIcon name="review" /><strong>توثيق واعتماد</strong></div>
              <div><PlatformIcon name="secure" /><strong>خصوصية البيانات</strong></div>
              <div><PlatformIcon name="specialist" /><strong>تواصل ومواعيد</strong></div>
              <div><PlatformIcon name="center" /><strong>موقع وفروع</strong></div>
            </div>
          </div>
        </section>

        <section className="rawafid-section rawafid-professional-callout" aria-labelledby="professional-title">
          <div>
            <span className="rawafid-kicker">للمختصين والجهات والمجتمع المهني</span>
            <h2 id="professional-title">ساهم بمعرفة موثوقة أو انضم إلى دليل منصة روافد.</h2>
            <p>مسار تقديم واضح، مستندات خاصة، مراجعة إدارية، ومحرر منظم يتيح للمختص إنشاء محتواه ومتابعة مراحله.</p>
          </div>
          <div><Link prefetch={false} className="primary-link" href="/join">ابدأ طلب الانضمام</Link><Link prefetch={false} className="button" href="/editorial-policy">تعرف على معايير النشر</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}