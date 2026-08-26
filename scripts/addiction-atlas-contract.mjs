import { readFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_COMMIT = '00014486191027349cc083e824e545da186d74d1';
const ROOT = path.resolve('data/addiction-atlas');
const RISK_KEYS = ['acute_toxicity','overdose_risk','dependence','withdrawal_medical_risk','neuro_harm','cardio_harm','respiratory_harm','polysubstance_risk'];
const EVIDENCE = new Set(['A','B','C','U']);
const INTERACTION_SEVERITY = new Set(['moderate','high','critical']);
const INTERACTION_SCOPE = new Set(['direct-pair','class-to-substance','class-to-class']);

function assert(condition, message) { if (!condition) throw new Error(`addiction-atlas-contract: ${message}`); }
async function json(file) { return JSON.parse(await readFile(path.join(ROOT, file), 'utf8')); }
function filename(value) { return value.split('/').filter(Boolean).pop(); }

const [manifest, methodology, comparisonFile, interactions, epidemiology, mortality, sourceRegistry, riskEvidenceV4, riskEvidenceV5] = await Promise.all([
  json('substance-waves.json'),
  json('methodology-v1.json'),
  json('comparison-intents-v2.json'),
  json('interactions-v1.json'),
  json('epidemiology-v1.json'),
  json('mortality-v1.json'),
  json('source-registry-v1.json'),
  json('risk-evidence-v4.json'),
  json('risk-evidence-v5.json'),
]);

assert(Array.isArray(manifest.waves) && manifest.waves.length === 5, `expected 5 waves, got ${manifest.waves?.length}`);
for (const key of RISK_KEYS) assert(methodology.risk_dimensions?.[key]?.label_ar && methodology.risk_dimensions?.[key]?.definition_ar, `methodology missing ${key}`);
const waves = await Promise.all(manifest.waves.map((value) => json(filename(value))));
const substances = waves.flatMap((wave) => wave.substances || []);
assert(substances.length === 54, `expected 54 substances, got ${substances.length}`);
const slugs = new Set();
for (const item of substances) {
  assert(item.slug && !slugs.has(item.slug), `duplicate or missing slug ${item.slug}`); slugs.add(item.slug);
  assert(item.display_name_ar && item.display_name_en, `${item.slug}: Arabic/English name required`);
  assert(item.class_ar && item.class_en && item.summary_ar && item.mechanism_ar, `${item.slug}: core scientific fields required`);
  assert(Array.isArray(item.acute_effects_ar) && item.acute_effects_ar.length, `${item.slug}: acute effects required`);
  assert(Array.isArray(item.long_term_harms_ar) && item.long_term_harms_ar.length, `${item.slug}: long-term harms required`);
  assert(item.withdrawal_ar && item.emergency_response_ar && item.treatment_ar, `${item.slug}: withdrawal/emergency/treatment required`);
  assert(EVIDENCE.has(item.evidence_grade), `${item.slug}: invalid evidence grade ${item.evidence_grade}`);
  for (const key of RISK_KEYS) { assert(Object.hasOwn(item.risk || {}, key), `${item.slug}: missing ${key}`); const value = item.risk[key]; assert(value === null || (Number.isInteger(value) && value >= 1 && value <= 5), `${item.slug}: invalid ${key}=${value}`); }
  assert(Array.isArray(item.source_urls) && item.source_urls.length, `${item.slug}: at least one source required`);
  for (const source of item.source_urls) { const url = new URL(source); assert(url.protocol === 'https:', `${item.slug}: source must be https (${source})`); }
}

const comparisons = (comparisonFile.comparisons || []).filter((item) => item.indexable);
assert(comparisons.length === 34, `expected 34 indexable comparisons, got ${comparisons.length}`);
const comparisonSlugs = new Set();
for (const item of comparisons) { assert(item.slug && !comparisonSlugs.has(item.slug), `duplicate comparison ${item.slug}`); comparisonSlugs.add(item.slug); assert(slugs.has(item.a) && slugs.has(item.b), `${item.slug}: missing compared substance`); assert(item.title_ar && item.intent_ar, `${item.slug}: title/intent required`); }
for (const required of ['fentanyl-vs-heroin','cocaine-vs-methamphetamine','tramadol-vs-morphine','cannabis-vs-synthetic-cannabinoids']) assert(comparisonSlugs.has(required), `required high-intent comparison missing: ${required}`);

const interactionIds = new Set();
const interactionPairs = new Set();
for (const item of interactions.records || []) {
  assert(item.id && !interactionIds.has(item.id), `duplicate interaction ${item.id}`); interactionIds.add(item.id);
  assert(slugs.has(item.a) && slugs.has(item.b) && item.a !== item.b, `${item.id}: invalid interaction pair`);
  const pair = [item.a, item.b].sort().join('::'); assert(!interactionPairs.has(pair), `${item.id}: duplicate interaction pair ${pair}`); interactionPairs.add(pair);
  assert(INTERACTION_SEVERITY.has(item.severity), `${item.id}: invalid severity`);
  assert(EVIDENCE.has(item.evidence_grade), `${item.id}: invalid evidence grade`);
  assert(INTERACTION_SCOPE.has(item.evidence_scope), `${item.id}: invalid evidence scope`);
  assert(item.mechanism_ar && item.risk_ar && item.emergency_ar, `${item.id}: incomplete clinical content`);
  assert(Array.isArray(item.source_urls) && item.source_urls.length, `${item.id}: interaction source required`);
  for (const source of item.source_urls) assert(new URL(source).protocol === 'https:', `${item.id}: source must be https`);
}
assert((interactions.records || []).length >= 6, 'interaction evidence regression');
assert((interactions.records || []).some((item) => item.evidence_scope === 'direct-pair'), 'at least one direct-pair interaction required');
assert((interactions.records || []).some((item) => item.id === 'fentanyl-xylazine'), 'required fentanyl-xylazine interaction missing');

const sourceIds = new Set();
for (const source of sourceRegistry.sources || []) {
  assert(source.id && !sourceIds.has(source.id), `duplicate source id ${source.id}`);
  sourceIds.add(source.id);
  assert(source.organization && source.title && source.url && source.verified_on, `${source.id}: incomplete source metadata`);
  assert(new URL(source.url).protocol === 'https:', `${source.id}: source URL must be https`);
}

const axisEvidence = [...(riskEvidenceV4.records || []), ...(riskEvidenceV5.records || [])];
const evidenceSlugs = new Set();
for (const record of axisEvidence) {
  assert(record.substance_slug && slugs.has(record.substance_slug), `axis evidence references unknown substance ${record.substance_slug}`);
  assert(!evidenceSlugs.has(record.substance_slug), `duplicate axis evidence for ${record.substance_slug}`); evidenceSlugs.add(record.substance_slug);
  const substance = substances.find((item) => item.slug === record.substance_slug);
  for (const key of RISK_KEYS) {
    const evidence = record.dimensions?.[key];
    assert(evidence, `${record.substance_slug}: missing axis evidence ${key}`);
    assert(EVIDENCE.has(evidence.evidence_grade), `${record.substance_slug}/${key}: invalid evidence grade`);
    assert(evidence.score === null || (Number.isInteger(evidence.score) && evidence.score >= 1 && evidence.score <= 5), `${record.substance_slug}/${key}: invalid evidence score`);
    assert(evidence.score === substance.risk[key], `${record.substance_slug}/${key}: evidence score must equal published risk score`);
    assert(evidence.evidence_grade === 'U' ? evidence.score === null : true, `${record.substance_slug}/${key}: U evidence must stay null`);
    assert(evidence.context_ar && evidence.rationale_ar, `${record.substance_slug}/${key}: context and rationale required`);
    assert(Array.isArray(evidence.source_ids) && evidence.source_ids.length, `${record.substance_slug}/${key}: source ids required`);
    for (const sourceId of evidence.source_ids) assert(sourceIds.has(sourceId), `${record.substance_slug}/${key}: unknown source ${sourceId}`);
  }
}
assert(axisEvidence.length === 18, `expected 18 axis-evidence substances, got ${axisEvidence.length}`);
assert(axisEvidence.length * RISK_KEYS.length === 144, 'expected 144 axis-evidence cells');

function validateStatistic(record, kind) {
  assert(record.id && record.definition_ar, `${kind}: missing id/definition`);
  assert(Number.isFinite(record.value) && record.value >= 0, `${record.id}: invalid value`);
  assert(Number.isInteger(record.year) && record.year >= 1900, `${record.id}: invalid year`);
  assert(record.geography, `${record.id}: geography required`);
  assert(record.source_id && sourceIds.has(record.source_id), `${record.id}: unknown source ${record.source_id}`);
}
for (const record of epidemiology.records || []) validateStatistic(record, 'epidemiology');
for (const record of mortality.records || []) validateStatistic(record, 'mortality');
assert((epidemiology.records || []).length >= 7, 'epidemiology regression');
assert((mortality.records || []).length >= 6, 'mortality regression');

console.log(`addiction-atlas-contract: PASS | local immutable snapshot | ${substances.length} substances | ${comparisons.length} comparisons | ${(interactions.records || []).length} interactions | ${axisEvidence.length} axis-evidence substances / ${axisEvidence.length * RISK_KEYS.length} cells | ${RISK_KEYS.length} risk dimensions | ${(epidemiology.records || []).length} epidemiology | ${(mortality.records || []).length} mortality | source ${SOURCE_COMMIT.slice(0, 12)}`);
