import fs from 'node:fs';
import './metadata-coverage-contract.mjs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function requireAll(text, values, label) {
  for (const value of values) {
    if (!text.includes(value)) throw new Error(`${label}: missing ${value}`);
  }
}

const seo = read('lib/seo.ts');
const layout = read('app/layout.tsx');
const robots = read('app/robots.ts');
const sitemapXml = read('lib/sitemap-xml.ts');
const staticSitemap = read('app/sitemaps/static.xml/route.ts');
const sitemapIndex = read('app/sitemap.xml/route.ts');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const wrangler = read('wrangler.jsonc');
const productionWorkflow = read('.github/workflows/deploy-production.yml');
const qualityWorkflow = read('.github/workflows/quality.yml');
const indexNowWorkflow = read('.github/workflows/indexnow-discovery.yml');
const llms = read('public/llms.txt');
const citation = read('app/citation/page.tsx');
const register = read('app/register/actions.ts');
const forgotPassword = read('app/forgot-password/actions.ts');

requireAll(seo, [
  "'@type': 'Organization'",
  "'@type': 'WebSite'",
  'alternateName: BRAND_SHORT',
  "'@type': 'ImageObject'",
  "publisher: { '@id': `${SITE_URL}/#organization` }",
  "PRODUCTION_SITE_URL = 'https://healthrenewal.org'",
  "STAGING_SITE_URL = 'https://rawafid-platform-staging.khaledaltheeb.workers.dev'",
  "SITE_HOSTNAME.endsWith('.workers.dev')",
  "process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true' && !IS_TEMPORARY_HOST",
], 'structured identity and domain safety');

if (seo.includes("'@type': 'SearchAction'")) {
  throw new Error('structured identity: deprecated sitelinks SearchAction must not return');
}
if (seo.includes("'@type': 'AggregateRating'")) {
  throw new Error('structured identity: do not manufacture aggregate ratings for search appearance');
}

requireAll(layout, [
  "url: '/icons/rawafid-app.svg'",
  "url: '/pwa-icon-192'",
  "url: '/pwa-icon-180'",
  'applicationName: BRAND_NAME',
  'INDEXING_ENABLED',
], 'root metadata');
if (/rawafid-app\.svg\?v=|pwa-icon-(?:180|192)\?v=/.test(layout)) {
  throw new Error('root metadata: search-facing icon URLs must remain stable');
}

requireAll(robots, [
  "INDEXING_ENABLED",
  "sitemap: `${SITE_URL}/sitemap.xml`",
  "'Googlebot'",
  "'Bingbot'",
  "'OAI-SearchBot'",
  "'/search?'",
  "'/api/private/'",
], 'robots discovery');
requireAll(sitemapXml, ['INDEXING_ENABLED', 'SITE_URL'], 'sitemap indexability gate');

requireAll(sitemapIndex, [
  "'/sitemaps/static.xml'",
  "'/sitemaps/taxonomy.xml'",
  '/sitemaps/quick-info.xml?page=${page}',
  '/sitemaps/encyclopedia.xml?page=${page}',
  '/sitemaps/content.xml?page=${page}',
], 'sitemap index');

requireAll(staticSitemap, [
  "path:'/'",
  "path:'/sectors'",
  "path:'/sections'",
  "path:'/quick-info/'",
  "path:'/magazine/'",
  "path:'/care-guides/'",
  "path:'/evidence-guides/'",
  "path:'/encyclopedia/'",
  "path:'/cognitive-lab'",
  "path:'/specialists'",
  "path:'/centers'",
], 'primary search hubs');

requireAll(header, [
  "href: '/sectors'",
  "href: '/sections'",
  "href: '/sectors/pediatric-oncology'",
  "href: '/sectors/mental-health'",
  "href: '/sectors/special-needs-inclusion'",
  "href: '/sectors/addiction-recovery'",
  "href: '/care-guides/'",
  "href: '/evidence-guides/'",
], 'header authority links');

requireAll(footer, [
  "href: '/sectors'",
  "href: '/sections'",
  "href: '/sectors/pediatric-oncology'",
  "href: '/sectors/mental-health'",
  "href: '/sectors/special-needs-inclusion'",
  "href: '/sectors/addiction-recovery'",
  "href: '/sectors/child-family-education'",
  "href: '/encyclopedia/'",
  "href: '/cognitive-lab'",
  "href: '/specialists'",
  "href: '/centers'",
  'data-nosnippet',
], 'footer authority links');

requireAll(wrangler, [
  '"NEXT_PUBLIC_SITE_URL": "https://rawafid-platform-staging.khaledaltheeb.workers.dev"',
  '"NEXT_PUBLIC_ALLOW_INDEXING": "false"',
], 'staging must stay non-indexable');
requireAll(productionWorkflow, [
  'NEXT_PUBLIC_SITE_URL: https://healthrenewal.org',
  "NEXT_PUBLIC_ALLOW_INDEXING: 'true'",
  "grep -q 'workers.dev'",
], 'production domain migration');
requireAll(qualityWorkflow, [
  'NEXT_PUBLIC_SITE_URL: https://healthrenewal.org',
  'SEO_GATE_BASE_URL: http://127.0.0.1:3000',
], 'CI production-canonical simulation');
requireAll(indexNowWorkflow, [
  'workflow_dispatch:',
  'INDEXNOW_SITE_URL: https://healthrenewal.org',
], 'pre-cutover IndexNow');
if (/^\s*schedule:/m.test(indexNowWorkflow)) {
  throw new Error('pre-cutover IndexNow: scheduled notifications must remain paused until domain cutover');
}
if (/workers\.dev/i.test(llms)) {
  throw new Error('llms discovery file must not advertise staging URLs');
}
requireAll(llms, ['Canonical site: https://healthrenewal.org/', 'https://healthrenewal.org/sitemap.xml'], 'AI discovery canonical');
if (/rawafid-platform-staging\.khaledaltheeb\.workers\.dev/i.test(citation)) {
  throw new Error('citation page must not publish staging URL');
}
requireAll(citation, ['buildSeoMetadata', 'SITE_URL'], 'citation canonical');
requireAll(register, ['PRODUCTION_SITE_URL'], 'registration production fallback');
requireAll(forgotPassword, ['PRODUCTION_SITE_URL'], 'password-reset production fallback');

console.log('Search appearance and healthrenewal migration contract: OK');
