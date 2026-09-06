import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`ASSESSMENT_OPERATIONAL_WAVE10_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const measurePath = 'lib/assessment-measures-wave12.ts';
const measureCatalogPath = 'lib/assessment-measures-catalog.ts';
const operationalPath = 'lib/assessment-measure-operational-full-forms-wave9.ts';
const operationalCatalogPath = 'lib/assessment-measure-operational-catalog.ts';
const rightsWave5Path = 'lib/core-outcome-sets/instrument-rights-audit-wave5.ts';
const registryPath = 'lib/core-outcome-sets/instrument-crosswalk-registry.ts';
const baseCrosswalkPath = 'lib/core-outcome-sets/instrument-crosswalk.ts';
const detailPagePath = 'app/core-outcome-sets/[slug]/page.tsx';

for (const file of [measurePath, measureCatalogPath, operationalPath, operationalCatalogPath, rightsWave5Path, registryPath, baseCrosswalkPath, detailPagePath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const measure = read(measurePath);
const measureCatalog = read(measureCatalogPath);
const operational = read(operationalPath);
const operationalCatalog = read(operationalCatalogPath);
const rightsWave5 = read(rightsWave5Path);
const registry = read(registryPath);
const baseCrosswalk = read(baseCrosswalkPath);
const detailPage = read(detailPagePath);

const gadMeasureStart = measure.indexOf("slug: 'generalized-anxiety-disorder-2'");
assert(gadMeasureStart >= 0, 'GAD-2 measure record missing');
const gadMeasure = measure.slice(gadMeasureStart);
assert(gadMeasure.includes("acronym: 'GAD-2'"), 'GAD-2 acronym missing');
assert(gadMeasure.includes("rightsStatus: 'open-reuse'"), 'GAD-2 must retain open-reuse rights status');
assert(gadMeasure.includes('لا يلزم إذن لإعادة إنتاج الأداة أو ترجمتها أو عرضها أو توزيعها'), 'GAD-2 no-permission reuse basis missing');
assert(gadMeasure.includes('NBK92248'), 'GAD-2 NICE/NCBI rights source missing');
assert(gadMeasure.includes('17339617'), 'GAD-2 original validation source missing');
assert(gadMeasure.includes('42084504'), 'GAD-2 Arabic psychometric source missing');
assert(gadMeasure.includes('fullArabicFormPublished: true'), 'GAD-2 Arabic operational form must remain publishable');
assert(gadMeasure.includes('مجموع 0–6'), 'GAD-2 measure score range 0–6 missing');
assert(gadMeasure.includes('≥3'), 'GAD-2 common screening threshold missing');
assert(gadMeasure.includes('لا تُعمم عتباتها أو خصائصها على جميع السكان العرب'), 'GAD-2 Arabic evidence generalization guardrail missing');

assert(measureCatalog.includes("assessmentMeasuresWave12 } from '@/lib/assessment-measures-wave12'"), 'assessment catalog must import Wave 12');
assert(measureCatalog.includes('...assessmentMeasuresWave12'), 'assessment catalog must register GAD-2-bearing Wave 12');

assert(operational.includes("'generalized-anxiety-disorder-2': {"), 'GAD-2 operational material missing');
assert(operational.includes("kind: 'full-instrument'"), 'GAD-2 must remain a full two-item instrument');
assert(operational.includes("completeness: 'standardized-protocol-sheet'"), 'GAD-2 open-reuse form must not be mislabeled public-domain');
assert(operational.includes("code: 'GAD2-1'"), 'GAD-2 first item missing');
assert(operational.includes("code: 'GAD2-2'"), 'GAD-2 second item missing');
assert(!operational.includes("code: 'GAD2-3'"), 'GAD-2 must contain exactly two scored items');
assert(operational.includes('الشعور بالعصبية أو القلق أو التوتر.'), 'GAD-2 first Arabic item must match Rawafid GAD-7 wording');
assert(operational.includes('عدم القدرة على إيقاف القلق أو السيطرة عليه.'), 'GAD-2 second Arabic item must match Rawafid GAD-7 wording');
for (const score of ['0', '1', '2', '3']) {
  assert(operational.includes(`score: ${score}`), `GAD-2 response score ${score} missing`);
}
assert(operational.includes('المجموع الكلي 0–6'), 'GAD-2 operational score range missing');
assert(operational.includes('الدرجة ≥3'), 'GAD-2 operational screening threshold missing');
assert(operational.includes('لا تضف البنود 3–7 من GAD-7'), 'GAD-2 must remain separated from GAD-7 scoring');
assert(operational.includes('لا تُعمم عتبات تلك الدراسة أو خصائصها على كل السكان العرب'), 'GAD-2 operational Arabic evidence guardrail missing');
assert(operational.includes('NBK92248') && operational.includes('42084504'), 'GAD-2 operational rights/Arabic sources missing');

assert(operationalCatalog.includes("assessmentOperationalFullFormsWave9 } from '@/lib/assessment-measure-operational-full-forms-wave9'"), 'operational catalog must import Wave 9');
assert(operationalCatalog.includes('...assessmentOperationalFullFormsWave9'), 'operational catalog must register Wave 9');

const baseGadStart = baseCrosswalk.indexOf("id: 'gad-2'");
assert(baseGadStart >= 0, 'base GAD-2 COS record missing');
const baseGadEnd = baseCrosswalk.indexOf('\n  },', baseGadStart);
const baseGad = baseCrosswalk.slice(baseGadStart, baseGadEnd);
assert(baseGad.includes("acronym: 'GAD-2'"), 'base GAD-2 COS acronym missing');
assert(baseGad.includes("rawafidStatus: 'operational-full'"), 'stable COS source must expose GAD-2 as operational-full');
assert(baseGad.includes("rightsStatus: 'rawafid-provenance-verified'"), 'stable COS source must retain verified GAD-2 rights');
assert(baseGad.includes("arabicEvidence: 'psychometric-context'"), 'stable COS source must expose contextual Arabic GAD-2 evidence');
assert(baseGad.includes("internalPath: '/assessment-measures/generalized-anxiety-disorder-2/'"), 'stable COS source GAD-2 path missing');
assert(baseGad.includes('NBK92248') && baseGad.includes('42084504'), 'stable COS source GAD-2 provenance missing');
assert(!baseGad.includes("rightsStatus: 'not-reviewed'"), 'stable COS source must not regress GAD-2 rights to not-reviewed');
assert(!baseGad.includes("arabicEvidence: 'not-audited'"), 'stable COS source must not regress GAD-2 Arabic evidence to not-audited');

assert(rightsWave5.includes("'gad-2': {"), 'GAD-2 Wave 5 crosswalk override missing');
assert(rightsWave5.includes("rawafidStatus: 'operational-full'"), 'GAD-2 aggregated COS status must be operational-full after direct audit');
assert(rightsWave5.includes("rightsStatus: 'rawafid-provenance-verified'"), 'GAD-2 aggregated COS rights must be verified');
assert(rightsWave5.includes("arabicEvidence: 'psychometric-context'"), 'GAD-2 aggregated COS Arabic evidence must remain contextual');
assert(rightsWave5.includes("internalPath: '/assessment-measures/generalized-anxiety-disorder-2/'"), 'GAD-2 aggregated COS internal path missing');
assert(rightsWave5.includes('NBK92248') && rightsWave5.includes('42084504'), 'GAD-2 aggregated COS provenance sources missing');

assert(registry.includes("applyInstrumentRightsAuditWave5 } from '@/lib/core-outcome-sets/instrument-rights-audit-wave5'"), 'crosswalk registry must import Wave 5');
assert(registry.includes('rightsAuditedInstrumentCrosswalkWave4.map(applyInstrumentRightsAuditWave5)'), 'Wave 5 must execute after Wave 4');

const detailUsesStableBase = detailPage.includes("from '@/lib/core-outcome-sets/instrument-crosswalk';");
const detailUsesAggregatedRegistry = detailPage.includes("from '@/lib/core-outcome-sets/instrument-crosswalk-registry';");
assert(detailUsesStableBase || detailUsesAggregatedRegistry, 'COS detail page must use a recognized crosswalk source');
if (detailUsesStableBase) {
  assert(baseGad.includes("arabicEvidence: 'psychometric-context'"), 'stable COS detail source must expose audited GAD-2 Arabic evidence');
}
if (detailUsesAggregatedRegistry) {
  assert(rightsWave5.includes("arabicEvidence: 'psychometric-context'"), 'aggregated COS detail source must expose audited GAD-2 Arabic evidence');
}

if (!process.exitCode) {
  console.log(`ASSESSMENT_OPERATIONAL_WAVE10_OK gad2_items=2 score_range=0-6 cutoff=3 rights=nice-ncbi arabic=contextual detail_source=${detailUsesStableBase ? 'stable-base' : 'aggregated-registry'}`);
}
