import fs from 'node:fs';
import path from 'node:path';

const base = (process.argv[2] || 'https://healthrenewal.org').replace(/\/$/, '');
const runId = process.argv[3] || `audit-${Date.now()}`;
const scope = process.argv[4] || 'tests';
const renderRevision = '20260912-ar-layout-1';
const manifestPath = path.resolve('artifacts/kids-lab-routes/manifest.json');
if (!fs.existsSync(manifestPath)) throw new Error('Kids Lab route manifest is missing. Run scripts/kids-lab-route-contract.mjs first.');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.summary?.failures) throw new Error(`Route manifest contains ${manifest.summary.failures} failures.`);
if (!['tests', 'images', 'all'].includes(scope)) throw new Error(`Unsupported audit scope: ${scope}`);

const allHtmlRoutes = manifest.clickedRoutes ?? [];
const allImageRoutes = manifest.imageRoutes ?? [];
const testRouteList = manifest.testRoutes ?? [];
const testImageRouteList = manifest.testImageRoutes ?? [];
const htmlRoutes = scope === 'all' ? allHtmlRoutes : scope === 'tests' ? testRouteList : [];
const imageRoutes = scope === 'tests' ? testImageRouteList : allImageRoutes;
const testRoutes = new Set(testRouteList);
const testImageRoutes = new Set(testImageRouteList);
const failures = [];
const stats = { html: 0, images: 0, testPages: 0, testImages: 0, retries: 0 };
const ARABIC_TEXT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

function urlFor(route, kind) {
  const url = new URL(route, `${base}/`);
  if (kind === 'image') url.searchParams.set('v', renderRevision);
  return url;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function inspectArabicSvgText(svg) {
  const issues = [];
  for (const tag of svg.match(/<text\b[^>]*>[\s\S]*?<\/text>/gi) ?? []) {
    const match = tag.match(/^(<text\b[^>]*>)([\s\S]*)(<\/text>)$/i);
    if (!match) continue;
    const openTag = match[1];
    const body = match[2]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi, ' ');
    if (!ARABIC_TEXT.test(body)) continue;
    if (!/\bdirection=["']rtl["']/i.test(openTag)) issues.push('Arabic text lacks direction="rtl"');
    if (!/\bunicode-bidi=["']plaintext["']/i.test(openTag)) issues.push('Arabic text lacks unicode-bidi="plaintext"');
    if (/\btext-anchor=["']end["']/i.test(openTag)) issues.push('Arabic RTL text retains legacy text-anchor="end"');
  }
  return issues;
}

async function fetchWithRetry(route, kind) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(urlFor(route, kind), {
        redirect: 'follow',
        headers: {
          Accept: kind === 'html' ? 'text/html,application/xhtml+xml' : 'image/svg+xml,image/*;q=0.8,*/*;q=0.5',
          'User-Agent': 'Rawafid-Kids-Lab-Safe-Live-QA/4.0',
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
        const textIssues = inspectArabicSvgText(body);
        if (textIssues.length) throw new Error([...new Set(textIssues)].join('; '));
        const cacheControl = response.headers.get('cache-control') || '';
        if (/max-age\s*=\s*31536000/i.test(cacheControl) || /\bimmutable\b/i.test(cacheControl)) throw new Error(`stale worksheet cache policy detected: ${cacheControl}`);
        const revision = response.headers.get('x-rawafid-kids-lab-revision');
        if (revision !== renderRevision) throw new Error(`worksheet revision header mismatch: ${revision || '(missing)'}`);
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

console.log(`LIVE Kids Lab ${scope} audit: ${htmlRoutes.length} HTML routes + ${imageRoutes.length} SVG routes; concurrency=2; cache-friendly; revision=${renderRevision}.`);
await runPool(htmlRoutes, 'html');
await runPool(imageRoutes, 'image');

if (scope === 'tests') {
  if (stats.testPages !== 335) failures.push(`Expected 335 live test pages; verified ${stats.testPages}`);
  if (stats.testImages !== 335) failures.push(`Expected 335 live test worksheet images; verified ${stats.testImages}`);
} else if (scope === 'images') {
  if (stats.html !== 0) failures.push(`Expected no live HTML requests in images scope; verified ${stats.html}`);
  if (stats.images !== 1000) failures.push(`Expected 1000 live SVG routes; verified ${stats.images}`);
  if (stats.testImages !== 335) failures.push(`Expected all 335 test worksheet images within the 1000-image audit; verified ${stats.testImages}`);
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
  renderRevision,
  mode: 'cache-friendly-low-concurrency-static-worksheet-aware-rtl-revision-verified',
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