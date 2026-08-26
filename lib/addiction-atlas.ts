import manifestJson from '@/data/addiction-atlas/substance-waves.json';
import methodologyJson from '@/data/addiction-atlas/methodology-v1.json';
import comparisonJson from '@/data/addiction-atlas/comparison-intents-v2.json';
import substancesV1Json from '@/data/addiction-atlas/substances-v1.json';
import substancesV2Json from '@/data/addiction-atlas/substances-v2.json';
import substancesV3Json from '@/data/addiction-atlas/substances-v3.json';
import substancesV4Json from '@/data/addiction-atlas/substances-v4.json';
import substancesV5Json from '@/data/addiction-atlas/substances-v5.json';

export const ADDICTION_ATLAS_SOURCE_COMMIT = '00014486191027349cc083e824e545da186d74d1';

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

const manifest = manifestJson as WaveManifest;
const methodology = methodologyJson as unknown as AtlasMethodology;
const comparisonFile = comparisonJson as unknown as ComparisonFile;
const waves = [substancesV1Json, substancesV2Json, substancesV3Json, substancesV4Json, substancesV5Json] as unknown as SubstanceWave[];

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

function loadAtlas(): AddictionAtlas {
  const expectedWaveFiles = manifest.waves.map(fileName);
  const localWaveFiles = ['substances-v1.json', 'substances-v2.json', 'substances-v3.json', 'substances-v4.json', 'substances-v5.json'];
  if (expectedWaveFiles.length !== localWaveFiles.length || expectedWaveFiles.some((file, index) => file !== localWaveFiles[index])) {
    throw new Error('addiction atlas manifest does not match the vendored local wave set');
  }

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

const ATLAS = loadAtlas();

export async function getAddictionAtlas() {
  return ATLAS;
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
