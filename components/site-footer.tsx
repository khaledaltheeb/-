import Link from 'next/link';
import RawafidBrand from '@/components/rawafid-brand';

const groups = [
  {
    id: 'knowledge',
    title: 'المعرفة والمحتوى',
    links: [
      { href: '/sectors', label: 'القطاعات' },
      { href: '/sections', label: 'جميع الأقسام' },
      { href: '/encyclopedia/', label: 'الموسوعة' },
      { href: '/care-guides', label: 'أدلة الرعاية' },
      { href: '/quick-info', label: 'معلومات سريعة' },
    ],
  },
  {
    id: 'pathways',
    title: 'أدلة ومسارات',
    links: [
      { href: '/evidence-guides/', label: 'الأدلة العلمية' },
      { href: '/family-guide', label: 'دليل الأسرة' },
      { href: '/addiction', label: 'الإدمان والتعافي' },
      { href: '/cognitive-lab', label: 'المختبر المعرفي' },
    ],
  },
  {
    id: 'services',
    title: 'الخدمات والمشاركة',
    links: [
      { href: '/specialists', label: 'دليل المختصين' },
      { href: '/centers', label: 'دليل المراكز' },
      { href: '/join', label: 'الانضمام إلى روافد' },
      { href: '/community', label: 'المتدربون والمتطوعون' },
    ],
  },
  {
    id: 'about',
    title: 'عن روافد والثقة',
    links: [
      { href: '/about', label: 'عن روافد' },
      { href: '/medical-review-policy', label: 'المراجعة العلمية' },
      { href: '/editorial-policy', label: 'السياسة التحريرية' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand-block">
          <RawafidBrand className="footer-brand" />
          <p>منصة عربية مؤسسية تربط المعرفة الموثوقة بالأدلة العملية والخدمات المهنية في الصحة النفسية والتعافي والدمج والتمكين.</p>
          <form className="footer-search" action="/search" method="get" role="search">
            <label className="sr-only" htmlFor="footer-search-input">البحث في منصة روافد</label>
            <input id="footer-search-input" name="q" type="search" placeholder="ابحث عن معلومة أو خدمة" maxLength={120} enterKeyHint="search" />
            <button type="submit">بحث</button>
          </form>
        </div>
        <nav className="footer-groups" aria-label="خريطة روابط منصة روافد">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={'footer-' + group.id}>
              <h2 id={'footer-' + group.id}>{group.title}</h2>
              <div>{group.links.map((link) => <Link prefetch={false} key={link.href} href={link.href}>{link.label}</Link>)}</div>
            </section>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-meta">
          <span>© {new Date().getFullYear()} منصة روافد. جميع الحقوق محفوظة.</span>
          <nav className="footer-legal-links" aria-label="الخصوصية والشروط">
            <Link prefetch={false} href="/privacy">الخصوصية</Link>
            <Link prefetch={false} href="/terms">شروط الاستخدام</Link>
            <Link prefetch={false} href="/disclaimer">إخلاء المسؤولية</Link>
          </nav>
        </div>
        <a className="back-to-top" href="#top">العودة إلى الأعلى ↑</a>
      </div>
    </footer>
  );
}
