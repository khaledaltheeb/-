import monitorData from '@/data/assessment-lab/monitors.v1.json';
import instrumentData from '@/data/assessment-lab/instruments.v1.json';
import clarityWave2QuestionBankData from '@/data/assessment-lab/question-banks.clarity-wave2.v1.json';
import clarityWave3QuestionBankData from '@/data/assessment-lab/question-banks.clarity-wave3.v1.json';
import clarityWave4QuestionBankData from '@/data/assessment-lab/question-banks.clarity-wave4.v1.json';
import clarityWave5QuestionBankData from '@/data/assessment-lab/question-banks.clarity-wave5.v1.json';
import clarityWave6QuestionBankData from '@/data/assessment-lab/question-banks.clarity-wave6.v1.json';
import clarityWave7QuestionBankData from '@/data/assessment-lab/question-banks.clarity-wave7.v1.json';
import safetyHardenedQuestionBankData from '@/data/assessment-lab/question-banks.safety-hardening.v1.json';

export type AssessmentMonitor = {
  slug: string;
  title: string;
  category: string;
  axes: string[];
};

export type SourceInstrument = {
  slug: string;
  title: string;
  period: string;
  source: string;
  sourceUrl: string;
  status: string;
  note: string;
};

export type AssessmentResponseKind = 'frequency' | 'degree' | 'yes-no';
export type AssessmentSafetyLevel = 'urgent' | 'priority';
export type AssessmentSafetyKind = 'personal-safety' | 'postpartum-urgent' | 'health-evaluation' | 'recovery-support' | 'school-safeguarding';

export type AssessmentSafetySignal = {
  triggerValues: string[];
  level: AssessmentSafetyLevel;
  kind: AssessmentSafetyKind;
  title: string;
  message: string;
};

export type AssessmentQuestion = {
  axis: string;
  text: string;
  responseKind: AssessmentResponseKind;
  safetySignal?: AssessmentSafetySignal;
};

export const assessmentMonitors = monitorData as AssessmentMonitor[];
export const sourceInstruments = instrumentData as SourceInstrument[];

// Runtime uses only the final manually reviewed banks. Historical/base banks stay in
// the repository for traceability and scientific comparison but cannot ship as live items.
const questionBanks = {
  ...(clarityWave2QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(clarityWave3QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(clarityWave4QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(clarityWave5QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(clarityWave6QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(clarityWave7QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(safetyHardenedQuestionBankData as Record<string, AssessmentQuestion[]>),
};

// Small editorial/safety corrections discovered during page-by-page audit are applied
// centrally so they cannot be lost while the reviewed source banks remain traceable.
const questionTextCorrections: Record<string, Record<string, string>> = {
  'hearing-support-family': {
    'كم مرة فات الطفل جزء من تواصل مهم؟': 'كم مرة فاته جزء من تواصل مهم؟',
  },
};

const questionSafetyOverrides: Record<string, Record<string, AssessmentSafetySignal>> = {
  'school-wellbeing': {
    'هل تعرض الطالب لتنمر أو تهديد خلال الأسبوع الماضي؟': {
      triggerValues: ['نعم'],
      level: 'priority',
      kind: 'school-safeguarding',
      title: 'التنمر أو التهديد يحتاج إلى استجابة حماية، لا إلى الاكتفاء بالمتابعة',
      message: 'إذا كان التنمر أو التهديد مستمرًا، أخبر شخصًا بالغًا موثوقًا ومسؤولًا في المدرسة والأسرة، ووثّق ما حدث بطريقة آمنة. إذا كان هناك خطر مباشر أو عنف جارٍ، فالأولوية للابتعاد عن الخطر وطلب مساعدة فورية من الجهة المحلية المناسبة بدل إكمال الأداة.',
    },
  },
};

export const assessmentSlugs = [...assessmentMonitors.map((row) => row.slug), ...sourceInstruments.map((row) => row.slug)];
export const assessmentCategories = [...new Set(assessmentMonitors.map((row) => row.category))];

const sourceStatusLabels: Record<string, string> = {
  'official-arabic-no-copyright-listed': 'نسخة عربية مدرجة رسميًا، والمصدر الرسمي يسجل Copyright: No — المطابقة العلمية والتشغيلية مطلوبة قبل التفعيل',
  'official-arabic-who-cc-license': 'نسخة عربية رسمية منشورة من منظمة الصحة العالمية بترخيص CC BY-NC-SA 3.0 IGO — تُراجع مطابقة النص والحساب والنسبة للترخيص قبل التفعيل التفاعلي',
  'who-cc-license-arabic-not-listed': 'ترخيص WHO يسمح بإعادة الاستخدام غير التجاري بشروطه، لكن العربية غير مدرجة حاليًا ضمن النسخ الرسمية المنشورة',
  'source-guided-only': 'مرجعي فقط — يُحال إلى المصدر الرسمي ولا تُعاد صياغة الأداة أو درجتها',
  'permission-and-arabic-version-review': 'مراجعة الإذن والنسخة العربية مطلوبة قبل أي نشر تفاعلي',
  'licensed-restricted': 'أداة مرخّصة ومقيّدة — لا تُعرض البنود أو مفاتيح التصحيح على الويب المفتوح',
  'permission-required-for-modification-integration': 'يتطلب إذنًا للتعديل أو الترجمة أو التكامل — صفحة مصدرية فقط حاليًا',
  'arabic-available-rights-note-review': 'العربية متاحة من المصدر، لكن إشعارات الحقوق تحتاج مطابقة نهائية قبل النشر التفاعلي المفتوح',
  'conditions-of-use-and-arabic-version-review': 'شروط الاستخدام والنسخة العربية تحتاجان تحققًا قبل نشر البنود أو الدرجة',
  'distributed-by-mapi-rights-review': 'موزّع عبر جهة حقوق مختصة — تُراجع شروط الاستخدام والترجمة قبل أي تفعيل',
};

export function getAssessmentMonitor(slug: string) {
  return assessmentMonitors.find((row) => row.slug === slug) ?? null;
}

export function getSourceInstrument(slug: string) {
  return sourceInstruments.find((row) => row.slug === slug) ?? null;
}

export function getSourceInstrumentStatusLabel(status: string) {
  return sourceStatusLabels[status] ?? 'حالة الحقوق أو النسخة تحتاج مراجعة موثقة قبل أي تفعيل تفاعلي';
}

export function buildMonitorQuestions(monitor: AssessmentMonitor): AssessmentQuestion[] {
  const custom = questionBanks[monitor.slug];
  if (!custom?.length) {
    throw new Error(`Missing tailored Assessment Lab question bank for ${monitor.slug}`);
  }
  const textCorrections = questionTextCorrections[monitor.slug] ?? {};
  const safetyOverrides = questionSafetyOverrides[monitor.slug] ?? {};
  return custom.map((question) => {
    const correctedText = textCorrections[question.text] ?? question.text;
    const safetySignal = safetyOverrides[question.text] ?? question.safetySignal;
    return correctedText === question.text && safetySignal === question.safetySignal
      ? question
      : { ...question, text: correctedText, safetySignal };
  });
}

export function getMonitorReadingTime(monitor: AssessmentMonitor) {
  return Math.max(4, Math.ceil(buildMonitorQuestions(monitor).length * 0.35));
}

export function getRelatedMonitors(monitor: AssessmentMonitor, limit = 4) {
  const sameCategory = assessmentMonitors.filter((row) => row.slug !== monitor.slug && row.category === monitor.category);
  const sharedAxes = assessmentMonitors
    .filter((row) => row.slug !== monitor.slug && row.category !== monitor.category)
    .map((row) => ({ row, overlap: row.axes.filter((axis) => monitor.axes.includes(axis)).length }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .map(({ row }) => row);
  return [...sameCategory, ...sharedAxes].slice(0, limit);
}
