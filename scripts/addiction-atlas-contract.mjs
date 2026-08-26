import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_COMMIT = '00014486191027349cc083e824e545da186d74d1';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data/addiction-atlas');
const RISK_KEYS = ['acute_toxicity','overdose_risk','dependence','withdrawal_medical_risk','neuro_harm','cardio_harm','respiratory_harm','polysubstance_risk'];
const EVIDENCE = new Set(['A','B','C','U']);

function assert(condition, message) { if (!condition) throw new Error(`addiction-atlas-contract: ${message}`); }
async function json(file) { return JSON.parse(await readFile(path.join(ROOT, file), 'utf8')); }
function filename(value) { return value.split('/').filter(Boolean).pop(); }

const [manifest, methodology, comparisonFile] = await Promise.all([json('substance-waves.json'), json('methodology-v1.json'), json('comparison-intents-v2.json')]);
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
console.log(`addiction-atlas-contract: PASS | ${substances.length} substances | ${comparisons.length} comparisons | ${RISK_KEYS.length} risk dimensions | local snapshot provenance ${SOURCE_COMMIT.slice(0, 12)}`);
