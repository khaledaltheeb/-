import type { CSSProperties } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import { getPublicSectors } from '@/lib/public-taxonomy';
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

const intentRoutes = [
  { href: '/search?q=أعراض+نفسية', icon: 'search' as const, title: 'أفهم حالة أو عرضًا', text: 'ابدأ من السؤال أو العرض للوصول إلى المعرفة والمسارات المرتبطة.' },
  { href: '/search?q=دعم+الأسرة', icon: 'community' as const, title: 'أساعد شخصًا قريبًا', text: 'محتوى ومسارات عملية للأسرة ومقدمي الدعم والرعاية.' },
  { href: '/search?q=الإدمان+والتعافي', icon: 'review' as const, title: 'أبحث عن مسار تعافٍ', text: 'معرفة وخيارات دعم وعلاج ومراكز مرتبطة بالتعافي.' },
  { href: '/specialists', icon: 'specialist' as const, title: 'أجد مختصًا', text: 'ابحث في دليل الملفات المهنية الموثقة ونمط الخدمة والموقع.' },
  { href: '/centers', icon: 'center' as const, title: 'أجد مركزًا', text: 'استكشف المراكز والخدمات والفروع وطرق التواصل المتاحة.' },
  { href: '/search?q=أداة+تقييم', icon: 'tools' as const, title: 'أستخدم أداة أو دليلًا', text: 'الوصول إلى الأدوات والمسارات والأدلة العملية دون ادعاء التشخيص.' },
];

const platformModules = [
  { href: '/search', icon: 'knowledge' as const, title: 'المعرفة والموسوعة', text: 'محرك معرفة منظم للمقالات والأدلة والحالات والأبحاث.', accent: '#3d78bd' },
  { href: '/search?q=%D8%B0%D9%88%D9%88+%D8%A7%D9%84%D8%A7%D8%AD%D8%AA%D9%8A%D8%A7%D8%AC%D8%A7%D8%AA+%D8%A7%D9%84%D8%AE%D8%A7%D8%B5%D8%A9+%D8%A7%D9%84%D8%AF%D9%85%D8%AC', icon: 'community' as const, title: 'ذوو الاحتياجات الخاصة والدمج', text: 'أقسام تعليمية وتأهيلية وأسرية ومهنية ومسارات للدمج والتمكين.', accent: '#7564c9' },
  { href: '/specialists', icon: 'specialist' as const, title: 'دليل المختصين', text: 'ملفات مهنية موثقة مع تخصصات ومؤهلات وخيارات تواصل.', accent: '#0b8f92' },
  { href: '/centers', icon: 'center' as const, title: 'دليل المراكز', text: 'مراكز وفروع وخدمات ومواقع ضمن دورة تحقق إدارية.', accent: '#f4b942' },
  { href: '/search', icon: 'tools' as const, title: 'الأدوات والمسارات', text: 'أدوات واختبارات إرشادية ومسارات تعلم واستخدام عملي آمن.', accent: '#d8604c' },
  { href: '/community', icon: 'community' as const, title: 'المتدربون والمتطوعون', text: 'مساحة مستقلة للانتساب والتدريب والعمل التطوعي المنظم.', accent: '#4f9d69' },
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
            <h1 id="home-title">كيف يمكن لـ<em>منصة روافد</em> مساعدتك اليوم؟</h1>
            <p>الوصول إلى المعرفة الموثوقة، الأدلة العملية، المختصين والمراكز يبدأ من احتياجك لا من تعقيد بنية الموقع. ابحث مباشرة أو اختر المسار الأقرب لما تريد إنجازه.</p>

            <form className="search rawafid-search" action="/search" method="get" role="search">
              <label className="sr-only" htmlFor="home-search">البحث في منصة روافد</label>
              <input id="home-search" name="q" type="search" minLength={2} maxLength={160} autoComplete="off" placeholder="ابحث عن حالة، مصطلح، مختص، مركز، أداة، مقال أو سؤال..." />
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
              <h2>معرفة، دليل مهني وخدمات ضمن رحلة استخدام واحدة.</h2>
              <p>القطاعات والمحتوى والدلائل والحسابات تعمل على بنية ديناميكية واحدة، بينما تبقى الهوية وتجربة الاستخدام متناسقتين مهما توسعت منصة روافد.</p>
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

        <section className="rawafid-section rawafid-intent-section" aria-labelledby="intent-title">
          <div className="rawafid-section-head">
            <div className="rawafid-section-title"><span>ابدأ حسب احتياجك</span><h2 id="intent-title">اختر ما تريد فعله الآن</h2><p>مسارات قصيرة تقود إلى المعرفة أو الخدمة المناسبة بدل إغراق المستخدم في قوائم طويلة.</p></div>
          </div>
          <div className="rawafid-platform-grid rawafid-intent-grid">
            {intentRoutes.map((intent) => <a href={intent.href} className="rawafid-platform-card rawafid-intent-card" key={intent.title}><span className="icon-shell"><PlatformIcon name={intent.icon} /></span><div><h3>{intent.title}</h3><p>{intent.text}</p></div><span className="intent-arrow" aria-hidden="true">فتح المسار ←</span></a>)}
          </div>
        </section>

        <section className="rawafid-section" aria-labelledby="platform-modules-title">
          <div className="rawafid-section-head">
            <div className="rawafid-section-title"><span>مكونات المنصة</span><h2 id="platform-modules-title">Core واحد، ووحدات مترابطة</h2><p>كل وحدة تستخدم نفس الهوية ونظام التصميم والبنية الديناميكية، دون تحويل الموقع العام إلى لوحة إدارة.</p></div>
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
            <div className="rawafid-section-title"><span>القطاعات</span><h2 id="sectors-title">هيكل ديناميكي ينمو دون تعديل الثيم</h2><p>أي قطاع يتم إنشاؤه وتفعيله من لوحة الإدارة يظهر تلقائيًا هنا وفي القائمة الرئيسية والبحث، ويمكن أن يحتوي عددًا كبيرًا من الأقسام والأقسام الفرعية.</p></div>
          </div>

          {sectors.length > 0 ? (
            <div className="rawafid-sector-grid">
              {sectors.map((sector) => {
                const style = { '--sector-accent': sector.accent || '#0b8f92' } as CSSProperties;
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
              <p>عند إنشاء أول قطاع وتفعيله من لوحة الإدارة سيظهر هنا تلقائيًا بنفس نظام التصميم، دون إنشاء صفحة برمجية جديدة.</p>
              <small>لا توجد بيانات تجريبية أو قطاعات وهمية في الثيم.</small>
            </div>
          )}
        </section>

        <section className="rawafid-section">
          <div className="rawafid-directory-band">
            <div>
              <span className="rawafid-kicker">الدليل المهني</span>
              <h2>المختص والمركز جزء من تجربة منصة روافد، لا دليل منفصل عنها</h2>
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
