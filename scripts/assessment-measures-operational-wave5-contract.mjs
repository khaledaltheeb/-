import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE5_CONTRACT_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const wave5 = read('lib/assessment-measure-operational-full-forms-wave5.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');

const slugs = [...wave5.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const required = [
  'kdigo-acute-kidney-injury-stage',
  'atlas-cdi-score',
  'valg-small-cell-lung-cancer-staging',
  'hamilton-depression-rating-scale-24',
];

assert(slugs.length === required.length, `expected ${required.length} Wave 5 materials, found ${slugs.length}`);
assert(new Set(slugs).size === slugs.length, 'duplicate Wave 5 slug');
for (const slug of required) assert(slugs.includes(slug), `${slug}: Wave 5 material missing`);
assert(!/http:\/\//.test(wave5), 'all Wave 5 source URLs must use HTTPS');
assert(catalog.includes('assessmentOperationalFullFormsWave5'), 'operational catalog must import Wave 5');
assert(catalog.includes('...assessmentOperationalFullFormsWave5'), 'operational catalog must register Wave 5');

// KDIGO 2012 final criteria: definition, stage thresholds, highest-stage rule and 2026-draft boundary.
for (const code of [
  'KDIGO-DEF-SCR048', 'KDIGO-DEF-SCR15X7D', 'KDIGO-DEF-UO6H', 'KDIGO-AKI-PRESENT',
  'KDIGO-BASELINE-SCR', 'KDIGO-CURRENT-SCR', 'KDIGO-SCR-RATIO', 'KDIGO-SCR-DELTA48',
  'KDIGO-UO-RATE', 'KDIGO-UO-DURATION', 'KDIGO-ANURIA-DURATION', 'KDIGO-RRT', 'KDIGO-PED-EGFR',
  'KDIGO-C-STAGE', 'KDIGO-U-STAGE', 'KDIGO-FINAL-STAGE', 'KDIGO-STAGE-DRIVER',
]) assert(wave5.includes(code), `KDIGO field missing: ${code}`);
for (const token of [
  '≥0.3 mg/dL (≥26.5 µmol/L) خلال 48 ساعة',
  '≥1.5 مرة خط الأساس',
  '<0.5 mL/kg/h لمدة 6 ساعات',
  '1.5–1.9× baseline',
  '2.0–2.9× baseline',
  '≥3.0× baseline',
  '≥4.0 mg/dL (≥353.6 µmol/L)',
  '<0.5 mL/kg/h لمدة 6–12 ساعة',
  '<0.5 mL/kg/h لمدة ≥12 ساعة',
  '<0.3 mL/kg/h لمدة ≥24 ساعة',
  'انقطاع البول ≥12 ساعة',
  'eGFR <35 mL/min/1.73m²',
]) assert(wave5.includes(token), `KDIGO criterion missing: ${token}`);
assert(wave5.includes('المرحلة النهائية وفق أعلى/أسوأ مرحلة'), 'KDIGO highest/worst-stage rule missing');
assert(wave5.includes('مسودة KDIGO 2026 قيد المراجعة العامة'), 'KDIGO 2026 draft-vs-final boundary missing');
assert(wave5.includes('KDIGO-2012-AKI-Guideline-English.pdf'), 'KDIGO 2012 official guideline source missing');
assert(wave5.includes('kidney-disease-improving-global-outcomes-kdigo-aki-stage'), 'KDIGO CDISC public-domain source missing');

// ATLAS: five components only, no temperature in final score, exact 0/1/2 bins and total 0-10.
for (const code of ['ATLAS-AGE', 'ATLAS-TREATMENT', 'ATLAS-WBC', 'ATLAS-ALBUMIN', 'ATLAS-CREAT', 'ATLAS-TOTAL']) assert(wave5.includes(code), `ATLAS field missing: ${code}`);
for (const token of [
  'أقل من 60 سنة', '60–79 سنة', '80 سنة فأكثر',
  '0 — لا', '2 — نعم',
  'أقل من 16,000/µL', '16,000–25,000/µL', 'أكثر من 25,000/µL',
  'أكثر من 35 g/L', '26–35 g/L', '25 g/L أو أقل',
  '≤120 µmol/L', '121–179 µmol/L', '≥180 µmol/L',
]) assert(wave5.includes(token), `ATLAS scoring anchor missing: ${token}`);
assert(wave5.includes('المجموع 0–10'), 'ATLAS 0-10 total range missing');
assert(wave5.includes('الحرارة لا تدخل المجموع النهائي'), 'ATLAS must explicitly exclude temperature from final five-component score');
assert(wave5.includes('لا توجد فئة 1 نقطة لهذا المكون'), 'ATLAS systemic-antibiotic 0-or-2 scoring boundary missing');
assert(wave5.includes('100 − (5.08 × ATLAS)'), 'ATLAS historical cure-regression provenance missing');
assert(wave5.includes('PMC3618004'), 'ATLAS original derivation source missing');

// VALG: preserve limited/extensive framework, boundary cases and modern TNM context.
for (const code of ['VALG-ORIGIN-HEMITHORAX', 'VALG-SUPRACLAVICULAR', 'VALG-CONTRALATERAL-HILAR', 'VALG-PLEURAL-EFFUSION', 'VALG-MASSIVE-TUMOR', 'VALG-DISTANT-METS', 'VALG-RT-PORT', 'VALG-STAGE', 'VALG-TNM']) assert(wave5.includes(code), `VALG field missing: ${code}`);
assert(wave5.includes('Limited-stage') && wave5.includes('Extensive-stage'), 'VALG limited/extensive categories missing');
assert(wave5.includes('M1') && wave5.includes('extensive-stage'), 'VALG distant-metastasis extensive-stage rule missing');
assert(wave5.includes('Boundary / adjudication required'), 'VALG boundary/adjudication option missing');
assert(wave5.includes('لا يوجد تعريف واحد عالمي لجميع الحالات الحدّية'), 'VALG non-universal limited-stage boundary missing');
assert(wave5.includes('لا تستبدل نظام TNM الحديث بتصنيف VALG ثنائي المرحلة'), 'VALG TNM co-staging guardrail missing');
assert(wave5.includes('small-cell-lung-treatment-pdq'), 'VALG current NCI staging source missing');

// HAMD-24: derive 1-17 from the verified HAMD-17 operational sheet, then add exact ranges for items 18-24.
assert(wave5.includes("assessmentOperationalFullFormsWave2['hamilton-depression-rating-scale-17']"), 'HAMD-24 must derive its first 17 items from the verified HAMD-17 sheet');
assert(wave5.includes('hamd17ItemsFor24'), 'HAMD-24 derived first-17 item mapping missing');
for (let i = 18; i <= 24; i += 1) assert(wave5.includes(`HAMD24-${i}`), `HAMD-24 additional item ${i} missing`);
assert(wave5.includes('HAMD24-18-TIME'), 'HAMD-24 diurnal time/direction field missing');
assert(wave5.includes('معلومات وصفية لا تدخل المجموع'), 'HAMD-24 diurnal time must remain non-scored');
assert(wave5.includes('19 و20 و22–24 = 0–4، و21 = 0–2'), 'HAMD-24 item-range provenance missing');
assert(wave5.includes('الحد الأقصى 52') && wave5.includes('0–76'), 'HAMD-24 52-plus-24 / total 0-76 structure missing');
assert(wave5.includes('العجز/الشعور بالعجز Helplessness') && wave5.includes('اليأس Hopelessness') && wave5.includes('انعدام القيمة Worthlessness'), 'HAMD-24 items 22-24 labels missing');
assert(wave5.includes('لا تُعرض على أنها ترجمة عربية محققة'), 'HAMD-24 Arabic validation boundary missing');
assert(wave5.includes('بند الانتحار يُفسر ويُتصرف بشأنه مستقلًا'), 'HAMD-24 suicide safety boundary missing');
assert(wave5.includes('hamilton-depression-rating-scale-24-item'), 'HAMD-24 CDISC public-domain source missing');
assert(wave5.includes('ndar_data_dictionary.html?short_name=hrsd01'), 'HAMD-24 NIMH NDA range/anchor source missing');

// Rights discipline: no copyright-granted/permission-required instruments are reproduced in this public-domain wave.
for (const restricted of [
  'hospital-anxiety-depression-scale',
  'mini-mental-state-examination',
  'montreal-cognitive-assessment',
  'trail-making-test',
  'columbia-suicide-severity-rating-scale',
  'north-star-ambulatory-assessment',
  'timed-25-foot-walk',
]) assert(!wave5.includes(`slug: '${restricted}'`), `restricted/granted tool must not be reproduced in Wave 5: ${restricted}`);

if (!process.exitCode) {
  console.log(`ASSESSMENT_OPERATIONAL_WAVE5_CONTRACT_PASS: ${slugs.length} operational materials verified.`);
}
