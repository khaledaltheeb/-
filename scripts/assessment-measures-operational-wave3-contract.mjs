import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE3_CONTRACT_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const wave3 = read('lib/assessment-measure-operational-full-forms-wave3.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');

const slugs = [...wave3.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const required = [
  'patient-health-questionnaire-15',
  'covi-anxiety-scale',
  'brooke-upper-extremity-rating-scale',
  'vignos-lower-extremity-rating-scale',
  'four-stair-ascend',
  'four-stair-descend',
  'rising-from-floor',
];

assert(slugs.length === required.length, `expected ${required.length} explicit Wave 3 materials, found ${slugs.length}`);
assert(new Set(slugs).size === slugs.length, 'duplicate Wave 3 slug');
for (const slug of required) assert(slugs.includes(slug), `${slug}: Wave 3 material missing`);
assert(!/http:\/\//.test(wave3), 'all Wave 3 source URLs must use HTTPS');
assert(catalog.includes('assessmentOperationalFullFormsWave3'), 'operational catalog must import Wave 3');
assert(catalog.includes('...assessmentOperationalFullFormsWave3'), 'operational catalog must register Wave 3');

// PHQ-15: complete item structure, two scoring response families, sex/applicability boundary and safety.
for (let i = 1; i <= 15; i += 1) assert(wave3.includes(`PHQ15-${i}`), `PHQ-15 item ${i} missing`);
assert(wave3.includes('PHQ15-TOTAL'), 'PHQ-15 total field missing');
assert(wave3.includes('PHQ15-APPLICABLE'), 'PHQ-15 applicability count missing');
assert(wave3.includes('13 somatic symptoms') || wave3.includes('الأعراض الجسدية الأساسية'), 'PHQ-15 must distinguish the core somatic block');
assert(wave3.includes('بندا PHQ-9 اللذان يدخلان في PHQ-15'), 'PHQ-15 fatigue/sleep scoring provenance missing');
assert(wave3.includes('0–28'), 'PHQ-15 non-applicable menstrual-item raw maximum boundary missing');
assert(wave3.includes('لا تعوّضها بدرجة مخترعة'), 'PHQ-15 menstrual applicability guardrail missing');
assert(wave3.includes('ارتفاع الدرجة لا يعني أن الأعراض «نفسية فقط»'), 'PHQ-15 medical-causation guardrail missing');
assert(wave3.includes('https://loinc.org/69728-4/panel'), 'PHQ-15 LOINC item/terms source missing');
assert(wave3.includes('PMC5585978'), 'PHQ-15 Arabic validation source missing');

// COVI: explicit convention because historical 1-5 and 0-4 variants coexist.
for (let i = 1; i <= 3; i += 1) assert(wave3.includes(`COVI${i}`), `COVI item ${i} missing`);
assert(wave3.includes('المجموع 3–15'), 'COVI 1-5 total range missing');
assert(wave3.includes('0–4/مجموع 0–12'), 'COVI historical alternate-scoring warning missing');
assert(wave3.includes('نسخة الترميز: 1–5'), 'COVI scoring convention must be explicit on the worksheet');
assert(wave3.includes('ليس أداة تشخيص مستقلة'), 'COVI non-diagnostic boundary missing');

// Brooke: every level 1-6, water-cup anchor, and movement safety.
assert(wave3.includes("code: 'BUERS'"), 'Brooke classification field missing');
for (let i = 1; i <= 6; i += 1) assert(wave3.includes(`'${i}', score: ${i}`), `Brooke/Vignos score token ${i} missing`);
assert(wave3.includes('8 أونصات'), 'Brooke 8-ounce cup anchor missing');
assert(wave3.includes('نحو 237 مل'), 'Brooke metric equivalent for 8-ounce cup missing');
assert(wave3.includes('لا تطلب حركة تسبب ألمًا أو خطر سقوط'), 'Brooke safety boundary missing');
assert(wave3.includes('brooke-upper-extremity-rating-scale'), 'Brooke CDISC source missing');

// Vignos: levels 1-10 and historical level-3 timing version boundary.
assert(wave3.includes("code: 'VLERS'"), 'Vignos classification field missing');
for (let i = 1; i <= 10; i += 1) assert(wave3.includes(`value: '${i}', score: ${i}`), `Vignos level ${i} missing`);
assert(wave3.includes('>12 ثانية لأربع درجات') && wave3.includes('>25 ثانية لثماني درجات'), 'Vignos level-3 timing version boundary missing');
assert(wave3.includes('VLERS-G3-PROTOCOL'), 'Vignos level-3 protocol field missing');
assert(wave3.includes('vignos-lower-extremity-rating-scale'), 'Vignos CDISC source missing');

// Timed DMD functional tests: performed status, time, orthoses/support, strategy and explicit non-performance.
for (const code of ['A4STR-PERFORMED', 'A4STR-T1', 'A4STR-ORTHOSES', 'A4STR-HANDRAIL', 'A4STR-GRADE', 'A4STR-STOP']) assert(wave3.includes(code), `4-Stair Ascend field missing: ${code}`);
for (const code of ['D4STR-PERFORMED', 'D4STR-T1', 'D4STR-ORTHOSES', 'D4STR-HANDRAIL', 'D4STR-GRADE', 'D4STR-STOP']) assert(wave3.includes(code), `4-Stair Descend field missing: ${code}`);
for (const code of ['RFF-PERFORMED', 'RFF-T1', 'RFF-STRATEGY', 'RFF-ASSIST', 'RFF-GRADE', 'RFF-STOP']) assert(wave3.includes(code), `Rising From Floor field missing: ${code}`);
assert(wave3.includes('عدم القدرة على الأداء كحالة منفصلة') || wave3.includes('عدم القدرة نتيجة ذات معنى'), 'timed tests must not convert inability into an invented time');
assert(wave3.includes('30562905'), 'timed stair DMD protocol-consensus source missing');
assert(wave3.includes('26982196'), 'Rising From Floor DMD progression source missing');

// Rights discipline: no restricted instruments may be copied into this public-domain wave.
for (const restricted of ['hospital-anxiety-depression-scale', 'columbia-suicide-severity-rating-scale', 'mini-mental-state-examination', 'trail-making-test', 'montreal-cognitive-assessment']) {
  assert(!wave3.includes(`slug: '${restricted}'`), `restricted instrument must not be reproduced in Wave 3: ${restricted}`);
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_OPERATIONAL_WAVE3_CONTRACT_PASS: ${slugs.length} rights-verified operational materials verified.`);
}
