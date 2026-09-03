import fs from 'node:fs';

const registry = fs.readFileSync('lib/social-work-curated-registry.ts', 'utf8');
const waveA = fs.readFileSync('lib/social-work-curated/life-course-wave5-a.ts', 'utf8');
const waveB = fs.readFileSync('lib/social-work-curated/life-course-wave5-b.ts', 'utf8');
const route = fs.readFileSync('app/evidence-guides/social-work/[[...slug]]/route.ts', 'utf8');
const all = `${waveA}\n${waveB}`;

const slugs = [
  'family-life-course-transitions',
  'separation-divorce-family-support',
  'older-adults-family-support',
  'caregiver-role-burden',
  'transition-to-adulthood',
  'foster-care-adoption-family-work',
  'youth-complex-behaviour-family-work',
  'school-family-collaboration',
];

for (const slug of slugs) {
  if (!registry.includes(`'${slug}'`)) throw new Error(`Missing curated life-course slug: ${slug}`);
}

const required = [
  'مصفوفة TRANSITION',
  'ذوبان الحدود',
  'Integrated care for older people',
  'مقياس عملي لعبء الرعاية',
  'يشاهد → يشارك → يقود مع دعم',
  'Guidelines for the Alternative Care of Children',
  'تحليل ABC+',
  'بروتوكول MEET',
  'https://pubmed.ncbi.nlm.nih.gov/39785108/',
  'https://pubmed.ncbi.nlm.nih.gov/32512420/',
  'https://pubmed.ncbi.nlm.nih.gov/38884957/',
  'https://www.who.int/publications/i/item/9789240103726',
  'https://digitallibrary.un.org/record/673583',
  'https://www.nice.org.uk/guidance/cg158',
  'https://www.fsd.uni-lj.si/mma/-/2016091213042605/',
];
for (const token of required) {
  if (!all.includes(token)) throw new Error(`Missing life-course quality token: ${token}`);
}

const forbidden = [
  'الرابط الأصلي الذي شاركته الجهة المهنية معنا',
  'في عالمنا اليوم',
  'لا شك أن',
  'يعد موضوع',
];
for (const token of forbidden) {
  if (all.includes(token)) throw new Error(`Forbidden boilerplate/provenance token in life-course wave: ${token}`);
}

const jurisdictionGuards = [
  'لا تقدم حكمًا قانونيًا',
  'لا تستنتج ترتيب حضانة',
  'لا لتشخيص الشاب من هذه الصفحة',
  'تختلف بشدة بين الدول',
];
for (const token of jurisdictionGuards) {
  if (!all.includes(token)) throw new Error(`Missing jurisdiction/discipline guard: ${token}`);
}

if (!route.includes("const curatedHtml = SOCIAL_WORK_CURATED_PAGES[key]")) {
  throw new Error('Curated pages are not routed before legacy pages');
}
if (!route.includes("repaired.includes('data-rawafid-curated-page=')")) {
  throw new Error('Curated pages are not protected from generic enrichment append layers');
}

console.log('PASS social-work curated life-course contract', { pages: slugs.length });
