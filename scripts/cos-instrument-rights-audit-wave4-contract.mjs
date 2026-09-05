import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`COS_INSTRUMENT_RIGHTS_AUDIT_WAVE4_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const auditPath = 'lib/core-outcome-sets/instrument-rights-audit-wave4.ts';
const registryPath = 'lib/core-outcome-sets/instrument-crosswalk-registry.ts';

for (const file of [auditPath, registryPath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const audit = read(auditPath);
const registry = read(registryPath);

const blockFor = (id) => {
  const start = audit.indexOf(`'${id}': {`);
  assert(start >= 0, `rights audit Wave 4 missing ${id}`);
  const end = audit.indexOf('\n  },', start);
  return audit.slice(start, end >= 0 ? end : undefined);
};

for (const id of ['pac-autism', 'rbs-r-autism', 'psq-autism', 'empathy-quotient-autism', 'panas-autism', 'faces-autism']) {
  const block = blockFor(id);
  assert(block.includes("rawafidStatus: 'reference-rights'"), `${id} must remain reference-rights`);
  assert(block.includes('internalPath') === false, `${id} override must not add an internal operational path`);
}

const pac = blockFor('pac-autism');
assert(pac.includes("rightsStatus: 'license-or-permission-required'"), 'PAC must require licence/permission');
assert(pac.includes('McMaster') && pac.includes('العرض العام'), 'PAC must retain McMaster public-display restriction');
assert(audit.includes('canchild.ca/shop/67-cape-pac-manual-only'), 'PAC official CanChild licence source missing');

const rbs = blockFor('rbs-r-autism');
assert(rbs.includes("rightsStatus: 'owner-conditions'"), 'RBS-R must retain owner-controlled status');
assert(rbs.includes("arabicEvidence: 'psychometric-context'"), 'RBS-R Arabic psychometric evidence must be recorded');
assert(rbs.includes('258') && rbs.includes('عراقي'), 'RBS-R Iraqi Arabic validation context missing');

const psq = blockFor('psq-autism');
assert(psq.includes("rightsStatus: 'license-or-permission-required'"), 'PSQ must require licence/permission');
assert(psq.includes("arabicEvidence: 'psychometric-context'"), 'PSQ Arabic validation must be recorded');
assert(psq.includes('36780751') && psq.includes('10.1016/j.sleep.2023.01.017'), 'PSQ Saudi Arabic validation source missing');
assert(audit.includes('thoracic.org/assemblies/srn/sleep-related-questionnaires/psq'), 'ATS PSQ rights source missing');

const eq = blockFor('empathy-quotient-autism');
assert(eq.includes("rightsStatus: 'owner-conditions'"), 'Empathy Quotient must retain ARC owner conditions');
assert(eq.includes("arabicEvidence: 'official-or-linguistic-translation'"), 'EQ official Arabic translation status missing');
assert(eq.includes('Cambridge ARC') || eq.includes('Cambridge'), 'EQ Cambridge ARC provenance missing');
assert(audit.includes('autismresearchcentre.com/tests/empathy-quotient-eq-for-adults'), 'EQ official ARC page missing');

const panas = blockFor('panas-autism');
assert(panas.includes("rightsStatus: 'owner-conditions'"), 'PANAS/PANAS-C must retain owner conditions');
assert(panas.includes('exact-version') || panas.includes('الإصدار'), 'PANAS exact-version ambiguity must remain explicit');
assert(panas.includes('غير التجارية') || panas.includes('غير التجاري'), 'PANAS non-commercial restriction must remain explicit');

const faces = blockFor('faces-autism');
assert(faces.includes("rightsStatus: 'license-or-permission-required'"), 'FACES must require licence/permission');
assert(faces.includes("arabicEvidence: 'psychometric-context'"), 'FACES IV Saudi Arabic psychometric evidence missing');
assert(faces.includes('10.1177/0192513X211033936'), 'FACES IV Arabic Saudi DOI missing');
assert(faces.includes('الإصدار') || faces.includes('FACES IV'), 'FACES exact-version ambiguity must remain explicit');

assert(!audit.includes("'phq-2-autism': {"), 'PHQ-2 must remain outside Wave 4 rights restrictions');
assert(registry.includes("applyInstrumentRightsAuditWave4 } from '@/lib/core-outcome-sets/instrument-rights-audit-wave4'"), 'registry must import Wave 4 audit');
assert(registry.includes('].map(applyInstrumentRightsAudit);'), 'Wave 3 audit boundary must remain intact');
assert(registry.includes('rightsAuditedInstrumentCrosswalkWave3.map(applyInstrumentRightsAuditWave4)'), 'Wave 4 must run after Wave 3');
assert(registry.indexOf('].map(applyInstrumentRightsAudit);') < registry.indexOf('rightsAuditedInstrumentCrosswalkWave3.map(applyInstrumentRightsAuditWave4)'), 'Wave 4 audit order is invalid');

if (!process.exitCode) {
  console.log('COS_INSTRUMENT_RIGHTS_AUDIT_WAVE4_OK restricted=6 arabic_context=3 official_arabic=1 phq2_unblocked=true');
}
