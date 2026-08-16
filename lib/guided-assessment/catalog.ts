import topicsData from '@/data/guided-assessment/topics.v1.json';

export type GuidedAssessmentAudience = 'adult' | 'child';

export type GuidedAssessmentTopic = {
  key: string;
  label: string;
  legacyLabel: string;
  group: string;
};

export type LegacyGuidedAssessment = {
  legacyNumber: number;
  legacySlug: string;
  topic: GuidedAssessmentTopic;
  audience: GuidedAssessmentAudience;
  audienceLabel: string;
  legacyTitle: string;
};

export const guidedAssessmentTopics = topicsData as GuidedAssessmentTopic[];
export const guidedAssessmentGroups = [...new Set(guidedAssessmentTopics.map((topic) => topic.group))];

export const guidedAssessmentLegacySlugs = Array.from({ length: guidedAssessmentTopics.length * 2 }, (_, index) =>
  `questions-${String(index + 1).padStart(3, '0')}`,
);

export const guidedAssessmentReferences = [
  {
    title: 'NIMH: Tips for Talking With a Health Care Provider About Your Mental Health',
    url: 'https://www.nimh.nih.gov/health/publications/tips-for-talking-with-your-health-care-provider',
    note: 'إرشادات للتحضير للزيارة، وتجهيز الأسئلة وقائمة الأدوية والمعلومات التي تساعد مقدم الرعاية.',
  },
  {
    title: 'NIMH: Children and Mental Health',
    url: 'https://www.nimh.nih.gov/health/publications/children-and-mental-health',
    note: 'يوضح أهمية جمع السياق النمائي والأسري والمدرسي عند تقييم الأطفال والمراهقين.',
  },
  {
    title: 'WHO: mhGAP guideline, third edition',
    url: 'https://www.who.int/publications/i/item/9789240084278',
    note: 'مرجع إرشادي قائم على الأدلة للرعاية والتقييم المهني للحالات النفسية والعصبية واضطرابات استخدام المواد.',
  },
] as const;

export function getLegacyGuidedAssessment(slug: string): LegacyGuidedAssessment | null {
  const match = /^questions-(\d{3})$/.exec(slug);
  if (!match) return null;
  const legacyNumber = Number(match[1]);
  if (!Number.isInteger(legacyNumber) || legacyNumber < 1 || legacyNumber > guidedAssessmentTopics.length * 2) return null;
  const topic = guidedAssessmentTopics[Math.floor((legacyNumber - 1) / 2)];
  if (!topic) return null;
  const audience: GuidedAssessmentAudience = legacyNumber % 2 === 1 ? 'adult' : 'child';
  const audienceLabel = audience === 'adult' ? 'للبالغين' : 'للأطفال والمراهقين';
  return {
    legacyNumber,
    legacySlug: slug,
    topic,
    audience,
    audienceLabel,
    legacyTitle: `أسئلة استرشادية حول ${topic.legacyLabel} ${audienceLabel}`,
  };
}

export function legacySlugForTopic(topicIndex: number, audience: GuidedAssessmentAudience) {
  const number = topicIndex * 2 + (audience === 'adult' ? 1 : 2);
  return `questions-${String(number).padStart(3, '0')}`;
}

export function buildGuidedAssessmentQuestions(item: LegacyGuidedAssessment) {
  const topic = item.topic.label;
  if (item.audience === 'child') {
    return [
      `متى بدأت الملاحظات المرتبطة بـ${topic} لدى الطفل أو المراهق، وما الذي تغيّر عن نمطه المعتاد؟`,
      'هل تظهر الملاحظات في المنزل والمدرسة ومع الأقران، أم في سياق واحد فقط؟',
      'كم مرة تحدث، وكم تستمر، وهل تغيّر تواترها أو شدتها بمرور الوقت؟',
      'ما المواقف أو المتطلبات أو التغيرات التي تسبقها عادةً، وما الذي يساعد على تهدئتها أو إدارتها؟',
      'كيف أثّرت في التعلم والحضور والنوم والأكل والعلاقات والأنشطة اليومية؟',
      'ما الذي يقوله الطفل أو المراهق عن تجربته بلغته هو، وما أكثر شيء يزعجه أو يريد تغييره؟',
      'هل توجد معلومات نمائية أو طبية أو حسية أو أدوية حالية قد يحتاج المختص إلى معرفتها؟',
      'ما الملاحظات الموضوعية التي تستطيع الأسرة أو المدرسة تقديمها، بدل الاكتفاء بأوصاف عامة مثل «كسول» أو «عنيد»؟',
      'هل حدث شيء مشابه سابقًا، وما نوع الدعم أو التقييم أو التدخل الذي جُرّب، وما الذي حدث بعده؟',
      'ما نقاط القوة والاهتمامات والأشخاص الداعمون التي يمكن البناء عليها في خطة المساندة؟',
      'هل توجد مخاوف سلامة فورية، مثل إيذاء النفس أو الآخرين، فقدان الاتصال بالواقع، إساءة أو عنف، أو عجز شديد عن العناية الأساسية؟',
      'ما السؤالان أو الثلاثة الأهم اللذان تريد الأسرة أو الشاب الحصول على إجابة واضحة عنهما في الموعد؟',
    ];
  }
  return [
    `متى بدأت الملاحظات المرتبطة بـ${topic} لديك، وهل ظهرت تدريجيًا أم بعد تغير أو حدث محدد؟`,
    'كم مرة تحدث، وكم تستمر عادةً، وهل تغير تواترها أو شدتها بمرور الوقت؟',
    'ما المواقف أو الأفكار أو العلاقات أو الظروف الجسدية التي تسبقها عادةً؟',
    'ما الذي يجعلها أشد، وما الذي يخففها مؤقتًا أو يساعدك على التعامل معها؟',
    'كيف أثّرت في النوم والأكل والطاقة والتركيز والعمل أو الدراسة والعلاقات والعناية بالنفس؟',
    'هل توجد أعراض جسدية أو أمراض مزمنة أو أدوية أو مكملات أو استخدام مواد ينبغي أن يعرفها مقدم الرعاية؟',
    'هل مررت بتجربة مشابهة من قبل، وما الذي جُرّب حينها، وما الذي كان مفيدًا أو غير مفيد؟',
    'ما أنماط الدعم المتاحة لك الآن: أشخاص موثوقون، خدمات صحية، بيئة عمل أو دراسة، أو ترتيبات عملية؟',
    'ما أكثر جانب يسبب لك ضيقًا أو تعطيلًا الآن، وما التغير الواقعي الذي تأمل أن يساعدك فيه الموعد؟',
    'ما المعلومات التي قد تنساها أثناء الموعد وتريد تدوينها مسبقًا: تسلسل زمني، أدوية، تقارير، تحاليل، أو أمثلة محددة؟',
    'هل توجد مخاوف سلامة فورية، مثل أفكار أو خطط لإيذاء النفس أو الآخرين، فقدان الاتصال بالواقع، عنف، أو عجز شديد عن العناية الأساسية؟',
    'ما السؤالان أو الثلاثة الأهم اللذان تريد الحصول على إجابة واضحة عنهما من مقدم الرعاية؟',
  ];
}
