export type MemoryTaskType =
  | 'visual-working'
  | 'spatial-memory'
  | 'visual-sequence'
  | 'auditory-working'
  | 'associative-memory'
  | 'instruction-memory'
  | 'delayed-recall';

export type MemoryActivityKind = 'training-a' | 'training-b' | 'test';

export type MemorySeriesPlan = {
  number: number;
  slug: string;
  title: string;
  ages: string;
  duration: string;
  taskType: MemoryTaskType;
  purpose: string;
  trainingA: string;
  trainingB: string;
  testInstruction: string;
  progression: string[];
};

export type MemoryActivity = {
  slug: string;
  seriesSlug: string;
  seriesNumber: number;
  seriesTitle: string;
  taskType: MemoryTaskType;
  level: number;
  kind: MemoryActivityKind;
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
  itemCount: number;
  encodingSeconds: number;
  reverseRecall: boolean;
};

export const memorySeriesPlans: MemorySeriesPlan[] = [
  {
    number: 9,
    slug: 'visual-working-memory',
    title: 'الذاكرة العاملة البصرية',
    ages: '4-10 سنوات',
    duration: '4-7 دقائق',
    taskType: 'visual-working',
    purpose: 'تدريب الاحتفاظ المؤقت بمعلومات بصرية ثم استخدامها بعد اختفاء النموذج، مع زيادة عدد العناصر والتشابه تدريجيًا.',
    trainingA: 'شاهد بطاقات الذاكرة لثوانٍ قليلة، ثم غطّها وحدد العناصر التي شاهدتها.',
    trainingB: 'استخدم استراتيجية هادئة: سمِّ العناصر بصمت أو اجمع المتشابه منها، ثم غطِّ النموذج وأجب.',
    testInstruction: 'شاهد النموذج مرة واحدة، ثم غطّه وحدد العناصر الصحيحة دون تلميحات إضافية.',
    progression: [
      'ثلاثة عناصر شديدة الاختلاف وخيارات قليلة.',
      'أربعة عناصر مع زيادة الخيارات المشتتة.',
      'خمسة عناصر وبعض المشتتات تشترك في اللون أو الشكل.',
      'ستة عناصر مع ضرورة الاحتفاظ بسمتين بصريتين لكل عنصر.',
      'سبعة عناصر في مجموعة أكثر كثافة مع مشتتات شديدة التشابه.',
    ],
  },
  {
    number: 10,
    slug: 'spatial-memory',
    title: 'الذاكرة المكانية',
    ages: '4-10 سنوات',
    duration: '4-7 دقائق',
    taskType: 'spatial-memory',
    purpose: 'تدريب تذكر مواضع العناصر داخل مساحة منظمة ثم إعادة تحديد مواقعها بعد إخفاء النموذج.',
    trainingA: 'شاهد أماكن النجوم أو الصور داخل الشبكة، ثم غطِّ النموذج وضع العلامات في الأماكن نفسها.',
    trainingB: 'تذكر المواقع بالاعتماد على صفوف وأعمدة أو زوايا الشبكة، ثم أعدها دون النظر للنموذج.',
    testInstruction: 'شاهد المواقع ثم غطِّ النموذج وأعد تحديدها في شبكة جديدة دون مساعدة.',
    progression: [
      'شبكة 2×2 مع موقعين واضحين.',
      'شبكة 3×3 مع ثلاثة مواقع.',
      'شبكة 3×3 مع أربعة مواقع متقاربة نسبيًا.',
      'شبكة 4×4 مع خمسة مواقع موزعة.',
      'شبكة 4×4 مع ستة مواقع وتوزيع أقل قابلية للتخمين.',
    ],
  },
  {
    number: 11,
    slug: 'visual-sequence-memory',
    title: 'الذاكرة التسلسلية البصرية',
    ages: '5-12 سنة',
    duration: '4-8 دقائق',
    taskType: 'visual-sequence',
    purpose: 'تدريب الاحتفاظ بترتيب سلسلة من العناصر البصرية وإعادة بنائها بالترتيب الصحيح بعد إخفائها.',
    trainingA: 'شاهد ترتيب الصور من اليمين إلى اليسار، ثم غطِّه ورقّم الصور في الترتيب نفسه.',
    trainingB: 'قسّم السلسلة إلى مجموعات صغيرة في ذهنك، ثم أعد ترتيب العناصر بعد تغطية النموذج.',
    testInstruction: 'شاهد التسلسل مرة واحدة ثم أعد ترتيبه من الذاكرة دون نموذج ظاهر.',
    progression: [
      'تسلسل من ثلاثة عناصر مختلفة.',
      'تسلسل من أربعة عناصر.',
      'تسلسل من خمسة عناصر مع تكرار لون أو فئة.',
      'تسلسل من ستة عناصر مع تشابه أكبر بين البطاقات.',
      'تسلسل من سبعة عناصر يحتاج ترميزًا منظمًا واستدعاءً دقيقًا للرتبة.',
    ],
  },
  {
    number: 12,
    slug: 'auditory-working-memory',
    title: 'الذاكرة السمعية العاملة',
    ages: '5-12 سنة',
    duration: '4-8 دقائق',
    taskType: 'auditory-working',
    purpose: 'تدريب الاحتفاظ بتسلسل مسموع قصير ثم الاستجابة له بصريًا، مع زيادة طول السلسلة وإضافة الاستدعاء العكسي في المستويات العليا.',
    trainingA: 'يقرأ المرافق التسلسل مرة واحدة بينما تكون بطاقة المرافق مطوية أو مغطاة؛ بعد ذلك يحدد الطفل الصور بالترتيب المطلوب.',
    trainingB: 'استمع حتى نهاية السلسلة قبل أن تبدأ، ثم أشر أو رقّم الصور بالترتيب الذي سمعته.',
    testInstruction: 'استمع إلى التسلسل مرة واحدة ثم أعده بالترتيب المطلوب دون إعادة القراءة.',
    progression: [
      'عنصران مسموعان يعادان بالترتيب نفسه.',
      'ثلاثة عناصر مسموعة بالترتيب نفسه.',
      'أربعة عناصر مسموعة مع خيارات أكثر.',
      'أربعة عناصر مع طلب إعادتها بترتيب عكسي بسيط.',
      'خمسة عناصر مع استدعاء عكسي أو معالجة ترتيبية أكثر تطلبًا.',
    ],
  },
  {
    number: 13,
    slug: 'associative-memory',
    title: 'الذاكرة الترابطية',
    ages: '5-12 سنة',
    duration: '5-8 دقائق',
    taskType: 'associative-memory',
    purpose: 'تدريب تكوين روابط بين عنصرين غير متطابقين ثم استدعاء الشريك الصحيح بعد إخفاء أزواج التعلم.',
    trainingA: 'شاهد الأزواج معًا وحاول صنع قصة صغيرة تربط كل عنصر بشريكه، ثم غطِّ النموذج وطابق الأزواج.',
    trainingB: 'ركز على العلاقة بين كل زوج وليس على كل صورة منفردة، ثم أعد التوصيل من الذاكرة.',
    testInstruction: 'شاهد الأزواج مرة واحدة ثم غطِّها ووصل كل عنصر بشريكه الصحيح دون تلميح.',
    progression: [
      'زوجان مختلفان بوضوح.',
      'ثلاثة أزواج.',
      'أربعة أزواج مع بعض التشابه بين العناصر.',
      'خمسة أزواج موزعة في ترتيب غير منتظم.',
      'ستة أزواج مع بدائل قريبة بصريًا تتطلب ترميز العلاقة نفسها.',
    ],
  },
  {
    number: 14,
    slug: 'instruction-memory',
    title: 'ذاكرة التعليمات',
    ages: '6-12 سنة',
    duration: '5-9 دقائق',
    taskType: 'instruction-memory',
    purpose: 'تدريب الاحتفاظ بتعليمات مسموعة متعددة الخطوات وتنفيذها بالترتيب، مع إضافة علاقات قبل/بعد أو شروط بسيطة تدريجيًا.',
    trainingA: 'يقرأ المرافق التعليمات مرة واحدة من البطاقة المطوية، ثم ينفذ الطفل الخطوات على مساحة العمل.',
    trainingB: 'استمع إلى جميع الخطوات أولًا، ثم كررها لنفسك بصمت وابدأ التنفيذ بالترتيب.',
    testInstruction: 'اسمع التعليمات مرة واحدة ثم نفذها كاملة دون أن يكررها المرافق.',
    progression: [
      'تعليمتان مباشرتان مستقلتان.',
      'ثلاث تعليمات بالترتيب.',
      'أربع تعليمات تتضمن لونًا أو موضعًا.',
      'خمس خطوات تتضمن علاقة قبل/بعد.',
      'ست خطوات مع قاعدة شرطية بسيطة ضمن السلسلة.',
    ],
  },
  {
    number: 15,
    slug: 'delayed-recall',
    title: 'التذكر بعد التداخل',
    ages: '7-12 سنة',
    duration: '6-10 دقائق',
    taskType: 'delayed-recall',
    purpose: 'تدريب استدعاء معلومات بعد فاصل قصير تشغله مهمة أخرى، بدل الاستدعاء الفوري فقط.',
    trainingA: 'شاهد مجموعة الهدف ثم غطِّها، نفذ المهمة الفاصلة القصيرة، وبعدها حاول استدعاء العناصر الأصلية.',
    trainingB: 'استخدم ترميزًا منظمًا قبل التغطية، ثم لا تعد للنموذج أثناء المهمة الفاصلة، وبعدها أجب من الذاكرة.',
    testInstruction: 'شاهد النموذج مرة واحدة، نفذ المهمة الفاصلة، ثم استدع المعلومات دون الرجوع للنموذج.',
    progression: [
      'ثلاثة عناصر وفاصل قصير جدًا.',
      'أربعة عناصر مع فاصل بصري بسيط.',
      'خمسة عناصر وفاصل أطول قليلًا.',
      'ستة عناصر مع مهمة فاصلة تحتاج تركيزًا بسيطًا.',
      'سبعة عناصر مع فاصل أكثر تشتيتًا ثم استدعاء من بدائل متشابهة.',
    ],
  },
];

const kindMeta: Record<MemoryActivityKind, { label: string; suffix: string; variant: number }> = {
  'training-a': { label: 'تدريب أ', suffix: 'training-a', variant: 0 },
  'training-b': { label: 'تدريب ب', suffix: 'training-b', variant: 1 },
  test: { label: 'اختبار المستوى', suffix: 'test', variant: 2 },
};

function itemCountFor(taskType: MemoryTaskType, level: number) {
  switch (taskType) {
    case 'visual-working': return level + 2;
    case 'spatial-memory': return level + 1;
    case 'visual-sequence': return level + 2;
    case 'auditory-working': return level >= 5 ? 5 : Math.min(4, level + 1);
    case 'associative-memory': return level + 1;
    case 'instruction-memory': return level + 1;
    case 'delayed-recall': return level + 2;
  }
}

function encodingSecondsFor(taskType: MemoryTaskType, level: number) {
  if (taskType === 'auditory-working' || taskType === 'instruction-memory') return 0;
  if (taskType === 'delayed-recall') return Math.max(8, 13 - level);
  return Math.max(6, 11 - level);
}

function masteryFor(plan: MemorySeriesPlan, level: number, kind: MemoryActivityKind, itemCount: number) {
  const base = kind === 'test'
    ? `يُقترح الانتقال بعد أداء مستقر بنحو 80% أو أكثر (${Math.ceil(itemCount * 0.8)} من ${itemCount} تقريبًا) مع تلميح واحد كحد أقصى، ويفضل تأكيده في محاولة أخرى.`
    : 'راقب الدقة، نوع الاستراتيجية، عدد التلميحات، وهل يستعيد الطفل المعلومات بدل التخمين أو الرجوع للنموذج.';
  if (plan.taskType === 'auditory-working' || plan.taskType === 'instruction-memory') {
    return `${base} لا تُعد إعادة قراءة التعليمات جزءًا من المحاولة المستقلة.`;
  }
  if (plan.taskType === 'delayed-recall') {
    return `${base} يجب ألا يعود الطفل إلى لوحة الترميز أثناء المهمة الفاصلة.`;
  }
  return base;
}

function instructionFor(plan: MemorySeriesPlan, level: number, kind: MemoryActivityKind) {
  const base = kind === 'training-a' ? plan.trainingA : kind === 'training-b' ? plan.trainingB : plan.testInstruction;
  if (plan.taskType === 'auditory-working' && level >= 4) return `${base} في هذا المستوى أعد التسلسل بالعكس.`;
  return base;
}

function titleFor(plan: MemorySeriesPlan, level: number, kind: MemoryActivityKind) {
  if (kind === 'test') return `اختبار إتقان المستوى ${level}`;
  const names = ['بداية هادئة', 'خطوة إضافية', 'ذاكرة أقوى', 'تحدي المعالجة', 'تحدي الإتقان'];
  return `${names[level - 1]} - ${kind === 'training-a' ? 'أ' : 'ب'}`;
}

export const memoryActivities: MemoryActivity[] = memorySeriesPlans.flatMap((plan, seriesIndex) =>
  Array.from({ length: 5 }, (_, index) => index + 1).flatMap((level) =>
    (['training-a', 'training-b', 'test'] as const).map((kind) => {
      const meta = kindMeta[kind];
      const itemCount = itemCountFor(plan.taskType, level);
      return {
        slug: `level-${level}-${meta.suffix}`,
        seriesSlug: plan.slug,
        seriesNumber: plan.number,
        seriesTitle: plan.title,
        taskType: plan.taskType,
        level,
        kind,
        label: kind === 'test' ? `اختبار المستوى ${level}` : meta.label,
        title: titleFor(plan, level, kind),
        age: plan.ages,
        duration: plan.duration,
        purpose: plan.purpose,
        instruction: instructionFor(plan, level, kind),
        progression: plan.progression[level - 1],
        mastery: masteryFor(plan, level, kind, itemCount),
        seed: 9000 + seriesIndex * 1000 + level * 100 + meta.variant * 17,
        variant: meta.variant,
        itemCount,
        encodingSeconds: encodingSecondsFor(plan.taskType, level),
        reverseRecall: plan.taskType === 'auditory-working' && level >= 4,
      } satisfies MemoryActivity;
    }),
  ),
);

export const memoryActivityCount = memoryActivities.length;
export const memoryTestCount = memoryActivities.filter((activity) => activity.kind === 'test').length;

export function getMemorySeries(slug: string) {
  return memorySeriesPlans.find((series) => series.slug === slug) ?? null;
}

export function getMemoryActivitiesForSeries(seriesSlug: string) {
  return memoryActivities.filter((activity) => activity.seriesSlug === seriesSlug);
}

export function getMemoryActivity(seriesSlug: string, activitySlug: string) {
  return memoryActivities.find((activity) => activity.seriesSlug === seriesSlug && activity.slug === activitySlug) ?? null;
}
