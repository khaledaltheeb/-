import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`COS_INSTRUMENT_RIGHTS_AUDIT_WAVE6_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const basePath = 'lib/core-outcome-sets/instrument-crosswalk.ts';
const auditPath = 'lib/core-outcome-sets/instrument-rights-audit-wave6.ts';
const registryPath = 'lib/core-outcome-sets/instrument-crosswalk-registry.ts';
const rightsReviewPath = 'lib/assessment-measures-rights-review.ts';

for (const file of [basePath, auditPath, registryPath, rightsReviewPath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const base = read(basePath);
const audit = read(auditPath);
const registry = read(registryPath);
const rightsReview = read(rightsReviewPath);

const block = (source, marker) => {
  const start = source.indexOf(marker);
  if (start < 0) return '';
  const end = source.indexOf('\n  },', start);
  return source.slice(start, end < 0 ? source.length : end);
};

const rcadsBase = block(base, "id: 'rcads'");
assert(rcadsBase, 'stable RCADS crosswalk record missing');
assert(rcadsBase.includes("rawafidStatus: 'reference-rights'"), 'stable RCADS must remain reference-rights');
assert(rcadsBase.includes("rightsStatus: 'owner-conditions'"), 'stable RCADS must retain owner conditions');
assert(rcadsBase.includes("arabicEvidence: 'related-version-only'"), 'RCADS Arabic evidence must remain RCADS-25 related-version-only');
assert(rcadsBase.includes('RCADS-25') || rcadsBase.includes('RCADS25'), 'RCADS exact-version Arabic caveat missing');
assert(rcadsBase.includes('childfirst.ucla.edu/resources'), 'stable RCADS must link to UCLA official distribution source');
assert(rcadsBase.includes('34210326'), 'RCADS-25 Arabic evidence PMID missing');
assert(!rcadsBase.includes("rightsStatus: 'not-reviewed'"), 'RCADS must not regress to not-reviewed rights');
assert(!rcadsBase.includes("rawafidStatus: 'operational-full'"), 'RCADS must not be published as a full operational instrument');

const gmfmBase = block(base, "id: 'gmfm'");
assert(gmfmBase, 'stable GMFM crosswalk record missing');
assert(gmfmBase.includes("rawafidStatus: 'reference-rights'"), 'stable GMFM must remain reference-rights');
assert(gmfmBase.includes("rightsStatus: 'owner-conditions'"), 'stable GMFM must retain owner conditions');
assert(gmfmBase.includes("arabicEvidence: 'not-audited'"), 'GMFM Arabic evidence must remain not-audited');
assert(gmfmBase.includes('GMFM-66') && gmfmBase.includes('GMFM-88'), 'GMFM exact-version distinction 66/88 missing');
assert(gmfmBase.includes('GMFCS') && gmfmBase.includes('مختلف'), 'GMFM must explicitly reject transfer from Arabic GMFCS evidence');
assert(gmfmBase.includes('canchild.ca/resources/44-gross-motor-function-measure-gmfm'), 'stable GMFM must link to CanChild official source');
assert(!gmfmBase.includes("rightsStatus: 'not-reviewed'"), 'GMFM must not regress to not-reviewed rights');
assert(!gmfmBase.includes("rawafidStatus: 'operational-full'"), 'GMFM must not be published as a full operational instrument while version remains unresolved');

for (const id of ['rcads', 'gmfm']) {
  const audited = block(audit, `'${id}': {`);
  assert(audited, `Wave 6 override missing ${id}`);
  assert(audited.includes("rawafidStatus: 'reference-rights'"), `${id} Wave 6 status must remain reference-rights`);
  assert(audited.includes("rightsStatus: 'owner-conditions'"), `${id} Wave 6 rights must remain owner-conditions`);
  assert(audited.includes("catalogSync: 'rights-conflict'"), `${id} Wave 6 must block future catalog promotion by rights conflict`);
}
assert(audit.includes('UCLA Child FIRST') && audit.includes('قناة التوزيع الرسمية'), 'RCADS owner/distribution guardrail missing from Wave 6');
assert(audit.includes('GMFM-66') && audit.includes('GMFM-88') && audit.includes('GMFCS'), 'GMFM version/language guardrails missing from Wave 6');

assert(registry.includes("applyInstrumentRightsAuditWave6 } from '@/lib/core-outcome-sets/instrument-rights-audit-wave6'"), 'aggregate registry must import Wave 6');
assert(registry.includes('rightsAuditedInstrumentCrosswalkWave5.map(applyInstrumentRightsAuditWave6)'), 'Wave 6 must execute after Wave 5');

assert(rightsReview.includes("| 'owner-conditions'"), 'central rights-review status union must support owner-conditions');
assert(rightsReview.includes("'owner-conditions': 'شروط المالك تحكم الاستخدام وإعادة التوزيع'"), 'central owner-conditions label missing');
const rcadsReview = block(rightsReview, "slug: 'revised-childrens-anxiety-and-depression-scale'");
const gmfmReview = block(rightsReview, "slug: 'gross-motor-function-measure'");
assert(rcadsReview.includes("status: 'owner-conditions'"), 'RCADS central rights-review entry missing owner conditions');
assert(rcadsReview.includes('childfirst.ucla.edu/resources'), 'RCADS central rights source must be UCLA');
assert(rcadsReview.includes('لا ننشر بنود RCADS الكامل') && rcadsReview.includes('scorer عام'), 'RCADS safe-use boundary missing');
assert(gmfmReview.includes("status: 'owner-conditions'"), 'GMFM central rights-review entry missing owner conditions');
assert(gmfmReview.includes('canchild.ca/resources/44-gross-motor-function-measure-gmfm'), 'GMFM central rights source must be CanChild');
assert(gmfmReview.includes('GMFM-66') && gmfmReview.includes('GMFM-88'), 'GMFM central exact-version boundary missing');
assert(gmfmReview.includes('GMFCS') && gmfmReview.includes('لا ننقل'), 'GMFM central Arabic GMFCS non-transfer boundary missing');

if (!process.exitCode) {
  console.log('COS_INSTRUMENT_RIGHTS_AUDIT_WAVE6_OK rcads=reference-rights gmfm=reference-rights exact_version=true owner_conditions=true');
}
