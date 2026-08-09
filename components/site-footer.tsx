const groups = [
  {
    title: 'منصة روافد',
    links: [
      { href: '/about', label: 'عن المنصة' },
      { href: '/search', label: 'البحث' },
      { href: '/cognitive-lab', label: 'مختبر القدرات' },
      { href: '/specialists', label: 'دليل المختصين' },
      { href: '/centers', label: 'دليل المراكز' },
    ],
  },
  {
    title: 'المشاركة المهنية',
    links: [
      { href: '/join', label: 'الانضمام المهني' },
      { href: '/join/specialist', label: 'التقدم كمختص' },
      { href: '/join/center', label: 'تسجيل مركز' },
      { href: '/community', label: 'المتدربون والمتطوعون' },
      { href: '/community/join', label: 'الانضمام للمجتمع' },
      { href: '/specialist', label: 'بوابة المختص' },
      { href: '/center', label: 'بوابة المركز' },
    ],
  },
  {
    title: 'الثقة والسياسات',
    links: [
      { href: '/medical-review-policy', label: 'سياسة المراجعة العلمية' },
      { href: '/editorial-policy', label: 'السياسة التحريرية' },
      { href: '/disclaimer', label: 'إخلاء المسؤولية' },
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
          <a className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true"><RawafidMark /></span><span className="brand-copy"><strong>منصة روافد</strong><small>Rawafid Platform</small></span></a>
          <p>منصة عربية مؤسسية للمعرفة والخدمات في الصحة النفسية والتعافي والدمج والتمكين، مبنية على الثقة، الوصول الآمن، والمراجعة المنهجية.</p>
          <span className="footer-trust-note">المحتوى التثقيفي لا يحل محل التقييم أو التشخيص أو العلاج المهني الفردي.</span>
        </div>
        <div className="footer-groups">
          {groups.map((group) => (
            <section key={group.title} aria-labelledby={`footer-${group.title}`}>
              <h2 id={`footer-${group.title}`}>{group.title}</h2>
              <div>{group.links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</div>
            </section>
          ))}
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} منصة روافد</span><span>تجربة عربية أصيلة · إتاحة رقمية · خصوصية بالتصميم</span></div>
    </footer>
  );
}
import RawafidMark from '@/components/rawafid-mark';
