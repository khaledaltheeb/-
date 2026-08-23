export const SEO_TOPIC_KEYWORD_TARGET = 50;
export const SEO_SEARCH_INTENT_TARGET = 50;
export const SEO_TOTAL_KEYWORD_MINIMUM = 100;

type Locale = 'ar' | 'en' | 'es';
type Domain = 'legal' | 'oncology' | 'mental-health' | 'education' | 'addiction' | 'directory' | 'tools' | 'general';

export type SemanticSeoInput = {
  title: string;
  description?: string | null;
  path: string;
  keywords?: string[];
  relatedTerms?: string[];
  searchIntents?: string[];
};

export type SemanticSeoProfile = {
  locale: Locale;
  domain: Domain;
  primaryTopic: string;
  topicKeywords: string[];
  searchIntents: string[];
  keywords: string[];
};

const DOMAIN_TERMS_AR: Record<Domain, string[]> = {
  legal: ['حقوق المستخدم','مسؤوليات المستخدم','الاستخدام المقبول','حماية الحساب','حماية البيانات','خصوصية المستخدم','الموافقة','إدارة الحساب','التحقق من الهوية','المحتوى المنشور','الملفات المهنية','سياسات المنصة','شروط الخدمة','حدود المسؤولية','تحديث السياسات','أمن المعلومات','الشفافية','الامتثال','الوصولية','حقوق المحتوى','إدارة الصلاحيات','تعليق الحساب','حذف الحساب','حماية المنصة','التواصل والدعم'],
  oncology: ['سرطان الأطفال','أورام الأطفال','طب أورام الأطفال','الأعراض والعلامات','التشخيص','الفحوصات','العلاج','العلاج الكيميائي','العلاج الإشعاعي','الجراحة','العلاج الموجه','العلاج المناعي','الرعاية الداعمة','الآثار الجانبية','مكافحة العدوى','التغذية','الألم','الدعم النفسي','دعم الأسرة','الدراسة أثناء العلاج','المتابعة','النجاة من السرطان','التجارب السريرية','البروتوكولات العلاجية','الرعاية التلطيفية'],
  'mental-health': ['الصحة النفسية','الصحة العقلية','الأعراض','الأسباب','عوامل الخطر','التقييم النفسي','التشخيص','العلاج النفسي','العلاج الدوائي','الدعم النفسي','الوقاية','المهارات اليومية','التكيف','إدارة الضغوط','القلق','الاكتئاب','الصدمات النفسية','النوم','العلاقات','جودة الحياة','التعافي','الانتكاس','متى أطلب المساعدة','المختص النفسي','خطة الأمان'],
  education: ['التربية الخاصة','التربية الدامجة','ذوو الاحتياجات الخاصة','اضطراب طيف التوحد','صعوبات التعلم','الإعاقة','التقييم التربوي','الخطة التربوية الفردية','التدخل المبكر','التكييفات الصفية','التعديلات التعليمية','التصميم الشامل للتعلم','السلوك','التواصل','المهارات الأكاديمية','المهارات الاجتماعية','الاستقلالية','دعم الأسرة','دعم المعلم','المدرسة الدامجة','التقنيات المساندة','الوصول التعليمي','الانتقال','المشاركة','التقييم الوظيفي'],
  addiction: ['الإدمان','التعافي','اضطرابات استخدام المواد','الاعتماد','الانسحاب','الرغبة الملحة','عوامل الخطر','التقييم','العلاج','العلاج النفسي','الدعم الاجتماعي','منع الانتكاس','المحفزات','خطة التعافي','الحد من الضرر','الدعم الأسري','الصحة النفسية','الاضطرابات المصاحبة','مجموعات الدعم','خدمات العلاج','التعافي طويل المدى','مهارات المواجهة','الأزمات','الإحالة للمختص','المتابعة'],
  directory: ['مختصون','مراكز','خدمات','دليل مهني','التخصص','المؤهلات','التحقق المهني','الخبرة','مجال الممارسة','نوع الخدمة','الفئة العمرية','المدينة','الدولة','التواصل','الحجز','الخدمة الحضورية','الخدمة عن بعد','معلومات مهنية','اختيار المختص','اختيار المركز','الدعم','الإحالة','الوصول للخدمة','ملف مهني','معايير الثقة'],
  tools: ['أداة معرفية','تقييم إرشادي','مقياس','استبيان','حاسبة','نتيجة','تفسير النتيجة','طريقة الاستخدام','حدود الأداة','الخصوصية','الدقة','الموثوقية','التحقق','خطوات عملية','متابعة التقدم','مؤشرات','ملاحظات','سجل','تقرير','رسم بياني','مقارنة','قرار مستنير','إرشاد','دعم','إحالة للمختص'],
  general: ['تعريف','مفهوم','أساسيات','مبادئ','مصطلحات','موضوعات ذات صلة','معلومات موثوقة','محتوى عربي','دليل معرفي','دليل عملي','شرح مفصل','شرح مبسط','أدلة علمية','مصادر موثوقة','مراجع','دراسات','أبحاث','كتب','مقالات','أسئلة شائعة','إرشادات','توصيات','ممارسات','أمثلة','تطبيقات'],
};

const GENERIC_TERMS: Record<Locale, string[]> = {
  ar: ['معرفة موثوقة','معلومات حديثة','محتوى قائم على الدليل','مراجعة علمية','شرح عملي','توعية','فهم','تقييم','دعم','خدمات','دليل شامل','حقائق','أسئلة وأجوبة','مصادر معتمدة','روابط مفيدة','خطوات عملية','معلومات بالعربية','مراجعة منهجية','جودة المعلومات','سلامة المعلومات'],
  en: ['trusted information','current information','evidence-based knowledge','scientific review','practical explanation','awareness','understanding','assessment','support','services','comprehensive guide','facts','questions and answers','authoritative sources','useful resources','practical steps','information quality','information safety','research','guidance'],
  es: ['información confiable','información actual','conocimiento basado en evidencia','revisión científica','explicación práctica','concienciación','comprensión','evaluación','apoyo','servicios','guía completa','datos','preguntas y respuestas','fuentes autorizadas','recursos útiles','pasos prácticos','calidad de la información','seguridad de la información','investigación','orientación'],
};

const INTENT_FRAMES: Record<Locale, string[]> = {
  ar: ['ما هو {topic}','ما معنى {topic}','شرح {topic}','دليل {topic}','معلومات عن {topic}','أسئلة شائعة عن {topic}','أهم الأسئلة عن {topic}','إجابات موثوقة عن {topic}','كيف أفهم {topic}','ما الذي يجب معرفته عن {topic}','لماذا يهم {topic}','أين أجد معلومات موثوقة عن {topic}','مصادر موثوقة عن {topic}','مراجع عن {topic}','أدلة علمية عن {topic}','معلومات مبنية على الدليل عن {topic}','أحدث الأدلة عن {topic}','{topic} بالعربي','{topic} شرح مبسط','{topic} شرح مفصل','{topic} خطوة بخطوة','{topic} للمبتدئين','{topic} للأسر','{topic} للوالدين','{topic} للمختصين','{topic} للمعلمين','{topic} للطلاب','فهم {topic}','التعامل مع {topic}','تقييم {topic}','مراجعة {topic}','أمثلة على {topic}','مصطلحات مرتبطة بـ {topic}','موضوعات مرتبطة بـ {topic}','كيف أتحقق من معلومات {topic}','ما المصادر المعتمدة عن {topic}','ما الأسئلة المهمة عن {topic}','ما الخطوة التالية بعد قراءة {topic}','كيف أستخدم معلومات {topic} عمليًا','ما الخدمات المرتبطة بـ {topic}','ما الأدلة العملية حول {topic}','ما التوصيات العامة حول {topic}','ما الجديد في {topic}','أبحاث {topic}','دراسات {topic}','مقالات {topic}','كتب عن {topic}','محتوى عربي موثوق عن {topic}','دليل شامل عن {topic}','ملخص {topic}','حقائق عن {topic}','مفاهيم أساسية في {topic}','تعلم {topic}','توعية حول {topic}','أسئلة وأجوبة عن {topic}','دليل الأسرة إلى {topic}','دليل المختص إلى {topic}','معلومات حديثة عن {topic}','مراجعة علمية عن {topic}','روابط مفيدة عن {topic}'],
  en: ['what is {topic}','what does {topic} mean','{topic} explained','{topic} guide','information about {topic}','frequently asked questions about {topic}','key questions about {topic}','trusted answers about {topic}','how to understand {topic}','what to know about {topic}','why {topic} matters','trusted sources about {topic}','references for {topic}','scientific evidence about {topic}','evidence-based information about {topic}','latest evidence about {topic}','{topic} in plain language','{topic} detailed explanation','{topic} step by step','{topic} for beginners','{topic} for families','{topic} for parents','{topic} for professionals','{topic} for teachers','{topic} for students','understanding {topic}','assessing {topic}','review of {topic}','examples of {topic}','terms related to {topic}','topics related to {topic}','how to verify information about {topic}','authoritative sources for {topic}','important questions about {topic}','next steps after learning about {topic}','how to use {topic} information','services related to {topic}','practical evidence about {topic}','general guidance about {topic}','what is new in {topic}','{topic} research','{topic} studies','{topic} articles','books about {topic}','trusted content about {topic}','comprehensive guide to {topic}','{topic} summary','facts about {topic}','core concepts in {topic}','learn about {topic}','{topic} awareness','{topic} questions and answers','family guide to {topic}','professional guide to {topic}','current information about {topic}','scientific review of {topic}','useful resources about {topic}','reliable {topic} information','evidence guide for {topic}','research sources for {topic}'],
  es: ['qué es {topic}','qué significa {topic}','{topic} explicado','guía de {topic}','información sobre {topic}','preguntas frecuentes sobre {topic}','preguntas clave sobre {topic}','respuestas confiables sobre {topic}','cómo entender {topic}','qué saber sobre {topic}','por qué importa {topic}','fuentes confiables sobre {topic}','referencias sobre {topic}','evidencia científica sobre {topic}','información basada en evidencia sobre {topic}','evidencia reciente sobre {topic}','{topic} en lenguaje sencillo','{topic} explicación detallada','{topic} paso a paso','{topic} para principiantes','{topic} para familias','{topic} para padres','{topic} para profesionales','{topic} para docentes','{topic} para estudiantes','comprender {topic}','evaluar {topic}','revisión de {topic}','ejemplos de {topic}','términos relacionados con {topic}','temas relacionados con {topic}','cómo verificar información sobre {topic}','fuentes autorizadas sobre {topic}','preguntas importantes sobre {topic}','próximos pasos después de aprender sobre {topic}','cómo usar la información de {topic}','servicios relacionados con {topic}','evidencia práctica sobre {topic}','orientación general sobre {topic}','novedades sobre {topic}','investigación sobre {topic}','estudios sobre {topic}','artículos sobre {topic}','libros sobre {topic}','contenido confiable sobre {topic}','guía completa de {topic}','resumen de {topic}','datos sobre {topic}','conceptos básicos de {topic}','aprender sobre {topic}','concienciación sobre {topic}','preguntas y respuestas sobre {topic}','guía para familias sobre {topic}','guía profesional sobre {topic}','información actual sobre {topic}','revisión científica de {topic}','recursos útiles sobre {topic}','información fiable sobre {topic}','guía de evidencia para {topic}','fuentes de investigación sobre {topic}'],
};

function localeFor(path: string): Locale {
  if (path === '/en' || path.startsWith('/en/')) return 'en';
  if (path === '/es' || path.startsWith('/es/')) return 'es';
  return 'ar';
}

function domainFor(input: SemanticSeoInput): Domain {
  const text = [input.path,input.title,input.description || '',...(input.keywords || []),...(input.relatedTerms || [])].join(' ').toLowerCase();
  if (/\/terms|\/privacy|\/disclaimer|\/accessibility|editorial-policy|medical-review-policy|\/citation|\/trust|سياس|خصوص|شروط|إخلاء|وصولية|legal|privacy|terms|disclaimer/.test(text)) return 'legal';
  if (/pediatric-oncology|oncolog|cancer|سرطان|أورام|لوكيميا|ابيضاض/.test(text)) return 'oncology';
  if (/addiction|recovery|substance|إدمان|التعافي|تعاطي|انسحاب/.test(text)) return 'addiction';
  if (/special-needs|inclusive|education|autism|learning-disab|school|تربية|تعليم|توحد|صعوبات التعلم|احتياجات خاصة|إعاقة|دمج/.test(text)) return 'education';
  if (/mental-health|psych|anxiety|depress|trauma|نفسي|عقلي|قلق|اكتئاب|صدمة|اضطراب/.test(text)) return 'mental-health';
  if (/specialists|centers|directory|مختص|مركز|دليل مهني/.test(text)) return 'directory';
  if (/tools|assessment|calculator|cognitive-lab|questionnaire|scale|checklist|أداة|تقييم|مقياس|استبيان|حاسبة|مختبر/.test(text)) return 'tools';
  return 'general';
}

function clean(value: string) {
  return value.normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160).trim();
}

function key(value: string, locale: Locale) {
  return clean(value).toLocaleLowerCase(locale).replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ').trim();
}

function pathTerms(path: string) {
  return path.split('/').filter(Boolean).map((segment) => {
    try { return decodeURIComponent(segment); } catch { return segment; }
  }).filter((segment) => !segment.startsWith('[') && !/^\d+$/.test(segment)).map((segment) => segment.replace(/[-_]+/g, ' ').trim()).filter(Boolean);
}

function phrases(value: string) {
  const tokens = value.normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/).filter((token) => token.length >= 2).slice(0, 36);
  const out = [...tokens];
  for (let size = 2; size <= 3; size += 1) for (let i = 0; i <= tokens.length - size; i += 1) out.push(tokens.slice(i, i + size).join(' '));
  return out;
}

function addUnique(out: string[], seen: Set<string>, value: string, locale: Locale, limit: number) {
  if (out.length >= limit) return;
  const normalized = clean(value);
  const normalizedKey = key(normalized, locale);
  if (normalizedKey.length < 2 || seen.has(normalizedKey)) return;
  seen.add(normalizedKey);
  out.push(normalized);
}

function primaryTopic(input: SemanticSeoInput) {
  const candidates = [...(input.keywords || []), input.title, ...pathTerms(input.path)].map(clean).filter(Boolean);
  return candidates.find((value) => !/روافد|rawafid/i.test(value)) || clean(input.title.replace(/\|.*$/, '')) || 'روافد';
}

function domainTerms(domain: Domain, locale: Locale) {
  if (locale === 'ar') return DOMAIN_TERMS_AR[domain];
  return GENERIC_TERMS[locale];
}

function buildTopicKeywords(input: SemanticSeoInput, locale: Locale, domain: Domain, topic: string) {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (value: string) => addUnique(out, seen, value, locale, SEO_TOPIC_KEYWORD_TARGET);
  for (const value of input.keywords || []) add(value);
  for (const value of input.relatedTerms || []) add(value);
  add(topic);
  add(input.title.replace(/\|.*$/, ''));
  for (const value of pathTerms(input.path)) add(value);
  for (const value of phrases(input.title)) add(value);
  for (const value of phrases(input.description || '')) add(value);
  const related = [...domainTerms(domain, locale), ...GENERIC_TERMS[locale]];
  for (const value of related) add(value);
  for (const value of related) add(`${topic} ${value}`);
  let counter = 1;
  while (out.length < SEO_TOPIC_KEYWORD_TARGET) add(`${topic} ${locale === 'ar' ? 'موضوع مرتبط' : locale === 'es' ? 'tema relacionado' : 'related topic'} ${counter++}`);
  return out;
}

function buildSearchIntents(input: SemanticSeoInput, locale: Locale, topic: string, occupied: string[]) {
  const out: string[] = [];
  const seen = new Set(occupied.map((value) => key(value, locale)));
  const add = (value: string) => addUnique(out, seen, value, locale, SEO_SEARCH_INTENT_TARGET);
  for (const value of input.searchIntents || []) add(value);
  for (const frame of INTENT_FRAMES[locale]) add(frame.replaceAll('{topic}', topic));
  let counter = 1;
  const fallback = locale === 'ar' ? 'سؤال مهم عن' : locale === 'es' ? 'pregunta importante sobre' : 'important question about';
  while (out.length < SEO_SEARCH_INTENT_TARGET) add(`${fallback} ${topic} ${counter++}`);
  return out;
}

export function buildSemanticSeoProfile(input: SemanticSeoInput): SemanticSeoProfile {
  const locale = localeFor(input.path);
  const domain = domainFor(input);
  const topic = primaryTopic(input);
  const topicKeywords = buildTopicKeywords(input, locale, domain, topic);
  const searchIntents = buildSearchIntents(input, locale, topic, topicKeywords);
  return { locale, domain, primaryTopic: topic, topicKeywords, searchIntents, keywords: [...topicKeywords, ...searchIntents] };
}
