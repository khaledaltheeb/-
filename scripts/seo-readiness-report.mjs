const base = (process.env.SEO_GATE_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const canonicalOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').origin;
const target = Math.max(1, Number(process.env.SEO_TARGET_URLS || 10000));
const requireTarget = process.env.SEO_REQUIRE_TARGET === 'true';
const timeoutMs = Math.max(2000, Number(process.env.SEO_GATE_TIMEOUT_MS || 15000));

function decodeXml(value) {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}
function stripTags(value = '') { return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
function locs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((m) => decodeXml(stripTags(m[1]))).filter(Boolean);
}
async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'Rawafid-SEO-Readiness/1.0' } });
    if (!response.ok) throw new Error(`${url} returned ${response.status}`);
    return response.text();
  } finally { clearTimeout(timer); }
}
function runtimeUrl(publicUrl) {
  const parsed = new URL(publicUrl, canonicalOrigin);
  if (parsed.origin !== canonicalOrigin) throw new Error(`Sitemap escaped canonical origin: ${publicUrl}`);
  return `${base}${parsed.pathname}${parsed.search}`;
}
function bucket(pathname) {
  if (pathname.startsWith('/content/')) return 'content';
  if (pathname.startsWith('/encyclopedia/')) return 'encyclopedia';
  if (pathname.startsWith('/quick-info/')) return 'quick-info';
  if (pathname.startsWith('/magazine/')) return 'magazine';
  if (pathname.startsWith('/care-guides/')) return 'care-guides';
  if (pathname.startsWith('/evidence-guides/')) return 'evidence-guides';
  if (pathname.startsWith('/sectors/')) return 'sectors';
  if (pathname.startsWith('/sections/')) return 'sections';
  if (pathname.startsWith('/specialists/')) return 'specialists';
  if (pathname.startsWith('/centers/')) return 'centers';
  if (pathname.startsWith('/community/')) return 'community';
  return 'other';
}

async function main() {
  const index = await fetchText(`${base}/sitemap.xml`);
  if (!/<sitemapindex\b/i.test(index)) throw new Error('Root sitemap is not a sitemap index');
  const childMaps = locs(index);
  if (!childMaps.length) throw new Error('No child sitemaps discovered');

  const all = [];
  const perSitemap = [];
  for (const child of childMaps) {
    const xml = await fetchText(runtimeUrl(child));
    if (!/<urlset\b/i.test(xml)) throw new Error(`Invalid child sitemap: ${child}`);
    const childUrls = locs(xml);
    all.push(...childUrls);
    perSitemap.push({ sitemap: new URL(child, canonicalOrigin).pathname + new URL(child, canonicalOrigin).search, urls: childUrls.length });
  }

  const normalized = [];
  const invalid = [];
  for (const value of all) {
    try {
      const url = new URL(value, canonicalOrigin);
      if (url.origin !== canonicalOrigin) { invalid.push(value); continue; }
      url.hash = '';
      normalized.push(url.toString());
    } catch { invalid.push(value); }
  }

  const unique = [...new Set(normalized)];
  const duplicates = normalized.length - unique.length;
  const buckets = new Map();
  for (const value of unique) {
    const url = new URL(value);
    const key = bucket(url.pathname);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const progress = unique.length / target;
  console.log('Rawafid SEO readiness report');
  console.log(`Canonical origin: ${canonicalOrigin}`);
  console.log(`Sitemap children: ${childMaps.length}`);
  console.log(`Canonical unique URLs: ${unique.length}`);
  console.log(`Target URLs: ${target}`);
  console.log(`Progress: ${(progress * 100).toFixed(2)}%`);
  console.log(`Duplicates: ${duplicates}`);
  console.log(`Invalid/external URLs: ${invalid.length}`);
  console.log('URL buckets:', Object.fromEntries([...buckets.entries()].sort((a, b) => b[1] - a[1])));
  console.log('Sitemap counts:', perSitemap);

  if (duplicates > 0) throw new Error(`Duplicate canonical URLs found across sitemaps: ${duplicates}`);
  if (invalid.length > 0) throw new Error(`Invalid/external URLs found in sitemaps: ${invalid.length}`);
  if (requireTarget && unique.length < target) {
    throw new Error(`SEO cutover target not reached: ${unique.length}/${target}`);
  }
}

main().catch((error) => {
  console.error('SEO readiness report failed:', error);
  process.exit(1);
});
