const base = (process.env.SEO_GATE_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const canonicalOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || base).origin;
const concurrency = Math.max(1, Math.min(24, Number(process.env.SEO_GATE_CONCURRENCY || 6)));
const timeoutMs = Math.max(2000, Number(process.env.SEO_GATE_TIMEOUT_MS || 15000));
const maxUrls = Math.max(0, Number(process.env.SEO_GATE_MAX_URLS || 0));
const failures = [];

function decodeXml(value) {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}
function stripTags(value = '') { return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? match[2].trim() : '';
}
function metaContent(html, key, value) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) if (attr(tag, key).toLowerCase() === value.toLowerCase()) return attr(tag, 'content');
  return '';
}
function linkHref(html, rel) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) if (attr(tag, 'rel').toLowerCase().split(/\s+/).includes(rel.toLowerCase())) return attr(tag, 'href');
  return '';
}
function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(stripTags(match[1]))).filter(Boolean);
}
async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'Rawafid-Rich-Discovery-Gate/1.1' } });
    return { response, text: await response.text() };
  } finally { clearTimeout(timer); }
}
async function discoverUrls() {
  const index = await fetchText(`${base}/sitemap.xml`);
  if (!index.response.ok || !/<sitemapindex\b/i.test(index.text)) throw new Error('Invalid sitemap index');
  const maps = sitemapLocs(index.text);
  const urls = [];
  for (const map of maps) {
    const parsed = new URL(map, canonicalOrigin);
    const result = await fetchText(`${base}${parsed.pathname}${parsed.search}`);
    if (!result.response.ok || !/<urlset\b/i.test(result.text)) {
      failures.push(`${map}: invalid sitemap child`);
      continue;
    }
    urls.push(...sitemapLocs(result.text));
  }
  const normalized = [...new Set(urls.flatMap((value) => {
    try {
      const parsed = new URL(value, canonicalOrigin);
      if (parsed.origin !== canonicalOrigin) return [];
      return [`${base}${parsed.pathname}${parsed.search}`];
    } catch { return []; }
  }))].sort();
  return maxUrls > 0 ? normalized.slice(0, maxUrls) : normalized;
}
function schemaTypes(html) {
  const types = new Set();
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[2].trim());
      const visit = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) { node.forEach(visit); return; }
        const type = node['@type'];
        if (typeof type === 'string') types.add(type);
        else if (Array.isArray(type)) type.filter((item) => typeof item === 'string').forEach((item) => types.add(item));
        if (Array.isArray(node['@graph'])) node['@graph'].forEach(visit);
      };
      visit(parsed);
    } catch {}
  }
  return types;
}
function isContentLike(pathname) {
  return /^\/(content|magazine|quick-info|encyclopedia|evidence-guides|care-guides)(\/|$)/.test(pathname);
}
function hasPageSchema(types) {
  return ['WebPage','CollectionPage','Article','NewsArticle','ScholarlyArticle','MedicalWebPage','ProfilePage','FAQPage','DefinedTerm','DefinedTermSet','MedicalCondition'].some((type) => types.has(type));
}
function requireTypes(url, pathname, types) {
  const require = (...expected) => {
    for (const type of expected) if (!types.has(type)) failures.push(`${url}: ${pathname} requires ${type} structured data (found: ${[...types].join(', ') || 'none'})`);
  };
  const requireAny = (...expected) => {
    if (!expected.some((type) => types.has(type))) failures.push(`${url}: ${pathname} requires one of ${expected.join(', ')} structured data types (found: ${[...types].join(', ') || 'none'})`);
  };

  if (['/sectors','/sectors/','/sections','/sections/','/specialists','/specialists/','/centers','/centers/','/quick-info','/quick-info/','/encyclopedia','/encyclopedia/','/magazine','/magazine/'].includes(pathname)) {
    require('CollectionPage');
    return;
  }
  if (/^\/sectors\/[^/]+\/?$/.test(pathname)) { require('CollectionPage'); return; }
  if (/^\/sections\/[^/]+\/?$/.test(pathname)) { require('CollectionPage'); return; }
  if (/^\/specialists\/[^/]+\/?$/.test(pathname)) { require('ProfilePage', 'Person'); return; }
  if (/^\/centers\/[^/]+\/?$/.test(pathname)) {
    require('ProfilePage');
    requireAny('MedicalClinic','Hospital','EducationalOrganization','Organization','MedicalOrganization');
    return;
  }
  if (/^\/magazine\/.+/.test(pathname)) { require('ScholarlyArticle'); return; }
  if (/^\/quick-info\/[^/]+\/?$/.test(pathname)) { require('Article', 'MedicalWebPage'); return; }
  if (/^\/encyclopedia\/(?!index(?:\/|$))[^/]+\/?$/.test(pathname)) { require('MedicalWebPage', 'MedicalCondition'); return; }

  if (isContentLike(pathname) && !hasPageSchema(types)) {
    failures.push(`${url}: content-like page lacks page/content structured-data type (${[...types].join(', ') || 'none'})`);
  }
}
async function audit(url) {
  let result;
  try { result = await fetchText(url); }
  catch (error) { failures.push(`${url}: request failed (${error?.message || error})`); return; }
  if (result.response.status !== 200) { failures.push(`${url}: expected 200, got ${result.response.status}`); return; }
  const html = result.text;
  const htmlTag = (html.match(/<html\b[^>]*>/i) || [''])[0];
  if (attr(htmlTag, 'lang').toLowerCase() !== 'ar') failures.push(`${url}: html lang is not ar`);
  if (attr(htmlTag, 'dir').toLowerCase() !== 'rtl') failures.push(`${url}: html dir is not rtl`);

  const canonical = linkHref(html, 'canonical');
  if (canonical) {
    try {
      const parsed = new URL(canonical, canonicalOrigin);
      if (parsed.origin !== canonicalOrigin) failures.push(`${url}: canonical leaves Rawafid origin (${canonical})`);
    } catch { failures.push(`${url}: invalid canonical (${canonical})`); }
  }

  const head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i) || [,''])[1];
  if (/healthrenewal\.org/i.test(head)) failures.push(`${url}: legacy healthrenewal.org leaked into <head>`);

  const ogImage = metaContent(html, 'property', 'og:image');
  const twitterImage = metaContent(html, 'name', 'twitter:image');
  const ogSiteName = metaContent(html, 'property', 'og:site_name');
  if (!ogImage) failures.push(`${url}: missing og:image`);
  if (!twitterImage) failures.push(`${url}: missing twitter:image`);
  if (!ogSiteName) failures.push(`${url}: missing og:site_name`);

  const robots = `${metaContent(html, 'name', 'robots')},${metaContent(html, 'name', 'googlebot')}`.toLowerCase().replace(/\s+/g, '');
  if (robots.includes('noindex')) failures.push(`${url}: sitemap URL renders noindex`);
  const googlebot = metaContent(html, 'name', 'googlebot').toLowerCase().replace(/\s+/g, '');
  if (googlebot && !googlebot.includes('max-image-preview:large')) failures.push(`${url}: googlebot lacks max-image-preview:large`);
  if (googlebot && !googlebot.includes('max-snippet:-1')) failures.push(`${url}: googlebot lacks max-snippet:-1`);

  for (const image of html.match(/<img\b[^>]*>/gi) || []) {
    const alt = attr(image, 'alt');
    if (!alt) failures.push(`${url}: rendered image missing alt text`);
  }

  const types = schemaTypes(html);
  const pathname = new URL(url).pathname;
  requireTypes(url, pathname, types);
}
async function runPool(items, worker) {
  let cursor = 0;
  async function consume() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length || 1) }, consume));
}
async function verifyDiscoveryFiles() {
  const checks = [
    ['/robots.txt', /Sitemap:/i],
    ['/sitemap.xml', /<sitemapindex\b/i],
    ['/llms.txt', /^#\s*روافد/m],
    ['/feed.xml', /<rss\b/i],
    ['/b7f31d3c5a694e2f8b04c71d9a6e53f2.txt', /^b7f31d3c5a694e2f8b04c71d9a6e53f2\s*$/],
  ];
  for (const [path, pattern] of checks) {
    try {
      const { response, text } = await fetchText(`${base}${path}`);
      if (!response.ok || !pattern.test(text)) failures.push(`${path}: public discovery endpoint invalid (${response.status})`);
    } catch (error) { failures.push(`${path}: discovery endpoint request failed (${error?.message || error})`); }
  }
  try {
    const { text } = await fetchText(`${base}/robots.txt`);
    for (const crawler of ['Googlebot','Bingbot','OAI-SearchBot','Claude-SearchBot','PerplexityBot']) {
      if (!text.includes(crawler)) failures.push(`/robots.txt: missing explicit ${crawler} rule`);
    }
  } catch {}
}
async function main() {
  await verifyDiscoveryFiles();
  const urls = await discoverUrls();
  if (!urls.length) throw new Error('No sitemap URLs discovered');
  console.log(`Rich discovery gate: auditing ${urls.length} indexable URLs`);
  await runPool(urls, audit);
  console.log(`Rich discovery gate summary: pages=${urls.length}, failures=${failures.length}`);
  if (failures.length) {
    failures.slice(0, 500).forEach((failure) => console.error(`FAIL ${failure}`));
    if (failures.length > 500) console.error(`FAIL ... ${failures.length - 500} additional failures omitted`);
    process.exit(1);
  }
  console.log('Rawafid rich discovery gate passed.');
}
main().catch((error) => { console.error('Rich discovery gate fatal:', error); process.exit(1); });
