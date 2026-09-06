import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const libDir = path.join(root, 'lib');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const extractAllSlugs = (text) => [...text.matchAll(/\bslug:\s*'([^']+)'/g)].map((match) => match[1]);
const extractOperationalRecordSlugs = (text) => [
  ...extractAllSlugs(text),
  ...[...text.matchAll(/^\s{2}'([^']+)':\s*/gm)].map((match) => match[1]),
];
const extractMeasureObjectSlugs = (text) => [...text.matchAll(/\{\s*slug:\s*'([^']+)',\s*nameAr:/g)].map((match) => match[1]);
const unique = (values) => [...new Set(values)];
const numericWaveSort = (prefix) => (a, b) => {
  const getWave = (file) => Number(file.match(new RegExp(`${prefix}(\\d+)\\.ts$`))?.[1] ?? 0);
  return getWave(a) - getWave(b);
};

const libFiles = fs.readdirSync(libDir);
const measureWaveFiles = libFiles
  .filter((file) => /^assessment-measures-wave\d+\.ts$/.test(file))
  .sort(numericWaveSort('assessment-measures-wave'))
  .map((file) => `lib/${file}`);
const operationalWaveFiles = libFiles
  .filter((file) => /^assessment-measure-operational-full-forms-wave\d+\.ts$/.test(file))
  .sort(numericWaveSort('assessment-measure-operational-full-forms-wave'))
  .map((file) => `lib/${file}`);

const measureFiles = ['lib/assessment-measures.ts', ...measureWaveFiles];
const operationalFiles = ['lib/assessment-measure-operational.ts', ...operationalWaveFiles];
const rightsReviewPath = 'lib/assessment-measures-rights-review.ts';

for (const file of [...measureFiles, ...operationalFiles, rightsReviewPath]) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`ASSESSMENT_OPERATIONAL_COVERAGE_FAIL: required audit input missing: ${file}`);
    process.exit(1);
  }
}

if (!measureWaveFiles.length || !operationalWaveFiles.length) {
  console.error('ASSESSMENT_OPERATIONAL_COVERAGE_FAIL: wave discovery returned no measure or operational wave files.');
  process.exit(1);
}

// Measure files also contain category/related slugs. Count only AssessmentMeasure object starts,
// identified by the canonical `slug` followed by `nameAr` fields.
const allMeasures = unique(measureFiles.flatMap((file) => extractMeasureObjectSlugs(read(file)))).sort();
// Operational materials may be authored as literal `slug:` records or as generated records keyed by
// the canonical top-level registry slug. Count both representations so DRY helpers cannot create false gaps.
const explicitOperational = unique(operationalFiles.flatMap((file) => extractOperationalRecordSlugs(read(file)))).sort();
const rightsRestricted = unique(extractAllSlugs(read(rightsReviewPath))).sort();

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
  discoveredMeasureFiles: measureFiles.length,
  discoveredMeasureWaves: measureWaveFiles.length,
  discoveredOperationalFiles: operationalFiles.length,
  discoveredOperationalWaves: operationalWaveFiles.length,
  latestMeasureWave: measureWaveFiles.at(-1) ?? null,
  latestOperationalWave: operationalWaveFiles.at(-1) ?? null,
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

if (orphanExplicit.length) {
  console.error(`ASSESSMENT_OPERATIONAL_COVERAGE_FAIL: explicit operational materials have no catalog measure: ${orphanExplicit.join(', ')}`);
  process.exitCode = 1;
}

// Final-state invariant: every public catalog measure must now be either explicitly operationalized
// or deliberately classified as rights-restricted reference-only. A newly added measure must make
// that classification in the same change; otherwise CI fails instead of silently restoring a gap.
if (unresolved.length) {
  console.error(`ASSESSMENT_OPERATIONAL_COVERAGE_FAIL: unresolved measures remain: ${unresolved.join(', ')}`);
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log(
    `ASSESSMENT_OPERATIONAL_COVERAGE_PASS: measures=${allMeasures.length} explicit=${explicitInCatalog.length} restricted=${rightsRestricted.length} unresolved=0 measure_waves=${measureWaveFiles.length} operational_waves=${operationalWaveFiles.length}; every catalog measure is explicitly operationalized or rights-classified, with no collision and no orphan explicit material.`,
  );
}
