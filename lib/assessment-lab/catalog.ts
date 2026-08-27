import monitorData from '@/data/assessment-lab/monitors.v1.json';
import instrumentData from '@/data/assessment-lab/instruments.v1.json';
import questionBankData from '@/data/assessment-lab/question-banks.v1.json';
import coreQuestionBankData from '@/data/assessment-lab/question-banks.core-1-12.v1.json';
import coreQuestionBankData13to24 from '@/data/assessment-lab/question-banks.core-13-24.v1.json';
import coreQuestionBankData25to28 from '@/data/assessment-lab/question-banks.core-25-28.v1.json';
import coreQuestionBankData29to32 from '@/data/assessment-lab/question-banks.core-29-32.v1.json';
import coreQuestionBankData33to36 from '@/data/assessment-lab/question-banks.core-33-36.v1.json';
import originalQuestionBankData49to54 from '@/data/assessment-lab/question-banks.originals-49-54.v1.json';
import originalQuestionBankData55to60 from '@/data/assessment-lab/question-banks.originals-55-60.v1.json';
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

export type AssessmentQuestion = {
  axis: string;
  text: string;
  responseKind: AssessmentResponseKind;
};

export const assessmentMonitors = monitorData as AssessmentMonitor[];
export const sourceInstruments = instrumentData as SourceInstrument[];
const questionBanks = {
  ...(questionBankData as Record<string, AssessmentQuestion[]>),
  ...(coreQuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(coreQuestionBankData13to24 as Record<string, AssessmentQuestion[]>),
  ...(coreQuestionBankData25to28 as Record<string, AssessmentQuestion[]>),
  ...(coreQuestionBankData29to32 as Record<string, AssessmentQuestion[]>),
  ...(coreQuestionBankData33to36 as Record<string, AssessmentQuestion[]>),
  ...(originalQuestionBankData49to54 as Record<string, AssessmentQuestion[]>),
  ...(originalQuestionBankData55to60 as Record<string, AssessmentQuestion[]>),
  ...(clarityWave2QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(clarityWave3QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(clarityWave4QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(clarityWave5QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(clarityWave6QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(clarityWave7QuestionBankData as Record<string, AssessmentQuestion[]>),
  ...(safetyHardenedQuestionBankData as Record<string, AssessmentQuestion[]>),
};
export const assessmentSlugs = [...assessmentMonitors.map((row) => row.slug), ...sourceInstruments.map((row) => row.slug)];
export const assessmentCategories = [...new Set(assessmentMonitors.map((row) => row.category))];

const sourceStatusLabels: Record<string, string> = {
  'official-arabic-no-copyright-listed': 'نسخة عربية مدرجة رسميًا، والمصدر الرسمي يسجل Copyright: No — المطابقة العلمية والتشغيلية مطلوبة قبل التفعيل',
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
  return custom;
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
