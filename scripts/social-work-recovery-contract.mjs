import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'data', 'social-work-recovery', 'manifest.json');
const htmlRoot = path.join(root, 'data', 'social-work-recovery', 'html');
const routePath = path.join(root, 'app', 'evidence-guides', 'social-work', '[[...slug]]', 'route.ts');
const generatedModule = path.join(root, 'lib', 'social-work-pages.generated.ts');
const repairPath = path.join(root, 'lib', 'social-work-provenance-repair.ts');
const generatorPath = path.join(root, 'scripts', 'recover-social-work-sector.mjs');
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

for (const required of [manifestPath, htmlRoot, routePath, generatedModule, repairPath, generatorPath]) {
  if (!fs.existsSync(required)) fail(`missing ${path.relative(root, required)}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (![2, 3].includes(manifest.version)) fail(`unexpected manifest version ${manifest.version}`);
if (manifest.source?.repository !== 'khaledaltheeb/healthrenewal.org') fail('legacy repository identity mismatch');
if (manifest.source?.commit !== '6911d5ee75bd6fc2dfa12f394d61efe46e87df17') fail('legacy source SHA mismatch');
if (manifest.actual_page_count !== expectedCount || manifest.pages?.length !== expectedCount) fail(`expected ${expectedCount} pages`);

const routeSource = fs.readFileSync(routePath, 'utf8');
const repairSource = fs.readFileSync(repairPath, 'utf8');
const generatorSource = fs.readFileSync(generatorPath, 'utf8');
if (!routeSource.includes('SOCIAL_WORK_PAGES')) fail('route is not backed by recovered pages');
if (!routeSource.includes('x-rawafid-source')) fail('source provenance response header missing');
if (!routeSource.includes('repairSocialWorkSourceProvenance')) fail('route does not apply the provenance migration repair');
if (!repairSource.includes('2015081211140160') || !repairSource.includes('2016091213042605')) fail('provenance repair does not distinguish archive and direct-email Ljubljana sources');
if (!repairSource.includes('independently identified companion/archive link')) fail('provenance repair lacks independent-source classification');
if (!generatorSource.includes("const FSD_DIRECT_EMAIL_URL = 'https://www.fsd.uni-lj.si/mma/-/2016091213042605/'")) fail('future recovery generator does not use 201609 as direct-email source');
if (!generatorSource.includes('FSD_ARCHIVE_COMPANION_URL')) fail('future recovery generator does not classify the 201508 archive separately');
if (!generatorSource.includes('FSD_ENGLISH_COMPANION_URL')) fail('future recovery generator does not classify the 201709 English source separately');

if (manifest.version === 3) {
  const directLjubljana = manifest.institutional_sources?.find((s) => String(s.url || '').includes('2016091213042605'));
  if (!directLjubljana || !String(directLjubljana.provenance || '').startsWith('direct_email')) fail('v3 manifest: directly emailed 201609 Ljubljana source missing or misclassified');
  const archiveCompanion = manifest.institutional_sources?.find((s) => String(s.url || '').includes('2015081211140160'));
  if (!archiveCompanion || !String(archiveCompanion.provenance || '').includes('independently_discovered')) fail('v3 manifest: 201508 archive companion provenance missing');
  const englishCompanion = manifest.institutional_sources?.find((s) => String(s.url || '').includes('2017092010392030'));
  if (!englishCompanion || !String(englishCompanion.provenance || '').includes('independently_discovered')) fail('v3 manifest: 201709 English companion provenance missing');
}

const routes = new Set();
let minimumWords = Infinity;
let legacyArtifacts = 0;
for (const page of manifest.pages) {
  if (!page.route?.startsWith('/evidence-guides/social-work/')) fail(`route escaped sector: ${page.route}`);
  if (routes.has(page.route)) fail(`duplicate route: ${page.route}`);
  routes.add(page.route);
  const rel = page.key ? `${page.key}/index.html` : 'index.html';
  const html = fs.readFileSync(path.join(htmlRoot, rel), 'utf8');
  const canonical = `https://healthrenewal.org${page.route}`;
  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) fail(`canonical mismatch: ${page.route}`);
  if (!html.includes('id=DRUG4023')) fail(`DRUG4023 missing: ${page.route}`);
  if (!html.includes('2016091213042605')) fail(`directly emailed Ljubljana source missing: ${page.route}`);
  if (!html.includes('2015081211140160')) fail(`Ljubljana archive companion missing: ${page.route}`);
  if (!html.includes('Social Chamber of Slovenia')) fail(`source publisher missing: ${page.route}`);
  if (!html.includes('Faculty of Social Work, University of Ljubljana')) fail(`university publisher missing: ${page.route}`);
  if (!html.includes('لا يعني اعتمادًا أو شراكة أو مصادقة')) fail(`endorsement guard missing: ${page.route}`);
  if (!html.includes('حدود الاستدلال')) fail(`evidence-boundary section missing: ${page.route}`);
  if (html.includes('الرابط الأصلي الذي شاركته الجهة المهنية معنا')) legacyArtifacts += 1;
  if (count(html, '<h1') !== 1) fail(`expected one h1: ${page.route}`);
  const words = text(html).split(/\s+/).filter(Boolean).length;
  minimumWords = Math.min(minimumWords, words);
  if (words < 120) fail(`thin page ${words} words: ${page.route}`);
}

if (manifest.version === 3 && legacyArtifacts > 0) fail(`v3 artifacts contain ${legacyArtifacts} false direct-email provenance labels`);
if (manifest.version === 2 && legacyArtifacts > 0 && !routeSource.includes('repairSocialWorkSourceProvenance')) fail('v2 legacy artifacts require render-time provenance repair');

console.log(`Social Work recovery contract prepared: ${expectedCount} persisted URLs; minimum ${minimumWords} words; manifest v${manifest.version}; ${legacyArtifacts} legacy provenance labels protected by mandatory render-time migration repair.`);
