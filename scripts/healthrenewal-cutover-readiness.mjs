const base = (process.env.CUTOVER_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const canonicalOrigin = new URL(process.env.CUTOVER_CANONICAL_ORIGIN || 'https://healthrenewal.org').origin;
const minimumUrls = Math.max(1, Number(process.env.CUTOVER_MIN_INDEXABLE_URLS || 10000));
const timeoutMs = Math.max(3000, Number(process.env.CUTOVER_TIMEOUT_MS || 20000));

function decodeXml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function stripTags(value) {
  return decodeXml(String(value || '').replace(/<[^>]*>/g, '').trim());
}

function locs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => stripTags(match[1])).filter(Boolean);
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Rawafid-Healthrenewal-Cutover-Gate/1.1' },
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function localUrl(publicUrl) {
  const parsed = new URL(publicUrl, canonicalOrigin);
  if (parsed.origin !== canonicalOrigin) {
    throw new Error(`Sitemap escaped canonical origin: ${publicUrl}`);
  }
  return `${base}${parsed.pathname}${parsed.search}`;
}

async function main() {
  const robots = await fetchText(`${base}/robots.txt`);
  if (/Disallow:\s*\/\s*$/mi.test(robots)) throw new Error('Candidate robots.txt blocks the entire site');
  if (!robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) {
    throw new Error(`robots.txt does not advertise ${canonicalOrigin}/sitemap.xml`);
  }

  const sitemapIndex = await fetchText(`${base}/sitemap.xml`);
  if (!/<sitemapindex\b/i.test(sitemapIndex)) throw new Error('Root sitemap is not a sitemap index');
  const childMaps = locs(sitemapIndex);
  if (!childMaps.length) throw new Error('No child sitemaps discovered');

  const publicUrls = new Set();
  const occurrences = new Map();
  let rawOccurrences = 0;

  for (const child of childMaps) {
    const xml = await fetchText(localUrl(child));
    if (!/<urlset\b/i.test(xml)) throw new Error(`Child sitemap is not a urlset: ${child}`);
    for (const raw of locs(xml)) {
      if (/workers\.dev/i.test(raw)) throw new Error(`Temporary host leaked into sitemap: ${raw}`);
      const parsed = new URL(raw, canonicalOrigin);
      if (parsed.origin !== canonicalOrigin) throw new Error(`Foreign canonical origin in sitemap: ${raw}`);
      parsed.hash = '';
      const canonicalUrl = parsed.toString();
      rawOccurrences += 1;
      publicUrls.add(canonicalUrl);
      occurrences.set(canonicalUrl, (occurrences.get(canonicalUrl) || 0) + 1);
    }
  }

  const total = publicUrls.size;
  const overlaps = [...occurrences.entries()].filter(([, count]) => count > 1);
  console.log(`Healthrenewal cutover inventory: ${total.toLocaleString('en-US')} unique canonical URLs across ${childMaps.length} child sitemaps.`);
  console.log(`Raw sitemap occurrences: ${rawOccurrences.toLocaleString('en-US')}; expected/allowed overlap: ${overlaps.length.toLocaleString('en-US')} URLs.`);
  console.log(`Required minimum: ${minimumUrls.toLocaleString('en-US')} unique qualified/indexable URLs.`);
  if (overlaps.length) {
    console.log(`Overlap sample: ${overlaps.slice(0, 10).map(([url, count]) => `${count}x ${url}`).join(' | ')}`);
  }

  if (total < minimumUrls) {
    throw new Error(`CUTOVER BLOCKED: only ${total} unique sitemap URLs; ${minimumUrls} required (${minimumUrls - total} remaining).`);
  }

  const requiredHubs = ['/', '/sectors', '/sections', '/encyclopedia/', '/care-guides/', '/evidence-guides/'];
  const missingHubs = requiredHubs.filter((pathname) => !publicUrls.has(new URL(pathname, canonicalOrigin).toString()));
  if (missingHubs.length) throw new Error(`Required search hubs missing from sitemap inventory: ${missingHubs.join(', ')}`);

  console.log('Healthrenewal 10k cutover URL gate: PASS');
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exit(1);
});
