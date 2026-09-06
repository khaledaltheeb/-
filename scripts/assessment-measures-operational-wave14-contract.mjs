import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`ASSESSMENT_OPERATIONAL_WAVE14_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const formPath = 'lib/assessment-measure-operational-full-forms-wave14.ts';
const catalogPath = 'lib/assessment-measure-operational-catalog.ts';
for (const file of [formPath, catalogPath]) assert(exists(file), `required file missing: ${file}`);

const form = read(formPath);
const catalog = read(catalogPath);
const slugs = [
  'simple-endoscopic-score-crohns-disease-v1',
  'crohns-disease-activity-index-v1',
  'international-physical-activity-questionnaire-long-form',
  'visual-function-questionnaire-25',
  'mayo-portland-adaptability-inventory-4',
];

for (const slug of slugs) assert(form.includes(`'${slug}': {`), `missing Wave 14 operational material: ${slug}`);
assert(new Set([...form.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1])).size === slugs.length, 'Wave 14 must contain exactly five unique top-level measure records');
assert(!/http:\/\//.test(form), 'Wave 14 sources must use HTTPS');

// SES-CD V1: exact public-domain four-variable structure across five ileocolonic segments.
assert(form.includes("completeness: 'exact-public-domain-form'"), 'Wave 14 must retain exact public-domain form classification where justified');
for (const segment of ['ILEUM', 'RIGHT', 'TRANSVERSE', 'LEFT', 'RECTUM']) {
  for (const variable of ['ULCER-SIZE', 'ULCERATED-SURFACE', 'AFFECTED-SURFACE', 'NARROWING']) {
    assert(form.includes(`SES-${segment}-${variable}`), `SES-CD missing ${segment} ${variable}`);
  }
}
assert(form.includes("code: 'SES-CD-TOTAL'") && form.includes('max: 56'), 'SES-CD total 0-56 field missing');
assert(form.includes('تضيق لا يمكن عبوره'), 'SES-CD impassable narrowing category missing');
assert(form.includes('القطاعات غير القابلة للتقييم'), 'SES-CD unevaluated-segment safeguard missing');
assert(form.includes('simple-endoscopic-score-crohns-disease-version-1'), 'SES-CD CDISC provenance missing');
assert(form.includes('15472670'), 'SES-CD original validation source missing');

// CDAI V1: classic eight-variable scoring architecture and safety boundaries.
for (const code of [
  'CDAI-STOOL-7D',
  'CDAI-PAIN-7D',
  'CDAI-WELLBEING-7D',
  'CDAI-COMPLICATIONS-N',
  'CDAI-ANTIDIARRHEAL',
  'CDAI-MASS',
  'CDAI-HCT',
  'CDAI-WEIGHT-CURRENT',
  'CDAI-WEIGHT-STANDARD',
  'CDAI-TOTAL',
]) assert(form.includes(`code: '${code}'`), `CDAI field missing: ${code}`);
for (const multiplier of ['× 2', '× 5', '× 7', '× 20', '× 30', '× 10', '× 6']) {
  assert(form.includes(multiplier), `CDAI scoring multiplier missing: ${multiplier}`);
}
assert(form.includes('47 − Hct') && form.includes('42 − Hct'), 'CDAI historical hematocrit constants missing');
assert(form.includes('[1 − (الوزن الحالي ÷ الوزن القياسي)] × 100'), 'CDAI weight-deviation formula missing');
assert(form.includes('≤150') && form.includes('>450'), 'CDAI historical interpretation anchors missing');
assert(form.includes('لا تستبدل به CRP/fecal calprotectin'), 'CDAI objective-inflammation boundary missing');
assert(form.includes('1248701'), 'CDAI original development source missing');

// IPAQ-LF: preserve long-form domains, official MET values and category algorithm without inventing an Arabic questionnaire.
for (const domainCode of ['IPAQ-W-WALK-DAYS', 'IPAQ-T-CYCLE-DAYS', 'IPAQ-D-VIGYARD-DAYS', 'IPAQ-L-VIG-DAYS', 'IPAQ-SIT-WEEKDAY', 'IPAQ-TOTAL-MET']) {
  assert(form.includes(`code: '${domainCode}'`), `IPAQ-LF field missing: ${domainCode}`);
}
for (const met of ['3.3', '4.0', '8.0', '6.0', '5.5', '3.0']) assert(form.includes(met), `IPAQ-LF MET value missing: ${met}`);
for (const threshold of ['≥600 MET-min/week', '≥1500 MET-min/week', '≥3000 MET-min/week']) assert(form.includes(threshold), `IPAQ category threshold missing: ${threshold}`);
assert(form.includes('الجلوس لا يدخل مجموع النشاط'), 'IPAQ sitting boundary missing');
assert(form.includes('موقع IPAQ الرسمي') && form.includes('open access'), 'IPAQ official open-access provenance missing');
assert(form.includes('28738790'), 'IPAQ adapted Arabic validation source missing');
assert(form.includes('لا تعمم صلاحيتها تلقائيًا على كل دولة عربية'), 'IPAQ Arabic population-generalization guardrail missing');

// NEI VFQ-25: scoring companion only, with official recoding and translation boundary.
assert(form.includes("completeness: 'recording-and-scoring-sheet'"), 'VFQ/MPAI companion boundary missing');
for (let i = 1; i <= 26; i += 1) assert(form.includes(`VFQ-RAW-${i}`), `VFQ raw-response placeholder missing: ${i}`);
for (const code of ['VFQ-GENERAL-HEALTH', 'VFQ-GENERAL-VISION', 'VFQ-NEAR', 'VFQ-DISTANCE', 'VFQ-DRIVING', 'VFQ-COMPOSITE']) {
  assert(form.includes(`code: '${code}'`), `VFQ scoring field missing: ${code}`);
}
assert(form.includes('general health') && form.includes('vision-targeted composite'), 'VFQ composite/general-health boundary missing');
assert(form.includes('لا تعيد طباعة نص تلك الترجمة'), 'VFQ Arabic copyright/validation boundary missing');
assert(form.includes('manual_cm2000.pdf'), 'VFQ official Version 2000 scoring manual missing');
assert(form.includes('25349812'), 'VFQ Arabic validation source missing');

// MPAI-4: companion must use official 29 scored items + associated factors and preserve recoding/T-score boundaries.
for (const token of ['MPAI4-1', 'MPAI4-29', 'MPAI4-ASSOC-30', 'MPAI4-ASSOC-35', 'MPAI4-ABILITY', 'MPAI4-ADJUSTMENT', 'MPAI4-PARTICIPATION', 'MPAI4-TOTAL', 'MPAI4-T-SCORE']) {
  assert(form.includes(token), `MPAI-4 field missing: ${token}`);
}
assert(form.includes('max: 47') && form.includes('max: 46') && form.includes('max: 30') && form.includes('max: 111'), 'MPAI-4 official rescored raw ranges missing');
assert(form.includes('29 فقط تدخل الدرجات الرئيسية') && form.includes('الستة الإضافية'), 'MPAI-4 29-scored/6-associated structure missing');
assert(form.includes('لا تحسب T-score خطيًا'), 'MPAI-4 T-score conversion guardrail missing');
assert(form.includes('توافق فريق التأهيل على التقديرات'), 'MPAI-4 team-consensus guidance missing');
assert(form.includes('لا تدّع وجود نسخة عربية رسمية'), 'MPAI-4 Arabic translation boundary missing');
assert(form.includes('tbims.org/mpai/index.html'), 'MPAI-4 official TBIMS source missing');
assert(form.includes('rehabilitation-measures/mayo-portland-adaptability-inventory'), 'MPAI-4 RMD evidence source missing');

// Rights safety: no known restricted/non-open instrument may be introduced by this open-operational wave.
for (const restricted of ['hospital-anxiety-and-depression-scale', 'columbia-suicide-severity-rating-scale', 'mini-mental-state-examination', 'trail-making-test']) {
  assert(!form.includes(`'${restricted}': {`), `restricted instrument must not be operationalized in Wave 14: ${restricted}`);
}

assert(catalog.includes("assessmentOperationalFullFormsWave14 } from '@/lib/assessment-measure-operational-full-forms-wave14'"), 'operational catalog Wave 14 import missing');
assert(catalog.includes('...assessmentOperationalFullFormsWave14'), 'operational catalog Wave 14 spread missing');

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_WAVE14_OK measures=5 ses_cd=5_segments_x4_variables cdai=8_variable_formula ipaq=long_form_scoring_companion vfq25=official_version_2000_scoring_companion mpai4=official_manual_scoring_companion rights=public_domain_or_official_use_boundaries');
}
