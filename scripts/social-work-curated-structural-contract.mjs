import fs from 'node:fs';

const registry = fs.readFileSync('lib/social-work-curated-registry.ts', 'utf8');
const a = fs.readFileSync('lib/social-work-curated/structural-wave6-a.ts', 'utf8');
const b = fs.readFileSync('lib/social-work-curated/structural-wave6-b.ts', 'utf8');
const shell = fs.readFileSync('lib/social-work-curated/rights-shell.ts', 'utf8');
const route = fs.readFileSync('app/evidence-guides/social-work/[[...slug]]/route.ts', 'utf8');
const combined = `${a}\n${b}`;

const slugs = [
  'poverty-structural-barriers',
  'financial-crisis-family-plan',
  'family-role-redistribution',
  'family-priority-setting',
  'family-burden-monitoring',
  'help-plan-quality-audit',
  'community-independence-plan',
  'service-exit-plan',
  'post-closure-follow-up',
];

for (const slug of slugs) {
  if (!registry.includes(`'${slug}':`)) throw new Error(`Missing curated registry entry: ${slug}`);
  if (!combined.includes(`slug: '${slug}'`)) throw new Error(`Missing curated page: ${slug}`);
}

const requiredModules = [
  'اختبار BARRIER',
  '72 ساعة / 30 يومًا / 90 يومًا',
  'العمل المرئي وغير المرئي',
  'مصفوفة PRIORITY',
  'قاعدة REDUCE',
  'اختبار QUALITY-12',
  'سلم نقل المسؤولية',
  'بروتوكول EXIT',
  'ثلاث نتائج ممكنة للمتابعة',
];
for (const marker of requiredModules) {
  if (!combined.includes(marker)) throw new Error(`Missing structural practice module: ${marker}`);
}

const sourceFingerprints = [
  'World report on social determinants of health equity',
  'Operational framework for monitoring social determinants of health equity',
  'Convention on the Rights of Persons with Disabilities',
  'Global Social Work Statement of Ethical Principles',
  '2016091213042605',
  '2017092010392030',
];
for (const marker of sourceFingerprints) {
  if (!combined.includes(marker)) throw new Error(`Missing structural source fingerprint: ${marker}`);
}

const forbidden = [
  'الرابط الأصلي الذي شاركته الجهة المهنية معنا',
  'يعد موضوع',
  'لا شك أن',
  'في عالمنا اليوم',
];
for (const marker of forbidden) {
  if (combined.includes(marker)) throw new Error(`Forbidden boilerplate/provenance leak: ${marker}`);
}

if (!combined.includes('ليس دليل ميزانية أو ائتمان أو ديون أو استثمار')) {
  throw new Error('Financial-crisis page lacks explicit financial-advice boundary');
}
if (!combined.includes('QUALITY-12 أداة داخلية من روافد')) {
  throw new Error('Quality-audit page lacks non-validated-tool boundary');
}
if (!combined.includes('سياسات الإنهاء والسجلات وواجبات السلامة')) {
  throw new Error('Exit-plan page lacks jurisdiction/policy guard');
}
if (!combined.includes('سياسة الخدمة والقانون المحلي')) {
  throw new Error('Post-closure page lacks policy guard');
}
if (!shell.includes('data-rawafid-curated-page')) {
  throw new Error('Curated marker missing from shared curated shell');
}
if (!route.includes("const curatedHtml = SOCIAL_WORK_CURATED_PAGES[key]")) {
  throw new Error('Route does not resolve curated pages before legacy content');
}
if (!route.includes("if (repaired.includes('data-rawafid-curated-page='))")) {
  throw new Error('Route does not bypass generic enrichments for curated pages');
}

console.log(`Structural wave contract prepared for ${slugs.length} curated pages.`);
