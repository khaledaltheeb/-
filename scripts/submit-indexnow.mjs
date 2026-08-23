const base = (process.env.INDEXNOW_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').replace(/\/$/, '');
const key = process.env.INDEXNOW_KEY || 'b7f31d3c5a694e2f8b04c71d9a6e53f2';
const endpoint = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const batchSize = Math.max(1, Math.min(10000, Number(process.env.INDEXNOW_BATCH_SIZE || 10000)));
const maxUrls = Math.max(0, Number(process.env.INDEXNOW_MAX_URLS || 0));
const sinceHours = Math.max(0, Number(process.env.INDEXNOW_SINCE_HOURS || 0));

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function text(value) {
  return decodeXml(String(value || '').replace(/<[^>]*>/g, '').trim());
}

function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => text(match[1])).filter(Boolean);
}

function sitemapEntries(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)].flatMap((match) => {
    const body = match[1];
    const loc = body.match(/<loc>([\s\S]*?)<\/loc>/i);
    if (!loc) return [];
    const lastmod = body.match(/<lastmod>([\s\S]*?)<\/lastmod>/i);
    return [{ url: text(loc[1]), lastModified: lastmod ? text(lastmod[1]) : null }];
  });
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Rawafid-IndexNow/1.1' },
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

function recentEnough(lastModified) {
  if (sinceHours <= 0) return true;
  if (!lastModified) return false;
  const stamp = Date.parse(lastModified);
  if (!Number.isFinite(stamp)) return false;
  return stamp >= Date.now() - sinceHours * 60 * 60 * 1000;
}

async function discoverUrls() {
  const indexUrl = `${base}/sitemap.xml`;
  const indexXml = await fetchText(indexUrl);
  const sitemapUrls = sitemapLocs(indexXml);
  if (!sitemapUrls.length) throw new Error('No sitemap URLs found in sitemap index');

  const entries = [];
  for (const sitemapUrl of sitemapUrls) {
    const xml = await fetchText(sitemapUrl);
    entries.push(...sitemapEntries(xml));
  }

  const sameHost = new Set();
  const host = new URL(base).host;
  for (const entry of entries) {
    if (!recentEnough(entry.lastModified)) continue;
    try {
      const url = new URL(entry.url);
      url.hash = '';
      if (url.host === host && /^https?:$/.test(url.protocol)) sameHost.add(url.toString());
    } catch {}
  }
  const discovered = [...sameHost].sort();
  return maxUrls > 0 ? discovered.slice(0, maxUrls) : discovered;
}

async function submitBatch(urlList) {
  const payload = {
    host: new URL(base).host,
    key,
    keyLocation: `${base}/${key}.txt`,
    urlList,
  };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'user-agent': 'Rawafid-IndexNow/1.1',
    },
    body: JSON.stringify(payload),
  });
  if (![200, 202].includes(response.status)) {
    const body = await response.text().catch(() => '');
    throw new Error(`IndexNow returned ${response.status}${body ? `: ${body.slice(0, 500)}` : ''}`);
  }
  return response.status;
}

async function main() {
  const urls = await discoverUrls();
  if (!urls.length) {
    console.log(`IndexNow: no URLs changed in the configured ${sinceHours || 'full'} window; nothing to submit.`);
    return;
  }
  console.log(`IndexNow: discovered ${urls.length} eligible public URLs from ${base}/sitemap.xml`);

  let accepted = 0;
  for (let offset = 0; offset < urls.length; offset += batchSize) {
    const batch = urls.slice(offset, offset + batchSize);
    const status = await submitBatch(batch);
    accepted += batch.length;
    console.log(`IndexNow: submitted ${accepted}/${urls.length} URLs (HTTP ${status})`);
  }
}

main().catch((error) => {
  console.error('IndexNow submission failed:', error);
  process.exit(1);
});
