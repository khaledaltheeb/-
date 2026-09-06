import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`ASSESSMENT_EXPLICIT_REGISTRY_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const base = read('lib/assessment-measure-operational.ts');
const catalog = read('lib/assessment-measure-operational-catalog.ts');
const detail = read('app/assessment-measures/[slug]/page.tsx');
const print = read('app/assessment-measures/[slug]/print/page.tsx');

assert(base.includes('export const operationalMaterials'), 'base explicit operational registry must remain exported');
assert(catalog.includes('operationalMaterials as baseOperationalMaterials'), 'aggregated catalog must import the base explicit registry');
assert(catalog.includes('...baseOperationalMaterials'), 'aggregated explicit registry must include base authored materials before waves');
assert(catalog.indexOf('...baseOperationalMaterials') < catalog.indexOf('...assessmentOperationalFullFormsWave1'), 'base materials must load before extension waves so later reviewed overrides remain authoritative');
assert(catalog.includes('export function hasExplicitOperationalMaterial'), 'explicit-status API missing');

const requiredBaseExplicit = [
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
for (const slug of requiredBaseExplicit) {
  assert(base.includes(`'${slug}': {`), `base explicit material missing: ${slug}`);
}

assert(detail.includes('hasExplicitOperationalMaterial(measure.slug)'), 'detail page must derive operational/fallback semantics from the aggregated explicit registry');
assert(print.includes('hasExplicitOperationalMaterial(measure.slug)'), 'print page must derive operational/fallback semantics from the aggregated explicit registry');
assert(detail.includes('فتح المادة التشغيلية') && detail.includes('فتح ورقة التوثيق العامة'), 'detail page must keep distinct explicit/fallback user language');
assert(print.includes('ورقة توثيق عامة — ليست نموذج المقياس'), 'print fallback disclosure missing');

if (!process.exitCode) {
  console.log(`ASSESSMENT_EXPLICIT_REGISTRY_OK base_explicit=${requiredBaseExplicit.length} aggregated=true ui_semantics=explicit_vs_fallback`);
}
