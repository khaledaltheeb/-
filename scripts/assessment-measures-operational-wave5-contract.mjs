import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE5_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const wave5 = read('lib/assessment-measure-operational-full-forms-wave5.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');
const rightsReview = read('lib/assessment-measures-rights-review.ts');

const slugs = [...wave5.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const required = [
  'kdigo-acute-kidney-injury-stage',
  'ascvd-pooled-cohort-equations-10-year-risk',
];

assert(slugs.length >= required.length, `expected at least ${required.length} Wave-5 materials, found ${slugs.length}`);
for (const slug of required) assert(slugs.includes(slug), `${slug}: Wave-5 material missing`);
assert(new Set(slugs).size === slugs.length, 'duplicate slug in Wave 5');
assert(!/http:\/\//.test(wave5), 'Wave-5 sources must use HTTPS');
assert(catalog.includes('assessmentOperationalFullFormsWave5'), 'operational catalog must import Wave 5');
assert(catalog.includes('...assessmentOperationalFullFormsWave5'), 'operational catalog must register Wave 5');

// KDIGO AKI — exact current final 2012 staging, complete data fields, and a strict boundary around the 2026 public-review draft.
for (const code of [
  'AKI-BASELINE-SCR',
  'AKI-CURRENT-SCR',
  'AKI-SCR-ABS-RISE',
  'AKI-SCR-RATIO',
  'AKI-UO-RATE',
  'AKI-UO-DURATION',
  'AKI-ANURIA',
  'AKI-RRT',
  'AKI-PEDS-EGFR',
  'AKI-STAGE',
  'AKI-STAGE-BASIS',
]) assert(wave5.includes(code), `KDIGO AKI field missing: ${code}`);

for (const criterion of [
  '≥0.3 mg/dL',
  '1.5–1.9× baseline',
  '2.0–2.9× baseline',
  '≥3.0× baseline',
  '≥4.0 mg/dL',
  '<0.5 mL/kg/h',
  '<0.3 mL/kg/h',
  'anuria لمدة ≥12 ساعة',
  'eGFR <35 mL/min/1.73m²',
]) assert(wave5.includes(criterion), `KDIGO criterion missing: ${criterion}`);

assert(wave5.includes('مسودة مراجعة عامة'), 'KDIGO 2026 draft-status warning missing');
assert(wave5.includes('لا تستخدم المرحلة وحدها'), 'KDIGO no-standalone-treatment-decision guardrail missing');
assert(wave5.includes('https://kdigo.org/guidelines/acute-kidney-injury/'), 'KDIGO authoritative guideline hub missing');
assert(wave5.includes('https://pmc.ncbi.nlm.nih.gov/articles/PMC4057151/'), 'KDIGO published staging source missing');

// ASCVD PCE — preserve original variables and traceability while preventing accidental use as the default 2026 LLT risk model.
for (const code of [
  'PCE-AGE',
  'PCE-SEX',
  'PCE-RACE',
  'PCE-TC',
  'PCE-HDL',
  'PCE-SBP',
  'PCE-BP-TREATED',
  'PCE-DIABETES',
  'PCE-SMOKING',
  'PCE-RISK',
  'PCE-CALCULATOR',
  'PCE-NOTE',
]) assert(wave5.includes(code), `PCE documentation field missing: ${code}`);

assert(wave5.includes('legacy model in 2026'), 'PCE legacy-version label missing');
assert(wave5.includes('PREVENT-ASCVD بدل PCE'), '2026 PREVENT-over-PCE boundary missing');
assert(wave5.includes('لم تُشتق لها معادلة PCE مستقلة'), 'PCE population-generalizability boundary missing');
assert(wave5.includes('لا تنشئ معاملات مختصرة محلية'), 'PCE no-homebrew-calculator boundary missing');
assert(wave5.includes('https://tools.acc.org/ascvd-risk-estimator/default.aspx'), 'ACC legacy PCE implementation link missing');
assert(wave5.includes('2026-guideline-on-the-management-of-dyslipidemia'), '2026 dyslipidemia guidance source missing');

// Never reproduce a measure that the rights registry marks as restricted/reference-only.
const restrictedSlugs = [...rightsReview.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((match) => match[1]);
for (const restricted of restrictedSlugs) {
  assert(!slugs.includes(restricted), `rights-restricted measure must remain reference-only: ${restricted}`);
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_OPERATIONAL_WAVE5_PASS: ${slugs.length} operational materials + criteria + version/source/safety boundaries verified.`);
}
