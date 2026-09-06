export type AttentionTaskType =
  | 'selective-search'
  | 'sustained-trail'
  | 'distractor-grid'
  | 'visual-scan'
  | 'hidden-targets'
  | 'rule-switching'
  | 'processing-speed'
  | 'dual-attention';

export type AttentionActivityKind = 'training-a' | 'training-b' | 'test';

export type AttentionSeriesPlan = {
  number: number;
  slug: string;
  title: string;
  ages: string;
  duration: string;
  taskType: AttentionTaskType;
  purpose: string;
  target: string;
  trainingA: string;
  trainingB: string;
  testInstruction: string;
  progression: string[];
};

export type AttentionActivity = {
  slug: string;
  seriesSlug: string;
  seriesNumber: number;
  seriesTitle: string;
  taskType: AttentionTaskType;
  level: number;
  kind: AttentionActivityKind;
  label: string;
  title: string;
  age: string;
  duration: string;
  purpose: string;
  instruction: string;
  progression: string;
  mastery: string;
  seed: number;
  variant: number;
};

export const attentionSeriesPlans: AttentionSeriesPlan[] = [
  {
    number: 1,
    slug: 'visual-selective-attention',
    title: 'الانتباه الانتقائي البصري',
    ages: '4-10 سنوات',
    duration: '3-6 دقائق',
    taskType: 'selective-search',
    purpose: 'تدريب الطفل على اختيار هدف بصري محدد وتجاهل عناصر أخرى غير مطلوبة.',
    target: 'السمكة الزرقاء',
    trainingA: 'ابحث عن الهدف الموضح أعلى الورقة، وضع دائرة حول كل هدف تجده.',
    trainingB: 'ابحث بهدوء من سطر إلى سطر، ولا تضع دائرة إلا حول الهدف المطلوب.',
    testInstruction: 'اعثر على جميع الأهداف المطلوبة دون مساعدة أو تلميحات إضافية.',
    progression: [
      'أهداف كبيرة ومشتتات قليلة وواضحة.',
      'زيادة عدد المشتتات مع بقاء الاختلافات واضحة.',
      'مشتتات أقرب إلى الهدف في اللون أو الشكل.',
      'هدف مركب يحتاج ملاحظة اللون والشكل معًا.',
      'مساحة أكثر كثافة مع هدف نادر ومشتتات متشابهة جدًا.',
    ],
  },
  {
    number: 2,
    slug: 'sustained-attention',
    title: 'الانتباه المستمر',
    ages: '4-10 سنوات',
    duration: '4-8 دقائق',
    taskType: 'sustained-trail',
    purpose: 'دعم القدرة على البقاء مع مهمة واحدة لفترة أطول مع المحافظة على قاعدة بسيطة حتى النهاية.',
    target: 'الزهرة الصفراء',
    trainingA: 'تتبع طريق النحلة حتى النهاية، وضع علامة على كل زهرة صفراء تمر بها.',
    trainingB: 'اتبع الطريق كاملًا دون القفز إلى النهاية، ولا تنسَ عدّ الأهداف التي تراها.',
    testInstruction: 'أكمل الطريق من البداية للنهاية وسجّل كل هدف مطلوب دون تذكير أثناء المهمة.',
    progression: [
      'طريق قصير وأهداف قليلة وواضحة.',
      'طريق أطول مع منعطفات أكثر.',
      'إضافة عناصر جذابة حول الطريق لا يجب أن تقطع المهمة.',
      'مسار طويل مع أهداف متباعدة وغير منتظمة.',
      'مسار كثيف يحتاج استمرارًا ودقة حتى النهاية.',
    ],
  },
  {
    number: 3,
    slug: 'distractor-resistance',
    title: 'مقاومة المشتتات',
    ages: '5-12 سنة',
    duration: '3-6 دقائق',
    taskType: 'distractor-grid',
    purpose: 'تدريب اختيار الهدف المطلوب رغم وجود عناصر جذابة أو متشابهة تحاول سحب الانتباه بعيدًا عنه.',
    target: 'النجمة',
    trainingA: 'ضع دائرة حول النجوم فقط، واترك القلوب والدوائر والأشكال الأخرى كما هي.',
    trainingB: 'اعمل صفًا بعد صف، وإذا رأيت شكلًا يشبه الهدف فتأكد قبل أن تضع العلامة.',
    testInstruction: 'اختر الأهداف الصحيحة فقط وحاول تقليل العلامات على المشتتات.',
    progression: [
      'مشتتات مختلفة بوضوح عن الهدف.',
      'زيادة عدد المشتتات وتنوع ألوانها.',
      'إضافة مشتتات لها لون الهدف نفسه.',
      'مشتتات قريبة من شكل الهدف وحجمه.',
      'شبكة كثيفة مع أهداف قليلة ومشتتات شديدة التشابه.',
    ],
  },
  {
    number: 4,
    slug: 'visual-scanning',
    title: 'المسح البصري المنظم',
    ages: '5-12 سنة',
    duration: '4-7 دقائق',
    taskType: 'visual-scan',
    purpose: 'تعليم نمط بحث بصري منظم يساعد الطفل على تغطية كامل المساحة دون فقد صفوف أو العودة العشوائية.',
    target: 'الرمز المستهدف',
    trainingA: 'ابدأ من جهة السهم وامسح كل صف حتى نهايته قبل الانتقال للصف التالي.',
    trainingB: 'استخدم إصبعك كدليل بصري، وتأكد أنك أكملت الصف كاملًا قبل النزول.',
    testInstruction: 'امسح جميع الصفوف بترتيب ثابت وحدد الأهداف دون تخطي أي صف.',
    progression: [
      'صفوف قصيرة مع هدف واضح في كل صف.',
      'زيادة طول الصفوف وعددها.',
      'أهداف في أماكن مختلفة داخل الصفوف.',
      'صفوف أطول ورموز أكثر تشابهًا.',
      'شبكة منظمة كثيفة تحتاج مسحًا كاملًا ودقيقًا.',
    ],
  },
  {
    number: 5,
    slug: 'target-search',
    title: 'البحث عن الهدف',
    ages: '4-10 سنوات',
    duration: '4-8 دقائق',
    taskType: 'hidden-targets',
    purpose: 'تدريب البحث عن عنصر محدد داخل مشهد غني بالمعلومات مع المحافظة على استراتيجية بحث وعدم الاعتماد على التخمين.',
    target: 'القطة الصغيرة',
    trainingA: 'ابحث في الحديقة عن القطط الصغيرة المخفية، وعلّم على كل قطة تجدها.',
    trainingB: 'قسّم المشهد بعينيك إلى أجزاء صغيرة وابحث في كل جزء قبل الانتقال للجزء التالي.',
    testInstruction: 'اعثر على جميع الأهداف المخفية في المشهد دون معرفة أماكنها مسبقًا.',
    progression: [
      'مشهد بسيط وأهداف كبيرة وغير مغطاة.',
      'زيادة العناصر المحيطة مع أهداف أصغر.',
      'بعض الأهداف تظهر جزئيًا خلف عناصر المشهد.',
      'أهداف صغيرة موزعة في مناطق متعددة.',
      'مشهد غني يحتاج بحثًا منظمًا وتدقيقًا في التفاصيل.',
    ],
  },
  {
    number: 6,
    slug: 'attention-rule-switching',
    title: 'تبديل قاعدة الانتباه',
    ages: '6-12 سنة',
    duration: '4-8 دقائق',
    taskType: 'rule-switching',
    purpose: 'تدريب الطفل على تغيير ما يبحث عنه عندما تتغير القاعدة بدل الاستمرار تلقائيًا على القاعدة السابقة.',
    target: 'قاعدة اللون أو الشكل',
    trainingA: 'اقرأ قاعدة كل جزء ثم نفذها فقط داخل ذلك الجزء من الصفحة.',
    trainingB: 'قبل كل صف قل القاعدة بصوت منخفض، ثم ابحث وفقها ولا تستخدم قاعدة الصف السابق.',
    testInstruction: 'غيّر قاعدة البحث عند الانتقال بين الأجزاء دون تذكير إضافي.',
    progression: [
      'قاعدتان واضحتان في جزأين منفصلين.',
      'ثلاثة أجزاء مع تبديل متكرر بين لون وشكل.',
      'قواعد أقصر ووقت أقل للتوقف بين الأجزاء.',
      'تبديل القاعدة داخل الصفحة أكثر من مرة مع مشتتات متشابهة.',
      'قواعد مركبة وتبديل متكرر يحتاج مرونة وانتباهًا للتعليمات.',
    ],
  },
  {
    number: 7,
    slug: 'visual-processing-speed',
    title: 'سرعة المعالجة البصرية',
    ages: '6-12 سنة',
    duration: '2-5 دقائق',
    taskType: 'processing-speed',
    purpose: 'تدريب السرعة في فحص معلومات بصرية بسيطة مع الحفاظ على الدقة وعدم التضحية بصحة الإجابة من أجل السرعة.',
    target: 'الشكل المستهدف',
    trainingA: 'اعثر على أكبر عدد ممكن من الأهداف الصحيحة، لكن لا تسرع لدرجة تزيد معها الأخطاء.',
    trainingB: 'ابدأ بإيقاع ثابت ثم حاول تحسين سرعتك مع بقاء الدقة جيدة.',
    testInstruction: 'اعمل خلال الزمن المحدد وسجّل عدد الأهداف الصحيحة وعدد الأخطاء.',
    progression: [
      'شبكة صغيرة ورموز كبيرة مع وقت مريح.',
      'شبكة أكبر وعدد أهداف أكثر.',
      'رموز أصغر ومشتتات أكثر تشابهًا.',
      'زيادة الكثافة وتقليل الزمن المقترح.',
      'شبكة كثيفة تتطلب توازنًا واضحًا بين السرعة والدقة.',
    ],
  },
  {
    number: 8,
    slug: 'dual-attention',
    title: 'الانتباه المزدوج',
    ages: '7-12 سنة',
    duration: '4-8 دقائق',
    taskType: 'dual-attention',
    purpose: 'تدريب تنفيذ مهمة بصرية أساسية مع متابعة معلومة ثانية بسيطة في الوقت نفسه دون فقد الهدف الرئيسي.',
    target: 'المسار والنجوم',
    trainingA: 'تتبع المسار حتى النهاية، وفي الوقت نفسه عدّ النجوم الموجودة على الطريق.',
    trainingB: 'لا تتوقف عن التتبع عندما ترى النجمة؛ تابع المسار وسجّل العدد النهائي في الأسفل.',
    testInstruction: 'أكمل المسار كاملًا وسجّل العدد الصحيح للأهداف الثانوية دون مساعدة.',
    progression: [
      'مسار قصير وعدد قليل من الأهداف الثانوية.',
      'مسار أطول مع أهداف موزعة بوضوح.',
      'إضافة رموز غير مطلوبة قرب الطريق.',
      'مسار أكثر تعرجًا مع أهداف صغيرة ومتباعدة.',
      'مهمة طويلة نسبيًا تحتاج المحافظة على التتبع والعد معًا.',
    ],
  },
];

const labels: Record<AttentionActivityKind, string> = {
  'training-a': 'تدريب أ',
  'training-b': 'تدريب ب',
  test: 'اختبار المستوى',
};

const variantTitles: Record<AttentionActivityKind, string[]> = {
  'training-a': ['بداية واضحة', 'خطوة أطول', 'تركيز أدق', 'تحدٍّ منظم', 'المهمة الكبرى'],
  'training-b': ['جولة ثانية', 'تدريب التثبيت', 'تفاصيل أكثر', 'استقلال أكبر', 'اللمسة الأخيرة'],
  test: ['اختبار البداية', 'اختبار المستوى الثاني', 'اختبار المستوى الثالث', 'اختبار المستوى الرابع', 'اختبار الإتقان'],
};

function masteryFor(series: AttentionSeriesPlan, level: number, kind: AttentionActivityKind) {
  if (kind !== 'test') {
    return `راقب الدقة، الاستمرار على القاعدة، والحاجة إلى التلميح. مستوى ${level}: ${series.progression[level - 1]}`;
  }
  const threshold = level <= 2 ? '80%' : level <= 4 ? '85%' : '90%';
  return `يُعد الأداء مناسبًا للانتقال عندما ينجز الطفل قرابة ${threshold} من المطلوب بدقة، مع تلميحات قليلة أو دون تلميح، ودون انهيار واضح في الاستراتيجية. هذا معيار إتقان للمهمة وليس تشخيصًا.`;
}

function instructionFor(series: AttentionSeriesPlan, kind: AttentionActivityKind) {
  if (kind === 'training-a') return series.trainingA;
  if (kind === 'training-b') return series.trainingB;
  return series.testInstruction;
}

export const attentionActivities: AttentionActivity[] = attentionSeriesPlans.flatMap((series) =>
  Array.from({ length: 5 }, (_, index) => index + 1).flatMap((level) =>
    (['training-a', 'training-b', 'test'] as AttentionActivityKind[]).map((kind, variant) => ({
      slug: `level-${level}-${kind}`,
      seriesSlug: series.slug,
      seriesNumber: series.number,
      seriesTitle: series.title,
      taskType: series.taskType,
      level,
      kind,
      label: kind === 'test' ? `اختبار المستوى ${level}` : labels[kind],
      title: variantTitles[kind][level - 1],
      age: series.ages,
      duration: series.duration,
      purpose: series.purpose,
      instruction: instructionFor(series, kind),
      progression: series.progression[level - 1],
      mastery: masteryFor(series, level, kind),
      seed: series.number * 1000 + level * 100 + variant * 17 + 11,
      variant,
    })),
  ),
);

export function getAttentionSeries(slug: string) {
  return attentionSeriesPlans.find((series) => series.slug === slug) ?? null;
}

export function getAttentionActivitiesForSeries(slug: string) {
  return attentionActivities.filter((activity) => activity.seriesSlug === slug);
}

export function getAttentionActivity(seriesSlug: string, activitySlug: string) {
  return attentionActivities.find((activity) => activity.seriesSlug === seriesSlug && activity.slug === activitySlug) ?? null;
}

export const attentionActivityCount = attentionActivities.length;
