import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE3_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const wave3 = read('lib/assessment-measure-operational-full-forms-wave3.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');
const rightsReview = read('lib/assessment-measures-rights-review.ts');

const slugs = [...wave3.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const required = [
  'brooke-upper-extremity-rating-scale',
  'cdc-hiv-surveillance-stage-2014',
  'kdigo-acute-kidney-injury-stage',
  'ascvd-pooled-cohort-equations-10-year-risk',
];

assert(slugs.length >= required.length, `expected at least ${required.length} Wave-3 materials, found ${slugs.length}`);
for (const slug of required) assert(slugs.includes(slug), `${slug}: Wave-3 material missing`);
assert(new Set(slugs).size === slugs.length, 'duplicate slug in Wave 3');
assert(!/http:\/\//.test(wave3), 'Wave-3 sources must use HTTPS');
assert(catalog.includes("import { assessmentOperationalFullFormsWave3 }"), 'operational catalog must import Wave 3');
assert(catalog.includes('...assessmentOperationalFullFormsWave3'), 'operational catalog must register Wave 3');

// Brooke: preserve all six published functional grades and the optional grade 1–2 overhead-weight observation.
for (let score = 1; score <= 6; score += 1) {
  assert(wave3.includes(`value: '${score}',\n    score: ${score}`), `Brooke grade ${score} is missing`);
}
assert(wave3.includes('BUERS-GRADE'), 'Brooke grade field missing');
assert(wave3.includes('BUERS-WEIGHT'), 'Brooke optional overhead-weight field missing');
assert(wave3.includes('8 أونصات'), 'Brooke 8-oz glass anchor missing');
assert(wave3.includes('لا تنشئ درجات نصفية'), 'Brooke ordinal-scale guardrail missing');
assert(wave3.includes('PMC4147958'), 'Brooke published grading source missing');

// CDC HIV 2014: current surveillance hierarchy, age-specific CD4 thresholds, privacy and non-treatment boundary.
for (const code of ['HIV0-RECENT-NEG', 'HIV0-ALGORITHM', 'HIV0-PRIOR-EVIDENCE', 'HIV3-OI', 'HIV-AGE-BAND', 'HIV-CD4-COUNT', 'HIV-CD4-PCT', 'HIV-STAGE-FINAL']) {
  assert(wave3.includes(code), `CDC HIV staging field missing: ${code}`);
}
for (const threshold of ['≥1500', '750–1499', '≥1000', '500–999', '≥500', '200–499', '<200', '<14%']) {
  assert(wave3.includes(threshold), `CDC HIV age/CD4 threshold missing: ${threshold}`);
}
assert(wave3.includes('180 يومًا'), 'CDC HIV Stage 0 180-day window missing');
assert(wave3.includes('يتقدم على جميع'), 'CDC HIV Stage 0 precedence missing');
assert(wave3.includes('مخصص للمراقبة السكانية وليس لاتخاذ قرارات علاج فردية'), 'CDC HIV surveillance-only boundary missing');
assert(wave3.includes('خصوصية بيانات HIV'), 'CDC HIV privacy guardrail missing');
assert(wave3.includes('https://www.cdc.gov/hiv-data/resources/index.html'), 'CDC current-status source missing');

// KDIGO: keep the current final 2012 staging separate from the 2026 public-review draft.
for (const code of ['AKI-BASELINE-SCR', 'AKI-CURRENT-SCR', 'AKI-SCR-ABS-RISE', 'AKI-SCR-RATIO', 'AKI-UO-RATE', 'AKI-UO-DURATION', 'AKI-ANURIA', 'AKI-RRT', 'AKI-PEDS-EGFR', 'AKI-STAGE']) {
  assert(wave3.includes(code), `KDIGO AKI field missing: ${code}`);
}
for (const criterion of ['≥0.3 mg/dL', '1.5–1.9× baseline', '2.0–2.9× baseline', '≥3.0× baseline', '≥4.0 mg/dL', '<0.5 mL/kg/h', '<0.3 mL/kg/h', 'anuria لمدة ≥12 ساعة', '<35 mL/min/1.73m²']) {
  assert(wave3.includes(criterion), `KDIGO criterion missing: ${criterion}`);
}
assert(wave3.includes('مسودة مراجعة عامة'), 'KDIGO 2026 draft-status warning missing');
assert(wave3.includes('لا تستخدم المرحلة وحدها'), 'KDIGO treatment-decision guardrail missing');

// PCE: document the legacy model without silently turning it into a 2026 lipid-treatment calculator.
for (const code of ['PCE-AGE', 'PCE-SEX', 'PCE-RACE', 'PCE-TC', 'PCE-HDL', 'PCE-SBP', 'PCE-BP-TREATED', 'PCE-DIABETES', 'PCE-SMOKING', 'PCE-RISK', 'PCE-CALCULATOR']) {
  assert(wave3.includes(code), `PCE documentation field missing: ${code}`);
}
assert(wave3.includes('legacy in 2026'), 'PCE legacy-version label missing');
assert(wave3.includes('PREVENT-ASCVD بدل PCE'), '2026 PREVENT-over-PCE guardrail missing');
assert(wave3.includes('لا توجد معادلة PCE مشتقة خصيصًا لها'), 'PCE population-generalizability warning missing');
assert(wave3.includes('لا تنشئ معاملات مختصرة محلية'), 'PCE no-homebrew-calculator guardrail missing');

// Never reproduce instruments already documented as rights-restricted just because the operational library is expanding.
const restrictedSlugs = [...rightsReview.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((match) => match[1]);
for (const restricted of restrictedSlugs) {
  assert(!slugs.includes(restricted), `rights-restricted measure must remain reference-only: ${restricted}`);
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_OPERATIONAL_WAVE3_PASS: ${slugs.length} rights-verified operational materials + source/status/safety boundaries verified.`);
}
