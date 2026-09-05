import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`ASSESSMENT_OPERATIONAL_WAVE9_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const measurePath = 'lib/assessment-measures-wave12.ts';
const operationalPath = 'lib/assessment-measure-operational-full-forms-wave8.ts';
const operationalCatalogPath = 'lib/assessment-measure-operational-catalog.ts';
const rightsAuditPath = 'lib/core-outcome-sets/instrument-rights-audit.ts';
const addictionCrosswalkPath = 'lib/core-outcome-sets/instrument-crosswalk-wave2-addiction.ts';
const crosswalkRegistryPath = 'lib/core-outcome-sets/instrument-crosswalk-registry.ts';

for (const file of [measurePath, operationalPath, operationalCatalogPath, rightsAuditPath, addictionCrosswalkPath, crosswalkRegistryPath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const measure = read(measurePath);
const operational = read(operationalPath);
const operationalCatalog = read(operationalCatalogPath);
const rightsAudit = read(rightsAuditPath);
const addictionCrosswalk = read(addictionCrosswalkPath);
const crosswalkRegistry = read(crosswalkRegistryPath);

const hsiMeasureStart = measure.indexOf("slug: 'heaviness-of-smoking-index'");
assert(hsiMeasureStart >= 0, 'HSI measure record missing');
const hsiMeasure = measure.slice(hsiMeasureStart);
assert(hsiMeasure.includes("acronym: 'HSI'"), 'HSI acronym missing');
assert(hsiMeasure.includes("rightsStatus: 'open-reuse'"), 'HSI must be labeled open-reuse, not public-domain');
assert(hsiMeasure.includes('permission not required for use'), 'HSI direct PhenX reuse statement missing');
assert(hsiMeasure.includes('phenxtoolkit.org/protocols/view/330201'), 'HSI PhenX rights source missing');
assert(hsiMeasure.includes('2758152'), 'HSI original validation/scoring source missing');
assert(hsiMeasure.includes('22799320') && hsiMeasure.includes('23457896'), 'HSI related Arabic FTCD/FTND evidence missing');
assert(hsiMeasure.includes("arabicStatus: 'translation-reported'"), 'HSI Arabic status must remain contextual/translation-reported');
assert(hsiMeasure.includes('لا ندّعي تحقق HSI العربي المستقل'), 'HSI must not claim independent Arabic psychometric validation');
assert(hsiMeasure.includes('fullArabicFormPublished: true'), 'HSI operational Arabic form must remain enabled');
assert(hsiMeasure.includes('المجموع 0–6'), 'HSI measure score range 0–6 missing');

const hsiOperationalStart = operational.indexOf("'heaviness-of-smoking-index': {");
assert(hsiOperationalStart >= 0, 'HSI operational material missing');
const hsiOperational = operational.slice(hsiOperationalStart);
assert(hsiOperational.includes("kind: 'full-instrument'"), 'HSI must remain a two-item instrument');
assert(hsiOperational.includes("completeness: 'standardized-protocol-sheet'"), 'HSI must not be mislabeled as public-domain completeness');
assert(hsiOperational.includes("code: 'HSI-TTFC'"), 'HSI time-to-first-cigarette item missing');
assert(hsiOperational.includes("code: 'HSI-CPD'"), 'HSI cigarettes-per-day item missing');
assert(!hsiOperational.includes("code: 'HSI-3'"), 'HSI must remain exactly two scored items');
assert(hsiOperational.includes('خلال 5 دقائق') && hsiOperational.includes('بعد أكثر من 60 دقيقة'), 'HSI TTFC response categories incomplete');
assert(hsiOperational.includes('10 سجائر أو أقل') && hsiOperational.includes('31 سيجارة أو أكثر'), 'HSI CPD response categories incomplete');
assert(hsiOperational.includes('المجموع الكلي من 0 إلى 6'), 'HSI operational score range missing');
assert(hsiOperational.includes('السجائر فقط'), 'HSI cigarette-only scope must remain explicit');
assert(hsiOperational.includes('الشيشة') && hsiOperational.includes('السجائر الإلكترونية'), 'HSI must explicitly reject unsupported conversion from other nicotine products');
assert(hsiOperational.includes('لا يثبت وحده خصائص HSI العربي كأداة مستقلة'), 'HSI Arabic evidence guardrail missing');
assert(hsiOperational.includes('phenxtoolkit.org/protocols/view/330201'), 'HSI operational PhenX source missing');

assert(operationalCatalog.includes("assessmentOperationalFullFormsWave8 } from '@/lib/assessment-measure-operational-full-forms-wave8'"), 'operational catalog must import Wave 8 materials');
assert(operationalCatalog.includes('...assessmentOperationalFullFormsWave8'), 'operational catalog must register HSI-bearing Wave 8 materials');

const hsiRightsStart = rightsAudit.indexOf("'heaviness-of-smoking-index': {");
assert(hsiRightsStart >= 0, 'HSI rights audit override missing');
const hsiRightsEnd = rightsAudit.indexOf('\n  },', hsiRightsStart);
const hsiRights = rightsAudit.slice(hsiRightsStart, hsiRightsEnd);
assert(hsiRights.includes("rightsStatus: 'rawafid-provenance-verified'"), 'HSI rights overlay must preserve direct reuse verification');
assert(hsiRights.includes("arabicEvidence: 'related-version-only'"), 'HSI crosswalk Arabic evidence must remain related-version-only');
assert(!hsiRights.includes('rawafidStatus:'), 'HSI rights overlay must not block catalog-driven operational promotion');

assert(addictionCrosswalk.includes("id: 'heaviness-of-smoking-index'"), 'ICHOM addiction HSI crosswalk record missing');
assert(addictionCrosswalk.includes("acronym: 'HSI'"), 'ICHOM addiction HSI acronym missing');
assert(crosswalkRegistry.includes("import { assessmentMeasures } from '@/lib/assessment-measures-catalog'"), 'crosswalk must resolve exact catalog matches');
assert(crosswalkRegistry.includes("rawafidStatus: 'operational-full'"), 'crosswalk catalog resolver must retain operational promotion path');
assert(!crosswalkRegistry.includes("'heaviness-of-smoking-index',"), 'HSI must not be placed in automatic-promotion block list');

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_WAVE9_OK hsi_items=2 score_range=0-6 rights=phenx arabic=contextual cigarettes_only=true');
}
