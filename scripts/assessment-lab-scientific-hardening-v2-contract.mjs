import fs from 'node:fs';

const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const standard = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-quality-standard.v1.json', 'utf8'));
const runner = fs.readFileSync('components/assessment-monitor-runner.tsx', 'utf8');
const detail = fs.readFileSync('app/assessment-lab/[slug]/page.tsx', 'utf8');
const registry = fs.readFileSync('lib/assessment-lab/scientific-profiles.ts', 'utf8');
const fail = (message) => { console.error(`ASSESSMENT SCIENTIFIC HARDENING V2 FAILED: ${message}`); process.exitCode = 1; };

const requiredStandardFields = [
  'construct_definition','intended_population','intended_use','reference_period','response_scale_semantics',
  'domain_map','item_rationale','language_clarity_review','content_validity_review','privacy_statement',
  'interpretation_boundary','functional_impact_guidance','safety_escalation','professional_referral_path',
  'scientific_references','versioning','validation_stage',
];
for (const field of requiredStandardFields) {
  if (!standard.minimum_requirements.includes(field)) fail(`mandatory standard lost ${field}`);
}

if (monitors.length !== 60) fail(`expected 60 published Rawafid monitors, found ${monitors.length}`);
if (runner.includes('الفترة المرجعية: الأسبوع الماضي')) fail('runner must not hard-code a one-week recall period');
if (detail.includes('ملاحظة نمطك خلال الأسبوع الماضي')) fail('detail page must not hard-code a one-week recall period');
if (!runner.includes('referencePeriod')) fail('runner must receive referencePeriod explicitly');
if (!detail.includes('getAssessmentScientificProfile')) fail('detail page must consume the scientific profile registry');
if (!detail.includes('referencePeriod={profile!.referencePeriod}')) fail('runner recall period must come from the tool scientific profile');
if (!detail.includes('profile!.scientificReferences')) fail('published tool page must expose scientific references');
if (!detail.includes('profile!.validationStage')) fail('published tool page must expose validation stage');
if (!detail.includes('profile!.prohibitedUses')) fail('published tool page must expose prohibited uses');

const registryRequirements = [
  'constructDefinition','intendedPopulation','intendedUse','prohibitedUses','referencePeriod','domains',
  'itemRationale','interpretationBoundary','safetyEscalation','scientificReferences','validationStage',
  'responseScaleSemantics','privacyStatement','functionalImpactGuidance','professionalReferralPath',
  'languageClarityReview','contentValidityReview','versioning',
];
for (const field of registryRequirements) {
  if (!registry.includes(field)) fail(`normalized scientific dossier missing ${field}`);
}
if (!registry.includes("status: 'not-yet-empirically-completed'")) fail('content-validity status must remain explicit until empirical review is actually completed');
if (!registry.includes("instrumentVersion: '1.0-item-development'")) fail('instrument version must disclose item-development status');
if (!registry.includes('getAllAssessmentScientificProfiles')) fail('registry must expose complete scientific profile set for contract testing');

const sourceFiles = [
  'data/assessment-lab/scientific-profiles.core-1-12.v1.json',
  'data/assessment-lab/scientific-profiles.core-13-24.v1.json',
  'data/assessment-lab/scientific-profiles.core-25-36.v1.json',
  'data/assessment-lab/scientific-profiles.wave1.v1.json',
  'data/assessment-lab/scientific-profiles.originals-49-54.v1.json',
  'data/assessment-lab/scientific-profiles.originals-55-60.v1.json',
];
const slugs = [];
for (const path of sourceFiles) {
  const parsed = JSON.parse(fs.readFileSync(path, 'utf8'));
  const profiles = Array.isArray(parsed.profiles) ? parsed.profiles : Object.values(parsed.profiles ?? {});
  for (const profile of profiles) {
    slugs.push(profile.slug);
    if (!profile.reference_period?.trim()) fail(`${profile.slug} missing reference period`);
    if (!profile.validation_stage?.trim()) fail(`${profile.slug} missing validation stage`);
    if (profile.validation_stage === 'validated') fail(`${profile.slug} cannot be validated without an empirical dossier`);
  }
}
const uniqueSlugs = new Set(slugs);
if (uniqueSlugs.size !== 60) fail(`expected 60 unique scientific profiles, found ${uniqueSlugs.size}`);
for (const monitor of monitors) if (!uniqueSlugs.has(monitor.slug)) fail(`published monitor ${monitor.slug} has no scientific profile`);

if (!process.exitCode) console.log('Assessment scientific hardening v2 passed: 60/60 published monitors use an explicit scientific dossier, recall periods are profile-driven, validation limitations are public, and the 17-field standard remains intact.');
