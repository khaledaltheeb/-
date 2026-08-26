import fs from 'node:fs';

const standard = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-quality-standard.v1.json', 'utf8'));
const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const banksBase = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.v1.json', 'utf8'));
const banksCore = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.core-1-12.v1.json', 'utf8'));
const profilesWave1 = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.wave1.v1.json', 'utf8')).profiles;
const profilesCoreList = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.core-1-12.v1.json', 'utf8')).profiles;
const profilesCore = Object.fromEntries(profilesCoreList.map((row) => [row.slug, row]));
const banks = { ...banksBase, ...banksCore };
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
if (!catalog.includes('question-banks.core-1-12.v1.json')) fail('core reviewed question bank must be loaded before generic fallback');
if (!runner.includes("frequency: ['أبدًا', 'نادرًا', 'أحيانًا', 'غالبًا', 'دائمًا تقريبًا']")) fail('frequency response scale missing');
if (!runner.includes("degree: ['إطلاقًا', 'بدرجة بسيطة', 'بدرجة متوسطة', 'بدرجة كبيرة', 'بدرجة كبيرة جدًا']")) fail('degree response scale missing');
if (!runner.includes("'yes-no': ['لا', 'إلى حد ما', 'نعم']")) fail('yes/no response scale missing');

for (const [slug, questions] of Object.entries(banks)) {
  const monitor = monitors.find((row) => row.slug === slug);
  if (!monitor) fail(`question bank has no monitor: ${slug}`);
  if (!Array.isArray(questions) || questions.length !== 16) fail(`${slug} must have exactly 16 reviewed items in its current v1 design`);
  const normalized = questions.map((q) => q.text.trim());
  if (new Set(normalized).size !== normalized.length) fail(`${slug} contains duplicate item text`);
  for (const question of questions) {
    if (!question.text || question.text.trim().length < 18) fail(`${slug} contains an underspecified item`);
    if (!monitor.axes.includes(question.axis)) fail(`${slug} question axis ${question.axis} is outside its domain map`);
  }
  for (const axis of monitor.axes) {
    const count = questions.filter((q) => q.axis === axis).length;
    if (count !== 4) fail(`${slug}/${axis} must contain exactly four items`);
  }
}

const coreSlugs = ['mood-daily','sleep-quality','stress-load','caregiver-strain','parenting-stress','family-communication','relationship-safety','breakup-recovery','grief-adjustment','trauma-recovery','emotional-regulation','self-compassion'];
if (Object.keys(banksCore).length !== coreSlugs.length) fail(`expected ${coreSlugs.length} tailored core banks, found ${Object.keys(banksCore).length}`);
if (profilesCoreList.length !== coreSlugs.length) fail(`expected ${coreSlugs.length} scientific core profiles, found ${profilesCoreList.length}`);
for (const slug of coreSlugs) {
  const monitor = monitors.find((row) => row.slug === slug);
  const profile = profilesCore[slug];
  if (!profile) { fail(`missing scientific core profile ${slug}`); continue; }
  if (!banksCore[slug]) fail(`missing tailored core question bank ${slug}`);
  if (!profile.construct || profile.construct.trim().length < 35) fail(`${slug} construct definition is too weak`);
  if (!profile.intended_population || !profile.intended_use) fail(`${slug} intended population/use missing`);
  if (!Array.isArray(profile.prohibited_uses) || profile.prohibited_uses.length < 3) fail(`${slug} prohibited uses incomplete`);
  if (!profile.reference_period) fail(`${slug} reference period missing`);
  if (JSON.stringify(profile.domains) !== JSON.stringify(monitor.axes)) fail(`${slug} scientific domains drift from published axes`);
  if (!profile.item_rationale || profile.item_rationale.trim().length < 45) fail(`${slug} item rationale is too weak`);
  if (!profile.interpretation_boundary || profile.interpretation_boundary.trim().length < 45) fail(`${slug} interpretation boundary is too weak`);
  if (!profile.safety || profile.safety.trim().length < 35) fail(`${slug} safety guidance is too weak`);
  if (!Array.isArray(profile.references) || profile.references.length < 2 || profile.references.some((ref) => !ref.url?.startsWith('https://'))) fail(`${slug} requires at least two traceable scientific references`);
  if (profile.validation_stage === 'validated') fail(`${slug} cannot be marked validated without empirical psychometric evidence`);
}

for (const [slug, profile] of Object.entries(profilesWave1)) {
  if (profile.validation_stage === 'validated') fail(`${slug} cannot be marked validated without empirical psychometric evidence`);
}

if (!process.exitCode) console.log(`Assessment scientific quality gate passed: ${Object.keys(banks).length} custom-reviewed banks, including ${coreSlugs.length} rebuilt core tools with scientific dossiers; validated labels remain forbidden without empirical evidence.`);
