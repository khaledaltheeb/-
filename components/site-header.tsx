import PlatformIcon from '@/components/platform-icon';
import RawafidBrand from '@/components/rawafid-brand';
import SiteNavIcon from '@/components/site-nav-icon';
import { getPublicSectors } from '@/lib/public-taxonomy';

const primaryLinks = [
  { href: '/sectors', label: 'القطاعات', secondary: false },
  { href: '/sections', label: 'الأقسام', secondary: false },
  { href: '/sectors/pediatric-oncology', label: 'سرطان الأطفال', secondary: false },
  { href: '/care-guides/', label: 'أدلة التعامل والرعاية', secondary: true },
  { href: '/evidence-guides/', label: 'الأدلة العلمية', secondary: true },
  { href: '/about', label: 'من نحن', secondary: true },
];

const intentLinks = [
  { href: '/search?q=أعراض+نفسية', label: 'أفهم عرضًا أو حالة', detail: 'ابدأ من سؤالك واحصل على مسار معرفي واضح' },
  { href: '/sectors/mental-health', label: 'الصحة النفسية', detail: 'فهم الأعراض والاضطرابات والتقييم والدعم والعلاج المبني على الدليل' },
  { href: '/care-guides/', label: 'أحتاج دليل رعاية عمليًا', detail: 'أدلة للأسرة والتعامل اليومي والمواقف المتكررة' },
  { href: '/sectors/pediatric-oncology', label: 'سرطان الأطفال', detail: 'التشخيص والعلاج والأبحاث والدعم والنجاة' },
  { href: '/sectors/special-needs-inclusion', label: 'ذوو الاحتياجات الخاصة والدمج', detail: 'تعليم وتأهيل وتمكين عبر مراحل الحياة' },
  { href: '/sectors/addiction-recovery', label: 'الإدمان والتعافي', detail: 'الوقاية والعلاج والتعافي ودعم الأسرة وتقليل الانتكاس' },
];

const serviceLinks = [
  { href: '/daily-tools/', label: 'الأدوات اليومية', icon: 'tools' as const },
  { href: '/specialists', label: 'العثور على مختص', icon: 'specialist' as const },
  { href: '/centers', label: 'العثور على مركز', icon: 'center' as const },
  { href: '/cognitive-lab', label: 'المختبر المعرفي', icon: 'tools' as const },
  { href: '/community', label: 'مجتمع المتدربين والمتطوعين', icon: 'community' as const },
  { href: '/search', label: 'البحث المتقدم', icon: 'search' as const },
];

const guestMobileItems = [
  { href: '/', label: 'الرئيسية', icon: 'home' as const },
  { href: '/search', label: 'بحث', icon: 'search' as const },
  { href: '/care-guides/', label: 'الأدلة', icon: 'discover' as const },
  { href: '/specialists', label: 'مختصون', icon: 'specialists' as const },
  { href: '/about', label: 'من نحن', icon: 'more' as const },
];

const memberMobileItems = [
  { href: '/', label: 'الرئيسية', icon: 'home' as const },
  { href: '/search', label: 'بحث', icon: 'search' as const },
  { href: '/care-guides/', label: 'الأدلة', icon: 'discover' as const },
  { href: '/messages', label: 'الرسائل', icon: 'messages' as const },
  { href: '/account', label: 'حسابي', icon: 'account' as const },
];

const authEnhancementScript = `
(function(){
  var signedIn=document.cookie.split(';').some(function(part){
    var name=(part.trim().split('=')[0]||'');
    return name.indexOf('sb-')===0&&name.indexOf('-auth-token')!==-1;
  });
  if(!signedIn)return;
  document.querySelectorAll('[data-auth-guest]').forEach(function(el){el.hidden=true;});
  document.querySelectorAll('[data-auth-member]').forEach(function(el){el.hidden=false;});
})();
`;

export default async function SiteHeader() {
  // The global header is rendered on every public page. Keep the mega-nav focused
  // on the highest-priority sectors; the complete directory remains at /sectors.
  const sectors = await getPublicSectors(8);

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <RawafidBrand />
          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            <a href="/">الرئيسية</a>
            {primaryLinks.map((link) => (
              <a key={link.href} href={link.href} data-nav-priority={link.secondary ? 'secondary' : 'primary'}>{link.label}</a>
            ))}
            <details className="nav-dropdown mega-nav">
              <summary><span>استكشف المزيد</span></summary>
              <div className="nav-dropdown-panel mega-nav-panel">
                <div className="nav-dropdown-heading">
                  <div><strong>الوصول إلى روافد حسب احتياجك</strong><span>قطاعات معرفية، مسارات رعاية، وأدلة خدمات ضمن تجربة واحدة</span></div>
                  <a href="/search">فتح البحث المتقدم ←</a>
                </div>
                <div className="mega-nav-layout">
                  <section className="mega-nav-column mega-nav-sectors">
                    <h2>القطاعات</h2>
                    <div className="mega-sector-grid">
                      {sectors.map((sector) => <a key={sector.slug} href={'/sectors/' + sector.slug}><i style={{ background: sector.accent || '#08716d' }} aria-hidden="true" /><span>{sector.name_ar}</span></a>)}
                      {sectors.length === 0 && <div className="mega-empty"><strong>لا توجد قطاعات عامة متاحة حاليًا</strong><span>ستظهر القطاعات هنا بعد اعتمادها.</span></div>}
                    </div>
                    <a href="/sectors">عرض جميع القطاعات ←</a>
                  </section>
                  <section className="mega-nav-column">
                    <h2>ابدأ من احتياجك</h2>
                    <div className="mega-intent-list">{intentLinks.map((link) => <a href={link.href} key={link.href}><strong>{link.label}</strong><span>{link.detail}</span></a>)}</div>
                  </section>
                  <section className="mega-nav-column mega-services">
                    <h2>الدليل والخدمات</h2>
                    <div>{serviceLinks.map((link) => <a href={link.href} key={link.href}><PlatformIcon name={link.icon} size={19} /><span>{link.label}</span></a>)}</div>
                    <div className="mega-member-links" data-auth-member hidden><a href="/messages">الرسائل</a><a href="/appointments">المواعيد</a><a href="/notifications">الإشعارات</a></div>
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
          <div className="header-actions">
            <a className="button header-login" href="/login" data-auth-guest>دخول</a>
            <a className="button header-login" href="/account" data-auth-member hidden>حسابي</a>
          </div>
          <details className="mobile-menu">
            <summary aria-label="فتح قائمة التنقل"><SiteNavIcon name="more" /><span>القائمة</span></summary>
            <div className="mobile-menu-panel">
              <form className="mobile-search" action="/search" method="get" role="search"><label className="sr-only" htmlFor="mobile-search-input">البحث في منصة روافد</label><input id="mobile-search-input" name="q" type="search" placeholder="حالة، دليل أو خدمة" maxLength={120} enterKeyHint="search" /><button type="submit">بحث</button></form>
              <a href="/">الرئيسية</a><a href="/about">من نحن</a><a href="/sectors">جميع القطاعات</a><a href="/sections">جميع الأقسام</a><a href="/sectors/pediatric-oncology">سرطان الأطفال</a><a href="/care-guides/">أدلة التعامل والرعاية</a><a href="/evidence-guides/">الأدلة العلمية</a><a href="/encyclopedia/">الموسوعة المختصرة — الصفحات المحفوظة</a>
              <span className="mobile-menu-label">الدليل والخدمات</span>
              {serviceLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
              <a href="/login" data-auth-guest>تسجيل الدخول</a>
              <span data-auth-member hidden><a href="/messages">الرسائل</a><a href="/appointments">المواعيد</a><a href="/notifications">الإشعارات</a><a href="/account">حسابي</a></span>
            </div>
          </details>
        </div>
      </header>
      <nav className="mobile-bottom-nav" aria-label="التنقل السريع للهاتف" data-auth-guest>
        {guestMobileItems.map((item) => <a href={item.href} key={item.href + item.label}><SiteNavIcon name={item.icon} /><span>{item.label}</span></a>)}
      </nav>
      <nav className="mobile-bottom-nav" aria-label="التنقل السريع للهاتف للحساب" data-auth-member hidden>
        {memberMobileItems.map((item) => <a href={item.href} key={item.href + item.label}><SiteNavIcon name={item.icon} /><span>{item.label}</span></a>)}
      </nav>
      <script dangerouslySetInnerHTML={{ __html: authEnhancementScript }} />
    </>
  );
}
