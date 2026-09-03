export type FreeSearchResult = {
  entity_type: string;
  entity_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  destination: string;
  score: number;
};

export type SearchIntent = 'definition' | 'assessment' | 'support' | 'treatment' | 'comparison' | 'professional' | 'school' | 'safety' | 'general';
export type SearchSubject = 'child' | 'self' | 'family' | 'professional' | 'unknown';

export type QueryUnderstanding = {
  intent: SearchIntent;
  topics: string[];
  topic_labels: string[];
  age: number | null;
  subject: SearchSubject;
  setting: 'school' | 'home' | 'work' | null;
  question_parts: string[];
  comparison_subjects: string[];
  confidence: number;
  clarifying_question: string | null;
  suggested_questions: string[];
};

export type ExtractiveAnswer = {
  mode: 'guided-extractive';
  intent: SearchIntent;
  lead: string;
  points: Array<{ text: string; title: string; destination: string }>;
  note: string | null;
};

const DIACRITICS = /[ًٌٍَُِّْـٰ]/gu;

function normalizeNumerals(value: string) {
  const eastern = '٠١٢٣٤٥٦٧٨٩';
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  return value.replace(/[٠-٩۰-۹]/gu, (digit) => {
    const easternIndex = eastern.indexOf(digit);
    if (easternIndex >= 0) return String(easternIndex);
    const persianIndex = persian.indexOf(digit);
    return persianIndex >= 0 ? String(persianIndex) : digit;
  });
}

function normalize(value: string) {
  return normalizeNumerals(value)
    .toLocaleLowerCase('ar')
    .replace(DIACRITICS, '')
    .replace(/[أإآٱ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .replace(/ة/gu, 'ه')
    .replace(/ؤ/gu, 'و')
    .replace(/ئ/gu, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

const PHRASE_REWRITES: Array<[RegExp, string]> = [
  [/(^|\s)ما\s*(?:بحكي|بيحكي|بحكيش)(?=\s|$)/giu, '$1لا يتكلم'],
  [/(^|\s)مش\s*(?:بيركز|بركز|مركز)(?=\s|$)/giu, '$1لا يركز'],
  [/(^|\s)ما\s*(?:بيركز|بركز)(?=\s|$)/giu, '$1لا يركز'],
  [/(^|\s)كتير\s+حركه(?=\s|$)/giu, '$1فرط حركة'],
  [/(^|\s)شو\s+(?:اعمل|اسوي)(?=\s|$)/giu, '$1ماذا افعل'],
  [/(^|\s)وين\s+(?:الاقي|اجد)(?=\s|$)/giu, '$1اين اجد'],
  [/(^|\s)ليش(?=\s|$)/giu, '$1لماذا'],
  [/(^|\s)اشي(?=\s|$)/giu, '$1شيء'],
  [/(^|\s)منيح(?=\s|$)/giu, '$1جيد'],
  [/(^|\s)دكتور(?=\s|$)/giu, '$1طبيب'],
  [/(^|\s)دكتوره(?=\s|$)/giu, '$1طبيبة'],
  [/(^|\s)اخصائيه(?=\s|$)/giu, '$1اخصائية'],
  [/(^|\s)روضه(?=\s|$)/giu, '$1روضة مدرسة'],
];

const TOKEN_REWRITES = new Map<string, string>([
  ['التوحدي', 'التوحد'],
  ['التوحد', 'التوحد'],
  ['اوتيزم', 'التوحد'],
  ['اوتزم', 'التوحد'],
  ['دسلكسيا', 'ديسلكسيا'],
  ['ديسليكسيا', 'ديسلكسيا'],
  ['القراءه', 'القراءة'],
  ['قراءه', 'قراءة'],
  ['تاخر', 'تأخر'],
  ['متاخر', 'متأخر'],
  ['ادمان', 'إدمان'],
  ['الادمان', 'الإدمان'],
  ['اخلاقيات', 'أخلاقيات'],
  ['اخصائي', 'أخصائي'],
  ['اخصائيه', 'أخصائية'],
]);

function rewriteArabicQuery(value: string) {
  let rewritten = normalizeNumerals(value).trim().replace(/\s+/g, ' ');
  for (const [pattern, replacement] of PHRASE_REWRITES) rewritten = rewritten.replace(pattern, replacement);
  return rewritten
    .split(/\s+/u)
    .map((token) => TOKEN_REWRITES.get(normalize(token)) ?? token)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

type TopicRule = { key: string; label: string; test: RegExp; expansion: string };
const TOPIC_RULES: TopicRule[] = [
  { key: 'autism', label: 'التوحد', test: /(توحد|اوتيزم|autism)/iu, expansion: 'التوحد طيف التوحد autism التواصل الاجتماعي السلوكيات النمطية' },
  { key: 'adhd', label: 'اضطراب نقص الانتباه وفرط الحركة', test: /(تشتت|فرط.?الحرك|لا.?يركز|adhd)/iu, expansion: 'ADHD اضطراب نقص الانتباه وفرط الحركة تشتت الانتباه' },
  { key: 'dyslexia', label: 'عسر القراءة', test: /(عسر.?القراء|ديسلكس|dyslexia)/iu, expansion: 'عسر القراءة الديسلكسيا dyslexia صعوبات القراءة' },
  { key: 'speech-language', label: 'تأخر الكلام واللغة', test: /(لا.?يتكلم|ما.?يتكلم|تاخر.?الكلام|تاخر.?النطق|تأخر.?الكلام|تأخر.?النطق|لغه|لغة)/iu, expansion: 'تأخر الكلام تأخر النطق اضطراب اللغة التواصل السمع تقييم النطق واللغة' },
  { key: 'ocd', label: 'الوسواس القهري', test: /(وسواس|ocd|erp)/iu, expansion: 'الوسواس القهري OCD ERP التعرض ومنع الاستجابة' },
  { key: 'social-anxiety', label: 'القلق الاجتماعي', test: /(قلق.?اجتماعي|رهاب.?اجتماعي|social.?anxiety)/iu, expansion: 'القلق الاجتماعي الرهاب الاجتماعي social anxiety' },
  { key: 'depression', label: 'الاكتئاب', test: /(اكتئاب|depression|postpartum)/iu, expansion: 'الاكتئاب depression التقييم الدعم العلاج' },
  { key: 'addiction', label: 'الإدمان والتعافي', test: /(ادمان|إدمان|تعاطي|اضطراب.?استخدام.?المواد|addiction|انسحاب)/iu, expansion: 'الإدمان اضطراب استخدام المواد التعافي تقليل الضرر سلامة الانسحاب addiction' },
  { key: 'rare-disease', label: 'الأمراض النادرة', test: /(مرض.?نادر|امراض.?نادر|أمراض.?نادر|rare.?disease|علاج.?جيني|gene.?therapy)/iu, expansion: 'الأمراض النادرة العلاج الجيني الفحوص الجينية rare disease gene therapy' },
  { key: 'pediatric-oncology', label: 'سرطان الأطفال', test: /(سرطان.?الاطفال|سرطان.?الأطفال|اورام.?الاطفال|أورام.?الأطفال|pediatric.?oncology)/iu, expansion: 'سرطان الأطفال أورام الأطفال pediatric oncology العلاج الدعم المتابعة' },
  { key: 'epilepsy', label: 'الصرع والنوبات', test: /(صرع|نوب(?:ه|ة|ات).?صرع|seizure|epilepsy)/iu, expansion: 'الصرع النوبات seizure epilepsy الإسعاف التقييم' },
  { key: 'social-work', label: 'العمل الاجتماعي', test: /(عمل.?اجتماعي|خدمه.?اجتماعي|خدمة.?اجتماعي|social.?work|اخلاقيات|أخلاقيات)/iu, expansion: 'العمل الاجتماعي الخدمة الاجتماعية الأخلاقيات المهنية السرية تقرير المصير social work ethics' },
  { key: 'inclusive-education', label: 'التربية الدامجة', test: /(تربيه.?دامج|تربية.?دامج|تعليم.?دامج|inclusive.?education|دمج.?مدرسي)/iu, expansion: 'التربية الدامجة التعليم الدامج inclusive education التكييفات الصفية' },
  { key: 'down-syndrome', label: 'متلازمة داون', test: /(متلازمه.?داون|متلازمة.?داون|down.?syndrome)/iu, expansion: 'متلازمة داون Down syndrome النمو التعليم الصحة' },
  { key: 'cerebral-palsy', label: 'الشلل الدماغي', test: /(شلل.?دماغي|cerebral.?palsy)/iu, expansion: 'الشلل الدماغي cerebral palsy التأهيل الحركة التواصل' },
  { key: 'learning-difficulties', label: 'صعوبات التعلم', test: /(صعوبات.?التعلم|اضطراب.?التعلم|learning.?disabilit)/iu, expansion: 'صعوبات التعلم اضطرابات التعلم learning disabilities التقييم المدرسة' },
];

function detectIntent(query: string): SearchIntent {
  const q = normalize(query);
  if (/(خطر|طوارئ|جرعه (?:زايده|كبيره)|overdose|نزيف شديد|فقد(?:ت)? الوعي|فاقد الوعي|اغماء|اغمي|لا يستجيب|غير مستجيب|صعوبه التنفس|لا يتنفس|توقف التنفس|تسمم|اختناق|تشنج مستمر|انسحاب شديد)/u.test(q)) return 'safety';
  if (/(الفرق|مقارنه|مقارنة|ام .* ام |مقابل|\bvs\b)/u.test(q)) return 'comparison';
  if (/(علامات|اعراض|أعراض|كيف اعرف|هل .* مصاب|تشخيص|تقييم|متي اطلب تقييم|متى اطلب تقييم)/u.test(q)) return 'assessment';
  if (/(علاج|دواء|ادويه|أدوية|تدخل|رعايه|رعاية|ماذا افعل|ما المفيد|خطة علاج)/u.test(q)) return 'treatment';
  if (/(مدرسه|مدرسة|مدرسي|صف|معلم|معلمه|معلمة|تكييف|امتحان|واجب)/u.test(q)) return 'school';
  if (/(كيف اساعد|دعم|مساعده|مساعدة|في المنزل|للاسره|للأسرة|للوالدين)/u.test(q)) return 'support';
  if (/(مختص|اخصائي|أخصائي|مركز|معالج|طبيب|جهه|جهة|اين اجد|أين أجد)/u.test(q)) return 'professional';
  if (/^(ما هو|ما هي|ما معنى|ما معني|تعريف|ما المقصود)/u.test(q)) return 'definition';
  return 'general';
}

function extractAge(query: string) {
  const q = normalizeNumerals(query);
  const explicit = q.match(/(?:عمر(?:ه|ها|ي)?|بعمر)\s*(\d{1,2})\s*(?:سنه|سنة|سنوات|عام|اعوام|أعوام)/iu);
  const loose = q.match(/\b(\d{1,2})\s*(?:سنه|سنة|سنوات|عام|اعوام|أعوام)\b/iu);
  const value = Number(explicit?.[1] ?? loose?.[1]);
  return Number.isFinite(value) && value >= 1 && value <= 100 ? value : null;
}

function detectSubject(query: string): SearchSubject {
  const q = normalize(query);
  if (/(طفلي|ابني|ابنتي|بنتي|طفل|طفله|طفلة|ولدي|ولدي)/u.test(q)) return 'child';
  if (/(زوجي|زوجتي|والدي|والدتي|امي|أمي|ابي|أبي|اخي|أخي|اختي|أختي|قريبي)/u.test(q)) return 'family';
  if (/(انا|أشعر|اشعر|عندي|لدي|اعاني|أعاني)/u.test(q)) return 'self';
  if (/(انا معلم|معلمه|معلمة|اخصائي|أخصائي|مختص|ممارس|باحث)/u.test(q)) return 'professional';
  return 'unknown';
}

function detectSetting(query: string): QueryUnderstanding['setting'] {
  const q = normalize(query);
  if (/(مدرسه|مدرسة|صف|معلم|معلمه|معلمة|روضه|روضة|جامعه|جامعة)/u.test(q)) return 'school';
  if (/(بيت|منزل|في المنزل|بالبيت)/u.test(q)) return 'home';
  if (/(عمل|وظيفه|وظيفة|مكان العمل)/u.test(q)) return 'work';
  return null;
}

function splitQuestionParts(query: string) {
  return query
    .split(/(?:[؟?؛;]+|\s+و(?=(?:هل|ماذا|ما|كيف|متى|أين|اين|لماذا)\s))/u)
    .map((part) => part.trim().replace(/^و/u, ''))
    .filter((part) => part.length >= 5)
    .slice(0, 3);
}

function extractComparisonSubjects(query: string) {
  const q = query.replace(/[؟?]/g, ' ').replace(/\s+/g, ' ').trim();
  const explicit = q.match(/(?:الفرق\s+بين\s+)?(.{2,55}?)\s+(?:أم|ام|مقابل|\bvs\b)\s+(.{2,55})/iu);
  if (!explicit) return [];
  return [explicit[1], explicit[2]].map((part) => part.trim()).filter(Boolean).slice(0, 2);
}

function suggestionsFor(intent: SearchIntent, topicLabel: string | undefined) {
  const topic = topicLabel ? ` عن ${topicLabel}` : '';
  const common = {
    assessment: [`ما الخطوات التالية${topic}؟`, 'متى أحتاج تقييمًا متخصصًا؟', 'ما العلامات التي تستدعي مراجعة أسرع؟'],
    treatment: [`ما خيارات الدعم والعلاج${topic}؟`, 'ما الذي يمكن عمله عمليًا في المنزل؟', 'متى أراجع مختصًا؟'],
    support: [`ما الخطوات العملية${topic}؟`, 'ما الأخطاء الشائعة التي يجب تجنبها؟', 'كيف أتابع التقدم؟'],
    comparison: ['ما العلامات التي تساعد على التفريق؟', 'متى نحتاج تقييمًا متخصصًا؟', 'ما الذي يمكن أن يتشابه بين الحالتين؟'],
    school: ['ما التكييفات الصفية المناسبة؟', 'كيف أتعاون مع المدرسة؟', 'كيف أقيس التقدم؟'],
    professional: ['ما نوع المختص المناسب؟', 'ما الذي أجهزه قبل الموعد؟', 'ما الأسئلة التي أطرحها على المختص؟'],
    definition: [`ما أهم العلامات${topic}؟`, `كيف يتم التقييم${topic}؟`, `ما خيارات الدعم${topic}؟`],
    safety: ['ما علامات الخطر التي تستدعي الطوارئ؟', 'ماذا أفعل حتى تصل المساعدة؟', 'ما المعلومات التي أجهزها للطوارئ؟'],
    general: ['ما أهم النقاط التي يجب أن أعرفها؟', 'ما الخطوات العملية التالية؟', 'متى أراجع مختصًا؟'],
  } satisfies Record<SearchIntent, string[]>;
  return common[intent];
}

function clarificationFor(understanding: Omit<QueryUnderstanding, 'clarifying_question' | 'suggested_questions'>) {
  if (understanding.intent === 'safety') return null;
  if (understanding.subject === 'child' && understanding.topics.includes('speech-language') && understanding.age === null) {
    return 'كم عمر الطفل؟ العمر مهم جدًا عند تفسير تأخر الكلام واللغة واختيار الخطوة التالية.';
  }
  if (understanding.intent === 'treatment' && understanding.topics.length === 0) {
    return 'ما الحالة أو العرض الذي تريد معرفة خيارات العلاج أو الدعم له؟';
  }
  if (understanding.intent === 'general' && understanding.topics.length === 0 && understanding.question_parts.length <= 1) {
    return 'ما المشكلة الأساسية التي تريد فهمها: الأعراض، التقييم، العلاج، الدعم في المنزل، أم المدرسة؟';
  }
  return null;
}

export function analyzeFreeQuery(query: string): QueryUnderstanding {
  const rewritten = rewriteArabicQuery(query);
  const normalized = normalize(`${query} ${rewritten}`);
  const matchedTopics = TOPIC_RULES.filter((rule) => rule.test.test(normalized));
  const intent = detectIntent(rewritten);
  const subject = detectSubject(rewritten);
  const age = extractAge(rewritten);
  const setting = detectSetting(rewritten);
  const questionParts = splitQuestionParts(rewritten);
  const comparisonSubjects = intent === 'comparison' ? extractComparisonSubjects(rewritten) : [];
  const signals = Number(matchedTopics.length > 0) + Number(intent !== 'general') + Number(subject !== 'unknown') + Number(age !== null) + Number(setting !== null) + Number(questionParts.length > 1);
  const confidence = Math.min(0.96, 0.42 + signals * 0.09);
  const base = {
    intent,
    topics: matchedTopics.map((topic) => topic.key),
    topic_labels: matchedTopics.map((topic) => topic.label),
    age,
    subject,
    setting,
    question_parts: questionParts,
    comparison_subjects: comparisonSubjects,
    confidence,
  };
  return {
    ...base,
    clarifying_question: clarificationFor(base),
    suggested_questions: suggestionsFor(intent, matchedTopics[0]?.label),
  };
}

export function buildFreeQueryVariants(query: string, understanding = analyzeFreeQuery(query)) {
  const cleaned = normalizeNumerals(query).trim().replace(/\s+/g, ' ').slice(0, 220);
  const rewritten = rewriteArabicQuery(cleaned);
  const topicExpansions = TOPIC_RULES
    .filter((rule) => understanding.topics.includes(rule.key))
    .map((rule) => rule.expansion);

  const semanticVariant = [...new Set([rewritten, ...topicExpansions])]
    .filter(Boolean)
    .join(' ')
    .slice(0, 220);

  const intentTerms: Partial<Record<SearchIntent, string>> = {
    assessment: 'علامات أعراض تقييم تشخيص متى يحتاج تقييم',
    treatment: 'علاج تدخل دعم رعاية خطة عملية',
    support: 'دعم الأسرة خطوات عملية المنزل',
    comparison: 'الفرق مقارنة تشابه اختلاف تقييم تفريقي',
    school: 'مدرسة تكييفات صفية معلم دعم تعليمي',
    professional: 'مختص أخصائي مركز تقييم إحالة',
    safety: 'سلامة طوارئ علامات خطر إسعاف',
  };

  const guidedVariant = [
    understanding.topic_labels.join(' '),
    understanding.comparison_subjects.join(' '),
    intentTerms[understanding.intent] ?? '',
    understanding.setting === 'school' ? 'مدرسة صف تعليم' : '',
  ].filter(Boolean).join(' ').slice(0, 220);

  const partVariant = understanding.question_parts.length > 1
    ? understanding.question_parts.join(' ').slice(0, 220)
    : '';

  return [cleaned, semanticVariant, guidedVariant || partVariant]
    .map((value) => value.trim().replace(/\s+/g, ' '))
    .filter((value, index, values) => value.length >= 2 && values.indexOf(value) === index)
    .slice(0, 3);
}

function queryTokens(query: string) {
  const STOP = new Set(['كيف', 'هل', 'ما', 'ماذا', 'من', 'في', 'على', 'الى', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'هو', 'هي', 'او', 'أو', 'عند', 'لدي', 'اريد', 'أريد', 'شو', 'وين', 'طفلي', 'ابني']);
  const rewritten = rewriteArabicQuery(query);
  return [...new Set(normalize(rewritten).split(' ').filter((token) => token.length >= 2 && !STOP.has(token)))];
}

function relevantTopicRules(understanding: QueryUnderstanding) {
  return TOPIC_RULES.filter((rule) => understanding.topics.includes(rule.key));
}

function rowMatchesTopic(row: Pick<FreeSearchResult, 'title' | 'subtitle' | 'destination'>, rules: TopicRule[]) {
  if (!rules.length) return true;
  const haystack = normalize(`${row.title} ${row.subtitle ?? ''} ${row.destination}`);
  return rules.some((rule) => rule.test.test(haystack));
}

export function rerankFreeResults(query: string, results: FreeSearchResult[], understanding = analyzeFreeQuery(query)) {
  const tokens = queryTokens(query);
  const topicTokens = understanding.topic_labels.flatMap((label) => normalize(label).split(' ')).filter((token) => token.length >= 3);
  const topicRules = relevantTopicRules(understanding);
  const intentSignals: Partial<Record<SearchIntent, RegExp>> = {
    assessment: /(علامات|اعراض|أعراض|تقييم|تشخيص|فحص)/iu,
    treatment: /(علاج|تدخل|رعايه|رعاية|دواء|تأهيل|دعم)/iu,
    support: /(دعم|اسره|أسرة|منزل|خطوات|ارشاد|إرشاد)/iu,
    comparison: /(فرق|مقارن|تمييز|تفريق|تشابه|اختلاف)/iu,
    school: /(مدرس|صف|تعليم|تكييف|معلم|روضة)/iu,
    professional: /(مختص|اخصائي|أخصائي|مركز|طبيب|معالج)/iu,
    safety: /(طوارئ|خطر|اسعاف|إسعاف|سلامه|سلامة|جرعه|جرعة|تسمم|وعي)/iu,
  };
  const intentSignal = intentSignals[understanding.intent];

  return results
    .map((row) => {
      const title = normalize(row.title);
      const subtitle = normalize(row.subtitle ?? '');
      const excerpt = normalize(row.excerpt ?? '');
      const destination = normalize(row.destination);
      const titleHits = tokens.filter((token) => title.includes(token)).length;
      const subtitleHits = tokens.filter((token) => subtitle.includes(token)).length;
      const excerptHits = tokens.filter((token) => excerpt.includes(token)).length;
      const topicHits = topicTokens.filter((token) => title.includes(token) || subtitle.includes(token) || destination.includes(token)).length;
      let bonus = titleHits * 34 + subtitleHits * 18 + Math.min(excerptHits, 5) * 7 + topicHits * 15;
      if (topicRules.length) bonus += rowMatchesTopic(row, topicRules) ? 2600 : -2200;
      if (intentSignal?.test(`${row.title} ${row.subtitle ?? ''} ${row.excerpt ?? ''}`)) bonus += 22;
      if (understanding.setting === 'school' && /(school|education|مدرس|تعليم|صف)/iu.test(`${row.destination} ${row.title}`)) bonus += 20;
      return { ...row, score: Number(row.score) + bonus };
    })
    .sort((a, b) => Number(b.score) - Number(a.score) || a.title.localeCompare(b.title, 'ar'));
}

function cleanExcerpt(value: string | null) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s·•–—-]+/g, '')
    .trim();
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!؟])\s+|[•●▪]+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 24 && sentence.length <= 300);
}

function sentenceScore(sentence: string, tokens: string[], position: number, intent: SearchIntent) {
  const s = normalize(sentence);
  const hits = tokens.filter((token) => s.includes(token)).length;
  const coverage = tokens.length ? hits / tokens.length : 0;
  let score = coverage * 10 + hits * 2 - position * 0.15;
  if (/(ينصح|يساعد|يحتاج|يشمل|يعتمد|يظهر|تظهر|يمكن|ينبغي|متى|عندما|علامات|تقييم|دعم|علاج|مدرسه|مدرسة|طوارئ)/u.test(s)) score += 1.5;
  if (intent === 'comparison' && /(بينما|على العكس|يختلف|الفرق|يتشابه|تمييز)/u.test(s)) score += 2;
  if (/(اشترك|سجل الآن|اقرأ المزيد|حقوق النشر|المصدر:)/u.test(s)) score -= 5;
  return score;
}

export function buildExtractiveAnswer(
  query: string,
  results: FreeSearchResult[],
  understanding = analyzeFreeQuery(query),
): ExtractiveAnswer | null {
  if (!results.length) return null;
  const tokens = queryTokens(query);
  const topicRules = relevantTopicRules(understanding);
  const topicScopedResults = topicRules.length ? results.filter((result) => rowMatchesTopic(result, topicRules)) : results;
  const answerResults = topicRules.length ? topicScopedResults : results;
  if (!answerResults.length) return null;
  const points: ExtractiveAnswer['points'] = [];
  const seen = new Set<string>();

  for (const result of answerResults.slice(0, 7)) {
    const excerpt = cleanExcerpt(result.excerpt);
    if (!excerpt) continue;
    const sentences = splitSentences(excerpt);
    const candidate = (sentences.length ? sentences : [excerpt])
      .map((sentence, index) => ({ sentence, score: sentenceScore(sentence, tokens, index, understanding.intent) }))
      .sort((a, b) => b.score - a.score)[0]?.sentence;
    if (!candidate) continue;
    const fingerprint = normalize(candidate).slice(0, 120);
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    points.push({
      text: candidate.length > 300 ? `${candidate.slice(0, 297)}…` : candidate,
      title: result.title,
      destination: result.destination,
    });
    if (points.length >= 4) break;
  }

  if (!points.length) return null;

  const topic = understanding.topic_labels[0];
  const ageContext = understanding.subject === 'child' && understanding.age ? ` لطفل بعمر ${understanding.age} سنوات` : '';
  const leadByIntent: Record<SearchIntent, string> = {
    definition: topic ? `هذا أقرب شرح مباشر وجدته عن ${topic} داخل روافد:` : 'هذا أقرب شرح مباشر وجدته داخل روافد:',
    assessment: `لفهم العلامات والتقييم${ageContext}، هذه أكثر النقاط صلة من محتوى روافد:`,
    support: `للدعم العملي${ageContext}، ابدأ بهذه النقاط المستندة إلى محتوى روافد:`,
    treatment: `بخصوص العلاج والرعاية${ageContext}، هذه أهم المعلومات الأقرب لسؤالك:`,
    comparison: understanding.comparison_subjects.length === 2
      ? `للمقارنة بين ${understanding.comparison_subjects[0]} و${understanding.comparison_subjects[1]}، هذه أكثر الأدلة صلة داخل روافد:`
      : 'للمقارنة بدقة، هذه أقرب النقاط التي تساعد على فهم الفروق داخل روافد:',
    professional: 'للوصول إلى المسار المهني المناسب، هذه أقرب الموارد والمعلومات ذات الصلة:',
    school: `في سياق المدرسة${ageContext}، هذه أبرز المعلومات العملية المرتبطة بسؤالك:`,
    safety: 'هذه أبرز معلومات السلامة المرتبطة بسؤالك من محتوى روافد:',
    general: topic ? `فهمت أن سؤالك يدور حول ${topic}. هذه الخلاصة الأقرب من محتوى روافد:` : 'هذه الخلاصة الأقرب لسؤالك من محتوى روافد:',
  };

  const note = understanding.intent === 'assessment'
    ? 'هذه معلومات تثقيفية مستخرجة من صفحات روافد، ولا تكفي وحدها لإثبات تشخيص.'
    : understanding.intent === 'treatment'
      ? 'اختيار العلاج يعتمد على الحالة الفردية والتقييم المهني؛ افتح المصادر أدناه لقراءة السياق الكامل.'
      : understanding.intent === 'comparison'
        ? 'قد تتشابه بعض العلامات بين الحالات؛ المقارنة هنا للتثقيف وليست بديلًا عن التقييم التفريقي عند الحاجة.'
        : understanding.intent === 'safety'
          ? 'عند وجود خطر مباشر أو تدهور سريع، تُقدَّم خدمات الطوارئ والتقييم العاجل على استخدام البحث داخل الموقع.'
          : null;

  return { mode: 'guided-extractive', intent: understanding.intent, lead: leadByIntent[understanding.intent], points, note };
}
