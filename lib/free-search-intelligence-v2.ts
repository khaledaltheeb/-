export type SearchIntent = 'definition' | 'assessment' | 'support' | 'treatment' | 'comparison' | 'professional' | 'school' | 'safety' | 'general';

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

export type QueryUnderstanding = {
  intent: SearchIntent;
  topics: Array<{ id: string; label: string }>;
  audience: 'child' | 'self' | 'family' | 'professional' | 'general';
  age_years: number | null;
  settings: Array<'home' | 'school' | 'work' | 'clinical'>;
  confidence: 'high' | 'medium' | 'low';
  summary: string;
  clarification: string | null;
  follow_ups: string[];
};

export type SmartExtractiveAnswer = {
  mode: 'extractive-v2';
  intent: SearchIntent;
  lead: string;
  points: Array<{ text: string; title: string; destination: string }>;
  note: string | null;
};

type TopicRule = {
  id: string;
  label: string;
  test: RegExp;
  expansion: string;
};

const DIACRITICS = /[ًٌٍَُِّْـٰ]/gu;
const STOP = new Set(['كيف', 'هل', 'ما', 'ماذا', 'من', 'في', 'على', 'الى', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'هو', 'هي', 'او', 'أو', 'عند', 'لدي', 'اريد', 'أريد', 'شو', 'وين', 'طيب', 'تمام', 'يعني']);

function normalize(value: string) {
  return value
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
  [/\bما\s*(?:بحكي|بيحكي|بحكيش)\b/giu, 'لا يتكلم'],
  [/\bمش\s*(?:بيركز|بركز|مركز)\b/giu, 'لا يركز'],
  [/\bما\s*(?:بيركز|بركز)\b/giu, 'لا يركز'],
  [/\bكتير\s+حركه\b/giu, 'فرط حركة'],
  [/\bشو\s+(?:اعمل|اسوي)\b/giu, 'ماذا افعل'],
  [/\bوين\s+(?:الاقي|اجد)\b/giu, 'اين اجد'],
  [/\bبحس\b/giu, 'اشعر'],
  [/\bمش\s+طبيعي\b/giu, 'غير معتاد'],
  [/\bدكتور\b/giu, 'طبيب'],
  [/\bدكتوره\b/giu, 'طبيبة'],
  [/\bاخصائيه\b/giu, 'اخصائية'],
  [/\bروضه\b/giu, 'روضة مدرسة'],
];

const TOKEN_REWRITES = new Map<string, string>([
  ['التوحدي', 'التوحد'], ['اوتيزم', 'التوحد'], ['اوتزم', 'التوحد'],
  ['دسلكسيا', 'ديسلكسيا'], ['ديسليكسيا', 'ديسلكسيا'],
  ['القراءه', 'القراءة'], ['قراءه', 'قراءة'], ['تاخر', 'تأخر'], ['متاخر', 'متأخر'],
  ['ادمان', 'إدمان'], ['الادمان', 'الإدمان'], ['اخلاقيات', 'أخلاقيات'],
  ['اخصائي', 'أخصائي'], ['اخصائيه', 'أخصائية'], ['مدرسه', 'مدرسة'],
]);

function rewriteArabicQuery(value: string) {
  let rewritten = value.trim().replace(/\s+/g, ' ');
  for (const [pattern, replacement] of PHRASE_REWRITES) rewritten = rewritten.replace(pattern, replacement);
  return rewritten
    .split(/\s+/u)
    .map((token) => TOKEN_REWRITES.get(normalize(token)) ?? token)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

const TOPICS: TopicRule[] = [
  { id: 'autism', label: 'التوحد', test: /(توحد|اوتيزم|autism)/iu, expansion: 'التوحد طيف التوحد autism التواصل الاجتماعي السلوك النمائي' },
  { id: 'adhd', label: 'تشتت الانتباه وفرط الحركة', test: /(تشتت|فرط.?الحرك|لا.?يركز|adhd)/iu, expansion: 'ADHD اضطراب نقص الانتباه وفرط الحركة تشتت الانتباه التنظيم التنفيذي' },
  { id: 'reading', label: 'صعوبات القراءة', test: /(عسر.?القراء|ديسلكس|dyslexia|صعوبات.?القراء)/iu, expansion: 'عسر القراءة الديسلكسيا dyslexia صعوبات القراءة الوعي الصوتي الطلاقة' },
  { id: 'speech-language', label: 'تأخر الكلام واللغة', test: /(لا.?يتكلم|ما.?يتكلم|تاخر.?الكلام|تأخر.?الكلام|تاخر.?النطق|تأخر.?النطق|اللغه|اللغة)/iu, expansion: 'تأخر الكلام تأخر النطق اضطراب اللغة التواصل اللغة التعبيرية الاستقبالية السمع' },
  { id: 'ocd', label: 'الوسواس القهري', test: /(وسواس|ocd|erp)/iu, expansion: 'الوسواس القهري OCD ERP التعرض ومنع الاستجابة الأفكار القهرية الأفعال القهرية' },
  { id: 'social-anxiety', label: 'القلق الاجتماعي', test: /(قلق.?اجتماعي|رهاب.?اجتماعي|social.?anxiety)/iu, expansion: 'القلق الاجتماعي الرهاب الاجتماعي social anxiety التجنب العلاج السلوكي المعرفي' },
  { id: 'depression', label: 'الاكتئاب', test: /(اكتئاب|depression)/iu, expansion: 'الاكتئاب depression الأعراض التقييم العلاج الدعم' },
  { id: 'addiction', label: 'الإدمان والتعافي', test: /(ادمان|إدمان|تعاطي|اضطراب.?استخدام.?المواد|addiction)/iu, expansion: 'الإدمان اضطراب استخدام المواد التعافي addiction العلاج منع الانتكاس دعم الأسرة' },
  { id: 'withdrawal', label: 'الانسحاب', test: /(انسحاب|withdrawal)/iu, expansion: 'الانسحاب سلامة الانسحاب withdrawal الأعراض الطوارئ التقييم الطبي' },
  { id: 'rare-disease', label: 'الأمراض النادرة', test: /(مرض.?نادر|امراض.?نادر|أمراض.?نادر|rare.?disease)/iu, expansion: 'الأمراض النادرة rare disease التشخيص الفحوص الجينية التاريخ الطبيعي' },
  { id: 'gene-therapy', label: 'العلاج الجيني', test: /(علاج.?جيني|gene.?therapy)/iu, expansion: 'العلاج الجيني العلاج الخلوي gene therapy السلامة الفعالية الأهلية' },
  { id: 'pediatric-oncology', label: 'سرطان الأطفال', test: /(سرطان.?الاطفال|سرطان.?الأطفال|اورام.?الاطفال|أورام.?الأطفال|pediatric.?oncology)/iu, expansion: 'سرطان الأطفال أورام الأطفال pediatric oncology العلاج الدعم النفسي الآثار الجانبية المتابعة' },
  { id: 'epilepsy', label: 'الصرع والنوبات', test: /(صرع|نوب(?:ه|ة|ات).?صرع|seizure|epilepsy)/iu, expansion: 'الصرع النوبات seizure epilepsy الإسعافات السلامة العلاج' },
  { id: 'social-work', label: 'العمل الاجتماعي', test: /(عمل.?اجتماعي|خدمه.?اجتماعي|خدمة.?اجتماعي|social.?work)/iu, expansion: 'العمل الاجتماعي الخدمة الاجتماعية social work الممارسة المهنية التقييم التدخل' },
  { id: 'ethics', label: 'الأخلاقيات المهنية', test: /(اخلاقيات|أخلاقيات|اخلاقي|أخلاقي|ethics)/iu, expansion: 'الأخلاقيات المهنية الكرامة السرية تقرير المصير الموافقة تضارب المصالح ethics' },
  { id: 'inclusive-education', label: 'التعليم الدامج', test: /(تربيه.?دامج|تربية.?دامج|تعليم.?دامج|inclusive.?education|دمج.?مدرسي)/iu, expansion: 'التربية الدامجة التعليم الدامج inclusive education التكييفات الصفية المشاركة' },
  { id: 'bullying', label: 'التنمر', test: /(تنمر|bullying)/iu, expansion: 'التنمر bullying الحماية المدرسية الاستجابة الدعم النفسي' },
  { id: 'down-syndrome', label: 'متلازمة داون', test: /(متلازمه.?داون|متلازمة.?داون|down.?syndrome)/iu, expansion: 'متلازمة داون Down syndrome النمو الصحة التعليم الدعم' },
  { id: 'cerebral-palsy', label: 'الشلل الدماغي', test: /(شلل.?دماغي|cerebral.?palsy)/iu, expansion: 'الشلل الدماغي cerebral palsy الحركة التأهيل العلاج الطبيعي التواصل' },
  { id: 'learning-disabilities', label: 'صعوبات التعلم', test: /(صعوبات.?التعلم|اضطراب.?التعلم|learning.?disabilit)/iu, expansion: 'صعوبات التعلم اضطرابات التعلم learning disabilities التقييم التدخل المدرسي' },
];

function detectIntent(query: string): SearchIntent {
  const q = normalize(query);
  if (/(خطر|طوارئ|جرعه زائده|جرعة زائدة|نزيف|فقد الوعي|صعوبه التنفس|انسحاب شديد|انتحار|ايذاء النفس)/u.test(q)) return 'safety';
  if (/(الفرق|مقارنه|مقارنة| ام |vs\b|مقابل|كيف اميز|كيف افرق)/u.test(` ${q} `)) return 'comparison';
  if (/(علامات|اعراض|أعراض|كيف اعرف|هل .* مصاب|تشخيص|تقييم|متي اطلب تقييم|متى اطلب تقييم|هل هذا يعني)/u.test(q)) return 'assessment';
  if (/(علاج|دواء|ادويه|أدوية|تدخل|رعايه|رعاية|ماذا افعل|ما المفيد|خطوات)/u.test(q)) return 'treatment';
  if (/(مدرسه|مدرسة|مدرسي|صف|معلم|معلمه|معلمة|تكييف|امتحان|واجب|روضه|روضة)/u.test(q)) return 'school';
  if (/(كيف اساعد|دعم|مساعده|مساعدة|في المنزل|للاسره|للأسرة|للوالدين)/u.test(q)) return 'support';
  if (/(مختص|اخصائي|أخصائي|مركز|معالج|طبيب|جهه|جهة|اين اجد|أين أجد)/u.test(q)) return 'professional';
  if (/^(ما هو|ما هي|ما معنى|ما معني|تعريف|ما المقصود)/u.test(q)) return 'definition';
  return 'general';
}

function detectAge(query: string) {
  const match = query.match(/(?:عمر(?:ه|ها|ي)?|بعمر|سن(?:ه|ة)?|عنده|عندها)\s*[:=]?\s*(\d{1,2})(?:\s*(?:سنه|سنة|سنوات|عام|أعوام|اعوام))?/u);
  if (!match) return null;
  const age = Number(match[1]);
  return Number.isFinite(age) && age >= 0 && age <= 110 ? age : null;
}

function detectAudience(query: string): QueryUnderstanding['audience'] {
  const q = normalize(query);
  if (/(طفلي|ابني|بنتي|ابنتي|طفل|طفله|طفلة|ولدي|ولدي|ابنك|ابنتك)/u.test(q)) return 'child';
  if (/(انا|اعاني|أعاني|عندي|اشعر|أشعر|نفسي)/u.test(q)) return 'self';
  if (/(اخصائي|أخصائي|معلم|معلمه|معلمة|مختص|طبيب|معالج|عامل اجتماعي)/u.test(q)) return 'professional';
  if (/(الاسره|الأسرة|والد|والده|والدة|ام |أم |اب |أب )/u.test(` ${q} `)) return 'family';
  return 'general';
}

function detectSettings(query: string): QueryUnderstanding['settings'] {
  const q = normalize(query);
  const settings: QueryUnderstanding['settings'] = [];
  if (/(بيت|منزل|بالدار|في الدار)/u.test(q)) settings.push('home');
  if (/(مدرسه|مدرسة|روضه|روضة|صف|معلم|معلمه|معلمة|جامعه|جامعة)/u.test(q)) settings.push('school');
  if (/(عمل|وظيفه|وظيفة|مكان العمل)/u.test(q)) settings.push('work');
  if (/(عياده|عيادة|مستشفي|مستشفى|طبيب|اخصائي|أخصائي|معالج)/u.test(q)) settings.push('clinical');
  return [...new Set(settings)];
}

function detectTopics(query: string, context = '') {
  const direct = TOPICS.filter((topic) => topic.test.test(query));
  if (direct.length) return direct.slice(0, 3);
  if (!context) return [];
  return TOPICS.filter((topic) => topic.test.test(context)).slice(0, 2);
}

function intentLabel(intent: SearchIntent) {
  const labels: Record<SearchIntent, string> = {
    definition: 'شرح مباشر', assessment: 'علامات وتقييم', support: 'دعم عملي', treatment: 'خطوات وعلاج', comparison: 'مقارنة',
    professional: 'العثور على مختص أو جهة', school: 'دعم مدرسي', safety: 'سلامة عاجلة', general: 'استكشاف الموضوع',
  };
  return labels[intent];
}

function buildClarification(understanding: Omit<QueryUnderstanding, 'clarification' | 'follow_ups' | 'summary' | 'confidence'>) {
  if (understanding.intent === 'comparison' && understanding.topics.length < 2) return 'ما الحالتان أو الخياران اللذان تريد المقارنة بينهما؟';
  if (understanding.audience === 'child' && understanding.age_years === null && understanding.topics.some((topic) => ['autism', 'adhd', 'reading', 'speech-language', 'learning-disabilities'].includes(topic.id))) {
    return 'كم عمر الطفل؟ العمر يساعدني على اختيار المعلومات والخطوات الأكثر ملاءمة.';
  }
  if (!understanding.topics.length && ['assessment', 'treatment', 'support', 'general'].includes(understanding.intent)) return 'ما العرض أو الحالة الأساسية التي تريد أن أركز عليها؟';
  return null;
}

function buildFollowUps(intent: SearchIntent, topics: Array<{ id: string; label: string }>) {
  const topic = topics[0]?.label;
  const suffix = topic ? ` عن ${topic}` : '';
  const byIntent: Record<SearchIntent, string[]> = {
    definition: [`ما أهم العلامات${suffix}؟`, `متى يحتاج الأمر إلى تقييم؟`, `ما الخطوات العملية التالية؟`],
    assessment: [`ما العلامات التي تستدعي تقييمًا${suffix}؟`, `ما الذي يمكن ملاحظته في المنزل؟`, `متى أراجع مختصًا؟`],
    support: [`ما الخطوات العملية في المنزل${suffix}؟`, `ما الأخطاء التي يجب تجنبها؟`, `متى أحتاج مساعدة مختص؟`],
    treatment: [`ما خيارات التدخل${suffix}؟`, `كيف أختار المختص المناسب؟`, `ما الذي يجب مراقبته أثناء العلاج؟`],
    comparison: ['ما الفروق الأكثر أهمية؟', 'ما العلامات المشتركة بينهما؟', 'متى يلزم تقييم مهني؟'],
    professional: [`أي نوع من المختصين يناسب${suffix}؟`, 'كيف أستعد للموعد الأول؟', 'ما الأسئلة التي أطرحها على المختص؟'],
    school: [`ما التكييفات المدرسية المفيدة${suffix}؟`, 'ماذا يمكن أن يفعل المعلم؟', 'كيف تتعاون الأسرة مع المدرسة؟'],
    safety: ['ما علامات الخطر التي تستدعي الطوارئ؟', 'ماذا أفعل الآن بشكل آمن؟', 'متى يكون التقييم عاجلًا؟'],
    general: [`اشرح لي${suffix || ' الموضوع'} باختصار`, 'ما أهم النقاط التي يجب أن أعرفها؟', 'ما الخطوة التالية؟'],
  };
  return byIntent[intent].slice(0, 3);
}

export function analyzeFreeQuery(query: string, context = ''): QueryUnderstanding {
  const rewritten = rewriteArabicQuery(query);
  const combined = `${rewritten} ${context}`.trim();
  const topics = detectTopics(rewritten, context).map(({ id, label }) => ({ id, label }));
  const intent = detectIntent(query);
  const audience = detectAudience(query);
  const age_years = detectAge(query) ?? detectAge(context);
  const settings = detectSettings(combined);
  const base = { intent, topics, audience, age_years, settings };
  const clarification = buildClarification(base);
  const confidence: QueryUnderstanding['confidence'] = topics.length && intent !== 'general' ? 'high' : topics.length || intent !== 'general' ? 'medium' : 'low';
  const parts = [topics.map((topic) => topic.label).join(' + '), audience === 'child' ? 'طفل' : audience === 'self' ? 'السائل نفسه' : audience === 'family' ? 'أسرة' : audience === 'professional' ? 'مختص' : '', age_years !== null ? `${age_years} سنة` : '', intentLabel(intent)].filter(Boolean);
  return {
    ...base,
    confidence,
    summary: parts.join(' · ') || 'سؤال عام يحتاج مزيدًا من التحديد',
    clarification,
    follow_ups: buildFollowUps(intent, topics),
  };
}

function intentExpansion(intent: SearchIntent) {
  const map: Record<SearchIntent, string> = {
    definition: 'تعريف شرح ما هو', assessment: 'علامات أعراض تقييم تشخيص متى أراجع مختص', support: 'دعم الأسرة خطوات عملية المنزل',
    treatment: 'علاج تدخل رعاية خيارات العلاج المتابعة', comparison: 'الفرق مقارنة تمييز تشابه اختلاف', professional: 'مختص أخصائي مركز طبيب خدمات',
    school: 'مدرسة صف معلم تكييفات دعم تعليمي', safety: 'طوارئ سلامة علامات الخطر إسعاف', general: 'معلومات دليل أسئلة شائعة',
  };
  return map[intent];
}

export function buildFreeSearchPlan(query: string, context = '') {
  const cleaned = query.trim().replace(/\s+/g, ' ').slice(0, 220);
  const rewritten = rewriteArabicQuery(cleaned);
  const understanding = analyzeFreeQuery(cleaned, context);
  const topicRules = understanding.topics.map((topic) => TOPICS.find((rule) => rule.id === topic.id)).filter((rule): rule is TopicRule => Boolean(rule));
  const variants = [cleaned, rewritten];
  for (const topic of topicRules.slice(0, 2)) variants.push(`${topic.expansion} ${intentExpansion(understanding.intent)}`.slice(0, 220));
  if (context && understanding.topics.length === 0) variants.push(`${context.split('||').slice(-2).join(' ')} ${rewritten}`.replace(/\s+/g, ' ').slice(0, 220));
  const unique = variants.map((value) => value.trim()).filter((value, index, values) => value && values.indexOf(value) === index).slice(0, 4);
  return { variants: unique, understanding };
}

function queryTokens(query: string, understanding?: QueryUnderstanding) {
  const base = rewriteArabicQuery(query);
  const extra = understanding?.topics.map((topic) => TOPICS.find((rule) => rule.id === topic.id)?.expansion ?? '').join(' ') ?? '';
  return [...new Set(normalize(`${base} ${extra}`).split(' ').filter((token) => token.length >= 2 && !STOP.has(token)))].slice(0, 28);
}

function intentKeywords(intent: SearchIntent) {
  return normalize(intentExpansion(intent)).split(' ').filter(Boolean);
}

export function rerankFreeResults(query: string, results: FreeSearchResult[], understanding: QueryUnderstanding) {
  const tokens = queryTokens(query, understanding);
  const intentTerms = intentKeywords(understanding.intent);
  return results.map((row) => {
    const hay = normalize(`${row.title} ${row.subtitle ?? ''} ${row.excerpt ?? ''} ${row.destination}`);
    const tokenHits = tokens.filter((token) => hay.includes(token)).length;
    const intentHits = intentTerms.filter((token) => hay.includes(token)).length;
    const topicHits = understanding.topics.filter((topic) => {
      const rule = TOPICS.find((candidate) => candidate.id === topic.id);
      return rule ? normalize(rule.expansion).split(' ').some((token) => token.length > 3 && hay.includes(token)) : false;
    }).length;
    let boost = tokenHits * 9 + intentHits * 3 + topicHits * 24;
    if (understanding.settings.includes('school') && /(مدرس|تعليم|صف|روضة|school)/u.test(hay)) boost += 15;
    if (understanding.intent === 'professional' && /(مختص|اخصائي|طبيب|مركز|دليل)/u.test(hay)) boost += 18;
    if (understanding.intent === 'comparison' && /(فرق|مقارن|مقابل|تمييز)/u.test(hay)) boost += 16;
    return { ...row, score: Number(row.score) + boost };
  }).sort((a, b) => Number(b.score) - Number(a.score) || a.title.localeCompare(b.title, 'ar'));
}

function cleanExcerpt(value: string | null) {
  return String(value ?? '').replace(/\s+/g, ' ').replace(/^[\s·•–—-]+/g, '').trim();
}

function splitSentences(text: string) {
  return text.split(/(?<=[.!؟])\s+|[•●▪]+/u).map((sentence) => sentence.trim()).filter((sentence) => sentence.length >= 24 && sentence.length <= 320);
}

function sentenceScore(sentence: string, tokens: string[], intent: SearchIntent, position: number) {
  const s = normalize(sentence);
  const hits = tokens.filter((token) => s.includes(token)).length;
  const coverage = tokens.length ? hits / tokens.length : 0;
  const intentHits = intentKeywords(intent).filter((token) => s.includes(token)).length;
  let score = coverage * 12 + hits * 2.2 + intentHits * 1.4 - position * 0.12;
  if (/(ينصح|يساعد|يحتاج|يشمل|يعتمد|يظهر|تظهر|يمكن|ينبغي|متى|عندما|علامات|تقييم|دعم|علاج|مدرس|طوارئ|خطوه|خطوة)/u.test(s)) score += 1.8;
  if (/(اشترك|سجل الآن|اقرأ المزيد|حقوق النشر|المصدر:|سياسة الخصوصية)/u.test(s)) score -= 7;
  return score;
}

export function buildSmartExtractiveAnswer(query: string, results: FreeSearchResult[], understanding: QueryUnderstanding): SmartExtractiveAnswer | null {
  if (!results.length) return null;
  const tokens = queryTokens(query, understanding);
  const points: SmartExtractiveAnswer['points'] = [];
  const seenText = new Set<string>();
  const seenDestinations = new Set<string>();

  for (const result of results.slice(0, 8)) {
    const excerpt = cleanExcerpt(result.excerpt);
    if (!excerpt) continue;
    const sentences = splitSentences(excerpt);
    const candidate = (sentences.length ? sentences : [excerpt])
      .map((sentence, index) => ({ sentence, score: sentenceScore(sentence, tokens, understanding.intent, index) }))
      .sort((a, b) => b.score - a.score)[0]?.sentence;
    if (!candidate) continue;
    const fingerprint = normalize(candidate).slice(0, 120);
    if (seenText.has(fingerprint) || seenDestinations.has(result.destination)) continue;
    seenText.add(fingerprint);
    seenDestinations.add(result.destination);
    points.push({ text: candidate.length > 300 ? `${candidate.slice(0, 297)}…` : candidate, title: result.title, destination: result.destination });
    if (points.length >= 4) break;
  }

  if (!points.length) return null;
  const topicLabel = understanding.topics.map((topic) => topic.label).join(' و ');
  const subject = topicLabel ? ` حول ${topicLabel}` : '';
  const leadByIntent: Record<SearchIntent, string> = {
    definition: `هذا أقرب شرح مباشر وجدته${subject}:`,
    assessment: `لفهم العلامات والتقييم${subject}، هذه أهم النقاط المستخرجة من أدلة روافد:`,
    support: `هذه الخطوات والمعلومات العملية الأكثر صلة${subject}:`,
    treatment: `هذه أبرز معلومات التدخل والرعاية المرتبطة بسؤالك${subject}:`,
    comparison: `للمقارنة${subject}، هذه أكثر النقاط تمييزًا في الأدلة المتاحة:`,
    professional: `هذه الموارد الأكثر صلة للوصول إلى مختص أو خدمة مناسبة${subject}:`,
    school: `هذه أبرز المعلومات العملية للدعم المدرسي${subject}:`,
    safety: 'هذه أبرز معلومات السلامة المرتبطة بسؤالك؛ عند الخطر المباشر تُقدَّم خدمات الطوارئ على البحث:',
    general: `هذه الخلاصة الأقرب لسؤالك${subject}:`,
  };
  const note = understanding.intent === 'assessment'
    ? 'هذه معلومات تثقيفية مبنية على محتوى روافد، ولا تكفي وحدها لإثبات أو نفي تشخيص.'
    : understanding.intent === 'treatment'
      ? 'اختيار العلاج أو التدخل يعتمد على الحالة الفردية والتقييم المهني؛ افتح المصادر لقراءة السياق الكامل.'
      : understanding.intent === 'safety'
        ? 'إذا وُجد خطر مباشر أو تدهور سريع أو فقدان وعي أو صعوبة تنفس، اطلب خدمات الطوارئ المحلية فورًا.'
        : null;
  return { mode: 'extractive-v2', intent: understanding.intent, lead: leadByIntent[understanding.intent], points, note };
}
