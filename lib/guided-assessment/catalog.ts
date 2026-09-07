import topicsData from '@/data/guided-assessment/topics.v1.json';
import topicGuidanceData from '@/data/guided-assessment/topic-guidance.v1.json';

export type GuidedAssessmentAudience = 'adult' | 'child';

export type GuidedAssessmentTopic = {
  key: string;
  label: string;
  legacyLabel: string;
  group: string;
};

export type GuidedAssessmentTopicGuidance = {
  key: string;
  focusPrompts: string[];
  boundary: string;
  safety?: string;
  referenceIds: string[];
};

export type GuidedAssessmentReference = {
  id: string;
  title: string;
  url: string;
  note: string;
  authority: string;
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

const rawTopicGuidance = topicGuidanceData as {
  schema_version: number;
  profiles: GuidedAssessmentTopicGuidance[];
};

export const guidedAssessmentGuidanceSchemaVersion = rawTopicGuidance.schema_version;

const referenceCatalog: Record<string, GuidedAssessmentReference> = {
  'provider-prep': {
    id: 'provider-prep',
    title: 'NIMH: Tips for Talking With a Health Care Provider About Your Mental Health',
    url: 'https://www.nimh.nih.gov/health/publications/tips-for-talking-with-your-health-care-provider',
    note: 'التحضير للأسئلة والأدوية والملاحظات قبل الموعد يساعد على تنظيم الحوار مع مقدم الرعاية.',
    authority: 'NIMH / NIH',
  },
  'child-evaluation': {
    id: 'child-evaluation',
    title: 'NIMH: Children and Mental Health',
    url: 'https://www.nimh.nih.gov/health/publications/children-and-mental-health',
    note: 'تقييم الأطفال قد يحتاج معلومات نمائية وأسرية ومدرسية ومقابلة الطفل وفق العمر والسياق.',
    authority: 'NIMH / NIH',
  },
  mhgap: {
    id: 'mhgap',
    title: 'WHO: mhGAP guideline, third edition',
    url: 'https://www.who.int/publications/i/item/9789240084278',
    note: 'إرشاد قائم على الأدلة للتقييم والرعاية المهنية للحالات النفسية والعصبية واضطرابات استخدام المواد.',
    authority: 'World Health Organization',
  },
  anxiety: {
    id: 'anxiety',
    title: 'NIMH: Anxiety Disorders',
    url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
    note: 'يميز بين القلق العابر واضطرابات القلق التي تستمر وتؤثر في الأداء اليومي.',
    authority: 'NIMH / NIH',
  },
  depression: {
    id: 'depression',
    title: 'NIMH: Depression',
    url: 'https://www.nimh.nih.gov/health/topics/depression',
    note: 'مرجع للأعراض والأثر الوظيفي والحاجة إلى تقييم مهني بدل استنتاج التشخيص من عرض منفرد.',
    authority: 'NIMH / NIH',
  },
  ocd: {
    id: 'ocd',
    title: 'NIMH: Obsessive-Compulsive Disorder (OCD)',
    url: 'https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd',
    note: 'يوضح طبيعة الوساوس والأفعال القهرية وأن التشخيص لا يقوم على عادة أو فكرة متكررة منفردة.',
    authority: 'NIMH / NIH',
  },
  ptsd: {
    id: 'ptsd',
    title: 'NIMH: Traumatic Events and Post-Traumatic Stress Disorder (PTSD)',
    url: 'https://www.nimh.nih.gov/health/topics/post-traumatic-stress-disorder-ptsd',
    note: 'يوضح تنوع ردود الفعل بعد الصدمة وأن استمرار الأعراض وأثرها جزء من التقييم المهني.',
    authority: 'NIMH / NIH',
  },
  violence: {
    id: 'violence',
    title: 'WHO: Violence against women — intimate partner violence and controlling behaviours',
    url: 'https://www.who.int/news-room/fact-sheets/detail/violence-against-women',
    note: 'يعامل العنف والسيطرة والتهديد باعتبارها قضايا أمان وصحة، لا مجرد خلاف تواصلي متبادل.',
    authority: 'World Health Organization',
  },
  adhd: {
    id: 'adhd',
    title: 'NIMH: Attention-Deficit/Hyperactivity Disorder (ADHD)',
    url: 'https://www.nimh.nih.gov/health/topics/attention-deficit-hyperactivity-disorder-adhd',
    note: 'ADHD اضطراب نمائي؛ فهم التاريخ المبكر والظهور عبر السياقات والأثر مهم في التقييم.',
    authority: 'NIMH / NIH',
  },
  autism: {
    id: 'autism',
    title: 'NIMH: Autism Spectrum Disorder',
    url: 'https://www.nimh.nih.gov/health/topics/autism-spectrum-disorders-asd',
    note: 'مرجع للتاريخ النمائي والتواصل والسلوكيات والاحتياجات الفردية دون اختزال الشخص في سمة واحدة.',
    authority: 'NIMH / NIH',
  },
  sleep: {
    id: 'sleep',
    title: 'NHLBI: Sleep Deprivation and Deficiency — Diagnosis',
    url: 'https://www.nhlbi.nih.gov/health/sleep-deprivation/diagnosis-treatment',
    note: 'يركز على وصف نمط النوم والنعاس والشخير والأثر النهاري والمعلومات التي تساعد الطبيب على التقييم.',
    authority: 'NHLBI / NIH',
  },
  eating: {
    id: 'eating',
    title: 'NIMH: Eating Disorders',
    url: 'https://www.nimh.nih.gov/health/topics/eating-disorders',
    note: 'اضطرابات الأكل حالات صحية جادة؛ فقدان السيطرة والسلوك التعويضي والتدهور الصحي تستحق تقييمًا متخصصًا.',
    authority: 'NIMH / NIH',
  },
  substance: {
    id: 'substance',
    title: 'NIDA: Drugs, Brains, and Behavior — The Science of Addiction',
    url: 'https://nida.nih.gov/publications/drugs-brains-behavior-science-addiction',
    note: 'يعرض اضطرابات استخدام المواد كحالات صحية تستلزم فهم السيطرة والضرر والمخاطر والعلاج.',
    authority: 'NIDA / NIH',
  },
  'addictive-behaviours': {
    id: 'addictive-behaviours',
    title: 'WHO: Gaming disorder',
    url: 'https://www.who.int/standards/classifications/frequently-asked-questions/gaming-disorder',
    note: 'يميز بين الاستخدام أو اللعب المرتفع وبين نمط فقدان السيطرة والأثر الوظيفي المستمر.',
    authority: 'World Health Organization',
  },
  bullying: {
    id: 'bullying',
    title: 'StopBullying.gov: Warning Signs for Bullying',
    url: 'https://www.stopbullying.gov/bullying/warning-signs',
    note: 'التغيرات السلوكية قد تكون إشارات تحتاج حوارًا مباشرًا، ولا يبلغ كل طفل عما يحدث تلقائيًا.',
    authority: 'U.S. Department of Health and Human Services',
  },
  parenting: {
    id: 'parenting',
    title: 'CDC: Positive Parenting Tips',
    url: 'https://www.cdc.gov/child-development/positive-parenting-tips/index.html',
    note: 'إرشادات نمائية حسب العمر لدعم الطفل مع التركيز على الأمان والنمو والاستقلال التدريجي.',
    authority: 'CDC',
  },
  psychotherapy: {
    id: 'psychotherapy',
    title: 'NIMH: Psychotherapies',
    url: 'https://www.nimh.nih.gov/health/topics/psychotherapies',
    note: 'اختيار العلاج يعتمد على الاحتياج والحالة والدليل والتفضيلات، مع أسئلة واضحة عن الأهداف والتقدم والخصوصية.',
    authority: 'NIMH / NIH',
  },
};

export const guidedAssessmentReferences = [
  referenceCatalog['provider-prep'],
  referenceCatalog['child-evaluation'],
  referenceCatalog.mhgap,
] as const;

export const guidedAssessmentLegacySlugs = Array.from({ length: guidedAssessmentTopics.length * 2 }, (_, index) =>
  `questions-${String(index + 1).padStart(3, '0')}`,
);

function cleanGuidanceText(value: string) {
  return value.replace('ل blame', 'لإلقاء اللوم');
}

export function getTopicGuidance(topicKey: string): GuidedAssessmentTopicGuidance | null {
  const profile = rawTopicGuidance.profiles.find((item) => item.key === topicKey);
  if (!profile) return null;
  return {
    ...profile,
    focusPrompts: profile.focusPrompts.map(cleanGuidanceText),
    boundary: cleanGuidanceText(profile.boundary),
    safety: profile.safety ? cleanGuidanceText(profile.safety) : undefined,
  };
}

export function getTopicReferences(topicKey: string): GuidedAssessmentReference[] {
  const profile = getTopicGuidance(topicKey);
  if (!profile) return [...guidedAssessmentReferences];
  const topicReferences = profile.referenceIds
    .map((id) => referenceCatalog[id])
    .filter((reference): reference is GuidedAssessmentReference => Boolean(reference));
  const merged = [...topicReferences, referenceCatalog['provider-prep']];
  return Array.from(new Map(merged.map((reference) => [reference.id, reference])).values());
}

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
