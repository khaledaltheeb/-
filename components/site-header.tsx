import PlatformIcon from '@/components/platform-icon';
import RawafidBrand from '@/components/rawafid-brand';
import { getPublicSectors } from '@/lib/public-taxonomy';
import { createClient } from '@/lib/supabase/server';

const primaryLinks = [
  { href: '/sectors', label: 'القطاعات', secondary: false },
  { href: '/sections', label: 'الأقسام', secondary: false },
  { href: '/sectors/pediatric-oncology', label: 'سرطان الأطفال', secondary: false },
  { href: '/care-guides/', label: 'أدلة الرعاية', secondary: true },
  { href: '/evidence-guides/', label: 'الأدلة العلمية', secondary: true },
  { href: '/about', label: 'من نحن', secondary: true },
];

const intentLinks = [
  { href: '/search?q=أعراض+نفسية', label: 'أفهم عرضًا أو حالة', detail: 'ابدأ من سؤالك واحصل على مسار معرفي واضح' },
  { href: '/care-guides/', label: 'أحتاج دليل رعاية عمليًا', detail: 'أدلة للأسرة والتعامل اليومي والمواقف المتكررة' },
  { href: '/sectors/pediatric-oncology', label: 'سرطان الأطفال', detail: 'التشخيص والعلاج والأبحاث والدعم والنجاة' },
  { href: '/search?q=ذوو+الاحتياجات+الخاصة+الدمج', label: 'ذوو الاحتياجات الخاصة والدمج', detail: 'تعليم وتأهيل وتمكين عبر مراحل الحياة' },
];

const serviceLinks = [
  { href: '/specialists', label: 'العثور على مختص', icon: 'specialist' as const },
  { href: '/centers', label: 'العثور على مركز', icon: 'center' as const },
  { href: '/cognitive-lab', label: 'المختبر المعرفي', icon: 'tools' as const },
  { href: '/community', label: 'مجتمع المتدربين والمتطوعين', icon: 'community' as const },
  { href: '/search', label: 'البحث المتقدم', icon: 'search' as const },
];

type IconName = 'home' | 'search' | 'discover' | 'messages' | 'account' | 'specialists' | 'more';

function NavIcon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'home') return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></svg>;
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
  if (name === 'discover') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" /></svg>;
  if (name === 'messages') return <svg {...common}><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 9h8M8 12h5" /></svg>;
  if (name === 'account') return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>;
  if (name === 'specialists') return <svg {...common}><circle cx="12" cy="7.5" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /><path d="M18.5 7.5h3M20 6v3" /></svg>;
  return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
}

export default async function SiteHeader() {
  const supabase = await createClient();
  const [sectors, { data: claims }] = await Promise.all([getPublicSectors(50), supabase.auth.getClaims()]);
  const signedIn = Boolean(claims?.claims?.sub);
  const mobileItems: Array<{ href: string; label: string; icon: IconName }> = signedIn ? [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/search', label: 'بحث', icon: 'search' },
    { href: '/care-guides/', label: 'الأدلة', icon: 'discover' },
    { href: '/messages', label: 'الرسائل', icon: 'messages' },
    { href: '/account', label: 'حسابي', icon: 'account' },
  ] : [
    { href: '/', label: 'الرئيسية', icon: 'home' },
    { href: '/search', label: 'بحث', icon: 'search' },
    { href: '/care-guides/', label: 'الأدلة', icon: 'discover' },
    { href: '/specialists', label: 'مختصون', icon: 'specialists' },
    { href: '/about', label: 'من نحن', icon: 'more' },
  ];

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <RawafidBrand />
          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            <a href="/">الرئيسية</a>
            {primaryLinks.map((link) => (
              <a key={link.href} href={link.href} data-nav-priority={link.secondary ? 'secondary' : 'primary'}>
                {link.label}
              </a>
            ))}
            <details className="nav-dropdown mega-nav">
              <summary><span>استكشف المزيد</span></summary>
              <div className="nav-dropdown-panel mega-nav-panel">
                <div className="nav-dropdown-heading">
                  <div>
                    <strong>الوصول إلى روافد حسب احتياجك</strong>
                    <span>قطاعات معرفية، مسارات رعاية، وأدلة خدمات ضمن تجربة واحدة</span>
                  </div>
                  <a href="/search">فتح البحث المتقدم ←</a>
                </div>
                <div className="mega-nav-layout">
                  <section className="mega-nav-column mega-nav-sectors">
                    <h2>القطاعات</h2>
                    <div className="mega-sector-grid">
                      {sectors.map((sector) => (
                        <a key={sector.slug} href={'/sectors/' + sector.slug}>
                          <i style={{ background: sector.accent || '#08716d' }} aria-hidden="true" />
                          <span>{sector.name_ar}</span>
                        </a>
                      ))}
                      {sectors.length === 0 && (
                        <div className="mega-empty"><strong>لا توجد قطاعات عامة متاحة حاليًا</strong><span>ستظهر القطاعات هنا بعد اعتمادها.</span></div>
                      )}
                    </div>
                  </section>
                  <section className="mega-nav-column">
                    <h2>ابدأ من احتياجك</h2>
                    <div className="mega-intent-list">
                      {intentLinks.map((link) => <a href={link.href} key={link.href}><strong>{link.label}</strong><span>{link.detail}</span></a>)}
                    </div>
                  </section>
                  <section className="mega-nav-column mega-services">
                    <h2>الدليل والخدمات</h2>
                    <div>{serviceLinks.map((link) => <a href={link.href} key={link.href}><PlatformIcon name={link.icon} size={19} /><span>{link.label}</span></a>)}</div>
                    {signedIn && <div className="mega-member-links"><a href="/messages">الرسائل</a><a href="/appointments">المواعيد</a><a href="/notifications">الإشعارات</a></div>}
                  </section>
                </div>
              </div>
            </details>
          </nav>
          <form className="header-search" action="/search" method="get" role="search">
            <label className="sr-only" htmlFor="header-search-input">البحث في منصة روافد</label>
            <input id="header-search-input" name="q" type="search" placeholder="حالة، دليل أو خدمة" maxLength={120} enterKeyHint="search" />
            <button type="submit">بحث</button>
          </form>
          <div className="header-actions">{signedIn ? <a className="button header-login" href="/account">حسابي</a> : <a className="button header-login" href="/login">دخول</a>}</div>
          <details className="mobile-menu">
            <summary aria-label="فتح قائمة التنقل"><NavIcon name="more" /><span>القائمة</span></summary>
            <div className="mobile-menu-panel">
              <form className="mobile-search" action="/search" method="get" role="search"><label className="sr-only" htmlFor="mobile-search-input">البحث في منصة روافد</label><input id="mobile-search-input" name="q" type="search" placeholder="حالة، دليل أو خدمة" maxLength={120} enterKeyHint="search" /><button type="submit">بحث</button></form>
              <a href="/">الرئيسية</a>
              <a href="/about">من نحن</a>
              <a href="/sectors">جميع القطاعات</a>
              <a href="/sections">جميع الأقسام</a>
              <a href="/sectors/pediatric-oncology">سرطان الأطفال</a>
              <a href="/care-guides/">أدلة التعامل والرعاية</a>
              <a href="/evidence-guides/">الأدلة العلمية</a>
              <a href="/encyclopedia/">الموسوعة</a>
              <span className="mobile-menu-label">القطاعات</span>
              {sectors.map((sector) => <a key={sector.slug} href={'/sectors/' + sector.slug}>{sector.name_ar}</a>)}
              <span className="mobile-menu-label">الدليل والخدمات</span>
              {serviceLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
              {signedIn ? <><a href="/messages">الرسائل</a><a href="/appointments">المواعيد</a><a href="/notifications">الإشعارات</a><a href="/account">حسابي</a></> : <a href="/login">تسجيل الدخول</a>}
            </div>
          </details>
        </div>
      </header>
      <nav className="mobile-bottom-nav" aria-label="التنقل السريع للهاتف">
        {mobileItems.map((item) => <a href={item.href} key={item.href + item.label}><NavIcon name={item.icon} /><span>{item.label}</span></a>)}
      </nav>
    </>
  );
}
