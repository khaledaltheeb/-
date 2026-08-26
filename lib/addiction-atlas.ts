import manifestJson from '@/data/addiction-atlas/substance-waves.json';
import methodologyJson from '@/data/addiction-atlas/methodology-v1.json';
import comparisonJson from '@/data/addiction-atlas/comparison-intents-v2.json';
import substancesV1Json from '@/data/addiction-atlas/substances-v1.json';
import substancesV2Json from '@/data/addiction-atlas/substances-v2.json';
import substancesV3Json from '@/data/addiction-atlas/substances-v3.json';
import substancesV4Json from '@/data/addiction-atlas/substances-v4.json';
import substancesV5Json from '@/data/addiction-atlas/substances-v5.json';
import epidemiologyJson from '@/data/addiction-atlas/epidemiology-v1.json';
import mortalityJson from '@/data/addiction-atlas/mortality-v1.json';
import sourceRegistryJson from '@/data/addiction-atlas/source-registry-v1.json';
import interactionsJson from '@/data/addiction-atlas/interactions-v1.json';

export const ADDICTION_ATLAS_SOURCE_COMMIT = '00014486191027349cc083e824e545da186d74d1';
export const ADDICTION_ATLAS_SNAPSHOT_KIND = 'vendored-immutable' as const;

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
export type InteractionSeverity = 'moderate' | 'high' | 'critical';
export type InteractionEvidenceScope = 'direct-pair' | 'class-to-substance' | 'class-to-class';

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

export type AtlasInteraction = {
  id: string;
  a: string;
  b: string;
  severity: InteractionSeverity;
  evidence_grade: EvidenceGrade;
  evidence_scope: InteractionEvidenceScope;
  mechanism_ar: string;
  risk_ar: string;
  emergency_ar: string;
  source_urls: string[];
};

export type AtlasEpidemiologyRecord = {
  id: string;
  scope_type: string;
  scope_slug?: string;
  metric: string;
  value: number;
  qualifier?: string;
  unit: string;
  geography: string;
  population?: string;
  year: number;
  estimate_type?: string;
  definition_ar: string;
  source_id: string;
};

export type AtlasMortalityRecord = {
  id: string;
  scope_type: string;
  scope_slug?: string;
  metric_type: string;
  value: number;
  qualifier?: string;
  unit: string;
  geography: string;
  year: number;
  status?: string;
  definition_ar: string;
  source_id: string;
};

export type AtlasSource = {
  id: string;
  organization: string;
  title: string;
  publication_year: number | null;
  data_years: number[];
  source_type: string;
  geography: string;
  url: string;
  verified_on: string;
  notes_ar: string;
};

type WaveManifest = { updated_on: string; waves: string[] };
type SubstanceWave = { updated_on: string; substances: AtlasSubstance[] };
type ComparisonFile = { updated_on: string; policy_ar: string; comparisons: AtlasComparison[] };
type InteractionFile = { updated_on: string; policy_ar: string; records: AtlasInteraction[] };
type EpidemiologyFile = { updated_on: string; rules_ar: string[]; records: AtlasEpidemiologyRecord[] };
type MortalityFile = { updated_on: string; rules_ar: string[]; records: AtlasMortalityRecord[] };
type SourceRegistry = { updated_on: string; sources: AtlasSource[] };

export type AddictionAtlas = {
  substances: AtlasSubstance[];
  methodology: AtlasMethodology;
  comparisons: AtlasComparison[];
  comparisonPolicy: string;
  interactions: AtlasInteraction[];
  interactionPolicy: string;
  epidemiology: AtlasEpidemiologyRecord[];
  epidemiologyRules: string[];
  mortality: AtlasMortalityRecord[];
  mortalityRules: string[];
  sources: AtlasSource[];
  updatedOn: string;
  sourceCommit: string;
  snapshotKind: typeof ADDICTION_ATLAS_SNAPSHOT_KIND;
};

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

function assertInteraction(record: AtlasInteraction, substanceSlugs: Set<string>) {
  if (!record.id || !substanceSlugs.has(record.a) || !substanceSlugs.has(record.b) || record.a === record.b) {
    throw new Error(`invalid addiction atlas interaction: ${record.id || 'unknown'}`);
  }
  if (!['moderate', 'high', 'critical'].includes(record.severity)) throw new Error(`invalid interaction severity: ${record.id}`);
  if (!['A', 'B', 'C', 'U'].includes(record.evidence_grade)) throw new Error(`invalid interaction evidence grade: ${record.id}`);
  if (!['direct-pair', 'class-to-substance', 'class-to-class'].includes(record.evidence_scope)) throw new Error(`invalid interaction evidence scope: ${record.id}`);
  if (!record.mechanism_ar || !record.risk_ar || !record.emergency_ar || !record.source_urls.length) throw new Error(`incomplete interaction: ${record.id}`);
  for (const url of record.source_urls) if (!url.startsWith('https://')) throw new Error(`invalid interaction source URL: ${record.id}`);
}

function assertStatistic(record: AtlasEpidemiologyRecord | AtlasMortalityRecord, sourceIds: Set<string>) {
  if (!record.id || !record.definition_ar || !record.geography || !Number.isInteger(record.year)) {
    throw new Error(`invalid addiction atlas statistic: ${record.id || 'unknown'}`);
  }
  if (!Number.isFinite(record.value) || record.value < 0) throw new Error(`invalid addiction atlas statistic value: ${record.id}`);
  if (!sourceIds.has(record.source_id)) throw new Error(`missing addiction atlas statistic source: ${record.source_id}`);
}

async function loadAtlas(): Promise<AddictionAtlas> {
  const manifest = manifestJson as unknown as WaveManifest;
  const methodology = methodologyJson as unknown as AtlasMethodology;
  const comparisonFile = comparisonJson as unknown as ComparisonFile;
  const interactionFile = interactionsJson as unknown as InteractionFile;
  const epidemiologyFile = epidemiologyJson as unknown as EpidemiologyFile;
  const mortalityFile = mortalityJson as unknown as MortalityFile;
  const sourceRegistry = sourceRegistryJson as unknown as SourceRegistry;
  const waveByFile: Record<string, SubstanceWave> = {
    'substances-v1.json': substancesV1Json as unknown as SubstanceWave,
    'substances-v2.json': substancesV2Json as unknown as SubstanceWave,
    'substances-v3.json': substancesV3Json as unknown as SubstanceWave,
    'substances-v4.json': substancesV4Json as unknown as SubstanceWave,
    'substances-v5.json': substancesV5Json as unknown as SubstanceWave,
  };
  const waves = manifest.waves.map((path) => {
    const name = fileName(path);
    const wave = waveByFile[name];
    if (!wave) throw new Error(`missing vendored addiction atlas wave: ${name}`);
    return wave;
  });

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

  const interactionIds = new Set<string>();
  const interactionPairs = new Set<string>();
  const substanceSlugs = new Set(bySlug.keys());
  for (const interaction of interactionFile.records) {
    assertInteraction(interaction, substanceSlugs);
    if (interactionIds.has(interaction.id)) throw new Error(`duplicate addiction interaction id: ${interaction.id}`);
    interactionIds.add(interaction.id);
    const pair = [interaction.a, interaction.b].sort().join('::');
    if (interactionPairs.has(pair)) throw new Error(`duplicate addiction interaction pair: ${pair}`);
    interactionPairs.add(pair);
  }

  const sourceIds = new Set(sourceRegistry.sources.map((source) => source.id));
  for (const record of epidemiologyFile.records) assertStatistic(record, sourceIds);
  for (const record of mortalityFile.records) assertStatistic(record, sourceIds);

  const dates = [
    manifest.updated_on,
    comparisonFile.updated_on,
    interactionFile.updated_on,
    methodology.published_on,
    epidemiologyFile.updated_on,
    mortalityFile.updated_on,
    sourceRegistry.updated_on,
    ...waves.map((wave) => wave.updated_on),
  ].filter(Boolean).sort();

  return {
    substances,
    methodology,
    comparisons: comparisonFile.comparisons,
    comparisonPolicy: comparisonFile.policy_ar,
    interactions: interactionFile.records,
    interactionPolicy: interactionFile.policy_ar,
    epidemiology: epidemiologyFile.records,
    epidemiologyRules: epidemiologyFile.rules_ar,
    mortality: mortalityFile.records,
    mortalityRules: mortalityFile.rules_ar,
    sources: sourceRegistry.sources,
    updatedOn: dates.at(-1) || methodology.published_on,
    sourceCommit: ADDICTION_ATLAS_SOURCE_COMMIT,
    snapshotKind: ADDICTION_ATLAS_SNAPSHOT_KIND,
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

export async function getAtlasInteraction(aSlug: string, bSlug: string) {
  const atlas = await getAddictionAtlas();
  const interaction = atlas.interactions.find((item) => (item.a === aSlug && item.b === bSlug) || (item.a === bSlug && item.b === aSlug)) ?? null;
  if (!interaction) return null;
  const a = atlas.substances.find((item) => item.slug === interaction.a) ?? null;
  const b = atlas.substances.find((item) => item.slug === interaction.b) ?? null;
  if (!a || !b) return null;
  return { interaction, a, b, atlas };
}

export function getAtlasSource(atlas: AddictionAtlas, sourceId: string) {
  return atlas.sources.find((source) => source.id === sourceId) ?? null;
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
