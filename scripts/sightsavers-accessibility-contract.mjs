import fs from 'node:fs';

const pagePath = 'app/accessibility/sightsavers/[[...slug]]/page.tsx';
const sitemapPath = 'app/sitemaps/sightsavers-accessibility.xml/route.ts';
const indexPath = 'app/sitemap.xml/route.ts';
const page = fs.readFileSync(pagePath, 'utf8');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const index = fs.readFileSync(indexPath, 'utf8');

const failures = [];
const routes = [
  '/accessibility/sightsavers/',
  '/accessibility/sightsavers/inclusive-communications/',
  '/accessibility/sightsavers/testing-protocol/',
  '/accessibility/sightsavers/health-facility-audit/',
];
for (const route of routes) if (!sitemap.includes(route)) failures.push(`missing sitemap route: ${route}`);

const sources = [
  'https://www.sightsavers.org/about-us/accessibility/',
  'https://www.sightsavers.org/organisational-inclusion/2021/09/improving-accessibility-testing/',
  'https://www.sightsavers.org/disability-and-inclusion/health/accessibility-standards/',
  'https://www.sightsavers.org/wp-content/uploads/2020/03/Permissions-and-pack-contents.pdf',
  'https://www.sightsavers.org/disability-and-inclusion/health/resources/',
  'https://www.sightsavers.org/website-accessibility-statement/',
];
for (const source of sources) if (!page.includes(source)) failures.push(`missing original source: ${source}`);

const requiredText = [
  'لا شيء عنا بدوننا',
  'اختبار مع أشخاص ذوي إعاقة',
  'التشريعات والأكواد الوطنية تظل المرجع القانوني',
  'لا نستخدم اسم أو شعار Sightsavers كاعتماد',
  'لا نزعم أن هذه الصفحات ترجمة رسمية',
  'لوحة المفاتيح',
  'قارئ الشاشة',
  '200%',
  'النص البديل',
  'إعادة الاختبار',
  'Pregel, A., Smith, K. and Bridger, K. (2019). Accessibility standards and audit pack. Haywards Heath: Sightsavers',
  'مادة محمية بحقوق النشر',
  'ولا يعني ذلك ترخيصًا عامًا غير مقيد',
  'بدل نسخ الحزمة بالجملة',
];
for (const text of requiredText) if (!page.includes(text)) failures.push(`missing safeguard/practice text: ${text}`);
if (!index.includes("'/sitemaps/sightsavers-accessibility.xml'")) failures.push('dedicated sitemap missing from sitemap index');

if (failures.length) {
  console.error('Sightsavers accessibility contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Sightsavers accessibility contract: PASS');
