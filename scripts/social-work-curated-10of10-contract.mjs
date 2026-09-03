import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`SOCIAL WORK CURATED 10/10 CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

const route = read('app/evidence-guides/social-work/[[...slug]]/route.ts');
const curated = read('lib/social-work-curated-pages.ts');
const repair = read('lib/social-work-provenance-repair.ts');

if (!route.includes('SOCIAL_WORK_CURATED_PAGES[key]')) fail('curated pages are not resolved before legacy routes');
if (!route.includes("repaired.includes('data-rawafid-curated-page=')")) fail('curated pages do not bypass duplicate generic enrichment');
if (!route.includes('repairSocialWorkSourceProvenance(inputHtml)')) fail('render-time provenance repair is not applied globally');
if (!route.includes('curated-${SOCIAL_WORK_CURATED_RELEASE}')) fail('curated release is missing from response provenance header');
if (!route.includes('provenance-repair-${SOCIAL_WORK_PROVENANCE_REPAIR_RELEASE}')) fail('provenance repair release is missing from response provenance header');

const slug = 'agreement-on-collaboration';
if (!curated.includes(`'${slug}': agreementOnCollaboration`)) fail(`${slug} is missing from curated registry`);

for (const required of [
  'اتفاق التعاون: كيف تبدأ علاقة عمل واضحة',
  'ما اتفاق التعاون؟ وما الذي ليس هو؟',
  'ثلاث درجات للاختيار',
  'تسلسل اللقاء الأول',
  'الخصوصية ومشاركة المعلومات',
  'عندما يكون هناك طفل أو أكثر من فرد في الأسرة',
  'كيف ندير الخلاف',
  'قالب مختصر لاتفاق التعاون',
  'ماذا يجب أن يوثَّق؟',
  'مثال تطبيقي',
  'علامات أن الاتفاق أصبح شكليًا أو قسريًا',
  'اختبار جودة سريع',
  'النقل إلى السياقات العربية',
  'خريطة الانتقال إلى الصفحات التالية',
  'المصادر ومنهج الاستدلال',
]) {
  if (!curated.includes(required)) fail(`missing substantive section: ${required}`);
}

for (const source of [
  'https://www.fsd.uni-lj.si/mma/-/2016091213042605/',
  'https://www.fsd.uni-lj.si/mma/monografija_ang_elektronska_verzija/2017092010392030/',
  'https://pisrs.si/pregledPredpisa?id=DRUG4023',
  'https://www.ifsw.org/global-social-work-statement-of-ethical-principles/',
]) {
  if (!curated.includes(source)) fail(`missing primary/authoritative source: ${source}`);
}

for (const governance of [
  'مصدر أرسلته الجمعية السلوفينية للعاملين الاجتماعيين مباشرة',
  'نسخة أكاديمية إنجليزية مكملة — حددتها روافد',
  'ليست ترجمة رسمية',
  'المتطلبات القانونية',
  'لا يُقدَّم هنا كتدخل علاجي ثبت تفوقه بتجارب عشوائية',
]) {
  if (!curated.includes(governance)) fail(`missing evidence-governance statement: ${governance}`);
}

const legacyArchive = '2015081211140160';
if (!repair.includes(legacyArchive)) fail('legacy archive fingerprint is not governed by provenance repair');
if (!repair.includes('ليس الرابط الذي أرسلته الجمعية السلوفينية مباشرة')) fail('legacy archive is not explicitly disambiguated');
if (!repair.includes('2016091213042605')) fail('directly shared Ljubljana fingerprint is not preserved in provenance repair');

const sectionCount = (curated.match(/<h2>/g) || []).length;
if (sectionCount < 15) fail(`expected at least 15 substantive h2 sections; found ${sectionCount}`);
const tableCount = (curated.match(/<table>/g) || []).length;
if (tableCount < 3) fail(`expected at least 3 practical tables; found ${tableCount}`);
const internalLinks = (curated.match(/href="\/evidence-guides\/social-work\//g) || []).length;
if (internalLinks < 8) fail(`expected at least 8 contextual internal links; found ${internalLinks}`);

for (const fluff of [
  'يعد العمل الاجتماعي من أهم',
  'في عالمنا اليوم',
  'لا شك أن',
  'من الجدير بالذكر',
]) {
  if (curated.includes(fluff)) fail(`generic filler detected: ${fluff}`);
}

if (!process.exitCode) {
  console.log(`SOCIAL WORK CURATED 10/10 CONTRACT OK: ${slug}; ${sectionCount} substantive sections, ${tableCount} tables, ${internalLinks} contextual internal links; source provenance separated.`);
}
