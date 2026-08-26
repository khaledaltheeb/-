import profilesCore1to12 from '@/data/assessment-lab/scientific-profiles.core-1-12.v1.json';
import profilesCore13to24 from '@/data/assessment-lab/scientific-profiles.core-13-24.v1.json';
import profilesCore25to36 from '@/data/assessment-lab/scientific-profiles.core-25-36.v1.json';
import profilesWave1 from '@/data/assessment-lab/scientific-profiles.wave1.v1.json';
import profiles49to54 from '@/data/assessment-lab/scientific-profiles.originals-49-54.v1.json';
import profiles55to60 from '@/data/assessment-lab/scientific-profiles.originals-55-60.v1.json';

export type AssessmentScientificReference = {
  title: string;
  url: string;
};

export type AssessmentScientificProfile = {
  slug: string;
  constructDefinition: string;
  intendedPopulation: string;
  intendedUse: string;
  prohibitedUses: string[];
  referencePeriod: string;
  domains: string[];
  itemRationale: string;
  interpretationBoundary: string;
  safetyEscalation: string;
  scientificReferences: AssessmentScientificReference[];
  validationStage: string;
  responseScaleSemantics: 'item-specific';
  privacyStatement: string;
  functionalImpactGuidance: string;
  professionalReferralPath: string;
  languageClarityReview: { status: 'internal-editorial-review'; note: string };
  contentValidityReview: { status: 'not-yet-empirically-completed'; note: string };
  versioning: { schemaVersion: 2; instrumentVersion: '1.0-item-development' };
};

type RawReference = { title?: string; name?: string; url: string };
type RawProfile = {
  slug: string;
  construct?: string;
  construct_definition?: string;
  intended_population: string;
  intended_use: string;
  prohibited_uses?: string[];
  not_for?: string[];
  reference_period: string;
  domains?: string[];
  domain_map?: string[];
  item_rationale: string;
  interpretation_boundary: string;
  safety?: string;
  safety_escalation?: string;
  references?: RawReference[];
  scientific_references?: RawReference[];
  validation_stage: string;
};

function normalizeProfile(profile: RawProfile): AssessmentScientificProfile {
  const references = profile.references ?? profile.scientific_references ?? [];
  return {
    slug: profile.slug,
    constructDefinition: profile.construct ?? profile.construct_definition ?? '',
    intendedPopulation: profile.intended_population,
    intendedUse: profile.intended_use,
    prohibitedUses: profile.prohibited_uses ?? profile.not_for ?? [],
    referencePeriod: profile.reference_period,
    domains: profile.domains ?? profile.domain_map ?? [],
    itemRationale: profile.item_rationale,
    interpretationBoundary: profile.interpretation_boundary,
    safetyEscalation: profile.safety ?? profile.safety_escalation ?? '',
    scientificReferences: references.map((reference) => ({
      title: reference.title ?? reference.name ?? 'مرجع علمي',
      url: reference.url,
    })),
    validationStage: profile.validation_stage,
    responseScaleSemantics: 'item-specific',
    privacyStatement: 'لا تُرسل الإجابات إلى الخادم ولا تُحفظ في الحساب أو Local Storage أو Session Storage؛ تحديث الصفحة أو إغلاقها يزيل الإجابات المحلية.',
    functionalImpactGuidance: 'يُفسَّر النمط في ضوء أثره على الدراسة أو العمل أو العلاقات أو العناية بالنفس أو المشاركة أو السلامة، لا من شدة إجابة منفردة.',
    professionalReferralPath: 'إذا كان النمط مستمرًا أو معطلًا أو مقلقًا، استخدم الملاحظات والأمثلة لمناقشتها مع مختص مؤهل. مؤشرات الخطر أو الأعراض الطبية الحادة تتجاوز الأداة وتحتاج مسارًا مناسبًا فورًا.',
    languageClarityReview: {
      status: 'internal-editorial-review',
      note: 'خضعت الصياغة لمراجعة تحريرية داخلية للوضوح العربي، ولا يُعد ذلك بديلًا عن المقابلات المعرفية مع عينة من الفئة المستهدفة.',
    },
    contentValidityReview: {
      status: 'not-yet-empirically-completed',
      note: 'تم بناء المحاور والبنود من الأدلة والمراجع، لكن دراسة صلاحية المحتوى مع خبراء ومستخدمين مستهدفين لم تكتمل بعد؛ لذلك تبقى الأداة في مرحلة تطوير البنود.',
    },
    versioning: { schemaVersion: 2, instrumentVersion: '1.0-item-development' },
  };
}

const wave1Profiles = Object.values((profilesWave1 as { profiles: Record<string, RawProfile> }).profiles);
const allProfiles = [
  ...(profilesCore1to12 as { profiles: RawProfile[] }).profiles,
  ...(profilesCore13to24 as { profiles: RawProfile[] }).profiles,
  ...(profilesCore25to36 as { profiles: RawProfile[] }).profiles,
  ...wave1Profiles,
  ...(profiles49to54 as { profiles: RawProfile[] }).profiles,
  ...(profiles55to60 as { profiles: RawProfile[] }).profiles,
];

const profileMap = new Map(allProfiles.map((profile) => [profile.slug, normalizeProfile(profile)]));

export function getAssessmentScientificProfile(slug: string) {
  return profileMap.get(slug) ?? null;
}

export function getAllAssessmentScientificProfiles() {
  return [...profileMap.values()];
}
