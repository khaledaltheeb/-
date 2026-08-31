const TALENTIA_GUIDE = 'https://talentia.lukusali.fi/index.html#/reader/c5aa171b-223d-43b7-9778-05a0d8cede8e';
const TALENTIA_NEWS = 'https://www.talentia.fi/en/news/talentias-ethical-guidelines-are-now-available-in-english/';

const INLINE_REFERENCES: Record<string, string> = {
  'human-dignity-social-justice': `<section class="panel" data-talentia-inline-reference="human-dignity-social-justice"><h2>الرجوع إلى Talentia عند فحص الكرامة والعدالة</h2><p>عند تقييم ما إذا كان قرار مهني يحفظ كرامة المستفيد ويعالج العوائق البنيوية بدل اختزال المشكلة في الفرد، يمكن الرجوع مباشرة إلى <a href="${TALENTIA_GUIDE}" target="_blank" rel="noopener noreferrer"><strong>دليل Talentia: Work, Values and Ethics</strong></a> باعتباره المرجع الأصلي المستخدم هنا في بناء هذا المسار الأخلاقي. وللتأكد من مصدر النسخة الإنجليزية وسياق إتاحتها، توثق <a href="${TALENTIA_NEWS}" target="_blank" rel="noopener noreferrer"><strong>صفحة Talentia الرسمية الخاصة بإتاحة الإرشادات باللغة الإنجليزية</strong></a> الإصدار نفسه. يبقى تطبيق أي حق قانوني أو استحقاق خدمي خاضعًا للنظام المحلي، ولا تُنقل التفاصيل الفنلندية تلقائيًا إلى السياق العربي.</p></section>`,
  'self-determination-client-rights': `<section class="panel" data-talentia-inline-reference="self-determination-client-rights"><h2>مرجع مباشر لتقرير المصير وحقوق المستفيد</h2><p>عند فحص الاختيار الحقيقي، والموافقة، ودعم القرار، وحدود تدخل المختص، يُستخدم <a href="${TALENTIA_GUIDE}" target="_blank" rel="noopener noreferrer"><strong>دليل Talentia الأخلاقي الكامل</strong></a> كمرجع أصلي يساعد على إبقاء تقرير المصير وحقوق العميل داخل عملية القرار بدل معاملتها كإجراء شكلي. كما يمكن فتح <a href="${TALENTIA_NEWS}" target="_blank" rel="noopener noreferrer"><strong>الإعلان الرسمي من Talentia عن النسخة الإنجليزية</strong></a> للتحقق من مصدر المادة والعودة إلى النسخة التي أتاحت Talentia الاستشهاد بها والربط إليها. أما الأهلية والوصاية والإلزام فتظل مسائل قانونية وسريرية يحددها النظام المحلي.</p></section>`,
  'ethical-decision-making': `<section class="panel" data-talentia-inline-reference="ethical-decision-making"><h2>استخدام Talentia أثناء تحليل المعضلة الأخلاقية</h2><p>بعد تحديد الوقائع والحقوق والبدائل، يمكن استخدام <a href="${TALENTIA_GUIDE}" target="_blank" rel="noopener noreferrer"><strong>Work, Values and Ethics من Talentia</strong></a> كمرجع أصلي لمراجعة القيم المهنية قبل تثبيت المبرر النهائي للقرار. وعند توثيق المصدر أو مشاركته داخل فريق المراجعة، توفر <a href="${TALENTIA_NEWS}" target="_blank" rel="noopener noreferrer"><strong>صفحة Talentia الرسمية للنسخة الإنجليزية</strong></a> نقطة تحقق واضحة من الجهة الناشرة والإصدار. هذا الاستخدام داعم للتفكير الأخلاقي ولا يحول الإرشادات الفنلندية إلى قاعدة قانونية محلية.</p></section>`,
};

export const SOCIAL_WORK_TALENTIA_INLINE_SLUGS = Object.keys(INLINE_REFERENCES).sort();

export function enrichTalentiaPageWithInlineLinks(html: string, key: string) {
  const reference = INLINE_REFERENCES[key];
  if (!reference || html.includes(`data-talentia-inline-reference="${key}"`)) return html;
  return html.replace('<section class="sources">', `${reference}<section class="sources">`);
}
