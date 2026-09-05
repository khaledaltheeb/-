import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`OUTCOME_MEASUREMENT_SEPARATION_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const cosPagePath = 'app/core-outcome-sets/page.tsx';
const labPath = 'app/assessment-lab/page.tsx';
const measuresPath = 'app/assessment-measures/page.tsx';
const methodologyPath = 'app/assessment-measures/methodology/page.tsx';
const sitemapPath = 'app/sitemaps/static.xml/route.ts';

assert(exists(cosPagePath), 'Core Outcome Sets page must exist');
assert(exists(labPath), 'Assessment Lab page must exist');
assert(exists(measuresPath), 'Assessment Measures page must exist');
assert(exists(methodologyPath), 'Assessment Measures methodology page must exist');

if (exists(cosPagePath)) {
  const cos = read(cosPagePath);
  assert(cos.includes('ماذا ينبغي قياسه؟'), 'COS page must explicitly answer WHAT to measure');
  assert(cos.includes('ليست استبيانًا'), 'COS page must state that a COS is not a questionnaire');
  assert(cos.includes('COMS — Core Outcome Measurement Set'), 'COS page must distinguish COMS from COS');
  assert(cos.includes('الحالة أو المجال الصحي'), 'COS scope must include health condition/domain');
  assert(cos.includes('السكان المستهدفون'), 'COS scope must include target population');
  assert(cos.includes('التدخلات'), 'COS scope must include intervention applicability');
  assert(cos.includes('تبنّي أو تكييف COS للسياق العربي ≠ تكييف أداة القياس إلى العربية'), 'COS contextual adoption/adaptation must remain separate from Arabic instrument adaptation');
  assert(cos.includes('ترجمة أو تلخيص COS بالعربية لا يثبت ملاءمته الثقافية للسياق العربي'), 'Arabic translation of a COS must not be presented as proof of contextual applicability');
  assert(cos.includes('ملاءمة مجموعة النتائج') || cos.includes('ملاءمة <strong>مجموعة النتائج</strong>'), 'COS page must preserve the distinction between outcome-set applicability and instrument applicability');
  assert(cos.includes('https://doi.org/10.1186/s13063-026-09834-w'), 'COS contextual-adaptation section must retain the Kenya adoption/adaptation example');
  assert(cos.includes('حقوق + تكييف لغوي/ثقافي + تحقق سيكومتري مناسب'), 'Arabic status must not collapse rights, adaptation and psychometrics');
  assert(cos.includes('https://www.comet-initiative.org/Studies'), 'COS page must link to the COMET database');
  assert(cos.includes('https://www.cosmin.nl/finding-right-tool/developing-core-outcome-set/'), 'COS page must link to COSMIN/COMET instrument-selection guidance');
}

if (exists(labPath)) {
  const lab = read(labPath);
  assert(lab.includes('WHAT → HOW → QUALITY → ARABIC'), 'Assessment Lab must expose the measurement decision map');
  assert(lab.includes('Core Outcome Set — ماذا نقيس؟'), 'Assessment Lab must distinguish Core Outcome Sets');
  assert(lab.includes('Outcome Measurement Instrument — كيف نقيس؟'), 'Assessment Lab must distinguish measurement instruments');
  assert(lab.includes('/assessment-measures/methodology/#measurement-properties'), 'Assessment Lab must link to measurement-properties methodology');
  assert(lab.includes('/assessment-measures/methodology/#arabic-adaptation'), 'Assessment Lab must link to Arabic adaptation methodology');
  assert(lab.includes('ليست Core Outcome Sets'), 'Rawafid self-monitoring tools must not be presented as COS');
}

if (exists(measuresPath)) {
  const measures = read(measuresPath);
  assert(measures.includes('HOW TO MEASURE'), 'Measurement library must identify itself as the HOW layer');
  assert(measures.includes('/core-outcome-sets/'), 'Measurement library must link back to Core Outcome Sets');
  assert(measures.includes('COS ≠ أداة قياس'), 'Measurement library must explicitly separate COS from instruments');
  assert(measures.includes('Core Outcome Measurement Set (COMS)'), 'Measurement library must recognize COMS when present');
}

if (exists(methodologyPath)) {
  const methodology = read(methodologyPath);
  assert(methodology.includes('id="measurement-properties"'), 'Methodology must expose a stable measurement-properties anchor');
  assert(methodology.includes('id="arabic-adaptation"'), 'Methodology must expose a stable Arabic-adaptation anchor');
  for (const property of [
    'Content validity',
    'Structural validity',
    'Internal consistency',
    'Reliability',
    'Measurement error',
    'Hypotheses testing for construct validity',
    'Cross-cultural validity / measurement invariance',
    'Criterion validity',
    'Responsiveness',
  ]) {
    assert(methodology.includes(property), `Methodology must retain COSMIN property: ${property}`);
  }
  assert(methodology.includes('ليسا خصائص قياس'), 'Methodology must distinguish interpretability and feasibility from measurement properties');
  assert(methodology.includes('الترجمة أو التكييف اللغوي ليست بحد ذاتها «خاصية سيكومترية»'), 'Methodology must distinguish translation from psychometric validation');
  assert(methodology.includes('حالة الحقوق ≠ حالة الترجمة ≠ التكييف الثقافي ≠ التحقق السيكومتري ≠ التكافؤ بين اللغات'), 'Arabic status dimensions must remain separate');
}

if (exists(sitemapPath)) {
  const sitemap = read(sitemapPath);
  assert(sitemap.includes("path:'/core-outcome-sets/'"), 'Static sitemap must include Core Outcome Sets');
}

const assessmentContract = read('scripts/assessment-lab-contract.mjs');
assert(assessmentContract.includes('70') || assessmentContract.includes('assessmentSlugs'), 'Existing Assessment Lab preservation contract must remain present');

if (!process.exitCode) {
  console.log('OUTCOME_MEASUREMENT_SEPARATION_OK');
}
