import fs from 'node:fs';

const fail = (message) => {
  console.error(`COCHRANE GUIDES RECOVERY CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};
const read = (path) => fs.readFileSync(path, 'utf8');

const guideFiles = [
  'data/cochrane/guides-foundations-v1.json',
  'data/cochrane/guides-search-bias-v1.json',
  'data/cochrane/guides-statistics-v1.json',
  'data/cochrane/guides-grade-decision-v1.json',
  'data/cochrane/guides-ms-arabic-governance-v1.json',
];
const requiredFiles = [
  ...guideFiles,
  'data/cochrane/guides-plan-v1.json',
  'data/cochrane/resources-v1.json',
  'data/cochrane/methods-provenance-v1.json',
  'app/cochrane/guides/page.tsx',
  'app/cochrane/guides/[slug]/page.tsx',
  'app/sitemap.xml/route.ts',
];
for (const path of requiredFiles) if (!fs.existsSync(path)) fail(`missing required file: ${path}`);
if (process.exitCode) process.exit(process.exitCode);

const batches = guideFiles.map((path) => JSON.parse(read(path)));
const guides = batches.flatMap((batch) => batch.guides || []);
const indexPage = read('app/cochrane/guides/page.tsx');
const detailPage = read('app/cochrane/guides/[slug]/page.tsx');
const sitemap = read('app/sitemap.xml/route.ts');
const provenance = JSON.parse(read('data/cochrane/methods-provenance-v1.json'));

if (guides.length !== 50) fail(`expected exactly 50 guides, found ${guides.length}`);
const slugs = guides.map((guide) => guide.slug);
if (new Set(slugs).size !== guides.length) fail('duplicate guide slug');
const titles = guides.map((guide) => guide.title_ar);
if (new Set(titles).size !== guides.length) fail('duplicate guide title');

const allSlugs = new Set(slugs);
for (const guide of guides) {
  if (!/^[a-z0-9-]+$/.test(guide.slug)) fail(`invalid guide slug: ${guide.slug}`);
  if (!guide.title_ar || guide.title_ar.length < 20) fail(`weak title: ${guide.slug}`);
  if (!guide.description_ar || guide.description_ar.length < 70) fail(`thin description: ${guide.slug}`);
  if (!guide.intent_ar || guide.intent_ar.length < 35) fail(`thin intent: ${guide.slug}`);
  if (!Array.isArray(guide.sections) || guide.sections.length < 5) fail(`fewer than five sections: ${guide.slug}`);
  if (!Array.isArray(guide.checklist_ar) || guide.checklist_ar.length < 5) fail(`incomplete checklist: ${guide.slug}`);
  if (!Array.isArray(guide.sources) || guide.sources.length < 1) fail(`missing sources: ${guide.slug}`);
  for (const section of guide.sections) {
    if (!section.body_ar || section.body_ar.length < 120) fail(`thin section: ${guide.slug} / ${section.heading_ar || 'untitled'}`);
  }
  for (const source of guide.sources) {
    if (!source.label || !source.kind || !/^https:\/\//.test(source.url)) fail(`invalid source: ${guide.slug}`);
  }
  if ('connections' in guide) {
    if (!Array.isArray(guide.connections) || guide.connections.length < 2) fail(`incomplete connections: ${guide.slug}`);
    for (const linked of guide.connections) if (!allSlugs.has(linked)) fail(`broken connection: ${guide.slug} -> ${linked}`);
  }
}

if (!indexPage.includes('index: false')) fail('guide index must remain noindex during recovery QA');
if (!detailPage.includes('index: false')) fail('guide details must remain noindex during recovery QA');
if (!indexPage.includes('50-guide pre-release corpus')) fail('pre-release status marker missing');
if (sitemap.includes('/cochrane/guides/')) fail('pre-release guide routes must not be registered in root sitemap');
if (!detailPage.includes('methods-provenance-v1.json')) fail('detail renderer must consume provenance registry');
if (!detailPage.includes('ROBINS-I V2 ما يزال مسودة')) fail('ROBINS-I V2 draft warning missing');
if (!detailPage.includes('سجل حداثة المصادر')) fail('source freshness section missing');
if (!detailPage.includes("'https://www.riskofbias.info/welcome/home/current-version-of-robins-i': 'https://www.riskofbias.info/welcome/robins-i-v2'")) fail('ROBINS-I V2 canonical source override missing');
if (!detailPage.includes("'https://www.cochrane.org/join-cochrane/translate': 'https://www.cochrane.org/get-involved/translate-our-evidence'")) fail('Cochrane Translate canonical source override missing');

if (provenance.schema_version !== 'rawafid-cochrane-methods-provenance-v1') fail('unexpected provenance schema');
const byId = new Map((provenance.records || []).map((record) => [record.id, record]));
for (const id of ['cochrane-handbook-current', 'rob-2-current', 'robins-i-v2', 'rob-me-current', 'grade-chapter-14']) {
  if (!byId.has(id)) fail(`missing provenance record: ${id}`);
}
if (byId.get('robins-i-v2')?.status !== 'draft-subject-to-change') fail('ROBINS-I V2 must remain draft-subject-to-change');
if (!/لا يعيد سجل روافد نشر/.test(provenance.rights_note_ar || '')) fail('rights guard missing from provenance registry');

for (const id of ['ms-azathioprine-cd015005', 'ms-immunotherapy-adverse-effects-cd012186', 'ms-dietary-interventions-cd004192']) {
  if (!allSlugs.has(id)) fail(`missing MS worked example: ${id}`);
}
for (const id of ['arabic-translation-back-translation', 'arabic-rtl-terminology-visual-qa', 'attribution-rights-pilot-governance']) {
  if (!allSlugs.has(id)) fail(`missing Arabic governance guide: ${id}`);
}

if (!process.exitCode) console.log(`COCHRANE GUIDES RECOVERY CONTRACT PASSED: guides=${guides.length}`);
