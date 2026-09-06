import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`COS_INSTRUMENT_RIGHTS_CLOSURE_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const seedFiles = [
  'lib/core-outcome-sets/instrument-crosswalk.ts',
  'lib/core-outcome-sets/instrument-crosswalk-wave2-addiction.ts',
  'lib/core-outcome-sets/instrument-crosswalk-wave2-autism.ts',
  'lib/core-outcome-sets/instrument-crosswalk-wave2-childhood-cancer.ts',
];
const auditFiles = [
  'lib/core-outcome-sets/instrument-rights-audit.ts',
  'lib/core-outcome-sets/instrument-rights-audit-wave4.ts',
  'lib/core-outcome-sets/instrument-rights-audit-wave5.ts',
  'lib/core-outcome-sets/instrument-rights-audit-wave6.ts',
  'lib/core-outcome-sets/instrument-rights-audit-closure.ts',
];
const registryPath = 'lib/core-outcome-sets/instrument-crosswalk-registry.ts';
const detailPath = 'app/core-outcome-sets/[slug]/page.tsx';

for (const file of [...seedFiles, ...auditFiles, registryPath, detailPath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const extractRecordBlocks = (source) => {
  const matches = [...source.matchAll(/\bid:\s*'([^']+)'/g)];
  return matches.map((match, index) => ({
    id: match[1],
    block: source.slice(match.index, matches[index + 1]?.index ?? source.length),
  }));
};

const seedRecords = seedFiles.flatMap((file) =>
  extractRecordBlocks(read(file)).map((record) => ({ ...record, file })),
);
const seedIds = seedRecords.map((record) => record.id);
const duplicateSeedIds = [...new Set(seedIds.filter((id, index) => seedIds.indexOf(id) !== index))];
assert(duplicateSeedIds.length === 0, `duplicate instrument ids across seed files: ${duplicateSeedIds.join(', ')}`);

const auditOverrideIds = new Set();
for (const file of auditFiles) {
  const source = read(file);
  for (const match of source.matchAll(/^\s{2}(?:'([^']+)'|([A-Za-z0-9_]+)):\s*\{/gm)) {
    const id = match[1] ?? match[2];
    if (id) auditOverrideIds.add(id);
  }
}

const unresolvedSeedRights = seedRecords
  .filter((record) => record.block.includes("rightsStatus: 'not-reviewed'"))
  .filter((record) => !auditOverrideIds.has(record.id));
assert(
  unresolvedSeedRights.length === 0,
  `seed rights remain not-reviewed without a later audit: ${unresolvedSeedRights.map((record) => `${record.id} (${record.file})`).join(', ')}`,
);

const knownNotReviewed = seedRecords.filter((record) => record.block.includes("rightsStatus: 'not-reviewed'"));
for (const record of knownNotReviewed) {
  assert(
    auditOverrideIds.has(record.id),
    `${record.id}: seed says not-reviewed but no explicit rights-audit override exists`,
  );
}

const closureAudit = read('lib/core-outcome-sets/instrument-rights-audit-closure.ts');
for (const id of ['cfql-2-autism', 'mcmaster-fad-autism', 'bisq-autism', 'phq-2-autism']) {
  assert(closureAudit.includes(`'${id}': {`), `${id}: final closure override missing`);
}
assert(closureAudit.includes("'cfql-2-autism': {") && closureAudit.includes("rightsStatus: 'rawafid-provenance-verified'"), 'CFQL-2 free-use provenance must remain explicit');
assert(closureAudit.includes('Free for all to use') && closureAudit.includes('Public Domain'), 'CFQL-2 must preserve free-use versus public-domain distinction');
assert(closureAudit.includes("'mcmaster-fad-autism': {") && closureAudit.includes("rightsStatus: 'owner-conditions'"), 'McMaster FAD must remain conservative reference-rights');
assert(closureAudit.includes('no copyright authority') && closureAudit.includes('Copyrighted: No'), 'McMaster FAD conflicting source provenance must remain explicit');
assert(closureAudit.includes("'bisq-autism': {") && closureAudit.includes('publicly available and free for use'), 'BISQ original free-use provenance missing');
assert(closureAudit.includes('BISQ-R'), 'BISQ/BISQ-R exact-version boundary must remain explicit');
assert(closureAudit.includes("'phq-2-autism': {") && closureAudit.includes("internalPath: '/assessment-measures/patient-health-questionnaire-2/'"), 'autism PHQ-2 must point to the canonical Rawafid PHQ-2');
assert(closureAudit.includes('Copyright: No') && closureAudit.includes('NIH'), 'PHQ-2 NIH rights provenance missing');

const registry = read(registryPath);
for (const importer of [
  "applyInstrumentRightsAudit } from '@/lib/core-outcome-sets/instrument-rights-audit'",
  "applyInstrumentRightsAuditWave4 } from '@/lib/core-outcome-sets/instrument-rights-audit-wave4'",
  "applyInstrumentRightsAuditWave5 } from '@/lib/core-outcome-sets/instrument-rights-audit-wave5'",
  "applyInstrumentRightsAuditWave6 } from '@/lib/core-outcome-sets/instrument-rights-audit-wave6'",
  "applyInstrumentRightsAuditClosure } from '@/lib/core-outcome-sets/instrument-rights-audit-closure'",
]) {
  assert(registry.includes(importer), `aggregate registry missing audit import: ${importer}`);
}
assert(registry.includes('instrumentCrosswalkWave2Seed'), 'aggregate registry must include Wave 2 seed mappings');
assert(registry.includes('rightsAuditedInstrumentCrosswalkWave3'), 'aggregate registry must apply the first rights audit layer');
assert(registry.includes('rightsAuditedInstrumentCrosswalkWave4'), 'aggregate registry must apply Wave 4');
assert(registry.includes('rightsAuditedInstrumentCrosswalkWave5'), 'aggregate registry must apply Wave 5');
assert(registry.includes('rightsAuditedInstrumentCrosswalkWave5.map(applyInstrumentRightsAuditWave6)'), 'aggregate registry must apply Wave 6 after Wave 5');
assert(registry.includes('rightsAuditedInstrumentCrosswalkWave6.map(applyInstrumentRightsAuditClosure)'), 'aggregate registry must apply final closure audit after Wave 6');

const extractLinkedSlugs = (source) => {
  const slugs = new Set();
  for (const match of source.matchAll(/linkedCosSlugs:\s*\[([^\]]*)\]/g)) {
    for (const slugMatch of match[1].matchAll(/'([a-z0-9-]+)'/g)) slugs.add(slugMatch[1]);
  }
  return slugs;
};

const detail = read(detailPath);
const detailUsesRegistry = detail.includes("from '@/lib/core-outcome-sets/instrument-crosswalk-registry';");
const detailUsesBase = detail.includes("from '@/lib/core-outcome-sets/instrument-crosswalk';");
assert(detailUsesRegistry || detailUsesBase, 'COS detail page must import a recognized instrument crosswalk source');

const baseSource = read(seedFiles[0]);
const baseLinkedSlugs = extractLinkedSlugs(baseSource);
const wave2LinkedSlugs = new Set(seedFiles.slice(1).flatMap((file) => [...extractLinkedSlugs(read(file))]));

if (detailUsesBase) {
  const missingFromBase = [...wave2LinkedSlugs].filter((slug) => !baseLinkedSlugs.has(slug));
  assert(
    missingFromBase.length === 0,
    `COS detail page uses the base crosswalk but would hide Wave 2 mappings for: ${missingFromBase.join(', ')}`,
  );
}

if (detailUsesRegistry) {
  assert(registry.includes('instrumentCrosswalkWave2Seed'), 'COS detail page uses aggregate registry, which must retain Wave 2 mappings');
  assert(registry.includes('applyInstrumentRightsAuditClosure'), 'COS detail page aggregate registry must include final rights closure');
}

assert(detail.includes('getInstrumentCrosswalkForCos'), 'COS detail page must resolve linked instrument records');

if (!process.exitCode) {
  console.log(
    `COS_INSTRUMENT_RIGHTS_CLOSURE_OK seeds=${seedRecords.length} seed_not_reviewed=${knownNotReviewed.length} audited_overrides=${auditOverrideIds.size} unresolved=0 final_autism_closures=4 detail_source=${detailUsesRegistry ? 'aggregated-registry' : 'base-complete'}`,
  );
}
