import fs from 'node:fs';

const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const overlay = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.safety-critical.v1.json', 'utf8'));
const loader = fs.readFileSync('lib/assessment-lab/scientific-profiles.ts', 'utf8');
const fail = (message) => {
  console.error(`ASSESSMENT SAFETY-PROFILE CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

const required = [
  'relationship-safety',
  'trauma-recovery',
  'postpartum-support',
  'recovery-safety',
  'panic-pattern',
  'compulsive-pattern',
  'health-worry',
  'anger-escalation',
];
const profiles = overlay.profiles ?? [];
const slugs = profiles.map((profile) => profile.slug);
if (profiles.length !== required.length) fail(`expected ${required.length} safety-critical overrides, found ${profiles.length}`);
for (const slug of required) if (!slugs.includes(slug)) fail(`missing safety-critical profile override: ${slug}`);
for (const slug of slugs) if (!required.includes(slug)) fail(`unexpected safety-critical profile override: ${slug}`);
if (!loader.includes("scientific-profiles.safety-critical.v1.json")) fail('scientific profile loader must import the safety-critical overlay');
if (!loader.includes('profileMap.set(profile.slug, normalizeProfile(profile))')) fail('safety-critical overlay must override base profiles after normalization');

for (const profile of profiles) {
  const monitor = monitors.find((row) => row.slug === profile.slug);
  if (!monitor) {
    fail(`unknown monitor in safety-critical overlay: ${profile.slug}`);
    continue;
  }
  if (profile.validation_stage !== 'item-development') fail(`${profile.slug} must remain item-development`);
  if (!Array.isArray(profile.domains) || profile.domains.length !== 4) fail(`${profile.slug} must keep exactly four domains`);
  if (JSON.stringify(profile.domains) !== JSON.stringify(monitor.axes)) fail(`${profile.slug} domains must exactly match the published monitor axes`);
  if (!profile.construct?.trim() || !profile.intended_population?.trim() || !profile.intended_use?.trim()) fail(`${profile.slug} core scientific description is incomplete`);
  if (!profile.item_rationale?.trim() || !profile.interpretation_boundary?.trim() || !profile.safety?.trim()) fail(`${profile.slug} rationale/boundary/safety documentation is incomplete`);
  if (!Array.isArray(profile.prohibited_uses) || profile.prohibited_uses.length < 4) fail(`${profile.slug} must state at least four prohibited uses`);
  if (!Array.isArray(profile.references) || profile.references.length < 2) fail(`${profile.slug} must include at least two scientific references`);
  for (const reference of profile.references ?? []) {
    if (!reference.name?.trim() || !reference.url?.startsWith('https://')) fail(`${profile.slug} has an invalid scientific reference`);
  }
  const combined = [profile.construct, profile.intended_use, profile.interpretation_boundary, profile.safety, ...(profile.prohibited_uses ?? [])].join(' ');
  if (/validated|مقنن|مقننة|تشخيص مؤكد|درجة تشخيصية/i.test(combined)) fail(`${profile.slug} must not claim validation, norming, or diagnostic scoring`);
}

const relationship = profiles.find((profile) => profile.slug === 'relationship-safety');
if (!relationship?.interpretation_boundary.includes('لا يثبت الأمان')) fail('relationship-safety must prohibit false reassurance from absent danger items');
if (!relationship?.safety.includes('مراقبة الجهاز')) fail('relationship-safety must account for device-monitoring risk');

const postpartum = profiles.find((profile) => profile.slug === 'postpartum-support');
if (!postpartum?.safety.includes('حالة طبية طارئة')) fail('postpartum-support must explicitly treat suspected postpartum psychosis as an emergency');

const panic = profiles.find((profile) => profile.slug === 'panic-pattern');
if (!panic?.interpretation_boundary.includes('استبعاد مشكلة جسدية حادة')) fail('panic-pattern must preserve acute medical differential boundary');

const compulsive = profiles.find((profile) => profile.slug === 'compulsive-pattern');
if (!compulsive?.interpretation_boundary.includes('قد تُساء قراءتها كدليل خطر')) fail('compulsive-pattern must distinguish intrusive thought content from actual intent/risk');

const recovery = profiles.find((profile) => profile.slug === 'recovery-safety');
if (!recovery?.interpretation_boundary.includes('تنخفض القدرة على التحمل')) fail('recovery-safety must document reduced opioid tolerance risk');

const health = profiles.find((profile) => profile.slug === 'health-worry');
if (!health?.interpretation_boundary.includes('لا يلغي احتمال المرض')) fail('health-worry must not psychologize physical symptoms');

if (!process.exitCode) {
  console.log('Assessment safety-critical scientific profile gate passed: 8 high-sensitivity tools retain item-development status, explicit prohibited uses, safety escalation, and current authoritative clinical/public-health boundaries.');
}
