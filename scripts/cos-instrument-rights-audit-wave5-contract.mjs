import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`COS_INSTRUMENT_RIGHTS_AUDIT_WAVE5_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const auditPath = 'lib/core-outcome-sets/instrument-rights-audit-wave5.ts';
const registryPath = 'lib/core-outcome-sets/instrument-crosswalk-registry.ts';

for (const file of [auditPath, registryPath]) assert(exists(file), `required file missing: ${file}`);

const audit = read(auditPath);
const registry = read(registryPath);

const blockFor = (id) => {
  const start = audit.indexOf(`'${id}': {`);
  assert(start >= 0, `Wave 5 missing ${id}`);
  const end = audit.indexOf('\n  },', start);
  return audit.slice(start, end >= 0 ? end : undefined);
};

assert(audit.includes('ASD_Both_Track_Reference_Guide_Document.pdf'), 'official ICHOM Autism reference guide must anchor Wave 5');

for (const id of ['rbs-r-autism', 'cfql-2-autism', 'faces-autism', 'empathy-quotient-autism', 'psq-autism', 'bisq-autism', 'panas-autism', 'vineland-autism', 'cbcl-autism', 'mcmaster-fad-autism', 'srs-autism']) {
  blockFor(id);
}

const rbs = blockFor('rbs-r-autism');
assert(rbs.includes("rawafidStatus: 'not-in-library'"), 'RBS-R must not stay reference-rights after ICHOM correction');
assert(rbs.includes("rightsStatus: 'not-reviewed'"), 'RBS-R must preserve unresolved detailed licensing rather than owner-condition claim');
assert(rbs.includes('free for all to use'), 'RBS-R ICHOM free-use statement missing');

const cfql = blockFor('cfql-2-autism');
assert(cfql.includes("rawafidStatus: 'not-in-library'"), 'CFQL-2 must remain non-operational');
assert(cfql.includes("rightsStatus: 'not-reviewed'"), 'CFQL-2 detailed redistribution rights must remain unresolved');
assert(cfql.includes('free for all to use'), 'CFQL-2 ICHOM free-use statement missing');

for (const id of ['faces-autism', 'empathy-quotient-autism', 'bisq-autism']) {
  const block = blockFor(id);
  assert(block.includes("rawafidStatus: 'not-in-library'"), `${id} must not be published operationally before exact Arabic implementation review`);
  assert(block.includes("rightsStatus: 'rawafid-provenance-verified'"), `${id} free-use/no-licence provenance must be explicit`);
}
assert(blockFor('faces-autism').includes('License not needed') || blockFor('faces-autism').includes('لا يحتاج ترخيص'), 'FACES no-licence ICHOM statement missing');
assert(blockFor('empathy-quotient-autism').includes('License not needed') || blockFor('empathy-quotient-autism').includes('لا يحتاج ترخيص'), 'EQ no-licence ICHOM statement missing');
assert(blockFor('bisq-autism').includes('publicly available and free to use'), 'BISQ free-use ICHOM statement missing');

const psq = blockFor('psq-autism');
assert(psq.includes("rightsStatus: 'not-reviewed'"), 'PSQ must retain unresolved source discrepancy');
assert(psq.includes('ICHOM') && psq.includes('ATS'), 'PSQ ICHOM/ATS licensing discrepancy must be documented');
assert(psq.includes("rawafidStatus: 'not-in-library'"), 'PSQ must remain non-operational while discrepancy is unresolved');

const panas = blockFor('panas-autism');
assert(panas.includes("rightsStatus: 'not-reviewed'"), 'PANAS must not retain categorical owner-controlled status after ICHOM correction');
assert(panas.includes('free to use'), 'PANAS ICHOM free-use statement missing');
assert(panas.includes('exact-version') || panas.includes('الإصدار'), 'PANAS exact-version ambiguity must remain explicit');

for (const id of ['vineland-autism', 'cbcl-autism', 'mcmaster-fad-autism', 'srs-autism']) {
  const block = blockFor(id);
  assert(block.includes("rawafidStatus: 'reference-rights'"), `${id} must remain reference-rights`);
  assert(block.includes("rightsStatus: 'license-or-permission-required'"), `${id} must require purchase/licence/permission`);
}
assert(blockFor('vineland-autism').includes('must be purchased') || blockFor('vineland-autism').includes('يجب شراؤ'), 'Vineland purchase requirement missing');
assert(blockFor('cbcl-autism').includes('must be purchased') || blockFor('cbcl-autism').includes('يجب شراؤ'), 'CBCL purchase requirement missing');
assert(blockFor('srs-autism').includes('must be purchased') || blockFor('srs-autism').includes('يجب شراؤ'), 'SRS purchase requirement missing');
assert(blockFor('mcmaster-fad-autism').includes('licensing fees') || blockFor('mcmaster-fad-autism').includes('رسوم ترخيص'), 'FAD licensing-fee requirement missing');

const vineland = blockFor('vineland-autism');
assert(vineland.includes("arabicEvidence: 'related-version-only'"), 'Vineland Arabic evidence must stay related-version-only');
assert(vineland.includes('VABS-II'), 'Vineland related Arabic version must be identified explicitly');

assert(!audit.includes("'phq-2-autism': {"), 'PHQ-2 must remain outside Wave 5 restriction/correction overlay');
assert(registry.includes("applyInstrumentRightsAuditWave5 } from '@/lib/core-outcome-sets/instrument-rights-audit-wave5'"), 'registry must import Wave 5 audit');
assert(registry.includes('rightsAuditedInstrumentCrosswalkWave4.map(applyInstrumentRightsAuditWave5)'), 'Wave 5 must run after Wave 4');
assert(registry.indexOf('rightsAuditedInstrumentCrosswalkWave3.map(applyInstrumentRightsAuditWave4)') < registry.indexOf('rightsAuditedInstrumentCrosswalkWave4.map(applyInstrumentRightsAuditWave5)'), 'Wave 5 audit order is invalid');

if (!process.exitCode) {
  console.log('COS_INSTRUMENT_RIGHTS_AUDIT_WAVE5_OK corrected_free_use=7 paid_or_licensed=4 psq_discrepancy=1 phq2_unblocked=true');
}
