import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const seo = read('scripts/seo-gate.mjs');
const discovery = read('scripts/rich-discovery-gate.mjs');
const rich = read('scripts/content-richness-gate.mjs');
const cache = read('scripts/seo-shared-html-cache.mjs');
const quality = read('.github/workflows/quality.yml');
const integration = read('.github/workflows/seo-gate-full-integration.yml');

const fail = (message) => {
  console.error(`SEO GATE RELIABILITY CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

for (const token of ['SEO_GATE_PAGE_CONCURRENCY','SEO_GATE_LINK_CONCURRENCY','SEO_GATE_VERIFICATION_CONCURRENCY','SEO_GATE_VERIFICATION_DELAY_MS']) {
  if (!seo.includes(token)) fail(`seo-gate missing ${token}`);
}
if (!seo.includes('writeSharedHtml(pageUrl, response, html)')) fail('SEO gate must populate shared HTML cache after successful page fetch');
if (!seo.includes('retryableStatuses') || !seo.includes('low-load verification')) fail('SEO gate must retain transient-only low-load verification');
if (!seo.includes('reports/seo-gate-report.json')) fail('SEO diagnostic report path must be preserved');
if (!seo.includes('status < 200 || status >= 400')) fail('persistent non-success internal links must remain failures');

for (const token of ['readSharedHtml', 'SHARED_CRAWL_USER_AGENT', 'SEO_RICH_CONCURRENCY', 'cacheHits', "require('MedicalCondition', 'MedicalWebPage')", "require('DefinedTerm', 'WebPage')"]) {
  if (!discovery.includes(token)) fail(`rich discovery cache/schema contract missing ${token}`);
}
if (!discovery.includes('fetchCrawlerHeadWithCurl')) fail('rich discovery crawler-head fallback must remain available');

if (!rich.includes('readSharedHtml') || !rich.includes('writeSharedHtml')) fail('content richness must reuse and backfill the shared HTML cache');
if (!rich.includes('SEO_RICH_CONCURRENCY')) fail('content richness must have independently bounded concurrency');
for (const token of ['thin visible main content','detail page lacks H2/H3 structure','exact normalized main-content duplicate','ScholarlyArticle lacks citation/isBasedOn source signal']) {
  if (!rich.includes(token)) fail(`content richness coverage weakened: missing ${token}`);
}

for (const token of ['response.status !== 200', "contentType.includes('text/html')", 'SHARED_CRAWL_USER_AGENT', 'gzipAsync', 'bingbot/2.0']) {
  if (!cache.includes(token)) fail(`shared cache safety boundary missing ${token}`);
}

for (const token of ["SEO_GATE_PAGE_CONCURRENCY: '4'","SEO_GATE_LINK_CONCURRENCY: '2'","SEO_GATE_VERIFICATION_CONCURRENCY: '1'","SEO_GATE_VERIFICATION_DELAY_MS: '1000'","SEO_RICH_CONCURRENCY: '4'",'SEO_SHARED_HTML_CACHE_DIR: /tmp/rawafid-seo-html-cache']) {
  if (!quality.includes(token)) fail(`quality workflow missing ${token}`);
}

const fullSeo = quality.match(/- name: Full sitemap SEO gate[\s\S]*?(?=\n      - name:)/)?.[0] || '';
const discoveryStep = quality.match(/- name: Rich results and discovery gate \(advisory\)[\s\S]*?(?=\n      - name:)/)?.[0] || '';
const richness = quality.match(/- name: Content richness and duplicate-body gate[\s\S]*?(?=\n      - name:)/)?.[0] || '';
for (const [name, step] of [['Full Sitemap SEO', fullSeo], ['Rich Discovery', discoveryStep], ['Content Richness', richness]]) {
  if (!step.includes("if: github.event_name == 'push'")) fail(`${name} must not run inside pull-request Quality; the release crawl belongs to Full Integration`);
}
if (!fullSeo.includes('continue-on-error: true')) fail('Full Sitemap SEO must remain advisory on direct pushes');
if (!discoveryStep.includes('continue-on-error: true')) fail('Rich Discovery must remain advisory on direct pushes');
if (richness.includes('continue-on-error: true')) fail('Content Richness must remain blocking on direct pushes');
if (!richness.includes('node scripts/content-richness-gate.mjs')) fail('Content Richness blocking command must remain present');

for (const token of ['types: [ready_for_review, synchronize, reopened]', 'if: github.event.pull_request.draft == false', 'node scripts/seo-gate.mjs','node scripts/rich-discovery-gate.mjs','node scripts/content-richness-gate.mjs',"grep -Eq 'cacheHits=[1-9][0-9]*' /tmp/rawafid-rich-discovery.log","grep -Eq 'cacheHits=[1-9][0-9]*' /tmp/rawafid-content-richness.log"]) {
  if (!integration.includes(token)) fail(`full integration release/cache contract missing ${token}`);
}
if (/\n  push:/.test(integration)) fail('Full Integration must not duplicate the direct-push full crawl already owned by Quality');
const activityMatch = integration.match(/types:\s*\[([^\]]+)\]/);
const activities = activityMatch ? activityMatch[1].split(',').map((value) => value.trim()).filter(Boolean) : [];
if (activities.includes('opened')) fail('Full Integration must not launch its heavy crawl when a draft PR is first opened');
for (const name of ['Full sitemap SEO crawl','Rich discovery using the same audited HTML','Content richness using the same audited HTML']) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const step = integration.match(new RegExp(`- name: ${escaped}[\\s\\S]*?(?=\\n      - name:)`))?.[0] || '';
  if (!step) fail(`Full Integration missing blocking release step: ${name}`);
  if (step.includes('continue-on-error: true')) fail(`Full Integration release step must be blocking: ${name}`);
}

if (!process.exitCode) console.log('SEO gate reliability contract passed: the full corpus is crawled once per PR release stage, shared HTML is reused downstream, and direct pushes retain full-site protection.');
