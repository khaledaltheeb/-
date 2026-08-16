import type { CSSProperties } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import { getPublicSectors } from '@/lib/public-taxonomy';
import { getHomepageContent } from '@/lib/public-content';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = buildSeoMetadata({
  title: 'الصحة النفسية وذوو الاحتياجات الخاصة والتعافي',
  description: 'منصة روافد للصحة النفسية وذوي الاحتياجات الخاصة والدمج والتعافي والتمكين: معرفة موثوقة، أدلة عملية، مختصون ومراكز وخدمات مترابطة للأفراد والأسر ومقدمي الخدمة.',
  path: '/',
  index: true,
  keywords: ['الصحة النفسية', 'ذوو الاحتياجات الخاصة', 'الدمج', 'التمكين', 'الإدمان والتعافي', 'مختص نفسي', 'مراكز نفسية', 'منصة روافد'],
});

const quickSearches = [
  ['الصحة النفسية', 'الصحة النفسية'],
  ['الإدمان والتعافي', 'الإدمان والتعافي'],
  ['ذوو الاحتياجات الخاصة', 'ذوو الاحتياجات الخاصة'],
  ['دعم الأسرة', 'دعم الأسرة'],
];

const contentTypeLabels: Record<string, string> = {
  article: 'مقال', guide: 'دليل', condition: 'حالة', research: 'بحث', comparison: 'مقارنة',
  tool: 'أداة', assessment: 'تقييم إرشادي', resource: 'مورد', faq: 'أسئلة شائعة', news: 'خبر',
};

export default async function HomePage() {
  const [sectors, latestContent] = await Promise.all([
    getPublicSectors(12),
    getHomepageContent(6),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="site-shell rawafid-home">
        <section className="rawafid-hero" aria-labelledby="home-title">
          <div className="rawafid-hero-copy">
            <span className="rawafid-kicker">المعرفة والرعاية تبدأ من فهم احتياجك</span>
            <h1 id="home-title">طريق أوضح إلى <em>المعرفة والدعم</em> المناسبين.</h1>
            <p>منصة عربية تجمع المعرفة الموثوقة، الأدلة العملية، والمختصين والمراكز ضمن تجربة تحترم خصوصيتك وتساعدك على اتخاذ الخطوة التالية بثقة.</p>

            <form className="search rawafid-search" action="/search" method="get" role="search">
              <label className="sr-only" htmlFor="home-search">البحث في منصة روافد</label>
              <input id="home-search" name="q" type="search" minLength={2} maxLength={160} autoComplete="off" placeholder="ابحث عن حالة، مصطلح، مختص، مركز، أداة، مقال أو سؤال..." />
              <button type="submit">ابحث الآن</button>
            </form>

            <div className="rawafid-quick-links" aria-label="عمليات بحث مقترحة">
              {quickSearches.map(([label, query]) => <Link prefetch={false} key={label} href={`/search?q=${encodeURIComponent(query)}`}>{label}</Link>)}
            </div>
          </div>

          <aside className="rawafid-hero-visual" aria-label="مسارات البدء في منصة روافد">
            <div className="hero-pathway-heading">
              <span className="rawafid-visual-badge"><i className="rawafid-visual-status" aria-hidden="true" />ابدأ بخطوة بسيطة</span>
              <h2>ما الأقرب إلى احتياجك الآن؟</h2>
              <p>اختر مسارًا، ويمكنك تغييره في أي وقت.</p>
            </div>
            <div className="hero-pathway-list">
              <Link prefetch={false} href="/search"><span><PlatformIcon name="knowledge" /></span><div><strong>أحتاج معلومة موثوقة</strong><small>حالات، أدلة، أسئلة وأدوات عملية</small></div><i aria-hidden="true">←</i></Link>
              <Link prefetch={false} href="/specialists"><span><PlatformIcon name="specialist" /></span><div><strong>أبحث عن مساعدة مهنية</strong><small>مختصون ومراكز ضمن دليل واضح</small></div><i aria-hidden="true">←</i></Link>
              <Link prefetch={false} href="/search?q=دعم+الأسرة"><span><PlatformIcon name="community" /></span><div><strong>أساند قريبًا أو أسرة</strong><small>مسارات عملية لمقدمي الدعم والرعاية</small></div><i aria-hidden="true">←</i></Link>
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
            <div className="rawafid-section-title"><span>مجالات روافد</span><h2 id="sectors-title">استكشف المعرفة حسب المجال</h2><p>موضوعات مترابطة في الصحة النفسية والتعافي والدمج والتمكين، منظمة لتصل إلى ما يفيدك بأقل خطوات ممكنة.</p></div>
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

        {latestContent.length > 0 && <section className="rawafid-section rawafid-editorial-section" aria-labelledby="latest-content-title">
          <div className="rawafid-section-head">
            <div className="rawafid-section-title"><span>مختارات المعرفة</span><h2 id="latest-content-title">محتوى حديث من مكتبة روافد</h2><p>صفحات منشورة من قاعدة المعرفة، تظهر هنا تلقائيًا عند تحديثها واعتمادها.</p></div>
            <Link prefetch={false} className="section-text-link" href="/search">استكشف كل المعرفة ←</Link>
          </div>
          <div className="rawafid-editorial-grid">
            {latestContent.map((item, index) => <article className={index === 0 ? 'featured' : ''} key={item.slug}>
              <div className="editorial-card-meta"><span>{contentTypeLabels[item.content_type] ?? 'معرفة'}</span><time dateTime={item.published_at ?? item.updated_at}>{new Intl.DateTimeFormat('ar', { dateStyle: 'medium' }).format(new Date(item.published_at ?? item.updated_at))}</time></div>
              <h3><Link prefetch={false} href={`/content/${item.slug}`}>{item.title}</Link></h3>
              {item.excerpt && <p>{item.excerpt}</p>}
              <Link prefetch={false} className="editorial-card-link" href={`/content/${item.slug}`}>اقرأ الصفحة ←</Link>
            </article>)}
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
            <h2 id="professional-title">ساهم بمعرفة موثوقة أو انضم إلى دليل روافد.</h2>
            <p>مسار تقديم واضح، مستندات خاصة، مراجعة إدارية، ومحرر منظم يتيح للمختص إنشاء محتواه ومتابعة مراحله.</p>
          </div>
          <div><Link prefetch={false} className="primary-link" href="/join">ابدأ طلب الانضمام</Link><Link prefetch={false} className="button" href="/editorial-policy">تعرف على معايير النشر</Link></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
