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

const formPath = 'lib/assessment-measure-operational-full-forms-wave12.ts';
const catalogPath = 'lib/assessment-measure-operational-catalog.ts';
const measurePath = 'lib/assessment-measures-wave8.ts';

for (const file of [formPath, catalogPath, measurePath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const form = read(formPath);
const catalog = read(catalogPath);
const measure = read(measurePath);

assert(form.includes("'framingham-cvd-10-year-risk': {"), 'Framingham operational record missing');
assert(form.includes("kind: 'scoring-form'"), 'Framingham must remain a scoring worksheet');
assert(form.includes("completeness: 'standardized-protocol-sheet'"), 'Framingham must not present as an automatic exact calculator');
assert(form.includes('D’Agostino et al. 2008 General CVD primary lipid model'), 'Framingham exact model/version missing');
assert(form.includes('لا تخلطه بنموذج BMI') || form.includes('لا تخلطه مع CHD'), 'Framingham model-family boundary missing');

for (const code of [
  'FHS-CVD-SEX',
  'FHS-CVD-AGE',
  'FHS-CVD-TC',
  'FHS-CVD-HDL',
  'FHS-CVD-SBP',
  'FHS-CVD-SBP-TREATED',
  'FHS-CVD-SMOKER',
  'FHS-CVD-DIABETES',
]) {
  assert(form.includes(`code: '${code}'`), `Framingham required input missing: ${code}`);
}
assert(form.includes('min: 30') && form.includes('max: 74'), 'Framingham validated age range 30-74 missing');
assert(form.includes("unit: 'mg/dL'") && form.includes("unit: 'mmHg'"), 'Framingham official units missing');

const maleCoefficients = ['3.06117', '1.12370', '-0.93263', '1.93303', '1.99881', '0.65451', '0.57367'];
const femaleCoefficients = ['2.32888', '1.20904', '-0.70833', '2.76157', '2.82263', '0.52873', '0.69154'];
for (const coefficient of [...maleCoefficients, ...femaleCoefficients]) {
  const normalized = coefficient.startsWith('-') ? coefficient.slice(1) : coefficient;
  assert(form.includes(normalized), `Framingham coefficient missing: ${coefficient}`);
}
for (const token of ['0.88936', '23.9802', '0.95012', '26.1931']) {
  assert(form.includes(token), `Framingham baseline survival/mean term missing: ${token}`);
}
assert(form.includes('اللوغاريتم الطبيعي ln') && form.includes('exp'), 'Framingham log/exp calculation instructions missing');
assert(form.includes('اضرب الناتج في 100'), 'Framingham percent conversion missing');

assert(form.includes('available for public use') || form.includes('متاحة للاستخدام العام'), 'Framingham official public-use policy missing');
assert(form.includes('لا تتطلب إذنًا خاصًا أو رسوم ترخيص') || form.includes('دون إذن أو رسوم'), 'Framingham no-permission/no-fee policy missing');
assert(form.includes('لا يدعي') || form.includes('يمنع أي ادعاء') || form.includes('يؤيد موقع روافد'), 'Framingham no-endorsement boundary missing');
assert(form.includes('framinghamheartstudy.org/fhs-for-researchers/fhs-risk-functions/cardiovascular-disease-10-year-risk'), 'official Framingham coefficient page missing');
assert(form.includes('framingham-risk-score-policy'), 'official Framingham policy page missing');

assert(form.includes('PREVENT-ASCVD') && form.includes('2026'), 'Framingham contemporary PREVENT boundary missing');
assert(form.includes('30–74') && form.includes('دون CVD'), 'Framingham population eligibility boundary missing');
assert(form.includes('المعايرة') && form.includes('مجتمعات عربية'), 'Framingham Arabic/local calibration warning missing');
assert(form.includes('لا تستخدم الورقة لإهمال ألم صدري') || form.includes('أعراض سكتة'), 'Framingham acute-symptom safety boundary missing');

assert(measure.includes("slug: 'framingham-cvd-10-year-risk'"), 'Framingham catalog record missing');
assert(measure.includes('روافد لا تقدم حاسبة Framingham فردية عامة'), 'Framingham catalog must retain no-generic-calculator safety boundary');
assert(measure.includes("rightsStatus: 'public-domain'"), 'Framingham catalog Public Domain status must remain intact');

assert(catalog.includes("assessmentOperationalFullFormsWave12 } from '@/lib/assessment-measure-operational-full-forms-wave12'"), 'operational catalog Wave 12 import missing');
assert(catalog.includes('...assessmentOperationalFullFormsWave12'), 'operational catalog Wave 12 spread missing');

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_WAVE13_OK framingham_inputs=8 age=30-74 model=2008-general-CVD-lipid coefficients=official rights=public-use-no-fee safety=legacy-not-current-default');
}
