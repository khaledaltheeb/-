import type { CSSProperties } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import { getPublicSectors } from '@/lib/public-taxonomy';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = buildSeoMetadata({
  title: 'الصحة النفسية والتعافي والتمكين',
  description: 'منصة روافد للصحة النفسية والتعافي والدمج والتمكين: معرفة موثوقة، أدلة عملية، دليل مختصين ومراكز، وخدمات مترابطة للأفراد والأسر ومقدمي الخدمة في الوطن العربي.',
  path: '/',
  index: true,
  keywords: ['الصحة النفسية', 'التعافي', 'الدمج', 'التمكين', 'مختص نفسي', 'مراكز نفسية', 'منصة روافد'],
});

const quickSearches = [
  ['الصحة النفسية', 'الصحة النفسية'],
  ['الإدمان والتعافي', 'الإدمان والتعافي'],
  ['دعم الأسرة', 'دعم الأسرة'],
  ['ذوو الاحتياجات الخاصة', 'ذوو الاحتياجات الخاصة'],
];

const platformModules = [
  { href: '/search', icon: 'knowledge' as const, title: 'المعرفة والموسوعة', text: 'محرك معرفة منظم للمقالات والأدلة والحالات والأبحاث.', accent: '#08716d' },
  { href: '/specialists', icon: 'specialist' as const, title: 'دليل المختصين', text: 'ملفات مهنية موثقة مع تخصصات ومؤهلات وخيارات تواصل.', accent: '#2f68a8' },
  { href: '/centers', icon: 'center' as const, title: 'دليل المراكز', text: 'مراكز وفروع وخدمات ومواقع ضمن دورة تحقق إدارية.', accent: '#6753b5' },
  { href: '/search', icon: 'tools' as const, title: 'الأدوات والمسارات', text: 'بنية جاهزة للأدوات والاختبارات والمسارات التعليمية.', accent: '#a94334' },
  { href: '/community', icon: 'community' as const, title: 'المتدربون والمتطوعون', text: 'مساحة مستقلة للانتساب والتدريب والعمل التطوعي المنظم.', accent: '#3d7d45' },
];

export default async function HomePage() {
  const sectors = await getPublicSectors(12);

  return (
    <>
      <SiteHeader />
      <main className="site-shell rawafid-home">
        <section className="rawafid-hero" aria-labelledby="home-title">
          <div className="rawafid-hero-copy">
            <span className="rawafid-kicker">منصة عربية مؤسسية متكاملة</span>
            <h1 id="home-title">معرفة أوضح، وصول أسرع، و<em>خدمات مترابطة</em></h1>
            <p>روافد تجمع المعرفة المتخصصة، الأدلة العملية، المختصين والمراكز في تجربة عربية واحدة مصممة للفرد والأسرة ومقدم الخدمة.</p>

            <form className="search rawafid-search" action="/search" method="get" role="search">
              <label className="sr-only" htmlFor="home-search">البحث في منصة روافد</label>
              <input id="home-search" name="q" type="search" minLength={2} maxLength={160} autoComplete="off" placeholder="ابحث عن موضوع، حالة، مختص، مركز أو خدمة..." />
              <button type="submit">ابحث الآن</button>
            </form>

            <div className="rawafid-quick-links" aria-label="عمليات بحث مقترحة">
              {quickSearches.map(([label, query]) => <a key={label} href={`/search?q=${encodeURIComponent(query)}`}>{label}</a>)}
            </div>
          </div>

          <aside className="rawafid-hero-visual" aria-label="مكونات منصة روافد">
            <div>
              <div className="rawafid-visual-top">
                <span className="rawafid-visual-badge"><i className="rawafid-visual-status" aria-hidden="true" />منصة واحدة · خدمات مترابطة</span>
              </div>
              <h2>بنية مصممة لتبقى واضحة مهما توسعت المنصة.</h2>
              <p>القطاعات والمحتوى والدلائل والحسابات تُدار من قاعدة بيانات واحدة، بينما يبقى التصميم موحدًا ومتجاوبًا على جميع الأجهزة.</p>
            </div>
            <div className="rawafid-visual-grid">
              <div className="rawafid-visual-card"><PlatformIcon name="knowledge" /><div><strong>معرفة منظمة</strong><span>قطاعات وأقسام ومحتوى ديناميكي</span></div></div>
              <div className="rawafid-visual-card"><PlatformIcon name="review" /><div><strong>مراجعة واعتماد</strong><span>Workflow وتوثيق وسجل تغييرات</span></div></div>
              <div className="rawafid-visual-card"><PlatformIcon name="specialist" /><div><strong>دليل مهني</strong><span>مختصون ومراكز وملفات موثقة</span></div></div>
              <div className="rawafid-visual-card"><PlatformIcon name="secure" /><div><strong>خصوصية وصلاحيات</strong><span>RBAC وRLS وحدود وصول واضحة</span></div></div>
            </div>
          </aside>
        </section>

        <section className="rawafid-trust-bar" aria-label="معايير بناء المنصة">
          <div className="rawafid-trust-item"><PlatformIcon name="review" /><div><strong>مراجعة منهجية</strong><span>مسار نشر ومراجعة قبل الظهور العام</span></div></div>
          <div className="rawafid-trust-item"><PlatformIcon name="secure" /><div><strong>خصوصية بالتصميم</strong><span>إظهار البيانات وفق الصلاحيات والموافقة</span></div></div>
          <div className="rawafid-trust-item"><PlatformIcon name="search" /><div><strong>SEO وبحث مترابط</strong><span>هيكل قابل للفهرسة والبحث الدلالي</span></div></div>
          <div className="rawafid-trust-item"><PlatformIcon name="tools" /><div><strong>Mobile + PWA</strong><span>واجهة متجاوبة وقابلة للتثبيت</span></div></div>
        </section>

        <section className="rawafid-section" aria-labelledby="platform-modules-title">
          <div className="rawafid-section-head">
            <div className="rawafid-section-title"><span>مكونات المنصة</span><h2 id="platform-modules-title">كل خدمة ضمن نظام واحد متناسق</h2><p>المكونات التالية جزء من الثيم والبنية نفسها، وليست صفحات منفصلة غير مترابطة.</p></div>
          </div>
          <div className="rawafid-platform-grid">
            {platformModules.map((module) => {
              const style = { '--card-accent': module.accent } as CSSProperties;
              return <a className="rawafid-platform-card" style={style} href={module.href} key={module.title}>
                <span className="icon-shell"><PlatformIcon name={module.icon} /></span>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
                <span>فتح المسار ←</span>
              </a>;
            })}
          </div>
        </section>

        <section className="rawafid-section" id="sectors" aria-labelledby="sectors-title">
          <div className="rawafid-section-head">
            <div className="rawafid-section-title"><span>القطاعات</span><h2 id="sectors-title">هيكل ديناميكي ينمو دون تعديل الثيم</h2><p>أي قطاع يتم إنشاؤه وتفعيله من لوحة الإدارة يظهر تلقائيًا هنا وفي القائمة الرئيسية والبحث.</p></div>
          </div>

          {sectors.length > 0 ? (
            <div className="rawafid-sector-grid">
              {sectors.map((sector) => {
                const style = { '--sector-accent': sector.accent || '#08716d' } as CSSProperties;
                return <a className="rawafid-sector-card" style={style} href={`/sectors/${sector.slug}`} key={sector.slug}>
                  <div className="sector-dot" aria-hidden="true" />
                  <h3>{sector.name_ar}</h3>
                  <p>{sector.description || 'قطاع ضمن الهيكل المؤسسي لمنصة روافد.'}</p>
                  <span>استكشف القطاع ←</span>
                </a>;
              })}
            </div>
          ) : (
            <div className="rawafid-empty">
              <div className="rawafid-empty-icon"><PlatformIcon name="knowledge" size={30} /></div>
              <h3>الثيم جاهز لاستقبال القطاعات</h3>
              <p>قاعدة البيانات فارغة حاليًا كما هو مخطط. عند إنشاء أول قطاع من لوحة الإدارة سيظهر هنا تلقائيًا بنفس نظام التصميم.</p>
              <small>لا توجد بيانات تجريبية أو قطاعات وهمية في الثيم.</small>
            </div>
          )}
        </section>

        <section className="rawafid-section">
          <div className="rawafid-directory-band">
            <div>
              <span className="rawafid-kicker">الدليل المهني</span>
              <h2>المختص والمركز جزء من تجربة المنصة، لا دليل منفصل عنها</h2>
              <p>التوثيق والملف المهني والخصوصية والموقع الجغرافي والمحادثات والمواعيد مرتبطة بالحساب والصلاحيات وقاعدة البيانات نفسها.</p>
              <div className="rawafid-directory-actions"><a className="primary-link" href="/specialists">دليل المختصين</a><a className="button" href="/centers">دليل المراكز</a></div>
            </div>
            <div className="rawafid-directory-panel" aria-label="خصائص الدليل">
              <div><PlatformIcon name="review" /><strong>توثيق واعتماد</strong></div>
              <div><PlatformIcon name="secure" /><strong>خصوصية البيانات</strong></div>
              <div><PlatformIcon name="specialist" /><strong>تواصل ومواعيد</strong></div>
              <div><PlatformIcon name="center" /><strong>موقع وفروع</strong></div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
