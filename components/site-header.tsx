import PlatformIcon from '@/components/platform-icon';
import RawafidBrand from '@/components/rawafid-brand';
import SiteNavIcon from '@/components/site-nav-icon';
import {
  HeaderAccountAction,
  HeaderMegaMemberLinks,
  HeaderMemberMenuLinks,
  HeaderMobileBottomNav,
} from '@/components/site-header-member-state';
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

export default async function SiteHeader() {
  const sectors = await getPublicSectors(50);

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
                    <HeaderMegaMemberLinks />
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
          <div className="header-actions"><HeaderAccountAction /></div>
          <details className="mobile-menu">
            <summary aria-label="فتح قائمة التنقل"><SiteNavIcon name="more" /><span>القائمة</span></summary>
            <div className="mobile-menu-panel">
              <form className="mobile-search" action="/search" method="get" role="search"><label className="sr-only" htmlFor="mobile-search-input">البحث في منصة روافد</label><input id="mobile-search-input" name="q" type="search" placeholder="حالة، دليل أو خدمة" maxLength={120} enterKeyHint="search" /><button type="submit">بحث</button></form>
              <a href="/">الرئيسية</a>
              <a href="/about">من نحن</a>
              <a href="/sectors">جميع القطاعات</a>
              <a href="/sections">جميع الأقسام</a>
              <a href="/sectors/pediatric-oncology">سرطان الأطفال</a>
              <a href="/care-guides/">أدلة التعامل والرعاية</a>
              <a href="/evidence-guides/">الأدلة العلمية</a>
              <a href="/encyclopedia/">الموسوعة المختصرة — الصفحات المحفوظة</a>
              <span className="mobile-menu-label">القطاعات</span>
              {sectors.map((sector) => <a key={sector.slug} href={'/sectors/' + sector.slug}>{sector.name_ar}</a>)}
              <span className="mobile-menu-label">الدليل والخدمات</span>
              {serviceLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
              <HeaderMemberMenuLinks />
            </div>
          </details>
        </div>
      </header>
      <HeaderMobileBottomNav />
    </>
  );
}
