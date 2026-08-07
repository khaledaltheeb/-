import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const primaryLinks = [
  { href: '/specialists', label: 'المختصون' },
  { href: '/centers', label: 'المراكز' },
  { href: '/community', label: 'المتدربون والمتطوعون' },
];

export default async function SiteHeader() {
  const supabase = await createClient();
  const { data: sectors } = await supabase
    .from('sectors')
    .select('slug,name_ar')
    .eq('is_active', true)
    .eq('visibility', 'public')
    .order('sort_order')
    .order('name_ar')
    .limit(10);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="منصة روافد - الرئيسية">
          <span className="brand-mark" aria-hidden="true">ر</span>
          <span className="brand-copy"><strong>روافد</strong><small>Rawafid Platform</small></span>
        </Link>

        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          <Link href="/">الرئيسية</Link>
          <details className="nav-dropdown">
            <summary>القطاعات</summary>
            <div className="nav-dropdown-panel">
              <div className="nav-dropdown-heading"><strong>قطاعات روافد</strong><span>تنظيم معرفي وخدمي ديناميكي</span></div>
              <div className="nav-dropdown-grid">
                {(sectors ?? []).map((sector) => <Link key={sector.slug} href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link>)}
                {(!sectors || sectors.length === 0) && <span className="nav-empty">تظهر القطاعات بعد تفعيلها من الإدارة.</span>}
              </div>
            </div>
          </details>
          {primaryLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>

        <form className="header-search" action="/search" method="get" role="search">
          <label className="sr-only" htmlFor="header-search-input">البحث في منصة روافد</label>
          <input id="header-search-input" name="q" type="search" placeholder="ابحث في روافد" maxLength={120} />
          <button type="submit">بحث</button>
        </form>

        <div className="header-actions"><Link className="button header-login" href="/login">تسجيل الدخول</Link></div>

        <details className="mobile-menu">
          <summary aria-label="فتح القائمة">القائمة</summary>
          <div className="mobile-menu-panel">
            <form className="mobile-search" action="/search" method="get"><input name="q" type="search" placeholder="ابحث في روافد" maxLength={120} /><button type="submit">بحث</button></form>
            <Link href="/">الرئيسية</Link>
            <span className="mobile-menu-label">القطاعات</span>
            {(sectors ?? []).map((sector) => <Link key={sector.slug} href={`/sectors/${sector.slug}`}>{sector.name_ar}</Link>)}
            {primaryLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
            <Link href="/login">تسجيل الدخول</Link>
          </div>
        </details>
      </div>
    </header>
  );
}
