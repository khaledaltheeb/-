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

export type ExtractiveAnswer = {
  mode: 'extractive';
  intent: 'definition' | 'assessment' | 'support' | 'treatment' | 'comparison' | 'professional' | 'general';
  lead: string;
  points: Array<{ text: string; title: string; destination: string }>;
  note: string | null;
};

const DIACRITICS = /[ًٌٍَُِّْـٰ]/gu;

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

const EXPANSION_RULES: Array<{ test: RegExp; phrase: string }> = [
  { test: /(توحد|اوتيزم|autism)/iu, phrase: 'التوحد طيف التوحد autism' },
  { test: /(تشتت|فرط.?الحرك|ما.?يركز|لا.?يركز|adhd)/iu, phrase: 'ADHD اضطراب نقص الانتباه وفرط الحركة تشتت الانتباه' },
  { test: /(عسر.?القراء|ديسلكس|dyslexia)/iu, phrase: 'عسر القراءة الديسلكسيا dyslexia صعوبات القراءة' },
  { test: /(ما.?بحكي|ما.?بيحكي|لا.?يتكلم|ما.?يتكلم|تاخر.?الكلام|تاخر.?النطق)/iu, phrase: 'تأخر الكلام تأخر النطق التواصل اللغة' },
  { test: /(وسواس|ocd)/iu, phrase: 'الوسواس القهري OCD' },
  { test: /\berp\b/iu, phrase: 'ERP التعرض ومنع الاستجابة الوسواس القهري' },
  { test: /\baac\b/iu, phrase: 'AAC التواصل المعزز والبديل التواصل البديل التوحد' },
  { test: /(قلق.?اجتماعي|رهاب.?اجتماعي|social.?anxiety)/iu, phrase: 'القلق الاجتماعي الرهاب الاجتماعي social anxiety' },
  { test: /(اكتئاب.?بعد.?الولاد|اكتئاب.?ما.?بعد.?الولاد|postpartum)/iu, phrase: 'اكتئاب ما بعد الولادة اكتئاب حول الولادة postpartum depression' },
  { test: /(ادمان|تعاطي|اضطراب.?استخدام.?المواد|addiction)/iu, phrase: 'الإدمان اضطراب استخدام المواد التعافي addiction' },
  { test: /(انسحاب.?الكحول|alcohol.?withdrawal)/iu, phrase: 'انسحاب الكحول سلامة الانسحاب alcohol withdrawal' },
  { test: /(مرض.?نادر|امراض.?نادر|rare.?disease)/iu, phrase: 'الأمراض النادرة rare disease' },
  { test: /(علاج.?جيني|gene.?therapy)/iu, phrase: 'العلاج الجيني العلاج الخلوي gene therapy' },
  { test: /(سرطان.?الاطفال|اورام.?الاطفال|pediatric.?oncology)/iu, phrase: 'سرطان الأطفال أورام الأطفال pediatric oncology' },
  { test: /(صرع|نوب(?:ه|ات).?صرع|seizure|epilepsy)/iu, phrase: 'الصرع النوبات seizure epilepsy' },
  { test: /(عمل.?اجتماعي|خدمه.?اجتماعي|social.?work)/iu, phrase: 'العمل الاجتماعي الخدمة الاجتماعية social work' },
  { test: /(اخلاقيات|اخلاقي|ethics)/iu, phrase: 'الأخلاقيات المهنية الكرامة السرية تقرير المصير ethics' },
  { test: /(تربيه.?دامجه|تعليم.?دامج|inclusive.?education)/iu, phrase: 'التربية الدامجة التعليم الدامج inclusive education الدمج' },
];

export function buildFreeQueryVariants(query: string) {
  const cleaned = query.trim().replace(/\s+/g, ' ').slice(0, 160);
  const normalized = normalize(cleaned);
  const expansions = EXPANSION_RULES
    .filter((rule) => rule.test.test(normalized))
    .map((rule) => rule.phrase);

  if (expansions.length === 0) return [cleaned];
  const expanded = [...new Set(expansions)].join(' ');
  return [cleaned, expanded].filter((value, index, values) => values.indexOf(value) === index).slice(0, 2);
}

function detectIntent(query: string): ExtractiveAnswer['intent'] {
  const q = normalize(query);
  if (/(الفرق|مقارنه|مقارنه|ام .* ام |vs\b|مقابل)/u.test(q)) return 'comparison';
  if (/(علامات|اعراض|كيف اعرف|هل .* مصاب|تشخيص|تقييم|متي اطلب تقييم)/u.test(q)) return 'assessment';
  if (/(علاج|دواء|تدخل|رعايه|ماذا افعل|ما المفيد)/u.test(q)) return 'treatment';
  if (/(كيف اساعد|دعم|مساعده|في المنزل|للاسره|للوالدين|للمدرسه)/u.test(q)) return 'support';
  if (/(مختص|اخصائي|مركز|معالج|طبيب|جهه)/u.test(q)) return 'professional';
  if (/^(ما هو|ما هي|ما معنى|ما معني|تعريف|ما المقصود)/u.test(q)) return 'definition';
  return 'general';
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
    .filter((sentence) => sentence.length >= 24 && sentence.length <= 260);
}

function queryTokens(query: string) {
  const STOP = new Set(['كيف', 'هل', 'ما', 'ماذا', 'من', 'في', 'على', 'الى', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'هو', 'هي', 'او', 'أو', 'عند', 'لدي', 'اريد', 'أريد']);
  return [...new Set(normalize(query).split(' ').filter((token) => token.length >= 2 && !STOP.has(token)))];
}

function sentenceScore(sentence: string, tokens: string[], position: number) {
  const s = normalize(sentence);
  const hits = tokens.filter((token) => s.includes(token)).length;
  const coverage = tokens.length ? hits / tokens.length : 0;
  let score = coverage * 10 + hits * 2 - position * 0.15;
  if (/(ينصح|يساعد|يحتاج|يشمل|يعتمد|يظهر|تظهر|يمكن|ينبغي|متى|عندما|علامات|تقييم|دعم|علاج)/u.test(s)) score += 1.5;
  if (/(اشترك|سجل الآن|اقرأ المزيد|حقوق النشر|المصدر:)/u.test(s)) score -= 5;
  return score;
}

export function buildExtractiveAnswer(query: string, results: FreeSearchResult[]): ExtractiveAnswer | null {
  if (!results.length) return null;
  const intent = detectIntent(query);
  const tokens = queryTokens(query);
  const points: ExtractiveAnswer['points'] = [];
  const seen = new Set<string>();

  for (const result of results.slice(0, 5)) {
    const excerpt = cleanExcerpt(result.excerpt);
    if (!excerpt) continue;
    const sentences = splitSentences(excerpt);
    const candidate = (sentences.length ? sentences : [excerpt])
      .map((sentence, index) => ({ sentence, score: sentenceScore(sentence, tokens, index) }))
      .sort((a, b) => b.score - a.score)[0]?.sentence;
    if (!candidate) continue;
    const fingerprint = normalize(candidate).slice(0, 100);
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    points.push({
      text: candidate.length > 260 ? `${candidate.slice(0, 257)}…` : candidate,
      title: result.title,
      destination: result.destination,
    });
    if (points.length >= 3) break;
  }

  if (!points.length) return null;

  const leadByIntent: Record<ExtractiveAnswer['intent'], string> = {
    definition: 'هذا أقرب شرح مباشر وجدته داخل روافد:',
    assessment: 'هذه أبرز المعلومات الأقرب لسؤالك من صفحات روافد:',
    support: 'هذه أكثر الخطوات والمعلومات صلة بسؤالك داخل روافد:',
    treatment: 'هذه أبرز معلومات الرعاية والعلاج المرتبطة بسؤالك داخل روافد:',
    comparison: 'هذه أقرب نقاط تساعد على فهم الفرق داخل روافد:',
    professional: 'هذه أقرب الموارد والجهات المرتبطة بما تبحث عنه داخل روافد:',
    general: 'هذه الخلاصة الأقرب لسؤالك من محتوى روافد:',
  };

  const note = intent === 'assessment'
    ? 'هذه معلومات تثقيفية مستخرجة من صفحات روافد، ولا تكفي وحدها لإثبات تشخيص.'
    : intent === 'treatment'
      ? 'اختيار العلاج يعتمد على الحالة الفردية والتقييم المهني؛ الروابط أدناه تعرض السياق الكامل.'
      : null;

  return { mode: 'extractive', intent, lead: leadByIntent[intent], points, note };
}
