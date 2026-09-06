import evidenceMapData from '@/data/assessment-lab/evidence-map.wave1.v1.json';
import { getAssessmentScientificProfile } from '@/lib/assessment-lab/scientific-profiles';

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
  | 'primary-study'
  | 'scientific-reference';

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
  mappingLevel: 'domain-reviewed' | 'profile-derived';
};

type EvidenceMapPayload = {
  validation_boundary: string;
  tools: Omit<AssessmentEvidenceMap, 'mappingLevel'>[];
};

const payload = evidenceMapData as EvidenceMapPayload;
const evidenceMap = new Map(payload.tools.map((tool) => [tool.slug, { ...tool, mappingLevel: 'domain-reviewed' as const }]));

export const assessmentEvidenceValidationBoundary = payload.validation_boundary;

function buildProfileDerivedEvidenceMap(slug: string): AssessmentEvidenceMap | null {
  const profile = getAssessmentScientificProfile(slug);
  if (!profile || !profile.domains.length || !profile.scientificReferences.length) return null;
  const references: AssessmentEvidenceReference[] = profile.scientificReferences.map((reference, index) => ({
    id: `${slug}-profile-${index + 1}`,
    title: reference.title,
    url: reference.url,
    evidence_type: 'scientific-reference',
    supports: 'مرجع مستخدم في الملف العلمي لدعم البناء العام والسياق الذي صيغت ضمنه محاور المتابعة.',
    limitations: 'لم تُنجز بعد مراجعة claim-to-evidence مستقلة تحدد مقدار دعم هذا المرجع لهذا المحور منفردًا؛ لذلك لا يُصنّف هنا كدليل مباشر على صلاحية المحور أو الأداة.',
  }));
  const referenceIds = references.map((reference) => reference.id);
  const domains: AssessmentEvidenceDomain[] = profile.domains.map((domain) => ({
    domain,
    claim: `أُدرج محور «${domain}» ضمن البناء الحالي للأداة استنادًا إلى الملف العلمي ومراجعه العامة ومبرر تطوير البنود.`,
    evidence_relation: 'conceptual',
    reference_ids: referenceIds,
    limitations: 'هذه مواءمة شفافة على مستوى الملف العلمي، وليست مراجعة مستقلة للمحور ولا تحققًا من صلاحية المحتوى أو البنية العاملية أو الخصائص السيكومترية.',
  }));
  return { slug, domains, references, mappingLevel: 'profile-derived' };
}

export function getAssessmentEvidenceMap(slug: string) {
  return evidenceMap.get(slug) ?? buildProfileDerivedEvidenceMap(slug);
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
    'scientific-reference': 'مرجع علمي للملف',
  };
  return labels[type];
}
