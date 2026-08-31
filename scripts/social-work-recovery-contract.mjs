import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'data', 'social-work-recovery', 'manifest.json');
const htmlRoot = path.join(root, 'data', 'social-work-recovery', 'html');
const routePath = path.join(root, 'app', 'evidence-guides', 'social-work', '[[...slug]]', 'route.ts');
const generatedModule = path.join(root, 'lib', 'social-work-pages.generated.ts');
const expectedCount = 56;

function fail(message) {
  throw new Error(`SOCIAL WORK CONTRACT FAILED: ${message}`);
}
function text(value) {
  return String(value ?? '').replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function count(value, token) {
  return value.split(token).length - 1;
}

for (const required of [manifestPath, htmlRoot, routePath, generatedModule]) {
  if (!fs.existsSync(required)) fail(`missing ${path.relative(root, required)}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.version !== 2) fail(`unexpected manifest version ${manifest.version}`);
if (manifest.source?.repository !== 'khaledaltheeb/healthrenewal.org') fail('legacy repository identity mismatch');
if (manifest.source?.commit !== '6911d5ee75bd6fc2dfa12f394d61efe46e87df17') fail('legacy source SHA mismatch');
if (manifest.actual_page_count !== expectedCount || manifest.pages?.length !== expectedCount) fail(`expected ${expectedCount} pages`);
if (!manifest.institutional_sources?.some((s) => String(s.url || '').includes('2015081211140160'))) fail('exact emailed Ljubljana source missing from manifest');

const routes = new Set();
let minimumWords = Infinity;
for (const page of manifest.pages) {
  if (!page.route?.startsWith('/evidence-guides/social-work/')) fail(`route escaped sector: ${page.route}`);
  if (routes.has(page.route)) fail(`duplicate route: ${page.route}`);
  routes.add(page.route);
  const rel = page.key ? `${page.key}/index.html` : 'index.html';
  const html = fs.readFileSync(path.join(htmlRoot, rel), 'utf8');
  const canonical = `https://healthrenewal.org${page.route}`;
  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) fail(`canonical mismatch: ${page.route}`);
  if (!html.includes('id=DRUG4023')) fail(`DRUG4023 missing: ${page.route}`);
  if (!html.includes('2015081211140160')) fail(`original emailed Ljubljana source missing: ${page.route}`);
  if (!html.includes('2016091213042605')) fail(`Ljubljana source missing: ${page.route}`);
  if (!html.includes('Social Chamber of Slovenia')) fail(`source publisher missing: ${page.route}`);
  if (!html.includes('Faculty of Social Work, University of Ljubljana')) fail(`university publisher missing: ${page.route}`);
  if (!html.includes('لا يعني اعتمادًا أو شراكة أو مصادقة')) fail(`endorsement guard missing: ${page.route}`);
  if (!html.includes('حدود الاستدلال')) fail(`evidence-boundary section missing: ${page.route}`);
  if (count(html, '<h1') !== 1) fail(`expected one h1: ${page.route}`);
  const words = text(html).split(/\s+/).filter(Boolean).length;
  minimumWords = Math.min(minimumWords, words);
  if (words < 120) fail(`thin page ${words} words: ${page.route}`);
}

const routeSource = fs.readFileSync(routePath, 'utf8');
if (!routeSource.includes('SOCIAL_WORK_PAGES')) fail('route is not backed by recovered pages');
if (!routeSource.includes('x-rawafid-source')) fail('source provenance response header missing');
if (routeSource.includes('2015081211140160')) fail('exact emailed source must be persisted in artifacts, not injected at request time');

console.log(`Social Work recovery contract passed: ${expectedCount} persisted URLs; minimum ${minimumWords} words; exact emailed source, institutional sources and evidence-boundary notice on every page.`);
