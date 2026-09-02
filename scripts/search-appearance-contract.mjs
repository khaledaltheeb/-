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
const quickInfoSitemap = read('app/sitemaps/quick-info.xml/route.ts');
const encyclopediaSitemap = read('app/sitemaps/encyclopedia.xml/route.ts');
const cognitiveSitemap = read('app/sitemaps/cognitive-lab.xml/route.ts');
const specialistsSitemap = read('app/sitemaps/specialists.xml/route.ts');
const centersSitemap = read('app/sitemaps/centers.xml/route.ts');
const communitySitemap = read('app/sitemaps/community.xml/route.ts');
const sitemapIndex = read('app/sitemap.xml/route.ts');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const middleware = read('middleware.ts');
const wrangler = read('wrangler.jsonc');
const productionWorkflow = read('.github/workflows/deploy-production.yml');
const cutoverWorkflow = read('.github/workflows/healthrenewal-cutover-readiness.yml');
const cutoverGate = read('scripts/healthrenewal-cutover-readiness.mjs');
const qualityWorkflow = read('.github/workflows/quality.yml');
const indexNowWorkflow = read('.github/workflows/indexnow-discovery.yml');
const llms = read('public/llms.txt');
const citation = read('app/citation/page.tsx');
const register = read('app/register/actions.ts');
const forgotPassword = read('app/forgot-password/actions.ts');

requireAll(seo, [
  "'@type': 'Organization'",
  "'@type': 'WebSite'",
  "alternateName: [BRAND_SHORT, 'Rawafid']",
  "alternateName: [BRAND_SHORT, 'Rawafid', SITE_HOSTNAME]",
  "name: BRAND_NAME",
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
  'siteName: BRAND_NAME',
], 'root metadata');
if (/rawafid-app\.svg\?v=|pwa-icon-(?:180|192)\?v=/.test(layout)) {
  throw new Error('root metadata: search-facing icon URLs must remain stable');
}

requireAll(robots, [
  "SITE_HOSTNAME.endsWith('.workers.dev')",
  "sitemap: `${SITE_URL}/sitemap.xml`",
  "'Googlebot'",
  "'Google-Extended'",
  "'Bingbot'",
  "'Applebot'",
  "'Applebot-Extended'",
  "'OAI-SearchBot'",
  "'ChatGPT-User'",
  "'GPTBot'",
  "'ClaudeBot'",
  "'PerplexityBot'",
  "'Amazonbot'",
  "'Bytespider'",
  "'CCBot'",
  "'meta-externalagent'",
  "'/search?'",
  "'/api/private/'",
], 'robots discovery');
requireAll(sitemapXml, ['INDEXING_ENABLED', 'SITE_URL'], 'sitemap indexability gate');

requireAll(sitemapIndex, [
  "'/sitemaps/static.xml'",
  "'/sitemaps/daily-tools.xml'",
  "'/sitemaps/taxonomy.xml'",
  "'/sitemaps/cognitive-lab.xml'",
  "'/sitemaps/specialists.xml'",
  "'/sitemaps/centers.xml'",
  "'/sitemaps/community.xml'",
  '/sitemaps/quick-info.xml?page=${page}',
  '/sitemaps/encyclopedia.xml?page=${page}',
  '/sitemaps/content.xml?page=${page}',
], 'sitemap index');

requireAll(staticSitemap, [
  "path:'/'",
  "path:'/sectors'",
  "path:'/sections'",
  "path:'/magazine/'",
  "path:'/addiction'",
], 'static-owned primary search hubs');
requireAll(quickInfoSitemap, ["path: '/quick-info/'"], 'Quick Info sitemap hub ownership');
requireAll(encyclopediaSitemap, ["path: '/encyclopedia/'"], 'encyclopedia sitemap hub ownership');
requireAll(cognitiveSitemap, ["path: '/cognitive-lab'"], 'cognitive sitemap hub ownership');
requireAll(specialistsSitemap, ["path: '/specialists'"], 'specialists sitemap hub ownership');
requireAll(centersSitemap, ["path: '/centers'"], 'centers sitemap hub ownership');
requireAll(communitySitemap, ["path: '/community'"], 'community sitemap hub ownership');

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
  '"pattern": "healthrenewal.org/*"',
  '"pattern": "www.healthrenewal.org/*"',
], 'staging and production host contract');
requireAll(middleware, [
  "hostname === 'www.healthrenewal.org'",
  "canonical.host = 'healthrenewal.org'",
  'NextResponse.redirect(canonical, 308)',
], 'www canonical redirect');
requireAll(productionWorkflow, [
  'workflow_dispatch:',
  'NEXT_PUBLIC_SITE_URL: https://healthrenewal.org',
  "NEXT_PUBLIC_ALLOW_INDEXING: 'true'",
  'www.healthrenewal.org',
  "grep -q 'workers.dev'",
], 'production domain migration');
if (/^\s*push\s*:/m.test(productionWorkflow)) {
  throw new Error('production cutover guard: deploy-production must remain manual until launch day');
}

requireAll(cutoverWorkflow, [
  'workflow_dispatch:',
  "CUTOVER_MIN_INDEXABLE_URLS: '10000'",
  'node scripts/healthrenewal-cutover-readiness.mjs',
  'node scripts/seo-gate.mjs',
  'node scripts/rich-discovery-gate.mjs',
], '10k no-deploy cutover readiness');
if (/opennextjs-cloudflare\s+deploy|wrangler\s+deploy/i.test(cutoverWorkflow)) {
  throw new Error('10k cutover readiness workflow must never deploy');
}
requireAll(cutoverGate, [
  "CUTOVER_MIN_INDEXABLE_URLS || 10000",
  "CUTOVER BLOCKED",
  "workers\\.dev",
  "https://healthrenewal.org",
], '10k canonical inventory gate');

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
