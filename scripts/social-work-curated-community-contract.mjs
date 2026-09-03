import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const registry = read('lib/social-work-curated-registry.ts');
const a = read('lib/social-work-curated/community-wave4-a.ts');
const b = read('lib/social-work-curated/community-wave4-b.ts');
const route = read('app/evidence-guides/social-work/[[...slug]]/route.ts');
const fail = (message) => { console.error(`SOCIAL WORK CURATED COMMUNITY CONTRACT FAILED: ${message}`); process.exit(1); };

const slugs = [
  'community-resource-map',
  'support-network-mapping',
  'service-coordination',
  'referral-with-continuity',
  'multidisciplinary-family-meeting',
  'community-partnership-family-support',
  'failed-referral-recovery',
  'institutional-advocacy',
];
for (const slug of slugs) {
  if (!registry.includes(`'${slug}'`)) fail(`missing registry slug: ${slug}`);
}

const requiredFingerprints = [
  '2016091213042605',
  '36751899',
  'Community-based protection',
  '67293',
  '9789240088320',
  'RECOVER',
  'Readiness',
  'RACI',
  'Evidence packet',
];
for (const fingerprint of requiredFingerprints) {
  if (!a.includes(fingerprint) && !b.includes(fingerprint)) fail(`missing evidence/practice fingerprint: ${fingerprint}`);
}

const pageDistinctives = {
  'community-resource-map': ['الأهلية', 'تاريخ تحقق', 'مورد قابل للاستخدام'],
  'support-network-mapping': ['نقطة الفشل الوحيدة', 'العبء على الداعم', 'موافقة الداعم'],
  'service-coordination': ['مصفوفة RACI', 'عبء النظام', 'قائد تنسيق'],
  'referral-with-continuity': ['Readiness', 'Handoff', 'Bridging', 'Confirmation'],
  'multidisciplinary-family-meeting': ['45 دقيقة', 'قرار مطلوب', 'توافقًا زائفًا'],
  'community-partnership-family-support': ['اختبار الشريك', 'عقد شراكة مصغر', 'الشبكة الطبيعية'],
  'failed-referral-recovery': ['RECOVER', 'Bridging أثناء الانتظار', 'بيانات جودة'],
  'institutional-advocacy': ['Evidence packet', 'سلم التصعيد', 'صاحب الصلاحية'],
};
const combined = `${a}\n${b}`;
for (const [slug, phrases] of Object.entries(pageDistinctives)) {
  for (const phrase of phrases) if (!combined.includes(phrase)) fail(`${slug} missing distinctive concept: ${phrase}`);
}

for (const forbidden of [
  'الرابط الأصلي الذي شاركته الجهة المهنية معنا',
  'Received from Slovenian Association of Social Workers by email on 2026-08-30',
  'في عالمنا اليوم',
  'لا شك أن',
  'يعد موضوع',
]) {
  if (combined.includes(forbidden)) fail(`forbidden legacy/generic phrase found: ${forbidden}`);
}

if (!route.includes('const curatedHtml = SOCIAL_WORK_CURATED_PAGES[key]')) fail('route does not prioritize curated pages');
if (!route.includes("repaired.includes('data-rawafid-curated-page=')")) fail('curated pages are not protected from generic append layers');

console.log(`SOCIAL WORK CURATED COMMUNITY CONTRACT OK: ${slugs.length} community/referral/advocacy pages registered with distinct tools, evidence fingerprints and provenance guards.`);
