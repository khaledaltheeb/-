export type VisualMotorTaskType =
  | 'path-tracing'
  | 'maze'
  | 'dot-to-dot'
  | 'shape-copying'
  | 'grid-copying'
  | 'eye-hand-accuracy';

export type VisualMotorActivityKind = 'training-a' | 'training-b' | 'test';

export type VisualMotorSeriesPlan = {
  number: number;
  slug: string;
  title: string;
  ages: string;
  duration: string;
  taskType: VisualMotorTaskType;
  purpose: string;
  trainingA: string;
  trainingB: string;
  testInstruction: string;
  observation: string;
  progression: string[];
};

export type VisualMotorActivity = {
  slug: string;
  seriesSlug: string;
  seriesNumber: number;
  seriesTitle: string;
  taskType: VisualMotorTaskType;
  level: number;
  kind: VisualMotorActivityKind;
  label: string;
  title: string;
  age: string;
  duration: string;
  purpose: string;
  instruction: string;
  progression: string;
  observation: string;
  mastery: string;
  seed: number;
  variant: number;
};

export const visualMotorSeriesPlans: VisualMotorSeriesPlan[] = [
  {
    number: 31,
    slug: 'path-tracing',
    title: 'تتبع المسارات',
    ages: '3-9 سنوات',
    duration: '3-7 دقائق',
    taskType: 'path-tracing',
    purpose: 'تدريب تنسيق حركة القلم مع المعلومات البصرية عبر البقاء داخل ممر يتغير عرضه وانحناؤه تدريجيًا.',
    trainingA: 'ابدأ من علامة البداية واتبع الممر ببطء حتى النهاية دون لمس الحواف قدر الإمكان.',
    trainingB: 'جرّب مسارًا جديدًا، وركز على النظر قليلًا أمام رأس القلم بدل متابعة النقطة الحالية فقط.',
    testInstruction: 'أكمل المسار الجديد دون تلميحات إضافية، وسجل الخروج من الممر ورفع القلم عند الحاجة.',
    observation: 'عدد مرات الخروج من الممر، رفع القلم، التوقفات الطويلة، وجود تخطيط بصري أمام رأس القلم، وإكمال المسار.',
    progression: [
      'ممر عريض مع انحناءات قليلة وواضحة.',
      'ممر أضيق ومسار أطول مع تغيرات اتجاه أكثر.',
      'انحناءات متتابعة وممر متوسط العرض.',
      'ممر أضيق مع انعطافات أقرب وتغيرات اتجاه أسرع.',
      'ممر دقيق نسبيًا وطويل مع منحنيات مركبة، دون تضييق غير مناسب لعمر الطفل.',
    ],
  },
  {
    number: 32,
    slug: 'mazes',
    title: 'المتاهات',
    ages: '4-10 سنوات',
    duration: '4-8 دقائق',
    taskType: 'maze',
    purpose: 'دمج التخطيط البصري والتحكم بالقلم عبر اختيار طريق صالح داخل شبكة متاهة ثم تنفيذه دون عبور الجدران.',
    trainingA: 'ابحث بعينيك عن الطريق قبل أن تبدأ، ثم تحرك بالقلم من البداية إلى الهدف دون عبور الجدران.',
    trainingB: 'توقف عند كل قرار، افحص الممرات المتاحة، ثم اختر قبل أن تحرك القلم.',
    testInstruction: 'حل متاهة جديدة مضمونة الحل دون تلميح للطريق الصحيح.',
    observation: 'عبور الجدران، الدخول في طرق مسدودة، الرجوع المنظم، التخطيط قبل الحركة، وإكمال الطريق.',
    progression: [
      'شبكة صغيرة بممرات قصيرة وعدد قرارات محدود.',
      'شبكة أكبر مع طرق مسدودة إضافية.',
      'زيادة عدد التقاطعات وطول الطريق الصحيح.',
      'شبكة أكثر كثافة مع قرارات متقاربة.',
      'متاهة كبيرة نسبيًا بمسار صحيح أطول، مع الحفاظ على سماكة جدران واضحة للطباعة.',
    ],
  },
  {
    number: 33,
    slug: 'dot-to-dot',
    title: 'وصل النقاط',
    ages: '4-9 سنوات',
    duration: '4-8 دقائق',
    taskType: 'dot-to-dot',
    purpose: 'تدريب الانتقال البصري الحركي المنظم بين أهداف مرقمة مع المحافظة على التسلسل ودقة الوصول إلى النقطة التالية.',
    trainingA: 'ابدأ من 1 ثم صِل النقاط بالترتيب حتى يظهر الشكل، وحاول أن يصل الخط إلى مركز كل نقطة.',
    trainingB: 'ابحث عن الرقم التالي بعينيك أولًا، ثم حرّك القلم إليه بخط واحد قدر الإمكان.',
    testInstruction: 'أكمل شبكة نقاط جديدة بالترتيب دون أسهم أو خطوط إرشادية.',
    observation: 'أخطاء التسلسل، تجاوز النقاط، دقة الوصول إلى مركز النقطة، رفع القلم، واستمرارية الخط.',
    progression: [
      'عدد قليل من النقاط متباعدة بوضوح.',
      'زيادة عدد النقاط وتنوع اتجاهات الخط.',
      'مسافات أقصر وبعض التحولات الزاوية.',
      'شكل أطول مع نقاط أكثر وتقارب أكبر.',
      'تسلسل كثيف نسبيًا يحتاج مسحًا بصريًا دقيقًا مع أرقام مقروءة.',
    ],
  },
  {
    number: 34,
    slug: 'shape-copying',
    title: 'نسخ الأشكال',
    ages: '4-10 سنوات',
    duration: '4-8 دقائق',
    taskType: 'shape-copying',
    purpose: 'تدريب تحويل نموذج بصري إلى إنتاج حركي منظم مع المحافظة على العلاقات بين الخطوط والزوايا والأجزاء.',
    trainingA: 'شاهد النموذج ثم انسخه في المساحة المجاورة. استخدم نقاط الارتكاز الصغيرة إن ظهرت في التدريب.',
    trainingB: 'قسّم الشكل إلى أجزاء بسيطة، انسخ الجزء الأكبر أولًا ثم أضف التفاصيل.',
    testInstruction: 'انسخ نموذجًا جديدًا دون نقاط ارتكاز أو خطوط مساعدة داخل مساحة الاستجابة.',
    observation: 'اكتمال الأجزاء، العلاقات المكانية، اتجاه الخطوط، إغلاق الأشكال، النسب التقريبية، وعدد مرات الرجوع للنموذج.',
    progression: [
      'أشكال بسيطة من خطين إلى ثلاثة خطوط أو شكل هندسي واحد.',
      'تركيب شكلين بسيطين مع اتجاهات مختلفة.',
      'نموذج متعدد الخطوط مع تقاطعات أو جزء داخلي.',
      'تركيب أكثر تعقيدًا يحتاج المحافظة على مواضع الأجزاء بالنسبة لبعضها.',
      'نموذج مركب بعدة عناصر داخلية وخارجية مع تقليل المساعدات البصرية.',
    ],
  },
  {
    number: 35,
    slug: 'grid-copying',
    title: 'النسخ على الشبكة',
    ages: '6-12 سنة',
    duration: '5-10 دقائق',
    taskType: 'grid-copying',
    purpose: 'تدريب المطابقة بين الخلايا ونقل نمط بصري من شبكة إلى أخرى مع ضبط المكان والاتجاه والمقياس.',
    trainingA: 'انقل العلامات من شبكة النموذج إلى الخلايا المناظرة في الشبكة الفارغة، صفًا بعد صف.',
    trainingB: 'استخدم الصف والعمود كمرجع، وراجع كل صف بعد نسخه قبل الانتقال للصف التالي.',
    testInstruction: 'انسخ نمطًا جديدًا إلى شبكة فارغة دون إرشادات إضافية.',
    observation: 'أخطاء الصف/العمود، الإزاحة بخانة واحدة، نسيان عناصر، تبديل نوع الرمز، واستراتيجية المسح المنظم.',
    progression: [
      'شبكة 4×4 بنمط قليل العناصر.',
      'شبكة 5×5 مع عناصر أكثر وتوزيع متباعد.',
      'شبكة 5×5 بنمط أكثر كثافة وعلاقات قطرية.',
      'شبكة 6×6 مع نوعين من العلامات.',
      'شبكة 7×7 مع نمط أكثر تعقيدًا ونوعين من العلامات مع بقاء الخلايا قابلة للرؤية والطباعة.',
    ],
  },
  {
    number: 36,
    slug: 'eye-hand-accuracy',
    title: 'دقة العين واليد',
    ages: '4-10 سنوات',
    duration: '4-8 دقائق',
    taskType: 'eye-hand-accuracy',
    purpose: 'تدريب توجيه حركة اليد نحو هدف بصري عبر مساحة تحتوي عوائق، مع اختيار مسار آمن والمحافظة على الدقة.',
    trainingA: 'صِل كل رمز بمثيله في الجهة الأخرى دون لمس العوائق. ابحث عن ممر آمن قبل أن تبدأ.',
    trainingB: 'حرّك القلم بإيقاع ثابت، وانظر أمام رأس القلم لتتفادى العوائق بدل التصحيح بعد لمسها.',
    testInstruction: 'صِل الأزواج الجديدة دون لمس العوائق أو تقاطع خطوطك قدر الإمكان.',
    observation: 'لمس العوائق، تقاطع الخطوط، دقة الوصول إلى الهدف، رفع القلم، التخطيط قبل الحركة، وإكمال جميع الأزواج.',
    progression: [
      'زوجان ومساحات واسعة مع عوائق قليلة.',
      'ثلاثة أزواج وعوائق أكثر مع ممرات واسعة.',
      'ثلاثة أزواج مع ممرات أقل مباشرة.',
      'أربعة أزواج وعوائق متقاربة تتطلب تخطيطًا أوضح.',
      'أربعة أزواج ومساحة أكثر كثافة مع الحفاظ على ممر صالح لكل زوج.',
    ],
  },
];

const kindInfo: Record<VisualMotorActivityKind, { slug: string; label: string; variant: number }> = {
  'training-a': { slug: 'training-a', label: 'تدريب أ', variant: 1 },
  'training-b': { slug: 'training-b', label: 'تدريب ب', variant: 2 },
  test: { slug: 'test', label: 'اختبار الإتقان', variant: 3 },
};

function masteryFor(series: VisualMotorSeriesPlan, level: number) {
  return `إكمال المهمة بدقة مستقرة مناسبة للمستوى ${level} مع تلميحات قليلة، وتقليل الأخطاء النوعية التي نراقبها في هذه السلسلة. يفضل تأكيد الأداء في محاولة أخرى قبل التصعيد.`;
}

export const visualMotorActivities: VisualMotorActivity[] = visualMotorSeriesPlans.flatMap((series) =>
  Array.from({ length: 5 }, (_, index) => index + 1).flatMap((level) =>
    (['training-a', 'training-b', 'test'] as VisualMotorActivityKind[]).map((kind) => {
      const info = kindInfo[kind];
      const instruction = kind === 'training-a' ? series.trainingA : kind === 'training-b' ? series.trainingB : series.testInstruction;
      return {
        slug: `level-${level}-${info.slug}`,
        seriesSlug: series.slug,
        seriesNumber: series.number,
        seriesTitle: series.title,
        taskType: series.taskType,
        level,
        kind,
        label: `${info.label} - المستوى ${level}`,
        title: `${series.title} - ${info.label} - المستوى ${level}`,
        age: series.ages,
        duration: series.duration,
        purpose: series.purpose,
        instruction,
        progression: series.progression[level - 1],
        observation: series.observation,
        mastery: masteryFor(series, level),
        seed: series.number * 1000 + level * 100 + info.variant * 17,
        variant: info.variant,
      } satisfies VisualMotorActivity;
    }),
  ),
);

export const visualMotorActivityCount = visualMotorActivities.length;
export const visualMotorTestCount = visualMotorActivities.filter((item) => item.kind === 'test').length;

export function getVisualMotorSeries(slug: string) {
  return visualMotorSeriesPlans.find((series) => series.slug === slug);
}

export function getVisualMotorActivitiesForSeries(seriesSlug: string) {
  return visualMotorActivities.filter((activity) => activity.seriesSlug === seriesSlug);
}

export function getVisualMotorActivity(seriesSlug: string, activitySlug: string) {
  return visualMotorActivities.find((activity) => activity.seriesSlug === seriesSlug && activity.slug === activitySlug);
}
