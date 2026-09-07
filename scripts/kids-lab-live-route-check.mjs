import fs from 'node:fs';
import path from 'node:path';

const base = (process.argv[2] || 'https://healthrenewal.org').replace(/\/$/, '');
const stamp = process.argv[3] || `audit-${Date.now()}`;
const manifestPath = path.resolve('artifacts/kids-lab-routes/manifest.json');
if (!fs.existsSync(manifestPath)) throw new Error('Kids Lab route manifest is missing. Run scripts/kids-lab-route-contract.mjs first.');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.summary?.failures) throw new Error(`Route manifest contains ${manifest.summary.failures} failures.`);

const htmlRoutes = manifest.clickedRoutes ?? [];
const imageRoutes = manifest.imageRoutes ?? [];
const testRoutes = new Set(manifest.testRoutes ?? []);
const testImageRoutes = new Set(manifest.testImageRoutes ?? []);
const failures = [];
const stats = { html: 0, images: 0, testPages: 0, testImages: 0, retries: 0 };

function urlFor(route) {
  const url = new URL(route, `${base}/`);
  url.searchParams.set('kids_lab_audit', stamp);
  return url;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(route, kind) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(urlFor(route), {
        redirect: 'follow',
        headers: { 'Cache-Control': 'no-cache, no-store, max-age=0', Pragma: 'no-cache', 'User-Agent': 'Rawafid-Kids-Lab-Exhaustive-QA/1.0' },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') || '';
      const body = await response.text();
      if (kind === 'html') {
        if (!contentType.toLowerCase().includes('text/html')) throw new Error(`unexpected content-type ${contentType || '(empty)'}`);
        if (!body.includes('<html') && !body.includes('<!DOCTYPE html')) throw new Error('response is not HTML');
        if (/\b404\b[^<]{0,80}(?:not found|غير موجود)/i.test(body)) throw new Error('page body appears to be a 404 document');
        if (testRoutes.has(route)) stats.testPages += 1;
        stats.html += 1;
      } else {
        if (!contentType.toLowerCase().includes('image/svg+xml')) throw new Error(`unexpected content-type ${contentType || '(empty)'}`);
        if (!body.includes('<svg') || !body.includes('</svg>')) throw new Error('SVG envelope is missing');
        if (/\b(?:NaN|Infinity|undefined)\b/.test(body)) throw new Error('SVG contains an invalid runtime token');
        if (testImageRoutes.has(route)) stats.testImages += 1;
        stats.images += 1;
      }
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        stats.retries += 1;
        await sleep(attempt * 500);
      }
    }
  }
  failures.push(`${kind} ${route}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

async function runPool(routes, kind, concurrency = 16) {
  let index = 0;
  async function worker() {
    while (index < routes.length) {
      const current = index;
      index += 1;
      if (current >= routes.length) return;
      await fetchWithRetry(routes[current], kind);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, routes.length || 1) }, () => worker()));
}

console.log(`LIVE Kids Lab exhaustive audit: ${htmlRoutes.length} HTML routes + ${imageRoutes.length} SVG routes.`);
await runPool(htmlRoutes, 'html');
await runPool(imageRoutes, 'image');

if (stats.testPages !== 335) failures.push(`Expected 335 live test pages; verified ${stats.testPages}`);
if (stats.testImages !== 335) failures.push(`Expected 335 live test worksheet images; verified ${stats.testImages}`);
if (stats.html !== 1080) failures.push(`Expected 1080 live HTML routes; verified ${stats.html}`);
if (stats.images !== 1000) failures.push(`Expected 1000 live SVG routes; verified ${stats.images}`);

const report = { base, stamp, checkedAt: new Date().toISOString(), stats, failures };
fs.mkdirSync('artifacts/kids-lab-live', { recursive: true });
fs.writeFileSync('artifacts/kids-lab-live/report.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(`LIVE Kids Lab result: ${stats.html}/1080 HTML, ${stats.images}/1000 SVG, ${stats.testPages}/335 test pages, ${stats.testImages}/335 test images, ${failures.length} failures, ${stats.retries} retries.`);
if (failures.length) {
  console.error(failures.slice(0, 200).join('\n'));
  process.exit(1);
}
