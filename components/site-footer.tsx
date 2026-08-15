import RawafidBrand from '@/components/rawafid-brand';

const groups = [
  {
    id: 'knowledge',
    title: 'المعرفة',
    links: [
      { href: '/sections', label: 'جميع الأقسام' },
      { href: '/encyclopedia/', label: 'الموسوعة' },
      { href: '/evidence-guides/', label: 'الأدلة العلمية' },
      { href: '/cognitive-lab', label: 'المختبر المعرفي' },
    ],
  },
  {
    id: 'support',
    title: 'الخدمات والدعم',
    links: [
      { href: '/specialists', label: 'دليل المختصين' },
      { href: '/centers', label: 'دليل المراكز' },
      { href: '/search', label: 'البحث المتقدم' },
      { href: '/experiences/', label: 'شاركنا تجربتك' },
    ],
  },
  {
    id: 'professional',
    title: 'المشاركة المهنية',
    links: [
      { href: '/join', label: 'الانضمام المهني' },
      { href: '/join/specialist', label: 'التقدم كمختص' },
      { href: '/join/center', label: 'تسجيل مركز' },
      { href: '/community', label: 'المتدربون والمتطوعون' },
    ],
  },
  {
    id: 'trust',
    title: 'الثقة والحقوق',
    links: [
      { href: '/medical-review-policy', label: 'المراجعة العلمية' },
      { href: '/editorial-policy', label: 'السياسة التحريرية' },
      { href: '/privacy', label: 'الخصوصية' },
      { href: '/terms', label: 'شروط الاستخدام' },
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
          <div className="footer-trust-list" aria-label="معايير الثقة">
            <span>مراجعة منهجية</span>
            <span>مصادر قابلة للتتبع</span>
            <span>خصوصية ووصولية</span>
          </div>
          <span className="footer-trust-note">المحتوى للتثقيف العام ولا يحل محل التقييم أو التشخيص أو العلاج المهني الفردي.</span>
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
        <span>هوية عربية · متوافق مع الهاتف · وصولية وخصوصية منذ التصميم</span>
        <a className="back-to-top" href="#top">العودة إلى الأعلى ↑</a>
      </div>
    </footer>
  );
}
