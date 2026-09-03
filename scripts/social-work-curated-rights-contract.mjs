import fs from 'node:fs';

const fail = (message) => {
  console.error(`SOCIAL WORK CURATED RIGHTS CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

const registry = fs.readFileSync('lib/social-work-curated-registry.ts', 'utf8');
const participation = fs.readFileSync('lib/social-work-curated/participation-and-voice.ts', 'utf8');
const wave = fs.readFileSync('lib/social-work-curated/rights-wave2.ts', 'utf8');
const shell = fs.readFileSync('lib/social-work-curated/rights-shell.ts', 'utf8');
const route = fs.readFileSync('app/evidence-guides/social-work/[[...slug]]/route.ts', 'utf8');

const slugs = [
  'participation-and-voice',
  'child-voice-family-decisions',
  'supported-decision-making',
  'involuntary-participation',
  'ethics-power-autonomy',
  'privacy-information-sharing',
  'documenting-disagreement',
];

for (const slug of slugs) {
  if (!registry.includes(`'${slug}':`)) fail(`registry missing ${slug}`);
}

for (const token of [
  'ست وظائف للمشاركة',
  'أداة «أثر الصوت»',
  'صوت الطفل في قرارات الأسرة والخدمات',
  'سجل أثر صوت الطفل',
  'اتخاذ القرار المدعوم',
  'سجل دعم القرار',
  'خريطة السلطة',
  'اختبار التناسب',
  'سبعة أسئلة قبل قرار يقيّد الشخص',
  'اختبار من ستة أسئلة قبل المشاركة',
  'بنية من خمس طبقات',
]) {
  if (!`${participation}\n${wave}`.includes(token)) fail(`missing substantive module: ${token}`);
}

for (const source of [
  'global-social-work-statement-of-ethical-principles',
  '2016091213042605',
  '2017092010392030',
  'DRUG4023',
  'child-rights-convention/convention-text',
  'convoptprot-e.pdf',
]) {
  if (!`${participation}\n${wave}`.includes(source)) fail(`missing source fingerprint: ${source}`);
}

for (const phrase of [
  'حد الاستنتاج:',
  'مراجعة تحريرية مؤسسية',
  'data-rawafid-curated-page=',
]) {
  if (!shell.includes(phrase)) fail(`rights shell missing governance phrase: ${phrase}`);
}

if (!route.includes("repaired.includes('data-rawafid-curated-page=')")) fail('curated bypass guard missing');
if (!route.includes('SOCIAL_WORK_CURATED_PAGES[key]')) fail('curated registry not served before legacy pages');

const forbidden = [
  'الرابط الأصلي الذي شاركته الجهة المهنية معنا',
  'يعد موضوع',
  'لا شك أن',
  'في عالمنا اليوم',
];
for (const phrase of forbidden) {
  if (`${participation}\n${wave}`.includes(phrase)) fail(`forbidden boilerplate/provenance phrase present: ${phrase}`);
}

if (!process.exitCode) console.log(`SOCIAL WORK CURATED RIGHTS CONTRACT OK: ${slugs.length} rights/participation guides registered with distinct tools, source governance and curated rendering.`);
