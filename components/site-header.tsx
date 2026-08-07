import { createClient } from '@/lib/supabase/server';
import { getPublicSectors } from '@/lib/public-taxonomy';

const primaryLinks = [
  { href: '/specialists', label: 'المختصون' },
  { href: '/centers', label: 'المراكز' },
  { href: '/community', label: 'المتدربون والمتطوعون' },
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
    { href: '/#sectors', label: 'الأقسام', icon: 'sections' },
    { href: '/specialists', label: 'مختصون', icon: 'specialists' },
    { href: '/about', label: 'المزيد', icon: 'more' },
  ];

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand" href="/" aria-label="منصة روافد - الرئيسية">
            <span className="brand-mark" aria-hidden="true">ر</span>
            <span className="brand-copy"><strong>روافد</strong><small>Rawafid Platform</small></span>
          </a>

          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            <a href="/">الرئيسية</a>
            <details className="nav-dropdown">
              <summary>القطاعات</summary>
              <div className="nav-dropdown-panel">
                <div className="nav-dropdown-heading"><strong>قطاعات روافد</strong><span>تنظيم معرفي وخدمي ديناميكي</span></div>
                <div className="nav-dropdown-grid">
                  {sectors.map((sector) => <a key={sector.slug} href={`/sectors/${sector.slug}`}>{sector.name_ar}</a>)}
                  {sectors.length === 0 && <span className="nav-empty">تظهر القطاعات بعد تفعيلها من الإدارة.</span>}
                </div>
              </div>
            </details>
            {primaryLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
            {signedIn && <a href="/messages">الرسائل</a>}
          </nav>

          <form className="header-search" action="/search" method="get" role="search">
            <label className="sr-only" htmlFor="header-search-input">البحث في منصة روافد</label>
            <input id="header-search-input" name="q" type="search" placeholder="ابحث في روافد" maxLength={120} />
            <button type="submit">بحث</button>
          </form>

          <div className="header-actions">{signedIn ? <a className="button header-login" href="/account">حسابي</a> : <a className="button header-login" href="/login">تسجيل الدخول</a>}</div>

          <details className="mobile-menu">
            <summary aria-label="فتح القائمة">القائمة</summary>
            <div className="mobile-menu-panel">
              <form className="mobile-search" action="/search" method="get"><input name="q" type="search" placeholder="ابحث في روافد" maxLength={120} /><button type="submit">بحث</button></form>
              <a href="/">الرئيسية</a>
              <span className="mobile-menu-label">القطاعات</span>
              {sectors.map((sector) => <a key={sector.slug} href={`/sectors/${sector.slug}`}>{sector.name_ar}</a>)}
              {primaryLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
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
