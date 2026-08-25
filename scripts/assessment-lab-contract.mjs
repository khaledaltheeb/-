import fs from 'node:fs';

const legacyMonitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v2.json', 'utf8'));
const instruments = JSON.parse(fs.readFileSync('data/assessment-lab/instruments.v1.json', 'utf8'));
const catalog = fs.readFileSync('lib/assessment-lab/catalog.ts', 'utf8');
const runner = fs.readFileSync('components/assessment-monitor-runner.tsx', 'utf8');
const directory = fs.readFileSync('components/assessment-lab-directory.tsx', 'utf8');
const hub = fs.readFileSync('app/assessment-lab/page.tsx', 'utf8');
const detail = fs.readFileSync('app/assessment-lab/[slug]/page.tsx', 'utf8');
const sitemap = fs.readFileSync('app/sitemaps/static.xml/route.ts', 'utf8');
const header = fs.readFileSync('components/site-header.tsx', 'utf8');
const plan = fs.readFileSync('.rawafid-self-assessment-plan.md', 'utf8');

const failures = [];
const fail = (message) => failures.push(message);
const knownReferenceIds = new Set([...catalog.matchAll(/id: '([^']+)'/g)].map((match) => match[1]));

if (legacyMonitors.length !== 36) fail('historical inventory must retain 36 routes; found ' + legacyMonitors.length);
if (monitors.length !== 36) fail('expected 36 original Rawafid tools; found ' + monitors.length);
if (instruments.length !== 4) fail('expected 4 source-only instrument guides; found ' + instruments.length);

const legacySlugs = new Set(legacyMonitors.map((row) => row.slug));
const monitorSlugs = new Set(monitors.map((row) => row.slug));
const allSlugs = new Set([...monitors, ...instruments].map((row) => row.slug));
if (monitorSlugs.size !== 36) fail('original tool slugs must be unique');
if ([...legacySlugs].some((slug) => !monitorSlugs.has(slug)) || [...monitorSlugs].some((slug) => !legacySlugs.has(slug))) {
  fail('v2 must preserve every historical local-tool URL exactly');
}
if (allSlugs.size !== 40) fail('expected 40 unique public routes; found ' + allSlugs.size);

const itemTexts = [];
for (const monitor of monitors) {
  const requiredStrings = ['slug', 'title', 'category', 'summary', 'audience', 'ageLabel', 'recallPeriod', 'version', 'status'];
  for (const key of requiredStrings) if (typeof monitor[key] !== 'string' || !monitor[key].trim()) fail((monitor.slug || 'unknown') + ': missing ' + key);
  if (monitor.status !== 'developmental') fail(monitor.slug + ': publication status must remain developmental until empirical validation');
  if (!Number.isInteger(monitor.estimatedMinutes) || monitor.estimatedMinutes < 3 || monitor.estimatedMinutes > 8) fail(monitor.slug + ': invalid duration');
  if (!Array.isArray(monitor.referenceIds) || monitor.referenceIds.length < 2) fail(monitor.slug + ': needs method + topical references');
  for (const referenceId of monitor.referenceIds || []) if (!knownReferenceIds.has(referenceId)) fail(monitor.slug + ': unknown reference ' + referenceId);
  if (!Array.isArray(monitor.domains) || monitor.domains.length !== 4) fail(monitor.slug + ': expected exactly four domains');
  const domainIds = new Set();
  for (const domain of monitor.domains || []) {
    if (!domain.id || domainIds.has(domain.id)) fail(monitor.slug + ': duplicate or missing domain id');
    domainIds.add(domain.id);
    if (!domain.title || !domain.action) fail(monitor.slug + '/' + domain.id + ': missing title or action');
    if (!Array.isArray(domain.items) || domain.items.length !== 3) fail(monitor.slug + '/' + domain.id + ': expected three explicit items');
    const directions = new Set((domain.items || []).map((item) => item.direction));
    if (!directions.has('concern') || !directions.has('resource')) fail(monitor.slug + '/' + domain.id + ': must balance concern and resource items');
    for (const item of domain.items || []) {
      if (!['concern', 'resource'].includes(item.direction)) fail(monitor.slug + '/' + domain.id + ': invalid item direction');
      if (typeof item.text !== 'string' || item.text.length < 12 || item.text.length > 110) fail(monitor.slug + '/' + domain.id + ': item must be a short explicit Arabic statement');
      if ((item.text.match(/[،,]/g) || []).length > 1) fail(monitor.slug + '/' + domain.id + ': item may be double-barrelled: ' + item.text);
      itemTexts.push(item.text);
    }
  }
}
if (itemTexts.length !== 432) fail('expected 432 explicit items; found ' + itemTexts.length);
if (new Set(itemTexts).size !== itemTexts.length) fail('every item must have unique wording; generic repeated templates are forbidden');

for (const instrument of instruments) {
  for (const key of ['title', 'summary', 'intendedUse', 'whyNoItems', 'rightsNote', 'statusLabel', 'note']) {
    if (typeof instrument[key] !== 'string' || instrument[key].length < 20) fail(instrument.slug + ': incomplete source guide field ' + key);
  }
  if (!instrument.sourceUrl?.startsWith('https://')) fail(instrument.slug + ': official source URL required');
  if ('items' in instrument || 'score' in instrument) fail(instrument.slug + ': source guide must not contain copied items or scoring');
}

for (const forbidden of ['localStorage', 'sessionStorage', 'fetch(', 'XMLHttpRequest', 'navigator.sendBeacon', 'document.cookie']) {
  if (runner.includes(forbidden)) fail('runner must not persist or transmit answers: ' + forbidden);
}
for (const required of ['النتيجة استرشادية', 'لا توجد درجة كلية', 'من دون تحويلها إلى نسبة', '/specialists', '/centers', '/guided-assessment', 'لا ترسل روافد إجاباتك', 'لا يدخل في أي حساب أو استنتاج']) {
  if (!runner.includes(required)) fail('runner boundary or next step missing: ' + required);
}
for (const forbiddenScoring of ['patternLabel(', 'focusDomains', 'domain.score', '${domain.score}%', "entry.item.direction === 'concern' ? entry.answer : 4 - entry.answer", 'score >= 25', 'score < 25', 'score < 50', 'score < 75']) {
  if (runner.includes(forbiddenScoring)) fail('developmental runner must not imply unvalidated numeric interpretation: ' + forbiddenScoring);
}
if (!runner.includes("entry.answer === 'na'")) fail('not-applicable answers must remain explicit and outside inference');

if (!catalog.includes('monitors.v2.json') || !catalog.includes("'developmental'")) fail('catalog must use the explicit developmental item bank');
if (!directory.includes('type="search"') || !directory.includes('aria-pressed')) fail('directory must support accessible search and category filtering');
for (const required of ['اختبر نفسك', '432', 'إصدار تطويري 1.0 غير مقنن', 'برنامج روافد للتطوير السيكومتري', 'لا ننسخها', 'لا توجد درجة كلية أو نسبة شدة']) {
  if (!hub.includes(required)) fail('hub publication boundary missing: ' + required);
}
if (detail.includes('index: false')) fail('reviewed, content-rich detail pages must not be hard-coded noindex');
if (!detail.includes('/assessment-lab/${slug}') || !detail.includes('index: true')) fail('detail pages need self-canonical indexable metadata');
if (!detail.includes("'@type': 'WebApplication'")) fail('original interactive tools need accurate WebApplication structured data');
if (!detail.includes('من دون نسبة أو ترتيب أو فئة شدة أو مقارنة معيارية')) fail('detail page must prohibit unvalidated numeric interpretation');
if (!sitemap.includes('assessmentSlugs.map')) fail('all 40 reviewed routes must be present in the static sitemap');
if (!header.includes("{ href: '/assessment-lab', label: 'اختبر نفسك'")) fail('section must be discoverable from the services navigation');

for (const required of ['الغاية النهائية', 'لا ادعاء بالتقنين', '432 بندًا', 'المراحل المتبقية ميدانيًا', 'المسارات التاريخية', 'لا نسبة شدة']) {
  if (!plan.includes(required)) fail('continuity plan missing: ' + required);
}

if (failures.length) {
  for (const message of failures) console.error('ASSESSMENT LAB CONTRACT FAILED: ' + message);
  process.exit(1);
}

console.log('Assessment lab contract passed: 36 original developmental tools / 432 explicit Arabic items / 4 source-only guides / no persistence / no unvalidated numeric interpretation / self-canonical discovery.');
