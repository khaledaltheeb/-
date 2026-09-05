import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSESSMENT_OPERATIONAL_CONTRACT_FAIL: ${message}`);
    process.exitCode = 1;
  }
};

const operational = read('lib/assessment-measure-operational.ts');
const fullFormsWave1 = read('lib/assessment-measure-operational-full-forms-wave1.ts');
const fullFormsWave2 = read('lib/assessment-measure-operational-full-forms-wave2.ts');
const operationalCatalog = read('lib/assessment-measure-operational-catalog.ts');
const detailPage = read('app/assessment-measures/[slug]/page.tsx');
const printPage = read('app/assessment-measures/[slug]/print/page.tsx');
const formComponent = read('components/assessment-measure-operational-form.tsx');
const printButton = read('components/measure-print-button.tsx');
const css = read('components/assessment-measures.module.css');

assert(operational.includes('export function getOperationalMaterial'), 'all measures must resolve through base getOperationalMaterial');
assert(operational.includes("completeness: 'recording-and-scoring-sheet'"), 'generic printable recording fallback is missing');
assert(operational.includes('measure.administrationSteps.map'), 'fallback must preserve administration steps');
assert(operational.includes('measure.scoring'), 'fallback must preserve scoring instructions');
assert(operational.includes('measure.safetyNotes'), 'fallback must preserve safety/stop rules');
assert(operational.includes('measure.sources.map'), 'fallback must preserve authoritative source links');

const explicitSlugs = [...operational.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
assert(explicitSlugs.length >= 11, `expected at least 11 explicitly operationalized base measures, found ${explicitSlugs.length}`);
assert(new Set(explicitSlugs).size === explicitSlugs.length, 'duplicate explicit operational measure slug');

const requiredExplicit = [
  'patient-health-questionnaire-9',
  'generalized-anxiety-disorder-7',
  'geriatric-depression-scale',
  'modified-rankin-scale',
  'eastern-cooperative-oncology-group-performance-status',
  'karnofsky-performance-scale',
  'glasgow-coma-scale-ninds',
  'berg-balance-scale',
  'timed-up-and-go',
  '10-meter-walk-test',
  '6-minute-walk-test',
];
for (const slug of requiredExplicit) assert(explicitSlugs.includes(slug), `${slug}: explicit base form/protocol missing`);

assert(operational.includes("completeness: 'exact-public-domain-form'"), 'library must distinguish exact/open forms from worksheets');
assert(operational.includes("completeness: 'standardized-protocol-sheet'"), 'library must distinguish procedural protocol sheets');
assert(!/http:\/\//.test(operational), 'operational sources must use HTTPS');

// PHQ-9 and GAD-7: public-access provenance + Arabic authoritative download discovery + safety.
assert(operational.includes("slug: 'patient-health-questionnaire-9'"), 'PHQ-9 operational form missing');
assert(operational.includes('PHQ9'), 'PHQ-9 self-harm item must be present');
assert(operational.includes('أي إجابة غير «أبدًا» تستلزم تقييم سلامة مباشرًا'), 'PHQ-9 item 9 safety escalation missing');
assert(operational.includes('https://www.nih.gov/node/19946'), 'PHQ-9 NIH Arabic source missing');
assert(operational.includes('pfizer_to_offer_free_public_access'), 'Pfizer public-access provenance missing');
assert(operational.includes("slug: 'generalized-anxiety-disorder-7'"), 'GAD-7 operational form missing');
for (let i = 1; i <= 7; i += 1) assert(operational.includes(`GAD${i}`), `GAD-7 item ${i} missing`);
assert(operational.includes('https://www.nih.gov/node/19876'), 'GAD-7 NIH Arabic source missing');

// GDS-15: every item and scoring polarity must remain available.
for (let i = 1; i <= 15; i += 1) assert(operational.includes(`GDS${i}`), `GDS-15 item ${i} missing`);
assert(operational.includes('1،5،7،11،13'), 'GDS reverse-key items missing');
assert(operational.includes('2،3،4،6،8،9،10،12،14،15'), 'GDS positive-key items missing');
assert(operational.includes('NBK571039'), 'GDS public-domain SAMHSA/NCBI source missing');

// Core clinical classifications/scales.
for (const score of ['0 — لا أعراض إطلاقًا', '6 — وفاة']) assert(operational.includes(score), `mRS endpoint missing: ${score}`);
for (const score of ['0 — نشط بالكامل', '5 — وفاة']) assert(operational.includes(score), `ECOG endpoint missing: ${score}`);
for (const score of ['100 — طبيعي', '0 — وفاة']) assert(operational.includes(score), `KPS endpoint missing: ${score}`);
for (const code of ['GCS-E', 'GCS-V', 'GCS-M']) assert(operational.includes(code), `GCS component missing: ${code}`);

// BBS must contain all 14 tasks, even while exact Arabic anchors remain tied to a verified version.
for (let i = 1; i <= 14; i += 1) assert(operational.includes(`BBS${i}`), `BBS task ${i} missing`);
assert(operational.includes('المراسي الرسمية للنسخة المستخدمة'), 'BBS must preserve official-anchor boundary');

// Functional protocols.
assert(operational.includes('TUG-TRIAL1') && operational.includes('3 أمتار'), 'TUG timing/setup sheet incomplete');
assert(operational.includes('10MWT-T1') && operational.includes('سرعة المشي = المسافة الموقّتة ÷ الزمن'), '10MWT timing/speed sheet incomplete');
assert(operational.includes('6MWT-DIST') && operational.includes('المسافة الإجمالية بالمتر خلال ست دقائق'), '6MWT distance sheet incomplete');
assert(operational.includes('6MWT-SPO20') && operational.includes('6MWT-SPO21'), '6MWT pre/post oxygen-saturation fields missing');

// Full Forms Wave 1 must override fallback for rights-verified open measures.
const fullFormSlugs = [...fullFormsWave1.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const requiredWave1 = [
  'roland-morris-disability-questionnaire',
  'ptsd-checklist-for-dsm5',
  'life-events-checklist-dsm5-standard',
  'disability-rating-scale',
  'glasgow-outcome-scale-extended',
  'patient-determined-disease-steps',
  'modified-medical-research-council-dyspnea-scale',
  'abnormal-involuntary-movement-scale',
  'pain-intensity-cdisc',
  'pain-relief-cdisc',
  'patient-global-impression',
];
assert(fullFormSlugs.length >= requiredWave1.length, `expected at least ${requiredWave1.length} Wave-1 full forms, found ${fullFormSlugs.length}`);
for (const slug of requiredWave1) assert(fullFormSlugs.includes(slug), `${slug}: Full Forms Wave 1 material missing`);
assert(new Set(fullFormSlugs).size === fullFormSlugs.length, 'duplicate slug in Full Forms Wave 1');
assert(!/http:\/\//.test(fullFormsWave1), 'Wave-1 full-form sources must use HTTPS');

assert(operationalCatalog.includes('assessmentOperationalFullFormsWave1'), 'operational catalog must import Full Forms Wave 1');
assert(operationalCatalog.includes('explicitOperationalMaterials[measure.slug] ?? getBaseOperationalMaterial(measure)'), 'full-form material must override generic/base fallback');

// RMDQ 24 items + rights/translation boundary.
for (let i = 1; i <= 24; i += 1) assert(fullFormsWave1.includes(`RMDQ${i}`), `RMDQ item ${i} missing`);
assert(fullFormsWave1.includes('الأصل وجميع الترجمات في المجال العام'), 'RMDQ public-domain translation provenance missing');
assert(fullFormsWave1.includes('ترجمة تشغيلية من روافد'), 'RMDQ Rawafid translation status must remain explicit');
assert(fullFormsWave1.includes('https://www.sralab.org/rehabilitation-measures/roland-morris-disability-questionnaire'), 'RMDQ RMD source missing');

// PCL-5 20 items and official-translation boundary.
for (let i = 1; i <= 20; i += 1) assert(fullFormsWave1.includes(`PCL${i}`), `PCL-5 item ${i} missing`);
assert(fullFormsWave1.includes('0–80'), 'PCL-5 0–80 scoring range missing');
assert(fullFormsWave1.includes('ليست ترجمة رسمية من VA'), 'PCL-5 must not imply Rawafid Arabic is an official VA translation');
assert(fullFormsWave1.includes('PCL5_Standard_form.pdf'), 'PCL-5 official VA standard form link missing');

// LEC-5 17 events, non-diagnostic scoring and multi-exposure UI.
for (let i = 1; i <= 17; i += 1) assert(fullFormsWave1.includes(`LEC${i}`), `LEC-5 event ${i} missing`);
for (const token of ['happened-to-me', 'witnessed', 'learned-about', 'job-exposure', 'not-sure', 'not-applicable']) assert(fullFormsWave1.includes(token), `LEC-5 exposure option missing: ${token}`);
assert(fullFormsWave1.includes('ليست مقياس شدة ذا مجموع تشخيصي واحد'), 'LEC-5 must preserve non-diagnostic/no-total boundary');
assert(formComponent.includes("item.code.startsWith('LEC')"), 'LEC-5 renderer must support multiple exposure selections per event');
assert(formComponent.includes("type={allowsMultiple ? 'checkbox' : 'radio'}"), 'LEC-5 multi-exposure choices must render as checkboxes');

// DRS complete item structure and total range.
for (const code of ['DRS-EYE', 'DRS-COMM', 'DRS-MOTOR', 'DRS-FEED', 'DRS-TOILET', 'DRS-GROOM', 'DRS-FUNCTION', 'DRS-EMPLOY']) assert(fullFormsWave1.includes(code), `DRS item missing: ${code}`);
assert(fullFormsWave1.includes('0–29'), 'DRS total range 0–29 missing');

// GOSE/PDDS/mMRC/AIMS complete structures and guardrails.
assert(fullFormsWave1.includes("code:'GOSE'"), 'GOSE final classification field missing');
for (const score of ['1 — وفاة', '8 — تعافٍ جيد أعلى']) assert(fullFormsWave1.includes(score), `GOSE endpoint missing: ${score}`);
for (const score of ['0 — طبيعي', '8 — ملازم للسرير']) assert(fullFormsWave1.includes(score), `PDDS endpoint missing: ${score}`);
for (const score of ['0 — ضيق النفس فقط مع الجهد الشديد', '4 — ضيق النفس يمنعني من مغادرة المنزل']) assert(fullFormsWave1.includes(score), `mMRC endpoint missing: ${score}`);
assert(fullFormsWave1.includes('لا تدّعي مطابقة ترجمة Mapi'), 'mMRC Rawafid Arabic must not be presented as an official Mapi translation');
for (let i = 1; i <= 12; i += 1) assert(fullFormsWave1.includes(`AIMS${i}`), `AIMS item ${i} missing`);
assert(fullFormsWave1.includes('المراسي التفصيلية للتقدير تُراجع من المصدر التدريبي'), 'AIMS anchor/training boundary missing');

// Pain/PGI operational scales.
assert(fullFormsWave1.includes("code:'PI'"), 'Pain Intensity field missing');
assert(fullFormsWave1.includes('Array.from({length:11}'), 'Pain Intensity must expose 0–10 choices');
assert(fullFormsWave1.includes("code:'PR'"), 'Pain Relief field missing');
assert(fullFormsWave1.includes("code:'PGI-IMPROVEMENT'"), 'Patient Global Impression field missing');
assert(fullFormsWave1.includes('0 — أسوأ') && fullFormsWave1.includes('4 — أفضل بكثير'), 'PGI 5-point endpoints missing');

// Full Forms Wave 2: rights-verified public-domain instruments and complete printable protocols.
const fullFormWave2Slugs = [...fullFormsWave2.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
const requiredWave2 = [
  'alcohol-use-disorders-identification-test-consumption',
  'alcohol-use-disorders-identification-test-self-report',
  'hamilton-anxiety-rating-scale',
  'barnes-akathisia-rating-scale',
  'rockport-one-mile-walk-test',
  'psoriasis-area-severity-index-fredriksson',
  'hamilton-depression-rating-scale-17',
];
assert(fullFormWave2Slugs.length >= requiredWave2.length, `expected at least ${requiredWave2.length} Wave-2 operational forms, found ${fullFormWave2Slugs.length}`);
for (const slug of requiredWave2) assert(fullFormWave2Slugs.includes(slug), `${slug}: Full Forms Wave 2 material missing`);
assert(new Set(fullFormWave2Slugs).size === fullFormWave2Slugs.length, 'duplicate slug in Full Forms Wave 2');
assert(!/http:\/\//.test(fullFormsWave2), 'Wave-2 sources must use HTTPS');
assert(operationalCatalog.includes('assessmentOperationalFullFormsWave2'), 'operational catalog must import Full Forms Wave 2');
assert(operationalCatalog.includes('...assessmentOperationalFullFormsWave2'), 'operational catalog must register Full Forms Wave 2');

// AUDIT-C / AUDIT-SR completeness and translation/diagnosis boundaries.
for (let i = 1; i <= 3; i += 1) assert(fullFormsWave2.includes(`AUDITC${i}`), `AUDIT-C item ${i} missing`);
assert(fullFormsWave2.includes('المجموع 0–12'), 'AUDIT-C 0–12 scoring range missing');
for (let i = 1; i <= 10; i += 1) assert(fullFormsWave2.includes(`AUDIT${i}`), `AUDIT-SR item ${i} missing`);
assert(fullFormsWave2.includes('المجموع 0–40'), 'AUDIT-SR 0–40 scoring range missing');
assert(fullFormsWave2.includes('لا تنسب ترجمة روافد إلى WHO'), 'AUDIT Arabic translation provenance boundary missing');
assert(fullFormsWave2.includes('WHO-MSD-MSB-01.6a'), 'WHO AUDIT primary source missing');

// HAM-A: 14 domains and 0-56 scoring.
for (let i = 1; i <= 14; i += 1) assert(fullFormsWave2.includes(`HAMA${i}`), `HAM-A item ${i} missing`);
assert(fullFormsWave2.includes('المجموع 0–56'), 'HAM-A total range 0–56 missing');
assert(fullFormsWave2.includes('hamilton-anxiety-rating-scale'), 'HAM-A CDISC source missing');

// BARS: observation protocol, four ratings, global 0-5.
for (const code of ['BARS-OBJ', 'BARS-AWARE', 'BARS-DISTRESS', 'BARS-GLOBAL']) assert(fullFormsWave2.includes(code), `BARS component missing: ${code}`);
assert(fullFormsWave2.includes('دقيقتين في كل وضع'), 'BARS seated/standing observation duration missing');
assert(fullFormsWave2.includes('5 — شديدة'), 'BARS global severity endpoint 5 missing');
assert(fullFormsWave2.includes('2574607'), 'BARS original PubMed source missing');

// Rockport protocol and Kline estimation equation.
for (const code of ['ROCK-AGE', 'ROCK-SEX', 'ROCK-WEIGHT-LB', 'ROCK-TIME-MIN', 'ROCK-TIME-SEC', 'ROCK-HR-END', 'ROCK-VO2']) assert(fullFormsWave2.includes(code), `Rockport field missing: ${code}`);
for (const coefficient of ['132.853', '0.0769', '0.3877', '6.315', '3.2649', '0.1565']) assert(fullFormsWave2.includes(coefficient), `Rockport Kline coefficient missing: ${coefficient}`);
assert(fullFormsWave2.includes('30–69 سنة'), 'Rockport derivation-population guardrail missing');

// PASI Fredriksson: four regions, E/I/D/A and exact formula structure.
for (const region of ['H', 'U', 'T', 'L']) {
  for (const component of ['E', 'I', 'D', 'A']) assert(fullFormsWave2.includes(`PASI-${region}-${component}`), `PASI field missing: PASI-${region}-${component}`);
}
assert(fullFormsWave2.includes('PASI-TOTAL'), 'PASI total field missing');
assert(fullFormsWave2.includes('0–72'), 'PASI 0–72 range missing');
assert(fullFormsWave2.includes('0.1(Eh+Ih+Dh)Ah') && fullFormsWave2.includes('0.4(El+Il+Dl)Al'), 'PASI weighted formula missing');
assert(fullFormsWave2.includes('3 أبريل 2026'), 'PASI Fredriksson CDISC release provenance missing');

// HAMD-17: complete item/range recording sheet without overclaiming an Arabic validated interview.
for (let i = 1; i <= 17; i += 1) assert(fullFormsWave2.includes(`HAMD17-${i}`), `HAMD-17 item ${i} missing`);
assert(fullFormsWave2.includes('المجموع القياسي 0–52'), 'HAMD-17 0–52 range missing');
assert(fullFormsWave2.includes("completeness: 'recording-and-scoring-sheet'"), 'HAMD-17 must remain a recording/scoring sheet until Arabic anchors are version-verified');
assert(fullFormsWave2.includes('أي درجة تشير إلى أفكار موت/إيذاء النفس تستلزم تقييم سلامة مباشرًا'), 'HAMD-17 suicide safety escalation missing');
assert(fullFormsWave2.includes('لا تدّعي أنها مقابلة عربية منظمة أو ترجمة عربية محققة'), 'HAMD-17 Arabic validation boundary missing');

// Guard against accidentally reproducing instruments that are not public-domain/open-reuse in this wave.
for (const restricted of ['hospital-anxiety-and-depression-scale', 'columbia-suicide-severity-rating-scale', 'mini-mental-state-examination', 'trail-making-test']) {
  assert(!fullFormsWave2.includes(`slug: '${restricted}'`), `restricted/non-open instrument must not be reproduced in Wave 2: ${restricted}`);
}

// Rendering and print architecture must use the aggregated operational catalog.
assert(detailPage.includes("from '@/lib/assessment-measure-operational-catalog'"), 'measure detail page must load the aggregated full-form operational catalog');
assert(detailPage.includes('<AssessmentMeasureOperationalForm material={operationalMaterial} />'), 'measure detail page must embed the operational form');
assert(detailPage.includes('/print/'), 'measure detail page must expose a print route');
assert(detailPage.includes('فتح المقياس / ورقة التطبيق'), 'measure detail page must visibly expose operational use');
assert(printPage.includes("from '@/lib/assessment-measure-operational-catalog'"), 'print page must load the aggregated full-form operational catalog');
assert(printPage.includes('robots: { index: false, follow: true }'), 'print routes must be noindex/follow');
assert(printPage.includes('<AssessmentMeasureOperationalForm material={material} printable />'), 'print route must render the same canonical operational material');
assert(printPage.includes('<MeasurePrintButton />'), 'print route must expose print/PDF control');
assert(printButton.includes('window.print()'), 'print control must call browser print');

for (const token of ['formHeader', 'demographicGrid', 'formItems', 'formOptions', 'formSafety', 'formFooter']) {
  assert(formComponent.includes(`styles.${token}`), `operational form renderer missing ${token}`);
  assert(css.includes(`.${token}`), `operational CSS missing .${token}`);
}
assert(css.includes('@media print'), 'A4/print CSS contract missing');
assert(css.includes('@page{size:A4'), 'print stylesheet must declare A4 page size');
assert(css.includes('.printToolbar{display:none!important}'), 'print toolbar must be hidden from printed output');

if (!process.exitCode) {
  console.log(`ASSESSMENT_OPERATIONAL_CONTRACT_PASS: ${explicitSlugs.length} base forms/protocols + ${fullFormSlugs.length} Wave 1 + ${fullFormWave2Slugs.length} Wave 2 + universal fallback + A4 print architecture verified.`);
}
