import crypto from 'node:crypto';
import {
  SEO_SHARED_USER_AGENT,
  getSeoSharedCacheStats,
  readSeoSharedCache,
  sharedCacheRecordToFetchResult,
  writeSeoSharedCache,
} from './seo-shared-cache.mjs';

const base = (process.env.SEO_GATE_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const canonicalOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').origin;
const concurrency = Math.max(1, Math.min(24, Number(process.env.SEO_GATE_CONCURRENCY || 10)));
const timeoutMs = Math.max(2000, Number(process.env.SEO_GATE_TIMEOUT_MS || 20000));
const maxUrls = Math.max(0, Number(process.env.SEO_GATE_MAX_URLS || 0));
const minimumWords = Math.max(80, Number(process.env.SEO_RICH_MIN_WORDS || 100));
const failures = [];

function decode(value = '') {
  return String(value)
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}
function stripTags(value = '') {
  return decode(String(value).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}
function locs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((m) => stripTags(m[1])).filter(Boolean);
}
async function fetchText(url) {
  const cached = await readSeoSharedCache(url, SEO_SHARED_USER_AGENT);
  if (cached) return sharedCacheRecordToFetchResult(cached);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': SEO_SHARED_USER_AGENT } });
    const text = await response.text();
    if (response.status >= 200 && response.status < 400) {
      await writeSeoSharedCache(url, {
        userAgent: SEO_SHARED_USER_AGENT,
        status: response.status,
        finalUrl: response.url || url,
        contentType: response.headers.get('content-type') || '',
        text,
      });
    }
    return { response, text, cacheHit: false };
  } finally { clearTimeout(timer); }
}
function runtimeUrl(publicUrl) {
  const parsed = new URL(publicUrl, canonicalOrigin);
  if (parsed.origin !== canonicalOrigin) throw new Error(`Sitemap escaped canonical origin: ${publicUrl}`);
  return `${base}${parsed.pathname}${parsed.search}`;
}
function isRichContentPath(pathname) {
  return /^\/(content|quick-info|encyclopedia|magazine|care-guides|evidence-guides)(\/|$)/.test(pathname);
}
function isDetailPath(pathname) {
  if (/^\/content\/[^/]+\/?$/.test(pathname)) return true;
  if (/^\/quick-info\/[^/]+\/?$/.test(pathname)) return true;
  if (/^\/encyclopedia\/[^/]+\/?$/.test(pathname) && !pathname.startsWith('/encyclopedia/index/')) return true;
  if (/^\/care-guides\/[^/]+\/?$/.test(pathname)) return true;
  if (/^\/evidence-guides\/[^/]+\/?$/.test(pathname)) return true;
  if (/^\/magazine\/[^/]+\/?$/.test(pathname)) return true;
  return false;
}
function mainText(html) {
  const raw = (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) || [,''])[1];
  if (!raw) return '';
  return stripTags(raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' '));
}
function wordCount(value) {
  if (!value) return 0;
  return value.split(/\s+/u).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}
function normalizedContent(value) {
  return value
    .toLocaleLowerCase('ar')
    .replace(/[ًٌٍَُِّْـٰ]/gu, '')
    .replace(/[أإآٱ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}
function schemaObjects(html) {
  const out = [];
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { out.push(JSON.parse(match[2].trim())); } catch {}
  }
  return out;
}
function walkSchema(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach((item) => walkSchema(item, visit)); return; }
  visit(node);
  for (const value of Object.values(node)) walkSchema(value, visit);
}
function scholarlyHasSource(html) {
  let scholarly = false;
  let sourced = false;
  for (const root of schemaObjects(html)) {
    walkSchema(root, (node) => {
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      if (types.includes('ScholarlyArticle')) {
        scholarly = true;
        if (node.citation || node.isBasedOn) sourced = true;
      }
    });
  }
  return !scholarly || sourced;
}
async function discover() {
  const root = await fetchText(`${base}/sitemap.xml`);
  if (!root.response.ok || !/<sitemapindex\b/i.test(root.text)) throw new Error('Invalid root sitemap');
  const urls = [];
  for (const child of locs(root.text)) {
    const map = await fetchText(runtimeUrl(child));
    if (!map.response.ok || !/<urlset\b/i.test(map.text)) throw new Error(`Invalid child sitemap: ${child}`);
    urls.push(...locs(map.text));
  }
  const unique = [...new Set(urls)].filter((value) => {
    try { return isRichContentPath(new URL(value, canonicalOrigin).pathname); } catch { return false; }
  }).sort();
  return maxUrls > 0 ? unique.slice(0, maxUrls) : unique;
}
async function runPool(items, worker) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length || 1) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      await worker(items[i], i);
    }
  }));
}

async function main() {
  const urls = await discover();
  if (!urls.length) throw new Error('No rich-content URLs discovered');
  const hashes = new Map();
  let details = 0;
  let minimumObserved = Infinity;

  await runPool(urls, async (publicUrl) => {
    const parsed = new URL(publicUrl, canonicalOrigin);
    const result = await fetchText(runtimeUrl(publicUrl));
    if (result.response.status !== 200) {
      failures.push(`${publicUrl}: expected 200, got ${result.response.status}`);
      return;
    }
    const text = mainText(result.text);
    const words = wordCount(text);
    if (isDetailPath(parsed.pathname)) {
      details += 1;
      minimumObserved = Math.min(minimumObserved, words);
      if (words < minimumWords) failures.push(`${publicUrl}: thin visible main content (${words} words; minimum ${minimumWords})`);
      const headingCount = (result.text.match(/<h[23]\b/gi) || []).length;
      if (headingCount < 1) failures.push(`${publicUrl}: detail page lacks H2/H3 structure`);
      const normalized = normalizedContent(text);
      if (normalized) {
        const hash = crypto.createHash('sha256').update(normalized).digest('hex');
        const previous = hashes.get(hash);
        if (previous && previous !== publicUrl) failures.push(`${publicUrl}: exact normalized main-content duplicate of ${previous}`);
        else hashes.set(hash, publicUrl);
      }
    }
    if (!scholarlyHasSource(result.text)) failures.push(`${publicUrl}: ScholarlyArticle lacks citation/isBasedOn source signal`);
  });

  const cache = getSeoSharedCacheStats();
  console.log(`Content richness gate: audited=${urls.length}, detailPages=${details}, minDetailWords=${Number.isFinite(minimumObserved) ? minimumObserved : 0}, exactDuplicateBodies=${failures.filter((x) => x.includes('exact normalized')).length}, failures=${failures.length}, sharedCacheHits=${cache.hits}, sharedCacheWrites=${cache.writes}`);
  if (failures.length) {
    failures.slice(0, 500).forEach((failure) => console.error(`RICHNESS FAIL: ${failure}`));
    if (failures.length > 500) console.error(`RICHNESS FAIL: ${failures.length - 500} additional failures omitted`);
    process.exit(1);
  }
  console.log('Rawafid content richness gate passed.');
}

main().catch((error) => {
  console.error('Content richness gate fatal:', error);
  process.exit(1);
});
