import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, buildSeoMetadata } from '@/lib/seo';
import styles from '@/components/institutional-assurance-page.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Arabic, RTL, Accessibility & Localization Assurance',
  description: 'Rawafid helps institutions test Arabic and RTL interfaces, localization catalogs, terminology consistency, Unicode/bidi behavior and accessibility-oriented interaction patterns.',
  path: '/en/institutions',
  index: true,
  follow: true,
  keywords: ['Arabic localization QA', 'RTL testing', 'Arabic accessibility', 'terminology QA', 'Arabic i18n'],
  hreflang: { en: '/en/institutions', ar: '/institutions', 'x-default': '/institutions' },
});

const offers = [
  ['Arabic & RTL assurance', 'Directionality, mixed Arabic/Latin text, bidi isolation, forms, keyboard flows, logical CSS, responsive layout and regression evidence.', '/institutions/arabic-rtl-assurance'],
  ['Terminology & translation QA', 'Source-conditioned terminology rules, required/deprecated target wording, catalog audits and machine-readable findings with human governance.', '/institutions/terminology-qa'],
  ['Open-source engineering', 'A separate Apache-2.0 TypeScript toolkit for reusable Arabic, RTL, i18n, accessibility and QA primitives.', '/institutions/open-source'],
] as const;

export default function EnglishInstitutionsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Rawafid Arabic, RTL, Accessibility and Localization Assurance',
    url: absoluteSiteUrl('/en/institutions'),
    inLanguage: 'en',
    description: 'Institutional Arabic, RTL, accessibility, localization and terminology quality assurance.',
  };

  return <div className={`${styles.page} ${styles.ltr}`} lang="en" dir="ltr">
    <SiteHeader />
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <span className={styles.eyebrow}>For institutions and open-source projects</span>
            <h1 className={styles.title}>Arabic quality is more than translation.</h1>
            <p className={styles.lead}>Rawafid works at the intersection of Arabic localization, right-to-left engineering, accessibility and terminology governance. We focus on reproducible problems: a public interface, translation catalog, terminology rule or interaction that can be inspected, documented, tested and improved.</p>
            <div className={styles.actions}>
              <a className={styles.primary} href="mailto:contact@healthrenewal.org?subject=Institutional%20Arabic%20RTL%20Assurance">Contact Rawafid</a>
              <a className={styles.secondary} href="https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit" target="_blank" rel="noreferrer">View the open-source toolkit</a>
            </div>
          </div>
          <aside className={styles.heroCard}>
            <h2>Useful starting points</h2>
            <ul>
              <li>A public Arabic page or reporting portal.</li>
              <li>A set of source/Arabic localization keys.</li>
              <li>An institutional glossary that needs enforceable QA.</li>
              <li>An open-source application adding Arabic or RTL.</li>
              <li>An accessibility regression involving mixed-direction content.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>Capabilities</p><h2>Evidence-first institutional support</h2><p>We prefer a small verified contribution over a broad partnership pitch. The generic engine can remain open source while organization-specific terminology profiles and authorized content remain under the institution's own governance.</p></div>
        <div className={styles.grid}>{offers.map(([title, description, href]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{description}</p><Link className={styles.cardLink} href={href}>Technical details →</Link></article>)}</div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.twoColumn}>
          <article className={styles.panel}>
            <h2>How we work</h2>
            <ol>
              <li>Verify a real issue or gap using primary evidence.</li>
              <li>Separate semantic errors from stylistic preferences and extraction artefacts.</li>
              <li>Provide a concise finding and reproducible evidence.</li>
              <li>Turn recurring rules into tests or CI checks where appropriate.</li>
              <li>Re-test after remediation.</li>
            </ol>
          </article>
          <article className={styles.panel}>
            <h2>Claims boundary</h2>
            <ul>
              <li>Automated checks do not prove complete translation quality.</li>
              <li>Passing an automated accessibility check does not prove full WCAG conformance.</li>
              <li>Domain-sensitive terminology needs qualified human review and provenance.</li>
              <li>We never claim endorsement, accreditation or partnership without explicit written confirmation.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.cta}`}>
        <h2>Start with one public, reviewable surface.</h2>
        <p>Send us a public URL, a small authorized localization sample, or an open-source repository. If we cannot identify a defensible, useful contribution, we would rather say so than manufacture a partnership pitch.</p>
        <div className={styles.actions}><a className={styles.primary} href="mailto:contact@healthrenewal.org?subject=Arabic%20Localization%20QA%20Sample">Request a small review</a><Link className={styles.secondary} href="/institutions">العربية</Link></div>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
  </div>;
}
