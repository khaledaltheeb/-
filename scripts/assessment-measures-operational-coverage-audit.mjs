import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function extractMeasureBlocks(file, marker) {
  const source = read(file);
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`${file}: catalog marker is missing`);
  const body = source.slice(markerIndex);
  const matches = [...body.matchAll(/^\s{4}slug: '([^']+)',/gm)];
  return matches.map((match, index) => ({
    slug: match[1],
    file,
    block: body.slice(match.index, matches[index + 1]?.index ?? body.length),
  }));
}

const waveSpecs = [
  ['lib/assessment-measures.ts', 'export const assessmentMeasures: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave2.ts', 'export const assessmentMeasuresWave2: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave3.ts', 'export const assessmentMeasuresWave3: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave4.ts', 'export const assessmentMeasuresWave4: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave5.ts', 'export const assessmentMeasuresWave5: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave6.ts', 'export const assessmentMeasuresWave6: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave7.ts', 'export const assessmentMeasuresWave7: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave8.ts', 'export const assessmentMeasuresWave8: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave9.ts', 'export const assessmentMeasuresWave9: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave10.ts', 'export const assessmentMeasuresWave10: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave11.ts', 'export const assessmentMeasuresWave11: AssessmentMeasure[] = ['],
];

const measures = waveSpecs.flatMap(([file, marker]) => extractMeasureBlocks(file, marker)).map((entry) => ({
  ...entry,
  rightsStatus: entry.block.match(/rightsStatus: '([^']+)'/)?.[1] ?? 'unknown',
  rightsLabel: entry.block.match(/rightsLabel: '([^']+)'/)?.[1] ?? '',
}));

const libDir = path.join(root, 'lib');
const operationalFiles = fs.readdirSync(libDir)
  .filter((name) => name === 'assessment-measure-operational.ts' || /^assessment-measure-operational-full-forms-wave\d+\.ts$/.test(name))
  .map((name) => `lib/${name}`)
  .sort();

const explicitBySlug = new Map();
for (const file of operationalFiles) {
  const source = read(file);
  for (const match of source.matchAll(/^\s{2}'([^']+)': \{/gm)) {
    explicitBySlug.set(match[1], file);
  }
}

const uncovered = measures
  .filter((measure) => !explicitBySlug.has(measure.slug))
  .sort((a, b) => a.rightsStatus.localeCompare(b.rightsStatus) || a.slug.localeCompare(b.slug));
const covered = measures.length - uncovered.length;
const pct = measures.length ? ((covered / measures.length) * 100).toFixed(1) : '0.0';
const byRights = uncovered.reduce((acc, item) => {
  acc[item.rightsStatus] = (acc[item.rightsStatus] ?? 0) + 1;
  return acc;
}, {});

console.log(`ASSESSMENT_OPERATIONAL_COVERAGE_AUDIT: ${covered}/${measures.length} explicit operational materials (${pct}%).`);
console.log(`ASSESSMENT_OPERATIONAL_COVERAGE_REMAINING: ${uncovered.length}.`);
console.log(`ASSESSMENT_OPERATIONAL_COVERAGE_REMAINING_BY_RIGHTS: ${JSON.stringify(byRights)}`);
for (const item of uncovered) {
  console.log(`UNCOVERED\t${item.slug}\t${item.rightsStatus}\t${item.file}\t${item.rightsLabel}`);
}

// Report-only while the explicit operational conversion is in progress.
// Convert this audit to a failing gate once every reusable/open measure has either
// an explicit operational material or a narrowly documented rights/version exception.
process.exitCode = 0;
