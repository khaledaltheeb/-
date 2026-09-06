import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE16_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const form = read('lib/assessment-measure-operational-full-forms-wave16.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');
const slugs = [
  'apache-ii',
  'model-for-end-stage-liver-disease',
  'assign-cardiovascular-risk-score',
  'observer-global-impression',
  'modified-van-assche-index',
];
for (const slug of slugs) assert(form.includes(`'${slug}': {`), `missing operational material: ${slug}`);
assert(new Set([...form.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1])).size === 5, 'Wave 16 must contain exactly five top-level measures');
assert(!/http:\/\//.test(form), 'all Wave 16 sources must use HTTPS');

// APACHE II: classic 0-71 score, worst first-24h values, no individual mortality calculator.
for (const code of ['APACHE-TEMP','APACHE-MAP','APACHE-HR','APACHE-RR','APACHE-OXYGEN','APACHE-PH','APACHE-NA','APACHE-K','APACHE-CREAT-BASE','APACHE-ARF','APACHE-HCT','APACHE-WBC','APACHE-GCS-ACTUAL','APACHE-GCS-POINTS','APACHE-AGE-POINTS','APACHE-CHRONIC','APACHE-TOTAL']) {
  assert(form.includes(`code: '${code}'`), `APACHE II field missing: ${code}`);
}
assert(form.includes('0–71') && form.includes('15 − GCS'), 'APACHE II total/GCS rules missing');
assert(form.includes('تضاعف نقاط الكرياتينين'), 'APACHE II acute renal failure doubling rule missing');
assert(form.includes('FiO₂ ≥0.50') && form.includes('A-aDO₂') && form.includes('PaO₂'), 'APACHE II oxygenation branch missing');
assert(form.includes('لا تحول الدرجة هنا إلى احتمال وفاة فردي'), 'APACHE II individual mortality boundary missing');
assert(form.includes('RS v2.1') && form.includes('20 May 2025'), 'APACHE II current CDISC version provenance missing');

// MELD: current policy handoff, not a versionless calculator.
for (const code of ['MELD30-AGE','MELD30-SEX','MELD30-BILI','MELD30-NA','MELD30-INR','MELD30-ALBUMIN','MELD30-CREAT','MELD30-DIALYSIS','MELD30-OFFICIAL']) {
  assert(form.includes(`code: '${code}'`), `MELD 3.0 field missing: ${code}`);
}
assert(form.includes('13 Jul 2023'), 'MELD 3.0 OPTN effective-date boundary missing');
for (const token of ['125 و137', '1.5 و3.5', 'creatinine عند 3']) assert(form.includes(token), `MELD 3.0 policy clamp/rule missing: ${token}`);
assert(form.includes('حاسبة OPTN الحالية') && form.includes('لا تحسب النتيجة يدويًا'), 'MELD official-calculator handoff missing');

// ASSIGN v2.0: Scotland-only calibration and official calculator handoff.
for (const code of ['ASSIGN2-AGE','ASSIGN2-SEX','ASSIGN2-TC','ASSIGN2-HDL','ASSIGN2-SBP','ASSIGN2-DM','ASSIGN2-FHX','ASSIGN2-CIG','ASSIGN2-SIMD','ASSIGN2-OFFICIAL']) {
  assert(form.includes(`code: '${code}'`), `ASSIGN v2.0 field missing: ${code}`);
}
assert(form.includes('≥10%') && form.includes('SIMD 2020'), 'ASSIGN v2.0 threshold/SIMD boundary missing');
assert(form.includes('لا تستخدمه كحاسبة مخاطر محلية للأردن'), 'ASSIGN external-calibration guardrail missing');
assert(form.includes('Class 1') && form.includes('MHRA'), 'ASSIGN regulated-calculator context missing');

// OGI: preserve observer source and protocol-defined anchor rather than inventing a universal Arabic form.
for (const code of ['OGI-CONCEPT','OGI-RECALL','OGI-ANCHOR-VERSION','OGI-SEVERITY','OGI-CHANGE','OGI-OBSERVABILITY']) {
  assert(form.includes(`code: '${code}'`), `OGI field missing: ${code}`);
}
assert(form.includes('CDISC OGI QS v1.0') && form.includes('20 Oct 2024'), 'OGI version/release provenance missing');
assert(form.includes('لا تخلط OGI مع Patient Global Impression أو Clinical Global Impression'), 'OGI source-of-report boundary missing');
assert(form.includes('لا توجد عتبة عربية عامة'), 'OGI Arabic/general threshold guardrail missing');

// mVAI: pin to Samaan 2017 reduced five-component model and preserve 19.5-vs-20 reporting nuance.
for (const code of ['MVAI-EXT','MVAI-T2','MVAI-PROCTITIS','MVAI-MASS','MVAI-DOMINANT','MVAI-TOTAL']) {
  assert(form.includes(`code: '${code}'`), `mVAI field missing: ${code}`);
}
for (const weight of ['1.5×Extension','2.3×T2 hyperintensity','1.0×rectal wall involvement/proctitis','1.2×inflammatory mass','1.2×dominant feature']) {
  assert(form.includes(weight), `mVAI reduced-model weight missing: ${weight}`);
}
assert(form.includes('الحد الحسابي الأقصى') && form.includes('19.5') && form.includes('0–20'), 'mVAI arithmetic/reporting range nuance missing');
assert(form.includes('لا تخلطه مع Van Assche الأصلي 0–22'), 'mVAI version-mixing guardrail missing');
assert(form.includes('جزئية التحقق'), 'mVAI partial-validation boundary missing');

for (const restricted of ['hospital-anxiety-and-depression-scale', 'trail-making-test', 'montreal-cognitive-assessment', 'columbia-suicide-severity-rating-scale']) {
  assert(!form.includes(`'${restricted}': {`), `restricted instrument must not be introduced in Wave 16: ${restricted}`);
}

assert(catalog.includes("assessmentOperationalFullFormsWave16 } from '@/lib/assessment-measure-operational-full-forms-wave16'"), 'Wave 16 catalog import missing');
assert(catalog.includes('...assessmentOperationalFullFormsWave16'), 'Wave 16 catalog registration missing');

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_WAVE16_OK measures=5 apache=0-71_no_mortality meld3=official_handoff assign2=scotland_handoff ogi=observer_protocol mvai=samaan2017_reduced_model');
}
