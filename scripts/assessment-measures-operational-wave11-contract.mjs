import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`ASSESSMENT_OPERATIONAL_WAVE11_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const formPath = 'lib/assessment-measure-operational-full-forms-wave10.ts';
const catalogPath = 'lib/assessment-measure-operational-catalog.ts';
const coveragePath = 'scripts/assessment-measures-operational-coverage.mjs';

for (const file of [formPath, catalogPath, coveragePath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const form = read(formPath);
const catalog = read(catalogPath);
const coverage = read(coveragePath);

assert(form.includes("'international-physical-activity-questionnaire-short-form-self-administered': {"), 'IPAQ-SF operational record missing');
assert(form.includes("kind: 'scoring-form'"), 'IPAQ-SF must remain a scoring/recording sheet rather than claiming a rewritten Arabic full instrument');
assert(form.includes("completeness: 'recording-and-scoring-sheet'"), 'IPAQ-SF completeness boundary missing');
assert(form.includes('August 2002 Short Last 7 Days Self-Administered'), 'IPAQ-SF exact version missing');
assert(form.includes('scoring protocol revised November 2005'), 'IPAQ-SF scoring protocol version missing');

for (const code of [
  'IPAQSF-VIG-DAYS',
  'IPAQSF-VIG-MIN',
  'IPAQSF-MOD-DAYS',
  'IPAQSF-MOD-MIN',
  'IPAQSF-WALK-DAYS',
  'IPAQSF-WALK-MIN',
  'IPAQSF-SIT-MIN',
]) {
  assert(form.includes(`code: '${code}'`), `IPAQ-SF required recording field missing: ${code}`);
}

for (const token of ['3.3 MET', '4.0 MET', '8.0 MET', '600 MET-min/week', '1500 MET-min/week', '3000 MET-min/week']) {
  assert(form.includes(token), `IPAQ-SF scoring rule missing: ${token}`);
}
assert(form.includes('لا تضف وقت الجلوس') || form.includes('لا يدخل في مجموع MET-min/week'), 'IPAQ-SF sitting exclusion from MET total missing');
assert(form.includes('منخفض/غير نشط') && form.includes('متوسط') && form.includes('مرتفع'), 'IPAQ-SF categorical interpretation missing');

assert(form.includes('sites.google.com/view/ipaq/home'), 'IPAQ official home provenance missing');
assert(form.includes('sites.google.com/view/ipaq/download'), 'IPAQ official download provenance missing');
assert(form.includes('sites.google.com/view/ipaq/score'), 'IPAQ official scoring provenance missing');
assert(form.includes('1LMCwPR0ddtdkb3uIuKPccip7ooD8wmrf'), 'official English self-admin short file link missing');
assert(form.includes('1kUhVObA_K-Tr81onZQp6Y8RmilTKqRNY'), 'official-repository Arabic Saudi self-admin short file link missing');
assert(form.includes('لم تتحقق الجهة من دقتها') || form.includes('لم تتحقق الجهة من دقة'), 'official IPAQ translation-quality warning must remain explicit');
assert(form.includes('لا تعيد روافد صياغة البنود العربية'), 'Rawafid must not present a locally rewritten Arabic IPAQ as official');
assert(form.includes('accelerometer') || form.includes('مقاييس موضوعية'), 'IPAQ self-report/criterion-validity limitation missing');
assert(form.includes('لا تحدد سلامة') || form.includes('لا يقرر تلقائيًا وصفة تمرين'), 'IPAQ safety boundary missing');

assert(catalog.includes("assessmentOperationalFullFormsWave10 } from '@/lib/assessment-measure-operational-full-forms-wave10'"), 'operational catalog Wave 10 import missing');
assert(catalog.includes('...assessmentOperationalFullFormsWave10'), 'operational catalog Wave 10 spread missing');

assert(coverage.includes("/^assessment-measures-wave\\d+\\.ts$/"), 'coverage must discover all measure waves dynamically');
assert(coverage.includes("/^assessment-measure-operational-full-forms-wave\\d+\\.ts$/"), 'coverage must discover all operational waves dynamically');
assert(coverage.includes('orphanExplicit.length'), 'coverage must reject orphan explicit operational materials');

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_WAVE11_OK ipaq_sf_fields=7 scoring=3.3/4.0/8.0 categories=low/moderate/high rights=open-official arabic=repository-version-with-quality-warning coverage=dynamic');
}
