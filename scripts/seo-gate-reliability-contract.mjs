import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const seo = read('scripts/seo-gate.mjs');
const discovery = read('scripts/rich-discovery-gate.mjs');
const rich = read('scripts/content-richness-gate.mjs');
const cache = read('scripts/seo-shared-html-cache.mjs');
const quality = read('.github/workflows/quality.yml');

const fail = (message) => {
  console.error(`SEO GATE RELIABILITY CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

for (const token of [
  'SEO_GATE_PAGE_CONCURRENCY',
  'SEO_GATE_LINK_CONCURRENCY',
  'SEO_GATE_VERIFICATION_CONCURRENCY',
  'SEO_GATE_VERIFICATION_DELAY_MS',
]) {
  if (!seo.includes(token)) fail(`seo-gate missing ${token}`);
}

if (!seo.includes('writeSharedHtml(pageUrl, response, html)')) fail('SEO gate must populate shared HTML cache only after a successful page audit fetch');
if (!seo.includes('retryableStatuses') || !seo.includes('low-load verification')) fail('SEO gate must retain transient-only low-load verification');
if (!seo.includes('reports/seo-gate-report.json')) fail('SEO diagnostic report path must be preserved');
if (!seo.includes('status < 200 || status >= 400')) fail('persistent non-success internal links must remain failures');

if (!discovery.includes("readSharedHtml(url)")) fail('rich discovery must reuse the exact audited HTML representation before issuing a new page request');
if (!discovery.includes('const crawlerUserAgent = SHARED_CRAWL_USER_AGENT')) fail('rich discovery and the shared cache must use one HTML-limited crawler representation');
for (const token of ['missing canonical', 'missing og:image', 'html lang is not ar', 'html dir is not rtl', "require('MedicalCondition', 'MedicalWebPage')", 'rendered image missing alt text']) {
  if (!discovery.includes(token)) fail(`rich discovery coverage weakened: missing ${token}`);
}

if (!rich.includes('readSharedHtml') || !rich.includes('writeSharedHtml')) fail('content richness must reuse and backfill the shared HTML cache');
if (!rich.includes('SEO_RICH_CONCURRENCY')) fail('content richness must have an independently bounded concurrency');
for (const token of ['thin visible main content', 'detail page lacks H2/H3 structure', 'exact normalized main-content duplicate', 'ScholarlyArticle lacks citation/isBasedOn source signal']) {
  if (!rich.includes(token)) fail(`content richness coverage weakened: missing ${token}`);
}

for (const token of ['response.status !== 200', "contentType.includes('text/html')", 'SHARED_CRAWL_USER_AGENT', 'gzipAsync', 'bingbot/2.0']) {
  if (!cache.includes(token)) fail(`shared cache safety boundary missing ${token}`);
}

for (const token of [
  "SEO_GATE_PAGE_CONCURRENCY: '4'",
  "SEO_GATE_LINK_CONCURRENCY: '2'",
  "SEO_GATE_VERIFICATION_CONCURRENCY: '1'",
  "SEO_GATE_VERIFICATION_DELAY_MS: '1000'",
  "SEO_RICH_CONCURRENCY: '4'",
  'SEO_SHARED_HTML_CACHE_DIR: /tmp/rawafid-seo-html-cache',
]) {
  if (!quality.includes(token)) fail(`quality workflow missing ${token}`);
}

const fullSeo = quality.match(/- name: Full sitemap SEO gate[\s\S]*?(?=\n      - name:)/)?.[0] || '';
const richDiscovery = quality.match(/- name: Rich results and discovery gate \(advisory\)[\s\S]*?(?=\n      - name:)/)?.[0] || '';
const richness = quality.match(/- name: Content richness and duplicate-body gate[\s\S]*?(?=\n      - name:)/)?.[0] || '';
if (!fullSeo.includes('continue-on-error: true')) fail('Full Sitemap SEO advisory semantics must remain unchanged');
if (!richDiscovery.includes('continue-on-error: true')) fail('Rich Discovery advisory semantics must remain unchanged');
if (!richDiscovery.includes('node scripts/rich-discovery-gate.mjs')) fail('Rich Discovery advisory command must remain present');
if (richness.includes('continue-on-error: true')) fail('Content Richness must remain blocking');
if (!richness.includes('node scripts/content-richness-gate.mjs')) fail('Content Richness blocking command must remain present');

if (!process.exitCode) console.log('SEO gate reliability contract passed: one HTML-limited representation is reused across discovery/richness without reduced coverage or blocking semantics.');
