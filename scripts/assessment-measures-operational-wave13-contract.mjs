import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`ASSESSMENT_OPERATIONAL_WAVE13_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const framinghamPath = 'lib/assessment-measure-operational-full-forms-wave12.ts';
const atlasHamdPath = 'lib/assessment-measure-operational-full-forms-wave13.ts';
const catalogPath = 'lib/assessment-measure-operational-catalog.ts';
for (const file of [framinghamPath, atlasHamdPath, catalogPath]) assert(exists(file), `required file missing: ${file}`);

const framingham = read(framinghamPath);
const atlasHamd = read(atlasHamdPath);
const catalog = read(catalogPath);

// Framingham: bind the worksheet to the 2008 General CVD lipid model and preserve current-use boundaries.
assert(framingham.includes("'framingham-cvd-10-year-risk': {"), 'Framingham operational worksheet missing');
for (const code of ['FHS-CVD-SEX', 'FHS-CVD-AGE', 'FHS-CVD-TC', 'FHS-CVD-HDL', 'FHS-CVD-SBP', 'FHS-CVD-SBP-TREATED', 'FHS-CVD-SMOKER', 'FHS-CVD-DIABETES']) {
  assert(framingham.includes(`code: '${code}'`), `Framingham input missing: ${code}`);
}
for (const coefficient of ['3.06117', '1.12370', '0.93263', '1.93303', '1.99881', '0.65451', '0.57367', '2.32888', '1.20904', '0.70833', '2.76157', '2.82263', '0.52873', '0.69154', '23.9802', '26.1931']) {
  assert(framingham.includes(coefficient), `Framingham coefficient missing: ${coefficient}`);
}
assert(framingham.includes('0.88936') && framingham.includes('0.95012'), 'Framingham sex-specific baseline survivals missing');
assert(framingham.includes('30–74 سنة'), 'Framingham derivation age boundary missing');
assert(framingham.includes('PREVENT-ASCVD'), 'Framingham 2026 contemporary-risk boundary missing');
assert(framingham.includes('framinghamheartstudy.org'), 'Framingham official source/policy missing');
assert(framingham.includes('18212285'), 'Framingham original publication source missing');

// ATLAS: five-component final score only; temperature must not become a scored sixth component.
assert(atlasHamd.includes("'atlas-cdi-score': {"), 'ATLAS operational worksheet missing');
for (const code of ['ATLAS-AGE', 'ATLAS-TREATMENT', 'ATLAS-WBC', 'ATLAS-ALBUMIN', 'ATLAS-CREAT', 'ATLAS-TOTAL']) {
  assert(atlasHamd.includes(`code: '${code}'`), `ATLAS component missing: ${code}`);
}
assert(atlasHamd.includes('المجموع 0–10') || atlasHamd.includes("max: 10"), 'ATLAS 0-10 total boundary missing');
assert(atlasHamd.includes('الحرارة لا تدخل المجموع النهائي'), 'ATLAS temperature exclusion missing');
assert(atlasHamd.includes('systemic antibiotics') && atlasHamd.includes('0 أو 2'), 'ATLAS systemic-antibiotic scoring boundary missing');
assert(atlasHamd.includes('pmc.ncbi.nlm.nih.gov/articles/PMC3618004'), 'ATLAS derivation source missing');
assert(atlasHamd.includes('age-treatment-systemic-antibiotics-leukocyte-count-serum-albumin-and'), 'ATLAS CDISC Public Domain source missing');

// HAMD-24: 17-item base plus 18-24 extension, with structural-Arabic and suicide safety boundaries.
assert(atlasHamd.includes("'hamilton-depression-rating-scale-24': {"), 'HAMD-24 operational worksheet missing');
for (let i = 1; i <= 24; i += 1) assert(atlasHamd.includes(`HAMD24-${i}`), `HAMD-24 item ${i} missing`);
assert(atlasHamd.includes('HAMD24-18-TIME'), 'HAMD-24 diurnal-variation descriptor missing');
assert(atlasHamd.includes("code: 'HAMD24-TOTAL'") && atlasHamd.includes('max: 76'), 'HAMD-24 0-76 total field missing');
assert(atlasHamd.includes('لا يدخل HAMD24-18-TIME'), 'HAMD-24 item 18 timing exclusion missing');
assert(atlasHamd.includes('ليست ادعاءً بأنها مقابلة عربية منظمة أو ترجمة عربية محققة'), 'HAMD-24 Arabic validation boundary missing');
assert(atlasHamd.includes('بند الانتحار') && atlasHamd.includes('تقييم سلامة'), 'HAMD-24 suicide safety boundary missing');
assert(atlasHamd.includes('hamilton-depression-rating-scale-24-item'), 'HAMD-24 CDISC rights source missing');
assert(atlasHamd.includes('nda.nih.gov'), 'HAMD-24 NIMH data dictionary source missing');

for (const source of [framingham, atlasHamd]) assert(!/http:\/\//.test(source), 'operational sources must use HTTPS');
assert(catalog.includes('assessmentOperationalFullFormsWave12'), 'catalog must retain Wave 12 import/spread');
assert(catalog.includes('assessmentOperationalFullFormsWave13'), 'catalog must retain Wave 13 import/spread');

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_WAVE13_OK framingham=2008_general_cvd atlas=5_component_0-10 hamd24=24_item_0-76 rights_and_version_boundaries=verified');
}
