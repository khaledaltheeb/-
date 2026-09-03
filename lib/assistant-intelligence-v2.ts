import {
  buildExtractiveAnswer,
  buildFreeQueryVariants,
  type ExtractiveAnswer,
  type FreeSearchResult,
} from '@/lib/free-search-intelligence';

export type AssistantIntent = ExtractiveAnswer['intent'];

export type AssistantQueryAnalysis = {
  intent: AssistantIntent;
  topics: string[];
  age: number | null;
  setting: 'school' | 'home' | 'work' | null;
  audience: 'parent' | 'teacher' | 'professional' | 'self' | null;
  facets: string[];
  comparison_terms: string[];
  confidence: 'high' | 'medium' | 'low';
  clarification_question: string | null;
};

export type AssistantAnswer = ExtractiveAnswer & {
  summary: string | null;
  understood: string | null;
  clarifying_question: string | null;
  follow_ups: string[];
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

function arabicDigitsToLatin(value: string) {
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndex = arabic.indexOf(digit);
    if (arabicIndex >= 0) return String(arabicIndex);
    return String(persian.indexOf(digit));
  });
}

const TOPIC_RULES: Array<{ label: string; search: string; test: RegExp }> = [
  { label: 'التوحد', search: 'التوحد طيف التوحد autism', test: /(توحد|اوتيزم|autism)/iu },
  { label: 'تأخر الكلام واللغة', search: 'تأخر الكلام تأخر النطق اللغة التواصل', test: /(لا.?يتكلم|ما.?بحكي|تاخر.?الكلام|تاخر.?النطق|تأخر.?الكلام|تأخر.?النطق|الكلام|النطق)/iu },
  { label: 'السمع', search: 'السمع فحص السمع فقدان السمع', test: /(سمع|يسمع|فحص.?السمع)/iu },
  { label: 'اضطراب نقص الانتباه وفرط الحركة', search: 'ADHD اضطراب نقص الانتباه وفرط الحركة تشتت الانتباه', test: /(adhd|فرط.?الحرك|تشتت|لا.?يركز|ما.?بيركز)/iu },
  { label: 'صعوبات القراءة', search: 'عسر القراءة الديسلكسيا dyslexia صعوبات القراءة', test: /(عسر.?القراء|ديسلكس|dyslexia|صعوبات.?القراء)/iu },
  { label: 'الصحة النفسية', search: 'الصحة النفسية التقييم الدعم العلاج النفسي', test: /(قلق|اكتئاب|وسواس|ocd|نفسي|نفسية)/iu },
  { label: 'الإدمان والتعافي', search: 'الإدمان اضطراب استخدام المواد التعافي', test: /(ادمان|إدمان|تعاطي|انسحاب|تعافي)/iu },
  { label: 'الصرع والنوبات', search: 'الصرع النوبات seizure epilepsy', test: /(صرع|نوب(?:ه|ة|ات)|seizure|epilepsy)/iu },
  { label: 'سرطان الأطفال', search: 'سرطان الأطفال أورام الأطفال pediatric oncology', test: /(سرطان.?الاطفال|سرطان.?الأطفال|اورام.?الاطفال|أورام.?الأطفال|pediatric.?oncology)/iu },
  { label: 'العمل الاجتماعي', search: 'العمل الاجتماعي الخدمة الاجتماعية الأخلاقيات المهنية', test: /(عمل.?اجتماعي|خدم[هة].?اجتماعي|social.?work|اخلاقيات.?مهني)/iu },
  { label: 'التربية الدامجة', search: 'التربية الدامجة التعليم الدامج الدمج المدرسي', test: /(تربي[هة].?دامج|تعليم.?دامج|دمج.?مدرس|inclusive.?education)/iu },
  { label: 'الأمراض النادرة', search: 'الأمراض النادرة rare disease', test: /(مرض.?نادر|امراض.?نادر|أمراض.?نادر|rare.?disease)/iu },
];

const FACET_RULES: Array<{ label: string; test: RegExp; search: string }> = [
  { label: 'الأعراض والعلامات', test: /(علامات|اعراض|أعراض|كيف.?اعرف|هل.?هذا)/iu, search: 'الأعراض العلامات متى أطلب تقييما' },
  { label: 'التقييم والتشخيص', test: /(تقييم|تشخيص|اختبار|فحص)/iu, search: 'التقييم التشخيص الفحص' },
  { label: 'العلاج والتدخل', test: /(علاج|دواء|تدخل|جلسات|تاهيل|تأهيل)/iu, search: 'العلاج التدخل التأهيل' },
  { label: 'الدعم العملي', test: /(ماذا.?افعل|ماذا.?أفعل|كيف.?اساعد|كيف.?أساعد|دعم|مساعده|مساعدة)/iu, search: 'خطوات عملية دعم الأسرة ماذا أفعل' },
  { label: 'المدرسة', test: /(مدرسه|مدرسة|صف|معلم|معلمه|معلمة|روضة|امتحان)/iu, search: 'المدرسة الدعم التعليمي التكييفات الصفية' },
  { label: 'السلامة', test: /(خطر|طوارئ|جرع[هة].?زائد|فقد.?الوعي|نزيف|لا.?استطيع.?التنفس|لا.?أستطيع.?التنفس|ايذاء.?النفس|إيذاء.?النفس)/iu, search: 'السلامة الطوارئ متى أطلب مساعدة عاجلة' },
];

function detectIntent(query: string): AssistantIntent {
  const q = normalize(query);
  if (/(خطر|طوارئ|جرعه زائده|نزيف|فقد الوعي|صعوبه التنفس|ايذاء النفس|قتل نفسي|انتحار)/u.test(q)) return 'safety';
  if (/(الفرق|مقارنه|مقارنة| ام | مقابل |\bvs\b)/u.test(` ${q} `)) return 'comparison';
  if (/(علامات|اعراض|كيف اعرف|هل .* مصاب|تشخيص|تقييم|اختبار|فحص)/u.test(q)) return 'assessment';
  if (/(علاج|دواء|تدخل|تاهيل|ماذا افعل|ما المفيد)/u.test(q)) return 'treatment';
  if (/(مدرسه|مدرسي|صف|معلم|روضة|تكييف|امتحان)/u.test(q)) return 'school';
  if (/(كيف اساعد|دعم|مساعده|في المنزل|للاسره|للوالدين)/u.test(q)) return 'support';
  if (/(مختص|اخصائي|مركز|معالج|طبيب|جهه|اين اجد)/u.test(q)) return 'professional';
  if (/^(ما هو|ما هي|ما معنى|تعريف|ما المقصود)/u.test(q)) return 'definition';
  return 'general';
}

function extractAge(query: string) {
  const latin = arabicDigitsToLatin(query);
  const match = latin.match(/(?:عمر(?:ه|ها|ي)?|بعمر|سن(?:ه|ة))\s*(?:هو|هي)?\s*[:=-]?\s*(\d{1,2})/iu)
    ?? latin.match(/(\d{1,2})\s*(?:سن[هة]|عام(?:ا|ً)?)/iu);
  if (!match) return null;
  const age = Number(match[1]);
  return Number.isFinite(age) && age >= 0 && age <= 100 ? age : null;
}

function detectSetting(query: string): AssistantQueryAnalysis['setting'] {
  if (/(مدرسه|مدرسة|روضة|صف|معلم|معلمة)/iu.test(query)) return 'school';
  if (/(بيت|المنزل|في المنزل|بالبيت)/iu.test(query)) return 'home';
  if (/(عمل|وظيف|مكان العمل)/iu.test(query)) return 'work';
  return null;
}

function detectAudience(query: string): AssistantQueryAnalysis['audience'] {
  if (/(طفلي|ابني|ابنتي|بنتي|ولدي|ابني|ابنتنا|ابننا)/iu.test(query)) return 'parent';
  if (/(طلابي|طالب عندي|انا معلم|أنا معلم|معلمه|معلمة|teacher)/iu.test(query)) return 'teacher';
  if (/(انا اخصائي|أنا أخصائي|اخصائي اجتماعي|أخصائي اجتماعي|معالج|طبيب)/iu.test(query)) return 'professional';
  if (/(عندي|اعاني|أعاني|اشعر|أشعر|عمري)/iu.test(query)) return 'self';
  return null;
}

function extractComparisonTerms(query: string) {
  const normalized = query.replace(/\s+/g, ' ').trim();
  const patterns = [
    /(?:الفرق بين|مقارنة بين)\s+(.+?)\s+(?:و|وبين)\s+(.+?)(?:[؟?.!]|$)/iu,
    /(.+?)\s+(?:أم|ام|مقابل|vs)\s+(.+?)(?:[؟?.!]|$)/iu,
  ];
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) return [match[1].trim(), match[2].trim()].filter((item) => item.length >= 2).slice(0, 2);
  }
  return [];
}

function clarificationFor(query: string, topics: string[], age: number | null, audience: AssistantQueryAnalysis['audience']) {
  const q = normalize(query);
  if (!topics.length && /^(هل هذا طبيعي|ماذا افعل|ماذا أعمل|شو اعمل|شو اسوي|ساعدني|احتاج مساعده|احتاج مساعدة)$/u.test(q)) {
    return 'ما العرض أو المشكلة الأساسية التي تريد فهمها؟ اذكرها بكلمات بسيطة.';
  }
  if (audience === 'parent' && age === null && topics.some((topic) => /(تأخر الكلام|التوحد|صعوبات القراءة|نقص الانتباه)/u.test(topic))) {
    return 'كم عمر الطفل؟ العمر يساعدني على اختيار المعلومات الأنسب دون افتراضات.';
  }
  return null;
}

export function analyzeAssistantQuery(query: string): AssistantQueryAnalysis {
  const topics = TOPIC_RULES.filter((rule) => rule.test.test(query)).map((rule) => rule.label);
  const facets = FACET_RULES.filter((rule) => rule.test.test(query)).map((rule) => rule.label);
  const age = extractAge(query);
  const setting = detectSetting(query);
  const audience = detectAudience(query);
  const comparisonTerms = extractComparisonTerms(query);
  const intent = detectIntent(query);
  const signalCount = topics.length + facets.length + Number(age !== null) + Number(setting !== null) + Number(audience !== null) + comparisonTerms.length;
  const confidence: AssistantQueryAnalysis['confidence'] = signalCount >= 4 ? 'high' : signalCount >= 2 ? 'medium' : 'low';
  return {
    intent,
    topics,
    age,
    setting,
    audience,
    facets,
    comparison_terms: comparisonTerms,
    confidence,
    clarification_question: clarificationFor(query, topics, age, audience),
  };
}

function splitCompoundQuery(query: string) {
  return query
    .split(/[؟?!؛;]+|\s+(?:لكن|ولكن|وكمان|وأيضا|وايضا|بالإضافة إلى|بالاضافه الى)\s+/iu)
    .map((part) => part.trim())
    .filter((part) => part.split(/\s+/u).length >= 3 && part.length >= 12);
}

export function buildAssistantQueryVariants(query: string, analysis: AssistantQueryAnalysis) {
  const base = buildFreeQueryVariants(query);
  const topicSearches = TOPIC_RULES.filter((rule) => analysis.topics.includes(rule.label)).map((rule) => rule.search);
  const facetSearches = FACET_RULES.filter((rule) => analysis.facets.includes(rule.label)).map((rule) => rule.search);
  const compounds = splitCompoundQuery(query);
  const comparison = analysis.comparison_terms.length === 2
    ? [`${analysis.comparison_terms[0]} ${analysis.comparison_terms[1]} الفرق مقارنة تشخيص تمييز`]
    : [];
  const ageVariant = analysis.age !== null && analysis.topics.length
    ? [`${analysis.topics.join(' ')} عمر ${analysis.age} سنوات تطور تقييم دعم`]
    : [];

  return [...new Set([...base, ...compounds, ...comparison, ...ageVariant, ...topicSearches, ...facetSearches])]
    .map((value) => value.replace(/\s+/g, ' ').trim().slice(0, 220))
    .filter(Boolean)
    .slice(0, 6);
}

function contentText(row: FreeSearchResult) {
  return normalize(`${row.title} ${row.subtitle ?? ''} ${row.excerpt ?? ''} ${row.destination}`);
}

export function rerankAssistantResults(query: string, analysis: AssistantQueryAnalysis, rows: FreeSearchResult[]) {
  const queryTokens = normalize(query).split(' ').filter((token) => token.length >= 3);
  return rows
    .map((row) => {
      const haystack = contentText(row);
      let boost = 0;
      const exactHits = queryTokens.filter((token) => haystack.includes(token)).length;
      boost += exactHits * 28;

      for (const rule of TOPIC_RULES) {
        if (!analysis.topics.includes(rule.label)) continue;
        const topicTokens = normalize(rule.search).split(' ').filter((token) => token.length >= 3);
        boost += Math.min(180, topicTokens.filter((token) => haystack.includes(token)).length * 36);
      }

      for (const facet of analysis.facets) {
        if (facet === 'المدرسة' && /(مدرس|تعليم|صف|روضة)/u.test(haystack)) boost += 120;
        if (facet === 'التقييم والتشخيص' && /(تقييم|تشخيص|اختبار|فحص)/u.test(haystack)) boost += 120;
        if (facet === 'العلاج والتدخل' && /(علاج|تدخل|تاهيل|دواء)/u.test(haystack)) boost += 120;
        if (facet === 'الدعم العملي' && /(دعم|خطوات|اسره|والدين|مساعد)/u.test(haystack)) boost += 100;
      }

      if (analysis.intent === 'comparison' && /(فرق|مقارن|تمييز|تشخيص تفريقي)/u.test(haystack)) boost += 150;
      return { ...row, score: Number(row.score) + boost };
    })
    .sort((a, b) => Number(b.score) - Number(a.score) || a.title.localeCompare(b.title, 'ar'));
}

function buildUnderstood(analysis: AssistantQueryAnalysis) {
  const parts: string[] = [];
  if (analysis.topics.length) parts.push(analysis.topics.slice(0, 2).join(' + '));
  if (analysis.age !== null) parts.push(`العمر ${analysis.age} سنة`);
  if (analysis.setting === 'school') parts.push('السياق المدرسي');
  if (analysis.setting === 'home') parts.push('السياق المنزلي');
  if (analysis.audience === 'parent') parts.push('السؤال من وليّ أمر');
  if (analysis.intent === 'comparison') parts.push('المطلوب مقارنة');
  if (analysis.intent === 'assessment') parts.push('المطلوب فهم العلامات/التقييم');
  if (analysis.intent === 'treatment') parts.push('المطلوب إجراء أو تدخل');
  return parts.length ? parts.join(' · ') : null;
}

function followUpsFor(analysis: AssistantQueryAnalysis) {
  const topic = analysis.topics[0] ?? '';
  const items: string[] = [];
  if (topic) {
    if (analysis.intent !== 'assessment') items.push(`ما العلامات التي تستدعي تقييمًا في ${topic}؟`);
    if (analysis.intent !== 'treatment' && analysis.intent !== 'support') items.push(`ما الخطوات العملية للتعامل مع ${topic}؟`);
    if (analysis.intent !== 'professional') items.push(`متى أحتاج إلى مختص بسبب ${topic}؟`);
  }
  if (analysis.setting === 'school') items.push('ما الذي يمكن أن تفعله المدرسة عمليًا؟');
  return [...new Set(items)].slice(0, 3);
}

export function buildAssistantAnswer(
  query: string,
  analysis: AssistantQueryAnalysis,
  results: FreeSearchResult[],
): AssistantAnswer | null {
  const base = buildExtractiveAnswer(query, results);
  if (!base) return null;
  const firstPoint = base.points[0]?.text ?? null;
  const directLead: Record<AssistantIntent, string> = {
    definition: 'الإجابة المباشرة من محتوى روافد:',
    assessment: 'الأهم لفهم الحالة وتحديد الحاجة إلى تقييم:',
    support: 'ابدأ بهذه المعلومات والخطوات الأقرب لسؤالك:',
    treatment: 'الأقرب لسؤالك عن التدخل أو العلاج:',
    comparison: 'للتفريق بين الاحتمالات، ركّز على هذه النقاط:',
    professional: 'للوصول إلى المساعدة المهنية المناسبة:',
    school: 'في السياق المدرسي، هذه النقاط هي الأكثر صلة:',
    safety: 'الأولوية الآن للسلامة والتقييم العاجل عند الحاجة:',
    general: 'هذه الخلاصة الأقرب لما تسأل عنه:',
  };
  return {
    ...base,
    lead: directLead[analysis.intent],
    summary: firstPoint,
    understood: buildUnderstood(analysis),
    clarifying_question: analysis.clarification_question,
    follow_ups: followUpsFor(analysis),
  };
}
