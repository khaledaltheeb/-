import monitorData from '@/data/assessment-lab/monitors.v1.json';
import instrumentData from '@/data/assessment-lab/instruments.v1.json';
import questionBankData from '@/data/assessment-lab/question-banks.v1.json';
import coreQuestionBankData from '@/data/assessment-lab/question-banks.core-1-12.v1.json';
import coreQuestionBankData13to24 from '@/data/assessment-lab/question-banks.core-13-24.v1.json';
import coreQuestionBankData25to28 from '@/data/assessment-lab/question-banks.core-25-28.v1.json';
import coreQuestionBankData29to32 from '@/data/assessment-lab/question-banks.core-29-32.v1.json';
import coreQuestionBankData33to36 from '@/data/assessment-lab/question-banks.core-33-36.v1.json';

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

type RawAssessmentQuestion = Omit<AssessmentQuestion, 'responseKind'> & { responseKind?: AssessmentResponseKind };

export const assessmentMonitors = monitorData as AssessmentMonitor[];
export const sourceInstruments = instrumentData as SourceInstrument[];
const questionBanks = {
  ...(questionBankData as Record<string, RawAssessmentQuestion[]>),
  ...(coreQuestionBankData as Record<string, RawAssessmentQuestion[]>),
  ...(coreQuestionBankData13to24 as Record<string, RawAssessmentQuestion[]>),
  ...(coreQuestionBankData25to28 as Record<string, RawAssessmentQuestion[]>),
  ...(coreQuestionBankData29to32 as Record<string, RawAssessmentQuestion[]>),
  ...(coreQuestionBankData33to36 as Record<string, RawAssessmentQuestion[]>),
};
export const assessmentSlugs = [...assessmentMonitors.map((row) => row.slug), ...sourceInstruments.map((row) => row.slug)];
export const assessmentCategories = [...new Set(assessmentMonitors.map((row) => row.category))];

const protectiveAxes = new Set([
  'الشعور بالسيطرة','الاستعادة','الدعم العملي','الراحة','الدعم','إصلاح الخلاف','وضوح الطلب','الاحترام','الحدود','حرية التعبير','الأمان','الروتين','استعادة الذات','الوظيفة اليومية','حمل الذكرى','العودة للحياة','التهدئة','تسمية الشعور','اختيار السلوك','لغة الذات','تقبل النقص','الرعاية','المرونة','الانتماء','شخص آمن','جودة التواصل','المبادرة','دعم عاطفي','معلومات','طلب المساعدة','الفاعلية','العناية الذاتية','العمل أو الدراسة','العلاقات','المنزل','الاستراحة الحسية','الأمان المدرسي','طلب المساعدة','التعزيز','التعاون المدرسي','فرص التواصل','تقليل الضغط','البدائل','التعاون العلاجي','الاستقلال','المهارات التكيفية','المشاركة','الصحة','التعلم','الحركة','التواصل','الوصول للتواصل','البيئة السمعية','اللغة','التنقل','الوصول للمعلومات','احتياجات الأسرة','القرب الآمن','استعادة النشاط','العودة للحاضر','الأشخاص الداعمون','خطوات السلامة'
]);

const behaviorAxes = new Set([
  'بدء المهمة','التنظيم','تذكر الخطوات','الانتقال','الاستمرار','استعادة التركيز','إنهاء المهمة','النشاط النهاري','العناية بالنفس','وقت الاستعادة','إصلاح الخلاف','المبادرة','طلب المساعدة','التعليمات','التكييف','التعاون المدرسي','التعزيز','الاستقلال','المشاركة','التواصل','التنقل','الوصول للمعلومات','العودة للحاضر','استعادة النشاط'
]);

const safetyAxes = new Set(['الأمان','الأمان المدرسي','الأشخاص الداعمون','خطوات السلامة','المحفزات','الإشارات المبكرة','الحدود','حرية التعبير']);

export function getAssessmentMonitor(slug: string) {
  return assessmentMonitors.find((row) => row.slug === slug) ?? null;
}

export function getSourceInstrument(slug: string) {
  return sourceInstruments.find((row) => row.slug === slug) ?? null;
}

function questionsForAxis(axis: string): string[] {
  if (safetyAxes.has(axis)) {
    return [
      `خلال الأسبوع الماضي، إلى أي حد شعرت أن ${axis} كان واضحًا ومتوافرًا عندما احتجته؟`,
      `هل وجدت موقفًا واحدًا على الأقل عرفت فيه ما الذي يحافظ على ${axis} أو ما الذي يهدده؟`,
      `إلى أي حد استطعت الوصول إلى خطوة عملية أو شخص مناسب عندما احتجت إلى تعزيز ${axis}؟`,
      `هل تغير مستوى ${axis} بسرعة أو بصورة جعلتك تؤجل نشاطًا مهمًا أو تتجنب موقفًا معتادًا؟`,
    ];
  }

  if (protectiveAxes.has(axis) || behaviorAxes.has(axis)) {
    return [
      `خلال الأسبوع الماضي، إلى أي حد كان ${axis} متاحًا لك عندما احتجته؟`,
      `إلى أي حد استطعت استخدام ${axis} بصورة ساعدتك على إكمال ما تريد فعله؟`,
      `هل لاحظت سياقًا محددًا أصبح فيه ${axis} أسهل أو أصعب من المعتاد؟`,
      `إلى أي حد احتجت إلى تعديل البيئة أو طلب مساعدة حتى يصبح ${axis} ممكنًا أو أكثر استقرارًا؟`,
    ];
  }

  return [
    `خلال الأسبوع الماضي، إلى أي حد كان ${axis} حاضرًا بصورة أثرت في يومك؟`,
    `إلى أي حد غير ${axis} قدرتك على أداء مهمة أو الاستمرار في نشاط مهم؟`,
    `هل استطعت تحديد موقف أو وقت أصبح فيه ${axis} أكثر وضوحًا أو شدة من المعتاد؟`,
    `إلى أي حد احتجت إلى راحة أو تعديل أو دعم بسبب ما لاحظته في ${axis}؟`,
  ];
}

function inferResponseKind(text: string): AssessmentResponseKind {
  const normalized = text.trim();
  if (normalized.includes('كم مرة') || normalized.includes('كم مرّة')) return 'frequency';
  if (normalized.startsWith('هل ') || normalized.startsWith('هل؟')) return 'yes-no';
  return 'degree';
}

function normalizeQuestion(question: RawAssessmentQuestion): AssessmentQuestion {
  return {
    axis: question.axis,
    text: question.text,
    responseKind: question.responseKind ?? inferResponseKind(question.text),
  };
}

export function buildMonitorQuestions(monitor: AssessmentMonitor): AssessmentQuestion[] {
  const custom = questionBanks[monitor.slug];
  if (custom?.length) return custom.map(normalizeQuestion);
  return monitor.axes.flatMap((axis) => questionsForAxis(axis).map((text) => normalizeQuestion({ axis, text })));
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
