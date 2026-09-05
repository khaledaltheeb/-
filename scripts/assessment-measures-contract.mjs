import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`ASSESSMENT_MEASURES_CONTRACT_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

function extractMeasureBlocks(file, marker) {
  const source = read(file);
  const markerIndex = source.indexOf(marker);
  assert(markerIndex >= 0, `${file}: catalog marker is missing`);
  if (markerIndex < 0) return [];
  const body = source.slice(markerIndex);
  const matches = [...body.matchAll(/^\s{4}slug: '([^']+)',/gm)];
  return matches.map((match, index) => ({
    slug: match[1],
    file,
    block: body.slice(match.index, matches[index + 1]?.index ?? body.length),
  }));
}

const blocks = [
  ...extractMeasureBlocks('lib/assessment-measures.ts', 'export const assessmentMeasures: AssessmentMeasure[] = ['),
  ...extractMeasureBlocks('lib/assessment-measures-wave2.ts', 'export const assessmentMeasuresWave2: AssessmentMeasure[] = ['),
];

assert(blocks.length >= 20, `expected at least 20 verified measures, found ${blocks.length}`);

const slugs = blocks.map((entry) => entry.slug);
const uniqueSlugs = new Set(slugs);
assert(uniqueSlugs.size === slugs.length, `duplicate measure slug detected: ${slugs.filter((slug, index) => slugs.indexOf(slug) !== index).join(', ')}`);

const allowedCategories = new Set([
  'mobility-walking',
  'balance-falls',
  'neurological-outcomes',
  'brain-injury',
  'mental-health',
  'pain-function',
  'participation',
  'older-adults',
  'rehabilitation-outcomes',
]);
const fullArabicProtocolAllowlist = new Set(['timed-up-and-go', '10-meter-walk-test', '6-minute-walk-test']);

for (const { slug, file, block } of blocks) {
  assert(/rightsStatus: '(public-domain|open-reuse)'/.test(block), `${slug}: rightsStatus missing or unsupported (${file})`);
  assert(/rightsVerifiedOn: '\d{4}-\d{2}-\d{2}'/.test(block), `${slug}: rightsVerifiedOn missing (${file})`);
  assert(/role: 'rights'/.test(block), `${slug}: authoritative rights source missing (${file})`);
  assert(/role: 'evidence'/.test(block), `${slug}: evidence source missing (${file})`);
  assert(/safetyNotes: \[/.test(block), `${slug}: safety notes missing (${file})`);
  assert(/limitations: \[/.test(block), `${slug}: limitations missing (${file})`);
  assert(/administrationSteps: \[/.test(block), `${slug}: administration steps missing (${file})`);
  assert(/fullArabicFormPublished: (true|false)/.test(block), `${slug}: Arabic publication state missing (${file})`);

  const fullArabic = /fullArabicFormPublished: true/.test(block);
  if (fullArabic) {
    assert(fullArabicProtocolAllowlist.has(slug), `${slug}: full Arabic content is not in the verified procedural-protocol allowlist`);
  }

  const categoriesMatch = block.match(/categories: \[([^\]]*)\]/);
  assert(Boolean(categoriesMatch), `${slug}: categories missing (${file})`);
  if (categoriesMatch) {
    const categories = [...categoriesMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
    assert(categories.length > 0, `${slug}: no category assigned (${file})`);
    for (const category of categories) {
      assert(allowedCategories.has(category), `${slug}: unknown category ${category}`);
    }
  }
}

for (const { slug, block } of blocks) {
  const relatedMatch = block.match(/related: \[([^\]]*)\]/);
  assert(Boolean(relatedMatch), `${slug}: related list missing`);
  if (!relatedMatch) continue;
  const related = [...relatedMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  for (const relatedSlug of related) {
    assert(uniqueSlugs.has(relatedSlug), `${slug}: related measure does not exist: ${relatedSlug}`);
    assert(relatedSlug !== slug, `${slug}: measure cannot relate to itself`);
  }
}

const sourceFiles = [read('lib/assessment-measures.ts'), read('lib/assessment-measures-wave2.ts')].join('\n');
assert(!/http:\/\//.test(sourceFiles), 'measure sources must not use insecure HTTP URLs');
assert(sourceFiles.includes("const CDISC_QRS = 'https://"), 'CDISC rights registry constant must remain HTTPS');

const catalog = read('lib/assessment-measures-catalog.ts');
assert(catalog.includes('assessmentMeasuresWave1') && catalog.includes('assessmentMeasuresWave2'), 'catalog aggregator must include both verified waves');

const hub = read('app/assessment-measures/page.tsx');
assert(hub.includes('المقاييس وأدوات التقييم المستخدمة عالميًا'), 'public hub title changed unexpectedly');
assert(hub.includes('/assessment-measures/compare/'), 'comparison route is not linked from the hub');
assert(hub.includes('/assessment-measures/methodology/'), 'methodology route is not linked from the hub');
assert(hub.includes('/assessment-measures/rights-register/'), 'rights register is not linked from the hub');

const rightsRegister = read('app/assessment-measures/rights-register/page.tsx');
assert(rightsRegister.includes('assessmentMeasures.map'), 'rights register must derive from the canonical catalog');
assert(rightsRegister.includes("source.role === 'rights'"), 'rights register must expose an authoritative rights source');

const header = read('components/site-header.tsx');
assert(header.includes('/assessment-measures/'), 'assessment measures library is not present in global navigation');

const sitemap = read('app/sitemaps/static.xml/route.ts');
assert(sitemap.includes("from '@/lib/assessment-measures-catalog'"), 'static sitemap must use the aggregated catalog');
assert(sitemap.includes('/assessment-measures/compare/'), 'comparison route missing from static sitemap');
assert(sitemap.includes('/assessment-measures/methodology/'), 'methodology route missing from static sitemap');
assert(sitemap.includes('/assessment-measures/rights-register/'), 'rights register route missing from static sitemap');

const requiredRoutes = [
  'app/assessment-measures/page.tsx',
  'app/assessment-measures/[slug]/page.tsx',
  'app/assessment-measures/category/[slug]/page.tsx',
  'app/assessment-measures/compare/page.tsx',
  'app/assessment-measures/methodology/page.tsx',
  'app/assessment-measures/rights-register/page.tsx',
];
for (const route of requiredRoutes) {
  assert(fs.existsSync(path.join(root, route)), `required route missing: ${route}`);
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_MEASURES_CONTRACT_PASS: ${blocks.length} measures, ${uniqueSlugs.size} unique slugs, rights/evidence/safety/Arabic-state checks passed.`);
}
