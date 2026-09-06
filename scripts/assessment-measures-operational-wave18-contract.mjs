import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_WAVE18_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const form = read('lib/assessment-measure-operational-full-forms-wave18.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');
const coverage = read('scripts/assessment-measures-operational-coverage.mjs');
const slugs = [
  'chart-short-form',
  'combat-exposure-scale',
  'deployment-risk-resilience-inventory-2',
  'expanded-drs-postacute-interview-caregiver',
  'expanded-drs-postacute-interview-survivor',
];
for (const slug of slugs) assert(form.includes(`'${slug}':`) || form.includes(`slug: '${slug}'`), `missing final operational material: ${slug}`);
assert(!/http:\/\//.test(form), 'Wave 18 sources must use HTTPS');

// CHART-SF: 19-item official algorithm, six 0-100 domains, 0-600 total, respondent source retained.
for (const code of ['CHART-PHYSICAL','CHART-COGNITIVE','CHART-MOBILITY','CHART-OCCUPATION','CHART-SOCIAL','CHART-ECONOMIC','CHART-TOTAL']) {
  assert(form.includes(code), `CHART-SF field missing: ${code}`);
}
assert(form.includes('عدد البنود المكتملة من 19') && form.includes("max: 19"), 'CHART-SF 19-item structure missing');
assert(form.includes("max: 100") && form.includes("max: 600"), 'CHART-SF subscale/total ranges missing');
assert(form.includes('Self report') && form.includes('Proxy'), 'CHART-SF respondent-source distinction missing');
assert(form.includes('لا تنتج CHART-TOTAL إذا كان مجال غير صالح'), 'CHART-SF incomplete-domain guardrail missing');

// CES: seven raw items, verified weighted conversion, 0-41 and five exposure bands; no PTSD diagnosis claim.
for (let i = 1; i <= 7; i += 1) {
  assert(form.includes(`code: 'CES-${i}'`), `CES raw item missing: ${i}`);
  assert(form.includes(`code: 'CES-S${i}'`), `CES weighted item missing: ${i}`);
}
for (const rule of ['(raw−1)×2', 'raw−1', '(raw−2)×2', 'raw−2']) assert(form.includes(rule), `CES transformation token missing: ${rule}`);
assert(form.includes("code: 'CES-TOTAL'") && form.includes("max: 41"), 'CES 0-41 total missing');
for (const band of ['0–8','9–16','17–24','25–32','33–41']) assert(form.includes(band), `CES band missing: ${band}`);
assert(form.includes('لا أعراض PTSD ولا تشخيصه'), 'CES non-diagnostic PTSD boundary missing');
assert(form.includes('حق التوقف') && form.includes('خطر حالي'), 'CES trauma-informed/safety boundary missing');

// DRRI-2: exactly the official 17-scale family and explicitly no grand total.
for (let i = 1; i <= 17; i += 1) {
  const prefix = `DRRI2-${String(i).padStart(2, '0')}`;
  assert(form.includes(prefix), `DRRI-2 scale registry missing: ${prefix}`);
}
for (const phase of ['predeployment','deployment','postdeployment']) assert(form.includes(phase), `DRRI-2 deployment phase missing: ${phase}`);
assert(form.includes('لا تحسب grand total لـDRRI-2') && form.includes('DRRI2-NO-GRAND-TOTAL'), 'DRRI-2 no-grand-total safeguard missing');
assert(form.includes('التحرش الجنسي') && form.includes('خبرات القتال'), 'DRRI-2 sensitive-domain registry incomplete');
assert(form.includes('حق التوقف/التخطي') && form.includes('لا تطلب تفاصيل عسكرية تشغيلية'), 'DRRI-2 trauma/privacy safeguard missing');

// Expanded DRS-PI: separate Survivor/Caregiver sources, official algorithm outputs, no invented arithmetic.
assert(form.includes("drsPiMaterial('survivor')") && form.includes("drsPiMaterial('caregiver')"), 'Expanded DRS-PI source-specific records missing');
assert(form.includes("source === 'survivor'") && form.includes("'Survivor'") && form.includes("'Caregiver'"), 'Expanded DRS-PI source identity logic missing');
for (const suffix of ['-VERSION','-TRAINED','-COMPLETE','-EXPANDED','-DRSPI','-ORIGINAL-DRS','-EMPLOYMENT','-PARTICIPATION']) {
  assert(form.includes(suffix), `Expanded DRS-PI operational field family missing: ${suffix}`);
}
assert(form.includes('لا تجمع إجابات المقابلة يدويًا إلى مجموع جديد'), 'Expanded DRS-PI algorithm-only scoring boundary missing');
assert(form.includes('خوارزمية Expanded DRS-PI الرسمية'), 'Expanded DRS-PI official algorithm handoff missing');
assert(form.includes('لا تستخدم الدرجة وحدها لتحديد أهلية خدمات التأهيل') && form.includes('لا تستخدم تقرير مقدم الرعاية وحده لحجب صوت الناجي'), 'Expanded DRS-PI survivor/caregiver safety boundaries missing');
assert(form.includes('تدريب/اختبار جامعي البيانات مطلوب'), 'Expanded DRS-PI training requirement missing');

// Rights safety: final closure must not reproduce restricted instruments.
for (const restricted of ['montreal-cognitive-assessment','trail-making-test','hospital-anxiety-and-depression-scale','columbia-suicide-severity-rating-scale','mmse-2-standard-version']) {
  assert(!form.includes(`'${restricted}': {`), `restricted instrument introduced in Wave 18: ${restricted}`);
}

assert(catalog.includes("assessmentOperationalFullFormsWave18 } from '@/lib/assessment-measure-operational-full-forms-wave18'"), 'Wave 18 catalog import missing');
assert(catalog.includes('...assessmentOperationalFullFormsWave18'), 'Wave 18 catalog registration missing');
assert(coverage.includes('unresolved.length') && coverage.includes('ASSESSMENT_OPERATIONAL_COVERAGE_FAIL: unresolved measures remain'), 'coverage audit must fail when unresolved measures remain after final closure');

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_WAVE18_OK final_measures=5 chart_sf=6_domains_0_600 ces=7_weighted_0_41 drri2=17_scales_no_grand_total edrspi=survivor_and_caregiver_algorithm_handoff');
}
