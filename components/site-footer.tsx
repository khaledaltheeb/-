import RawafidBrand from '@/components/rawafid-brand';

const groups = [
  {
    id: 'knowledge',
    title: 'المعرفة والرعاية',
    links: [
      { href: '/sectors', label: 'القطاعات' },
      { href: '/sections', label: 'جميع الأقسام' },
      { href: '/care-guides/', label: 'أدلة التعامل والرعاية' },
      { href: '/evidence-guides/', label: 'الأدلة العلمية' },
      { href: '/sectors/short-encyclopedia', label: 'قطاع الموسوعة المختصرة' },
      { href: '/encyclopedia/', label: 'الموسوعة المختصرة' },
    ],
  },
  {
    id: 'priority',
    title: 'مسارات مباشرة',
    links: [
      { href: '/sectors/pediatric-oncology', label: 'مركز سرطان الأطفال' },
      { href: '/search?q=دعم+الأسرة', label: 'دعم الأسرة' },
      { href: '/search?q=الصحة+النفسية', label: 'الصحة النفسية' },
      { href: '/search?q=الإدمان+والتعافي', label: 'الإدمان والتعافي' },
      { href: '/cognitive-lab', label: 'المختبر المعرفي' },
    ],
  },
  {
    id: 'services',
    title: 'الخدمات والمشاركة',
    links: [
      { href: '/specialists', label: 'دليل المختصين' },
      { href: '/centers', label: 'دليل المراكز' },
      { href: '/search', label: 'البحث المتقدم' },
      { href: '/community', label: 'المجتمع' },
      { href: '/join', label: 'الانضمام إلى روافد' },
    ],
  },
  {
    id: 'trust',
    title: 'الثقة والحقوق',
    links: [
      { href: '/about', label: 'من نحن' },
      { href: '/medical-review-policy', label: 'المراجعة العلمية' },
      { href: '/editorial-policy', label: 'السياسة التحريرية' },
      { href: '/privacy', label: 'الخصوصية' },
      { href: '/terms', label: 'شروط الاستخدام' },
      { href: '/disclaimer', label: 'إخلاء المسؤولية والتنبيهات' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer" style={{ display: 'block', padding: 0 }}>
      <div className="site-footer-inner">
        <div className="footer-brand-block">
          <RawafidBrand className="footer-brand" />
          <p>منصة عربية مؤسسية تربط المعرفة الموثوقة بالأدلة العملية والرعاية الأسرية والخدمات المهنية، مع مسارات واضحة للصحة النفسية وسرطان الأطفال والتعافي والدمج والتمكين.</p>
          <form className="footer-search" action="/search" method="get" role="search">
            <label className="sr-only" htmlFor="footer-search-input">البحث في منصة روافد</label>
            <input id="footer-search-input" name="q" type="search" placeholder="ابحث عن معلومة أو دليل أو خدمة" maxLength={120} enterKeyHint="search" />
            <button type="submit">بحث</button>
          </form>
        </div>
        <nav className="footer-groups" aria-label="روابط تذييل المنصة">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={'footer-' + group.id}>
              <h2 id={'footer-' + group.id}>{group.title}</h2>
              <div>{group.links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</div>
            </section>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} منصة روافد. جميع الحقوق محفوظة.</span>
        <span>معرفة موثوقة · رعاية عملية · وصولية وخصوصية منذ التصميم</span>
        <a className="back-to-top" href="#top">العودة إلى الأعلى ↑</a>
      </div>
    </footer>
  );
}