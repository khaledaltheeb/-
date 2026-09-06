export type SocialTask='social-cues'|'turn-taking-perspective'|'social-problem-solving';
export type SocialKind='training-a'|'training-b'|'test';
export type SocialSeries={number:number;slug:string;title:string;ages:string;duration:string;taskType:SocialTask;purpose:string;observation:string;progression:string[]};
export type SocialActivity={slug:string;seriesSlug:string;seriesNumber:number;seriesTitle:string;taskType:SocialTask;level:number;kind:SocialKind;label:string;title:string;age:string;duration:string;purpose:string;instruction:string;progression:string;observation:string;mastery:string;seed:number};

export const socialSeriesPlans:SocialSeries[]=[
{number:63,slug:'social-cues',title:'فهم الإشارات الاجتماعية',ages:'5-12 سنوات',duration:'5-9 دقائق',taskType:'social-cues',purpose:'تدريب قراءة الأدلة المتاحة في موقف اجتماعي—الكلمات، وضعية الجسم، المسافة، السياق، وما هو غير معروف—دون افتراض أن تعبيرًا واحدًا له معنى واحد دائمًا.',observation:'هل يذكر الطفل الدليل الذي اعتمد عليه؟ هل يميّز بين ما نعرفه وما نفترضه؟ هل يقبل احتمالين عندما تكون الإشارة غامضة؟',progression:['مواقف واضحة بدليلين متسقين.','إشارة واضحة مع معلومة سياقية إضافية.','مواقف تحتمل تفسيرين مع سؤال: ما الذي نحتاج معرفته؟','أدلة متعارضة نسبيًا بين الكلمات ووضعية الجسم مع تجنب التخمين القاطع.','مواقف مركبة تتطلب فصل الدليل عن الافتراض واقتراح طريقة تحقق محترمة.']},
{number:64,slug:'turn-taking-perspective',title:'الدور والمنظور',ages:'4-10 سنوات',duration:'5-9 دقائق',taskType:'turn-taking-perspective',purpose:'تدريب فهم من يملك الدور الآن، وما المعلومات المتاحة لكل شخص، وكيف قد تختلف الرؤية أو المعرفة أو الرغبة بين شخصين.',observation:'تحديد صاحب الدور، ذكر ما يعرفه كل طرف، تجنب افتراض أن الجميع يرى أو يريد الشيء نفسه، والقدرة على اقتراح تبادل دور عادل.',progression:['تحديد الدور في تبادل بسيط لشخصين.','تمييز ما يراه كل شخص من موقع مختلف.','تمييز ما يعرفه شخص وما لا يعرفه الآخر.','مواقف فيها رغبتان مختلفتان وتحتاج اتفاقًا أو تبادلًا.','موقف متعدد الأشخاص يتطلب تتبع الأدوار والمعلومات والحدود دون افتراض منظور واحد صحيح.']},
{number:65,slug:'social-problem-solving',title:'حل المواقف الاجتماعية',ages:'5-12 سنوات',duration:'6-10 دقائق',taskType:'social-problem-solving',purpose:'تدريب توليد أكثر من حل لموقف اجتماعي، تقييم الأمان والحدود والاحترام والهدف، واختيار خطوة قابلة للتراجع أو التعديل عند الحاجة.',observation:'عدد الحلول الممكنة، مراعاة الأمان والحدود، احترام الرفض، القدرة على اختيار بديل ثانٍ، وتفسير سبب الاختيار.',progression:['اختيار حلين آمنين من ثلاثة بدائل واضحة.','توليد حلين لموقف مشاركة أو انتظار بسيط.','مقارنة حلول بحسب الهدف والحدود واحترام الرفض.','موقف فيه تعارض رغبات يتطلب تفاوضًا أو طلب مساعدة أو انسحابًا محترمًا.','موقف غامض متعدد الحلول يتطلب خطة أولى وخطة بديلة ومعيارًا يحدد متى نغيّر الخطة.']}
];

const labels:{kind:SocialKind,label:string}[]=[{kind:'training-a',label:'تدريب أ'},{kind:'training-b',label:'تدريب ب'},{kind:'test',label:'اختبار الإتقان'}];
const instruction=(task:SocialTask,kind:SocialKind)=>{
 const base=task==='social-cues'?'انظر إلى الموقف وحدد ما نعرفه فعلًا، ثم اذكر احتمالًا أو احتمالين لمعنى الإشارة وما الدليل لكل احتمال.':task==='turn-taking-perspective'?'حدد من دوره الآن، وما الذي يراه أو يعرفه أو يريده كل شخص، ثم اقترح طريقة عادلة للانتقال بين الأدوار.':'اقترح أكثر من حل للموقف، ثم قارنها من حيث الأمان والحدود واحترام الرفض والهدف، واختر خطة أولى وخطة بديلة.';
 return kind==='test'?`${base} نفّذ دون إعطاء نموذج إجابة أو تصحيح أثناء التفكير.`:kind==='training-a'?`${base} استخدم سؤالًا مساعدًا واحدًا فقط إذا لزم.`:`${base} أعد المحاولة بموقف جديد وتلميحات أقل.`;
};
const mastery=(task:SocialTask)=>task==='social-cues'?'يذكر دليلًا واحدًا على الأقل ويميز بين الدليل والافتراض، ويقبل أكثر من احتمال عندما لا تكفي المعلومات.':task==='turn-taking-perspective'?'يتتبع الدور والمنظور أو المعرفة المختلفة دون افتراض أن الجميع يملك المعلومات نفسها، ويقترح تبادلًا يحترم الحدود.':'يولد حلين مناسبين على الأقل، يستبعد غير الآمن أو المتجاوز للحدود، ويذكر متى ينتقل إلى الخطة البديلة أو يطلب المساعدة.';
export const socialActivities:SocialActivity[]=socialSeriesPlans.flatMap(series=>Array.from({length:5},(_,i)=>i+1).flatMap(level=>labels.map((x,idx)=>({
 slug:`level-${level}-${x.kind}`,seriesSlug:series.slug,seriesNumber:series.number,seriesTitle:series.title,taskType:series.taskType,level,kind:x.kind,label:x.label,title:`${series.title} - المستوى ${level} - ${x.label}`,age:series.ages,duration:series.duration,purpose:series.purpose,instruction:instruction(series.taskType,x.kind),progression:series.progression[level-1],observation:series.observation,mastery:mastery(series.taskType),seed:series.number*100+level*10+idx
})))));
export const socialActivityCount=socialActivities.length;
export const socialTestCount=socialActivities.filter(a=>a.kind==='test').length;
export const getSocialSeries=(slug:string)=>socialSeriesPlans.find(s=>s.slug===slug);
export const getSocialActivitiesForSeries=(slug:string)=>socialActivities.filter(a=>a.seriesSlug===slug);
export const getSocialActivity=(series:string,slug:string)=>socialActivities.find(a=>a.seriesSlug===series&&a.slug===slug);

export const socialCueScenarios=[
{context:'طفلان يبنيان برجًا. أحدهما ابتعد خطوة وقال: أحتاج دقيقة.',evidence:['ابتعد خطوة','قال إنه يحتاج دقيقة'],unknown:'لا نعرف هل هو متعب أم منزعج أم يريد التفكير فقط.'},
{context:'طفلة تمسك كتابًا وتنظر إلى الباب ثم إلى زميلتها.',evidence:['تنظر إلى الباب','ما زالت تمسك الكتاب'],unknown:'لا نعرف إن كانت تريد المغادرة أو تنتظر شخصًا أو تبحث عن مكان.'},
{context:'قال طفل: نعم، لكن صوته منخفض وجسمه متراجع للخلف.',evidence:['قال نعم','جسمه متراجع'],unknown:'الإشارتان غير متطابقتين؛ من الأفضل التحقق بسؤال واضح دون ضغط.'},
{context:'مجموعة تلعب، وطفل يقف قريبًا ويشاهد دون أن يتكلم.',evidence:['يقف قريبًا','يشاهد'],unknown:'لا نعرف هل يريد الانضمام أم يفضل المشاهدة.'},
{context:'طفلان اختلفا على اللعبة. أحدهما وضعها على الطاولة ولم يتكلم.',evidence:['وضع اللعبة','لم يتكلم'],unknown:'قد يكون يريد استراحة أو إنهاء الخلاف أو انتظار حل؛ نحتاج سؤالًا أو وقتًا.'}
] as const;
export const perspectiveScenarios=[
{title:'صندوق مغلق',a:'ليان شاهدت القلم يوضع في الصندوق.',b:'سامي دخل بعد إغلاق الصندوق.',question:'من يعرف أين القلم؟ وما الذي يعرفه سامي؟'},
{title:'نافذتان',a:'نور تقف قرب النافذة وترى الحديقة.',b:'آدم يقف خلف ستارة ولا يرى الخارج.',question:'هل يملكان المعلومات البصرية نفسها؟'},
{title:'لعبة واحدة',a:'هالة تريد اللعب بالمكعبات.',b:'رامي يريد الرسم.',question:'كيف يمكن احترام الرغبتين دون افتراض أن أحدهما يجب أن يغير رأيه؟'},
{title:'الدور التالي',a:'سارة لعبت دورها الآن.',b:'ياسر ينتظر الدور التالي.',question:'من دوره الآن؟ وما طريقة واضحة لتأكيد الانتقال؟'},
{title:'معلومة مختلفة',a:'المعلمة أخبرت مريم بتغيير مكان النشاط.',b:'كريم لم يسمع التعليمات الجديدة.',question:'ما الذي تعرفه مريم ولا يعرفه كريم؟'}
] as const;
export const problemScenarios=[
{title:'لعبة مشتركة',situation:'طفلان يريدان اللعبة نفسها في الوقت نفسه.',safe:['استخدام مؤقت للدور','اختيار لعبة أخرى مؤقتًا','طلب مساعدة إذا تعذر الاتفاق'],avoid:['أخذها بالقوة']},
{title:'رفض الدعوة',situation:'قلت لصديق: هل تريد اللعب؟ فقال: لا الآن.',safe:['احترام لا','سؤال عن وقت آخر مرة واحدة دون ضغط','اختيار نشاط آخر'],avoid:['الإلحاح حتى يوافق']},
{title:'ضجيج مرتفع',situation:'المكان صاخب وأنت تحتاج هدوءًا.',safe:['الانتقال لمكان أهدأ','استخدام وسيلة حماية مناسبة','إخبار شخص موثوق أنك تحتاج استراحة'],avoid:['البقاء رغم الألم فقط حتى لا يلاحظ أحد']},
{title:'سوء فهم',situation:'ظن صديق أنك تجاهلته لأنك لم تسمعه.',safe:['توضيح أنك لم تسمع','سؤاله عما قال','الاعتذار عن الأثر إن رغبت'],avoid:['الجدال حول من المخطئ قبل فهم ما حدث']},
{title:'حد شخصي',situation:'شخص يريد عناقًا وأنت لا تريده.',safe:['قول لا شكرًا','اقتراح تحية أخرى','الابتعاد وطلب مساعدة إذا لم يُحترم الرفض'],avoid:['الموافقة رغم عدم الرغبة فقط لتبدو مهذبًا']}
] as const;
