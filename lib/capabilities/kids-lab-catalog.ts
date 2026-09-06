export type KidsLabSeries = {
  number: number;
  slug: string;
  title: string;
  example: string;
  ages: string;
};

export type KidsLabCategory = {
  slug: string;
  title: string;
  summary: string;
  color: string;
  series: KidsLabSeries[];
};

export const kidsLabCategories: KidsLabCategory[] = [
  {
    slug: 'attention',
    title: 'الانتباه والتركيز',
    summary: 'البحث البصري، الثبات على المهمة، مقاومة المشتتات وتبديل قواعد الانتباه.',
    color: '#F59E0B',
    series: [
      { number: 1, slug: 'visual-selective-attention', title: 'الانتباه الانتقائي البصري', example: 'ابحث عن جميع الأسماك الزرقاء بين أسماك مختلفة.', ages: '4-10' },
      { number: 2, slug: 'sustained-attention', title: 'الانتباه المستمر', example: 'تابع طريق النحلة الطويل واكتشف كل الزهور التي تمر بها.', ages: '4-10' },
      { number: 3, slug: 'distractor-resistance', title: 'مقاومة المشتتات', example: 'اعثر على النجوم فقط وتجاهل القلوب والدوائر المشابهة.', ages: '5-12' },
      { number: 4, slug: 'visual-scanning', title: 'المسح البصري المنظم', example: 'ابحث صفًا بعد صف دون نسيان أي جزء من الصفحة.', ages: '5-12' },
      { number: 5, slug: 'target-search', title: 'البحث عن الهدف', example: 'اكتشف القطط الصغيرة المخفية داخل مشهد الحديقة.', ages: '4-10' },
      { number: 6, slug: 'attention-rule-switching', title: 'تبديل قاعدة الانتباه', example: 'مرة اختر الأحمر، ثم غيّر القاعدة واختر الدوائر.', ages: '6-12' },
      { number: 7, slug: 'visual-processing-speed', title: 'سرعة المعالجة البصرية', example: 'اعثر على أكبر عدد ممكن من الأهداف مع الحفاظ على الدقة.', ages: '6-12' },
      { number: 8, slug: 'dual-attention', title: 'الانتباه المزدوج', example: 'تتبع الطريق وفي الوقت نفسه عد النجوم الموجودة عليه.', ages: '7-12' },
    ],
  },
  {
    slug: 'memory',
    title: 'الذاكرة',
    summary: 'ذاكرة بصرية ومكانية وتسلسلية وعاملة مع انتقال تدريجي من التذكر البسيط إلى معالجة المعلومات.',
    color: '#EC4899',
    series: [
      { number: 9, slug: 'visual-working-memory', title: 'الذاكرة العاملة البصرية', example: 'شاهد ثلاث صور ثم حدد الصور التي اختفت.', ages: '4-10' },
      { number: 10, slug: 'spatial-memory', title: 'الذاكرة المكانية', example: 'تذكر في أي بيت اختبأ كل حيوان.', ages: '4-10' },
      { number: 11, slug: 'visual-sequence-memory', title: 'الذاكرة التسلسلية البصرية', example: 'تذكر ترتيب الصور ثم أعد بناء التسلسل.', ages: '5-12' },
      { number: 12, slug: 'auditory-working-memory', title: 'الذاكرة السمعية العاملة', example: 'اسمع تعليمات قصيرة ثم نفذها على الورقة بالترتيب.', ages: '5-12' },
      { number: 13, slug: 'associative-memory', title: 'الذاكرة الترابطية', example: 'تذكر الحيوان المرتبط بكل لون.', ages: '5-12' },
      { number: 14, slug: 'instruction-memory', title: 'ذاكرة التعليمات', example: 'نفذ سلسلة تعليمات متعددة الخطوات دون تذكير.', ages: '6-12' },
      { number: 15, slug: 'delayed-recall', title: 'التذكر بعد التداخل', example: 'شاهد الصور، نفذ نشاطًا قصيرًا، ثم استدعها.', ages: '7-12' },
    ],
  },
  {
    slug: 'executive-functions',
    title: 'الوظائف التنفيذية',
    summary: 'كبح الاستجابة، المرونة، التخطيط، مراقبة الأخطاء، البدء والاستمرار وحل المشكلات.',
    color: '#22C55E',
    series: [
      { number: 16, slug: 'response-inhibition', title: 'كبح الاستجابة', example: 'لوّن الدائرة وتجاهل المربع حتى عندما يتكرر كثيرًا.', ages: '5-12' },
      { number: 17, slug: 'cognitive-flexibility', title: 'المرونة المعرفية', example: 'صنّف مرة حسب اللون ثم بدّل إلى الشكل.', ages: '6-12' },
      { number: 18, slug: 'planning', title: 'التخطيط', example: 'اختر أقصر طريق يساعد الأرنب على الوصول للجزر.', ages: '5-12' },
      { number: 19, slug: 'step-ordering', title: 'ترتيب الخطوات', example: 'رتب صور مهمة يومية من البداية حتى النهاية.', ages: '4-10' },
      { number: 20, slug: 'error-monitoring', title: 'مراقبة الأخطاء', example: 'اكتشف الأخطاء التي ارتكبها الروبوت وأصلحها.', ages: '6-12' },
      { number: 21, slug: 'task-initiation', title: 'بدء المهمة', example: 'حدد أول خطوة صحيحة قبل الانطلاق.', ages: '5-12' },
      { number: 22, slug: 'goal-persistence', title: 'الاستمرار حتى الهدف', example: 'أكمل مهمة متعددة المراحل دون تخطي خطوة.', ages: '6-12' },
      { number: 23, slug: 'rule-discovery', title: 'اكتشاف القاعدة وحل المشكلة', example: 'اكتشف القاعدة الخفية التي تربط الصور.', ages: '7-12' },
    ],
  },
  {
    slug: 'visual-perception',
    title: 'الإدراك البصري',
    summary: 'تمييز الأشكال، الشكل والخلفية، الإغلاق البصري، العلاقات المكانية وثبات الشكل.',
    color: '#A855F7',
    series: [
      { number: 24, slug: 'visual-discrimination', title: 'التمييز البصري', example: 'أي فراشة تختلف قليلًا عن البقية؟', ages: '3-9' },
      { number: 25, slug: 'figure-ground', title: 'الشكل والخلفية', example: 'اكتشف الحيوانات المخفية وسط مشهد مزدحم.', ages: '4-10' },
      { number: 26, slug: 'visual-closure', title: 'الإغلاق البصري', example: 'حدد الشكل الكامل من جزء ناقص.', ages: '4-10' },
      { number: 27, slug: 'spatial-relations', title: 'العلاقات المكانية', example: 'حدد ما هو فوق وتحت وداخل وخارج.', ages: '3-9' },
      { number: 28, slug: 'form-constancy', title: 'ثبات الشكل', example: 'اعثر على الشكل نفسه رغم تغيير الحجم أو الاتجاه.', ages: '5-11' },
      { number: 29, slug: 'mental-rotation', title: 'الدوران والمطابقة', example: 'اختر المفتاح نفسه بعد تدويره.', ages: '6-12' },
      { number: 30, slug: 'part-whole', title: 'الجزء والكل', example: 'اختر القطعة التي تكمل صورة القارب.', ages: '4-10' },
    ],
  },
  {
    slug: 'visual-motor',
    title: 'التكامل البصري الحركي',
    summary: 'تحويل ما تراه العين إلى حركة دقيقة ومنظمة بالقلم واليد.',
    color: '#3B82F6',
    series: [
      { number: 31, slug: 'path-tracing', title: 'تتبع المسارات', example: 'تتبع طريقًا طويلًا دون الخروج منه.', ages: '3-9' },
      { number: 32, slug: 'mazes', title: 'المتاهات', example: 'ساعد الديناصور على الوصول إلى بيضته.', ages: '4-10' },
      { number: 33, slug: 'dot-to-dot', title: 'وصل النقاط', example: 'اتبع النقاط بالتسلسل لتظهر صورة مخفية.', ages: '4-9' },
      { number: 34, slug: 'shape-copying', title: 'نسخ الأشكال', example: 'شاهد شكلًا هندسيًا ثم انسخه.', ages: '4-10' },
      { number: 35, slug: 'grid-copying', title: 'النسخ على الشبكة', example: 'انقل الروبوت مربعًا بمربع.', ages: '6-12' },
      { number: 36, slug: 'eye-hand-accuracy', title: 'دقة العين واليد', example: 'صِل كل مركبة بمرآبها عبر مسار ضيق.', ages: '4-10' },
    ],
  },
  {
    slug: 'fine-motor',
    title: 'المهارات الحركية الدقيقة وما قبل الكتابة',
    summary: 'التحكم بالقلم والقص والتلوين وأنماط الحركة التي تسبق الكتابة.',
    color: '#F97316',
    series: [
      { number: 37, slug: 'basic-lines', title: 'الخطوط الأساسية', example: 'تتبع خطوطًا رأسية وأفقية ومائلة ومتقاطعة.', ages: '3-6' },
      { number: 38, slug: 'curves-circles-spirals', title: 'الأقواس والدوائر واللولبيات', example: 'أكمل قوقعة الحلزون بحركة لولبية.', ages: '3-7' },
      { number: 39, slug: 'scissor-control', title: 'القص والتحكم بالمقص', example: 'قص من خط عريض إلى مسار متعرج.', ages: '4-8' },
      { number: 40, slug: 'coloring-boundaries', title: 'التلوين داخل الحدود', example: 'لوّن الفراشة مع المحافظة على الحدود.', ages: '3-7' },
      { number: 41, slug: 'pencil-control', title: 'التحكم بالقلم', example: 'انتقل تدريجيًا من طريق عريض إلى طريق أضيق.', ages: '4-8' },
      { number: 42, slug: 'prewriting-patterns', title: 'أنماط الاستعداد للكتابة', example: 'كرر أنماطًا حركية تمهد للكتابة العربية.', ages: '4-7' },
    ],
  },
  {
    slug: 'bilateral',
    title: 'التآزر الثنائي وعبور خط المنتصف',
    summary: 'تنسيق اليدين معًا، الحركة المتزامنة، عبور خط المنتصف والاستجابة لإشارات أثناء الحركة.',
    color: '#06B6D4',
    series: [
      { number: 43, slug: 'bilateral-tracks', title: 'مسارا اليدين المتزامنان', example: 'تحرك كل يد على مسار مستقل في الوقت نفسه.', ages: '4-8' },
      { number: 44, slug: 'mirror-drawing', title: 'الرسم المرآتي', example: 'ارسم جناحي فراشة باليدين معًا.', ages: '5-10' },
      { number: 45, slug: 'opposite-directions', title: 'الحركة في اتجاهين مختلفين', example: 'يد ترسم دائرة والأخرى تتبع مسارًا متموجًا.', ages: '6-11' },
      { number: 46, slug: 'midline-crossing', title: 'عبور خط المنتصف', example: 'اتبع مسارًا ينتقل بين جانبي الصفحة.', ages: '4-10' },
      { number: 47, slug: 'bilateral-stop-go', title: 'الإيقاع والتوقف بكلتا اليدين', example: 'تحرك مع المسار وتوقف عند إشارة محددة.', ages: '5-10' },
    ],
  },
  {
    slug: 'language-reading',
    title: 'اللغة والاستعداد للقراءة',
    summary: 'وعي صوتي وتمييز بصري للحروف وتسلسل قصصي بصورة مناسبة للعمر.',
    color: '#2563EB',
    series: [
      { number: 48, slug: 'rhyming', title: 'القافية والوعي الصوتي', example: 'اختر الصور التي تنتهي بأصوات متشابهة.', ages: '4-7' },
      { number: 49, slug: 'initial-sound', title: 'الصوت الأول', example: 'اختر الصور التي تبدأ بالصوت نفسه.', ages: '4-7' },
      { number: 50, slug: 'syllable-awareness', title: 'المقاطع الصوتية', example: 'حدد عدد المقاطع في الكلمات المصورة.', ages: '4-8' },
      { number: 51, slug: 'letter-discrimination', title: 'تمييز الحروف بصريًا', example: 'اكتشف الحرف المختلف بين حروف متقاربة.', ages: '5-8' },
      { number: 52, slug: 'letter-picture-match', title: 'مطابقة الحرف والصورة', example: 'اربط الحرف بالصورة التي يبدأ اسمها به.', ages: '5-8' },
      { number: 53, slug: 'story-sequencing', title: 'التسلسل القصصي', example: 'رتب صورًا لتكوين قصة منطقية.', ages: '4-9' },
    ],
  },
  {
    slug: 'math-logic',
    title: 'التفكير الرياضي والمنطقي',
    summary: 'أنماط وتصنيف وكمية وترتيب ومنطق بصري بأسلوب لعب ورقي واضح.',
    color: '#F59E0B',
    series: [
      { number: 54, slug: 'patterns', title: 'إكمال الأنماط', example: 'أكمل النمط اللوني أو الشكلي التالي.', ages: '3-9' },
      { number: 55, slug: 'classification', title: 'التصنيف', example: 'صنّف الأشياء حسب اللون أو النوع أو البيئة.', ages: '3-9' },
      { number: 56, slug: 'quantity-comparison', title: 'الكمية والمقارنة', example: 'حدد أي سلة تحتوي أكثر وأيها أقل.', ages: '3-8' },
      { number: 57, slug: 'ordering-sequencing', title: 'الترتيب والتسلسل', example: 'رتب العناصر من الأصغر إلى الأكبر.', ages: '3-8' },
      { number: 58, slug: 'visual-logic', title: 'المنطق البصري', example: 'حل شبكة مصورة بسيطة دون تكرار الرموز.', ages: '5-10' },
    ],
  },
  {
    slug: 'emotional-regulation',
    title: 'التنظيم الانفعالي',
    summary: 'التعرف على المشاعر وإشارات الجسم وشدتها واختيار استراتيجيات تنظيم مناسبة.',
    color: '#F43F5E',
    series: [
      { number: 59, slug: 'emotion-recognition', title: 'التعرف على المشاعر', example: 'اختر الوجه الأقرب لشعور الشخصية.', ages: '3-9' },
      { number: 60, slug: 'body-signals', title: 'إشارات الجسم', example: 'حدد أين قد تشعر بالتوتر أو الغضب في الجسم.', ages: '5-12' },
      { number: 61, slug: 'emotion-intensity', title: 'شدة الشعور', example: 'ضع شعورك على مقياس بصري واضح.', ages: '4-12' },
      { number: 62, slug: 'regulation-strategy-choice', title: 'اختيار استراتيجية مناسبة', example: 'اختر ما قد يساعد في موقف إحباط محدد.', ages: '5-12' },
    ],
  },
  {
    slug: 'social-skills',
    title: 'المهارات الاجتماعية',
    summary: 'فهم إشارات المواقف، تبادل الدور، المنظور وحل المواقف دون فرض قالب اجتماعي واحد.',
    color: '#84CC16',
    series: [
      { number: 63, slug: 'social-cues', title: 'فهم الإشارات الاجتماعية', example: 'ماذا قد يعني تعبير وجه الطفل في الصورة؟', ages: '5-12' },
      { number: 64, slug: 'turn-taking-perspective', title: 'الدور والمنظور', example: 'حدد من دوره وما الذي يراه كل طفل من مكانه.', ages: '4-10' },
      { number: 65, slug: 'social-problem-solving', title: 'حل المواقف الاجتماعية', example: 'اختر عدة حلول ممكنة لموقف مشاركة لعبة.', ages: '5-12' },
    ],
  },
  {
    slug: 'sensory-self-regulation',
    title: 'الوعي الحسي والتنظيم الذاتي',
    summary: 'تحديد ما يساعد الطفل وملاحظة مستوى الطاقة والاستعداد دون تحويل الأوراق إلى تشخيص.',
    color: '#14B8A6',
    series: [
      { number: 66, slug: 'what-helps-me', title: 'اكتشاف ما يساعدني', example: 'اختر البيئة أو النشاط الذي يساعدك على الشعور بالراحة والتركيز.', ages: '4-12' },
      { number: 67, slug: 'energy-state', title: 'حالة الطاقة والاستعداد', example: 'حدد هل جسمك بطيء أو مناسب أو سريع جدًا، ثم اختر خطوة مناسبة.', ages: '4-12' },
    ],
  },
];

export const kidsLabSeries = kidsLabCategories.flatMap((category) =>
  category.series.map((series) => ({ ...series, categorySlug: category.slug, categoryTitle: category.title, categoryColor: category.color })),
);

export const KIDS_LAB_TARGET_ITEMS = 1000;
export const KIDS_LAB_LEVELS = 5;
export const KIDS_LAB_ITEMS_PER_LEVEL = 3;
export const KIDS_LAB_PLANNED_ITEMS = kidsLabSeries.length * KIDS_LAB_LEVELS * KIDS_LAB_ITEMS_PER_LEVEL;

if (kidsLabSeries.length !== 67) {
  throw new Error(`Kids Lab catalog must contain 67 series; found ${kidsLabSeries.length}.`);
}
