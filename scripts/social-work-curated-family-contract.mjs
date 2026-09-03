import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const fail = (m) => { console.error(`SOCIAL WORK CURATED FAMILY CONTRACT FAILED: ${m}`); process.exit(1); };

const registry = read('lib/social-work-curated-registry.ts');
const wave = read('lib/social-work-curated/family-wave3.ts');
const corrections = read('lib/social-work-curated-source-corrections.ts');
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
]) {
  if (!wave.includes(fingerprint)) fail(`missing family-wave evidence fingerprint: ${fingerprint}`);
}

for (const correctedFingerprint of [
  '38284476',
  '40264072',
  '10.1155/2023/8250781',
  '10.1016/j.childyouth.2023.107295',
  '39489144',
  'academic.oup.com/bjsw/article/56/3/1097/8321995',
]) {
  if (!corrections.includes(correctedFingerprint)) fail(`missing corrected/current evidence fingerprint: ${correctedFingerprint}`);
}

for (const staleFingerprint of [
  'https://pubmed.ncbi.nlm.nih.gov/39038209/',
  'https://pubmed.ncbi.nlm.nih.gov/35764846/',
  'https://onlinelibrary.wiley.com/doi/10.1155/2024/9957991',
  'https://onlinelibrary.wiley.com/doi/10.1111/cfs.13173',
]) {
  if (!corrections.includes(staleFingerprint)) fail(`correction mapping missing stale fingerprint: ${staleFingerprint}`);
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
if (!route.includes('correctCuratedSocialWorkEvidence(repaired, key)')) fail('curated family evidence corrections are not applied at render time');

console.log(`SOCIAL WORK CURATED FAMILY CONTRACT OK: ${slugs.length} advanced family-practice pages registered with distinct practice modules, corrected evidence metadata and source governance.`);
