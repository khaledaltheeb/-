export type VisualPerceptionTaskType =
  | 'visual-discrimination'
  | 'figure-ground'
  | 'visual-closure'
  | 'spatial-relations'
  | 'form-constancy'
  | 'mental-rotation'
  | 'part-whole';

export type VisualPerceptionActivityKind = 'training-a' | 'training-b' | 'test';

export type VisualPerceptionSeriesPlan = {
  number: number;
  slug: string;
  title: string;
  ages: string;
  duration: string;
  taskType: VisualPerceptionTaskType;
  purpose: string;
  trainingA: string;
  trainingB: string;
  testInstruction: string;
  progression: string[];
  metric: string;
  supportTip: string;
};

export type VisualPerceptionActivity = {
  slug: string;
  seriesSlug: string;
  seriesNumber: number;
  seriesTitle: string;
  taskType: VisualPerceptionTaskType;
  level: number;
  kind: VisualPerceptionActivityKind;
  label: string;
  title: string;
  age: string;
  duration: string;
  purpose: string;
  instruction: string;
  progression: string;
  mastery: string;
  metric: string;
  supportTip: string;
  seed: number;
  variant: number;
};

export const visualPerceptionSeriesPlans: VisualPerceptionSeriesPlan[] = [
  {
    number: 24,
    slug: 'visual-discrimination',
    title: 'التمييز البصري',
    ages: '3-9 سنوات',
    duration: '3-6 دقائق',
    taskType: 'visual-discrimination',
    purpose: 'تدريب ملاحظة الفروق الدقيقة بين أشكال متشابهة في اللون أو الاتجاه أو الحجم أو تفصيل صغير، دون تحويل المهمة إلى اختبار نظر.',
    trainingA: 'ابحث عن الشكل المختلف في كل مجموعة وحدده بدائرة.',
    trainingB: 'قارن بهدوء بين الأشكال: اللون، الاتجاه، الحجم والتفاصيل الصغيرة، ثم اختر المختلف.',
    testInstruction: 'حدد الشكل المختلف في كل مجموعة دون تلميحات إضافية.',
    progression: [
      'فروق واضحة في اللون أو الحجم داخل مجموعات صغيرة.',
      'فروق في الاتجاه أو تفصيل واحد واضح.',
      'أشكال أكثر تشابهًا وفروق أصغر.',
      'تغير سمة واحدة فقط داخل مجموعات أكبر.',
      'فروق دقيقة جدًا بين أشكال عالية التشابه مع مشتتات إضافية.',
    ],
    metric: 'الدقة، عدد الاختيارات الخاطئة، وهل يقارن الطفل قبل الاستجابة أم يجيب اندفاعيًا.',
    supportTip: 'إذا كثرت الأخطاء، قلل عدد الخيارات أو كبّر المسافة بين الأشكال بدل إعطاء الإجابة.',
  },
  {
    number: 25,
    slug: 'figure-ground',
    title: 'الشكل والخلفية',
    ages: '4-10 سنوات',
    duration: '4-8 دقائق',
    taskType: 'figure-ground',
    purpose: 'تدريب العثور على هدف بصري داخل خلفية غنية أو متداخلة مع المحافظة على استراتيجية بحث منظمة.',
    trainingA: 'اعثر على الأهداف المطلوبة داخل المشهد المزدحم وضع دائرة حولها.',
    trainingB: 'قسّم الصفحة بعينيك إلى مناطق صغيرة وابحث في كل منطقة قبل الانتقال إلى التالية.',
    testInstruction: 'اعثر على جميع الأهداف داخل المشهد دون معرفة أماكنها مسبقًا.',
    progression: [
      'خلفية بسيطة وأهداف كبيرة قليلة.',
      'زيادة العناصر المحيطة مع بقاء الهدف واضحًا.',
      'تداخل جزئي بين الهدف والخلفية.',
      'أهداف أصغر مع تراكب وعناصر متشابهة.',
      'مشهد كثيف مع أهداف نادرة ومموهة جزئيًا داخل الخلفية.',
    ],
    metric: 'عدد الأهداف الصحيحة، الأهداف المفقودة، العلامات على المشتتات، ونمط المسح البصري.',
    supportTip: 'استخدم نافذة ورقية تكشف جزءًا واحدًا من الصفحة عند الحاجة، ثم وسّع مجال البحث تدريجيًا.',
  },
  {
    number: 26,
    slug: 'visual-closure',
    title: 'الإغلاق البصري',
    ages: '4-10 سنوات',
    duration: '3-7 دقائق',
    taskType: 'visual-closure',
    purpose: 'تدريب التعرف إلى شكل كامل من معلومات بصرية ناقصة، مع تقليل مقدار الجزء الظاهر تدريجيًا.',
    trainingA: 'انظر إلى الجزء الظاهر من الشكل واختر الصورة الكاملة التي يمكن أن تكون هي نفسها.',
    trainingB: 'ركز على الزوايا والمنحنيات والعلاقات بين الأجزاء بدل تخمين الشكل من لون واحد.',
    testInstruction: 'اختر الشكل الكامل المطابق لكل نموذج ناقص دون مساعدة.',
    progression: [
      'جزء كبير ظاهر وخيارات شديدة الاختلاف.',
      'نحو ثلثي الشكل ظاهر مع مشتتات أكثر.',
      'نصف الشكل تقريبًا ظاهر.',
      'أجزاء منفصلة قليلة مع خيارات متشابهة.',
      'معلومات بصرية محدودة جدًا تتطلب دمج عدة قرائن صغيرة.',
    ],
    metric: 'عدد المطابقات الصحيحة، زمن القرار، وهل يستخدم الطفل عدة قرائن أم يعتمد على سمة واحدة.',
    supportTip: 'إذا كان التخمين مرتفعًا، اطلب من الطفل وصف ما يراه قبل الاختيار بدل كشف مزيد من الشكل مباشرة.',
  },
  {
    number: 27,
    slug: 'spatial-relations',
    title: 'العلاقات المكانية',
    ages: '3-9 سنوات',
    duration: '3-7 دقائق',
    taskType: 'spatial-relations',
    purpose: 'تدريب فهم العلاقات مثل فوق/تحت/داخل/خارج/يمين/يسار وبين، عبر مشاهد بصرية واضحة ومتدرجة.',
    trainingA: 'اقرأ العلاقة المطلوبة ثم اختر المشهد الذي يحققها.',
    trainingB: 'سمِّ موضع كل عنصر بالنسبة للعنصر المرجعي قبل أن تختار الإجابة.',
    testInstruction: 'اختر المشهد الصحيح لكل علاقة مكانية دون تلميح.',
    progression: [
      'داخل/خارج وفوق/تحت بأشكال كبيرة.',
      'يمين/يسار مع مرجع ثابت وواضح.',
      'بين/بجوار/أقرب إلى مع أكثر من عنصر.',
      'علاقات مزدوجة مثل فوق ويمين في الوقت نفسه.',
      'علاقات مركبة داخل مشاهد متعددة العناصر مع تغيير المرجع.',
    ],
    metric: 'الدقة لكل نوع علاقة، الأخطاء المتكررة في جهة محددة، وقدرة الطفل على تسمية المرجع أولًا.',
    supportTip: 'ثبت نقطة المرجع وقلل عدد العناصر إذا حدث ارتباك؛ لا تفترض أن خطأ اليمين/اليسار يعني مشكلة بصرية وحدها.',
  },
  {
    number: 28,
    slug: 'form-constancy',
    title: 'ثبات الشكل',
    ages: '5-11 سنة',
    duration: '4-7 دقائق',
    taskType: 'form-constancy',
    purpose: 'تدريب التعرف إلى هوية الشكل رغم تغير حجمه أو اتجاهه أو لونه أو موقعه، مع تمييزه عن أشكال قريبة ولكن مختلفة بنيويًا.',
    trainingA: 'اعثر على كل الأشكال التي تنتمي إلى الشكل المرجعي حتى لو تغيّر الحجم أو الاتجاه أو اللون.',
    trainingB: 'ابحث عن البنية نفسها، ولا تعتمد على اللون أو الحجم وحدهما.',
    testInstruction: 'حدد جميع النسخ الصحيحة للشكل المرجعي بين مشتتات مشابهة.',
    progression: [
      'تغير في الحجم فقط.',
      'تغير الحجم واللون مع اتجاه ثابت.',
      'إضافة دوران بسيط مع مشتتات مختلفة.',
      'تغيرات متعددة في الحجم واللون والاتجاه.',
      'نسخ صحيحة متنوعة جدًا بين مشتتات قريبة بنيويًا.',
    ],
    metric: 'عدد النسخ الصحيحة المكتشفة، الإيجابيات الكاذبة، وقدرة الطفل على تجاهل اللون والحجم كدلائل وحيدة.',
    supportTip: 'اعرض الشكل المرجعي بجانب الخيارات في التدريب، ثم أبعده بصريًا في المستويات الأعلى لتقليل المطابقة السطحية.',
  },
  {
    number: 29,
    slug: 'mental-rotation',
    title: 'الدوران والمطابقة',
    ages: '6-12 سنة',
    duration: '4-8 دقائق',
    taskType: 'mental-rotation',
    purpose: 'تدريب تمثيل شكل غير متناظر بعد تدويره ذهنيًا والتمييز بين الدوران الحقيقي والصورة المرآتية.',
    trainingA: 'تخيل أن الشكل المرجعي يدور، ثم اختر الشكل نفسه بعد الدوران.',
    trainingB: 'تتبع علامة صغيرة مميزة في الشكل؛ إذا تحولت إلى الجهة المعاكسة فقد تكون صورة مرآتية لا دورانًا.',
    testInstruction: 'اختر النسخة التي تمثل الشكل نفسه بعد الدوران، وليس انعكاسه في المرآة.',
    progression: [
      'دوران 90° مع خيارين مختلفين بوضوح.',
      'دوران 90° أو 180° مع مشتت مرآتي.',
      'زوايا متعددة وخيارات أكثر.',
      'أشكال مركبة غير متناظرة مع انعكاسات قريبة.',
      'دوران بزوايا متعددة مع مشتتات مرآتية وشكلية شديدة التشابه.',
    ],
    metric: 'الدقة، أخطاء الخلط بين الدوران والانعكاس، وزمن القرار دون تحويل الزمن وحده إلى هدف.',
    supportTip: 'اسمح للطفل في التدريب بتدوير الورقة أو بطاقة مشابهة، ثم خفف المساعدة تدريجيًا بدل منع الاستراتيجية من البداية.',
  },
  {
    number: 30,
    slug: 'part-whole',
    title: 'الجزء والكل',
    ages: '4-10 سنوات',
    duration: '4-8 دقائق',
    taskType: 'part-whole',
    purpose: 'تدريب دمج الأجزاء بصريًا لفهم الكل واختيار القطعة التي تكمل بنية ناقصة، مع زيادة التشابه بين القطع.',
    trainingA: 'انظر إلى الشكل الناقص واختر القطعة التي تكمله دون تغيير اتجاهها إلا إذا طلبت الورقة ذلك.',
    trainingB: 'قارن الحواف والزوايا والنمط الداخلي قبل اختيار القطعة.',
    testInstruction: 'اختر القطعة الصحيحة التي تكمل الشكل الناقص من بين البدائل.',
    progression: [
      'قطعة كبيرة ناقصة وخيارات مختلفة بوضوح.',
      'قطعة أصغر مع حواف متشابهة.',
      'إضافة نمط داخلي يجب أن يستمر عبر القطعة.',
      'قطع يمكن تدويرها مع مشتتات لها الحافة نفسها.',
      'شكل مركب وقطعة صغيرة مع ضرورة مطابقة الحافة والنمط والاتجاه معًا.',
    ],
    metric: 'الدقة، عدد المحاولات قبل الاختيار، وهل يفحص الطفل الحافة والنمط والاتجاه معًا.',
    supportTip: 'في التدريب يمكن قص نسخة من الخيارات وتجربتها فعليًا؛ في الاختبار تُستخدم المطابقة البصرية فقط.',
  },
];

const kindConfig: Record<VisualPerceptionActivityKind, { label: string; suffix: string; title: string }> = {
  'training-a': { label: 'تدريب أ', suffix: 'training-a', title: 'تدريب موجه' },
  'training-b': { label: 'تدريب ب', suffix: 'training-b', title: 'تدريب استراتيجية' },
  test: { label: 'اختبار المستوى', suffix: 'test', title: 'اختبار إتقان' },
};

function masteryFor(plan: VisualPerceptionSeriesPlan, level: number) {
  const threshold = level <= 2 ? 'نحو 80%' : 'نحو 85%';
  return `${threshold} من البنود صحيحة مع تلميحات قليلة أو دون تلميح، مع مراجعة ${plan.metric} يفضل تأكيد الأداء في محاولة أخرى قبل التصعيد.`;
}

export const visualPerceptionActivities: VisualPerceptionActivity[] = visualPerceptionSeriesPlans.flatMap((plan) =>
  Array.from({ length: 5 }, (_, index) => index + 1).flatMap((level) =>
    (['training-a', 'training-b', 'test'] as VisualPerceptionActivityKind[]).map((kind, kindIndex) => {
      const cfg = kindConfig[kind];
      const instruction = kind === 'training-a' ? plan.trainingA : kind === 'training-b' ? plan.trainingB : plan.testInstruction;
      return {
        slug: `level-${level}-${cfg.suffix}`,
        seriesSlug: plan.slug,
        seriesNumber: plan.number,
        seriesTitle: plan.title,
        taskType: plan.taskType,
        level,
        kind,
        label: kind === 'test' ? `اختبار المستوى ${level}` : cfg.label,
        title: `${cfg.title} - المستوى ${level}`,
        age: plan.ages,
        duration: plan.duration,
        purpose: plan.purpose,
        instruction,
        progression: plan.progression[level - 1],
        mastery: masteryFor(plan, level),
        metric: plan.metric,
        supportTip: plan.supportTip,
        seed: plan.number * 1000 + level * 100 + kindIndex * 31 + 17,
        variant: kindIndex,
      } satisfies VisualPerceptionActivity;
    })
  )
);

export function getVisualPerceptionSeries(slug: string) {
  return visualPerceptionSeriesPlans.find((series) => series.slug === slug);
}

export function getVisualPerceptionActivitiesForSeries(seriesSlug: string) {
  return visualPerceptionActivities.filter((activity) => activity.seriesSlug === seriesSlug);
}

export function getVisualPerceptionActivity(seriesSlug: string, activitySlug: string) {
  return visualPerceptionActivities.find((activity) => activity.seriesSlug === seriesSlug && activity.slug === activitySlug);
}

export const visualPerceptionActivityCount = visualPerceptionActivities.length;
export const visualPerceptionTestCount = visualPerceptionActivities.filter((item) => item.kind === 'test').length;