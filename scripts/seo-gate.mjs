const base = (process.env.SEO_GATE_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const concurrency = Math.max(1, Math.min(32, Number(process.env.SEO_GATE_CONCURRENCY || 6)));
const requestTimeoutMs = Math.max(1000, Number(process.env.SEO_GATE_TIMEOUT_MS || 15000));
const maxUrls = Math.max(0, Number(process.env.SEO_GATE_MAX_URLS || 0));
const expectedOrigin = new URL(base).origin;
const failures = [];
const linkStatusCache = new Map();
const pageAttempts = Math.max(1, Math.min(5, Number(process.env.SEO_GATE_PAGE_ATTEMPTS || 3)));
const pageRetryDelayMs = Math.max(0, Number(process.env.SEO_GATE_PAGE_RETRY_DELAY_MS || 300));
const linkConcurrency = Math.max(1, Math.min(8, Number(process.env.SEO_GATE_LINK_CONCURRENCY || Math.min(concurrency, 3))));
const verificationConcurrency = Math.max(1, Math.min(4, Number(process.env.SEO_GATE_VERIFICATION_CONCURRENCY || 1)));
const verificationDelayMs = Math.max(0, Number(process.env.SEO_GATE_VERIFICATION_DELAY_MS || 1000));
const internalLinkAttempts = Math.max(1, Math.min(5, Number(process.env.SEO_GATE_LINK_ATTEMPTS || pageAttempts)));
const internalLinkRetryDelayMs = Math.max(0, Number(process.env.SEO_GATE_LINK_RETRY_DELAY_MS || pageRetryDelayMs));

function decodeXml(value) {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
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
function samePathAndQuery(value, currentUrl) {
  try {
    const target = new URL(value, currentUrl);
    const current = new URL(currentUrl);
    const normalizePath = (path) => path === '/' ? '/' : path.replace(/\/+$/, '');
    return normalizePath(target.pathname) === normalizePath(current.pathname) && target.search === current.search;
  } catch { return false; }
}
function normalizeLinkCacheKey(value) {
  const url = new URL(value, base);
  url.hash = '';
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
  return url.toString();
}
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function describeError(error) {
  const name = error?.name || 'Error';
  const message = error?.message || 'unknown error';
  const code = error?.cause?.code || error?.code || '';
  return code ? `${name}: ${message} (${code})` : `${name}: ${message}`;
}
function retryableStatus(status) { return status >= 500 && status <= 599; }
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal, headers: { 'user-agent': 'Rawafid-SEO-Gate/1.0', ...(options.headers || {}) } });
  } finally { clearTimeout(timer); }
}
async function getText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Rawafid-SEO-Gate/1.0' },
    });
    return { response, text: await response.text() };
  } finally {
    clearTimeout(timer);
  }
}
async function getTextWithRetry(url, attempts = pageAttempts) {
  let lastError;
  let lastResult;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await getText(url);
      lastResult = result;
      if (!retryableStatus(result.response.status) || attempt === attempts) return result;
      lastError = new Error(`HTTP ${result.response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
    }
    await sleep(pageRetryDelayMs * attempt);
  }
  if (lastResult) return lastResult;
  throw lastError;
}
function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(stripTags(match[1]))).filter(Boolean);
}
async function discoverIndexableUrls() {
  const sitemapUrl = `${base}/sitemap.xml`;
  const { response, text } = await getTextWithRetry(sitemapUrl);
  if (!response.ok) throw new Error(`sitemap index returned ${response.status}`);
  if (!/<sitemapindex\b/i.test(text)) throw new Error('sitemap.xml is not a sitemap index');
  const sitemapUrls = sitemapLocs(text).map((value) => {
    const parsed = new URL(value, sitemapUrl);
    return `${base}${parsed.pathname}${parsed.search}`;
  });
  if (!sitemapUrls.length) throw new Error('sitemap index contains no sitemap URLs');
  const discovered = [];
  for (const sitemap of sitemapUrls) {
    const { response: mapResponse, text: mapXml } = await getTextWithRetry(sitemap);
    if (!mapResponse.ok) { failures.push(`${sitemap}: sitemap returned ${mapResponse.status}`); continue; }
    if (!/<urlset\b/i.test(mapXml)) { failures.push(`${sitemap}: expected urlset`); continue; }
    for (const loc of sitemapLocs(mapXml)) {
      const parsed = new URL(loc, base);
      discovered.push(`${base}${parsed.pathname}${parsed.search}`);
    }
  }
  const unique = [...new Set(discovered)].sort();
  return maxUrls > 0 ? unique.slice(0, maxUrls) : unique;
}
function collectInternalLinks(html, pageUrl) {
  const links = new Set();
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)) {
    const href = match[2].trim();
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    try {
      const url = new URL(href, pageUrl);
      if (url.origin !== expectedOrigin) continue;
      if (/\.(?:png|jpe?g|webp|gif|svg|ico|pdf|zip|xml|txt|json|webmanifest)$/i.test(url.pathname)) continue;
      url.hash = '';
      links.add(url.toString());
    } catch {}
  }
  return [...links];
}
function validateJsonLd(html, pageUrl) {
  const blocks = [...html.matchAll(/<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!blocks.length) { failures.push(`${pageUrl}: missing JSON-LD`); return; }
  let valid = 0;
  for (const [, , raw] of blocks) {
    try {
      const parsed = JSON.parse(raw.trim());
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      if (nodes.some((node) => node && typeof node === 'object' && (node['@context'] || node['@graph']))) valid += 1;
    } catch (error) { failures.push(`${pageUrl}: invalid JSON-LD (${error.message})`); }
  }
  if (!valid) failures.push(`${pageUrl}: JSON-LD has no schema context/graph`);
}
async function auditPage(pageUrl, { deferRetryableFailure = false } = {}) {
  let response, html;
  try {
    ({ response, text: html } = await getTextWithRetry(pageUrl));
  } catch (error) {
    const detail = describeError(error);
    if (deferRetryableFailure) return { links: [], retryable: { url: pageUrl, reason: detail } };
    failures.push(`${pageUrl}: request failed after ${pageAttempts} attempts (${detail})`);
    return { links: [], retryable: null };
  }
  if (retryableStatus(response.status)) {
    const detail = `HTTP ${response.status}`;
    if (deferRetryableFailure) return { links: [], retryable: { url: pageUrl, reason: detail } };
    failures.push(`${pageUrl}: expected 200, got ${response.status} after low-load verification`);
    return { links: [], retryable: null };
  }
  if (response.status !== 200) { failures.push(`${pageUrl}: expected 200, got ${response.status}`); return { links: [], retryable: null }; }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) { failures.push(`${pageUrl}: expected text/html, got ${contentType || 'missing content-type'}`); return { links: [], retryable: null }; }
  const cachedStatus = Promise.resolve({ status: response.status, error: '' });
  linkStatusCache.set(normalizeLinkCacheKey(pageUrl), cachedStatus);
  if (response.url) linkStatusCache.set(normalizeLinkCacheKey(response.url), cachedStatus);
  const title = stripTags((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
  const description = metaContent(html, 'name', 'description');
  const canonical = linkHref(html, 'canonical');
  const robots = metaContent(html, 'name', 'robots').toLowerCase();
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const ogTitle = metaContent(html, 'property', 'og:title');
  const ogDescription = metaContent(html, 'property', 'og:description');
  const ogUrl = metaContent(html, 'property', 'og:url');
  const ogType = metaContent(html, 'property', 'og:type');
  const twitterCard = metaContent(html, 'name', 'twitter:card');
  if (!title) failures.push(`${pageUrl}: missing <title>`); else if (title.length < 8 || title.length > 65) failures.push(`${pageUrl}: title length ${title.length} outside 8..65`);
  if (!description) failures.push(`${pageUrl}: missing meta description`); else if (description.length < 50 || description.length > 170) failures.push(`${pageUrl}: description length ${description.length} outside 50..170`);
  if (!canonical) failures.push(`${pageUrl}: missing canonical`); else if (!samePathAndQuery(canonical, pageUrl)) failures.push(`${pageUrl}: canonical path mismatch (${canonical})`);
  if (robots.includes('noindex')) failures.push(`${pageUrl}: sitemap URL declares noindex`);
  if (robots.includes('nofollow')) failures.push(`${pageUrl}: sitemap URL declares nofollow`);
  if (h1Count !== 1) failures.push(`${pageUrl}: expected exactly one H1, found ${h1Count}`);
  if (!ogTitle) failures.push(`${pageUrl}: missing og:title`);
  if (!ogDescription) failures.push(`${pageUrl}: missing og:description`);
  if (!ogUrl) failures.push(`${pageUrl}: missing og:url`); else if (!samePathAndQuery(ogUrl, pageUrl)) failures.push(`${pageUrl}: og:url path mismatch (${ogUrl})`);
  if (!ogType) failures.push(`${pageUrl}: missing og:type`);
  if (!twitterCard) failures.push(`${pageUrl}: missing twitter:card`);
  validateJsonLd(html, pageUrl);
  return { links: collectInternalLinks(html, pageUrl), retryable: null };
}
async function auditInternalLink(url, { force = false, attempts = internalLinkAttempts } = {}) {
  const cacheKey = normalizeLinkCacheKey(url);
  if (!force && linkStatusCache.has(cacheKey)) return linkStatusCache.get(cacheKey);
  const promise = (async () => {
    let lastError = '';
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        let response = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'follow' });
        if (response.status === 405 || response.status === 501) response = await fetchWithTimeout(url, { method: 'GET', redirect: 'follow' });
        if (retryableStatus(response.status) && attempt < attempts) {
          lastError = `HTTP ${response.status}`;
          await sleep(internalLinkRetryDelayMs * attempt);
          continue;
        }
        return { status: response.status, error: retryableStatus(response.status) ? `HTTP ${response.status}` : '' };
      } catch (error) {
        lastError = describeError(error);
        if (attempt === attempts) return { status: 0, error: lastError };
        await sleep(internalLinkRetryDelayMs * attempt);
      }
    }
    return { status: 0, error: lastError || 'unknown request failure' };
  })();
  linkStatusCache.set(cacheKey, promise);
  return promise;
}
async function runPool(items, worker, poolConcurrency = concurrency) {
  let cursor = 0;
  const results = new Array(items.length);
  async function consume() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(poolConcurrency, items.length || 1) }, consume));
  return results;
}
function isBrokenStatus(status) { return status < 200 || status >= 400; }
function isRetryableLinkResult(result) { return result.status === 0 || retryableStatus(result.status); }
function pushBrokenLinkFailure(url, result, suffix = '') {
  const detail = result.status ? String(result.status) : `request-failed${result.error ? ` (${result.error})` : ''}`;
  failures.push(`${url}: broken internal link status ${detail}${suffix}`);
}
async function main() {
  const started = Date.now();
  const urls = await discoverIndexableUrls();
  if (!urls.length) throw new Error('No indexable URLs discovered from sitemap index');
  console.log(`SEO gate: auditing ${urls.length} sitemap URLs with concurrency=${concurrency}, pageAttempts=${pageAttempts}`);
  const initialPageResults = await runPool(urls, (url) => auditPage(url, { deferRetryableFailure: true }), concurrency);
  const retryablePages = initialPageResults.map((result) => result.retryable).filter(Boolean);
  const pageLinks = initialPageResults.flatMap((result) => result.links || []);
  if (retryablePages.length) {
    console.warn(`SEO gate: ${retryablePages.length} sitemap page requests need low-load verification (concurrency=${verificationConcurrency})`);
    await sleep(verificationDelayMs);
    const verifiedPages = await runPool(
      retryablePages,
      ({ url }) => auditPage(url, { deferRetryableFailure: false }),
      verificationConcurrency,
    );
    pageLinks.push(...verifiedPages.flatMap((result) => result.links || []));
  }
  const allInternalLinks = [...new Set(pageLinks.filter(Boolean))].sort();
  console.log(`SEO gate: checking ${allInternalLinks.length} unique internal links with concurrency=${linkConcurrency}, attempts=${internalLinkAttempts}`);
  const initialLinkStatuses = await runPool(
    allInternalLinks,
    async (url) => [url, await auditInternalLink(url)],
    linkConcurrency,
  );
  const retryableLinks = [];
  for (const [url, result] of initialLinkStatuses) {
    if (isRetryableLinkResult(result)) retryableLinks.push(url);
    else if (isBrokenStatus(result.status)) pushBrokenLinkFailure(url, result);
  }
  if (retryableLinks.length) {
    console.warn(`SEO gate: ${retryableLinks.length} internal-link requests need low-load verification (concurrency=${verificationConcurrency})`);
    await sleep(verificationDelayMs);
    const verifiedLinkStatuses = await runPool(
      retryableLinks,
      async (url) => [url, await auditInternalLink(url, { force: true, attempts: pageAttempts })],
      verificationConcurrency,
    );
    for (const [url, result] of verifiedLinkStatuses) {
      if (isBrokenStatus(result.status)) pushBrokenLinkFailure(url, result, ' after low-load verification');
    }
  }
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`SEO gate summary: pages=${urls.length}, internalLinks=${allInternalLinks.length}, retryablePages=${retryablePages.length}, retryableLinks=${retryableLinks.length}, failures=${failures.length}, seconds=${elapsed}`);
  if (failures.length) {
    for (const failure of failures.slice(0, 300)) console.error(`FAIL ${failure}`);
    if (failures.length > 300) console.error(`FAIL ... ${failures.length - 300} additional failures omitted`);
    process.exit(1);
  }
  console.log('Rawafid full sitemap SEO gate passed.');
}
main().catch((error) => { console.error('SEO gate fatal:', error); process.exit(1); });
