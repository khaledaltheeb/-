export type ExecutiveTaskType =
  | 'response-inhibition'
  | 'cognitive-flexibility'
  | 'planning'
  | 'step-ordering'
  | 'error-monitoring'
  | 'task-initiation'
  | 'goal-persistence'
  | 'rule-discovery';

export type ExecutiveActivityKind = 'training-a' | 'training-b' | 'test';

export type ExecutiveSeriesPlan = {
  number: number; slug: string; title: string; ages: string; duration: string;
  taskType: ExecutiveTaskType; purpose: string; trainingA: string; trainingB: string;
  testInstruction: string; progression: string[]; observation: string;
};

export type ExecutiveActivity = {
  slug: string; seriesSlug: string; seriesNumber: number; seriesTitle: string;
  taskType: ExecutiveTaskType; level: number; kind: ExecutiveActivityKind; label: string;
  title: string; age: string; duration: string; purpose: string; instruction: string;
  progression: string; mastery: string; observation: string; seed: number; variant: number; complexity: number;
};

export const executiveSeriesPlans: ExecutiveSeriesPlan[] = [
  { number:16, slug:'response-inhibition', title:'كبح الاستجابة', ages:'5-12 سنة', duration:'3-7 دقائق', taskType:'response-inhibition', purpose:'تدريب التوقف قبل الاستجابة عندما تظهر إشارة منع، والتمييز بين متى يستجيب الطفل ومتى يمتنع عن الاستجابة.', trainingA:'نفّذ قاعدة «اذهب/توقف»: ضع علامة فقط على أهداف اذهب واترك أهداف التوقف دون لمس.', trainingB:'قل القاعدة بصمت قبل كل صف، وتحقق من إشارة التوقف قبل أن تضع أي علامة.', testInstruction:'طبّق قاعدة اذهب/توقف وحدك، مع أقل عدد ممكن من الاستجابات على عناصر المنع.', progression:['إشارة اذهب واحدة وإشارة توقف واحدة مختلفتان بوضوح.','زيادة عدد العناصر مع بقاء القاعدة ثابتة.','إشارات متشابهة بصريًا تحتاج فحصًا قبل الاستجابة.','قانون مركب: الاستجابة تعتمد على اللون والشكل معًا.','قانون يتبدل بين جزأين مع ضرورة إيقاف القاعدة السابقة.'], observation:'عدد استجابات المنع الخاطئة، وعدد التصحيحات الذاتية، والحاجة إلى تذكير بالقاعدة.' },
  { number:17, slug:'cognitive-flexibility', title:'المرونة المعرفية', ages:'6-12 سنة', duration:'4-8 دقائق', taskType:'cognitive-flexibility', purpose:'تدريب الانتقال من قاعدة تصنيف أو استجابة إلى قاعدة أخرى دون الاستمرار تلقائيًا على القاعدة القديمة.', trainingA:'نفّذ قاعدة كل جزء: مرة حسب اللون، ثم حسب الشكل، ثم عد للون عندما تطلب البطاقة ذلك.', trainingB:'قبل كل مجموعة سمِّ القاعدة الحالية، ثم ابدأ ولا تستخدم قاعدة المجموعة السابقة.', testInstruction:'غيّر قاعدة التصنيف عند ظهور بطاقة التحويل دون تلميح خارجي.', progression:['قاعدتان في قسمين منفصلين وواضحين.','ثلاثة تبديلات بين اللون والشكل.','تبديل أكثر تكرارًا مع عناصر متشابهة.','إضافة قاعدة ثالثة مثل الحجم أو الاتجاه.','تبديل سريع بين ثلاث قواعد مع مثيرات مشتركة الخصائص.'], observation:'أخطاء الاستمرار على القاعدة السابقة، زمن التكيف بعد التحويل، والتصحيح الذاتي.' },
  { number:18, slug:'planning', title:'التخطيط', ages:'5-12 سنة', duration:'5-10 دقائق', taskType:'planning', purpose:'تدريب بناء خطة قبل التنفيذ، اختيار مسار يحقق الهدف ضمن قيود واضحة، ثم مقارنة التنفيذ بالخطة.', trainingA:'انظر إلى الهدف والعوائق أولًا، ارسم خطتك بالقلم الخفيف، ثم نفذ المسار بعد ذلك.', trainingB:'عدّ الخطوات أو نقاط المرور المطلوبة قبل أن تبدأ، وحدد أين قد تحتاج تغيير الاتجاه.', testInstruction:'خطط أولًا ثم نفذ دون تجربة عشوائية، وسجّل عدد التعديلات على الخطة.', progression:['هدف قريب مع عائق واحد ومساران محتملان.','مسافة أطول مع عائقين ونقطة مرور واحدة.','عدة طرق مع قيد «الأقصر» أو عدد خطوات محدد.','نقطتا مرور وترتيب مطلوب مع مسارات مضللة.','خطة متعددة القيود: ترتيب، حد خطوات، ومنطقة ممنوعة.'], observation:'هل وضع خطة قبل البدء، عدد المحاولات العشوائية، وعدد التعديلات بعد التنفيذ.' },
  { number:19, slug:'step-ordering', title:'ترتيب الخطوات', ages:'4-10 سنوات', duration:'4-8 دقائق', taskType:'step-ordering', purpose:'تدريب تنظيم سلسلة من الأحداث أو الإجراءات في ترتيب منطقي يحافظ على علاقات البداية والوسط والنهاية.', trainingA:'رتّب البطاقات من الخطوة الأولى إلى الأخيرة، ثم اشرح لماذا لا يمكن تبديل خطوتين مهمتين.', trainingB:'ابحث عن الخطوة التي يجب أن تحدث أولًا، ثم ابنِ التسلسل حولها.', testInstruction:'رتّب جميع الخطوات دون نموذج، وتأكد أن كل خطوة تمهّد لما بعدها.', progression:['ثلاث خطوات يومية شديدة الوضوح.','أربع خطوات مع صورة مشتتة واحدة.','خمس خطوات وبعضها متقارب زمنيًا.','ست خطوات تتضمن علاقة شرطية أو اعتمادًا بين خطوتين.','سبع خطوات مع مشتتين وضرورة تبرير نقطة حرجة في الترتيب.'], observation:'عدد النقلات بعد الترتيب الأول، تحديد البداية الصحيحة، وفهم العلاقات بين الخطوات.' },
  { number:20, slug:'error-monitoring', title:'مراقبة الأخطاء', ages:'6-12 سنة', duration:'4-9 دقائق', taskType:'error-monitoring', purpose:'تدريب مراجعة العمل بعد تنفيذه، مقارنة النتيجة بالقاعدة أو النموذج، واكتشاف الخطأ وتصحيحه.', trainingA:'افحص عمل الروبوت: ضع دائرة حول كل خطأ ثم اكتب أو ارسم التصحيح المناسب.', trainingB:'استخدم قائمة فحص: القاعدة، الترتيب، العدد، ثم راجع كل بند قبل أن تقول انتهيت.', testInstruction:'راجع المهمة وحدك واكتشف الأخطاء المخفية وصححها دون معرفة عددها مسبقًا.', progression:['خطآن واضحان داخل نمط بسيط.','ثلاثة أخطاء من نوع واحد.','أخطاء من نوعين: ترتيب وخصائص.','أخطاء قليلة داخل عمل صحيح طويل نسبيًا.','مهمة مركبة مع أخطاء نادرة تتطلب فحصًا منهجيًا كاملًا.'], observation:'عدد الأخطاء المكتشفة، الأخطاء التي صححها الطفل ذاتيًا، واستراتيجية المراجعة المستخدمة.' },
  { number:21, slug:'task-initiation', title:'بدء المهمة', ages:'5-12 سنة', duration:'4-8 دقائق', taskType:'task-initiation', purpose:'تدريب تحويل الهدف إلى خطوة أولى واضحة ثم البدء بها بعد إشارة البدء، مع تقليل التردد غير الضروري.', trainingA:'اختر أول خطوة صغيرة وقابلة للتنفيذ من بين الخيارات، ضع عليها علامة، ثم ابدأ عند إشارة البدء.', trainingB:'حوّل المهمة الكبيرة إلى «أول شيء سأفعله الآن»، ثم نفذ هذا الجزء فقط قبل التفكير في التالي.', testInstruction:'حدد أول خطوة صحيحة وابدأ بها عند الإشارة دون تلميح إضافي.', progression:['اختيار أول خطوة بين خيارين واضحين.','اختيار أول خطوة بين ثلاثة خيارات.','تمييز خطوة أولى عملية من خطوة عامة أو نهائية.','مهمة لها أكثر من بداية ممكنة ويجب اختيار الأنسب للهدف.','مهمة متعددة الأجزاء مع تحديد بداية وخطة دقيقة للـ60 ثانية الأولى.'], observation:'زمن البدء بعد الإشارة، عدد التلميحات، وهل كانت الخطوة الأولى قابلة للتنفيذ ومتصلة بالهدف.' },
  { number:22, slug:'goal-persistence', title:'الاستمرار حتى الهدف', ages:'6-12 سنة', duration:'5-10 دقائق', taskType:'goal-persistence', purpose:'تدريب المحافظة على الهدف عبر عدة مراحل قصيرة مع استخدام نقاط تحقق بدل ترك المهمة عند أول عقبة أو مشتت.', trainingA:'أكمل المراحل بالترتيب، وضع علامة عند كل نقطة تحقق قبل الانتقال للمرحلة التالية.', trainingB:'إذا واجهت عقبة، استخدم مربع «توقف-راجع-واصل» ثم عد إلى الهدف بدل البدء من جديد.', testInstruction:'أكمل جميع المراحل حتى الهدف مع أقل عدد ممكن من التذكيرات الخارجية.', progression:['ثلاث مراحل قصيرة مع نقاط تحقق واضحة.','أربع مراحل وإضافة مشتت بصري غير مطلوب.','خمس مراحل مع عقبة تتطلب تصحيحًا قبل المواصلة.','ست مراحل مع خيار فرعي لا يخدم الهدف ويجب تجاهله.','سبع مراحل مع نقاط تحقق أقل واعتماد أكبر على المتابعة الذاتية.'], observation:'عدد المراحل المكتملة، مرات ترك المسار، استخدام نقاط التحقق، والعودة للمهمة بعد الخطأ.' },
  { number:23, slug:'rule-discovery', title:'اكتشاف القاعدة وحل المشكلة', ages:'7-12 سنة', duration:'5-10 دقائق', taskType:'rule-discovery', purpose:'تدريب الاستدلال من أمثلة وأمثلة مضادة لاكتشاف قاعدة خفية ثم تطبيقها على حالات جديدة.', trainingA:'قارن الأشياء التي تنتمي للمجموعة بالأشياء التي لا تنتمي، ثم اكتب أو اختر القاعدة التي تفسر الفرق.', trainingB:'اختبر فرضيتك على مثال جديد: إذا فشلت، عدّل القاعدة بدل إضافة استثناءات عشوائية.', testInstruction:'اكتشف القاعدة من الأمثلة ثم صنّف حالات جديدة لم ترها أثناء التدريب.', progression:['قاعدة بصفة واحدة واضحة مثل اللون.','قاعدة بصفة واحدة أقل وضوحًا مثل الاتجاه أو العدد.','قاعدة تجمع صفتين معًا.','قاعدة شرطية تتضمن «إذا... فـ...».','قاعدة متعددة الخصائص مع أمثلة مضادة مصممة لكشف الفرضيات السطحية.'], observation:'عدد الفرضيات، استخدام الأمثلة المضادة، القدرة على تعديل القاعدة، ودقة التعميم على حالات جديدة.' },
];

const kindLabel: Record<ExecutiveActivityKind,string> = {'training-a':'تدريب أ','training-b':'تدريب ب',test:'اختبار المستوى'};
const kindTitle: Record<ExecutiveActivityKind,string> = {'training-a':'تدريب موجّه','training-b':'تدريب باستراتيجية',test:'اختبار إتقان'};

function masteryFor(plan: ExecutiveSeriesPlan, level: number) {
  if (plan.taskType === 'task-initiation') return `جاهزية المستوى التالي عند اختيار خطوة أولى مناسبة والبدء خلال ${Math.max(8,18-level*2)} ثانية في معظم المحاولات، مع تلميحات قليلة.`;
  if (plan.taskType === 'planning') return 'جاهزية المستوى التالي عند وجود خطة قبل التنفيذ، وإتمام المهمة بقيودها مع محاولات عشوائية قليلة وتصحيح ذاتي مناسب.';
  if (plan.taskType === 'goal-persistence') return 'جاهزية المستوى التالي عند إكمال نحو 80% من المراحل المطلوبة مع العودة للمهمة بعد الخطأ ودون اعتماد مستمر على التذكير الخارجي.';
  return 'جاهزية المستوى التالي عند دقة تقارب 80% أو أفضل مع تلميحات قليلة واستراتيجية مستقرة، ويُفضّل تأكيد الأداء في محاولة أخرى.';
}

export const executiveActivities: ExecutiveActivity[] = executiveSeriesPlans.flatMap((plan) =>
  Array.from({length:5},(_,i)=>i+1).flatMap((level)=>(['training-a','training-b','test'] as ExecutiveActivityKind[]).map((kind,kindIndex)=>({
    slug:`level-${level}-${kind}`, seriesSlug:plan.slug, seriesNumber:plan.number, seriesTitle:plan.title, taskType:plan.taskType,
    level, kind, label:kind==='test'?`اختبار المستوى ${level}`:kindLabel[kind], title:`${kindTitle[kind]} - المستوى ${level}`,
    age:plan.ages, duration:plan.duration, purpose:plan.purpose, instruction:kind==='training-a'?plan.trainingA:kind==='training-b'?plan.trainingB:plan.testInstruction,
    progression:plan.progression[level-1], mastery:masteryFor(plan,level), observation:plan.observation,
    seed:plan.number*1000+level*100+kindIndex*23+17, variant:kindIndex, complexity:level,
  }))),
);

export const executiveActivityCount = executiveActivities.length;
export const executiveTestCount = executiveActivities.filter((item)=>item.kind==='test').length;
export function getExecutiveSeries(slug:string){return executiveSeriesPlans.find((series)=>series.slug===slug)??null;}
export function getExecutiveActivitiesForSeries(slug:string){return executiveActivities.filter((activity)=>activity.seriesSlug===slug);}
export function getExecutiveActivity(seriesSlug:string,activitySlug:string){return executiveActivities.find((activity)=>activity.seriesSlug===seriesSlug&&activity.slug===activitySlug)??null;}
