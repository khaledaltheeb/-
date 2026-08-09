import { createClient } from '@/lib/supabase/server';
import { getPublicSectors } from '@/lib/public-taxonomy';
import PlatformIcon from '@/components/platform-icon';
import RawafidMark from '@/components/rawafid-mark';

const primaryLinks = [
  { href: '/#sectors', label: 'القطاعات' },
  { href: '/specialists', label: 'المختصون والمراكز' },
  { href: '/search?q=أداة', label: 'الأدوات' },
  { href: '/sections', label: 'المعرفة' },
];

const intentLinks = [
  { href: '/search?q=أعراض+نفسية', label: 'أفهم عرضًا أو حالة', detail: 'ابدأ من السؤال أو العرض' },
  { href: '/search?q=دعم+الأسرة', label: 'أساعد شخصًا قريبًا', detail: 'مسارات للأسرة ومقدمي الدعم' },
  { href: '/search?q=الإدمان+والتعافي', label: 'أبحث عن مسار تعافٍ', detail: 'معرفة ودعم وخدمات مترابطة' },
  { href: '/search?q=ذوو+الاحتياجات+الخاصة+الدمج', label: 'ذوو الاحتياجات الخاصة والدمج', detail: 'أقسام واسعة للدعم والتعليم والتأهيل والتمكين والخدمات' },
];

const serviceLinks = [
  { href: '/specialists', label: 'العثور على مختص', icon: 'specialist' as const },
  { href: '/centers', label: 'العثور على مركز', icon: 'center' as const },
  { href: '/community', label: 'متدربون ومتطوعون', icon: 'community' as const },
  { href: '/search', label: 'البحث المتقدم', icon: 'search' as const },
];

type IconName = 'home' | 'search' | 'discover' | 'messages' | 'account' | 'sections' | 'specialists' | 'more';
function NavIcon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'home') return <svg {...common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>;
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
  if (name === 'discover') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"/></svg>;
  if (name === 'messages') return <svg {...common}><path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/></svg>;
  if (name === 'account') return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>;
  if (name === 'sections') return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>;
  if (name === 'specialists') return <svg {...common}><circle cx="12" cy="7.5" r="3.5"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/><path d="M18.5 7.5h3M20 6v3"/></svg>;
  return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></svg>;
}

export default async function SiteHeader() {
  const supabase = await createClient();
  const [sectors, { data: claims }] = await Promise.all([
    getPublicSectors(10),
    supabase.auth.getClaims(),
  ]);
  const signedIn = Boolean(claims?.claims?.sub);
  const mobileItems: Array<{ href: string; label: string; icon: IconName }> = signedIn ? [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/search', label: 'بحث', icon: 'search' },
    { href: '/#sectors', label: 'اكتشف', icon: 'discover' },
    { href: '/messages', label: 'الرسائل', icon: 'messages' },
    { href: '/account', label: 'حسابي', icon: 'account' },
  ] : [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/search', label: 'بحث', icon: 'search' },
    { href: '/sections', label: 'الأقسام', icon: 'sections' },
    { href: '/specialists', label: 'مختصون', icon: 'specialists' },
    { href: '/about', label: 'المزيد', icon: 'more' },
  ];

  return (
    <>
      <header className="site-header">
        <div className="site-assurance-bar">
          <div>
            <span>معرفة عربية موثوقة وخدمات مهنية أكثر وضوحًا</span>
            <nav aria-label="روابط مؤسسية مساندة">
              <a href="/about">عن روافد</a>
              <a href="/medical-review-policy">منهجية المراجعة</a>
              <a href="/join">للمختصين والجهات</a>
            </nav>
          </div>
        </div>
        <div className="site-header-inner">
          <a className="brand" href="/" aria-label="منصة روافد - الرئيسية">
            <span className="brand-mark" aria-hidden="true"><RawafidMark /></span>
            <span className="brand-copy"><strong>منصة روافد</strong><small>Rawafid Platform</small></span>
          </a>

          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            <details className="nav-dropdown mega-nav">
              <summary>اكتشف</summary>
              <div className="nav-dropdown-panel mega-nav-panel">
                <div className="nav-dropdown-heading"><div><strong>ابدأ من احتياجك، لا من هيكل الموقع</strong><span>معرفة وخدمات وأدلة مهنية مترابطة في مكان واحد</span></div><a href="/search">فتح البحث المتقدم ←</a></div>
                <div className="mega-nav-layout">
                  <section className="mega-nav-column mega-nav-sectors">
                    <h2>القطاعات</h2>
                    <div className="mega-sector-grid">
                      {sectors.map((sector) => <a key={sector.slug} href={`/sectors/${sector.slug}`}><i style={{ background: sector.accent || '#08716d' }} aria-hidden="true" /><span>{sector.name_ar}</span></a>)}
                      {sectors.length === 0 && <div className="mega-empty"><strong>الثيم جاهز للقطاعات</strong><span>تظهر هنا تلقائيًا بعد إضافتها من لوحة الإدارة.</span></div>}
                    </div>
                  </section>
                  <section className="mega-nav-column">
                    <h2>ابدأ من احتياجك</h2>
                    <div className="mega-intent-list">{intentLinks.map((link) => <a href={link.href} key={link.href}><strong>{link.label}</strong><span>{link.detail}</span></a>)}</div>
                  </section>
                  <section className="mega-nav-column mega-services">
                    <h2>الدليل والخدمات</h2>
                    <div>{serviceLinks.map((link) => <a href={link.href} key={link.href}><PlatformIcon name={link.icon} size={19}/><span>{link.label}</span></a>)}</div>
                    {signedIn && <div className="mega-member-links"><a href="/messages">الرسائل</a><a href="/appointments">المواعيد</a><a href="/notifications">الإشعارات</a></div>}
                  </section>
                </div>
              </div>
            </details>
            {primaryLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
          </nav>

          <form className="header-search" action="/search" method="get" role="search">
            <label className="sr-only" htmlFor="header-search-input">البحث في منصة روافد</label>
            <input id="header-search-input" name="q" type="search" placeholder="ما الذي تبحث عنه؟" maxLength={120} />
            <button type="submit" aria-label="تنفيذ البحث"><PlatformIcon name="search" size={18} /><span>بحث</span></button>
          </form>

          <div className="header-actions">{signedIn ? <a className="button header-login" href="/account">حسابي</a> : <a className="button header-login" href="/login">تسجيل الدخول</a>}</div>

          <details className="mobile-menu">
            <summary aria-label="فتح القائمة">القائمة</summary>
            <div className="mobile-menu-panel">
              <form className="mobile-search" action="/search" method="get"><input name="q" type="search" placeholder="ابحث في منصة روافد" maxLength={120} /><button type="submit">بحث</button></form>
              <a href="/">الرئيسية</a>
              <span className="mobile-menu-label">ابدأ من احتياجك</span>
              {intentLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
              <span className="mobile-menu-label">القطاعات</span>
              {sectors.map((sector) => <a key={sector.slug} href={`/sectors/${sector.slug}`}>{sector.name_ar}</a>)}
              {sectors.length === 0 && <span className="nav-empty">تظهر القطاعات بعد إضافتها من الإدارة.</span>}
              <span className="mobile-menu-label">الدليل والخدمات</span>
              {primaryLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
              <a href="/centers">المراكز</a>
              <a href="/community">المتدربون والمتطوعون</a>
              {signedIn ? <><a href="/messages">الرسائل</a><a href="/appointments">المواعيد</a><a href="/notifications">الإشعارات</a><a href="/account">حسابي</a></> : <a href="/login">تسجيل الدخول</a>}
            </div>
          </details>
        </div>
      </header>
      <nav className="mobile-bottom-nav" aria-label="التنقل السريع للهاتف">
        {mobileItems.map((item) => <a href={item.href} key={`${item.href}-${item.label}`}><NavIcon name={item.icon}/><span>{item.label}</span></a>)}
      </nav>
    </>
  );
}
