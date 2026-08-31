const TOOL_NOTE = '<p class="meta" data-rawafid-quality-note="editorial-tool">أداة تطبيقية حررتها روافد استنادًا إلى مبادئ Talentia وIFSW لتسهيل المراجعة المهنية؛ ليست قائمة رسمية صادرة عن Talentia، ولا بديلًا عن القانون أو السياسات أو الإشراف المحلي.</p>';

const REPLACEMENTS: Record<string, Array<[string, string]>> = {
  'human-dignity-social-justice': [
    ['<h2>اختبار من خمس نقاط</h2>', `<h2>أداة روافد: فحص من خمس نقاط</h2>${TOOL_NOTE}`],
    ['إذا missed أحد المستفيدين مواعيد متعددة', 'إذا تغيب أحد المستفيدين عن مواعيد متعددة'],
  ],
  'self-determination-client-rights': [
    ['<h2>سلم القرار</h2>', `<h2>أداة روافد: سلم دعم القرار</h2>${TOOL_NOTE}`],
  ],
  'ethical-decision-making': [
    ['<h2>نموذج 8 أسئلة قبل القرار</h2>', `<h2>أداة روافد: ثمانية أسئلة قبل القرار</h2>${TOOL_NOTE}`],
    ['قيمتان مشروعـتان', 'قيمتان مشروعَتان'],
  ],
  'professional-boundaries-conflicts': [
    ['<h2>مصفوفة الفحص</h2>', `<h2>أداة روافد: مصفوفة فحص الحدود المهنية</h2>${TOOL_NOTE}`],
  ],
  'advocacy-accountability': [
    ['<h2>مستويات المناصرة</h2>', `<h2>أداة روافد: مستويات المناصرة المهنية</h2>${TOOL_NOTE}`],
  ],
  'digital-ethics-confidentiality': [
    ['<h2>فحص قبل استخدام أداة رقمية</h2>', `<h2>أداة روافد: فحص قبل استخدام أداة رقمية</h2>${TOOL_NOTE}`],
  ],
};

const REVIEW_NOTE = '<section class="note" data-rawafid-quality-note="scope"><h2>نطاق الاستخدام والمراجعة</h2><p>المحتوى للتثقيف والتطوير المهني، ويجب تفسيره مع القانون والسياسات والمعايير المهنية السارية في بلد الممارسة. عند تعارض مبادئ أو حقوق أو واجبات، أو عند وجود خطر جسيم أو قرار إلزامي، يلزم الرجوع إلى الإشراف المهني والجهة القانونية أو التنظيمية المختصة بحسب الحالة.</p><p class="meta">آخر مراجعة تحريرية ومصدرية: 31 أغسطس 2026. تمت مراجعة الاتساق مع صفحة Talentia الرسمية للنسخة الإنجليزية وبيان IFSW العالمي للمبادئ الأخلاقية.</p></section>';

export function hardenTalentiaPageQuality(html: string, key: string) {
  let output = html;
  for (const [from, to] of REPLACEMENTS[key] ?? []) output = output.replace(from, to);
  if (!output.includes('data-rawafid-quality-note="scope"')) {
    output = output.replace('<section class="sources">', `${REVIEW_NOTE}<section class="sources">`);
  }
  return output;
}
