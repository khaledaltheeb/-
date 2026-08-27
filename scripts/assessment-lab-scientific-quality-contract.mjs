import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const standard = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-quality-standard.v1.json', 'utf8'));
const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const banksBase = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.v1.json', 'utf8'));
const banksCore = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.core-1-12.v1.json', 'utf8'));
const banksCore13to24 = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.core-13-24.v1.json', 'utf8'));
const banksCore25to28 = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.core-25-28.v1.json', 'utf8'));
const banksCore29to32 = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.core-29-32.v1.json', 'utf8'));
const banksCore33to36 = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.core-33-36.v1.json', 'utf8'));
const banks49to54 = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.originals-49-54.v1.json', 'utf8'));
const banks55to60 = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.originals-55-60.v1.json', 'utf8'));
const clarityWave2Banks = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.clarity-wave2.v1.json', 'utf8'));
const safetyHardenedBanks = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.safety-hardening.v1.json', 'utf8'));
const profilesWave1 = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.wave1.v1.json', 'utf8')).profiles;
const profilesCoreList = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.core-1-12.v1.json', 'utf8')).profiles;
const profilesCore13to24List = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.core-13-24.v1.json', 'utf8')).profiles;
const profilesCore25to36List = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.core-25-36.v1.json', 'utf8')).profiles;
const profiles49to54List = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.originals-49-54.v1.json', 'utf8')).profiles;
const profiles55to60List = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.originals-55-60.v1.json', 'utf8')).profiles;
const profilesCore = Object.fromEntries(profilesCoreList.map((row) => [row.slug, row]));
const profilesCore13to24 = Object.fromEntries(profilesCore13to24List.map((row) => [row.slug, row]));
const profilesCore25to36 = Object.fromEntries(profilesCore25to36List.map((row) => [row.slug, row]));
const profiles49to60 = Object.fromEntries([...profiles49to54List, ...profiles55to60List].map((row) => [row.slug, row]));
const banksCore25to36 = { ...banksCore25to28, ...banksCore29to32, ...banksCore33to36 };
const banks49to60 = { ...banks49to54, ...banks55to60 };
const banks = { ...banksBase, ...banksCore, ...banksCore13to24, ...banksCore25to36, ...banks49to60, ...clarityWave2Banks, ...safetyHardenedBanks };
const runner = fs.readFileSync('components/assessment-monitor-runner.tsx', 'utf8');
const catalog = fs.readFileSync('lib/assessment-lab/catalog.ts', 'utf8');
const fail = (message) => { console.error(`ASSESSMENT SCIENTIFIC QUALITY FAILED: ${message}`); process.exitCode = 1; };

if (standard.status !== 'mandatory') fail('scientific quality standard must remain mandatory');
for (const key of ['construct_definition','intended_population','intended_use','reference_period','response_scale_semantics','domain_map','item_rationale','language_clarity_review','content_validity_review','scientific_references','validation_stage']) {
  if (!standard.minimum_requirements.includes(key)) fail(`missing minimum requirement ${key}`);
}
if (standard.publication_rules?.validated_label_requires_empirical_validation !== true) fail('validated label must require empirical validation');
if (standard.publication_rules?.mixed_response_semantics_forbidden !== true) fail('mixed response semantics must remain forbidden');
if (!catalog.includes("AssessmentResponseKind = 'frequency' | 'degree' | 'yes-no'")) fail('catalog must expose explicit response semantics');
for (const path of ['question-banks.core-1-12.v1.json','question-banks.core-13-24.v1.json','question-banks.core-25-28.v1.json','question-banks.core-29-32.v1.json','question-banks.core-33-36.v1.json','question-banks.originals-49-54.v1.json','question-banks.originals-55-60.v1.json','question-banks.clarity-wave2.v1.json','question-banks.safety-hardening.v1.json']) {
  if (!catalog.includes(path)) fail(`${path} must be loaded before generic fallback`);
}
if (!runner.includes("frequency: ['أبدًا', 'نادرًا', 'أحيانًا', 'غالبًا', 'دائمًا تقريبًا']")) fail('frequency response scale missing');
if (!runner.includes("degree: ['إطلاقًا', 'بدرجة بسيطة', 'بدرجة متوسطة', 'بدرجة كبيرة', 'بدرجة كبيرة جدًا']")) fail('degree response scale missing');
if (!runner.includes("'yes-no': ['لا', 'إلى حد ما', 'نعم']")) fail('yes/no response scale missing');

for (const monitor of monitors) {
  if (!banks[monitor.slug]) fail(`${monitor.slug} cannot fall back to generic question generation`);
}
if (Object.keys(banks).length !== monitors.length) fail(`expected exactly ${monitors.length} custom-reviewed banks, found ${Object.keys(banks).length}`);

const globalQuestionOwners = new Map();
for (const [slug, questions] of Object.entries(banks)) {
  const monitor = monitors.find((row) => row.slug === slug);
  if (!monitor) fail(`question bank has no monitor: ${slug}`);
  if (!Array.isArray(questions) || questions.length !== 16) fail(`${slug} must have exactly 16 reviewed items in its current v1 design`);
  const normalized = questions.map((q) => q.text.trim().replace(/\s+/g, ' '));
  if (new Set(normalized).size !== normalized.length) fail(`${slug} contains duplicate item text`);
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    if (!question.text || question.text.trim().length < 18) fail(`${slug} contains an underspecified item`);
    if (!monitor.axes.includes(question.axis)) fail(`${slug} question axis ${question.axis} is outside its domain map`);
    if (!['frequency','degree','yes-no'].includes(question.responseKind ?? 'degree')) fail(`${slug} contains an invalid response semantic`);
    const key = normalized[index];
    const previousOwner = globalQuestionOwners.get(key);
    if (previousOwner && previousOwner !== slug) fail(`exact item duplication across tools: ${previousOwner} and ${slug}`);
    globalQuestionOwners.set(key, slug);
  }
  for (const axis of monitor.axes) {
    const count = questions.filter((q) => q.axis === axis).length;
    if (count !== 4) fail(`${slug}/${axis} must contain exactly four items`);
  }
}

function validateExplicitOverride(overrideBanks, expectedSlugs, label) {
  if (Object.keys(overrideBanks).length !== expectedSlugs.length) fail(`${label} must contain exactly ${expectedSlugs.length} designated tools`);
  for (const slug of expectedSlugs) {
    const monitor = monitors.find((row) => row.slug === slug);
    const questions = overrideBanks[slug];
    if (!monitor || !Array.isArray(questions) || questions.length !== 16) fail(`${slug} ${label} coverage is incomplete`);
    if (questions.some((question) => !question.responseKind)) fail(`${slug} ${label} items must declare responseKind explicitly`);
    for (const axis of monitor?.axes ?? []) {
      if (questions.filter((question) => question.axis === axis).length !== 4) fail(`${slug}/${axis} ${label} must retain four items`);
    }
  }
}

const clarityWave2Slugs = ['mood-daily','sleep-quality','stress-load','caregiver-strain','parenting-stress','family-communication'];
validateExplicitOverride(clarityWave2Banks, clarityWave2Slugs, 'clarity wave 2');
const safetyHardenedSlugs = ['relationship-safety','trauma-recovery','postpartum-support','recovery-safety','panic-pattern','compulsive-pattern'];
validateExplicitOverride(safetyHardenedBanks, safetyHardenedSlugs, 'safety hardening');

function validateProfileSet(slugs, profiles, bankSet, label) {
  if (Object.keys(bankSet).length !== slugs.length) fail(`expected ${slugs.length} tailored ${label} banks, found ${Object.keys(bankSet).length}`);
  if (Object.keys(profiles).length !== slugs.length) fail(`expected ${slugs.length} scientific ${label} profiles, found ${Object.keys(profiles).length}`);
  for (const slug of slugs) {
    const monitor = monitors.find((row) => row.slug === slug);
    const profile = profiles[slug];
    if (!profile) { fail(`missing scientific ${label} profile ${slug}`); continue; }
    if (!bankSet[slug]) fail(`missing tailored ${label} question bank ${slug}`);
    const construct = profile.construct ?? profile.construct_definition;
    if (!construct || construct.trim().length < 35) fail(`${slug} construct definition is too weak`);
    if (!profile.intended_population || !profile.intended_use) fail(`${slug} intended population/use missing`);
    const prohibited = profile.prohibited_uses ?? profile.not_for;
    if (!Array.isArray(prohibited) || prohibited.length < 3) fail(`${slug} prohibited uses incomplete`);
    if (!profile.reference_period) fail(`${slug} reference period missing`);
    const domains = profile.domains ?? profile.domain_map;
    if (JSON.stringify(domains) !== JSON.stringify(monitor.axes)) fail(`${slug} scientific domains drift from published axes`);
    if (!profile.item_rationale || profile.item_rationale.trim().length < 45) fail(`${slug} item rationale is too weak`);
    if (!profile.interpretation_boundary || profile.interpretation_boundary.trim().length < 45) fail(`${slug} interpretation boundary is too weak`);
    if (!profile.safety || profile.safety.trim().length < 35) fail(`${slug} safety guidance is too weak`);
    const refs = profile.references ?? profile.scientific_references;
    if (!Array.isArray(refs) || refs.length < 2 || refs.some((ref) => !ref.url?.startsWith('https://'))) fail(`${slug} requires at least two traceable scientific references`);
    if (profile.validation_stage === 'validated') fail(`${slug} cannot be marked validated without empirical psychometric evidence`);
  }
}

const coreSlugs = ['mood-daily','sleep-quality','stress-load','caregiver-strain','parenting-stress','family-communication','relationship-safety','breakup-recovery','grief-adjustment','trauma-recovery','emotional-regulation','self-compassion'];
validateProfileSet(coreSlugs, profilesCore, banksCore, 'core-1-12');
const core13to24Slugs = ['loneliness','social-support','burnout-risk','daily-function','sensory-overload','executive-function','attention-daily','school-wellbeing','postpartum-support','recovery-safety','autism-family-load','adhd-family-support'];
validateProfileSet(core13to24Slugs, profilesCore13to24, banksCore13to24, 'core-13-24');
const core25to36Slugs = ['learning-difficulty-support','speech-language-support','intellectual-disability-support','down-syndrome-family','cerebral-palsy-family','hearing-support-family','visual-support-family','chronic-illness-family','emotionally-detached','panic-pattern','worry-cycle','compulsive-pattern'];
validateProfileSet(core25to36Slugs, profilesCore25to36, banksCore25to36, 'core-25-36');
const originals49to60Slugs = ['anger-escalation','conflict-repair','assertiveness','boundary-setting','help-seeking','problem-solving','rumination-pattern','uncertainty-tolerance','avoidance-cycle','health-worry','social-anxiety-pattern','performance-anxiety'];
validateProfileSet(originals49to60Slugs, profiles49to60, banks49to60, 'originals-49-60');

const allLegacyCoreSlugs = [...coreSlugs, ...core13to24Slugs, ...core25to36Slugs];
if (allLegacyCoreSlugs.length !== 36 || new Set(allLegacyCoreSlugs).size !== 36) fail('all 36 legacy tools must be uniquely covered by scientific dossiers and tailored banks');
for (const slug of [...allLegacyCoreSlugs, ...originals49to60Slugs]) if (!banks[slug]) fail(`${slug} cannot fall back to generic question generation`);
for (const [slug, profile] of Object.entries(profilesWave1)) if (profile.validation_stage === 'validated') fail(`${slug} cannot be marked validated without empirical psychometric evidence`);

if (!process.exitCode) {
  console.log(`Assessment scientific quality gate passed: ${Object.keys(banks).length} custom-reviewed banks; twelve tools now use explicit clarity/safety override banks; exact cross-tool duplicates are forbidden; validated labels remain forbidden without empirical evidence.`);
  execFileSync(process.execPath, ['scripts/assessment-lab-scientific-hardening-v2-contract.mjs'], { stdio: 'inherit' });
}
