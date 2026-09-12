import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

const API_BASE = `${SITE_URL}/api/v1`;
const OPENAPI = `${SITE_URL}/api/openapi.json`;

export const metadata: Metadata = buildSeoMetadata({
  title: 'Rawafid Developer Platform | Public & Partner API',
  description: 'Official Rawafid Public & Partner API v1.2 documentation: OpenAPI, content, search, source provenance, evidence discovery, Lens, synchronization, feeds, authentication, rate limits and rights.',
  path: '/en/developers',
  index: true,
  follow: true,
  hreflang: { ar: '/developers', en: '/en/developers' },
  keywords: ['Rawafid API','Arabic health API','health knowledge API','OpenAPI','Partner API','scholarly metadata API','evidence discovery API','source provenance','incremental sync','ORCID','ROR'],
});

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage', '@id': `${SITE_URL}/en/developers#webpage`, url: `${SITE_URL}/en/developers`,
      name: 'Rawafid Developer Platform — Public & Partner API', inLanguage: 'en', dateModified: '2026-09-12',
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'TechArticle', '@id': `${SITE_URL}/en/developers#documentation`,
      headline: 'Rawafid Public & Partner API v1.2 — Developer Documentation', inLanguage: 'en', dateModified: '2026-09-12',
      mainEntityOfPage: { '@id': `${SITE_URL}/en/developers#webpage` }, publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'English', item: `${SITE_URL}/en/` },
        { '@type': 'ListItem', position: 3, name: 'Developers', item: `${SITE_URL}/en/developers` },
      ],
    },
  ],
};

const endpoints = [
  ['/api/v1', 'API discovery', 'Version, resources, feeds and machine-readable contract.'],
  ['/api/v1/content', 'Public content', 'Published, indexable content with opaque cursor pagination.'],
  ['/api/v1/content/{slug}', 'Content detail', 'One public item with body, references and rights metadata.'],
  ['/api/v1/content/{slug}/sources', 'Content sources', 'Normalized sources cited by a public content item.'],
  ['/api/v1/search', 'Search', 'Ranked search over public Rawafid content.'],
  ['/api/v1/sources', 'Source registry', 'Normalized public source registry with offset pagination.'],
  ['/api/v1/sources/{id}', 'Source detail', 'Identifiers, contributors, ORCID/ROR, rights and translation provenance.'],
  ['/api/v1/evidence-discovery', 'Evidence discovery', 'Europe PMC, Crossref and DataCite by default; Lens is explicit opt-in.'],
  ['/api/v1/lens', 'Lens manifest', 'Machine-readable Lens integration, quota and attribution contract.'],
  ['/api/v1/changes', 'Change stream', 'Lossless incremental synchronization using since + composite cursor.'],
  ['/api/v1/stats', 'Statistics', 'Public API catalog statistics.'],
  ['/api/v1/{resource}', 'Named collections', 'Articles, guides, research, tools, glossary and other public collections.'],
] as const;

const codeStyle = { overflowX: 'auto' as const, padding: '1rem', borderRadius: '0.75rem', direction: 'ltr' as const, textAlign: 'left' as const };

export default function EnglishDevelopersPage() {
  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell" lang="en" dir="ltr" id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/en/">English</Link><span>/</span><span aria-current="page">Developers</span></nav>

      <header className="public-index-hero">
        <span className="eyebrow">Developer Platform · Production API · Read-only</span>
        <h1>Rawafid Developer Platform</h1>
        <p>Official documentation for <strong>Rawafid Public &amp; Partner API v1.2.0</strong>, covering public knowledge, source provenance, ranked search, incremental synchronization, research discovery and institutional access.</p>
        <div className="public-stat-strip"><span>API v1.2.0 · Stable</span><span>Read-only · Published-only</span><span>OpenAPI 3.1 · JSON Schema 2020-12</span><span>ETag · 304 · CORS · Request IDs</span></div>
        <p><strong>Production base:</strong> <a href={API_BASE}><code>{API_BASE}</code></a></p>
        <p><strong>OpenAPI:</strong> <a href={OPENAPI}><code>{OPENAPI}</code></a></p>
        <p><Link href="/developers" lang="ar" hrefLang="ar">التوثيق العربي →</Link></p>
      </header>

      <nav className="rawafid-subnav" aria-label="Developer documentation sections">
        <a href="#quickstart">Quickstart</a><a href="#contract">Contract</a><a href="#endpoints">Endpoints</a><a href="#auth">Authentication</a><a href="#pagination">Pagination</a><a href="#evidence">Evidence</a><a href="#http">HTTP</a><a href="#errors">Errors</a><a href="#rights">Rights</a><a href="#feeds">Feeds</a>
      </nav>

      <section id="quickstart" aria-labelledby="quickstart-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Quickstart</span><h2 id="quickstart-title">Start without an API key</h2></div></div>
        <p>Public read endpoints require no credential. Institutional keys are optional and should remain server-side.</p>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>Discover the API</h3><pre style={codeStyle}><code>{`curl -sS '${API_BASE}'`}</code></pre></article>
          <article className="institutional-sector-card"><h3>List content</h3><pre style={codeStyle}><code>{`curl -sS '${API_BASE}/content?limit=5'`}</code></pre></article>
          <article className="institutional-sector-card"><h3>Search</h3><pre style={codeStyle}><code>{`curl -sS '${API_BASE}/search?q=autism&limit=5'`}</code></pre></article>
          <article className="institutional-sector-card"><h3>Discover evidence</h3><pre style={codeStyle}><code>{`curl -sS '${API_BASE}/evidence-discovery?q=autism&providers=europe_pmc,crossref,datacite&limit=5'`}</code></pre></article>
        </div>
        <pre style={codeStyle}><code>{`const response = await fetch('${API_BASE}/content?limit=5', {
  headers: { Accept: 'application/json' }
});
if (!response.ok) throw new Error(\`Rawafid API: \${response.status}\`);
const { data, pagination } = await response.json();`}</code></pre>
      </section>

      <section id="contract" aria-labelledby="contract-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Contract</span><h2 id="contract-title">Versioning and machine-readable contract</h2></div></div>
        <p><code>/api/v1</code> is the current stable major path and responses report API version <code>1.2.0</code>. The public content API is restricted to published, indexable records whose publication time has arrived.</p>
        <p>The contract is currently emitted as <strong>OpenAPI 3.1.0</strong> with JSON Schema 2020-12. Retaining the 3.1 tooling line is a compatibility decision; it is not a claim that 3.1.0 is the newest OpenAPI specification.</p>
        <p>No proprietary SDK is required. Standard HTTP, JSON and the OpenAPI document are the canonical integration surfaces.</p>
      </section>

      <section id="endpoints" aria-labelledby="endpoints-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Endpoint map</span><h2 id="endpoints-title">Production endpoints</h2></div></div>
        <div className="institutional-sector-grid">{endpoints.map(([path,name,note]) => <article className="institutional-sector-card" key={path}><span className="eyebrow">GET</span><h3>{name}</h3><p><code>{path}</code></p><p>{note}</p></article>)}</div>
      </section>

      <section id="auth" aria-labelledby="auth-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Public + Partner</span><h2 id="auth-title">Authentication, scopes and quotas</h2></div></div>
        <p>Public reads are anonymous. A partner may optionally send <code>X-API-Key</code> or <code>Authorization: Bearer …</code>. Issued keys use the <code>rawafid_live_*</code> format, are displayed once, and are stored only as a SHA-256 digest.</p>
        <p>Scopes are <code>content:read</code>, <code>sources:read</code>, <code>search:read</code>, <code>changes:read</code> and <code>stats:read</code>.</p>
        <p>The current default partner allocation is <strong>120 requests/minute</strong> and <strong>25,000 requests/day</strong>, but allocations are configurable. Treat the returned <code>X-RateLimit-*</code> headers as authoritative. Quota exhaustion returns <code>429</code> with <code>Retry-After</code>.</p>
        <pre style={codeStyle}><code>{`curl -sS \\\n  -H 'X-API-Key: rawafid_live_REDACTED' \\\n  '${API_BASE}/content?limit=25'`}</code></pre>
        <p><strong>Do not embed institutional keys in public browser code, mobile bundles, repositories, analytics, or URLs.</strong></p>
      </section>

      <section id="pagination" aria-labelledby="pagination-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Pagination</span><h2 id="pagination-title">Use the pagination model defined by each surface</h2></div></div>
        <div className="institutional-sector-grid">
          <article className="institutional-sector-card"><h3>Content</h3><p>Use the opaque <code>pagination.next_cursor</code>. Do not parse or construct it yourself.</p></article>
          <article className="institutional-sector-card"><h3>Sources</h3><p><code>/sources</code> uses <code>limit + offset</code> and returns <code>next_offset</code>.</p></article>
          <article className="institutional-sector-card"><h3>Change stream</h3><p>Start with <code>since</code>; while <code>has_more=true</code>, keep the same <code>since</code> and pass <code>next_cursor</code>. The cursor combines event time and event ID to prevent same-timestamp loss.</p></article>
          <article className="institutional-sector-card"><h3>Evidence providers</h3><p>Europe PMC, Crossref and DataCite maintain independent cursors. The generic <code>cursor</code> parameter is only a backward-compatible Europe PMC alias.</p></article>
        </div>
      </section>

      <section id="evidence" aria-labelledby="evidence-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Scholarly discovery</span><h2 id="evidence-title">Evidence discovery and Lens</h2></div></div>
        <p><code>/evidence-discovery</code> searches Europe PMC, Crossref and DataCite by default. Provider failures are isolated and exposed in typed provider status instead of collapsing all results.</p>
        <p>Lens is <strong>explicit opt-in</strong>: add <code>providers=lens</code> to request it. The Lens credential remains server-side, Lens ID is preserved, and displays must retain the attribution <strong>Data Sourced from The Lens</strong>. The enforced shared allocation is 10 requests/minute and 20,000 requests/month with fail-closed quota enforcement.</p>
        <p><Link href="/developers/lens">Detailed Lens documentation →</Link> · <a href={`${API_BASE}/lens`}>Lens machine-readable manifest ↗</a></p>
      </section>

      <section id="http" aria-labelledby="http-title">
        <div className="section-mini-heading"><div><span className="eyebrow">HTTP semantics</span><h2 id="http-title">Caching, CORS and observability</h2></div></div>
        <p>JSON responses carry <code>ETag</code>; eligible routes also emit <code>Last-Modified</code>. Send <code>If-None-Match</code> or <code>If-Modified-Since</code> to receive <code>304 Not Modified</code> when appropriate.</p>
        <p>API responses expose <code>X-Request-Id</code> for correlation. CORS supports <code>GET, HEAD, OPTIONS</code> and the documented request headers. API payload endpoints use <code>X-Robots-Tag: noindex, nofollow</code>; the human documentation pages remain indexable.</p>
      </section>

      <section id="errors" aria-labelledby="errors-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Error contract</span><h2 id="errors-title">Predictable error envelopes</h2></div></div>
        <p>Errors use <code>error.code</code>, <code>error.message</code>, <code>error.request_id</code> and, when relevant, <code>error.parameter</code>. Common statuses are 400, 401, 403, 404, 429 and 503. A temporary upstream failure is not converted into a misleading successful empty result.</p>
        <pre style={codeStyle}><code>{`{
  "error": {
    "code": "invalid_parameter",
    "message": "...",
    "parameter": "q",
    "request_id": "..."
  },
  "meta": { "api_version": "1.2.0" }
}`}</code></pre>
      </section>

      <section id="rights" aria-labelledby="rights-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Rights & provenance</span><h2 id="rights-title">Technical access is not a content licence</h2></div></div>
        <p>The conservative default is <code>link_and_citation_only</code> unless an explicit licence grants broader reuse. API availability does not itself grant permission to republish full text, abstracts, images, files or upstream provider datasets.</p>
        <p>Source detail can separate metadata rights from content rights and can preserve translation provenance: source/target language, method, tool/version, translator, reviewer, ORCID/ROR where verified, review status and content hash.</p>
      </section>

      <section id="feeds" aria-labelledby="feeds-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Feeds</span><h2 id="feeds-title">RSS and JSON Feed</h2></div></div>
        <div className="institutional-sector-grid">
          <a className="institutional-sector-card" href={`${SITE_URL}/feed.xml`}><h3>Site RSS</h3><p><code>/feed.xml</code></p></a>
          <a className="institutional-sector-card" href={`${SITE_URL}/magazine/feed.xml`}><h3>Magazine RSS</h3><p><code>/magazine/feed.xml</code></p></a>
          <a className="institutional-sector-card" href={`${SITE_URL}/feed.json`}><h3>JSON Feed 1.1</h3><p><code>/feed.json</code></p></a>
        </div>
        <p>Feeds support validators and 304 responses. If the underlying catalog is unavailable, they fail safely with 503 and <code>Retry-After</code> rather than publishing a false empty feed.</p>
      </section>

      <section id="contact" aria-labelledby="contact-title">
        <div className="section-mini-heading"><div><span className="eyebrow">Institutional integrations</span><h2 id="contact-title">Partner API and support</h2></div></div>
        <p>For institutional access, interoperability review or a production issue, contact <a href="mailto:contact@healthrenewal.org">contact@healthrenewal.org</a>. Include the endpoint, timestamp, HTTP status and <code>X-Request-Id</code>. Never send a full API key by email.</p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
