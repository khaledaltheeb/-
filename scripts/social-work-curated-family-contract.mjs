import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (m) => { console.error(`SOCIAL WORK CURATED FAMILY CONTRACT FAILED: ${m}`); process.exit(1); };

const registry = read('lib/social-work-curated-registry.ts');
const wave = read('lib/social-work-curated/family-wave3.ts');
const route = read('app/evidence-guides/social-work/[[...slug]]/route.ts');

const slugs = [
  'multi-challenged-families',
  'family-resilience',
  'family-engagement-barriers',
  'collaborative-professional-interview',
  'solution-focused-conversations',
  'home-based-family-social-work',
  'rebuilding-trust-after-harm',
  'professional-persistence',
];

for (const slug of slugs) {
  if (!registry.includes(`'${slug}':`)) fail(`missing curated registry route: ${slug}`);
  if (!wave.includes(`slug: '${slug}'`)) fail(`missing family wave page: ${slug}`);
}

for (const fingerprint of [
  '2016091213042605',
  '2017092010392030',
  'cepsj.si/index.php/cepsj/article/view/53',
  'hrcak.srce.hr/en/218679',
  '39038209',
  '35764846',
  '9957991',
  '10.1111/cfs.13173',
]) {
  if (!wave.includes(fingerprint)) fail(`missing evidence fingerprint: ${fingerprint}`);
}

for (const phrase of [
  'خريطة «المشكلة ← الأثر ← الخدمة ← العبء»',
  'حوّل «نقطة القوة» إلى مورد قابل للتشغيل',
  'بروتوكول «قبل أن تكتب غير متعاون»',
  'بنية اللقاء في ست مراحل',
  'خمسة أنواع من الأسئلة',
  'افصل الملاحظة عن الحكم',
  'تسلسل الإصلاح',
  'دورة «لاحظ–اسأل–عدّل–اختبر»',
]) {
  if (!wave.includes(phrase)) fail(`missing page-specific practice module: ${phrase}`);
}

for (const bad of [
  'الرابط الأصلي الذي شاركته الجهة المهنية معنا',
  'في عالمنا اليوم',
  'لا شك أن',
  'يعد موضوع',
]) {
  if (wave.includes(bad)) fail(`boilerplate or false provenance leaked into family wave: ${bad}`);
}

if (!route.includes('const curatedHtml = SOCIAL_WORK_CURATED_PAGES[key]')) fail('curated pages are not routed before legacy pages');
if (!route.includes("repaired.includes('data-rawafid-curated-page=')")) fail('curated pages do not bypass generic append layers');

console.log(`SOCIAL WORK CURATED FAMILY CONTRACT OK: ${slugs.length} advanced family-practice pages registered with distinct practice modules and source governance.`);
