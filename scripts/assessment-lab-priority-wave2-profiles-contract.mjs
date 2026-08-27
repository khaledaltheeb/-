import fs from 'node:fs';

const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const overlay = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.priority-wave2.v1.json', 'utf8'));
const loader = fs.readFileSync('lib/assessment-lab/scientific-profiles.ts', 'utf8');
const fail = (message) => {
  console.error(`ASSESSMENT PRIORITY-WAVE2 PROFILE CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

const required = [
  'grief-adjustment',
  'school-wellbeing',
  'chronic-illness-family',
  'boundary-setting',
  'avoidance-cycle',
  'social-anxiety-pattern',
];
const profiles = overlay.profiles ?? [];
const slugs = profiles.map((profile) => profile.slug);
if (profiles.length !== required.length) fail(`expected ${required.length} priority-wave2 overrides, found ${profiles.length}`);
for (const slug of required) if (!slugs.includes(slug)) fail(`missing priority-wave2 profile override: ${slug}`);
for (const slug of slugs) if (!required.includes(slug)) fail(`unexpected priority-wave2 profile override: ${slug}`);
if (!loader.includes('scientific-profiles.priority-wave2.v1.json')) fail('scientific profile loader must import priority wave 2 overlay');
if (!loader.includes('priorityWave2Profiles')) fail('scientific profile loader must apply priority wave 2 profiles');

for (const profile of profiles) {
  const monitor = monitors.find((row) => row.slug === profile.slug);
  if (!monitor) {
    fail(`unknown monitor in priority-wave2 overlay: ${profile.slug}`);
    continue;
  }
  if (profile.validation_stage !== 'item-development') fail(`${profile.slug} must remain item-development`);
  if (!Array.isArray(profile.domains) || profile.domains.length !== 4) fail(`${profile.slug} must keep exactly four domains`);
  if (JSON.stringify(profile.domains) !== JSON.stringify(monitor.axes)) fail(`${profile.slug} domains must exactly match published axes`);
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

const grief = profiles.find((profile) => profile.slug === 'grief-adjustment');
if (!grief?.interpretation_boundary.includes('لا توجد مراحل إلزامية')) fail('grief-adjustment must reject mandatory grief stages');
if (!grief?.interpretation_boundary.includes('لا يثبت اضطرابًا')) fail('grief-adjustment must not pathologize grief intensity alone');

const school = profiles.find((profile) => profile.slug === 'school-wellbeing');
if (!school?.safety.includes('عدم مواجهته بمصدر الخطر')) fail('school-wellbeing must preserve safeguarding and avoid unsafe confrontation');

const chronic = profiles.find((profile) => profile.slug === 'chronic-illness-family');
if (!chronic?.interpretation_boundary.includes('تُقيّم طبيًا أولًا')) fail('chronic-illness-family must not psychologize medical deterioration');

const boundary = profiles.find((profile) => profile.slug === 'boundary-setting');
if (!boundary?.safety.includes('لا تُستخدم النتيجة لدفع الشخص إلى المواجهة')) fail('boundary-setting must not encourage unsafe confrontation');

const avoidance = profiles.find((profile) => profile.slug === 'avoidance-cycle');
if (!avoidance?.interpretation_boundary.includes('التجنب قد يكون تكيفيًا')) fail('avoidance-cycle must distinguish protective avoidance from anxiety-maintaining avoidance');

const social = profiles.find((profile) => profile.slug === 'social-anxiety-pattern');
if (!social?.interpretation_boundary.includes('الخجل والانطواء')) fail('social-anxiety-pattern must distinguish temperament/culture from disorder');

if (!process.exitCode) {
  console.log('Assessment priority wave 2 scientific profile gate passed: grief, school wellbeing, chronic illness family support, boundaries, avoidance, and social anxiety retain non-diagnostic item-development boundaries and explicit safety escalation.');
}
