const base = (process.env.CUTOVER_BASE_URL || process.env.SEO_GATE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const canonicalOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').origin;
const minimum = Math.max(1, Number(process.env.CUTOVER_MIN_INDEXABLE || 10000));
const enforce = process.env.CUTOVER_ENFORCE === 'true';
const timeoutMs = Math.max(2000, Number(process.env.CUTOVER_TIMEOUT_MS || 20000));

function decodeXml(value) {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}
function stripTags(value = '') { return value.replace(/<[^>]*>/g, ' ').trim(); }
function locs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decodeXml(stripTags(match[1]))).filter(Boolean);
}
async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'Rawafid-Cutover-Readiness/1.0' } });
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.text();
  } finally { clearTimeout(timer); }
}
function localize(url) {
  const parsed = new URL(url, canonicalOrigin);
  return `${base}${parsed.pathname}${parsed.search}`;
}

async function main() {
  const indexXml = await fetchText(`${base}/sitemap.xml`);
  if (!/<sitemapindex\b/i.test(indexXml)) throw new Error('Root sitemap is not a sitemap index.');
  const childMaps = locs(indexXml);
  if (!childMaps.length) throw new Error('No child sitemaps were advertised.');

  const urls = [];
  const counts = [];
  for (const child of childMaps) {
    const xml = await fetchText(localize(child));
    if (!/<urlset\b/i.test(xml)) throw new Error(`Child sitemap is not a URL set: ${child}`);
    const childUrls = locs(xml);
    counts.push({ sitemap: new URL(child, canonicalOrigin).pathname + new URL(child, canonicalOrigin).search, urls: childUrls.length });
    urls.push(...childUrls);
  }

  const normalized = urls.flatMap((value) => {
    try {
      const url = new URL(value, canonicalOrigin);
      url.hash = '';
      if (url.origin !== canonicalOrigin) return [];
      return [url.toString()];
    } catch { return []; }
  });
  const unique = new Set(normalized);
  const duplicates = normalized.length - unique.size;
  const remaining = Math.max(0, minimum - unique.size);
  const readiness = unique.size >= minimum;

  console.log(JSON.stringify({
    canonical_origin: canonicalOrigin,
    sitemap_count: childMaps.length,
    sitemap_urls_total: normalized.length,
    unique_indexable_urls: unique.size,
    duplicate_sitemap_urls: duplicates,
    cutover_minimum: minimum,
    remaining_to_minimum: remaining,
    threshold_reached: readiness,
    by_sitemap: counts,
  }, null, 2));

  if (duplicates > 0) throw new Error(`Sitemaps contain ${duplicates} duplicate URL entries.`);
  if (enforce && !readiness) {
    throw new Error(`Cutover blocked: ${unique.size} unique sitemap URLs; minimum is ${minimum}.`);
  }
  if (!readiness) console.log(`Cutover readiness: report-only — ${remaining} additional unique indexable URLs required for the ${minimum} threshold.`);
  else console.log(`Cutover readiness: ${unique.size} unique indexable URLs meets the ${minimum} threshold.`);
}

main().catch((error) => {
  console.error('Cutover readiness failed:', error);
  process.exit(1);
});
