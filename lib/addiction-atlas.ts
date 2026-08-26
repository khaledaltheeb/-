export const ADDICTION_ATLAS_SOURCE_COMMIT = '00014486191027349cc083e824e545da186d74d1';
const SOURCE_ROOT = `https://raw.githubusercontent.com/khaledaltheeb/healthrenewal.org/${ADDICTION_ATLAS_SOURCE_COMMIT}/data/addiction-atlas`;

export const RISK_KEYS = [
  'acute_toxicity',
  'overdose_risk',
  'dependence',
  'withdrawal_medical_risk',
  'neuro_harm',
  'cardio_harm',
  'respiratory_harm',
  'polysubstance_risk',
] as const;

export type RiskKey = (typeof RISK_KEYS)[number];
export type RiskValue = 1 | 2 | 3 | 4 | 5 | null;
export type EvidenceGrade = 'A' | 'B' | 'C' | 'U';

export type AtlasSubstance = {
  id: string;
  slug: string;
  display_name_ar: string;
  display_name_en: string;
  common_name_ar?: string;
  common_name_en?: string;
  scientific_name?: string;
  english_name_ar_transliteration?: string[];
  search_aliases_ar?: string[];
  search_aliases_en?: string[];
  common_misspellings_ar?: string[];
  class_ar: string;
  class_en: string;
  medical_use_ar?: string;
  forms_ar?: string[];
  summary_ar: string;
  mechanism_ar: string;
  acute_effects_ar: string[];
  long_term_harms_ar: string[];
  single_exposure_harm_ar: string;
  withdrawal_ar: string;
  emergency_response_ar: string;
  treatment_ar: string;
  risk: Record<RiskKey, RiskValue>;
  evidence_grade: EvidenceGrade;
  source_urls: string[];
  related_condition?: string;
};

export type AtlasMethodology = {
  schema_version: string;
  version: string;
  published_on: string;
  language: string;
  scope: string;
  principles: string[];
  ordinal_scale: Record<string, { label_ar: string; definition_ar: string }>;
  risk_dimensions: Record<RiskKey, { label_ar: string; definition_ar: string }>;
  evidence_grades: Record<EvidenceGrade, { label_ar: string; definition_ar: string }>;
  sorting_rule: string;
  review_cycle: string;
  safety_note: string;
};

export type AtlasComparison = {
  a: string;
  b: string;
  slug: string;
  title_ar: string;
  intent_ar: string;
  indexable: boolean;
};

type WaveManifest = { updated_on: string; waves: string[] };
type SubstanceWave = { updated_on: string; substances: AtlasSubstance[] };
type ComparisonFile = { updated_on: string; policy_ar: string; comparisons: AtlasComparison[] };

export type AddictionAtlas = {
  substances: AtlasSubstance[];
  methodology: AtlasMethodology;
  comparisons: AtlasComparison[];
  comparisonPolicy: string;
  updatedOn: string;
  sourceCommit: string;
};

async function fetchJson<T>(file: string): Promise<T> {
  const response = await fetch(`${SOURCE_ROOT}/${file}`, { cache: 'force-cache' });
  if (!response.ok) throw new Error(`addiction atlas source failed: ${file} (${response.status})`);
  return response.json() as Promise<T>;
}

function fileName(path: string) {
  const value = path.split('/').filter(Boolean).pop();
  if (!value) throw new Error(`invalid addiction atlas wave path: ${path}`);
  return value;
}

function assertSubstance(record: AtlasSubstance) {
  if (!record.slug || !record.display_name_ar || !record.display_name_en || !record.summary_ar) {
    throw new Error(`invalid addiction atlas substance record: ${record.slug || record.id || 'unknown'}`);
  }
  for (const key of RISK_KEYS) {
    if (!(key in record.risk)) throw new Error(`missing risk dimension ${key} for ${record.slug}`);
    const value = record.risk[key];
    if (value !== null && (!Number.isInteger(value) || value < 1 || value > 5)) {
      throw new Error(`invalid risk value ${key} for ${record.slug}`);
    }
  }
}

async function loadAtlas(): Promise<AddictionAtlas> {
  const [manifest, methodology, comparisonFile] = await Promise.all([
    fetchJson<WaveManifest>('substance-waves.json'),
    fetchJson<AtlasMethodology>('methodology-v1.json'),
    fetchJson<ComparisonFile>('comparison-intents-v2.json'),
  ]);
  const waves = await Promise.all(manifest.waves.map((path) => fetchJson<SubstanceWave>(fileName(path))));
  const bySlug = new Map<string, AtlasSubstance>();
  for (const wave of waves) {
    for (const substance of wave.substances) {
      assertSubstance(substance);
      if (bySlug.has(substance.slug)) throw new Error(`duplicate addiction atlas slug: ${substance.slug}`);
      bySlug.set(substance.slug, substance);
    }
  }
  const substances = [...bySlug.values()];
  if (substances.length < 54) throw new Error(`addiction atlas regression: expected at least 54 substances, got ${substances.length}`);
  const comparisonSlugs = new Set<string>();
  for (const comparison of comparisonFile.comparisons) {
    if (comparisonSlugs.has(comparison.slug)) throw new Error(`duplicate addiction comparison slug: ${comparison.slug}`);
    comparisonSlugs.add(comparison.slug);
    if (!bySlug.has(comparison.a) || !bySlug.has(comparison.b)) throw new Error(`comparison references missing substance: ${comparison.slug}`);
  }
  const dates = [manifest.updated_on, comparisonFile.updated_on, methodology.published_on, ...waves.map((wave) => wave.updated_on)].filter(Boolean).sort();
  return {
    substances,
    methodology,
    comparisons: comparisonFile.comparisons,
    comparisonPolicy: comparisonFile.policy_ar,
    updatedOn: dates.at(-1) || methodology.published_on,
    sourceCommit: ADDICTION_ATLAS_SOURCE_COMMIT,
  };
}

let atlasPromise: Promise<AddictionAtlas> | null = null;
export function getAddictionAtlas() {
  if (!atlasPromise) atlasPromise = loadAtlas().catch((error) => { atlasPromise = null; throw error; });
  return atlasPromise;
}

export async function getAtlasSubstance(slug: string) {
  const atlas = await getAddictionAtlas();
  return atlas.substances.find((item) => item.slug === slug) ?? null;
}

export async function getAtlasComparison(slug: string) {
  const atlas = await getAddictionAtlas();
  const comparison = atlas.comparisons.find((item) => item.slug === slug && item.indexable) ?? null;
  if (!comparison) return null;
  const a = atlas.substances.find((item) => item.slug === comparison.a) ?? null;
  const b = atlas.substances.find((item) => item.slug === comparison.b) ?? null;
  if (!a || !b) return null;
  return { comparison, a, b, atlas };
}

export function atlasSearchText(item: AtlasSubstance) {
  return [
    item.display_name_ar,
    item.display_name_en,
    item.common_name_ar,
    item.common_name_en,
    item.scientific_name,
    item.class_ar,
    item.class_en,
    ...(item.english_name_ar_transliteration ?? []),
    ...(item.search_aliases_ar ?? []),
    ...(item.search_aliases_en ?? []),
    ...(item.common_misspellings_ar ?? []),
  ].filter(Boolean).join(' ');
}
