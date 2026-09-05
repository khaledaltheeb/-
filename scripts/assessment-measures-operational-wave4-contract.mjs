import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE4_CONTRACT_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const wave4 = read('lib/assessment-measure-operational-full-forms-wave4.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');

const slugs = [...wave4.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const required = [
  'child-pugh-classification',
  'bode-index',
  'harvey-bradshaw-index',
  'rutgeerts-score',
  'cdc-hiv-surveillance-stage-2014',
  'clinical-global-impression',
];

assert(slugs.length === required.length, `expected ${required.length} Wave 4 materials, found ${slugs.length}`);
assert(new Set(slugs).size === slugs.length, 'duplicate Wave 4 slug');
for (const slug of required) assert(slugs.includes(slug), `${slug}: Wave 4 material missing`);
assert(!/http:\/\//.test(wave4), 'all Wave 4 source URLs must use HTTPS');
assert(catalog.includes('assessmentOperationalFullFormsWave4'), 'operational catalog must import Wave 4');
assert(catalog.includes('...assessmentOperationalFullFormsWave4'), 'operational catalog must register Wave 4');

// Child-Pugh: five components, one coagulation method, exact classes and version boundaries.
for (const code of ['CP-BILI', 'CP-ALB', 'CP-INR', 'CP-PT', 'CP-ASCITES', 'CP-HE', 'CP-TOTAL', 'CP-CLASS']) {
  assert(wave4.includes(code), `Child-Pugh field missing: ${code}`);
}
for (const token of ['أقل من 2 mg/dL', 'من 2 إلى 3 mg/dL', 'أكثر من 3 mg/dL', 'أكثر من 3.5 g/dL', 'من 2.8 إلى 3.5 g/dL', 'أقل من 2.8 g/dL']) {
  assert(wave4.includes(token), `Child-Pugh laboratory anchor missing: ${token}`);
}
for (const token of ['أقل من 1.7', 'من 1.7 إلى 2.3', 'أكثر من 2.3', 'أقل من 4 ثوانٍ', 'من 4 إلى 6 ثوانٍ', 'أكثر من 6 ثوانٍ']) {
  assert(wave4.includes(token), `Child-Pugh coagulation anchor missing: ${token}`);
}
assert(wave4.includes('A — 5–6 نقاط') && wave4.includes('B — 7–9 نقاط') && wave4.includes('C — 10–15 نقطة'), 'Child-Pugh A/B/C classes missing');
assert(wave4.includes('لا تحسب INR وPT معًا'), 'Child-Pugh must prevent double-counting INR and PT');
assert(wave4.includes('عتبات مختلفة للبيليروبين'), 'Child-Pugh bilirubin-version boundary missing');

// BODE: exact original point bins and 0-10 total.
for (const code of ['BODE-BMI', 'BODE-FEV1', 'BODE-MMRC', 'BODE-6MWD', 'BODE-TOTAL']) assert(wave4.includes(code), `BODE field missing: ${code}`);
for (const token of ['FEV1 ≥65%', '50–64%', '36–49%', '≤35%', '≥350 متر', '250–349 متر', '150–249 متر', '≤149 متر', 'mMRC 0–1', 'mMRC 2', 'mMRC 3', 'mMRC 4', 'أكبر من 21 kg/m²', '21 kg/m² أو أقل']) {
  assert(wave4.includes(token), `BODE scoring anchor missing: ${token}`);
}
assert(wave4.includes('النطاق الكلي 0–10'), 'BODE 0-10 total range missing');
assert(wave4.includes('0–2، 3–4، 5–6، 7–10'), 'BODE quartile grouping reference missing');
assert(wave4.includes('لا تحول الدرجة إلى نسبة بقاء فردية ثابتة'), 'BODE individual-prognosis guardrail missing');

// HBI: every domain, liquid-stool count is one point each, all 8 complications.
for (const code of ['HBI-WELL', 'HBI-PAIN', 'HBI-STOOLS', 'HBI-MASS', 'HBI-TOTAL']) assert(wave4.includes(code), `HBI field missing: ${code}`);
for (const code of ['HBI-C-ARTHRALGIA', 'HBI-C-UVEITIS', 'HBI-C-ERYTHEMA', 'HBI-C-APHTHOUS', 'HBI-C-PYODERMA', 'HBI-C-FISSURE', 'HBI-C-FISTULA', 'HBI-C-ABSCESS']) assert(wave4.includes(code), `HBI complication missing: ${code}`);
assert(wave4.includes('الدرجة تساوي العدد'), 'HBI liquid stools must score one point per stool');
assert(wave4.includes('لا يوجد حد أعلى ثابت منطقيًا'), 'HBI must not impose a fake fixed total maximum');
assert(wave4.includes('<5 هدأة سريرية') && wave4.includes('5–7 نشاط خفيف') && wave4.includes('8–16 نشاط متوسط') && wave4.includes('>16 نشاط شديد'), 'HBI common activity bands missing');
assert(wave4.includes('لا تخلط HBI الكامل مع partial/modified HBI'), 'HBI full-vs-modified boundary missing');

// Rutgeerts: original i0-i4 and modified i2a/i2b are separate systems.
assert(wave4.includes('RUT-ORIGINAL') && wave4.includes('RUT-MODIFIED'), 'Rutgeerts original/modified fields missing');
for (const grade of ['i0', 'i1', 'i2', 'i3', 'i4', 'i2a', 'i2b']) assert(wave4.includes(`value: '${grade}'`), `Rutgeerts grade missing: ${grade}`);
assert(wave4.includes('i2a (مفاغري) وi2b (لفائفي جديد)') || wave4.includes('i2a (مفاغري)') || wave4.includes('i2a — آفات محصورة بالمفاغرة'), 'Rutgeerts i2a/i2b distinction missing');
assert(wave4.includes('لا يوجد مجموع جمعي'), 'Rutgeerts must remain an ordinal classification, not a summed score');
assert(wave4.includes('لا تقارن i2 الأصلي مباشرة بـi2a أو i2b'), 'Rutgeerts version-comparison guardrail missing');

// CDC 2014 HIV surveillance staging: stage 0 precedence, age-specific CD4 rules, surveillance-only privacy boundary.
for (const code of ['HIV0-NEG180', 'HIV0-ALGO', 'HIV0-PRIOR-EVIDENCE', 'HIV-AGE-GROUP', 'HIV-CD4-COUNT', 'HIV-CD4-PCT', 'HIV-STAGE3-OI', 'HIV-STAGE-FINAL']) assert(wave4.includes(code), `CDC HIV field missing: ${code}`);
assert(wave4.includes('180 يومًا') && wave4.includes('أقدم بأكثر من 60 يومًا'), 'CDC HIV stage 0 timing/exception rules missing');
assert(wave4.includes('استخدم عدد CD4 أولًا؛ النسبة المئوية تستخدم فقط إذا كان العدد مفقودًا'), 'CDC HIV CD4 count precedence missing');
for (const token of ['≥500', '200–499', '<200', '≥26%', '14–25%', '<14%', '≥1000', '500–999', '<500', '≥30%', '22–29%', '<22%', '≥1500', '750–1499', '<750', '≥34%', '26–33%', '<26%']) assert(wave4.includes(token), `CDC HIV age-specific threshold missing: ${token}`);
assert(wave4.includes('لا تستخدم CDC HIV surveillance stage لتحديد بدء العلاج أو وقفه أو تأخيره'), 'CDC HIV treatment-decision boundary missing');
assert(wave4.includes('بيانات HIV حساسة'), 'CDC HIV privacy boundary missing');

// CGI: all three original components, S/I anchors, efficacy 4x4 coding, no artificial summed total.
for (const code of ['CGI-S', 'CGI-I', 'CGI-E-TE', 'CGI-E-SE', 'CGI-E-16']) assert(wave4.includes(code), `CGI component missing: ${code}`);
for (const token of ['1 — طبيعي؛ غير مريض إطلاقًا', '7 — من بين أشد المرضى مرضًا', '1 — تحسن كثيرًا جدًا', '4 — لا تغيير', '7 — أسوأ كثيرًا جدًا']) assert(wave4.includes(token), `CGI S/I anchor missing: ${token}`);
assert(wave4.includes('(درجة الأثر العلاجي − 1) × 4 + درجة الآثار الجانبية'), 'CGI-E 16-cell coding formula missing');
assert(wave4.includes('لا تجمع CGI-S وCGI-I وCGI-E في مجموع كلي واحد'), 'CGI components must not be summed');
assert(wave4.includes('CGI-I يقارن بالحالة عند خط الأساس المحدد'), 'CGI-I baseline-comparison rule missing');
assert(wave4.includes('على أساس أثر الدواء فقط'), 'CGI-E drug-effect-only rule missing');

// Rights discipline: do not reproduce copyrighted/granted tools in this public-domain wave.
for (const restricted of ['hospital-anxiety-depression-scale', 'mini-mental-state-examination', 'montreal-cognitive-assessment', 'trail-making-test', 'columbia-suicide-severity-rating-scale', 'borg-cr10']) {
  assert(!wave4.includes(`slug: '${restricted}'`), `restricted/granted tool must not be reproduced in Wave 4: ${restricted}`);
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_OPERATIONAL_WAVE4_CONTRACT_PASS: ${slugs.length} public-domain operational materials verified.`);
}
