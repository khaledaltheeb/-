import { makeExtensionTrial as makeBaseExtensionTrial, supportsExtensionMode } from './engine-extension.mjs';

const SYMBOLS = ['●', '▲', '■', '◆', '★', '⬟', '✚', '⬢'];
const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];
const DIRECTIONS = ['↑', '→', '↓', '←'];

function hashText(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function seededRandom(seed) {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (random, values) => values[Math.floor(random() * values.length)];
const int = (random, min, max) => min + Math.floor(random() * (max - min + 1));
function shuffle(random, values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function unique(values) { return [...new Set(values.map(String))]; }
function finish(random, tool, level, raw) {
  const answer = String(raw.answer);
  const options = shuffle(random, unique(raw.options));
  if (!options.includes(answer)) options.push(answer);
  const semantic = [tool.slug, level, raw.study ?? '', raw.prompt, raw.display ?? '', answer, [...options].sort().join('|'), raw.difficultySignature].join('::');
  return {
    kind: raw.kind ?? 'choice',
    prompt: raw.prompt,
    ...(raw.display ? { display: raw.display } : {}),
    ...(raw.study ? { study: raw.study } : {}),
    answer,
    options: options.map((value) => ({ value, label: value })),
    rationale: raw.rationale,
    level,
    difficultyDescriptor: raw.difficultyDescriptor,
    difficultySignature: raw.difficultySignature,
    fingerprint: hashText(semantic).toString(16).padStart(8, '0'),
  };
}

const LANGUAGE_BANKS = {
  phoneme_discrimination: [
    ['أي زوج يبدأ بصوتين مختلفين بوضوح؟', 'باب – تاب', ['باب – تاب','دار – دود','ليل – لون','سور – سمك']],
    ['أي زوج يبدأ بالصوت نفسه؟', 'سور – سمك', ['سور – سمك','نور – دار','بيت – زيت','قلم – جبل']],
    ['أي زوج يختلف في الحرف الأول فقط مع بقاء بقية البنية متقاربة؟', 'نور – سور', ['نور – سور','باب – بيت','دار – دور','قلم – علم']],
    ['أي زوج يشترك في البداية الصوتية الأقرب؟', 'كتاب – كتابة', ['كتاب – كتابة','باب – تاب','نور – سور','قمر – نهر']],
  ],
  syllable_segmentation: [
    ['أي خيار يقسم «كاتب» إلى وحدتين نطقيتين واضحتين؟', 'كا – تب', ['كا – تب','ك – اتب','كات – ب','كاتب']],
    ['أي خيار يقسم «سافر» إلى وحدتين نطقيتين واضحتين؟', 'سا – فر', ['سا – فر','س – افر','ساف – ر','سافر']],
    ['أي خيار يقسم «دارس» إلى وحدتين نطقيتين واضحتين؟', 'دا – رس', ['دا – رس','د – ارس','دار – س','دارس']],
    ['أي خيار يقسم «شارع» إلى وحدتين نطقيتين واضحتين؟', 'شا – رع', ['شا – رع','ش – ارع','شار – ع','شارع']],
  ],
  rhyme_judgment: [
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'نور – سور', ['نور – سور','باب – قلم','بيت – شجر','قمر – طريق']],
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'كتاب – باب', ['كتاب – باب','ورد – طريق','قمر – بيت','نور – قلم']],
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'دار – نار', ['دار – نار','بيت – باب','سور – قلم','علم – طريق']],
    ['أي زوج يتشارك نهاية صوتية أقرب؟', 'جميل – قليل', ['جميل – قليل','كتاب – شجر','باب – نور','قمر – طريق']],
  ],
  lexical_decision: [
    ['أي سلسلة كلمة عربية مألوفة؟', 'نافذة', ['نافذة','زافنة','درفوم','حفمات']],
    ['أي سلسلة كلمة عربية مألوفة؟', 'مفتاح', ['مفتاح','حفمات','تربوص','سرفاج']],
    ['أي سلسلة كلمة عربية مألوفة؟', 'مدرسة', ['مدرسة','درمسة','مسرود','ترداس']],
    ['أي سلسلة كلمة عربية مألوفة؟', 'طريق', ['طريق','طراغ','ضريق','تروغ']],
  ],
  semantic_association: [
    ['ما الأكثر ارتباطًا بـ«مفتاح»؟', 'قفل', ['قفل','غيمة','وسادة','شجرة']],
    ['ما الأكثر ارتباطًا بـ«بوصلة»؟', 'اتجاه', ['اتجاه','مذاق','وسادة','نافذة']],
    ['ما الأكثر ارتباطًا بـ«مظلة»؟', 'مطر', ['مطر','مفتاح','كتاب','مرآة']],
    ['ما الأكثر ارتباطًا بـ«ميزان»؟', 'وزن', ['وزن','لون','صوت','سرعة']],
  ],
  verbal_inference: [
    ['قرأ سامر التعليمات قبل تشغيل الجهاز، ثم أعاد الخطوة التي أخطأ فيها. ما الاستنتاج المدعوم؟', 'راجع الإجراء قبل المحاولة الثانية', ['راجع الإجراء قبل المحاولة الثانية','نجح من أول مرة','لم يقرأ التعليمات','تعطل الجهاز']],
    ['وصلت الحافلة بعد بدء المطر بدقائق، وكان مع ليلى مظلة مغلقة. ما الذي يدعمه النص؟', 'كانت المظلة مع ليلى', ['كانت المظلة مع ليلى','استخدمت المظلة قبل المطر','توقفت الحافلة بسبب المطر','لم تمطر']],
    ['وضع فهد الملف على المكتب ثم أغلق الغرفة بالمفتاح. ما الذي يدعمه النص؟', 'كان الملف على المكتب قبل إغلاق الغرفة', ['كان الملف على المكتب قبل إغلاق الغرفة','أخذ فهد الملف معه','ضاع المفتاح','بقيت الغرفة مفتوحة']],
    ['أنهت مريم الصفحة الأولى قبل أن تبدأ الثانية. ما الاستنتاج المدعوم؟', 'بدأت الصفحة الثانية بعد إنهاء الأولى', ['بدأت الصفحة الثانية بعد إنهاء الأولى','قرأت الصفحتين معًا','لم تنه الصفحة الأولى','تجاوزت الصفحة الثانية']],
  ],
  ambiguity_resolution: [
    ['في جملة «جلس الطالب قرب عين الماء»، ما معنى «عين»؟', 'نبع', ['نبع','عضو البصر','جاسوس','حرف']],
    ['في جملة «راجع المصرف قبل السفر»، ما معنى «المصرف»؟', 'البنك', ['البنك','مكان تصريف الماء','اتجاه الطريق','النافذة']],
    ['في جملة «رفع اللاعب رأس الحربة»، ما المقصود بـ«رأس» هنا؟', 'مقدمة الحربة', ['مقدمة الحربة','عضو الجسم','مدير المؤسسة','قمة الجبل']],
    ['في جملة «فتح الباحث باب النقاش»، ما معنى «باب»؟', 'مدخل موضوع', ['مدخل موضوع','باب منزل','قطعة أثاث','طريق مغلق']],
  ],
  morphological_reasoning: [
    ['كاتب : كتابة :: قارئ : ؟', 'قراءة', ['قراءة','مقروء','كتاب','قارئ']],
    ['تعليم : معلّم :: تدريب : ؟', 'مدرّب', ['مدرّب','متدرّب','تدريب','درس']],
    ['زرع : زارع :: صنع : ؟', 'صانع', ['صانع','مصنوع','صناعة','زرع']],
    ['بحث : باحث :: رسم : ؟', 'راسم', ['راسم','مرسوم','رسم','لوحة']],
  ],
};

function languageTrial(random, tool, level, index) {
  const bank = LANGUAGE_BANKS[tool.mode];
  const row = bank[(index + int(random, 0, 31)) % bank.length];
  return finish(random, tool, level, {
    prompt: row[0], answer: row[1], options: row[2],
    rationale: `الإجابة «${row[1]}» هي المطابقة المطلوبة وفق القاعدة اللغوية المحددة في السؤال.`,
    difficultyDescriptor: `معالجة لغوية تعليمية بدرجة ${level}`,
    difficultySignature: `${tool.mode}:${level}`,
  });
}

function visualClosureTrial(random, tool, level) {
  const a = pick(random, SYMBOLS.slice(0, 4));
  const b = pick(random, SYMBOLS.filter((s) => s !== a).slice(0, 5));
  const repeats = 2 + level;
  const sequence = Array.from({ length: repeats * 2 }, (_, i) => i % 2 === 0 ? a : b);
  const missing = int(random, 0, sequence.length - 1);
  const answer = sequence[missing];
  const display = sequence.map((value, i) => i === missing ? '؟' : value).join(' ');
  return finish(random, tool, level, {
    prompt: 'النمط يتناوب بين رمزين. أي رمز يكمل الموضع الناقص؟', display, answer,
    options: [a, b, ...shuffle(random, SYMBOLS.filter((s) => s !== a && s !== b)).slice(0, 2)],
    rationale: `النمط يتناوب ${a} ثم ${b}؛ لذلك الموضع الناقص يجب أن يكون ${answer}.`,
    difficultyDescriptor: `نمط تناوبي بطول ${sequence.length}`,
    difficultySignature: `visual-closure:${level}`,
  });
}

function embeddedPatternTrial(random, tool, level) {
  const target = shuffle(random, SYMBOLS).slice(0, Math.min(2 + level, 5));
  const before = shuffle(random, SYMBOLS).slice(0, 1 + level);
  const after = shuffle(random, SYMBOLS).slice(0, 1 + level);
  const display = [...before, ...target, ...after].join(' ');
  const answer = `${before.length + 1}–${before.length + target.length}`;
  const options = [
    answer,
    `1–${target.length}`,
    `${Math.max(1, before.length)}–${Math.max(1, before.length) + target.length - 1}`,
    `${before.length + 2}–${before.length + target.length + 1}`,
  ];
  return finish(random, tool, level, {
    prompt: `المستهدف: ${target.join(' ')}. في أي نطاق متتالٍ يظهر داخل السلسلة؟`, display, answer, options,
    rationale: `يبدأ النمط المستهدف عند الموضع ${before.length + 1} وينتهي عند ${before.length + target.length}.`,
    difficultyDescriptor: `هدف بطول ${target.length} داخل سلسلة من ${before.length + target.length + after.length} عناصر`,
    difficultySignature: `embedded-pattern:${level}`,
  });
}

function spatialTransformTrial(random, tool, level) {
  const turnCount = 1 + level;
  let direction = 0;
  const operations = [];
  for (let i = 0; i < turnCount; i += 1) {
    const right = int(random, 0, 1) === 1;
    operations.push(right ? 'يمين 90°' : 'يسار 90°');
    direction = (direction + (right ? 1 : 3)) % 4;
  }
  return finish(random, tool, level, {
    kind: 'memory', study: `ابدأ من ↑ ثم طبّق التحولات بالترتيب: ${operations.join('، ')}`,
    prompt: 'ما الاتجاه النهائي بعد جميع التحولات؟', answer: DIRECTIONS[direction], options: DIRECTIONS,
    rationale: `بتطبيق التحولات واحدًا بعد الآخر يصبح الاتجاه النهائي ${DIRECTIONS[direction]}.`,
    difficultyDescriptor: `${turnCount} تحولات مكانية متتابعة`,
    difficultySignature: `spatial-transform:${level}`,
  });
}

function syllogismTrial(random, tool, level) {
  const labels = shuffle(random, ['الفئة أ','الفئة ب','الفئة ج','الفئة د','الفئة هـ']);
  const [a,b,c] = labels;
  const valid = int(random, 0, 1) === 1;
  const conclusion = valid ? `كل ${a} من ${c}` : `كل ${c} من ${a}`;
  return finish(random, tool, level, {
    prompt: `المقدمات: كل ${a} من ${b}. كل ${b} من ${c}. النتيجة المقترحة: ${conclusion}.`,
    answer: valid ? 'تتبع منطقيًا' : 'لا تتبع منطقيًا', options: ['تتبع منطقيًا','لا تتبع منطقيًا'],
    rationale: valid ? `الاشتمال ينتقل من ${a} إلى ${b} ثم ${c}.` : 'المقدمات لا تسمح بعكس اتجاه الاشتمال.',
    difficultyDescriptor: `قياس فئوي بدرجة ${level}`,
    difficultySignature: `syllogism:${level}`,
  });
}

function constraintPlanningTrial(random, tool, level) {
  const items = shuffle(random, LETTERS).slice(0, 4);
  const answer = items.join(' → ');
  const options = [answer, [items[1],items[0],items[2],items[3]].join(' → '), [items[0],items[2],items[1],items[3]].join(' → '), [...items].reverse().join(' → ')];
  return finish(random, tool, level, {
    prompt: `رتّب العناصر إذا كان ${items[0]} قبل ${items[1]}، و${items[1]} قبل ${items[2]}، و${items[2]} قبل ${items[3]}.`,
    answer, options,
    rationale: `الترتيب الوحيد الذي يحقق القيود الثلاثة هو ${answer}.`,
    difficultyDescriptor: `ثلاثة قيود ترتيب مع تنويع العناصر؛ المستوى ${level}`,
    difficultySignature: `constraint-planning:${level}`,
  });
}

function meansEndTrial(random, tool, level) {
  const goal = 5 + level + int(random, 0, 4);
  const blocked = goal - 1;
  const answer = goal % 2 === 0 ? '+2' : '+1';
  return finish(random, tool, level, {
    prompt: `ابدأ من 0 وهدفك ${goal}. يمكنك +1 أو +2، لكن لا يجوز الوقوف على ${blocked}. أي خطوة أولى تسمح بمسار قصير مع تجنب النقطة المحظورة؟`,
    answer, options: ['+1','+2','توقف','-1'],
    rationale: `اختيار ${answer} يحافظ على مسار مختصر يمكنه الوصول إلى ${goal} من دون الحاجة للوقوف على ${blocked}.`,
    difficultyDescriptor: `هدف ${goal} مع نقطة محظورة واحدة`,
    difficultySignature: `means-end:${level}`,
  });
}

const PATCHED = new Set([
  'visual_closure','embedded_pattern','spatial_folding','syllogistic_reasoning','constraint_planning','means_end_planning',
  ...Object.keys(LANGUAGE_BANKS),
]);

export { supportsExtensionMode };

export function makeExtensionTrial(tool, level, trialIndex, sessionSeed = 1) {
  if (!PATCHED.has(tool.mode)) return makeBaseExtensionTrial(tool, level, trialIndex, sessionSeed);
  const normalizedLevel = Math.min(5, Math.max(1, Math.trunc(Number(level) || 1)));
  const normalizedIndex = Math.max(0, Math.trunc(Number(trialIndex) || 0));
  const random = seededRandom(hashText(`${tool.slug}:${normalizedLevel}:${normalizedIndex}:${sessionSeed}:quality-v1`));
  if (LANGUAGE_BANKS[tool.mode]) return languageTrial(random, tool, normalizedLevel, normalizedIndex);
  if (tool.mode === 'visual_closure') return visualClosureTrial(random, tool, normalizedLevel);
  if (tool.mode === 'embedded_pattern') return embeddedPatternTrial(random, tool, normalizedLevel);
  if (tool.mode === 'spatial_folding') return spatialTransformTrial(random, tool, normalizedLevel);
  if (tool.mode === 'syllogistic_reasoning') return syllogismTrial(random, tool, normalizedLevel);
  if (tool.mode === 'constraint_planning') return constraintPlanningTrial(random, tool, normalizedLevel);
  if (tool.mode === 'means_end_planning') return meansEndTrial(random, tool, normalizedLevel);
  return makeBaseExtensionTrial(tool, level, trialIndex, sessionSeed);
}
