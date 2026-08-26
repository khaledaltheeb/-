import fs from 'node:fs';

const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const banks = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.v1.json', 'utf8'));
const profiles = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.wave1.v1.json', 'utf8'));
const fail = (message) => { console.error(`ASSESSMENT SCIENTIFIC PROFILE CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const expected = [
  'decision-fatigue','procrastination-cycle','perfectionism-pressure','study-overload','work-boundaries','return-to-work-readiness',
  'digital-overload','social-media-impact','doomscrolling-pattern','gaming-balance','screen-sleep-interference','notification-stress'
];

for (const slug of expected) {
  const monitor = monitors.find((row) => row.slug === slug);
  const bank = banks[slug];
  const profile = profiles.profiles?.[slug];
  if (!monitor) { fail(`missing monitor ${slug}`); continue; }
  if (!profile) { fail(`missing scientific profile ${slug}`); continue; }
  for (const key of ['construct_definition','intended_population','intended_use','reference_period','interpretation_boundary','validation_stage']) {
    if (!profile[key] || String(profile[key]).trim().length < 8) fail(`${slug} missing/weak ${key}`);
  }
  if (!Array.isArray(profile.not_for) || profile.not_for.length < 2) fail(`${slug} must state at least two prohibited uses`);
  if (!Array.isArray(profile.domains) || profile.domains.length !== 4) fail(`${slug} must define exactly four scientific domains`);
  if (JSON.stringify(profile.domains) !== JSON.stringify(monitor.axes)) fail(`${slug} scientific domains must exactly match monitor axes`);
  if (!Array.isArray(profile.scientific_references) || profile.scientific_references.length < 2) fail(`${slug} needs at least two scientific references`);
  for (const ref of profile.scientific_references ?? []) {
    if (!ref.title || !ref.url?.startsWith('https://')) fail(`${slug} has invalid scientific reference`);
  }
  if (profile.validation_stage === 'validated') fail(`${slug} cannot be labeled validated without empirical validation dossier`);
  if (!Array.isArray(bank) || bank.length !== 16) fail(`${slug} must have a 16-item custom bank`);
  const bankAxes = [...new Set((bank ?? []).map((item) => item.axis))];
  if (JSON.stringify(bankAxes) !== JSON.stringify(monitor.axes)) fail(`${slug} bank axes/order must match monitor axes`);
  for (const axis of monitor.axes) {
    if ((bank ?? []).filter((item) => item.axis === axis).length !== 4) fail(`${slug}/${axis} must have exactly four items`);
  }
}

const profileKeys = Object.keys(profiles.profiles ?? {});
if (profileKeys.length !== expected.length) fail(`expected ${expected.length} profiles, found ${profileKeys.length}`);
for (const slug of profileKeys) if (!expected.includes(slug)) fail(`unexpected wave1 profile ${slug}`);

if (!process.exitCode) console.log('Assessment wave1 scientific profiles passed: 12 tools have construct, population, intended use, exclusions, recall period, aligned domains, interpretation boundary, references and non-validated status.');
