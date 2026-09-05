import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE6_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const wave6 = read('lib/assessment-measure-operational-full-forms-wave6.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');
const rightsReview = read('lib/assessment-measures-rights-review.ts');

const slugs = [...wave6.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const required = [
  'roland-morris-disability-questionnaire-24',
  'west-haven-hepatic-encephalopathy-grade',
  'tanner-scale-boy',
  'tanner-scale-girl',
  'valg-small-cell-lung-cancer-staging',
  'sofa-27mar2024',
];

assert(slugs.length === required.length, `expected exactly ${required.length} Wave-6 materials, found ${slugs.length}`);
for (const slug of required) assert(slugs.includes(slug), `${slug}: Wave-6 material missing`);
assert(new Set(slugs).size === slugs.length, 'duplicate slug in Wave 6');
assert(!/http:\/\//.test(wave6), 'Wave-6 sources must use HTTPS');
assert(catalog.includes('assessmentOperationalFullFormsWave6'), 'operational catalog must import Wave 6');
assert(catalog.includes('...assessmentOperationalFullFormsWave6'), 'operational catalog must register Wave 6');

// RMDQ-24 must be one canonical form, not a second diverging copy of the same 24 items.
assert(wave6.includes("const rmdq24Canonical = assessmentOperationalFullFormsWave1['roland-morris-disability-questionnaire']"), 'RMDQ-24 must reuse the canonical full Wave-1 form');
assert(wave6.includes('canonical alias'), 'RMDQ-24 alias status must be explicit');
assert(wave6.includes('لا توجد نسختان مختلفتان من البنود'), 'RMDQ-24 anti-divergence statement missing');

// West Haven: complete grades, objective observations, covert/overt distinction and ammonia/alternative-cause boundaries.
for (const score of [0, 1, 2, 3, 4]) assert(wave6.includes(`score: ${score}`), `West Haven/Tanner/SOFA score ${score} representation missing`);
for (const code of ['WH-CONSCIOUSNESS', 'WH-ORIENT-TIME', 'WH-ORIENT-PLACE', 'WH-ATTENTION', 'WH-SLEEP', 'WH-BEHAVIOR', 'WH-ASTERIXIS', 'WH-ALT-CAUSES', 'WH-GRADE']) {
  assert(wave6.includes(code), `West Haven field missing: ${code}`);
}
assert(wave6.includes('minimal HE وGrade I'), 'West Haven covert HE distinction missing');
assert(wave6.includes('Grades II–IV'), 'West Haven overt HE distinction missing');
assert(wave6.includes('لا تستخدم مستوى الأمونيا وحده'), 'West Haven ammonia-alone boundary missing');
assert(wave6.includes('أسباب بديلة'), 'West Haven alternative-cause evaluation missing');
assert(wave6.includes('west-haven-hepatic-encephalopathy-grade'), 'West Haven CDISC source missing');

// Tanner: both sex-specific forms, two independent domains, no image workflow and explicit safeguarding.
for (const code of ['TANNER-B-GENITAL', 'TANNER-B-PH', 'TANNER-G-BREAST', 'TANNER-G-PH']) {
  assert(wave6.includes(code), `Tanner field missing: ${code}`);
}
for (let stage = 1; stage <= 5; stage += 1) {
  assert(wave6.includes(`value: '${stage}', score: ${stage}`), `Tanner stage ${stage} missing`);
}
assert(wave6.includes('لا تحسب متوسطًا'), 'Tanner must reject a synthetic combined score');
assert(wave6.includes('لا تلتقط أو ترفع أو تحتفظ بصور'), 'Tanner no-image safeguard missing');
assert(wave6.includes('chaperone'), 'Tanner chaperone safeguard missing');
assert(wave6.includes('assent'), 'Tanner age-appropriate assent safeguard missing');
assert(wave6.includes('لا تستخدم Tanner stage لإثبات أو نفي نشاط جنسي أو إساءة'), 'Tanner misuse boundary missing');
assert(wave6.includes('safeguarding مستقل'), 'Tanner safeguarding escalation boundary missing');

// VALG: binary classification must coexist with current TNM and preserve staging uncertainty.
for (const code of ['VALG-ORIGIN-HEMITHORAX', 'VALG-CONTRA', 'VALG-PLEURAL', 'VALG-DISTANT', 'VALG-STAGE', 'VALG-TNM', 'VALG-RT-FIELD']) {
  assert(wave6.includes(code), `VALG field missing: ${code}`);
}
assert(wave6.includes('Limited-stage'), 'VALG limited-stage option missing');
assert(wave6.includes('Extensive-stage'), 'VALG extensive-stage option missing');
assert(wave6.includes('M1'), 'VALG distant-metastasis boundary missing');
assert(wave6.includes('لا تجعل limited/extensive بديلًا عن TNM'), 'VALG TNM coexistence boundary missing');
assert(wave6.includes('https://www.cancer.gov/types/lung/hp/small-cell-lung-treatment-pdq'), 'VALG NCI professional source missing');

// SOFA 27MAR2024: all six organ systems, raw data, 0–24 total and strict legacy/SOFA-2 boundary.
for (const code of ['SOFA-PF', 'SOFA-RESP-SUPPORT', 'SOFA-PLT', 'SOFA-BILI', 'SOFA-MAP', 'SOFA-VASO', 'SOFA-GCS-RAW', 'SOFA-CREAT', 'SOFA-UO', 'SOFA-RESP', 'SOFA-COAG', 'SOFA-LIVER', 'SOFA-CARDIO', 'SOFA-CNS', 'SOFA-RENAL', 'SOFA-TOTAL']) {
  assert(wave6.includes(code), `SOFA field missing: ${code}`);
}
for (const criterion of ['PaO₂/FiO₂ ≥400', 'PaO₂/FiO₂ <100', 'الصفائح <20', '≥12.0 mg/dL', 'dopamine >15', 'GCS <6', 'urine output <200 mL/day']) {
  assert(wave6.includes(criterion), `SOFA criterion missing: ${criterion}`);
}
assert(wave6.includes("unit: '/24'"), 'SOFA total range/unit missing');
assert(wave6.includes('SOFA-2'), 'SOFA-2 update boundary missing');
assert(wave6.includes('legacy after SOFA-2 publication'), 'SOFA legacy-version label missing');
assert(wave6.includes('لا تستخدم SOFA وحده لتشخيص الإنتان أو لاستبعاد العلاج أو لتقرير سحب الدعم الحيوي'), 'SOFA no-denial/no-withdrawal boundary missing');
assert(wave6.includes('لا تحول روافد SOFA إلى حاسبة وفاة فردية'), 'SOFA individual-mortality-calculator prohibition missing');
assert(wave6.includes('jamanetwork.com/journals/jama/fullarticle/2840822'), 'SOFA-2 JAMA source missing');

// Restricted instruments remain reference-only and cannot accidentally enter the full-form wave.
const restrictedSlugs = [...rightsReview.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((match) => match[1]);
for (const restricted of restrictedSlugs) {
  assert(!slugs.includes(restricted), `rights-restricted measure must remain reference-only: ${restricted}`);
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_OPERATIONAL_WAVE6_PASS: ${slugs.length} operational materials + canonicalization + rights + safety + version boundaries verified.`);
}
