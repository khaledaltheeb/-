import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_FULL_FORMS_WAVE2_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const wave2 = read('lib/assessment-measure-operational-full-forms-wave2.ts');
const operationalCatalog = read('lib/assessment-measure-operational-catalog.ts');
const measuresCatalog = read('lib/assessment-measures-catalog.ts');

const slugs = [...wave2.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const required = [
  'patient-health-questionnaire-15',
  'hamilton-anxiety-rating-scale',
  'satisfaction-with-life-scale',
  'clinical-global-impression',
  'bode-index',
  'harvey-bradshaw-index',
  'child-pugh-classification',
  'rutgeerts-score',
  'kdigo-aki-stage',
  'west-haven-hepatic-encephalopathy-grade',
  'psoriasis-area-severity-index-fredriksson',
  'vignos-lower-extremity-rating-scale',
];
assert(slugs.length >= required.length, `expected at least ${required.length} Wave-2 forms, found ${slugs.length}`);
assert(new Set(slugs).size === slugs.length, 'duplicate Wave-2 operational slug');
for (const slug of required) assert(slugs.includes(slug), `${slug}: Wave-2 operational material missing`);
assert(!/http:\/\//.test(wave2), 'Wave-2 sources must use HTTPS');

assert(operationalCatalog.includes('assessmentOperationalFullFormsWave2'), 'operational catalog must import Wave 2');
assert(operationalCatalog.includes('...assessmentOperationalFullFormsWave2'), 'Wave 2 must override fallback through explicit operational catalog');

// PHQ-15 — 15 symptoms, 0-2 response and total 0-30.
for (let i = 1; i <= 15; i += 1) assert(wave2.includes(`PHQ15-${i}`), `PHQ-15 item ${i} missing`);
assert(wave2.includes('النطاق 0–30'), 'PHQ-15 total range missing');
assert(wave2.includes('الأسابيع الأربعة الماضية'), 'PHQ-15 four-week reference period missing');
assert(wave2.includes('APRON_forms_nocopyright.pdf'), 'PHQ-15 no-copyright NIH form source missing');
assert(wave2.includes('لا تستخدم PHQ-15 لإثبات أن الأعراض «نفسية»'), 'PHQ-15 organic-disease safety boundary missing');

// HAM-A — 14 domains, 0-4, total 0-56 and clinician-rated boundary.
for (let i = 1; i <= 14; i += 1) assert(wave2.includes(`HAMA${i}`), `HAM-A domain ${i} missing`);
assert(wave2.includes('النطاق 0–56'), 'HAM-A total range missing');
assert(wave2.includes('مُقيّم سريريًا'), 'HAM-A clinician-rated boundary missing');

// SWLS — authoritative author terms override secondary Public Domain classification.
for (let i = 1; i <= 5; i += 1) assert(wave2.includes(`SWLS${i}`), `SWLS item ${i} missing`);
assert(wave2.includes('النطاق 5–35'), 'SWLS total range missing');
assert(wave2.includes('غير التجاري مع النسبة'), 'SWLS non-commercial attribution condition missing from operational form');
assert(wave2.includes('https://eddiener.com/satisfaction-with-life-scale-swls/'), 'SWLS official author source missing');
assert(measuresCatalog.includes("'satisfaction-with-life-scale': {"), 'SWLS canonical rights override missing');
assert(measuresCatalog.includes("rightsStatus: 'open-reuse'"), 'SWLS canonical rights status must be open-reuse, not Public Domain');
assert(measuresCatalog.includes('Copyrighted — free non-commercial use with attribution'), 'SWLS canonical rights label missing');
assert(measuresCatalog.includes('لا تصف المقياس بأنه Public Domain'), 'SWLS conservative rights rationale missing');

// CGI — three components and no combined total.
for (const code of ['CGI-S', 'CGI-I', 'CGI-E-BENEFIT', 'CGI-E-AE']) assert(wave2.includes(code), `CGI component missing: ${code}`);
assert(wave2.includes('لا يوجد CGI Total واحد معتمد'), 'CGI no-total rule missing');
assert(wave2.includes('مصفوفة فائدة × آثار جانبية'), 'CGI-E matrix boundary missing');

// BODE — exact four-component thresholds and no individual mortality calculator.
for (const code of ['BODE-BMI', 'BODE-FEV1', 'BODE-6MWD', 'BODE-MMRC']) assert(wave2.includes(code), `BODE component missing: ${code}`);
for (const threshold of ['≥65% = 0', '50–64% = 1', '36–49% = 2', '≤35% = 3', '≥350 م = 0', '250–349 م = 1', '150–249 م = 2', '≤149 م = 3', '>21 = 0 نقطة', '≤21 = 1 نقطة']) assert(wave2.includes(threshold), `BODE threshold missing: ${threshold}`);
assert(wave2.includes('النطاق 0–10'), 'BODE total range missing');
assert(wave2.includes('لا تنشر روافد حاسبة وفاة'), 'BODE individual mortality boundary missing');

// HBI — original five components, liquid stools counted individually, complications 1 point each.
for (const code of ['HBI-WELL', 'HBI-PAIN', 'HBI-STOOLS', 'HBI-MASS']) assert(wave2.includes(code), `HBI component missing: ${code}`);
for (let i = 1; i <= 8; i += 1) assert(wave2.includes(`HBI-C${i}`), `HBI complication ${i} missing`);
assert(wave2.includes('نقطة واحدة لكل مرة براز سائل'), 'HBI liquid-stool per-event scoring missing');
assert(wave2.includes('المجموع = الرفاه + ألم البطن + عدد البراز السائل + كتلة البطن + عدد المضاعفات'), 'HBI additive formula missing');

// Child-Pugh — five domains and class boundaries.
for (const code of ['CP-BILI', 'CP-ALB', 'CP-INR', 'CP-ASCITES', 'CP-HE']) assert(wave2.includes(code), `Child-Pugh domain missing: ${code}`);
for (const threshold of ['<2 = 1', '2–3 = 2', '>3 = 3', '>3.5 = 1', '2.8–3.5 = 2', '<2.8 = 3', '<1.7 = 1', '1.7–2.3 = 2', '>2.3 = 3']) assert(wave2.includes(threshold), `Child-Pugh threshold missing: ${threshold}`);
assert(wave2.includes('A = 5–6، B = 7–9، C = 10–15'), 'Child-Pugh class boundaries missing');
assert(wave2.includes('لا تستخدم Child-Pugh وحده لأهلية الزراعة'), 'Child-Pugh transplant decision boundary missing');

// Rutgeerts — original i0-i4 and modified i2a/i2b distinction.
for (const grade of ['i0 — لا آفات', 'i1 — خمس آفات قلاعية أو أقل', 'i2 — أكثر من خمس آفات', 'i3 — التهاب لفائفي قلاعي منتشر', 'i4 — التهاب منتشر شديد']) assert(wave2.includes(grade), `Rutgeerts grade missing: ${grade}`);
assert(wave2.includes('i2a') && wave2.includes('i2b'), 'Modified Rutgeerts i2a/i2b distinction missing');
assert(wave2.includes('لا تجعل الدرجة وحدها أمرًا آليًا بتصعيد العلاج'), 'Rutgeerts treatment-decision boundary missing');

// KDIGO — explicitly 2012, full creatinine/urine thresholds and update warning.
assert(wave2.includes('KDIGO 2012'), 'KDIGO version must be explicit');
for (const threshold of ['1.5–1.9× baseline', '≥0.3 mg/dL', '<0.5 mL/kg/h لمدة 6–12 ساعة', '2.0–2.9× baseline', '<0.5 mL/kg/h لمدة ≥12 ساعة', '3× baseline', '≥4.0 mg/dL', '<0.3 mL/kg/h لمدة ≥24 ساعة', 'انقطاع بول ≥12 ساعة']) assert(wave2.includes(threshold), `KDIGO threshold missing: ${threshold}`);
assert(wave2.includes('تحقق من أحدث KDIGO'), 'KDIGO update/version guardrail missing');
assert(wave2.includes('المرحلة لا تحدد وحدها سبب AKI أو الحاجة إلى RRT'), 'KDIGO treatment boundary missing');

// West Haven — grades 0-IV and differential-diagnosis/ammonia boundaries.
for (const grade of ['0 — لا شذوذات سريرية ظاهرة', 'I — نقص وعي بسيط', 'II — خمول أو لامبالاة', 'III — نعاس إلى شبه سبات', 'IV — غيبوبة']) assert(wave2.includes(grade), `West Haven grade missing: ${grade}`);
assert(wave2.includes('لا تعتمد على مستوى الأمونيا وحده'), 'West Haven ammonia boundary missing');
assert(wave2.includes('استبعد/قيّم الأسباب الأخرى لتغير الوعي'), 'West Haven differential diagnosis boundary missing');

// PASI — all four regions, 0-4 severity, 0-6 area, weights and 0-72 range.
for (let region = 1; region <= 4; region += 1) for (const domain of ['E', 'I', 'S', 'A']) assert(wave2.includes(`PASI-${domain}${region}`), `PASI field missing: ${domain}${region}`);
for (const token of ['الرأس 0.1', 'الطرفان العلويان 0.2', 'الجذع 0.3', 'الطرفان السفليان 0.4', 'النطاق 0–72']) assert(wave2.includes(token), `PASI formula component missing: ${token}`);
assert(wave2.includes('0=0%، 1=1–9%، 2=10–29%، 3=30–49%، 4=50–69%، 5=70–89%، 6=90–100%'), 'PASI area bins missing');

// Vignos — all ten grades and no forced unsafe performance.
for (let grade = 1; grade <= 10; grade += 1) assert(wave2.includes(`${grade} —`), `Vignos grade ${grade} missing`);
assert(wave2.includes('لا تطلب محاولة درج/قيام غير آمنة'), 'Vignos safety boundary missing');

if (!process.exitCode) {
  console.log(`ASSESSMENT_FULL_FORMS_WAVE2_PASS: ${slugs.length} operational forms/classifications + SWLS authoritative rights correction verified.`);
}
