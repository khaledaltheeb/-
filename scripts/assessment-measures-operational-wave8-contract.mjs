import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`ASSESSMENT_OPERATIONAL_WAVE8_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const measurePath = 'lib/assessment-measures-wave12.ts';
const measureCatalogPath = 'lib/assessment-measures-catalog.ts';
const operationalPath = 'lib/assessment-measure-operational-full-forms-wave8.ts';
const operationalCatalogPath = 'lib/assessment-measure-operational-catalog.ts';
const wave2AutismPath = 'lib/core-outcome-sets/instrument-crosswalk-wave2-autism.ts';
const crosswalkRegistryPath = 'lib/core-outcome-sets/instrument-crosswalk-registry.ts';

for (const file of [measurePath, measureCatalogPath, operationalPath, operationalCatalogPath, wave2AutismPath, crosswalkRegistryPath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const measure = read(measurePath);
const measureCatalog = read(measureCatalogPath);
const operational = read(operationalPath);
const operationalCatalog = read(operationalCatalogPath);
const wave2Autism = read(wave2AutismPath);
const crosswalkRegistry = read(crosswalkRegistryPath);

assert(measure.includes("slug: 'patient-health-questionnaire-2'"), 'PHQ-2 measure record missing');
assert(measure.includes("acronym: 'PHQ-2'"), 'PHQ-2 acronym missing');
assert(measure.includes("rightsStatus: 'public-domain'"), 'PHQ-2 public-domain status must be explicit');
assert(measure.includes('https://www.nih.gov/node/19936'), 'NIH PHQ-2 source missing');
assert(measure.includes('14583691'), 'original 2003 PHQ-2 validation source missing');
assert(measure.includes('40687118'), '2025 Arabic PHQ-2 psychometric source missing');
assert(measure.includes('fullArabicFormPublished: true'), 'PHQ-2 Arabic operational form must remain publishable');
assert(measure.includes('لا يحتوي بندًا عن أفكار الموت أو إيذاء النفس'), 'PHQ-2 limitation must state that suicide/self-harm is not assessed');
assert(measure.includes('0–6'), 'PHQ-2 score range 0–6 missing');
assert(measure.includes('≥3'), 'PHQ-2 common screening threshold must remain documented');

assert(measureCatalog.includes("assessmentMeasuresWave12 } from '@/lib/assessment-measures-wave12'"), 'assessment catalog must import Wave 12');
assert(measureCatalog.includes('...assessmentMeasuresWave12'), 'assessment catalog must register Wave 12');

assert(operational.includes("'patient-health-questionnaire-2': {"), 'PHQ-2 operational material missing');
assert(operational.includes("code: 'PHQ2-1'"), 'PHQ-2 first item missing');
assert(operational.includes("code: 'PHQ2-2'"), 'PHQ-2 second item missing');
assert(!operational.includes("code: 'PHQ2-3'"), 'PHQ-2 must contain exactly two scored items');
assert(!operational.includes("code: 'PHQ2-9'"), 'PHQ-2 must not acquire PHQ-9 self-harm item');
assert(operational.includes('المجموع الكلي 0–6'), 'PHQ-2 operational score range missing');
assert(operational.includes('الدرجة ≥3'), 'PHQ-2 operational screening threshold missing');
assert(operational.includes('لا يحتوي أي بند عن أفكار الموت أو إيذاء النفس'), 'PHQ-2 operational safety limitation missing');
assert(operational.includes('https://www.nih.gov/node/19936'), 'PHQ-2 operational NIH Arabic source missing');
assert(operational.includes('40687118'), 'PHQ-2 operational Arabic psychometric source missing');

assert(operationalCatalog.includes("assessmentOperationalFullFormsWave8 } from '@/lib/assessment-measure-operational-full-forms-wave8'"), 'operational catalog must import Wave 8');
assert(operationalCatalog.includes('...assessmentOperationalFullFormsWave8'), 'operational catalog must register Wave 8');

assert(wave2Autism.includes("id: 'phq-2-autism'"), 'autism COS PHQ-2 crosswalk record missing');
assert(wave2Autism.includes("acronym: 'PHQ-2'"), 'autism COS PHQ-2 acronym missing');
assert(crosswalkRegistry.includes("import { assessmentMeasures } from '@/lib/assessment-measures-catalog'"), 'crosswalk must remain synchronized to assessment catalog');
assert(crosswalkRegistry.includes("rawafidStatus: 'operational-full'"), 'crosswalk catalog resolver must retain operational promotion path');

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_WAVE8_OK phq2_items=2 score_range=0-6 arabic_source=NIH');
}
