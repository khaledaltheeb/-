import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE7_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const wave7 = read('lib/assessment-measure-operational-full-forms-wave7.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');
const rightsReview = read('lib/assessment-measures-rights-review.ts');

const slugs = [...wave7.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const required = [
  'rivermead-post-concussion-questionnaire',
  'minnesota-tobacco-withdrawal-scale-revised',
  'disease-steps',
  'controlled-oral-word-association-test',
  'general-clinical-global-impression',
];

assert(slugs.length === required.length, `expected exactly ${required.length} Wave-7 materials, found ${slugs.length}`);
for (const slug of required) assert(slugs.includes(slug), `${slug}: Wave-7 material missing`);
assert(new Set(slugs).size === slugs.length, 'duplicate slug in Wave 7');
assert(!/http:\/\//.test(wave7), 'Wave-7 sources must use HTTPS');
assert(catalog.includes('assessmentOperationalFullFormsWave7'), 'operational catalog must import Wave 7');
assert(catalog.includes('...assessmentOperationalFullFormsWave7'), 'operational catalog must register Wave 7');

// RPQ: 16 symptoms, exact response semantics, rating 1 excluded from scores, 0–64 total and optional other-difficulty exclusion.
for (let index = 1; index <= 16; index += 1) {
  const code = `RPQ${String(index).padStart(2, '0')}`;
  assert(wave7.includes(code), `RPQ item missing: ${code}`);
}
assert(wave7.includes('ليس مشكلة أكثر مما كان عليه قبل الإصابة'), 'RPQ rating-1 meaning missing');
assert(wave7.includes('أعد ترميز كل استجابة 1 إلى 0'), 'RPQ 1-to-0 scoring rule missing');
assert(wave7.includes('النطاق 0–64'), 'RPQ total range missing');
assert(wave7.includes('RPQ-3'), 'RPQ-3 subscore missing');
assert(wave7.includes('RPQ-13'), 'RPQ-13 subscore missing');
assert(wave7.includes('لا تدخل حقول «صعوبات أخرى» في المجموع'), 'RPQ other-difficulties exclusion missing');
assert(wave7.includes('FITBIR'), 'RPQ FITBIR provenance missing');

// MTWS-R: exactly eight owner-defined core symptoms plus seven candidates, complete 15-item form and explicit source-discrepancy handling.
const coreCodes = [
  'MTWS-CORE-ANGER', 'MTWS-CORE-ANX', 'MTWS-CORE-DEP', 'MTWS-CORE-CONC',
  'MTWS-CORE-APP', 'MTWS-CORE-SLEEP', 'MTWS-CORE-REST', 'MTWS-CORE-CRAVE',
];
const candidateCodes = [
  'MTWS-CAND-IMP', 'MTWS-CAND-CONST', 'MTWS-CAND-DIZZ', 'MTWS-CAND-COUGH',
  'MTWS-CAND-DREAM', 'MTWS-CAND-NAUSEA', 'MTWS-CAND-THROAT',
];
for (const code of [...coreCodes, ...candidateCodes]) assert(wave7.includes(code), `MTWS-R item missing: ${code}`);
assert(coreCodes.length + candidateCodes.length === 15, 'MTWS-R contract must represent 15 symptoms');
for (const score of [0, 1, 2, 3, 4]) assert(wave7.includes(`score: ${score}`), `0–4 response anchor missing: ${score}`);
assert(wave7.includes('ثمانية أعراض أساسية'), 'MTWS-R core-eight distinction missing');
assert(wave7.includes('سبعة أعراض مرشحة إضافية'), 'MTWS-R seven-candidate distinction missing');
assert(wave7.includes('MTWS-CORE8-MEAN'), 'MTWS-R core-eight mean field missing');
assert(wave7.includes('PhenX في صفحته المحدثة لعام 2026'), 'MTWS-R PhenX/UVM scoring discrepancy disclosure missing');
assert(wave7.includes('لا تغيّر قاعدة المجموع بين الزيارات'), 'MTWS-R longitudinal scoring-version guardrail missing');

// Disease Steps: complete 0–6 + U classification and 25-foot aid distinctions; must remain distinct from PDDS.
for (const value of ['0', '1', '2', '3', '4', '5', '6', 'U']) {
  assert(wave7.includes(`value: '${value}'`), `Disease Steps grade missing: ${value}`);
}
for (const code of ['DS-25FT', 'DS-AID', 'DS-GRADE', 'DS-BASIS']) assert(wave7.includes(code), `Disease Steps field missing: ${code}`);
assert(wave7.includes('≥25 قدمًا بدونه'), 'Disease Steps early-cane 25-foot criterion missing');
assert(wave7.includes('لا يستطيع المشي 25 قدمًا بدونه'), 'Disease Steps late-cane criterion missing');
assert(wave7.includes('دعمًا ثنائيًا للمشي 25 قدمًا'), 'Disease Steps bilateral-support criterion missing');
assert(wave7.includes('لا تخلط Disease Steps clinician scale مع Patient Determined Disease Steps'), 'Disease Steps/PDDS separation missing');

// COWAT: language/version-aware recording sheet, not a fabricated Arabic FAS translation.
for (const code of ['COWAT-PROTOCOL', 'COWAT-LANGUAGE', 'COWAT-LETTERS', 'COWAT-SECONDS', 'COWAT-NORM', 'COWAT-TOTAL']) {
  assert(wave7.includes(code), `COWAT protocol field missing: ${code}`);
}
for (const suffix of ['L1', 'L2', 'L3']) {
  for (const field of ['', '-WORDS', '-CORRECT', '-REPEAT', '-PROPER', '-RULE']) {
    assert(wave7.includes(`COWAT-${suffix}${field}`), `COWAT round field missing: COWAT-${suffix}${field}`);
  }
}
assert(wave7.includes('60 ثانية لكل حرف'), 'COWAT FAS timing note missing');
assert(wave7.includes('لا تترجم F-A-S حرفيًا'), 'COWAT no-direct-Arabic-letter-translation guardrail missing');
assert(wave7.includes('لا تعتبر F-A-S مرادفًا عالميًا لكل COWAT'), 'COWAT FAS non-universality guardrail missing');
assert(wave7.includes('مرجع معياري ملائم للعمر والتعليم واللغة'), 'COWAT normative-context requirement missing');

// GCGI: pain-specific ACTTION/STANDARDS questionnaire, all five tests, exact scale families, and hard separation from NIMH CGI.
for (const code of ['GCGI0101', 'GCGI0102', 'GCGI0103', 'GCGI0104', 'GCGI0105', 'GCGI-REFERENCE']) {
  assert(wave7.includes(code), `GCGI field missing: ${code}`);
}
assert(wave7.includes('ACTTION/STANDARDS'), 'GCGI ACTTION/STANDARDS provenance missing');
assert(wave7.includes('Global Severity of Pain'), 'GCGI pain-severity test missing');
assert(wave7.includes('Global Improvement of Pain'), 'GCGI pain-improvement test missing');
assert(wave7.includes('Global Disease Status of Pain'), 'GCGI pain-disease-status test missing');
assert(wave7.includes('Pain Treatment Preference'), 'GCGI treatment-preference test missing');
assert(wave7.includes('Global Rating of Pain Medication'), 'GCGI pain-medication-rating test missing');
assert(wave7.includes('Normal, not at all ill'), 'GCGI severity low anchor missing');
assert(wave7.includes('Among the most extremely ill patients'), 'GCGI severity high anchor missing');
assert(wave7.includes('Very much improved'), 'GCGI improvement low anchor missing');
assert(wave7.includes('Very much worse'), 'GCGI improvement high anchor missing');
assert(wave7.includes('Much better than'), 'GCGI treatment-preference high anchor missing');
assert(wave7.includes('لا تجمع البنود الخمسة في total score'), 'GCGI no-total-score rule missing');
assert(wave7.includes('لا تخلط GCGI pain v1 مع Clinical Global Impression'), 'GCGI/CGI separation missing');
assert(wave7.includes('هذا السجل يصحح الالتباس'), 'GCGI corrective provenance disclosure missing');

// Rights-restricted instruments remain out of public full-form waves.
const restrictedSlugs = [...rightsReview.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((match) => match[1]);
for (const restricted of restrictedSlugs) {
  assert(!slugs.includes(restricted), `rights-restricted measure must remain reference-only: ${restricted}`);
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_OPERATIONAL_WAVE7_PASS: ${slugs.length} operational materials + scoring/version/language/rights boundaries verified.`);
}
