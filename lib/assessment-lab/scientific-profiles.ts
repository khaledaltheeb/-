import profilesCore1to12 from '@/data/assessment-lab/scientific-profiles.core-1-12.v1.json';
import profilesCore13to24 from '@/data/assessment-lab/scientific-profiles.core-13-24.v1.json';
import profilesCore25to36 from '@/data/assessment-lab/scientific-profiles.core-25-36.v1.json';
import profilesWave1 from '@/data/assessment-lab/scientific-profiles.wave1.v1.json';
import profilesWave1V2 from '@/data/assessment-lab/scientific-profiles.wave1-v2.v1.json';
import profiles49to54 from '@/data/assessment-lab/scientific-profiles.originals-49-54.v1.json';
import profiles55to60 from '@/data/assessment-lab/scientific-profiles.originals-55-60.v1.json';
import safetyCriticalProfiles from '@/data/assessment-lab/scientific-profiles.safety-critical.v1.json';
import priorityWave2Profiles from '@/data/assessment-lab/scientific-profiles.priority-wave2.v1.json';

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
  languageClarityReview: { status: string; note: string };
  contentValidityReview: { status: string; note: string };
  versioning: { schemaVersion: number; instrumentVersion: string; reviewed?: string };
  documentationStatus: 'complete-v1-source' | 'legacy-source-normalized';
};

type RawReference = { title?: string; name?: string; url: string };
type RawReviewStatus = { status: string; note: string };
type RawVersioning = { schema_version?: number; schemaVersion?: number; instrument_version?: string; instrumentVersion?: string; reviewed?: string };
type RawProfile = {
  slug: string;
  construct?: string;
  construct_definition?: string;
  intended_population: string;
  intended_use: string;
  prohibited_uses?: string[];
  not_for?: string[];
  reference_period: string;
  response_scale_semantics?: 'item-specific';
  domains?: string[];
  domain_map?: string[];
  item_rationale?: string;
  language_clarity_review?: RawReviewStatus;
  content_validity_review?: RawReviewStatus;
  privacy_statement?: string;
  interpretation_boundary: string;
  functional_impact_guidance?: string;
  safety?: string;
  safety_escalation?: string;
  professional_referral_path?: string;
  references?: RawReference[];
  scientific_references?: RawReference[];
  versioning?: RawVersioning;
  validation_stage: string;
  legacy_source?: boolean;
};

function normalizeProfile(profile: RawProfile): AssessmentScientificProfile {
  const references = profile.references ?? profile.scientific_references ?? [];
  const domains = profile.domains ?? profile.domain_map ?? [];
  const legacy = profile.legacy_source === true || !profile.item_rationale || !(profile.safety ?? profile.safety_escalation);
  const rawVersion = profile.versioning;
  return {
    slug: profile.slug,
    constructDefinition: profile.construct ?? profile.construct_definition ?? '',
    intendedPopulation: profile.intended_population,
    intendedUse: profile.intended_use,
    prohibitedUses: profile.prohibited_uses ?? profile.not_for ?? [],
    referencePeriod: profile.reference_period,
    domains,
    itemRationale: profile.item_rationale ?? `يوثق المصدر الحالي البناء والمجالات (${domains.join('، ')}) والمراجع، لكنه لا يحتوي بعد على مبرر بندي تفصيلي مستقل؛ لذلك تُعرض هذه الفجوة صراحة ضمن مرحلة تطوير البنود ولا تُعامل كصلاحية محتوى مكتملة.`,
    interpretationBoundary: profile.interpretation_boundary,
    safetyEscalation: profile.safety ?? profile.safety_escalation ?? 'لا يحتوي ملف المصدر الأقدم على بروتوكول سلامة نوعي مكتمل لهذه الأداة حتى الآن. أي خطر فوري، أعراض طبية حادة، عنف أو إيذاء للنفس/الآخرين يتجاوز المتابعة الذاتية ويحتاج مسار مساعدة مناسبًا.',
    scientificReferences: references.map((reference) => ({
      title: reference.title ?? reference.name ?? 'مرجع علمي',
      url: reference.url,
    })),
    validationStage: profile.validation_stage,
    responseScaleSemantics: profile.response_scale_semantics ?? 'item-specific',
    privacyStatement: profile.privacy_statement ?? 'لا تُرسل الإجابات إلى الخادم ولا تُحفظ في الحساب أو Local Storage أو Session Storage؛ تحديث الصفحة أو إغلاقها يزيل الإجابات المحلية.',
    functionalImpactGuidance: profile.functional_impact_guidance ?? 'يُفسَّر النمط في ضوء أثره على الدراسة أو العمل أو العلاقات أو العناية بالنفس أو المشاركة أو السلامة، لا من شدة إجابة منفردة.',
    professionalReferralPath: profile.professional_referral_path ?? 'إذا كان النمط مستمرًا أو معطلًا أو مقلقًا، استخدم الملاحظات والأمثلة لمناقشتها مع مختص مؤهل. مؤشرات الخطر أو الأعراض الطبية الحادة تتجاوز الأداة وتحتاج مسارًا مناسبًا فورًا.',
    languageClarityReview: profile.language_clarity_review ?? {
      status: 'internal-editorial-review',
      note: 'خضعت الصياغة لمراجعة تحريرية داخلية للوضوح العربي، ولا يُعد ذلك بديلًا عن المقابلات المعرفية مع عينة من الفئة المستهدفة.',
    },
    contentValidityReview: profile.content_validity_review ?? {
      status: 'not-yet-empirically-completed',
      note: 'تم بناء المحاور والبنود من الأدلة والمراجع، لكن دراسة صلاحية المحتوى مع خبراء ومستخدمين مستهدفين لم تكتمل بعد؛ لذلك تبقى الأداة في مرحلة تطوير البنود.',
    },
    versioning: {
      schemaVersion: rawVersion?.schema_version ?? rawVersion?.schemaVersion ?? 2,
      instrumentVersion: rawVersion?.instrument_version ?? rawVersion?.instrumentVersion ?? '1.0-item-development',
      reviewed: rawVersion?.reviewed,
    },
    documentationStatus: legacy ? 'legacy-source-normalized' : 'complete-v1-source',
  };
}

const wave1Profiles = Object.entries((profilesWave1 as unknown as { profiles: Record<string, Omit<RawProfile, 'slug'>> }).profiles)
  .map(([slug, profile]) => ({ ...profile, slug, legacy_source: true } satisfies RawProfile));
const allProfiles: RawProfile[] = [
  ...((profilesCore1to12 as unknown as { profiles: RawProfile[] }).profiles),
  ...((profilesCore13to24 as unknown as { profiles: RawProfile[] }).profiles),
  ...((profilesCore25to36 as unknown as { profiles: RawProfile[] }).profiles),
  ...wave1Profiles,
  ...((profilesWave1V2 as unknown as { profiles: RawProfile[] }).profiles),
  ...((profiles49to54 as unknown as { profiles: RawProfile[] }).profiles),
  ...((profiles55to60 as unknown as { profiles: RawProfile[] }).profiles),
];

const profileMap = new Map(allProfiles.map((profile) => [profile.slug, normalizeProfile(profile)]));
for (const profile of (safetyCriticalProfiles as unknown as { profiles: RawProfile[] }).profiles) {
  profileMap.set(profile.slug, normalizeProfile(profile));
}
for (const profile of (priorityWave2Profiles as unknown as { profiles: RawProfile[] }).profiles) {
  profileMap.set(profile.slug, normalizeProfile(profile));
}

export function getAssessmentScientificProfile(slug: string) {
  return profileMap.get(slug) ?? null;
}

export function getAllAssessmentScientificProfiles() {
  return [...profileMap.values()];
}
