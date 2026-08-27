import evidenceMapData from '@/data/assessment-lab/evidence-map.wave1.v1.json';

export type AssessmentEvidenceRelation = 'direct' | 'supportive' | 'conceptual';
export type AssessmentEvidenceType =
  | 'guideline-or-authority'
  | 'umbrella-review'
  | 'scoping-review'
  | 'systematic-review'
  | 'systematic-review-and-meta-analysis'
  | 'meta-analysis'
  | 'integrative-review'
  | 'conceptual-analysis'
  | 'primary-study';

export type AssessmentEvidenceDomain = {
  domain: string;
  claim: string;
  evidence_relation: AssessmentEvidenceRelation;
  reference_ids: string[];
  limitations: string;
};

export type AssessmentEvidenceReference = {
  id: string;
  title: string;
  url: string;
  evidence_type: AssessmentEvidenceType;
  supports: string;
  limitations: string;
};

export type AssessmentEvidenceMap = {
  slug: string;
  domains: AssessmentEvidenceDomain[];
  references: AssessmentEvidenceReference[];
};

type EvidenceMapPayload = {
  validation_boundary: string;
  tools: AssessmentEvidenceMap[];
};

const payload = evidenceMapData as EvidenceMapPayload;
const evidenceMap = new Map(payload.tools.map((tool) => [tool.slug, tool]));

export const assessmentEvidenceValidationBoundary = payload.validation_boundary;

export function getAssessmentEvidenceMap(slug: string) {
  return evidenceMap.get(slug) ?? null;
}

export function getAssessmentEvidenceReference(tool: AssessmentEvidenceMap, id: string) {
  return tool.references.find((reference) => reference.id === id) ?? null;
}

export function getAssessmentEvidenceRelationLabel(relation: AssessmentEvidenceRelation) {
  if (relation === 'direct') return 'دليل مباشر للمحور';
  if (relation === 'supportive') return 'دليل داعم';
  return 'دعم مفاهيمي';
}

export function getAssessmentEvidenceTypeLabel(type: AssessmentEvidenceType) {
  const labels: Record<AssessmentEvidenceType, string> = {
    'guideline-or-authority': 'جهة/مرجع سلطوي',
    'umbrella-review': 'مراجعة مظلية',
    'scoping-review': 'مراجعة نطاقية',
    'systematic-review': 'مراجعة منهجية',
    'systematic-review-and-meta-analysis': 'مراجعة منهجية وتحليل تلوي',
    'meta-analysis': 'تحليل تلوي',
    'integrative-review': 'مراجعة تكاملية',
    'conceptual-analysis': 'تحليل مفاهيمي',
    'primary-study': 'دراسة أصلية',
  };
  return labels[type];
}
