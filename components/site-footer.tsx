const groups = [
  {
    title: 'منصة روافد',
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
          <a className="brand footer-brand" href="/"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 48 48" focusable="false"><circle className="logo-source" cx="13" cy="12" r="3.2"/><path className="logo-stream" d="M13 16c1 8 5.5 10.5 12 12.5S35.5 34 36 40"/><path className="logo-stream" d="M6.5 22c7.5 0 10.5 4 18.5 6.5S35.5 34 36 40"/><path className="logo-stream" d="M21 8c-2 8 0 14 4 20.5S34.5 35 36 40"/><path className="logo-stream" d="M31 15c-3.5 4-5.5 8-6 13.5"/></svg></span><span className="brand-copy"><strong>منصة روافد</strong><small>معرفة تقود إلى أثر</small></span></a>
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
      <div className="footer-bottom"><span>© {new Date().getFullYear()} منصة روافد</span><span>RTL · Mobile-first · Accessibility · Privacy by design</span></div>
    </footer>
  );
}
