import crypto from 'node:crypto';

const base = (process.env.SEO_GATE_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const canonicalOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').origin;
const concurrency = Math.max(1, Math.min(24, Number(process.env.SEO_GATE_CONCURRENCY || 10)));
const timeoutMs = Math.max(2000, Number(process.env.SEO_GATE_TIMEOUT_MS || 20000));
const pageAttempts = Math.max(1, Math.min(5, Number(process.env.SEO_GATE_PAGE_ATTEMPTS || 3)));
const retryDelayMs = Math.max(0, Number(process.env.SEO_GATE_PAGE_RETRY_DELAY_MS || 300));
const maxUrls = Math.max(0, Number(process.env.SEO_GATE_MAX_URLS || 0));
const minimumWords = Math.max(80, Number(process.env.SEO_RICH_MIN_WORDS || 100));
const failures = [];
const retryableStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);

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
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function requestErrorMessage(error) {
  if (error?.name === 'AbortError') return `timeout after ${timeoutMs}ms`;
  return error?.message || String(error) || 'unknown request error';
}
async function fetchTextOnce(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Rawafid-Content-Richness-Gate/1.0' },
    });
    return { response, text: await response.text() };
  } finally {
    clearTimeout(timer);
  }
}
async function fetchText(url, context = 'request') {
  let lastError;
  for (let attempt = 1; attempt <= pageAttempts; attempt += 1) {
    try {
      const result = await fetchTextOnce(url);
      if (!retryableStatuses.has(result.response.status) || attempt === pageAttempts) {
        if (attempt > 1 && result.response.ok) {
          console.log(`Content richness gate: recovered ${context} on attempt ${attempt}/${pageAttempts}: ${url}`);
        }
        return result;
      }
      lastError = new Error(`HTTP ${result.response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < pageAttempts) await sleep(retryDelayMs * attempt);
  }
  throw new Error(`${context} failed after ${pageAttempts} attempts: ${url} (${requestErrorMessage(lastError)})`, { cause: lastError });
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
  const rootUrl = `${base}/sitemap.xml`;
  const root = await fetchText(rootUrl, 'root sitemap');
  if (!root.response.ok || !/<sitemapindex\b/i.test(root.text)) {
    throw new Error(`Invalid root sitemap: ${rootUrl} returned ${root.response.status}`);
  }
  const childSitemaps = locs(root.text);
  if (!childSitemaps.length) throw new Error('Root sitemap contains no child sitemaps');
  const urls = [];
  for (const child of childSitemaps) {
    const childUrl = runtimeUrl(child);
    const map = await fetchText(childUrl, `child sitemap ${child}`);
    if (!map.response.ok || !/<urlset\b/i.test(map.text)) {
      throw new Error(`Invalid child sitemap: ${child} returned ${map.response.status}`);
    }
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
  console.log(`Content richness gate: auditing ${urls.length} URLs with concurrency=${concurrency}, attempts=${pageAttempts}, timeoutMs=${timeoutMs}`);
  const hashes = new Map();
  let details = 0;
  let minimumObserved = Infinity;
  let completed = 0;

  await runPool(urls, async (publicUrl) => {
    const parsed = new URL(publicUrl, canonicalOrigin);
    let result;
    try {
      result = await fetchText(runtimeUrl(publicUrl), `content page ${publicUrl}`);
    } catch (error) {
      failures.push(`${publicUrl}: request failed after ${pageAttempts} attempts (${requestErrorMessage(error?.cause || error)})`);
      completed += 1;
      if (completed % 500 === 0 || completed === urls.length) console.log(`Content richness gate: progress ${completed}/${urls.length}`);
      return;
    }
    if (result.response.status !== 200) {
      failures.push(`${publicUrl}: expected 200, got ${result.response.status}`);
    } else {
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
    }
    completed += 1;
    if (completed % 500 === 0 || completed === urls.length) console.log(`Content richness gate: progress ${completed}/${urls.length}`);
  });

  console.log(`Content richness gate: audited=${urls.length}, detailPages=${details}, minDetailWords=${Number.isFinite(minimumObserved) ? minimumObserved : 0}, exactDuplicateBodies=${failures.filter((x) => x.includes('exact normalized')).length}, failures=${failures.length}`);
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
