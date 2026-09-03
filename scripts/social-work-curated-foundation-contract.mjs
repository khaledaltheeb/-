import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`SOCIAL WORK CURATED FOUNDATION CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

const route = read('app/evidence-guides/social-work/[[...slug]]/route.ts');
const registry = read('lib/social-work-curated-registry.ts');
const base = read('lib/social-work-curated-pages.ts');
const repair = read('lib/social-work-provenance-repair.ts');
const seoHardening = read('lib/html-seo-hardening.ts');

const pages = {
  'agreement-on-collaboration': base,
  'working-relationship': read('lib/social-work-curated/working-relationship.ts'),
  'desired-outcomes': read('lib/social-work-curated/desired-outcomes.ts'),
  'strengths-perspective': read('lib/social-work-curated/strengths-perspective.ts'),
  'co-created-help-plan': read('lib/social-work-curated/co-created-help-plan.ts'),
};

if (!route.includes("from '@/lib/social-work-curated-registry'")) fail('route does not use curated registry');
if (!route.includes('SOCIAL_WORK_CURATED_PAGES[key]')) fail('curated lookup missing');
if (!route.includes("repaired.includes('data-rawafid-curated-page=')")) fail('curated pages do not bypass generic duplicate enrichment');
if (!route.includes('repairSocialWorkSourceProvenance(inputHtml)')) fail('global source provenance repair missing');

for (const slug of Object.keys(pages)) {
  if (!registry.includes(`'${slug}'`)) fail(`curated registry missing ${slug}`);
}

const requiredCanonical = (slug) => `https://healthrenewal.org/evidence-guides/social-work/${slug}/`;
for (const [slug, html] of Object.entries(pages)) {
  if (!html.includes(requiredCanonical(slug))) fail(`${slug}: canonical missing`);
  if (!html.includes('data-rawafid-curated-page=')) fail(`${slug}: curated marker missing`);
  const h2Count = (html.match(/<h2>/g) || []).length;
  if (h2Count < 12) fail(`${slug}: expected >=12 substantive h2 sections, found ${h2Count}`);
  const sourceCount = (html.match(/class=\\?"source/g) || []).length;
  if (sourceCount < 2 && slug !== 'agreement-on-collaboration') fail(`${slug}: source layer too thin`);
  const internalLinks = (html.match(/href=\\?"\/evidence-guides\/social-work\//g) || []).length;
  if (internalLinks < 4) fail(`${slug}: insufficient contextual internal linking (${internalLinks})`);
  for (const fluff of ['يعد العمل الاجتماعي من أهم', 'في عالمنا اليوم', 'لا شك أن', 'من الجدير بالذكر']) {
    if (html.includes(fluff)) fail(`${slug}: generic filler detected: ${fluff}`);
  }
}

const scopeChecks = {
  'agreement-on-collaboration': ['درجة الاختيار', 'حدود الخصوصية', 'توثيق الاختلاف', 'قالب مختصر لاتفاق التعاون'],
  'working-relationship': ['الثقة', 'السلطة', 'التعثر والقطيعة', 'الإشراف المهني'],
  'desired-outcomes': ['الهدف والنشاط والخدمة', 'عندما تختلف نتائج أفراد الأسرة', 'المؤشر', 'قالب مراجعة النتيجة'],
  'strengths-perspective': ['قوة قابلة للاستخدام', 'العوائق البنيوية', 'تعبئة القوة', 'منظور القوة في الإشراف والمؤسسة'],
  'co-created-help-plan': ['مصفوفة الخطة الأساسية', 'الفرضية المهنية', 'الخطة ب', 'تدقيق جودة الخطة'],
};
for (const [slug, phrases] of Object.entries(scopeChecks)) {
  for (const phrase of phrases) if (!pages[slug].includes(phrase)) fail(`${slug}: missing scope-defining content: ${phrase}`);
}

for (const sourceFingerprint of [
  '2016091213042605',
  '2017092010392030',
  'global-social-work-statement-of-ethical-principles',
]) {
  const coverage = Object.values(pages).filter((html) => html.includes(sourceFingerprint)).length;
  if (coverage < 2) fail(`source fingerprint ${sourceFingerprint} appears in too few curated pages (${coverage})`);
}

const seoDescriptionPaths = [
  '/evidence-guides/social-work/agreement-on-collaboration/',
  '/evidence-guides/social-work/desired-outcomes/',
  '/evidence-guides/social-work/strengths-perspective/',
];
for (const pathname of seoDescriptionPaths) {
  if (!seoHardening.includes(`'${pathname}'`)) fail(`${pathname}: durable SEO description override missing`);
}
if (!seoHardening.includes('function shortenDescription(description: string)')) fail('global raw HTML description length guard missing');
if (!seoHardening.includes('normalized.length <= 170')) fail('raw HTML description upper bound is not locked to 170 characters');
if (!seoHardening.includes('setMetaDescription(output, safeDescription)')) fail('safe description is not written back to rendered HTML');

if (!repair.includes('2015081211140160')) fail('legacy 201508 archive fingerprint is not governed');
if (!repair.includes('ليس الرابط الذي أرسلته الجمعية السلوفينية مباشرة')) fail('legacy archive provenance is not explicitly corrected');
if (!repair.includes('2016091213042605')) fail('directly shared Ljubljana source is not preserved');

if (!process.exitCode) {
  console.log(`SOCIAL WORK CURATED FOUNDATION CONTRACT OK: ${Object.keys(pages).length} pages; scope separation, provenance, source density, internal linking, and durable SEO description bounds verified.`);
}
