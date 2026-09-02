import fs from 'node:fs';

const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const standard = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-quality-standard.v1.json', 'utf8'));
const catalog = fs.readFileSync('lib/assessment-lab/catalog.ts', 'utf8');
const registry = fs.readFileSync('lib/assessment-lab/scientific-profiles.ts', 'utf8');
const fail = (message) => { console.error(`ASSESSMENT SCIENTIFIC HARDENING V3 FAILED: ${message}`); process.exitCode = 1; };

const liveBankFiles = [
  'data/assessment-lab/question-banks.clarity-wave2.v1.json',
  'data/assessment-lab/question-banks.clarity-wave3.v1.json',
  'data/assessment-lab/question-banks.clarity-wave4.v1.json',
  'data/assessment-lab/question-banks.clarity-wave5.v1.json',
  'data/assessment-lab/question-banks.clarity-wave6.v1.json',
  'data/assessment-lab/question-banks.clarity-wave7.v1.json',
  'data/assessment-lab/question-banks.safety-hardening.v1.json',
];
const liveBanks = {};
for (const path of liveBankFiles) Object.assign(liveBanks, JSON.parse(fs.readFileSync(path, 'utf8')));
const monitorSlugs = new Set(monitors.map((monitor) => monitor.slug));
const bankSlugs = new Set(Object.keys(liveBanks));
if (bankSlugs.size !== 60) fail(`expected 60 live tailored banks, found ${bankSlugs.size}`);
for (const monitor of monitors) {
  const questions = liveBanks[monitor.slug];
  if (!Array.isArray(questions)) { fail(`${monitor.slug} has no live tailored bank`); continue; }
  if (questions.length !== 16) fail(`${monitor.slug} must have 16 reviewed live items, found ${questions.length}`);
  const texts = new Set();
  for (const question of questions) {
    if (!monitor.axes.includes(question.axis)) fail(`${monitor.slug} contains item outside domain map: ${question.axis}`);
    if (!question.text?.trim() || question.text.trim().length < 12) fail(`${monitor.slug} contains weak item text`);
    if (texts.has(question.text.trim())) fail(`${monitor.slug} contains duplicate live item text`);
    texts.add(question.text.trim());
    if (!Object.prototype.hasOwnProperty.call(question, 'responseKind')) fail(`${monitor.slug} contains a live item without explicit responseKind`);
    if (!['frequency','degree','yes-no'].includes(question.responseKind)) fail(`${monitor.slug} contains invalid responseKind ${question.responseKind}`);
  }
  for (const axis of monitor.axes) {
    if (questions.filter((question) => question.axis === axis).length !== 4) fail(`${monitor.slug}/${axis} must have exactly four reviewed live items in v1`);
  }
}
for (const slug of bankSlugs) if (!monitorSlugs.has(slug)) fail(`live bank ${slug} has no published monitor`);
if (catalog.includes('inferResponseKind')) fail('runtime response semantics must never be inferred from Arabic wording');
if (catalog.includes('questionsForAxis')) fail('generic runtime question generation must remain removed');

const requiredFields = [
  'construct_definition','intended_population','intended_use','reference_period','response_scale_semantics','domain_map',
  'item_rationale','language_clarity_review','content_validity_review','privacy_statement','interpretation_boundary',
  'functional_impact_guidance','safety_escalation','professional_referral_path','scientific_references','versioning','validation_stage',
];
for (const field of requiredFields) if (!standard.minimum_requirements.includes(field)) fail(`scientific standard lost mandatory field ${field}`);

const wave1v2Path = 'data/assessment-lab/scientific-profiles.wave1-v2.v1.json';
const wave1v2 = JSON.parse(fs.readFileSync(wave1v2Path, 'utf8'));
const expectedWave1 = [
  'decision-fatigue','procrastination-cycle','perfectionism-pressure','study-overload','work-boundaries','return-to-work-readiness',
  'digital-overload','social-media-impact','doomscrolling-pattern','gaming-balance','screen-sleep-interference','notification-stress',
];
if (wave1v2.schema_version !== 2) fail('wave1 scientific dossier must use schema_version 2');
if (!Array.isArray(wave1v2.profiles) || wave1v2.profiles.length !== expectedWave1.length) fail(`expected ${expectedWave1.length} wave1 v2 dossiers`);
const dossierMap = new Map(wave1v2.profiles.map((profile) => [profile.slug, profile]));
for (const slug of expectedWave1) {
  const profile = dossierMap.get(slug);
  const monitor = monitors.find((row) => row.slug === slug);
  if (!profile || !monitor) { fail(`missing wave1 v2 dossier or monitor ${slug}`); continue; }
  for (const field of requiredFields) {
    const value = profile[field];
    if (value === undefined || value === null || value === '') fail(`${slug} missing mandatory dossier field ${field}`);
  }
  if (!Array.isArray(profile.prohibited_uses) || profile.prohibited_uses.length < 3) fail(`${slug} must declare at least three prohibited uses`);
  if (profile.response_scale_semantics !== 'item-specific') fail(`${slug} must use item-specific response semantics`);
  if (JSON.stringify(profile.domain_map) !== JSON.stringify(monitor.axes)) fail(`${slug} dossier domains drift from published monitor axes`);
  if (profile.item_rationale.trim().length < 70) fail(`${slug} item rationale is too weak`);
  if (profile.interpretation_boundary.trim().length < 70) fail(`${slug} interpretation boundary is too weak`);
  if (profile.safety_escalation.trim().length < 55) fail(`${slug} safety escalation is too weak`);
  if (profile.professional_referral_path.trim().length < 45) fail(`${slug} professional referral path is too weak`);
  if (profile.language_clarity_review?.status !== 'internal-editorial-review') fail(`${slug} must disclose current language review stage`);
  if (profile.content_validity_review?.status !== 'not-yet-empirically-completed') fail(`${slug} must disclose incomplete empirical content validity`);
  if (!Array.isArray(profile.scientific_references) || profile.scientific_references.length < 2) fail(`${slug} requires at least two direct scientific references`);
  for (const reference of profile.scientific_references ?? []) {
    if (!reference.title?.trim() || !reference.url?.startsWith('https://')) fail(`${slug} has malformed scientific reference`);
    if (reference.url.includes('?term=')) fail(`${slug} uses a generic PubMed search URL instead of a direct source`);
    if (reference.url.includes('pubmed.ncbi.nlm.nih.gov') && !/\/\d+\/$/.test(reference.url)) fail(`${slug} PubMed reference must resolve to a specific PMID`);
  }
  if (profile.validation_stage !== 'item-development') fail(`${slug} must remain item-development until empirical validation advances`);
  if (profile.versioning?.schema_version !== 2) fail(`${slug} versioning schema must be 2`);
  if (!String(profile.versioning?.instrument_version ?? '').startsWith('1.1-')) fail(`${slug} must disclose the v1.1 scientific dossier revision`);
}
for (const profile of wave1v2.profiles ?? []) if (!expectedWave1.includes(profile.slug)) fail(`unexpected wave1 v2 dossier ${profile.slug}`);

if (!registry.includes("scientific-profiles.wave1-v2.v1.json")) fail('scientific registry must import wave1 v2 dossiers');
if (!registry.includes('profilesWave1V2')) fail('scientific registry must apply wave1 v2 dossiers');
if (!registry.includes('profile.response_scale_semantics')) fail('registry must preserve explicit response-scale semantics from complete dossiers');
if (!registry.includes('profile.language_clarity_review')) fail('registry must preserve explicit language review status from complete dossiers');
if (!registry.includes('profile.content_validity_review')) fail('registry must preserve explicit content-validity status from complete dossiers');
if (!registry.includes('profile.privacy_statement')) fail('registry must preserve explicit privacy statements from complete dossiers');
if (!registry.includes('profile.functional_impact_guidance')) fail('registry must preserve explicit functional-impact guidance from complete dossiers');
if (!registry.includes('profile.professional_referral_path')) fail('registry must preserve explicit referral paths from complete dossiers');

if (!process.exitCode) console.log('Assessment scientific hardening v3 passed: 60/60 live tools have explicit item response semantics; generic inference is absent; and tools 37-48 have complete schema-v2 scientific dossiers with direct references and explicit validation limits.');
