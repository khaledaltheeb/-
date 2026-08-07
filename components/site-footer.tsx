import Link from 'next/link';

const groups = [
  {
    title: 'روافد',
    links: [
      { href: '/about', label: 'عن المنصة' },
      { href: '/search', label: 'البحث' },
      { href: '/specialists', label: 'دليل المختصين' },
      { href: '/centers', label: 'دليل المراكز' },
    ],
  },
  {
    title: 'المشاركة المهنية',
    links: [
      { href: '/community', label: 'المتدربون والمتطوعون' },
      { href: '/login', label: 'إنشاء حساب' },
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
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand-block">
          <Link className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true">ر</span><span className="brand-copy"><strong>منصة روافد</strong><small>Rawafid Platform</small></span></Link>
          <p>منصة عربية مؤسسية للمعرفة والخدمات في الصحة النفسية والتعافي والدمج والتمكين، مبنية على الثقة، الوصول الآمن، والمراجعة المنهجية.</p>
          <span className="footer-trust-note">المحتوى التثقيفي لا يحل محل التقييم أو التشخيص أو العلاج المهني الفردي.</span>
        </div>
        <div className="footer-groups">
          {groups.map((group) => (
            <section key={group.title} aria-labelledby={`footer-${group.title}`}>
              <h2 id={`footer-${group.title}`}>{group.title}</h2>
              <div>{group.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div>
            </section>
          ))}
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} منصة روافد</span><span>RTL · Mobile-first · Accessibility · Privacy by design</span></div>
    </footer>
  );
}
