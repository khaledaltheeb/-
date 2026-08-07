import type { ReactNode } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';

type Section = { title: string; body: ReactNode };

export default function TrustPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: Section[] }) {
  return (
    <>
      <SiteHeader />
      <main className="trust-page-shell">
        <header className="trust-page-hero"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></header>
        <article className="trust-page-content">
          {sections.map((section) => <section key={section.title}><h2>{section.title}</h2><div>{section.body}</div></section>)}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
