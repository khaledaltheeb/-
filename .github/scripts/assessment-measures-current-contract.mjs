import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const libDir = path.join(root, 'lib');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`ASSESSMENT_MEASURES_CURRENT_CONTRACT_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};
const numericWave = (file) => Number(file.match(/wave(\d+)\.ts$/)?.[1] ?? 0);

const measureWaveFiles = fs.readdirSync(libDir)
  .filter((file) => /^assessment-measures-wave\d+\.ts$/.test(file))
  .sort((a, b) => numericWave(a) - numericWave(b));
const measureFiles = ['assessment-measures.ts', ...measureWaveFiles];

const extractMeasures = (source) => [...source.matchAll(/\{\s*slug:\s*'([^']+)'\s*,\s*nameAr:/g)].map((match) => match[1]);
const measures = measureFiles.flatMap((file) => extractMeasures(read(`lib/${file}`)));
const uniqueMeasures = [...new Set(measures)];

assert(measureWaveFiles.at(-1) === 'assessment-measures-wave12.ts', `expected latest measure wave to be 12, found ${measureWaveFiles.at(-1) ?? 'none'}`);
assert(measures.length === 83, `expected exactly 83 public catalog measures, found ${measures.length}`);
assert(uniqueMeasures.length === measures.length, `duplicate public measure slugs detected: ${measures.filter((slug, index) => measures.indexOf(slug) !== index).join(', ')}`);

const catalog = read('lib/assessment-measures-catalog.ts');
for (const file of measureWaveFiles) {
  const wave = numericWave(file);
  assert(catalog.includes(`assessmentMeasuresWave${wave}`), `catalog aggregator is missing assessmentMeasuresWave${wave}`);
}
assert(catalog.includes('export const assessmentMeasureSlugs = assessmentMeasures.map'), 'canonical slug list must derive from the aggregated catalog');
assert(catalog.includes('assessmentMeasureRouteSlugs'), 'route slug list including aliases is missing');

const categorySources = [
  'lib/assessment-measures.ts',
  ...fs.readdirSync(libDir)
    .filter((file) => /^assessment-measures-wave\d+-categories\.ts$/.test(file))
    .sort((a, b) => Number(a.match(/wave(\d+)-categories/)?.[1] ?? 0) - Number(b.match(/wave(\d+)-categories/)?.[1] ?? 0))
    .map((file) => `lib/${file}`),
];
const baseCategorySource = read('lib/assessment-measures.ts');
const baseCategoryStart = baseCategorySource.indexOf('export const assessmentMeasureCategories = [');
const baseMeasureStart = baseCategorySource.indexOf('export const assessmentMeasures: AssessmentMeasure[] = [');
assert(baseCategoryStart >= 0 && baseMeasureStart > baseCategoryStart, 'base category catalog markers are invalid');
const baseCategoryBody = baseCategorySource.slice(baseCategoryStart, baseMeasureStart);
const categorySlugs = [
  ...[...baseCategoryBody.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]),
  ...categorySources.slice(1).flatMap((file) => [...read(file).matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1])),
];
const uniqueCategories = [...new Set(categorySlugs)];
assert(categorySlugs.length === uniqueCategories.length, `duplicate assessment categories detected: ${categorySlugs.filter((slug, index) => categorySlugs.indexOf(slug) !== index).join(', ')}`);
assert(uniqueCategories.length === 26, `expected exactly 26 assessment categories, found ${uniqueCategories.length}`);

const detailPage = read('app/assessment-measures/[slug]/page.tsx');
const printPage = read('app/assessment-measures/[slug]/print/page.tsx');
for (const [label, source] of [['detail', detailPage], ['print', printPage]]) {
  assert(source.includes('assessmentMeasureRouteSlugs'), `${label} route must generate all canonical and alias static params`);
  assert(source.includes('getCanonicalAssessmentMeasureSlug'), `${label} route must canonicalize legacy aliases`);
  assert(source.includes('hasExplicitOperationalMaterial'), `${label} route must distinguish explicit operational material from fallback documentation`);
}
assert(printPage.includes('robots: { index: false, follow: true }'), 'print routes must remain noindex while allowing link following');
assert(printPage.includes('AssessmentMeasureOperationalForm'), 'print route must render the operational material component');
assert(printPage.includes('MeasurePrintButton'), 'print route must expose the print/save-PDF control');

const hub = read('app/assessment-measures/page.tsx');
for (const route of ['/assessment-measures/compare/', '/assessment-measures/methodology/', '/assessment-measures/rights-register/']) {
  assert(hub.includes(route), `hub is missing required route: ${route}`);
}

const sitemap = read('app/sitemaps/static.xml/route.ts');
assert(sitemap.includes('assessmentMeasureSlugs'), 'sitemap must derive measure URLs from canonical public slugs');
assert(!sitemap.includes('assessmentMeasureRouteSlugs'), 'sitemap must not index alias slugs');

const explicitCatalog = read('lib/assessment-measure-operational-catalog.ts');
assert(explicitCatalog.includes('...baseOperationalMaterials'), 'explicit operational catalog must include the base registry');
for (let wave = 1; wave <= 18; wave += 1) {
  assert(explicitCatalog.includes(`assessmentOperationalFullFormsWave${wave}`), `explicit operational catalog is missing Wave ${wave}`);
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_MEASURES_CURRENT_CONTRACT_PASS: measures=${uniqueMeasures.length} categories=${uniqueCategories.length} latest_measure_wave=12 operational_waves=18 detail_print_alias_semantics=ok sitemap_canonical_only=ok`);
}
