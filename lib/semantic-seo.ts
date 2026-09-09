export const SEO_TOPIC_KEYWORD_TARGET = 50;
export const SEO_SEARCH_INTENT_TARGET = 50;
export const SEO_TOTAL_KEYWORD_MINIMUM = 100;

type Locale = 'ar' | 'en' | 'es';
type Domain = 'legal' | 'oncology' | 'mental-health' | 'education' | 'addiction' | 'directory' | 'tools' | 'general';
type DomainTerms = Record<Domain, string[]>;

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

const DOMAIN_TERMS: Record<Locale, DomainTerms> = {
  ar: {
    legal: ['حقوق المستخدم','مسؤوليات المستخدم','الاستخدام المقبول','حماية الحساب','حماية البيانات','خصوصية المستخدم','الموافقة','إدارة الحساب','التحقق من الهوية','المحتوى المنشور','الملفات المهنية','سياسات المنصة','شروط الخدمة','حدود المسؤولية','تحديث السياسات','أمن المعلومات','الشفافية','الامتثال','الوصولية','حقوق المحتوى','إدارة الصلاحيات','تعليق الحساب','حذف الحساب','حماية المنصة','التواصل والدعم'],
    oncology: ['سرطان الأطفال','أورام الأطفال','طب أورام الأطفال','الأعراض والعلامات','التشخيص','الفحوصات','العلاج','العلاج الكيميائي','العلاج الإشعاعي','الجراحة','العلاج الموجه','العلاج المناعي','الرعاية الداعمة','الآثار الجانبية','مكافحة العدوى','التغذية','الألم','الدعم النفسي','دعم الأسرة','الدراسة أثناء العلاج','المتابعة','النجاة من السرطان','التجارب السريرية','البروتوكولات العلاجية','الرعاية التلطيفية'],
    'mental-health': ['الصحة النفسية','الصحة العقلية','الأعراض','الأسباب','عوامل الخطر','التقييم النفسي','التشخيص','العلاج النفسي','العلاج الدوائي','الدعم النفسي','الوقاية','المهارات اليومية','التكيف','إدارة الضغوط','القلق','الاكتئاب','الصدمات النفسية','النوم','العلاقات','جودة الحياة','التعافي','منع الانتكاس','متى أطلب المساعدة','المختص النفسي','خطة الأمان'],
    education: ['التربية الخاصة','التربية الدامجة','ذوو الاحتياجات الخاصة','اضطراب طيف التوحد','صعوبات التعلم','الإعاقة','التقييم التربوي','الخطة التربوية الفردية','التدخل المبكر','التكييفات الصفية','التعديلات التعليمية','التصميم الشامل للتعلم','السلوك','التواصل','المهارات الأكاديمية','المهارات الاجتماعية','الاستقلالية','دعم الأسرة','دعم المعلم','المدرسة الدامجة','التقنيات المساندة','الوصول التعليمي','الانتقال','المشاركة','التقييم الوظيفي'],
    addiction: ['الإدمان','اضطرابات استخدام المواد','تعاطي المواد','الاعتماد','الانسحاب','الرغبة الملحة','عوامل الخطر','التقييم','العلاج','العلاج النفسي','الدعم الاجتماعي','منع الانتكاس','المحفزات','خطة التعافي','الحد من الضرر','الدعم الأسري','الصحة النفسية','الاضطرابات المصاحبة','مجموعات الدعم','خدمات العلاج','التعافي طويل المدى','مهارات المواجهة','الأزمات','الإحالة للمختص','المتابعة'],
    directory: ['مختصون','مراكز','خدمات','دليل مهني','التخصص','المؤهلات','التحقق المهني','الخبرة','مجال الممارسة','نوع الخدمة','الفئة العمرية','المدينة','الدولة','التواصل','الحجز','الخدمة الحضورية','الخدمة عن بعد','معلومات مهنية','اختيار المختص','اختيار المركز','الإحالة','الوصول للخدمة','ملف مهني','معايير الثقة','توثيق البيانات'],
    tools: ['أداة معرفية','تقييم إرشادي','مقياس','استبيان','حاسبة','نتيجة','تفسير النتيجة','طريقة الاستخدام','حدود الأداة','الخصوصية','الدقة','الموثوقية','التحقق','خطوات عملية','متابعة التقدم','مؤشرات','ملاحظات','سجل','تقرير','رسم بياني','مقارنة','قرار مستنير','إرشاد','دعم','إحالة للمختص'],
    general: ['تعريف','مفهوم','أساسيات','مبادئ','مصطلحات','موضوعات ذات صلة','معلومات موثوقة','محتوى عربي','دليل معرفي','دليل عملي','شرح مفصل','شرح مبسط','أدلة علمية','مصادر موثوقة','مراجع','دراسات','أبحاث','كتب','مقالات','أسئلة شائعة','إرشادات','توصيات','ممارسات','أمثلة','تطبيقات'],
  },
  en: {
    legal: ['user rights','user responsibilities','acceptable use','account security','data protection','user privacy','consent','account management','identity verification','published content','professional profiles','platform policies','terms of service','liability limits','policy updates','information security','transparency','compliance','accessibility','content rights','permissions','account suspension','account deletion','platform protection','support'],
    oncology: ['pediatric cancer','pediatric oncology','childhood cancer','signs and symptoms','diagnosis','diagnostic tests','treatment','chemotherapy','radiation therapy','surgery','targeted therapy','immunotherapy','supportive care','treatment side effects','infection prevention','nutrition','pain management','psychological support','family support','school during treatment','follow-up care','cancer survivorship','clinical trials','treatment protocols','palliative care'],
    'mental-health': ['mental health','mental wellbeing','symptoms','causes','risk factors','psychological assessment','diagnosis','psychotherapy','medication','psychological support','prevention','daily coping skills','coping strategies','stress management','anxiety','depression','psychological trauma','sleep','relationships','quality of life','recovery','relapse prevention','when to seek help','mental health professional','safety planning'],
    education: ['special education','inclusive education','special educational needs','autism spectrum disorder','learning disabilities','disability','educational assessment','individualized education plan','early intervention','classroom accommodations','curriculum modifications','universal design for learning','behavior support','communication','academic skills','social skills','independence','family support','teacher support','inclusive school','assistive technology','educational access','transition planning','participation','functional assessment'],
    addiction: ['addiction','substance use disorders','substance use','dependence','withdrawal','craving','risk factors','assessment','treatment','psychotherapy','social support','relapse prevention','triggers','recovery plan','harm reduction','family support','mental health','co-occurring conditions','support groups','treatment services','long-term recovery','coping skills','crisis support','professional referral','follow-up'],
    directory: ['specialists','centers','services','professional directory','specialty','qualifications','professional verification','experience','scope of practice','service type','age group','city','country','contact information','booking','in-person service','remote service','professional information','choosing a specialist','choosing a center','referral','access to care','professional profile','trust criteria','verified information'],
    tools: ['knowledge tool','guided assessment','scale','questionnaire','calculator','result','result interpretation','how to use','tool limitations','privacy','accuracy','reliability','validation','practical steps','progress tracking','indicators','notes','history','report','chart','comparison','informed decision','guidance','support','professional referral'],
    general: ['definition','meaning','fundamentals','principles','terminology','related topics','trusted information','knowledge guide','practical guide','detailed explanation','plain-language explanation','scientific evidence','trusted sources','references','studies','research','books','articles','frequently asked questions','guidance','recommendations','practices','examples','applications','awareness'],
  },
  es: {
    legal: ['derechos del usuario','responsabilidades del usuario','uso aceptable','seguridad de la cuenta','protección de datos','privacidad del usuario','consentimiento','gestión de la cuenta','verificación de identidad','contenido publicado','perfiles profesionales','políticas de la plataforma','términos del servicio','límites de responsabilidad','actualizaciones de políticas','seguridad de la información','transparencia','cumplimiento','accesibilidad','derechos de contenido','permisos','suspensión de cuenta','eliminación de cuenta','protección de la plataforma','soporte'],
    oncology: ['cáncer infantil','oncología pediátrica','cáncer pediátrico','signos y síntomas','diagnóstico','pruebas diagnósticas','tratamiento','quimioterapia','radioterapia','cirugía','terapia dirigida','inmunoterapia','cuidados de apoyo','efectos secundarios','prevención de infecciones','nutrición','manejo del dolor','apoyo psicológico','apoyo familiar','escuela durante el tratamiento','seguimiento','supervivencia al cáncer','ensayos clínicos','protocolos de tratamiento','cuidados paliativos'],
    'mental-health': ['salud mental','bienestar mental','síntomas','causas','factores de riesgo','evaluación psicológica','diagnóstico','psicoterapia','medicación','apoyo psicológico','prevención','habilidades de afrontamiento','estrategias de afrontamiento','manejo del estrés','ansiedad','depresión','trauma psicológico','sueño','relaciones','calidad de vida','recuperación','prevención de recaídas','cuándo buscar ayuda','profesional de salud mental','plan de seguridad'],
    education: ['educación especial','educación inclusiva','necesidades educativas especiales','trastorno del espectro autista','dificultades de aprendizaje','discapacidad','evaluación educativa','plan educativo individualizado','intervención temprana','adaptaciones en el aula','modificaciones curriculares','diseño universal para el aprendizaje','apoyo conductual','comunicación','habilidades académicas','habilidades sociales','independencia','apoyo familiar','apoyo docente','escuela inclusiva','tecnología de apoyo','acceso educativo','planificación de transición','participación','evaluación funcional'],
    addiction: ['adicción','trastornos por consumo de sustancias','consumo de sustancias','dependencia','abstinencia','deseo intenso','factores de riesgo','evaluación','tratamiento','psicoterapia','apoyo social','prevención de recaídas','desencadenantes','plan de recuperación','reducción de daños','apoyo familiar','salud mental','trastornos concurrentes','grupos de apoyo','servicios de tratamiento','recuperación a largo plazo','habilidades de afrontamiento','apoyo en crisis','derivación profesional','seguimiento'],
    directory: ['especialistas','centros','servicios','directorio profesional','especialidad','cualificaciones','verificación profesional','experiencia','ámbito de práctica','tipo de servicio','grupo de edad','ciudad','país','información de contacto','reserva','servicio presencial','servicio remoto','información profesional','elegir especialista','elegir centro','derivación','acceso a la atención','perfil profesional','criterios de confianza','información verificada'],
    tools: ['herramienta de conocimiento','evaluación guiada','escala','cuestionario','calculadora','resultado','interpretación del resultado','cómo usar','límites de la herramienta','privacidad','precisión','fiabilidad','validación','pasos prácticos','seguimiento del progreso','indicadores','notas','historial','informe','gráfico','comparación','decisión informada','orientación','apoyo','derivación profesional'],
    general: ['definición','significado','fundamentos','principios','terminología','temas relacionados','información confiable','guía de conocimiento','guía práctica','explicación detallada','explicación sencilla','evidencia científica','fuentes confiables','referencias','estudios','investigación','libros','artículos','preguntas frecuentes','orientación','recomendaciones','prácticas','ejemplos','aplicaciones','concienciación'],
  },
};

const GENERIC_TERMS: Record<Locale, string[]> = {
  ar: ['معرفة موثوقة','معلومات حديثة','محتوى قائم على الدليل','مراجعة علمية','شرح عملي','توعية','فهم','تقييم','دعم','خدمات','دليل شامل','حقائق','أسئلة وأجوبة','مصادر معتمدة','روابط مفيدة','خطوات عملية','معلومات بالعربية','جودة المعلومات','سلامة المعلومات','اتخاذ قرار مستنير'],
  en: ['trusted information','current information','evidence-based knowledge','scientific review','practical explanation','awareness','understanding','assessment','support','services','comprehensive guide','facts','questions and answers','authoritative sources','useful resources','practical steps','information quality','information safety','informed decisions','reliable guidance'],
  es: ['información confiable','información actual','conocimiento basado en evidencia','revisión científica','explicación práctica','concienciación','comprensión','evaluación','apoyo','servicios','guía completa','datos','preguntas y respuestas','fuentes autorizadas','recursos útiles','pasos prácticos','calidad de la información','seguridad de la información','decisiones informadas','orientación fiable'],
};

const GENERIC_INTENT_FRAMES: Record<Locale, string[]> = {
  ar: ['ما هو {topic}','ما معنى {topic}','شرح {topic}','دليل {topic}','معلومات عن {topic}','أسئلة شائعة عن {topic}','أهم الأسئلة عن {topic}','إجابات موثوقة عن {topic}','كيف أفهم {topic}','ما الذي يجب معرفته عن {topic}','لماذا يهم {topic}','أين أجد معلومات موثوقة عن {topic}','مصادر موثوقة عن {topic}','مراجع عن {topic}','أدلة علمية عن {topic}','معلومات مبنية على الدليل عن {topic}','أحدث الأدلة عن {topic}','{topic} بالعربي','{topic} شرح مبسط','{topic} شرح مفصل','{topic} خطوة بخطوة','{topic} للمبتدئين','{topic} للأسر','{topic} للوالدين','{topic} للمختصين','فهم {topic}','التعامل مع {topic}','تقييم {topic}','مراجعة {topic}','أمثلة على {topic}','مصطلحات مرتبطة بـ {topic}','موضوعات مرتبطة بـ {topic}','كيف أتحقق من معلومات {topic}','ما المصادر المعتمدة عن {topic}','ما الأسئلة المهمة عن {topic}','ما الخطوة التالية بعد قراءة {topic}','كيف أستخدم معلومات {topic} عمليًا','ما الخدمات المرتبطة بـ {topic}','ما الأدلة العملية حول {topic}','ما التوصيات العامة حول {topic}','ما الجديد في {topic}','أبحاث {topic}','دراسات {topic}','مقالات {topic}','كتب عن {topic}','محتوى عربي موثوق عن {topic}','دليل شامل عن {topic}','ملخص {topic}','حقائق عن {topic}','مفاهيم أساسية في {topic}','تعلم {topic}','توعية حول {topic}','أسئلة وأجوبة عن {topic}','معلومات حديثة عن {topic}','مراجعة علمية عن {topic}','روابط مفيدة عن {topic}'],
  en: ['what is {topic}','what does {topic} mean','{topic} explained','{topic} guide','information about {topic}','frequently asked questions about {topic}','key questions about {topic}','trusted answers about {topic}','how to understand {topic}','what to know about {topic}','why {topic} matters','where to find trusted information about {topic}','trusted sources about {topic}','references for {topic}','scientific evidence about {topic}','evidence-based information about {topic}','latest evidence about {topic}','{topic} in plain language','{topic} detailed explanation','{topic} step by step','{topic} for beginners','{topic} for families','{topic} for parents','{topic} for professionals','understanding {topic}','assessing {topic}','review of {topic}','examples of {topic}','terms related to {topic}','topics related to {topic}','how to verify information about {topic}','authoritative sources for {topic}','important questions about {topic}','next steps after learning about {topic}','how to use {topic} information','services related to {topic}','practical evidence about {topic}','general guidance about {topic}','what is new in {topic}','{topic} research','{topic} studies','{topic} articles','books about {topic}','trusted content about {topic}','comprehensive guide to {topic}','{topic} summary','facts about {topic}','core concepts in {topic}','learn about {topic}','{topic} awareness','{topic} questions and answers','current information about {topic}','scientific review of {topic}','useful resources about {topic}','reliable {topic} information','evidence guide for {topic}'],
  es: ['qué es {topic}','qué significa {topic}','{topic} explicado','guía de {topic}','información sobre {topic}','preguntas frecuentes sobre {topic}','preguntas clave sobre {topic}','respuestas confiables sobre {topic}','cómo entender {topic}','qué saber sobre {topic}','por qué importa {topic}','dónde encontrar información confiable sobre {topic}','fuentes confiables sobre {topic}','referencias sobre {topic}','evidencia científica sobre {topic}','información basada en evidencia sobre {topic}','evidencia reciente sobre {topic}','{topic} en lenguaje sencillo','{topic} explicación detallada','{topic} paso a paso','{topic} para principiantes','{topic} para familias','{topic} para padres','{topic} para profesionales','comprender {topic}','evaluar {topic}','revisión de {topic}','ejemplos de {topic}','términos relacionados con {topic}','temas relacionados con {topic}','cómo verificar información sobre {topic}','fuentes autorizadas sobre {topic}','preguntas importantes sobre {topic}','próximos pasos después de aprender sobre {topic}','cómo usar la información de {topic}','servicios relacionados con {topic}','evidencia práctica sobre {topic}','orientación general sobre {topic}','novedades sobre {topic}','investigación sobre {topic}','estudios sobre {topic}','artículos sobre {topic}','libros sobre {topic}','contenido confiable sobre {topic}','guía completa de {topic}','resumen de {topic}','datos sobre {topic}','conceptos básicos de {topic}','aprender sobre {topic}','concienciación sobre {topic}','preguntas y respuestas sobre {topic}','información actual sobre {topic}','revisión científica de {topic}','recursos útiles sobre {topic}','información fiable sobre {topic}','guía de evidencia para {topic}'],
};

const DOMAIN_INTENT_FRAMES: Record<Locale, Partial<Record<Domain, string[]>>> = {
  ar: {
    legal: ['ما حقوق المستخدم في {topic}','ما مسؤوليات المستخدم في {topic}','ما الاستخدام المقبول وفق {topic}','كيف تحمي {topic} الحساب والبيانات','كيف تتعامل {topic} مع الخصوصية','متى يمكن تعليق الحساب وفق {topic}','كيف تُحدّث {topic}','ما حدود المسؤولية في {topic}','كيف تحمي {topic} حقوق المحتوى','ما قواعد التحقق والصلاحيات في {topic}'],
    oncology: ['ما أعراض {topic}','كيف يُشخّص {topic}','ما فحوصات {topic}','ما خيارات علاج {topic}','ما الآثار الجانبية لعلاج {topic}','كيف تكون الرعاية الداعمة في {topic}','كيف تدعم الأسرة طفلًا مع {topic}','ما المتابعة بعد علاج {topic}','ما التجارب السريرية المتعلقة بـ {topic}','ما الأسئلة المهمة لفريق الأورام عن {topic}','كيف تُدار العدوى والتغذية مع {topic}','ما معنى النجاة والمتابعة طويلة المدى في {topic}'],
    'mental-health': ['ما أعراض {topic}','ما أسباب {topic}','ما عوامل خطر {topic}','كيف يتم تقييم {topic}','كيف يُشخّص {topic}','ما خيارات علاج {topic}','ما دور العلاج النفسي في {topic}','متى أطلب مساعدة بسبب {topic}','كيف أساند شخصًا لديه {topic}','كيف يؤثر {topic} في النوم والعلاقات','كيف يكون التعافي من {topic}','كيف تقل احتمالات الانتكاس في {topic}'],
    education: ['ما علامات {topic}','كيف يتم تقييم {topic}','ما التدخل المبكر المناسب لـ {topic}','ما التكييفات الصفية لـ {topic}','كيف تُبنى خطة تربوية فردية لـ {topic}','ما استراتيجيات تعليم {topic}','كيف يدعم المعلم الطالب مع {topic}','كيف تدعم الأسرة الطفل مع {topic}','ما دور الدمج في {topic}','ما التقنيات المساندة المفيدة لـ {topic}','كيف يُقاس التقدم في {topic}','ما الممارسات القائمة على الدليل لـ {topic}'],
    addiction: ['ما علامات {topic}','ما أسباب وعوامل خطر {topic}','كيف يتم تقييم {topic}','ما خيارات علاج {topic}','كيف يُدار الانسحاب في {topic}','كيف تُدار الرغبة الملحة في {topic}','كيف تُبنى خطة تعافٍ من {topic}','كيف يُمنع الانتكاس في {topic}','ما دور الأسرة في التعافي من {topic}','ما علاقة الصحة النفسية بـ {topic}','متى أطلب مساعدة متخصصة بسبب {topic}','ما خدمات الدعم المناسبة لـ {topic}'],
    directory: ['كيف أختار مختصًا في {topic}','كيف أختار مركزًا لـ {topic}','ما المؤهلات المناسبة لمختص {topic}','كيف أتحقق من مختص {topic}','ما الخدمات المتاحة لـ {topic}','هل تتوفر خدمة عن بعد لـ {topic}','ما الأسئلة قبل حجز خدمة {topic}','كيف أصل إلى خدمة مناسبة لـ {topic}','متى أحتاج إحالة إلى مختص في {topic}','ما معايير الثقة في دليل {topic}'],
    tools: ['كيف أستخدم {topic}','كيف أقرأ نتيجة {topic}','ماذا تعني نتيجة {topic}','ما حدود {topic}','هل {topic} أداة تشخيص','ما دقة وموثوقية {topic}','كيف أحافظ على خصوصيتي عند استخدام {topic}','متى أكرر {topic}','كيف أتابع التقدم باستخدام {topic}','متى أراجع مختصًا بعد {topic}','لمن يناسب {topic}','ما الذي لا يقيسه {topic}'],
  },
  en: {
    legal: ['what user rights apply to {topic}','what user responsibilities apply to {topic}','what is acceptable use under {topic}','how does {topic} protect accounts and data','how does {topic} handle privacy','when can an account be suspended under {topic}','how is {topic} updated','what are the liability limits in {topic}','how does {topic} protect content rights','what verification and permission rules apply to {topic}'],
    oncology: ['what are the symptoms of {topic}','how is {topic} diagnosed','what tests are used for {topic}','what are the treatment options for {topic}','what side effects can occur during {topic} treatment','what supportive care is used in {topic}','how can families support a child with {topic}','what follow-up is needed after {topic}','what clinical trials relate to {topic}','what should I ask the oncology team about {topic}','how are infection and nutrition managed with {topic}','what does long-term survivorship look like after {topic}'],
    'mental-health': ['what are the symptoms of {topic}','what causes {topic}','what are the risk factors for {topic}','how is {topic} assessed','how is {topic} diagnosed','what are the treatment options for {topic}','how can psychotherapy help with {topic}','when should I seek help for {topic}','how can I support someone with {topic}','how does {topic} affect sleep and relationships','what does recovery from {topic} involve','how can relapse risk be reduced in {topic}'],
    education: ['what are the signs of {topic}','how is {topic} assessed','what early intervention helps with {topic}','what classroom accommodations help with {topic}','how is an individual education plan built for {topic}','what teaching strategies help with {topic}','how can teachers support a student with {topic}','how can families support a child with {topic}','how does inclusion apply to {topic}','what assistive technology helps with {topic}','how is progress measured in {topic}','what evidence-based practices support {topic}'],
    addiction: ['what are the signs of {topic}','what causes and risk factors relate to {topic}','how is {topic} assessed','what treatments are available for {topic}','how is withdrawal managed in {topic}','how are cravings managed in {topic}','how is a recovery plan built for {topic}','how can relapse be prevented in {topic}','how can family support recovery from {topic}','how does mental health relate to {topic}','when should I seek specialist help for {topic}','what support services are available for {topic}'],
    directory: ['how do I choose a specialist for {topic}','how do I choose a center for {topic}','what qualifications should a {topic} specialist have','how can I verify a {topic} professional','what services are available for {topic}','are remote services available for {topic}','what should I ask before booking {topic} care','how do I access appropriate {topic} services','when is a specialist referral needed for {topic}','what trust criteria should a {topic} directory use'],
    tools: ['how do I use {topic}','how do I read a {topic} result','what does a {topic} result mean','what are the limits of {topic}','is {topic} a diagnostic tool','how accurate and reliable is {topic}','how is privacy handled when using {topic}','when should I repeat {topic}','how can I track progress with {topic}','when should I see a professional after {topic}','who is {topic} suitable for','what does {topic} not measure'],
  },
  es: {
    legal: ['qué derechos del usuario se aplican a {topic}','qué responsabilidades del usuario se aplican a {topic}','qué es uso aceptable según {topic}','cómo protege {topic} las cuentas y los datos','cómo trata {topic} la privacidad','cuándo puede suspenderse una cuenta según {topic}','cómo se actualiza {topic}','cuáles son los límites de responsabilidad en {topic}','cómo protege {topic} los derechos de contenido','qué reglas de verificación y permisos se aplican a {topic}'],
    oncology: ['cuáles son los síntomas de {topic}','cómo se diagnostica {topic}','qué pruebas se usan para {topic}','cuáles son las opciones de tratamiento para {topic}','qué efectos secundarios pueden aparecer durante el tratamiento de {topic}','qué cuidados de apoyo se usan en {topic}','cómo puede la familia apoyar a un niño con {topic}','qué seguimiento se necesita después de {topic}','qué ensayos clínicos se relacionan con {topic}','qué preguntar al equipo de oncología sobre {topic}','cómo se manejan infección y nutrición con {topic}','cómo es la supervivencia a largo plazo después de {topic}'],
    'mental-health': ['cuáles son los síntomas de {topic}','qué causa {topic}','cuáles son los factores de riesgo de {topic}','cómo se evalúa {topic}','cómo se diagnostica {topic}','cuáles son las opciones de tratamiento para {topic}','cómo puede ayudar la psicoterapia en {topic}','cuándo buscar ayuda por {topic}','cómo apoyar a una persona con {topic}','cómo afecta {topic} al sueño y las relaciones','qué implica recuperarse de {topic}','cómo reducir el riesgo de recaída en {topic}'],
    education: ['cuáles son las señales de {topic}','cómo se evalúa {topic}','qué intervención temprana ayuda con {topic}','qué adaptaciones de aula ayudan con {topic}','cómo se crea un plan educativo individualizado para {topic}','qué estrategias de enseñanza ayudan con {topic}','cómo apoyar al estudiante con {topic}','cómo apoyar a la familia ante {topic}','cómo se aplica la inclusión a {topic}','qué tecnología de apoyo ayuda con {topic}','cómo se mide el progreso en {topic}','qué prácticas basadas en evidencia apoyan {topic}'],
    addiction: ['cuáles son las señales de {topic}','qué causas y factores de riesgo se relacionan con {topic}','cómo se evalúa {topic}','qué tratamientos existen para {topic}','cómo se maneja la abstinencia en {topic}','cómo se manejan los deseos intensos en {topic}','cómo se crea un plan de recuperación de {topic}','cómo prevenir recaídas en {topic}','cómo apoyar la recuperación familiar de {topic}','cómo se relaciona la salud mental con {topic}','cuándo buscar ayuda especializada por {topic}','qué servicios de apoyo existen para {topic}'],
    directory: ['cómo elegir un especialista en {topic}','cómo elegir un centro para {topic}','qué cualificaciones debe tener un especialista en {topic}','cómo verificar a un profesional de {topic}','qué servicios existen para {topic}','hay servicios remotos para {topic}','qué preguntar antes de reservar atención de {topic}','cómo acceder a servicios adecuados para {topic}','cuándo se necesita derivación especializada para {topic}','qué criterios de confianza debe usar un directorio de {topic}'],
    tools: ['cómo usar {topic}','cómo leer un resultado de {topic}','qué significa un resultado de {topic}','cuáles son los límites de {topic}','es {topic} una herramienta diagnóstica','qué precisión y fiabilidad tiene {topic}','cómo se protege la privacidad al usar {topic}','cuándo repetir {topic}','cómo seguir el progreso con {topic}','cuándo consultar a un profesional después de {topic}','para quién es adecuado {topic}','qué no mide {topic}'],
  },
};

const STOP_WORDS: Record<Locale, Set<string>> = {
  ar: new Set(['في','من','إلى','الى','على','عن','مع','هذا','هذه','ذلك','تلك','هو','هي','ما','كيف','أو','او','ثم','كل','بين','ضمن','التي','الذي','والتي','والذي','روافد']),
  en: new Set(['the','a','an','and','or','of','to','in','on','for','with','from','by','is','are','be','this','that','these','those','rawafid']),
  es: new Set(['el','la','los','las','un','una','y','o','de','del','a','en','para','con','por','es','son','este','esta','estos','estas','rawafid']),
};

function localeFor(path: string): Locale {
  if (path === '/en' || path.startsWith('/en/')) return 'en';
  if (path === '/es' || path.startsWith('/es/')) return 'es';
  return 'ar';
}

function domainFor(input: SemanticSeoInput): Domain {
  const path = input.path.toLowerCase();
  const text = [input.title,input.description || '',...(input.keywords || []),...(input.relatedTerms || [])].join(' ').toLowerCase();

  // Route families are the strongest signal. This prevents a generic word such as
  // "recovery" on a mental-health page from incorrectly turning the page into addiction.
  if (/\/(?:terms|privacy|disclaimer|accessibility|editorial-policy|medical-review-policy|citation|trust)(?:\/|$)/.test(path)) return 'legal';
  if (/(?:pediatric-oncology|oncology|childhood-cancer|cancer)/.test(path)) return 'oncology';
  if (/\/(?:addiction|substance-use)(?:\/|-|$)/.test(path) || /addiction-recovery/.test(path)) return 'addiction';
  if (/(?:special-needs|inclusive-education|education|autism|learning-disab|schools?)/.test(path)) return 'education';
  if (/(?:mental-health|psychology|psychiatry|anxiety|depression|trauma)/.test(path)) return 'mental-health';
  if (/\/(?:specialists|centers|directory)(?:\/|$)/.test(path)) return 'directory';
  if (/(?:\/tools(?:\/|$)|assessment|calculator|cognitive-lab|questionnaire|scale|checklist)/.test(path)) return 'tools';

  // Generic recovery/التعافي/recuperación is intentionally excluded from addiction detection.
  if (/سياس|خصوص|شروط|إخلاء|وصولية|legal|privacy|terms|disclaimer/.test(text)) return 'legal';
  if (/oncolog|cancer|سرطان|أورام|لوكيميا|ابيضاض|cáncer|oncología/.test(text)) return 'oncology';
  if (/addiction|substance use|substance-use|dependence|withdrawal|إدمان|تعاطي|استخدام المواد|انسحاب|adicción|consumo de sustancias|abstinencia/.test(text)) return 'addiction';
  if (/special education|inclusive education|autism|learning disab|school|تربية|تعليم|توحد|صعوبات التعلم|احتياجات خاصة|إعاقة|دمج|educación especial|educación inclusiva|autismo/.test(text)) return 'education';
  if (/mental health|mental wellbeing|psycholog|psychiatr|anxiety|depress|trauma|الصحة النفسية|الصحة العقلية|نفسي|قلق|اكتئاب|صدمة|salud mental|ansiedad|depresión|trauma/.test(text)) return 'mental-health';
  if (/specialist|professional directory|center|مختص|مركز|دليل مهني|especialista|directorio profesional|centro/.test(text)) return 'directory';
  if (/knowledge tool|guided assessment|calculator|questionnaire|checklist|أداة|تقييم إرشادي|مقياس|استبيان|حاسبة|مختبر|herramienta|evaluación guiada|cuestionario|calculadora/.test(text)) return 'tools';
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

function phrases(value: string, locale: Locale) {
  const stop = STOP_WORDS[locale];
  const tokens = value.normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/)
    .map((token) => token.trim()).filter((token) => token.length >= 2 && !stop.has(token.toLocaleLowerCase(locale))).slice(0, 36);
  const out = [...tokens];
  for (let size = 2; size <= 3; size += 1) {
    for (let i = 0; i <= tokens.length - size; i += 1) out.push(tokens.slice(i, i + size).join(' '));
  }
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
  const candidates = [...(input.keywords || []), input.title.replace(/\|.*$/, ''), ...pathTerms(input.path)].map(clean).filter(Boolean);
  return candidates.find((value) => value.length <= 100 && !/روافد|rawafid/i.test(value)) || clean(input.title.replace(/\|.*$/, '')) || 'روافد';
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
  for (const value of phrases(input.title, locale)) add(value);
  for (const value of phrases(input.description || '', locale)) add(value);
  const domainTerms = DOMAIN_TERMS[locale][domain];
  for (const value of domainTerms) add(value);
  for (const value of GENERIC_TERMS[locale]) add(value);
  for (const value of domainTerms) add(`${topic} ${value}`);
  for (const value of GENERIC_TERMS[locale]) add(`${topic} ${value}`);
  return out.slice(0, SEO_TOPIC_KEYWORD_TARGET);
}

function buildSearchIntents(input: SemanticSeoInput, locale: Locale, domain: Domain, topic: string, occupied: string[]) {
  const out: string[] = [];
  const seen = new Set(occupied.map((value) => key(value, locale)));
  const add = (value: string) => addUnique(out, seen, value, locale, SEO_SEARCH_INTENT_TARGET);
  const ensureTopic = (value: string) => key(value, locale).includes(key(topic, locale)) ? value : `${value} ${topic}`;
  for (const value of input.searchIntents || []) add(ensureTopic(value));
  for (const frame of DOMAIN_INTENT_FRAMES[locale][domain] || []) add(frame.replaceAll('{topic}', topic));
  for (const frame of GENERIC_INTENT_FRAMES[locale]) add(frame.replaceAll('{topic}', topic));
  return out.slice(0, SEO_SEARCH_INTENT_TARGET);
}

export function buildSemanticSeoProfile(input: SemanticSeoInput): SemanticSeoProfile {
  const locale = localeFor(input.path);
  const domain = domainFor(input);
  const topic = primaryTopic(input);
  const topicKeywords = buildTopicKeywords(input, locale, domain, topic);
  const searchIntents = buildSearchIntents(input, locale, domain, topic, topicKeywords);
  return { locale, domain, primaryTopic: topic, topicKeywords, searchIntents, keywords: [...topicKeywords, ...searchIntents] };
}
