import { readFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_COMMIT = '00014486191027349cc083e824e545da186d74d1';
const ROOT = path.resolve('data/addiction-atlas');
const RISK_KEYS = ['acute_toxicity','overdose_risk','dependence','withdrawal_medical_risk','neuro_harm','cardio_harm','respiratory_harm','polysubstance_risk'];
const EVIDENCE = new Set(['A','B','C','U']);
const INTERACTION_SEVERITY = new Set(['moderate','high','critical']);
const INTERACTION_SCOPE = new Set(['direct-pair','class-to-substance','class-to-class']);
const WAVE6_SLUGS = ['tianeptine','carfentanil','medetomidine'];
const WAVE7_SLUGS = ['7-hydroxymitragynine','phenibut','hexahydrocannabinol-hhc','carisoprodol','protonitazepyne','metonitazepyne','etonitazepipne','n-desethyl-isotonitazene','3-oh-pcp','n-ethylheptedrone','isotonitazepyne','n-desethyl-etonitazene','mdmb-fubinaca','cychlorphine'];

function assert(condition, message) { if (!condition) throw new Error(`addiction-atlas-contract: ${message}`); }
async function json(file) { return JSON.parse(await readFile(path.join(ROOT, file), 'utf8')); }
function filename(value) { return value.split('/').filter(Boolean).pop(); }

const [
  manifest, methodology,
  comparisonV2, comparisonV3,
  interactionsV1, interactionsV2, interactionsV3,
  epidemiologyV1, epidemiologyV2,
  mortalityV1, mortalityV2, mortalityV3,
  sourceRegistryV1, sourceRegistryV2, sourceRegistryV3,
  riskEvidenceV4, riskEvidenceV5, riskEvidenceV6, riskEvidenceV7,
] = await Promise.all([
  json('substance-waves.json'),
  json('methodology-v1.json'),
  json('comparison-intents-v2.json'),
  json('comparison-intents-v3.json'),
  json('interactions-v1.json'),
  json('interactions-v2.json'),
  json('interactions-v3.json'),
  json('epidemiology-v1.json'),
  json('epidemiology-v2.json'),
  json('mortality-v1.json'),
  json('mortality-v2.json'),
  json('mortality-v3.json'),
  json('source-registry-v1.json'),
  json('source-registry-v2.json'),
  json('source-registry-v3.json'),
  json('risk-evidence-v4.json'),
  json('risk-evidence-v5.json'),
  json('risk-evidence-v6.json'),
  json('risk-evidence-v7.json'),
]);

assert(Array.isArray(manifest.waves) && manifest.waves.length >= 7, `expected at least 7 waves, got ${manifest.waves?.length}`);
assert(manifest.waves.includes('/data/addiction-atlas/substances-v6.json'), 'wave 6 missing from substance manifest');
assert(manifest.waves.includes('/data/addiction-atlas/substances-v7.json'), 'wave 7 missing from substance manifest');
for (const key of RISK_KEYS) assert(methodology.risk_dimensions?.[key]?.label_ar && methodology.risk_dimensions?.[key]?.definition_ar, `methodology missing ${key}`);

const waves = await Promise.all(manifest.waves.map((value) => json(filename(value))));
const substances = waves.flatMap((wave) => wave.substances || []);
assert(substances.length >= 71, `expected at least 71 substances, got ${substances.length}`);
const slugs = new Set();
for (const item of substances) {
  assert(item.slug && !slugs.has(item.slug), `duplicate or missing slug ${item.slug}`); slugs.add(item.slug);
  assert(item.display_name_ar && item.display_name_en, `${item.slug}: Arabic/English name required`);
  assert(item.class_ar && item.class_en && item.summary_ar && item.mechanism_ar, `${item.slug}: core scientific fields required`);
  assert(Array.isArray(item.acute_effects_ar) && item.acute_effects_ar.length, `${item.slug}: acute effects required`);
  assert(Array.isArray(item.long_term_harms_ar) && item.long_term_harms_ar.length, `${item.slug}: long-term harms required`);
  assert(item.withdrawal_ar && item.emergency_response_ar && item.treatment_ar, `${item.slug}: withdrawal/emergency/treatment required`);
  assert(EVIDENCE.has(item.evidence_grade), `${item.slug}: invalid evidence grade ${item.evidence_grade}`);
  for (const key of RISK_KEYS) {
    assert(Object.hasOwn(item.risk || {}, key), `${item.slug}: missing ${key}`);
    const value = item.risk[key];
    assert(value === null || (Number.isInteger(value) && value >= 1 && value <= 5), `${item.slug}: invalid ${key}=${value}`);
  }
  assert(Array.isArray(item.source_urls) && item.source_urls.length, `${item.slug}: at least one source required`);
  for (const source of item.source_urls) assert(new URL(source).protocol === 'https:', `${item.slug}: source must be https (${source})`);
}
for (const slug of [...WAVE6_SLUGS, ...WAVE7_SLUGS]) assert(slugs.has(slug), `required extension substance missing: ${slug}`);
const cychlorphine = substances.find((item) => item.slug === 'cychlorphine');
assert(cychlorphine && RISK_KEYS.every((key) => cychlorphine.risk[key] === null), 'cychlorphine must remain unscored while evidence is preliminary');

const comparisons = [...(comparisonV2.comparisons || []), ...(comparisonV3.comparisons || [])].filter((item) => item.indexable);
assert(comparisons.length >= 37, `expected at least 37 indexable comparisons, got ${comparisons.length}`);
const comparisonSlugs = new Set();
const comparisonPairs = new Set();
for (const item of comparisons) {
  assert(item.slug && !comparisonSlugs.has(item.slug), `duplicate comparison ${item.slug}`); comparisonSlugs.add(item.slug);
  assert(slugs.has(item.a) && slugs.has(item.b) && item.a !== item.b, `${item.slug}: missing or invalid compared substance`);
  const pair = [item.a, item.b].sort().join('::'); assert(!comparisonPairs.has(pair), `${item.slug}: duplicate comparison pair ${pair}`); comparisonPairs.add(pair);
  assert(item.title_ar && item.intent_ar, `${item.slug}: title/intent required`);
}
for (const required of ['fentanyl-vs-heroin','cocaine-vs-methamphetamine','tramadol-vs-morphine','cannabis-vs-synthetic-cannabinoids','kratom-vs-7-oh','cannabis-vs-hhc','phenibut-vs-gabapentin']) assert(comparisonSlugs.has(required), `required high-value comparison missing: ${required}`);
assert((comparisonV3.policy_ar || '').includes('لا يولد توافيق تلقائية'), 'wave 7 comparison anti-scaled-content policy missing');

const interactionRecords = [...(interactionsV1.records || []), ...(interactionsV2.records || []), ...(interactionsV3.records || [])];
const interactionIds = new Set();
const interactionPairs = new Set();
for (const item of interactionRecords) {
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
assert(interactionRecords.length >= 11, `expected at least 11 reviewed interactions, got ${interactionRecords.length}`);
assert(interactionRecords.some((item) => item.evidence_scope === 'direct-pair'), 'at least one direct-pair interaction required');
for (const required of ['fentanyl-xylazine','fentanyl-medetomidine','carfentanil-alcohol','carisoprodol-fentanyl','carisoprodol-diazepam','carisoprodol-alcohol']) assert(interactionIds.has(required), `required reviewed interaction missing: ${required}`);
assert((interactionsV3.policy_ar || '').includes('غير مراجع بعد'), 'wave 7 interaction absence safety rule missing');

const sources = [...(sourceRegistryV1.sources || []), ...(sourceRegistryV2.sources || []), ...(sourceRegistryV3.sources || [])];
const sourceIds = new Set();
for (const source of sources) {
  assert(source.id && !sourceIds.has(source.id), `duplicate source id ${source.id}`);
  sourceIds.add(source.id);
  assert(source.organization && source.title && source.url && source.verified_on, `${source.id}: incomplete source metadata`);
  assert(new URL(source.url).protocol === 'https:', `${source.id}: source URL must be https`);
}
for (const required of ['fda-tianeptine-2025','cdc-carfentanil-mmwr-2024','cdc-medetomidine-han-2026','who-ecdd47-report-2025','who-cnd-nps-control-2025','who-cnd-nps-control-2026','fda-7oh-update-2026','euda-cychlorphine-initial-2026','fda-opioid-cns-depressant-warning-2016']) assert(sourceIds.has(required), `required extension source missing: ${required}`);

const axisEvidence = [...(riskEvidenceV4.records || []), ...(riskEvidenceV5.records || []), ...(riskEvidenceV6.records || []), ...(riskEvidenceV7.records || [])];
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
    assert(evidence.score === null ? evidence.evidence_grade === 'U' : true, `${record.substance_slug}/${key}: null score must use U evidence`);
    assert(evidence.context_ar && evidence.rationale_ar, `${record.substance_slug}/${key}: context and rationale required`);
    assert(Array.isArray(evidence.source_ids) && evidence.source_ids.length, `${record.substance_slug}/${key}: source ids required`);
    for (const sourceId of evidence.source_ids) assert(sourceIds.has(sourceId), `${record.substance_slug}/${key}: unknown source ${sourceId}`);
  }
}
assert(axisEvidence.length >= 35, `expected at least 35 axis-evidence substances, got ${axisEvidence.length}`);
assert(axisEvidence.length * RISK_KEYS.length >= 280, 'expected at least 280 axis-evidence cells');
for (const slug of [...WAVE6_SLUGS, ...WAVE7_SLUGS]) assert(evidenceSlugs.has(slug), `extension substance missing axis evidence: ${slug}`);
const cychlorphineEvidence = axisEvidence.find((record) => record.substance_slug === 'cychlorphine');
assert(cychlorphineEvidence && RISK_KEYS.every((key) => cychlorphineEvidence.dimensions[key].score === null && cychlorphineEvidence.dimensions[key].evidence_grade === 'U'), 'cychlorphine axis evidence must remain U/null');

function validateStatistic(record, kind) {
  assert(record.id && record.definition_ar, `${kind}: missing id/definition`);
  assert(Number.isFinite(record.value) && record.value >= 0, `${record.id}: invalid value`);
  assert(Number.isInteger(record.year) && record.year >= 1900, `${record.id}: invalid year`);
  assert(record.geography, `${record.id}: geography required`);
  assert(record.source_id && sourceIds.has(record.source_id), `${record.id}: unknown source ${record.source_id}`);
}
const epidemiologyRecords = [...(epidemiologyV1.records || []), ...(epidemiologyV2.records || [])];
for (const record of epidemiologyRecords) validateStatistic(record, 'epidemiology');
assert(epidemiologyRecords.length >= 9, `expected at least 9 epidemiology records, got ${epidemiologyRecords.length}`);
const phenibutExposure = epidemiologyRecords.find((record) => record.id === 'us-phenibut-poison-center-exposures-2009-2019');
assert(phenibutExposure?.value === 1320 && phenibutExposure?.qualifier === 'cumulative_2009_2019', 'phenibut exposure surveillance record incorrect');
const phenibutMajor = epidemiologyRecords.find((record) => record.id === 'us-phenibut-major-effects-share-2009-2019');
assert(phenibutMajor?.value === 12.6 && phenibutMajor?.unit === 'percent', 'phenibut major-effects surveillance record incorrect');
assert((epidemiologyV2.rules_ar || []).some((rule) => rule.includes('ليست تقديراً لانتشار')), 'phenibut surveillance must not be presented as population prevalence');

const mortalityRecords = [...(mortalityV1.records || []), ...(mortalityV2.records || []), ...(mortalityV3.records || [])];
for (const record of mortalityRecords) validateStatistic(record, 'mortality');
assert(mortalityRecords.length >= 8, `expected at least 8 mortality records, got ${mortalityRecords.length}`);
const carfentanilMortality = mortalityRecords.find((record) => record.id === 'us-carfentanil-detected-overdose-deaths-h1-2024');
assert(carfentanilMortality?.value === 238 && carfentanilMortality?.status === 'preliminary-incomplete', 'carfentanil mortality record missing preliminary/incomplete qualifier');
const phenibutMortality = mortalityRecords.find((record) => record.id === 'us-phenibut-reported-deaths-2009-2019');
assert(phenibutMortality?.value === 3 && phenibutMortality?.status === 'poison-center-surveillance-not-population-mortality', 'phenibut mortality surveillance qualifier missing');

const vendorScript = await readFile(path.resolve('scripts/vendor-addiction-atlas.mjs'), 'utf8');
assert(!vendorScript.includes("'substance-waves.json':"), 'legacy vendoring must not overwrite the extension substance manifest');
assert(!vendorScript.includes("'risk-evidence-manifest.json':"), 'legacy vendoring must not overwrite the extension risk manifest');

console.log(`addiction-atlas-contract: PASS | local immutable + extension snapshot | ${substances.length} substances | ${comparisons.length} comparisons | ${interactionRecords.length} interactions | ${axisEvidence.length} axis-evidence substances / ${axisEvidence.length * RISK_KEYS.length} cells | ${RISK_KEYS.length} risk dimensions | ${epidemiologyRecords.length} epidemiology | ${mortalityRecords.length} mortality | source ${SOURCE_COMMIT.slice(0, 12)}`);
