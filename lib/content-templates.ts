export type ContentTemplate = {
  type: string;
  label: string;
  description: string;
  cue: string;
};

export const ADMIN_CONTENT_TEMPLATES: ContentTemplate[] = [
  { type: 'article', label: 'مقال معرفي', description: 'شرح موثوق لسؤال أو موضوع محدد.', cue: 'مقدمة · نقاط رئيسية · تطبيق عملي · مصادر' },
  { type: 'guide', label: 'دليل عملي', description: 'مسار متدرج يساعد القارئ على اتخاذ خطوة.', cue: 'لمن الدليل · خطوات · أمثلة · موارد' },
  { type: 'condition', label: 'صفحة حالة', description: 'مرجع منظم للأعراض والتقييم وخيارات الدعم.', cue: 'نظرة عامة · مؤشرات · تقييم · مساعدة' },
  { type: 'comparison', label: 'مقارنة', description: 'مقارنة عادلة بين خيارات أو مفاهيم متقاربة.', cue: 'معايير · جدول · فروق · اختيار مناسب' },
  { type: 'tool', label: 'أداة إرشادية', description: 'أداة عملية آمنة لا تدّعي التشخيص.', cue: 'هدف · تعليمات · نتيجة إرشادية · حدود' },
  { type: 'landing_page', label: 'صفحة مؤسسية', description: 'صفحة تعريف أو حملة أو خدمة متكاملة.', cue: 'وعد واضح · دليل ثقة · مسارات · إجراء' },
];

export const SPECIALIST_CONTENT_TEMPLATES = ADMIN_CONTENT_TEMPLATES.filter((template) => ['article', 'guide'].includes(template.type)).concat([
  { type: 'resource', label: 'مورد مهني', description: 'مادة قابلة للاستخدام أو الإحالة ضمن سياق واضح.', cue: 'الغرض · طريقة الاستخدام · القيود · المصادر' },
]);

export function resolveContentTemplate(type: string | undefined, templates: ContentTemplate[]) {
  return templates.find((template) => template.type === type) ?? templates[0];
}
