import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE17_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const form = read('lib/assessment-measure-operational-full-forms-wave17.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');
const slugs = [
  'kurtzke-functional-systems-score',
  'expanded-disability-status-scale',
  'jfk-coma-recovery-scale-revised',
  'brief-psychiatric-rating-scale-anchored',
  'rey-auditory-verbal-learning-test',
];
for (const slug of slugs) assert(form.includes(`'${slug}': {`), `missing Wave 17 operational material: ${slug}`);
assert(new Set([...form.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1])).size === 5, 'Wave 17 must contain exactly five top-level records');
assert(!/http:\/\//.test(form), 'Wave 17 sources must use HTTPS');

// KFSS: eight systems, correct range families, and no false linear total.
for (const code of ['KFSS-PYRAMIDAL','KFSS-CEREBELLAR','KFSS-BRAINSTEM','KFSS-SENSORY','KFSS-BOWEL-BLADDER','KFSS-VISUAL','KFSS-CEREBRAL','KFSS-OTHER']) {
  assert(form.includes(`code: '${code}'`), `KFSS system missing: ${code}`);
}
assert(form.includes("max: 6") && form.includes("max: 5") && form.includes("max: 1"), 'KFSS range families missing');
assert(form.includes('CEREBELLAR-X') && form.includes('VISUAL-X'), 'KFSS X/modifier documentation missing');
assert(form.includes('لا تحوّل FSS إلى مجموع خطي') || form.includes('لا تجمع الأجهزة الثمانية'), 'KFSS must reject a false summed score');
assert(form.includes('Kurtzke 1983 FSS'), 'KFSS version provenance missing');

// EDSS: 0 then 1.0-9.5 half steps and 10, no 0.5, with key ambulation anchors.
assert(form.includes("code: 'EDSS-FINAL'"), 'EDSS final classification field missing');
for (const value of ['1.5','2.5','3.5','4.5','5.5','6.5','7.5','8.5','9.5']) assert(form.includes(`value: '${value}'`), `EDSS half-step missing: ${value}`);
assert(!form.includes("value: '0.5'"), 'EDSS must never expose nonexistent score 0.5');
for (const distance of ['500 م','300 م','200 م','100 م','20 م','5 م']) assert(form.includes(distance), `EDSS ambulation anchor missing: ${distance}`);
assert(form.includes('RS Version 2.0 released 21 Nov 2024'), 'EDSS current CDISC RS version provenance missing');
assert(form.includes('EDSS ليس مجرد جمع أرقام FSS'), 'EDSS must preserve non-additive assignment logic');

// CRS-R: six hierarchical subscales, 0-23 total, eMCS/MCS behavior mapping, and rights ambiguity preserved.
for (const code of ['CRSR-AUD','CRSR-VIS','CRSR-MOT','CRSR-ORO','CRSR-COM','CRSR-ARO','CRSR-TOTAL','CRSR-STATE']) {
  assert(form.includes(`code: '${code}'`), `CRS-R field missing: ${code}`);
}
for (const maximum of ['crsrAuditory','crsrVisual','crsrMotor','crsrOromotor','crsrCommunication','crsrArousal']) assert(form.includes(maximum), `CRS-R subscale definition missing: ${maximum}`);
assert(form.includes("max: 23") && form.includes('0–23'), 'CRS-R total range 0-23 missing');
assert(form.includes('communication=2') && form.includes('motor=6'), 'CRS-R eMCS behavior mapping missing');
assert(form.includes('auditory ≥3') && form.includes('visual ≥2') && form.includes('motor ≥3'), 'CRS-R MCS behavior mapping missing');
assert(form.includes('إشارات حقوق متباينة بين CDISC وNINDS'), 'CRS-R rights ambiguity must remain explicit');
assert(form.includes('لا تستخدم CRS-R منفردًا للتنبؤ الحتمي بالمآل'), 'CRS-R no-withdrawal/no-prognosis safeguard missing');

// BPRS-A: 24-item expanded structure, 1-7 recording, source-of-rating rules, missing-data and suicide safeguards.
for (let i = 1; i <= 24; i += 1) {
  const code = `BPRSA-${String(i).padStart(2, '0')}`;
  assert(form.includes(code), `BPRS-A item missing: ${code}`);
}
for (let score = 1; score <= 7; score += 1) assert(form.includes(`value: '${score}'`), `BPRS-A severity option missing: ${score}`);
assert(form.includes('24–168') && form.includes('max: 168'), 'BPRS-A complete raw-score range missing');
assert(form.includes('البنود 1–14') && form.includes('البنود 15–24'), 'BPRS-A self-report/observation source rule missing');
assert(form.includes('NA') && form.includes('لا يُعامل كدرجة 1'), 'BPRS-A missing-item guardrail missing');
assert(form.includes('ليست نسخة عربية رسمية/محققة'), 'BPRS-A Arabic translation boundary missing');
assert(form.includes('انتحار/عنف/هياج شديد'), 'BPRS-A safety escalation missing');
assert(form.includes('Version 2.0 released 27 Feb 2023'), 'BPRS-A CDISC version provenance missing');

// RAVLT: classic five learning trials + interference/immediate/delay/recognition, without inventing a local word list.
for (const code of ['RAVLT-A1','RAVLT-A2','RAVLT-A3','RAVLT-A4','RAVLT-A5','RAVLT-B1','RAVLT-A6','RAVLT-A7','RAVLT-DELAY-MIN','RAVLT-RECOG-HITS','RAVLT-RECOG-FP','RAVLT-INTRUSIONS','RAVLT-REPETITIONS','RAVLT-SUM-A1-A5']) {
  assert(form.includes(`code: '${code}'`), `RAVLT field missing: ${code}`);
}
assert(form.includes("max: 75") && form.includes('0–75'), 'RAVLT A1-A5 total range missing');
assert(form.includes('خمس محاولات') && form.includes('20–40 دقيقة'), 'RAVLT classic trial/delay structure missing');
assert(form.includes('لا تستخدم قائمة مترجمة محليًا مع معايير إنجليزية'), 'RAVLT language/norm safeguard missing');
assert(form.includes('لا تولد روافد قائمة عربية جديدة') || form.includes('دون قائمة كلمات مصطنعة'), 'RAVLT must not invent an Arabic word list');
assert(form.includes('NIH Toolbox V3') && form.includes('ثلاث محاولات'), 'RAVLT protocol-variant boundary missing');

for (const restricted of ['montreal-cognitive-assessment','trail-making-test','hospital-anxiety-and-depression-scale','columbia-suicide-severity-rating-scale']) {
  assert(!form.includes(`'${restricted}': {`), `restricted instrument must not be introduced in Wave 17: ${restricted}`);
}

assert(catalog.includes("assessmentOperationalFullFormsWave17 } from '@/lib/assessment-measure-operational-full-forms-wave17'"), 'Wave 17 catalog import missing');
assert(catalog.includes('...assessmentOperationalFullFormsWave17'), 'Wave 17 catalog registration missing');

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_WAVE17_OK measures=5 kfss=8_systems edss=0_to_10_no_0_5 crsr=6_subscales_0_23 bprsa=24_items_1_7 ravlt=classic_5_trial_protocol');
}
