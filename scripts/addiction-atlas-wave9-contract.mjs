import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('data/addiction-atlas');
const RISK_KEYS = ['acute_toxicity','overdose_risk','dependence','withdrawal_medical_risk','neuro_harm','cardio_harm','respiratory_harm','polysubstance_risk'];
const EVIDENCE = new Set(['A','B','C','U']);
const WAVE9_SLUGS = [
  'lsd','psilocybin','pcp','nitrous-oxide','kratom','synthetic-cathinones','dextromethorphan','xylazine','anabolic-steroids',
  'codeine','hydrocodone','barbiturates','phenobarbital','khat','caffeine','toluene',
];
const REQUIRED_WAVE9_SOURCES = [
  'nida-kratom-current','cdc-xylazine-2024','nida-anabolic-steroids-current','medlineplus-dextromethorphan-2025',
  'medlineplus-barbiturate-overdose-2025','dailymed-phenobarbital-2026','who-khat-ecdd34','fda-caffeine-2024',
];

function assert(condition, message) {
  if (!condition) throw new Error(`addiction-atlas-wave9-contract: ${message}`);
}
async function json(file) {
  return JSON.parse(await readFile(path.join(ROOT, file), 'utf8'));
}
function filename(value) {
  return value.split('/').filter(Boolean).pop();
}

const manifest = await json('substance-waves.json');
const riskManifest = await json('risk-evidence-manifest.json');
const substanceWaves = await Promise.all(manifest.waves.map((value) => json(filename(value))));
const substances = substanceWaves.flatMap((wave) => wave.substances || []);
const substanceBySlug = new Map(substances.map((item) => [item.slug, item]));

assert(substances.length === 71, `expected exactly 71 substances, got ${substances.length}`);
assert(riskManifest.waves.includes('/data/addiction-atlas/risk-evidence-v9.json'), 'risk evidence manifest must register Wave 9');

const riskFiles = await Promise.all(riskManifest.waves.map((value) => json(filename(value))));
const axisEvidence = riskFiles.flatMap((file) => file.records || []);
const evidenceBySlug = new Map();
for (const record of axisEvidence) {
  assert(record.substance_slug && substanceBySlug.has(record.substance_slug), `unknown substance ${record.substance_slug}`);
  assert(!evidenceBySlug.has(record.substance_slug), `duplicate evidence record ${record.substance_slug}`);
  evidenceBySlug.set(record.substance_slug, record);
  const substance = substanceBySlug.get(record.substance_slug);
  for (const key of RISK_KEYS) {
    const evidence = record.dimensions?.[key];
    assert(evidence, `${record.substance_slug}: missing ${key}`);
    assert(EVIDENCE.has(evidence.evidence_grade), `${record.substance_slug}/${key}: invalid evidence grade`);
    assert(evidence.score === substance.risk[key], `${record.substance_slug}/${key}: evidence score changed published risk score`);
    assert(evidence.score === null ? evidence.evidence_grade === 'U' : evidence.evidence_grade !== 'U', `${record.substance_slug}/${key}: U/null invariant violated`);
    assert(evidence.context_ar?.trim() && evidence.rationale_ar?.trim(), `${record.substance_slug}/${key}: context/rationale required`);
    assert(Array.isArray(evidence.source_ids) && evidence.source_ids.length > 0, `${record.substance_slug}/${key}: source_ids required`);
  }
}

assert(axisEvidence.length === substances.length, `axis evidence must cover every substance: ${axisEvidence.length}/${substances.length}`);
assert(axisEvidence.length === 71, `expected 71 axis-evidence records, got ${axisEvidence.length}`);
assert(axisEvidence.length * RISK_KEYS.length === 568, `expected 568 axis-evidence cells, got ${axisEvidence.length * RISK_KEYS.length}`);
for (const slug of substances.map((item) => item.slug)) assert(evidenceBySlug.has(slug), `remaining axis-evidence gap: ${slug}`);
for (const slug of WAVE9_SLUGS) assert(evidenceBySlug.has(slug), `Wave 9 substance missing evidence: ${slug}`);

const sourceRegistries = await Promise.all(['source-registry-v1.json','source-registry-v2.json','source-registry-v3.json','source-registry-v4.json','source-registry-v5.json'].map(json));
const sourceIds = new Set(sourceRegistries.flatMap((registry) => registry.sources || []).map((source) => source.id));
for (const id of REQUIRED_WAVE9_SOURCES) assert(sourceIds.has(id), `required Wave 9 source missing: ${id}`);
for (const record of axisEvidence) {
  for (const key of RISK_KEYS) {
    for (const sourceId of record.dimensions[key].source_ids) assert(sourceIds.has(sourceId), `${record.substance_slug}/${key}: unknown source ${sourceId}`);
  }
}

const xylazine = evidenceBySlug.get('xylazine');
for (const key of ['overdose_risk','dependence','withdrawal_medical_risk']) {
  assert(xylazine?.dimensions?.[key]?.score === null && xylazine?.dimensions?.[key]?.evidence_grade === 'U', `xylazine/${key} must remain U/null`);
}
assert(xylazine?.dimensions?.polysubstance_risk?.source_ids?.includes('cdc-xylazine-2024'), 'xylazine polysubstance risk must retain CDC source');

const cychlorphine = evidenceBySlug.get('cychlorphine');
assert(cychlorphine && RISK_KEYS.every((key) => cychlorphine.dimensions[key].score === null && cychlorphine.dimensions[key].evidence_grade === 'U'), 'cychlorphine must remain fully U/null');
const nitazenes = evidenceBySlug.get('nitazenes');
assert(nitazenes?.dimensions?.withdrawal_medical_risk?.score === null && nitazenes?.dimensions?.withdrawal_medical_risk?.evidence_grade === 'U', 'nitazenes withdrawal must remain U/null');

const wave9 = await json('risk-evidence-v9.json');
assert((wave9.records || []).length === 16, `Wave 9 must contain exactly 16 records, got ${wave9.records?.length}`);
assert(WAVE9_SLUGS.every((slug) => wave9.records.some((record) => record.substance_slug === slug)), 'Wave 9 exact remaining-gap set is incomplete');
assert((wave9.policy_ar || '').includes('U يبقى null'), 'Wave 9 policy must preserve U/null');
assert((wave9.policy_ar || '').includes('لا يعني الأمان'), 'Wave 9 policy must preserve absence-is-not-safety rule');

console.log('addiction-atlas-wave9-contract: PASS | 71/71 substances have axis evidence | 568 cells | 16 Wave 9 gaps closed | U/null safeguards preserved');
