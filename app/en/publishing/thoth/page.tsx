import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata } from '@/lib/seo';

const CANONICAL = '/en/publishing/thoth/';
const TITLE = 'Open Book Publishing & Metadata Infrastructure';
const DESCRIPTION = 'English institutional workflow for preparing Rawafid / Health Renewal open-book metadata for Thoth Oasis, including rights, identifiers, ONIX readiness, translation provenance, public-record safeguards, and quality control.';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = buildSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: CANONICAL,
  index: true,
  follow: true,
  type: 'article',
  keywords: [
    'Thoth Open Metadata',
    'Thoth Oasis',
    'open access books',
    'book metadata',
    'ONIX 3.0',
    'ISBN',
    'DOI',
    'ORCID',
    'ROR',
    'CC0 metadata',
    'open book publishing',
    'Arabic publishing',
    'Rawafid',
    'Health Renewal',
  ],
});

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://healthrenewal.org/en/publishing/thoth/#webpage',
      url: 'https://healthrenewal.org/en/publishing/thoth/',
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'en',
      datePublished: '2026-09-12',
      dateModified: '2026-09-12',
      isPartOf: { '@id': 'https://healthrenewal.org/#website' },
      about: [
        'open book publishing',
        'Thoth Open Metadata',
        'metadata governance',
        'ONIX',
        'persistent identifiers',
        'rights and licensing',
      ],
    },
    {
      '@type': 'TechArticle',
      '@id': 'https://healthrenewal.org/en/publishing/thoth/#article',
      headline: TITLE,
      description: DESCRIPTION,
      inLanguage: 'en',
      datePublished: '2026-09-12',
      dateModified: '2026-09-12',
      mainEntityOfPage: { '@id': 'https://healthrenewal.org/en/publishing/thoth/#webpage' },
      publisher: { '@id': 'https://healthrenewal.org/#organization' },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://healthrenewal.org/en/publishing/thoth/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does a Thoth metadata record mean Thoth reviewed or endorsed the book?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. A metadata record is a publishing and discovery record. Rawafid does not describe Thoth as an endorser, reviewer, accreditor, or scientific validator of a title.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can Rawafid create records for books published by another publisher?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Only when Rawafid has a documented publishing or metadata-management authority that permits it. Otherwise, third-party titles may be discovered and cited without being represented as Rawafid publications.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Thoth metadata the same as the copyright licence for a PDF, EPUB, cover, or book text?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Thoth metadata is released under CC0, while the underlying book, files, cover, illustrations, and translations remain governed by their own licences and rights.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the Rawafid CSV readiness file an official Thoth import template?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. It is a Rawafid pre-ingest quality-control worksheet. The current official CSV or ONIX template must be obtained from the Thoth interface at the time of upload.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://healthrenewal.org/' },
        { '@type': 'ListItem', position: 2, name: 'English', item: 'https://healthrenewal.org/en/' },
        { '@type': 'ListItem', position: 3, name: 'Publishing', item: 'https://healthrenewal.org/en/publishing/thoth/' },
        { '@type': 'ListItem', position: 4, name: 'Thoth metadata workflow', item: 'https://healthrenewal.org/en/publishing/thoth/' },
      ],
    },
  ],
};

const officialSources = [
  {
    title: 'Thoth Oasis',
    href: 'https://thoth.pub/packages/oasis',
    note: 'Free self-service metadata management and standards-based exports for open-access publishers.',
  },
  {
    title: 'Thoth Metadata Management',
    href: 'https://thoth.pub/services/metadata',
    note: 'Metadata standards, persistent identifiers, supported export formats, and CC0 metadata practice.',
  },
  {
    title: 'Terms & Conditions: Thoth Metadata Management',
    href: 'https://thoth.pub/docs/policies/terms-thoth-metadata',
    note: 'Publisher responsibilities, rights in submitted metadata, public access, CC0 dedication, and account obligations.',
  },
  {
    title: 'Thoth Documentation',
    href: 'https://thoth.pub/docs',
    note: 'Official documentation, APIs, reports, downloads, and implementation resources.',
  },
  {
    title: 'Thoth Obelisk',
    href: 'https://thoth.pub/packages/obelisk',
    note: 'Separate added-value dissemination, DOI, hosting, and archiving services; not assumed by this Oasis workflow.',
  },
] as const;

const readinessFields = [
  'Record status and internal work identifier',
  'Title, subtitle, edition, language, and publication date',
  'Publisher and imprint identity',
  'Contributors, contributor roles, and ORCID where available',
  'ISBNs by format and DOI where applicable',
  'Series and work/edition relationships',
  'Abstract, keywords, Thema/BISAC subjects, and audience',
  'Open-access status, copyright holder, licence name, and licence URL',
  'Canonical landing page and format-specific access URLs',
  'Translation source, source identifier, translator credit, and permission basis when relevant',
  'Funder/institution identifiers such as ROR where relevant',
  'Metadata source, verification date, reviewer, and correction provenance',
] as const;

const productionSteps = [
  ['1. Authority gate', 'Confirm that Rawafid / Health Renewal is the publisher, co-publisher, or explicitly authorised metadata manager for the work. A discovery relationship alone is not enough.'],
  ['2. Rights gate', 'Document copyright ownership, the exact licence for each released format, cover/illustration rights, and any translation or adaptation permission.'],
  ['3. Editorial and scholarly gate', 'Confirm that the release has completed the applicable editorial, scientific, accessibility, citation, and conflict-of-interest checks before public metadata is created.'],
  ['4. Identifier gate', 'Validate title-level and format-level ISBNs, DOI where applicable, contributor ORCID records, and organisation/funder identifiers such as ROR.'],
  ['5. Metadata normalization', 'Normalize names, roles, dates, languages, subjects, descriptions, relationships, URLs, and licence values in the Rawafid pre-ingest record.'],
  ['6. Thoth entry or bulk upload', 'Create the production record through the Thoth interface or use the current official CSV/ONIX bulk-upload template. The Rawafid worksheet is not a substitute for the current Thoth template.'],
  ['7. Public-record verification', 'After creation, inspect the public record, identifiers, contributor roles, licence, landing links, and exports. Correct inconsistencies rather than allowing stale metadata to propagate.'],
  ['8. Export and downstream validation', 'Validate required ONIX/MARC/KBART/CSV/BibTeX or other exports for the intended workflow. Distribution, hosting, DOI sponsorship, and archiving are treated as separate services and decisions.'],
] as const;

export default function ThothPublishingInfrastructurePage() {
  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell" lang="en" dir="ltr">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />

      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/en/">English</Link><span>/</span><span aria-current="page">Open-book publishing</span>
      </nav>

      <header className="public-index-hero">
        <span className="eyebrow">Publishing infrastructure · Open metadata · Rights-first workflow</span>
        <h1>{TITLE}</h1>
        <p>{DESCRIPTION}</p>
        <div className="public-stat-strip">
          <span>Policy version 1.0 · 12 September 2026</span>
          <span>Production records only</span>
          <span>Indexable · Stable canonical</span>
        </div>
        <p><strong>Independence notice:</strong> this is Rawafid / Health Renewal&apos;s own implementation and governance workflow. Mention of Thoth Open Metadata does not imply that Thoth has reviewed, endorsed, accredited, or scientifically validated Rawafid, this page, or any future title.</p>
      </header>

      <nav className="rawafid-subnav" aria-label="Page contents">
        <a href="#boundary">Implementation boundary</a>
        <a href="#lanes">Publishing lanes</a>
        <a href="#gates">Pre-ingest gates</a>
        <a href="#profile">Metadata profile</a>
        <a href="#workflow">Production workflow</a>
        <a href="#translations">Translations</a>
        <a href="#corrections">Corrections</a>
        <a href="#template">Template</a>
        <a href="#sources">Official sources</a>
      </nav>

      <section id="boundary" aria-labelledby="boundary-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Scope before tooling</span><h2 id="boundary-title">What Thoth means in the Rawafid publishing workflow</h2></div></div>
        <p>Rawafid uses a rights-first model: a metadata platform is not a substitute for publishing authority, copyright clearance, editorial review, or scientific quality assurance. Thoth Oasis is treated as a structured metadata-management and export layer for eligible open-access books and chapters.</p>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>Oasis: metadata layer</h3><p>Thoth describes Oasis as its free self-service metadata platform. It supports structured metadata management and standards-based exports. Rawafid prepares records before entry so public metadata is complete, attributable, and internally auditable.</p></article>
          <article className="institutional-sector-card"><h3>Public metadata, not a sandbox</h3><p>Thoth&apos;s terms make metadata publicly accessible and available under CC0. Rawafid therefore does not create placeholder or speculative production records. A title must pass the authority, rights, editorial, identifier, and metadata gates first.</p></article>
          <article className="institutional-sector-card"><h3>Distribution is a separate decision</h3><p>Automated distribution, DOI registration support, hosting, and archiving are separate services in Thoth&apos;s added-value packages. This page does not claim that those services are enabled for Rawafid or that a title has been distributed anywhere.</p></article>
        </div>
      </section>

      <section id="lanes" aria-labelledby="lanes-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Prevent publisher-role confusion</span><h2 id="lanes-title">Three publishing lanes</h2></div></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>A. Rawafid-original titles</h3><p>Books genuinely published by Rawafid / Health Renewal can enter the production workflow after authorship, publishing authority, edition identity, copyright, licence, and quality-control records are complete.</p></article>
          <article className="institutional-sector-card"><h3>B. Authorised translations</h3><p>A translated title requires a documented legal basis: an open licence that permits the intended translation/adaptation or written permission. The translated edition must retain source-work provenance, translator credit, source identifiers, and licence compatibility.</p></article>
          <article className="institutional-sector-card"><h3>C. Third-party discovery only</h3><p>Books published by another publisher remain that publisher&apos;s works. Rawafid may discover, cite, review, or link to lawful sources, but it does not create a Rawafid publisher record for them without explicit publishing or metadata-management authority.</p></article>
        </div>
      </section>

      <section id="gates" aria-labelledby="gates-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Zero speculative public records</span><h2 id="gates-title">Mandatory pre-ingest gates</h2></div></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>Authority & rights</h3><ul><li>Publisher/co-publisher/authorisation evidence.</li><li>Copyright holder confirmed.</li><li>Licence text and URL verified for the exact edition.</li><li>Translation/adaptation rights documented when relevant.</li><li>Cover, images, and third-party material cleared separately.</li></ul></article>
          <article className="institutional-sector-card"><h3>Editorial & quality</h3><ul><li>Final title/subtitle and edition fixed.</li><li>Contributor names and roles checked.</li><li>Citations and references reviewed where applicable.</li><li>Scientific/technical review completed for health and education titles.</li><li>Accessibility and file-readiness checks completed for released formats.</li></ul></article>
          <article className="institutional-sector-card"><h3>Identifiers & metadata</h3><ul><li>ISBN mapped to the correct format/edition.</li><li>DOI used only where legitimately assigned.</li><li>ORCID/ROR links verified rather than guessed.</li><li>Subjects, description, language, dates, URLs, and licence normalized.</li><li>Canonical source and verification date recorded.</li></ul></article>
        </div>
      </section>

      <section id="profile" aria-labelledby="profile-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Rawafid pre-ingest profile</span><h2 id="profile-title">Minimum metadata readiness profile</h2></div></div>
        <p>This profile is deliberately stricter than a simple title spreadsheet. It is the internal minimum Rawafid aims to have available before a public production record is created.</p>
        <div className="institutional-sector-grid">
          {readinessFields.map((field, index) => <article className="institutional-sector-card" key={field}><span className="eyebrow">Field group {index + 1}</span><h3>{field}</h3></article>)}
        </div>
      </section>

      <section id="workflow" aria-labelledby="workflow-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Controlled production path</span><h2 id="workflow-title">From book file to public metadata record</h2></div></div>
        <div className="institutional-sector-grid">
          {productionSteps.map(([title, text]) => <article className="institutional-sector-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section id="translations" aria-labelledby="translations-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Translation provenance is metadata</span><h2 id="translations-title">Additional controls for translated books</h2></div></div>
        <p>Translation work must not begin from the assumption that “open access” automatically permits translation. The team records the exact licence or written permission, source edition, source publisher, source ISBN/DOI, translator(s), review responsibility, modification notes, and the licence applied to the translated edition.</p>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>Source identity</h3><p>Preserve the original title, edition, publisher, publication date, canonical URL, ISBN/DOI, and source language so the relationship can be audited later.</p></article>
          <article className="institutional-sector-card"><h3>Permission basis</h3><p>Record whether translation is permitted by the source licence or by explicit written authorisation. If permission is conditional, retain those conditions in the internal rights record.</p></article>
          <article className="institutional-sector-card"><h3>Derivative-edition transparency</h3><p>Credit translators and reviewers, distinguish translation from adaptation, disclose material changes, and never imply that the source publisher or author reviewed the Arabic edition unless that review actually occurred.</p></article>
        </div>
      </section>

      <section id="corrections" aria-labelledby="corrections-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Public metadata needs maintenance</span><h2 id="corrections-title">Corrections, withdrawals, and provenance</h2></div></div>
        <p>Because metadata can propagate into catalogues and downstream systems, corrections are treated as publication maintenance rather than cosmetic edits. Rawafid keeps a verification date, change reason, responsible reviewer, and previous value where material. If a production record must be withdrawn or deleted, the team follows Thoth&apos;s current support procedure instead of assuming that a public record can be silently erased.</p>
        <p>Withdrawal of a book, replacement of a file, a corrected edition, a changed licence, or a contributor correction must be reflected consistently in the canonical landing page and metadata record. A new edition is not silently overwritten as if it were the same manifestation.</p>
      </section>

      <section id="template" aria-labelledby="template-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Operational asset</span><h2 id="template-title">Rawafid metadata-readiness template</h2></div></div>
        <p>Use the CSV below to collect and verify a title before entry into Thoth. It is intentionally a <strong>Rawafid pre-ingest worksheet</strong>, not an official Thoth import file. For an actual bulk upload, download the current CSV or ONIX template from the Thoth interface and map only verified production data.</p>
        <div className="institutional-sector-grid">
          <a className="institutional-sector-card" href="/publishing/rawafid-thoth-metadata-readiness-template.csv" download>
            <span className="eyebrow">CSV · pre-ingest QA</span>
            <h3>Download the metadata-readiness template</h3>
            <p>One-row-per-edition preparation sheet covering authority, identifiers, contributors, rights, access links, translation provenance, and verification.</p>
            <span className="sector-open">Download CSV ↓</span>
          </a>
          <Link className="institutional-sector-card" href="/resources/open-books-discovery/">
            <span className="eyebrow">Arabic reader guide</span>
            <h3>Open-book discovery and licence verification</h3>
            <p>Read the separate Arabic guide for discovery, licence verification, metadata interpretation, and source-quality checks.</p>
            <span className="sector-open">Open guide →</span>
          </Link>
        </div>
      </section>

      <section id="status" aria-labelledby="status-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Current implementation boundary</span><h2 id="status-title">What is ready, and what is deliberately not claimed</h2></div></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>Ready</h3><p>Publisher-integrity rules, a rights-first intake model, a metadata-readiness profile, a pre-ingest worksheet, a public discovery/licence guide, canonical/indexable pages, and post-deployment checks.</p></article>
          <article className="institutional-sector-card"><h3>Title-level production</h3><p>No book should be described here as successfully published or distributed through Thoth until its actual production record and relevant downstream outputs have been verified.</p></article>
          <article className="institutional-sector-card"><h3>No implied partnership</h3><p>Rawafid&apos;s use of Thoth infrastructure is not described as accreditation, scientific review, endorsement, or institutional supervision by Thoth unless a separate written relationship explicitly says so.</p></article>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Operational FAQ</span><h2 id="faq-title">Frequently asked questions</h2></div></div>
        <h3>Does a Thoth metadata record mean Thoth reviewed or endorsed the book?</h3><p>No. It is a metadata and publishing-infrastructure record, not a scientific endorsement or accreditation.</p>
        <h3>Can Rawafid create records for another publisher&apos;s books?</h3><p>Only with documented authority that permits Rawafid to act as publisher/co-publisher or metadata manager for those works. Otherwise, the correct role is discovery, citation, review, or linking.</p>
        <h3>Does CC0 metadata make the PDF, EPUB, cover, or text CC0?</h3><p>No. The metadata and the work&apos;s content are separate rights layers. Each file and content component must be checked under its own licence and permissions.</p>
        <h3>Is the downloadable CSV the official Thoth bulk-upload template?</h3><p>No. It is our quality-control worksheet. The current official template must be obtained from Thoth at the time of upload.</p>
      </section>

      <section id="sources" aria-labelledby="sources-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Primary documentation</span><h2 id="sources-title">Official Thoth sources used for this workflow</h2></div><span>Checked 12 September 2026</span></div>
        <div className="institutional-sector-grid">
          {officialSources.map((source) => <a className="institutional-sector-card" href={source.href} target="_blank" rel="noreferrer" key={source.href}><h3>{source.title}</h3><p>{source.note}</p><span className="sector-open">Open official source ↗</span></a>)}
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
