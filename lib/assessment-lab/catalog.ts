import monitorData from '@/data/assessment-lab/monitors.v2.json';
import instrumentData from '@/data/assessment-lab/instruments.v1.json';

export type AssessmentDirection = 'concern' | 'resource';

export type AssessmentItem = {
  text: string;
  direction: AssessmentDirection;
};

export type AssessmentDomain = {
  id: string;
  title: string;
  action: string;
  items: AssessmentItem[];
};

export type AssessmentMonitor = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  audience: string;
  ageLabel: string;
  recallPeriod: string;
  estimatedMinutes: number;
  version: string;
  status: 'developmental';
  referenceIds: string[];
  safetyNote?: string;
  domains: AssessmentDomain[];
};

export type SourceInstrument = {
  slug: string;
  title: string;
  period: string;
  source: string;
  sourceUrl: string;
  status: string;
  statusLabel: string;
  summary: string;
  intendedUse: string;
  whyNoItems: string;
  rightsNote: string;
  note: string;
};

export type AssessmentReference = {
  id: string;
  title: string;
  organization: string;
  url: string;
  role: string;
};

export const assessmentReferences: AssessmentReference[] = [
  { id: 'cosmin', title: 'منهجية صلاحية المحتوى', organization: 'COSMIN', url: 'https://www.cosmin.nl/wp-content/uploads/COSMIN-methodology-for-content-validity-user-manual-v1.pdf', role: 'إطار مراجعة الملاءمة والشمول وسهولة الفهم قبل أي دراسة ميدانية.' },
  { id: 'fda-pro', title: 'مبادئ تطوير المقاييس المبلغ عنها من الأشخاص', organization: 'U.S. Food and Drug Administration', url: 'https://www.fda.gov/media/141565/download', role: 'مرجع لبناء المفهوم والسياق والبنود وخيارات الإجابة بلغة مفهومة؛ لا يثبت صلاحية أدوات روافد.' },
  { id: 'efpa', title: 'نموذج مراجعة الاختبارات 2025', organization: 'European Federation of Psychologists’ Associations', url: 'https://www.efpa.eu/wp-content/uploads/2025/08/efpa_test_review_model_v2025_5-1.pdf', role: 'إطار لمراجعة التوثيق والثبات والصدق والعدالة والاستخدام الرقمي قبل وصف أي أداة بأنها مقننة.' },
  { id: 'nimh-depression', title: 'Depression', organization: 'National Institute of Mental Health', url: 'https://www.nimh.nih.gov/health/topics/depression', role: 'مرجع سياقي لأثر تغير المزاج والطاقة والاهتمام والوظيفة.' },
  { id: 'nhlbi-sleep', title: 'Sleep Deprivation and Deficiency', organization: 'National Heart, Lung, and Blood Institute', url: 'https://www.nhlbi.nih.gov/health/sleep-deprivation', role: 'مرجع سياقي للنوم وأثره في النشاط والسلامة النهارية.' },
  { id: 'who-stress', title: 'Doing What Matters in Times of Stress', organization: 'World Health Organization', url: 'https://iris.who.int/items/e1a2eb7c-aa83-464a-917d-eddf70b97168', role: 'مرجع تثقيفي لإدارة الضغط والعودة للحاضر والمشاركة اليومية.' },
  { id: 'cdc-caregiving', title: 'Caregiving', organization: 'Centers for Disease Control and Prevention', url: 'https://www.cdc.gov/caregiving/index.html', role: 'مرجع سياقي لصحة مقدم الرعاية والحاجة إلى الدعم والاستراحة.' },
  { id: 'cdc-parenting', title: 'Essentials for Parenting: Communication', organization: 'Centers for Disease Control and Prevention', url: 'https://www.cdc.gov/parenting-toddlers/communication/index.html', role: 'مرجع سياقي لوضوح التواصل والاستماع والتعليمات الأسرية.' },
  { id: 'who-violence', title: 'Violence against women', organization: 'World Health Organization', url: 'https://www.who.int/news-room/fact-sheets/detail/violence-against-women', role: 'مرجع سلامة يوضح أن العنف والسيطرة يحتاجان استجابة مناسبة لا نتيجة اختبار ذاتي.' },
  { id: 'who-pfa', title: 'Psychological first aid: Guide for field workers', organization: 'World Health Organization', url: 'https://www.who.int/publications/i/item/9789241548205', role: 'مرجع لمبادئ الدعم الإنساني والأمان وعدم فرض سرد التجربة.' },
  { id: 'nimh-ptsd', title: 'Post-Traumatic Stress Disorder', organization: 'National Institute of Mental Health', url: 'https://www.nimh.nih.gov/health/topics/post-traumatic-stress-disorder-ptsd', role: 'مرجع سياقي للاستثارة والتجنب والأثر الوظيفي بعد الصدمة.' },
  { id: 'who-social', title: 'Social connection', organization: 'World Health Organization', url: 'https://www.who.int/news-room/questions-and-answers/item/social-connection', role: 'مرجع سياقي لجودة الاتصال والدعم والوحدة.' },
  { id: 'who-burnout', title: 'Burn-out as an occupational phenomenon', organization: 'World Health Organization', url: 'https://www.who.int/standards/classifications/frequently-asked-questions/burn-out-an-occupational-phenomenon', role: 'مرجع يحد مفهوم الاحتراق بالسياق المهني ولا يعامله تشخيصًا طبيًا.' },
  { id: 'who-icf', title: 'International Classification of Functioning, Disability and Health', organization: 'World Health Organization', url: 'https://icd.who.int/browse/2025-01/icf/en', role: 'مرجع سياقي لفهم الأداء والمشاركة والعوامل البيئية.' },
  { id: 'who-school', title: 'WHO guideline on school health services', organization: 'World Health Organization', url: 'https://cdn.who.int/media/docs/default-source/mca-documents/adolescents/who-shs-guideline_web_v28.pdf', role: 'مرجع سياقي للعافية والدعم وطلب المساعدة في المدرسة.' },
  { id: 'nimh-perinatal', title: 'Perinatal Depression', organization: 'National Institute of Mental Health', url: 'https://www.nimh.nih.gov/health/publications/perinatal-depression', role: 'مرجع سلامة وسياق لتغير المزاج بعد الولادة والحالات التي تستدعي مساعدة عاجلة.' },
  { id: 'samhsa-recovery', title: 'SAMHSA’s Working Definition of Recovery', organization: 'Substance Abuse and Mental Health Services Administration', url: 'https://library.samhsa.gov/sites/default/files/pep12-recdef.pdf', role: 'مرجع سياقي للتعافي بوصفه عملية مدعومة بالأمل والاختيار والصحة والمجتمع.' },
  { id: 'cdc-development', title: 'Developmental Disability Basics', organization: 'Centers for Disease Control and Prevention', url: 'https://www.cdc.gov/child-development/about/developmental-disability-basics.html', role: 'مرجع سياقي عام للاحتياجات النمائية وأثرها في الحياة اليومية.' },
  { id: 'nichd-learning', title: 'Learning Disabilities', organization: 'Eunice Kennedy Shriver NICHD', url: 'https://www.nichd.nih.gov/health/topics/learningdisabilities', role: 'مرجع سياقي لصعوبات التعلم والحاجة إلى تقييم ودعم مناسبين.' },
  { id: 'nidcd-speech', title: 'Speech and Language', organization: 'National Institute on Deafness and Other Communication Disorders', url: 'https://www.nidcd.nih.gov/health/speech-and-language', role: 'مرجع سياقي للتواصل واللغة والتقييم المهني.' },
  { id: 'nidcd-hearing', title: 'Your Baby’s Hearing and Communicative Development Checklist', organization: 'National Institute on Deafness and Other Communication Disorders', url: 'https://www.nidcd.nih.gov/health/your-babys-hearing-and-communicative-development-checklist', role: 'مرجع سياقي للوصول إلى السمع والتواصل والمتابعة المهنية.' },
  { id: 'nei-vision', title: 'Vision Rehabilitation', organization: 'National Eye Institute', url: 'https://www.nei.nih.gov/eye-health-information/vision-rehabilitation', role: 'مرجع سياقي للتأهيل البصري والاستقلال والوصول.' },
  { id: 'nimh-panic', title: 'Panic Disorder: When Fear Overwhelms', organization: 'National Institute of Mental Health', url: 'https://www.nimh.nih.gov/health/publications/panic-disorder-when-fear-overwhelms', role: 'مرجع سياقي لأعراض الهلع والتجنب وطلب التقييم.' },
  { id: 'nimh-ocd', title: 'Obsessive-Compulsive Disorder', organization: 'National Institute of Mental Health', url: 'https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd', role: 'مرجع سياقي للأفكار أو الأفعال المتكررة وأثرها اليومي.' },
];

export const assessmentMonitors = monitorData as unknown as AssessmentMonitor[];
export const sourceInstruments = instrumentData as unknown as SourceInstrument[];
export const assessmentSlugs = [...assessmentMonitors.map((row) => row.slug), ...sourceInstruments.map((row) => row.slug)];
export const assessmentCategories = [...new Set(assessmentMonitors.map((row) => row.category))];

export function getAssessmentMonitor(slug: string) {
  return assessmentMonitors.find((row) => row.slug === slug) ?? null;
}

export function getSourceInstrument(slug: string) {
  return sourceInstruments.find((row) => row.slug === slug) ?? null;
}

export function getAssessmentReferences(ids: string[]) {
  const requested = new Set(['cosmin', 'efpa', ...ids]);
  return assessmentReferences.filter((reference) => requested.has(reference.id));
}

export function getAssessmentItemCount(monitor: AssessmentMonitor) {
  return monitor.domains.reduce((total, domain) => total + domain.items.length, 0);
}
