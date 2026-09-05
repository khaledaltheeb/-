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
  ...extractMeasureBlocks('lib/assessment-measures-wave3.ts', 'export const assessmentMeasuresWave3: AssessmentMeasure[] = ['),
  ...extractMeasureBlocks('lib/assessment-measures-wave4.ts', 'export const assessmentMeasuresWave4: AssessmentMeasure[] = ['),
  ...extractMeasureBlocks('lib/assessment-measures-wave5.ts', 'export const assessmentMeasuresWave5: AssessmentMeasure[] = ['),
];

assert(blocks.length >= 37, `expected at least 37 verified measures, found ${blocks.length}`);

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
  'movement-disorders',
  'cognition-neuropsychology',
  'trauma-stress',
  'substance-use-addiction',
  'symptom-burden',
  'respiratory-function',
  'vision',
]);
const fullArabicProtocolAllowlist = new Set(['timed-up-and-go', '10-meter-walk-test', '6-minute-walk-test']);

for (const { slug, file, block } of blocks) {
  assert(/rightsStatus: '(public-domain|open-reuse)'/.test(block), `${slug}: rightsStatus missing or unsupported (${file})`);
  assert(/rightsVerifiedOn: '\d{4}-\d{2}-\d{2}'/.test(block), `${slug}: rightsVerifiedOn missing (${file})`);
  assert(/role: 'rights'/.test(block), `${slug}: authoritative rights source missing (${file})`);
  assert(/role: 'evidence'/.test(block) || /role: 'original'/.test(block) || /role: 'translation'/.test(block), `${slug}: evidence/original/translation source missing (${file})`);
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

const sourceFiles = [
  read('lib/assessment-measures.ts'),
  read('lib/assessment-measures-wave2.ts'),
  read('lib/assessment-measures-wave3.ts'),
  read('lib/assessment-measures-wave4.ts'),
  read('lib/assessment-measures-wave5.ts'),
].join('\n');
assert(!/http:\/\//.test(sourceFiles), 'measure sources must not use insecure HTTP URLs');
assert(sourceFiles.includes("const CDISC_QRS = 'https://") || sourceFiles.includes('https://www.cdisc.org/standards/foundational/qrs'), 'CDISC rights registry reference must remain HTTPS');

const catalog = read('lib/assessment-measures-catalog.ts');
assert(
  catalog.includes('assessmentMeasuresWave1') &&
  catalog.includes('assessmentMeasuresWave2') &&
  catalog.includes('assessmentMeasuresWave3') &&
  catalog.includes('assessmentMeasuresWave4') &&
  catalog.includes('assessmentMeasuresWave5'),
  'catalog aggregator must include all five verified waves',
);
assert(catalog.includes('assessmentMeasureCategoriesWave4'), 'canonical catalog must include wave-four category expansion');

const categoriesWave4 = read('lib/assessment-measures-wave4-categories.ts');
for (const category of ['movement-disorders', 'cognition-neuropsychology', 'trauma-stress', 'substance-use-addiction', 'symptom-burden', 'respiratory-function', 'vision']) {
  assert(categoriesWave4.includes(`slug: '${category}'`), `wave-four category definition missing: ${category}`);
}

const rightsReview = read('lib/assessment-measures-rights-review.ts');
const rightsReviewMarker = 'export const assessmentMeasuresRightsReview: AssessmentMeasureRightsReviewItem[] = [';
const rightsReviewIndex = rightsReview.indexOf(rightsReviewMarker);
assert(rightsReviewIndex >= 0, 'restricted rights review queue marker missing');
const rightsReviewBody = rightsReviewIndex >= 0 ? rightsReview.slice(rightsReviewIndex) : '';
const restrictedSlugs = [...rightsReviewBody.matchAll(/^\s{4}slug: '([^']+)',/gm)].map((match) => match[1]);
assert(restrictedSlugs.length >= 11, `expected at least 11 restricted/reference-only instruments, found ${restrictedSlugs.length}`);
assert(new Set(restrictedSlugs).size === restrictedSlugs.length, 'duplicate slug in restricted rights review queue');
for (const restrictedSlug of restrictedSlugs) {
  assert(!uniqueSlugs.has(restrictedSlug), `${restrictedSlug}: restricted instrument must not also appear in reusable catalog`);
}
for (const status of ['granted-to-cdisc', 'author-permission-required', 'denied', 'no-response-received']) {
  assert(rightsReview.includes(`status: '${status}'`), `restricted rights review queue missing status class: ${status}`);
}
assert(!/http:\/\//.test(rightsReview), 'restricted rights review sources must use HTTPS');
assert((rightsReview.match(/rightsVerifiedOn: '2026-09-05'/g) ?? []).length >= restrictedSlugs.length, 'every restricted item must carry a rights verification date');
assert((rightsReview.match(/whyReferenceOnly:/g) ?? []).length >= restrictedSlugs.length, 'every restricted item must explain why it is reference-only');
assert((rightsReview.match(/safeUseOnRawafid:/g) ?? []).length >= restrictedSlugs.length, 'every restricted item must define safe Rawafid handling');

const pcl5 = blocks.find((entry) => entry.slug === 'ptsd-checklist-for-dsm5');
assert(Boolean(pcl5), 'PCL-5 must be included in verified catalog');
assert(Boolean(pcl5 && pcl5.block.includes("arabicStatus: 'validated-version-reported'")), 'PCL-5 must preserve documented Arabic validation status');
assert(Boolean(pcl5 && pcl5.block.includes('National Center for PTSD')), 'PCL-5 must preserve official VA rights provenance');

const hub = read('app/assessment-measures/page.tsx');
assert(hub.includes('المقاييس وأدوات التقييم المستخدمة عالميًا'), 'public hub title changed unexpectedly');
assert(hub.includes('/assessment-measures/compare/'), 'comparison route is not linked from the hub');
assert(hub.includes('/assessment-measures/methodology/'), 'methodology route is not linked from the hub');
assert(hub.includes('/assessment-measures/rights-register/'), 'rights register is not linked from the hub');

const rightsRegister = read('app/assessment-measures/rights-register/page.tsx');
assert(rightsRegister.includes('assessmentMeasures.map'), 'rights register must derive from the canonical catalog');
assert(rightsRegister.includes("source.role === 'rights'"), 'rights register must expose an authoritative rights source');
assert(rightsRegister.includes('/assessment-measures/rights-review/'), 'rights register must link to restricted rights review queue');

const rightsReviewPage = read('app/assessment-measures/rights-review/page.tsx');
assert(rightsReviewPage.includes('assessmentMeasuresRightsReview.map'), 'rights review page must derive from the canonical restricted queue');
assert(rightsReviewPage.includes('Granted لـCDISC'), 'rights review page must explain that Granted is not a Rawafid reproduction license');
assert(rightsReviewPage.includes('<tr id={item.slug} key={item.slug}>'), 'restricted rights review rows must expose stable anchors for search results');
assert(rightsReviewPage.includes("url: `${SITE_URL}/assessment-measures/rights-review/#${item.slug}`"), 'restricted rights JSON-LD must point to its stable Rawafid anchor');

const header = read('components/site-header.tsx');
assert(header.includes('/assessment-measures/'), 'assessment measures library is not present in global navigation');

const unifiedSearch = read('app/search/page.tsx');
assert(unifiedSearch.includes("from '@/lib/assessment-measures-catalog'"), 'unified search must import the canonical assessment catalog');
assert(unifiedSearch.includes("from '@/lib/assessment-measures-rights-review'"), 'unified search must import the restricted assessment rights queue');
assert(unifiedSearch.includes('function searchAssessmentMeasures'), 'assessment-specific search scoring is missing');
assert(unifiedSearch.includes('function searchRestrictedAssessmentMeasures'), 'restricted assessment search scoring is missing');
assert(unifiedSearch.includes('const restrictedMeasures = searchRestrictedAssessmentMeasures(q, 20);'), 'restricted assessment search is not executed');
assert(unifiedSearch.includes('...measures, ...restrictedMeasures, ...expanded'), 'restricted assessment results are not merged into unified results');
assert(unifiedSearch.includes('`/assessment-measures/rights-review/#${measure.slug}`'), 'restricted assessment result must deep-link to the rights review row');
assert(unifiedSearch.includes('مقياس مرجعي مقيد'), 'restricted assessment results must carry a visible rights-boundary label');
assert(unifiedSearch.includes("href=\"/assessment-measures/\""), 'assessment library is missing from search discovery navigation');
assert(unifiedSearch.includes("href=\"/assessment-measures/rights-review/\""), 'restricted rights review is missing from search discovery navigation');
for (const searchableRestricted of ['mmse-2-standard-version', 'montreal-cognitive-assessment', 'hospital-anxiety-depression-scale']) {
  assert(rightsReview.includes(`slug: '${searchableRestricted}'`), `representative restricted search fixture missing: ${searchableRestricted}`);
}

const sitemap = read('app/sitemaps/static.xml/route.ts');
assert(sitemap.includes("from '@/lib/assessment-measures-catalog'"), 'static sitemap must use the aggregated catalog');
assert(sitemap.includes('/assessment-measures/compare/'), 'comparison route missing from static sitemap');
assert(sitemap.includes('/assessment-measures/methodology/'), 'methodology route missing from static sitemap');
assert(sitemap.includes('/assessment-measures/rights-register/'), 'rights register route missing from static sitemap');
assert(sitemap.includes('/assessment-measures/rights-review/'), 'restricted rights review route missing from static sitemap');

const requiredRoutes = [
  'app/assessment-measures/page.tsx',
  'app/assessment-measures/[slug]/page.tsx',
  'app/assessment-measures/category/[slug]/page.tsx',
  'app/assessment-measures/compare/page.tsx',
  'app/assessment-measures/methodology/page.tsx',
  'app/assessment-measures/rights-register/page.tsx',
  'app/assessment-measures/rights-review/page.tsx',
];
for (const route of requiredRoutes) {
  assert(fs.existsSync(path.join(root, route)), `required route missing: ${route}`);
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_MEASURES_CONTRACT_PASS: ${blocks.length} reusable measures, ${restrictedSlugs.length} restricted searchable references, ${uniqueSlugs.size} unique public slugs, 16 categories, rights/evidence/safety/Arabic/search checks passed.`);
}
