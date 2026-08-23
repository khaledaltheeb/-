const ORIGIN = (process.env.PRODUCTION_ORIGIN || 'https://healthrenewal.org').replace(/\/$/, '');
const EXPECTED_HOST = new URL(ORIGIN).hostname;
const EXPECTED_HOME_TITLE = 'روافد | الصحة النفسية والتربية الخاصة وسرطان الأطفال';
const MIN_URLS = Number(process.env.MIN_LIVE_INDEXABLE_URLS || '3806');
const CONCURRENCY = Math.max(1, Number(process.env.INDEXABILITY_CONCURRENCY || '4'));
const TIMEOUT_MS = Math.max(3000, Number(process.env.INDEXABILITY_TIMEOUT_MS || '30000'));
const PACING_MS = Math.max(0, Number(process.env.INDEXABILITY_PACING_MS || '100'));
const MAX_ATTEMPTS = Math.max(1, Number(process.env.INDEXABILITY_ATTEMPTS || '5'));
const USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function xmlLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => decodeXml(match[1].trim()));
}

function metaDirectives(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const values = [];
  for (const tag of tags) {
    const nameMatch = tag.match(/\bname\s*=\s*["']([^"']+)["']/i);
    if (!nameMatch || nameMatch[1].trim().toLowerCase() !== name) continue;
    const contentMatch = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
    if (contentMatch) values.push(contentMatch[1].toLowerCase());
  }
  return values;
}

function canonicalHref(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase().split(/\s+/) || [];
    if (!rel.includes('canonical')) continue;
    return tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] || null;
  }
  return null;
}

function documentTitle(html) {
  return html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() || '';
}

function homepageCanonicalIsValid(canonical) {
  if (!canonical) return false;
  try {
    const url = new URL(canonical, ORIGIN);
    return url.protocol === 'https:'
      && url.hostname === EXPECTED_HOST
      && (url.pathname === '/' || url.pathname === '')
      && !url.search
      && !url.hash;
  } catch {
    return false;
  }
}

function retryDelay(response, attempt) {
  const retryAfter = response?.headers?.get('retry-after');
  if (retryAfter && /^\d+$/.test(retryAfter.trim())) {
    return Math.min(30000, Number(retryAfter.trim()) * 1000);
  }
  return Math.min(10000, 600 * (2 ** (attempt - 1))) + Math.floor(Math.random() * 250);
}

async function fetchText(url, { attempts = MAX_ATTEMPTS } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': USER_AGENT,
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timer);

      if (RETRYABLE_STATUS.has(response.status) && attempt < attempts) {
        await response.body?.cancel().catch(() => {});
        await sleep(retryDelay(response, attempt));
        continue;
      }

      const text = await response.text();
      return { response, text, attemptsUsed: attempt };
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < attempts) {
        await sleep(Math.min(10000, 600 * (2 ** (attempt - 1))) + Math.floor(Math.random() * 250));
      }
    }
  }
  throw lastError;
}

async function collectSitemapUrls() {
  const pending = [`${ORIGIN}/sitemap.xml`];
  const visitedSitemaps = new Set();
  const urls = new Set();

  while (pending.length) {
    const sitemapUrl = pending.shift();
    if (!sitemapUrl || visitedSitemaps.has(sitemapUrl)) continue;
    visitedSitemaps.add(sitemapUrl);

    const { response, text } = await fetchText(sitemapUrl);
    if (!response.ok) throw new Error(`Sitemap ${sitemapUrl} returned HTTP ${response.status}`);
    if (/workers\.dev|rawafid-platform-staging/i.test(text)) {
      throw new Error(`Staging hostname leaked into sitemap ${sitemapUrl}`);
    }

    const locs = xmlLocs(text);
    if (/<sitemapindex\b/i.test(text)) {
      for (const loc of locs) pending.push(loc);
      continue;
    }
    if (!/<urlset\b/i.test(text)) throw new Error(`Unrecognized sitemap XML at ${sitemapUrl}`);
    for (const loc of locs) urls.add(loc);
  }

  return { urls: [...urls], sitemapCount: visitedSitemaps.size };
}

async function verifyHomepageUrl(url, label) {
  const { response, text } = await fetchText(url);
  if (!response.ok) throw new Error(`${label} homepage returned HTTP ${response.status}`);
  if (response.url && new URL(response.url).hostname !== EXPECTED_HOST) {
    throw new Error(`${label} homepage redirected away from ${EXPECTED_HOST}: ${response.url}`);
  }

  const headerRobots = response.headers.get('x-robots-tag') || '';
  const robots = metaDirectives(text, 'robots');
  const googlebot = metaDirectives(text, 'googlebot');
  if (/\bnoindex\b/i.test(headerRobots)) throw new Error(`${label} homepage X-Robots-Tag contains noindex: ${headerRobots}`);
  if (robots.some((value) => /\bnoindex\b/i.test(value))) throw new Error(`${label} homepage meta robots contains noindex`);
  if (googlebot.some((value) => /\bnoindex\b/i.test(value))) throw new Error(`${label} homepage meta googlebot contains noindex`);

  const canonical = canonicalHref(text);
  if (!homepageCanonicalIsValid(canonical)) throw new Error(`${label} homepage canonical is ${canonical || 'missing'}, expected the production root ${ORIGIN}`);
  if (/workers\.dev|rawafid-platform-staging/i.test(text)) throw new Error(`${label} homepage leaks the staging hostname`);

  const title = documentTitle(text);
  if (title !== EXPECTED_HOME_TITLE) throw new Error(`${label} homepage title is ${JSON.stringify(title)}, expected ${JSON.stringify(EXPECTED_HOME_TITLE)}`);
  console.log(`${label} homepage OK: HTTP ${response.status}; title=${JSON.stringify(title)}; canonical=${canonical}; meta robots=${JSON.stringify(robots)}; meta googlebot=${JSON.stringify(googlebot)}; X-Robots-Tag=${JSON.stringify(headerRobots || '(none)')}.`);
}

async function verifyHomepage() {
  await verifyHomepageUrl(`${ORIGIN}/`, 'Bare');
  await verifyHomepageUrl(`${ORIGIN}/?indexability-live=${Date.now()}`, 'Cache-busted');
}

async function verifyRobots() {
  const { response, text } = await fetchText(`${ORIGIN}/robots.txt?indexability-live=${Date.now()}`);
  if (!response.ok) throw new Error(`robots.txt returned HTTP ${response.status}`);
  if (/^\s*Disallow:\s*\/\s*$/im.test(text)) throw new Error('robots.txt globally disallows crawling');
  if (!text.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) throw new Error('robots.txt does not advertise the canonical production sitemap');
  if (/workers\.dev|rawafid-platform-staging/i.test(text)) throw new Error('Staging hostname leaked into robots.txt');
  console.log('robots.txt OK: no global crawl block and canonical production sitemap is advertised.');
}

async function verifyPage(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return `invalid sitemap URL: ${url}`;
  }
  if (parsed.hostname !== EXPECTED_HOST) return `foreign sitemap hostname: ${url}`;

  try {
    const { response, text } = await fetchText(url);
    if (!response.ok) return `HTTP ${response.status}: ${url}`;
    if (new URL(response.url).hostname !== EXPECTED_HOST) return `redirected off canonical host: ${url} -> ${response.url}`;

    const xRobots = response.headers.get('x-robots-tag') || '';
    if (/\bnoindex\b/i.test(xRobots)) return `X-Robots-Tag noindex: ${url}`;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !/^\s*<!doctype html/i.test(text) && !/<html\b/i.test(text)) return null;

    if (metaDirectives(text, 'robots').some((value) => /\bnoindex\b/i.test(value))) return `meta robots noindex: ${url}`;
    if (metaDirectives(text, 'googlebot').some((value) => /\bnoindex\b/i.test(value))) return `meta googlebot noindex: ${url}`;
    if (/workers\.dev|rawafid-platform-staging/i.test(text)) return `staging hostname leaked into HTML: ${url}`;

    const canonical = canonicalHref(text);
    if (!canonical) return `missing canonical: ${url}`;
    let canonicalUrl;
    try {
      canonicalUrl = new URL(canonical, ORIGIN);
    } catch {
      return `invalid canonical ${canonical}: ${url}`;
    }
    if (canonicalUrl.hostname !== EXPECTED_HOST) return `canonical points off production host (${canonical}): ${url}`;
    return null;
  } catch (error) {
    return `fetch failed (${error?.message || error}): ${url}`;
  }
}

function failureKind(failure) {
  if (failure.startsWith('HTTP ')) return failure.split(':', 1)[0];
  if (failure.startsWith('X-Robots-Tag noindex')) return 'X-Robots-Tag noindex';
  if (failure.startsWith('meta robots noindex')) return 'meta robots noindex';
  if (failure.startsWith('meta googlebot noindex')) return 'meta googlebot noindex';
  if (failure.startsWith('missing canonical')) return 'missing canonical';
  if (failure.startsWith('canonical points off')) return 'canonical host';
  if (failure.startsWith('fetch failed')) return 'fetch failed';
  return 'other';
}

async function verifyAll(urls) {
  const failures = [];
  const failureKinds = new Map();
  let cursor = 0;
  let checked = 0;

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= urls.length) return;
      if (PACING_MS) await sleep(PACING_MS);
      const failure = await verifyPage(urls[index]);
      checked += 1;
      if (failure) {
        failures.push(failure);
        const kind = failureKind(failure);
        failureKinds.set(kind, (failureKinds.get(kind) || 0) + 1);
      }
      if (checked % 250 === 0 || checked === urls.length) {
        const summary = [...failureKinds.entries()].map(([kind, count]) => `${kind}=${count}`).join(', ') || 'none';
        console.log(`Live indexability progress: ${checked}/${urls.length}; failures=${failures.length}; categories: ${summary}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, () => worker()));
  return { failures, failureKinds };
}

await verifyHomepage();
await verifyRobots();
const { urls, sitemapCount } = await collectSitemapUrls();
if (urls.length < MIN_URLS) {
  throw new Error(`Production sitemap exposes only ${urls.length} unique URLs; expected at least ${MIN_URLS}`);
}
console.log(`Collected ${urls.length} unique production URLs from ${sitemapCount} sitemap documents. Audit settings: concurrency=${CONCURRENCY}, pacing=${PACING_MS}ms, attempts=${MAX_ATTEMPTS}, timeout=${TIMEOUT_MS}ms.`);

const { failures, failureKinds } = await verifyAll(urls);
if (failures.length) {
  console.error(`LIVE PRODUCTION INDEXABILITY CONTRACT FAILED: ${failures.length}/${urls.length} sitemap URLs failed after retries.`);
  console.error(`Failure categories: ${[...failureKinds.entries()].map(([kind, count]) => `${kind}=${count}`).join(', ')}`);
  for (const failure of failures.slice(0, 300)) console.error(`- ${failure}`);
  if (failures.length > 300) console.error(`- ... ${failures.length - 300} additional failures omitted`);
  process.exit(1);
}

console.log(`Live production indexability contract passed: bare homepage + cache-busted homepage + robots.txt + ${urls.length} sitemap URLs are crawlable, free of noindex, and canonicalized to ${ORIGIN}.`);
