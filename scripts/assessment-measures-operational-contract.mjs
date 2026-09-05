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
const detailPage = read('app/assessment-measures/[slug]/page.tsx');
const printPage = read('app/assessment-measures/[slug]/print/page.tsx');
const formComponent = read('components/assessment-measure-operational-form.tsx');
const printButton = read('components/measure-print-button.tsx');
const css = read('components/assessment-measures.module.css');

assert(operational.includes('export function getOperationalMaterial'), 'all measures must resolve through getOperationalMaterial');
assert(operational.includes("completeness: 'recording-and-scoring-sheet'"), 'generic printable recording fallback is missing');
assert(operational.includes('measure.administrationSteps.map'), 'fallback must preserve administration steps');
assert(operational.includes('measure.scoring'), 'fallback must preserve scoring instructions');
assert(operational.includes('measure.safetyNotes'), 'fallback must preserve safety/stop rules');
assert(operational.includes('measure.sources.map'), 'fallback must preserve authoritative source links');

const explicitSlugs = [...operational.matchAll(/^\s{2}'([^']+)': \{/gm)].map((match) => match[1]);
assert(explicitSlugs.length >= 11, `expected at least 11 explicitly operationalized measures, found ${explicitSlugs.length}`);
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
for (const slug of requiredExplicit) assert(explicitSlugs.includes(slug), `${slug}: explicit form/protocol missing`);

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

// Rendering and print architecture.
assert(detailPage.includes("from '@/lib/assessment-measure-operational'"), 'measure detail page must load operational material');
assert(detailPage.includes('<AssessmentMeasureOperationalForm material={operationalMaterial} />'), 'measure detail page must embed the operational form');
assert(detailPage.includes('/print/'), 'measure detail page must expose a print route');
assert(detailPage.includes('فتح المقياس / ورقة التطبيق'), 'measure detail page must visibly expose operational use');
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
  console.log(`ASSESSMENT_OPERATIONAL_CONTRACT_PASS: ${explicitSlugs.length} explicit forms/protocols + universal operational fallback + A4 print architecture verified.`);
}
