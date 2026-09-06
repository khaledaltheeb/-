import fs from 'node:fs';

const source = fs.readFileSync('app/cognitive-lab/page.tsx', 'utf8');
const fail = (message) => {
  console.error(`COGNITIVE_LAB_METHODOLOGY_FAIL: ${message}`);
  process.exitCode = 1;
};
const requireText = (text, message) => {
  if (!source.includes(text)) fail(message);
};

requireText('الأساس العلمي وحدود الاستدلال', 'scientific-evidence section is missing');
requireText('الصحة البرمجية ليست صدقًا سيكومتريًا', 'software-vs-psychometrics boundary is missing');
requireText('أثر الممارسة متوقع', 'practice-effect boundary is missing');
requireText('الانتقال البعيد غير مفترض', 'far-transfer boundary is missing');
requireText('الجهاز واللغة جزء من القياس', 'device/language comparability boundary is missing');
requireText('التقنين يحتاج عينة وخطة تحليل', 'norming/validation requirement is missing');
requireText('اللغة العربية ليست ترجمة لفظية فقط', 'Arabic adaptation boundary is missing');
requireText('ليست «شهادة صلاحية» للأنشطة المئة في روافد', 'reference non-validation disclaimer is missing');

for (const url of [
  'https://www.nia.nih.gov/research/resource/nih-toolbox',
  'https://pubmed.ncbi.nlm.nih.gov/23479546/',
  'https://pubmed.ncbi.nlm.nih.gov/24960301/',
  'https://www.intestcom.org/page/27',
  'https://pubmed.ncbi.nlm.nih.gov/22540222/',
  'https://pubmed.ncbi.nlm.nih.gov/34251578/',
  'https://pubmed.ncbi.nlm.nih.gov/41820527/',
]) {
  requireText(url, `required methodology source missing: ${url}`);
}

for (const unsafeClaim of [
  'اختبار ذكاء معتمد',
  'تشخيص معرفي آلي',
  'معايير عربية سكانية مثبتة لجميع الأنشطة',
  'الوقاية المؤكدة من التدهور المعرفي',
]) {
  if (source.includes(unsafeClaim)) fail(`unsafe cognitive claim detected: ${unsafeClaim}`);
}

if (!process.exitCode) {
  console.log('COGNITIVE_LAB_METHODOLOGY_OK: sources=7 software_psychometrics=separated practice_effects=explicit far_transfer=guarded device_language=guarded arabic_norms=not_claimed');
}
