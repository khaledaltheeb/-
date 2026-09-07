import fs from 'node:fs';
import path from 'node:path';

const base = (process.argv[2] || 'https://healthrenewal.org').replace(/\/$/, '');
const runId = process.argv[3] || `audit-${Date.now()}`;
const scope = process.argv[4] || 'tests';
const manifestPath = path.resolve('artifacts/kids-lab-routes/manifest.json');
if (!fs.existsSync(manifestPath)) throw new Error('Kids Lab route manifest is missing. Run scripts/kids-lab-route-contract.mjs first.');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.summary?.failures) throw new Error(`Route manifest contains ${manifest.summary.failures} failures.`);
if (!['tests', 'all'].includes(scope)) throw new Error(`Unsupported audit scope: ${scope}`);

const allHtmlRoutes = manifest.clickedRoutes ?? [];
const allImageRoutes = manifest.imageRoutes ?? [];
const testRouteList = manifest.testRoutes ?? [];
const testImageRouteList = manifest.testImageRoutes ?? [];
const htmlRoutes = scope === 'all' ? allHtmlRoutes : testRouteList;
const imageRoutes = scope === 'all' ? allImageRoutes : testImageRouteList;
const testRoutes = new Set(testRouteList);
const testImageRoutes = new Set(testImageRouteList);
const failures = [];
const stats = { html: 0, images: 0, testPages: 0, testImages: 0, retries: 0 };

function urlFor(route) {
  return new URL(route, `${base}/`);
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(route, kind) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(urlFor(route), {
        redirect: 'follow',
        headers: {
          Accept: kind === 'html' ? 'text/html,application/xhtml+xml' : 'image/svg+xml,image/*;q=0.8,*/*;q=0.5',
          'User-Agent': 'Rawafid-Kids-Lab-Safe-Live-QA/3.0',
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') || '';
      const body = await response.text();
      if (kind === 'html') {
        if (!contentType.toLowerCase().includes('text/html')) throw new Error(`unexpected content-type ${contentType || '(empty)'}`);
        if (!body.includes('<html') && !body.includes('<!DOCTYPE html')) throw new Error('response is not HTML');
        if (!body.includes('/capabilities/kids-lab/') && !body.includes('مختبر الأطفال')) throw new Error('Kids Lab page marker is missing');
        if (/error code:\s*1102|cloudflare[^<]{0,80}1102/i.test(body)) throw new Error('Cloudflare 1102 detected in page body');
        if (testRoutes.has(route)) stats.testPages += 1;
        stats.html += 1;
      } else {
        if (!contentType.toLowerCase().includes('image/svg+xml')) throw new Error(`unexpected content-type ${contentType || '(empty)'}`);
        if (!body.includes('<svg') || !body.includes('</svg>')) throw new Error('SVG envelope is missing');
        if (/\b(?:NaN|Infinity|undefined)\b/.test(body)) throw new Error('SVG contains an invalid runtime token');
        if (/error code:\s*1102|cloudflare[^<]{0,80}1102/i.test(body)) throw new Error('Cloudflare 1102 detected in SVG response');
        if (testImageRoutes.has(route)) stats.testImages += 1;
        stats.images += 1;
      }
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        stats.retries += 1;
        await sleep(1200);
      }
    }
  }
  failures.push(`${kind} ${route}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

async function runPool(routes, kind, concurrency = 2) {
  let index = 0;
  async function worker() {
    while (index < routes.length) {
      const current = index;
      index += 1;
      if (current >= routes.length) return;
      await fetchWithRetry(routes[current], kind);
      await sleep(75);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, routes.length || 1) }, () => worker()));
}

console.log(`LIVE Kids Lab ${scope} audit: ${htmlRoutes.length} HTML routes + ${imageRoutes.length} SVG routes; concurrency=2; cache-friendly.`);
await runPool(htmlRoutes, 'html');
await runPool(imageRoutes, 'image');

if (scope === 'tests') {
  if (stats.testPages !== 335) failures.push(`Expected 335 live test pages; verified ${stats.testPages}`);
  if (stats.testImages !== 335) failures.push(`Expected 335 live test worksheet images; verified ${stats.testImages}`);
} else {
  if (stats.testPages !== 335) failures.push(`Expected 335 live test pages; verified ${stats.testPages}`);
  if (stats.testImages !== 335) failures.push(`Expected 335 live test worksheet images; verified ${stats.testImages}`);
  if (stats.html !== 1080) failures.push(`Expected 1080 live HTML routes; verified ${stats.html}`);
  if (stats.images !== 1000) failures.push(`Expected 1000 live SVG routes; verified ${stats.images}`);
}

const report = {
  base,
  runId,
  scope,
  mode: 'cache-friendly-low-concurrency-static-worksheet-aware',
  checkedAt: new Date().toISOString(),
  requested: { html: htmlRoutes.length, images: imageRoutes.length },
  stats,
  failures,
};
fs.mkdirSync('artifacts/kids-lab-live', { recursive: true });
fs.writeFileSync('artifacts/kids-lab-live/report.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(`LIVE Kids Lab result: ${stats.html}/${htmlRoutes.length} HTML, ${stats.images}/${imageRoutes.length} SVG, ${stats.testPages}/335 test pages, ${stats.testImages}/335 test images, ${failures.length} failures, ${stats.retries} retries.`);
if (failures.length) {
  console.error(failures.slice(0, 200).join('\n'));
  process.exit(1);
}
