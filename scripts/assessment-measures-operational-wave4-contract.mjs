import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE4_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const wave4 = read('lib/assessment-measure-operational-full-forms-wave4.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');
const rightsReview = read('lib/assessment-measures-rights-review.ts');

const slugs = [...wave4.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const required = [
  'cdc-hiv-surveillance-stage-2014',
  'kdigo-acute-kidney-injury-stage',
  'ascvd-pooled-cohort-equations-10-year-risk',
];

assert(slugs.length >= required.length, `expected at least ${required.length} Wave-4 materials, found ${slugs.length}`);
for (const slug of required) assert(slugs.includes(slug), `${slug}: Wave-4 material missing`);
assert(new Set(slugs).size === slugs.length, 'duplicate slug in Wave 4');
assert(!/http:\/\//.test(wave4), 'Wave-4 sources must use HTTPS');
assert(catalog.includes('assessmentOperationalFullFormsWave4'), 'operational catalog must import Wave 4');
assert(catalog.includes('...assessmentOperationalFullFormsWave4'), 'operational catalog must register Wave 4');

// CDC HIV 2014 — complete precedence logic, age-specific thresholds, privacy, surveillance-only boundary.
for (const code of ['HIV0-RECENT-NEG', 'HIV0-ALGORITHM', 'HIV0-PRIOR-EVIDENCE', 'HIV3-OI', 'HIV-AGE-BAND', 'HIV-CD4-COUNT', 'HIV-CD4-PCT', 'HIV-STAGE-FINAL', 'HIV-STAGE-BASIS']) {
  assert(wave4.includes(code), `CDC HIV field missing: ${code}`);
}
for (const threshold of ['≥1500', '750–1499', '<750', '≥1000', '500–999', '<500', '≥500', '200–499', '<200', '≥34%', '26–33%', '≥30%', '22–29%', '≥26%', '14–25%', '<14%']) {
  assert(wave4.includes(threshold), `CDC HIV threshold missing: ${threshold}`);
}
assert(wave4.includes('180 يومًا'), 'CDC HIV Stage 0 180-day window missing');
assert(wave4.includes('بأكثر من 60 يومًا'), 'CDC HIV Stage 0 prior-evidence exception missing');
assert(wave4.includes('يتقدم على جميع المراحل الأخرى'), 'CDC HIV Stage 0 precedence missing');
assert(wave4.includes('مخصص للمراقبة السكانية وليس لاتخاذ قرار علاجي فردي'), 'CDC HIV surveillance-only boundary missing');
assert(wave4.includes('سرية بيانات HIV'), 'CDC HIV privacy guardrail missing');
assert(wave4.includes('https://www.cdc.gov/hiv-data/resources/index.html'), 'CDC current-status source missing');

// KDIGO — preserve current final 2012 criteria and explicitly isolate the 2026 public-review draft.
for (const code of ['AKI-BASELINE-SCR', 'AKI-CURRENT-SCR', 'AKI-SCR-ABS-RISE', 'AKI-SCR-RATIO', 'AKI-UO-RATE', 'AKI-UO-DURATION', 'AKI-ANURIA', 'AKI-RRT', 'AKI-PEDS-EGFR', 'AKI-STAGE', 'AKI-STAGE-BASIS']) {
  assert(wave4.includes(code), `KDIGO AKI field missing: ${code}`);
}
for (const criterion of ['≥0.3 mg/dL', '1.5–1.9× baseline', '2.0–2.9× baseline', '≥3.0× baseline', '≥4.0 mg/dL', '<0.5 mL/kg/h', '<0.3 mL/kg/h', 'anuria لمدة ≥12 ساعة', 'eGFR <35 mL/min/1.73m²']) {
  assert(wave4.includes(criterion), `KDIGO criterion missing: ${criterion}`);
}
assert(wave4.includes('مسودة مراجعة عامة'), 'KDIGO 2026 draft-status warning missing');
assert(wave4.includes('لا تستخدم المرحلة وحدها'), 'KDIGO no-standalone-treatment-decision boundary missing');
assert(wave4.includes('https://kdigo.org/guidelines/acute-kidney-injury/'), 'KDIGO authoritative hub missing');

// PCE — all original inputs, traceability, population boundary, and 2026 PREVENT migration warning.
for (const code of ['PCE-AGE', 'PCE-SEX', 'PCE-RACE', 'PCE-TC', 'PCE-HDL', 'PCE-SBP', 'PCE-BP-TREATED', 'PCE-DIABETES', 'PCE-SMOKING', 'PCE-RISK', 'PCE-CALCULATOR']) {
  assert(wave4.includes(code), `PCE documentation field missing: ${code}`);
}
assert(wave4.includes('legacy model in 2026'), 'PCE legacy-version label missing');
assert(wave4.includes('PREVENT-ASCVD بدل PCE'), 'PCE 2026 PREVENT replacement warning missing');
assert(wave4.includes('لم تُشتق لها معادلة PCE مستقلة'), 'PCE population-generalizability boundary missing');
assert(wave4.includes('لا تنشئ معاملات مختصرة محلية'), 'PCE no-homebrew-calculator boundary missing');
assert(wave4.includes('https://tools.acc.org/ascvd-risk-estimator/default.aspx'), 'ACC legacy PCE implementation link missing');
assert(wave4.includes('2026-guideline-on-the-management-of-dyslipidemia'), '2026 dyslipidemia source missing');

// Restricted instruments documented in the rights review must stay out of public-domain full-form waves.
const restrictedSlugs = [...rightsReview.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((match) => match[1]);
for (const restricted of restrictedSlugs) {
  assert(!slugs.includes(restricted), `rights-restricted measure must remain reference-only: ${restricted}`);
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_OPERATIONAL_WAVE4_PASS: ${slugs.length} operational materials + thresholds + source/status/safety boundaries verified.`);
}
