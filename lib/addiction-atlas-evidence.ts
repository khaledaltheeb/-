import riskEvidenceV4Json from '@/data/addiction-atlas/risk-evidence-v4.json';
import riskEvidenceV5Json from '@/data/addiction-atlas/risk-evidence-v5.json';
import type { EvidenceGrade, RiskKey, RiskValue } from '@/lib/addiction-atlas';

export type AtlasRiskEvidenceDimension = {
  score: RiskValue;
  evidence_grade: EvidenceGrade;
  source_ids: string[];
  context_ar: string;
  rationale_ar: string;
};

export type AtlasRiskEvidenceRecord = {
  substance_slug: string;
  dimensions: Record<RiskKey, AtlasRiskEvidenceDimension>;
};

type RiskEvidenceFile = {
  schema_version: string;
  wave: string;
  updated_on: string;
  policy_ar: string;
  records: AtlasRiskEvidenceRecord[];
};

const files = [riskEvidenceV4Json, riskEvidenceV5Json] as unknown as RiskEvidenceFile[];
const bySlug = new Map<string, AtlasRiskEvidenceRecord>();

for (const file of files) {
  for (const record of file.records) {
    if (bySlug.has(record.substance_slug)) throw new Error(`duplicate risk evidence record: ${record.substance_slug}`);
    bySlug.set(record.substance_slug, record);
  }
}

export const ADDICTION_ATLAS_AXIS_EVIDENCE_POLICY = files.map((file) => file.policy_ar).join(' ');
export const ADDICTION_ATLAS_AXIS_EVIDENCE_UPDATED_ON = files.map((file) => file.updated_on).sort().at(-1) ?? null;
export const ADDICTION_ATLAS_AXIS_EVIDENCE_COUNT = bySlug.size;

export function getAtlasRiskEvidence(substanceSlug: string) {
  return bySlug.get(substanceSlug) ?? null;
}

export function getAtlasRiskEvidenceDimension(substanceSlug: string, key: RiskKey) {
  return bySlug.get(substanceSlug)?.dimensions[key] ?? null;
}
