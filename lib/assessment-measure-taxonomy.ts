import type { AssessmentMeasure } from '@/lib/assessment-measures';

export type MeasurementObjectKind =
  | 'prom'
  | 'clinro'
  | 'perfo'
  | 'obsro'
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

export type AdministrationFormatTag =
  | 'self-completed'
  | 'interviewer-administered'
  | 'structured-interview'
  | 'clinician-observation'
  | 'caregiver-observation'
  | 'performance-task';

export type MeasurementTaxonomy = {
  kind: MeasurementObjectKind;
  kindLabel: string;
  coaType: 'PRO' | 'ClinRO' | 'ObsRO' | 'PerfO' | null;
  useTags: MeasurementUseTag[];
  useLabels: string[];
  administrationTags: AdministrationFormatTag[];
  administrationLabels: string[];
  rationale: string;
  reviewMode: 'explicit-override' | 'semantic-contract';
};

const kindLabels: Record<MeasurementObjectKind, string> = {
  prom: 'PRO / PROM — تقرير مباشر من المريض أو المشارك',
  clinro: 'ClinRO — تقييم يقرره مختص بعد الملاحظة',
  perfo: 'PerfO — أداء مهمة معيارية مباشرة',
  obsro: 'ObsRO — تقرير مراقب غير المريض وغير المختص المعالج',
  'clinical-classification': 'تصنيف أو مرحلة سريرية — ليس نوع COA مستقلًا بحد ذاته',
  'composite-index': 'مؤشر أو درجة مركبة — نوع بنية حسابية يحتاج تحديد مصادر مكوناته',
  other: 'أداة قياس خارج التصنيف الحالي — تتطلب مراجعة صريحة قبل اعتماد النوع',
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

const administrationLabels: Record<AdministrationFormatTag, string> = {
  'self-completed': 'استكمال ذاتي',
  'interviewer-administered': 'تطبيق بواسطة مقابل دون تغيير مصدر التقرير',
  'structured-interview': 'مقابلة منظمة/مقننة',
  'clinician-observation': 'ملاحظة/حكم سريري',
  'caregiver-observation': 'ملاحظة مقدم رعاية/مراقب',
  'performance-task': 'مهمة أداء مباشرة',
};

// High-impact or easily confused measures receive an explicit object-type decision.
// This map describes the measurement object, not the intended use or administration format.
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

  // Source of the outcome/report is evaluated before format. A PRO can be interviewer-administered
  // when the interviewer merely records the patient's response without interpreting it.
  if (/تقرير ذاتي|self[- ]?report|patient[- ]reported|participant[- ]reported/.test(administration + ' ' + text)) return 'prom';
  if (/مقدم الرعاية|caregiver|proxy|observer[- ]reported|parent[- ]reported/.test(administration)) return 'obsro';
  if (/اختبار أداء|أداء مباشر|performance test|walk test|مهمة أداء|standardized task/.test(text)) return 'perfo';
  if (/بواسطة فاحص|المقيم|clinician|فحص سريري|تقييم سريري|clinical observation/.test(administration)) return 'clinro';
  if (/تصنيف|مرحلة سريرية|فئات المآل|performance status|classification|staging/.test(text)) return 'clinical-classification';
  if (/مؤشر|index|درجة مركبة|composite|risk score/.test(text)) return 'composite-index';
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
  return [...tags];
}

function semanticAdministrationTags(measure: AssessmentMeasure): AdministrationFormatTag[] {
  const administration = measure.administrationMode.toLowerCase();
  const tags = new Set<AdministrationFormatTag>();
  if (/تقرير ذاتي|self[- ]?report|يملؤها|يجيب بنفسه/.test(administration)) tags.add('self-completed');
  if (/مقابلة|interviewer[- ]administered|administered by interviewer/.test(administration)) tags.add('interviewer-administered');
  if (/مقابلة منظمة|مقابلة مقننة|structured interview/.test(administration)) tags.add('structured-interview');
  if (/clinician|فاحص|المقيم|فحص سريري|ملاحظة سريرية/.test(administration)) tags.add('clinician-observation');
  if (/caregiver|proxy|observer|مقدم الرعاية|الوالد|الأهل/.test(administration)) tags.add('caregiver-observation');
  if (/اختبار أداء|مهمة|walk|performance|زمن|مسافة/.test(administration)) tags.add('performance-task');
  return [...tags];
}

function coaTypeFor(kind: MeasurementObjectKind): MeasurementTaxonomy['coaType'] {
  if (kind === 'prom') return 'PRO';
  if (kind === 'clinro') return 'ClinRO';
  if (kind === 'obsro') return 'ObsRO';
  if (kind === 'perfo') return 'PerfO';
  return null;
}

export function classifyAssessmentMeasure(measure: AssessmentMeasure): MeasurementTaxonomy {
  const override = explicitKindOverrides[measure.slug];
  const kind = override ?? semanticKind(measure);
  const useTags = semanticUseTags(measure);
  const administrationTags = semanticAdministrationTags(measure);
  return {
    kind,
    kindLabel: kindLabels[kind],
    coaType: coaTypeFor(kind),
    useTags,
    useLabels: useTags.map((tag) => useLabels[tag]),
    administrationTags,
    administrationLabels: administrationTags.map((tag) => administrationLabels[tag]),
    rationale: override
      ? 'نوع كائن القياس مثبت بمراجعة صريحة لأن الاسم أو طريقة التطبيق قد يسببان التباسًا.'
      : 'نوع كائن القياس مستنتج من مصدر التقرير/الملاحظة أو طبيعة مهمة الأداء؛ طريقة التطبيق والاستخدام موثقان في حقول منفصلة ولا يغيران النوع تلقائيًا.',
    reviewMode: override ? 'explicit-override' : 'semantic-contract',
  };
}

export const measurementObjectKindLabels = kindLabels;
export const measurementUseTagLabels = useLabels;
export const measurementAdministrationLabels = administrationLabels;
