import fs from 'node:fs';

const failures = [];
const fail = (message) => failures.push(message);
const read = (path) => fs.readFileSync(path, 'utf8');
const exists = (path) => fs.existsSync(path);

const home = read('app/page.tsx');
const header = read('components/site-header.tsx');
const sitemapPreservation = read('scripts/sitemap-preservation-contract.mjs');

const toolHubs = [
  ['/assessments', 'app/assessments/page.tsx'],
  ['/assessment-lab', 'app/assessment-lab/page.tsx'],
  ['/assessment-measures/', 'app/assessment-measures/page.tsx'],
  ['/core-outcome-sets/', 'app/core-outcome-sets/page.tsx'],
  ['/guided-assessment', 'app/guided-assessment/page.tsx'],
  ['/cognitive-lab', 'app/cognitive-lab/page.tsx'],
  ['/capabilities/kids-lab/', 'app/capabilities/kids-lab/page.tsx'],
  ['/daily-tools/', 'app/daily-tools/page.tsx'],
];

for (const [route, source] of toolHubs) {
  if (!exists(source)) fail(`required public tool hub source is missing: ${source}`);
  if (!home.includes(`href=\"${route}\"`)) fail(`homepage unified tools zone is missing ${route}`);
}

for (const marker of [
  'id="labs-tools"',
  'المختبرات والتقييمات والأدوات',
  'كل أدوات روافد في منطقة واحدة',
]) {
  if (!home.includes(marker)) fail(`homepage unified discovery marker is missing: ${marker}`);
}

if (!header.includes("href: '/#labs-tools'") || !header.includes("label: 'المختبرات والتقييمات والأدوات'")) {
  fail('global navigation must expose the unified labs/assessments/tools zone');
}

// The reorganization is additive. These pre-existing knowledge/service gateways
// must remain discoverable instead of being displaced by the tools grouping.
for (const route of ['/care-guides/', '/evidence-guides/', '/sectors/pediatric-oncology', '/specialists', '/centers']) {
  if (!home.includes(`href=\"${route}\"`)) fail(`homepage lost an existing service/content gateway: ${route}`);
}

// Protect the historical compatibility surfaces that carry old inbound URLs.
for (const source of [
  'app/cognitive-tests/page.tsx',
  'app/assessments/page.tsx',
  'app/guided-assessment/page.tsx',
]) {
  if (!exists(source)) fail(`historical compatibility surface is missing: ${source}`);
}

const guided = read('app/guided-assessment/page.tsx');
if (!guided.includes('<strong>100</strong> رابط تاريخي محفوظ')) {
  fail('guided assessment must continue to expose its 100 preserved historical links');
}

const cognitiveLegacy = read('app/cognitive-tests/page.tsx');
if (!cognitiveLegacy.includes('المسارات التاريخية المحفوظة') || !cognitiveLegacy.includes('historicalCognitiveTestMap')) {
  fail('cognitive historical compatibility layer must remain intact');
}

// Keep the existing global canonical/sitemap ownership safety net in place.
for (const marker of [
  'Daily Tools source corpus must resolve to exactly 151 routes',
  'duplicate published canonical_url',
  'indexable published canonical partition mismatch',
]) {
  if (!sitemapPreservation.includes(marker)) fail(`sitemap preservation guard lost marker: ${marker}`);
}

if (failures.length) {
  for (const message of failures) console.error(`HOME DISCOVERY CONTRACT FAILED: ${message}`);
  process.exit(1);
}

console.log(`HOME DISCOVERY CONTRACT OK: ${toolHubs.length} tool/lab gateways preserved in one homepage zone; global entry, legacy compatibility and sitemap preservation guards remain present.`);
