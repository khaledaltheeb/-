const base = (process.env.SEO_CUTOVER_BASE_URL || 'https://healthrenewal.org').replace(/\/$/, '');
const target = Math.max(1, Number(process.env.SEO_TARGET_URLS || 10000));
const enforceTarget = process.env.SEO_ENFORCE_TARGET === 'true';
const timeoutMs = Math.max(3000, Number(process.env.SEO_CUTOVER_TIMEOUT_MS || 20000));

function decodeXml(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function locs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1].replace(/<[^>]*>/g, '').trim()))
    .filter(Boolean);
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'Rawafid-SEO-Cutover-Readiness/1.0' },
    });
    if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

function bucket(pathname) {
  const first = pathname.split('/').filter(Boolean)[0] || 'home';
  return first;
}

async function main() {
  const canonicalOrigin = new URL(base).origin;
  if (canonicalOrigin !== 'https://healthrenewal.org') {
    throw new Error(`Cutover readiness must target https://healthrenewal.org, got ${canonicalOrigin}`);
  }

  const indexXml = await fetchText(`${base}/sitemap.xml`);
  if (!/<sitemapindex\b/i.test(indexXml)) throw new Error('Production sitemap.xml is not a sitemap index');
  const childMaps = locs(indexXml);
  if (!childMaps.length) throw new Error('Production sitemap index contains no child sitemaps');

  const urls = new Set();
  const duplicates = new Set();
  const badOrigins = [];
  const temporaryHosts = [];
  const counts = new Map();

  for (const child of childMaps) {
    const childUrl = new URL(child, canonicalOrigin);
    if (childUrl.origin !== canonicalOrigin) throw new Error(`Child sitemap leaves production origin: ${child}`);
    const xml = await fetchText(childUrl.toString());
    if (!/<urlset\b/i.test(xml)) throw new Error(`Child sitemap is not a urlset: ${child}`);
    for (const value of locs(xml)) {
      let url;
      try { url = new URL(value, canonicalOrigin); }
      catch { badOrigins.push(value); continue; }
      url.hash = '';
      if (url.hostname.endsWith('.workers.dev')) temporaryHosts.push(url.toString());
      if (url.origin !== canonicalOrigin) { badOrigins.push(url.toString()); continue; }
      const normalized = url.toString();
      if (urls.has(normalized)) duplicates.add(normalized);
      urls.add(normalized);
      const key = bucket(url.pathname);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  const total = urls.size;
  const gap = Math.max(0, target - total);
  console.log(`SEO cutover readiness: canonical=${canonicalOrigin}`);
  console.log(`SEO cutover readiness: child-sitemaps=${childMaps.length}`);
  console.log(`SEO cutover readiness: unique-indexable-urls=${total}`);
  console.log(`SEO cutover readiness: target=${target}, gap=${gap}`);
  console.log('SEO cutover readiness: URL distribution');
  for (const [key, count] of [...counts.entries()].sort((a,b) => b[1] - a[1])) {
    console.log(`  ${key}: ${count}`);
  }

  if (badOrigins.length) throw new Error(`Found ${badOrigins.length} sitemap URLs outside healthrenewal.org`);
  if (temporaryHosts.length) throw new Error(`Found ${temporaryHosts.length} temporary workers.dev sitemap URLs`);
  if (duplicates.size) console.log(`SEO cutover readiness: ${duplicates.size} duplicate sitemap entries collapsed by canonical URL`);
  if (enforceTarget && total < target) {
    throw new Error(`Cutover blocked: only ${total} unique canonical URLs; target is ${target} (${gap} remaining)`);
  }
  console.log(enforceTarget ? 'SEO cutover URL target passed.' : 'SEO cutover URL report complete.');
}

main().catch((error) => {
  console.error('SEO cutover readiness failed:', error);
  process.exit(1);
});
