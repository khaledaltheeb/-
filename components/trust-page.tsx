import type { ReactNode } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';

type Section = { title: string; body: ReactNode };

const trustLinks = [
  { href: '/about', label: 'عن روافد' },
  { href: '/sources', label: 'منهج المصادر' },
  { href: '/medical-review-policy', label: 'المراجعة العلمية' },
  { href: '/editorial-policy', label: 'السياسة التحريرية' },
  { href: '/accessibility-statement', label: 'الإتاحة الرقمية' },
  { href: '/privacy', label: 'الخصوصية' },
  { href: '/terms', label: 'شروط الاستخدام' },
  { href: '/disclaimer', label: 'إخلاء المسؤولية' },
];

export default function TrustPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: Section[] }) {
  return (
    <>
      <SiteHeader />
      <main className="trust-page-shell">
        <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">{title}</span></nav>
        <nav className="trust-local-nav" aria-label="صفحات الثقة والسياسات">{trustLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <header className="trust-page-hero"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></header>
        <article className="trust-page-content">
          {sections.map((section) => <section key={section.title}><h2>{section.title}</h2><div>{section.body}</div></section>)}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
