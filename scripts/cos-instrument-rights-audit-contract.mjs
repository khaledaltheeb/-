import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`COS_INSTRUMENT_RIGHTS_AUDIT_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const auditPath = 'lib/core-outcome-sets/instrument-rights-audit.ts';
const registryPath = 'lib/core-outcome-sets/instrument-crosswalk-registry.ts';
const wave2Path = 'lib/core-outcome-sets/instrument-crosswalk-wave2.ts';

for (const file of [auditPath, registryPath, wave2Path]) {
  assert(exists(file), `required file missing: ${file}`);
}

const audit = read(auditPath);
const registry = read(registryPath);

for (const id of ['kidscreen-10', 'top-addiction-ichom', 'pgsi', 'igdt-10', 'sure-addiction', 'heaviness-of-smoking-index']) {
  assert(audit.includes(`'${id}'`), `rights audit must retain ${id}`);
}

assert(audit.includes("'kidscreen-10': {") && audit.includes("rightsStatus: 'owner-conditions'"), 'KIDSCREEN-10 owner conditions must be explicit');
assert(audit.includes('third-party distribution restrictions') || audit.includes('توزيع/نقل الاستبيانات إلى أطراف ثالثة غير مسموح'), 'KIDSCREEN-10 redistribution restriction must remain explicit');
assert(audit.includes('https://www.kidscreen.org/english/terms-of-use/'), 'KIDSCREEN official terms URL missing');

for (const id of ['top-addiction-ichom', 'pgsi', 'igdt-10']) {
  const start = audit.indexOf(`'${id}': {`);
  const next = audit.indexOf('\n  },', start);
  const block = audit.slice(start, next);
  assert(block.includes("rawafidStatus: 'reference-rights'"), `${id} must remain reference-rights`);
  assert(block.includes("rightsStatus: 'license-or-permission-required'"), `${id} must require permission/license`);
  assert(block.includes('NHS'), `${id} must retain NHS NCCR rights evidence`);
}

const sureStart = audit.indexOf("'sure-addiction': {");
const sureEnd = audit.indexOf('\n  },', sureStart);
const sure = audit.slice(sureStart, sureEnd);
assert(sure.includes("rawafidStatus: 'reference-rights'"), 'SURE must remain reference-rights');
assert(sure.includes("rightsStatus: 'owner-conditions'"), 'SURE owner conditions must remain explicit');
assert(sure.includes('King’s College London') && sure.includes('التخزين الإلكتروني'), 'SURE electronic-use restriction must remain explicit');
assert(audit.includes('https://www.kcl.ac.uk/research/sure-substance-use-recovery-evaluator'), 'SURE official rights source missing');

const hsiStart = audit.indexOf("'heaviness-of-smoking-index': {");
const hsiEnd = audit.indexOf('\n  },', hsiStart);
const hsi = audit.slice(hsiStart, hsiEnd);
assert(hsi.includes("rawafidStatus: 'not-in-library'"), 'HSI must remain non-operational while rights are unresolved');
assert(hsi.includes("rightsStatus: 'not-reviewed'"), 'HSI rights must not be upgraded without direct evidence');
assert(hsi.includes('Adapted with permission'), 'HSI permission caveat from SAMHSA/NCBI must remain explicit');
assert(audit.includes('NBK574912'), 'HSI SAMHSA/NCBI evidence URL missing');

assert(!audit.includes("'phq-2-autism': {"), 'PHQ-2 must not be blocked by the rights audit overlay');
assert(registry.includes("applyInstrumentRightsAudit } from '@/lib/core-outcome-sets/instrument-rights-audit'"), 'crosswalk registry must import rights audit overlay');
assert(registry.includes('].map(applyInstrumentRightsAudit);'), 'rights audit must run after base/Wave2 catalog resolution');
assert(registry.indexOf('resolveWave2AgainstAssessmentCatalog') < registry.indexOf('].map(applyInstrumentRightsAudit);'), 'rights audit must execute after catalog sync logic');

if (!process.exitCode) {
  console.log('COS_INSTRUMENT_RIGHTS_AUDIT_OK restricted=5 unresolved=1 phq2_unblocked=true');
}
