const ORIGIN = (process.env.PRODUCTION_ORIGIN || 'https://healthrenewal.org').replace(/\/$/, '');
const EXPECTED_HOST = new URL(ORIGIN).hostname;
const EXPECTED_HOME_TITLE = 'روافد | الصحة النفسية والتربية الخاصة وسرطان الأطفال';
const MIN_URLS = Number(process.env.MIN_LIVE_INDEXABLE_URLS || '3806');
const CONCURRENCY = Math.max(1, Number(process.env.INDEXABILITY_CONCURRENCY || '16'));
const TIMEOUT_MS = Math.max(3000, Number(process.env.INDEXABILITY_TIMEOUT_MS || '20000'));
const USER_AGENT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

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

async function fetchText(url, { attempts = 3 } = {}) {
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
      const text = await response.text();
      clearTimeout(timer);
      return { response, text };
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 700));
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
  if (/\bnoindex\b/i.test(headerRobots)) throw new Error(`${label} homepage X-Robots-Tag contains noindex: ${headerRobots}`);
  for (const name of ['robots', 'googlebot']) {
    if (metaDirectives(text, name).some((value) => /\bnoindex\b/i.test(value))) {
      throw new Error(`${label} homepage meta ${name} contains noindex`);
    }
  }
  const canonical = canonicalHref(text);
  if (canonical !== `${ORIGIN}/`) throw new Error(`${label} homepage canonical is ${canonical || 'missing'}, expected ${ORIGIN}/`);
  if (/workers\.dev|rawafid-platform-staging/i.test(text)) throw new Error(`${label} homepage leaks the staging hostname`);
  const title = documentTitle(text);
  if (title !== EXPECTED_HOME_TITLE) throw new Error(`${label} homepage title is ${JSON.stringify(title)}, expected ${JSON.stringify(EXPECTED_HOME_TITLE)}`);
  console.log(`${label} homepage OK: HTTP ${response.status}; title=${JSON.stringify(title)}; canonical=${canonical}; no noindex.`);
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
    const { response, text } = await fetchText(url, { attempts: 2 });
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

async function verifyAll(urls) {
  const failures = [];
  let cursor = 0;
  let checked = 0;

  async function worker() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= urls.length) return;
      const failure = await verifyPage(urls[index]);
      checked += 1;
      if (failure) failures.push(failure);
      if (checked % 250 === 0 || checked === urls.length) {
        console.log(`Live indexability progress: ${checked}/${urls.length}; failures=${failures.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, () => worker()));
  return failures;
}

await verifyHomepage();
await verifyRobots();
const { urls, sitemapCount } = await collectSitemapUrls();
if (urls.length < MIN_URLS) {
  throw new Error(`Production sitemap exposes only ${urls.length} unique URLs; expected at least ${MIN_URLS}`);
}
console.log(`Collected ${urls.length} unique production URLs from ${sitemapCount} sitemap documents.`);

const failures = await verifyAll(urls);
if (failures.length) {
  console.error(`LIVE PRODUCTION INDEXABILITY CONTRACT FAILED: ${failures.length}/${urls.length} sitemap URLs failed.`);
  for (const failure of failures.slice(0, 200)) console.error(`- ${failure}`);
  if (failures.length > 200) console.error(`- ... ${failures.length - 200} additional failures omitted`);
  process.exit(1);
}

console.log(`Live production indexability contract passed: bare homepage + cache-busted homepage + robots.txt + ${urls.length} sitemap URLs are crawlable, free of noindex, and canonicalized to ${ORIGIN}.`);
