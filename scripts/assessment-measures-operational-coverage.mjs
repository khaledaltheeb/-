import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const extractAllSlugs = (text) => [...text.matchAll(/\bslug:\s*'([^']+)'/g)].map((match) => match[1]);
const extractMeasureObjectSlugs = (text) => [...text.matchAll(/\{\s*slug:\s*'([^']+)',\s*nameAr:/g)].map((match) => match[1]);
const unique = (values) => [...new Set(values)];

const measureFiles = [
  'lib/assessment-measures.ts',
  ...Array.from({ length: 10 }, (_, index) => `lib/assessment-measures-wave${index + 2}.ts`),
];

const operationalFiles = [
  'lib/assessment-measure-operational.ts',
  'lib/assessment-measure-operational-full-forms-wave1.ts',
  'lib/assessment-measure-operational-full-forms-wave2.ts',
  'lib/assessment-measure-operational-full-forms-wave3.ts',
  'lib/assessment-measure-operational-full-forms-wave4.ts',
  'lib/assessment-measure-operational-full-forms-wave5.ts',
];

for (const file of [...measureFiles, ...operationalFiles, 'lib/assessment-measures-rights-review.ts']) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`ASSESSMENT_OPERATIONAL_COVERAGE_FAIL: required audit input missing: ${file}`);
    process.exit(1);
  }
}

// Measure files also contain category/related slugs. Count only AssessmentMeasure object starts,
// identified by the canonical `slug` followed by `nameAr` fields.
const allMeasures = unique(measureFiles.flatMap((file) => extractMeasureObjectSlugs(read(file)))).sort();
const explicitOperational = unique(operationalFiles.flatMap((file) => extractAllSlugs(read(file)))).sort();
const rightsRestricted = unique(extractAllSlugs(read('lib/assessment-measures-rights-review.ts'))).sort();

const allSet = new Set(allMeasures);
const explicitSet = new Set(explicitOperational);
const restrictedSet = new Set(rightsRestricted);

const explicitInCatalog = explicitOperational.filter((slug) => allSet.has(slug));
const restrictedInCatalog = rightsRestricted.filter((slug) => allSet.has(slug));
const unresolved = allMeasures.filter((slug) => !explicitSet.has(slug) && !restrictedSet.has(slug));
const explicitRestrictedCollision = explicitOperational.filter((slug) => restrictedSet.has(slug));
const orphanExplicit = explicitOperational.filter((slug) => !allSet.has(slug));
const rightsReferencesOutsidePublicMeasureCatalog = rightsRestricted.filter((slug) => !allSet.has(slug));

const report = {
  totalCatalogMeasures: allMeasures.length,
  explicitOperationalMeasures: explicitInCatalog.length,
  rightsRestrictedReferenceOnly: rightsRestricted.length,
  rightsRestrictedAlsoInPublicMeasureCatalog: restrictedInCatalog.length,
  unresolvedForExplicitOrRightsClassification: unresolved.length,
  explicitRestrictedCollision,
  orphanExplicit,
  rightsReferencesOutsidePublicMeasureCatalog,
  unresolved,
};

console.log('ASSESSMENT_OPERATIONAL_COVERAGE_REPORT');
console.log(JSON.stringify(report, null, 2));

if (!allMeasures.length) {
  console.error('ASSESSMENT_OPERATIONAL_COVERAGE_FAIL: no AssessmentMeasure objects were detected; audit parser is invalid.');
  process.exitCode = 1;
}

if (explicitRestrictedCollision.length) {
  console.error(`ASSESSMENT_OPERATIONAL_COVERAGE_FAIL: rights-restricted measures reproduced explicitly: ${explicitRestrictedCollision.join(', ')}`);
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_COVERAGE_PASS: real measure objects counted; no explicit-form/rights-restricted collision. The unresolved array is the deterministic next-work queue.');
}
