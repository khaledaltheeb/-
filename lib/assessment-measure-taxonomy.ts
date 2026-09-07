import type { AssessmentMeasure } from '@/lib/assessment-measures';

export type MeasurementObjectKind =
  | 'prom'
  | 'clinro'
  | 'perfo'
  | 'obsro'
  | 'structured-interview'
  | 'clinical-classification'
  | 'composite-index'
  | 'other';

export type MeasurementUseTag =
  | 'screening'
  | 'risk-estimation'
  | 'outcome-monitoring'
  | 'functional-assessment'
  | 'symptom-severity'
  | 'neuropsychological'
  | 'rehabilitation'
  | 'research-outcome';

export type MeasurementTaxonomy = {
  kind: MeasurementObjectKind;
  kindLabel: string;
  useTags: MeasurementUseTag[];
  useLabels: string[];
  rationale: string;
  reviewMode: 'explicit-override' | 'semantic-contract';
};

const kindLabels: Record<MeasurementObjectKind, string> = {
  prom: 'PROM — تقرير المريض/المشارك',
  clinro: 'ClinRO — تقييم سريري بواسطة فاحص',
  perfo: 'PerfO — اختبار أداء مباشر',
  obsro: 'ObsRO — تقرير مراقب/مقدم رعاية',
  'structured-interview': 'مقابلة منظمة',
  'clinical-classification': 'تصنيف/مرحلة سريرية',
  'composite-index': 'مؤشر/درجة مركبة',
  other: 'أداة قياس أخرى — تحتاج توصيفًا سياقيًا',
};

const useLabels: Record<MeasurementUseTag, string> = {
  screening: 'فحص/فرز أولي',
  'risk-estimation': 'تقدير خطر',
  'outcome-monitoring': 'متابعة نتائج/تغير',
  'functional-assessment': 'تقييم وظيفي',
  'symptom-severity': 'شدة أعراض',
  neuropsychological: 'قياس معرفي/عصبي نفسي',
  rehabilitation: 'تأهيل',
  'research-outcome': 'مخرج بحثي',
};

const explicitKindOverrides: Record<string, MeasurementObjectKind> = {
  'karnofsky-performance-scale': 'clinical-classification',
  'eastern-cooperative-oncology-group-performance-status': 'clinical-classification',
  'glasgow-outcome-scale-extended': 'clinical-classification',
  'modified-rankin-scale': 'clinical-classification',
  'glasgow-coma-scale-ninds': 'clinro',
  'timed-up-and-go': 'perfo',
  '10-meter-walk-test': 'perfo',
  '6-minute-walk-test': 'perfo',
  'berg-balance-scale': 'perfo',
  'patient-health-questionnaire-2': 'prom',
  'patient-health-questionnaire-9': 'prom',
  'generalized-anxiety-disorder-7': 'prom',
  'heaviness-of-smoking-index': 'composite-index',
};

function normalizedText(measure: AssessmentMeasure) {
  return [
    measure.nameAr,
    measure.nameEn,
    measure.version,
    measure.summary,
    measure.purpose,
    measure.construct,
    measure.administrationMode,
    measure.scoring,
    measure.interpretation,
    ...measure.categories,
    ...measure.populations,
    ...measure.settings,
  ].join(' ').toLowerCase();
}

function semanticKind(measure: AssessmentMeasure): MeasurementObjectKind {
  const text = normalizedText(measure);
  const administration = measure.administrationMode.toLowerCase();

  if (/تقرير ذاتي|self[- ]?report/.test(administration)) return 'prom';
  if (/مقدم الرعاية|caregiver|proxy|observer/.test(administration)) return 'obsro';
  if (/اختبار أداء|أداء مباشر|performance test|walk test|مهمة أداء/.test(text)) return 'perfo';
  if (/مقابلة منظمة|structured interview/.test(administration)) return 'structured-interview';
  if (/تصنيف|مرحلة سريرية|فئات المآل|performance status|classification|staging/.test(text)) return 'clinical-classification';
  if (/مؤشر|index|درجة مركبة|composite|risk score/.test(text)) return 'composite-index';
  if (/بواسطة فاحص|المقيم|clinician|فحص سريري|تقييم سريري/.test(administration)) return 'clinro';
  return 'other';
}

function semanticUseTags(measure: AssessmentMeasure): MeasurementUseTag[] {
  const text = normalizedText(measure);
  const tags = new Set<MeasurementUseTag>();
  if (/فحص أولي|فرز|screening|screen/.test(text)) tags.add('screening');
  if (/خطر|risk|سقوط/.test(text)) tags.add('risk-estimation');
  if (/متابعة|تغير|نتائج|outcome|response/.test(text)) tags.add('outcome-monitoring');
  if (/وظيف|استقلال|مشاركة|function|disability|mobility/.test(text)) tags.add('functional-assessment');
  if (/أعراض|شدة|severity|symptom/.test(text)) tags.add('symptom-severity');
  if (/معرف|ذاكر|انتباه|تنفيذي|neuropsych|cognitive/.test(text)) tags.add('neuropsychological');
  if (/تأهيل|rehabilitation/.test(text)) tags.add('rehabilitation');
  if (/بحث|دراسة|تجارب|research|trial/.test(text)) tags.add('research-outcome');
  if (tags.size === 0) tags.add('outcome-monitoring');
  return [...tags];
}

export function classifyAssessmentMeasure(measure: AssessmentMeasure): MeasurementTaxonomy {
  const override = explicitKindOverrides[measure.slug];
  const kind = override ?? semanticKind(measure);
  const useTags = semanticUseTags(measure);
  return {
    kind,
    kindLabel: kindLabels[kind],
    useTags,
    useLabels: useTags.map((tag) => useLabels[tag]),
    rationale: override
      ? 'التصنيف الأساسي مثبت بمراجعة صريحة لأن طبيعة الأداة قد تلتبس مع طريقة استخدامها أو اسمها.'
      : 'التصنيف الأساسي مشتق من عقد دلالي يعتمد طريقة التطبيق والبنية المقاسة والتسجيل؛ الاستخدامات تبقى منفصلة عن نوع الأداة.',
    reviewMode: override ? 'explicit-override' : 'semantic-contract',
  };
}

export const measurementObjectKindLabels = kindLabels;
export const measurementUseTagLabels = useLabels;
