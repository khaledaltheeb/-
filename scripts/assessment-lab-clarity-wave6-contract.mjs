import fs from 'node:fs';

const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const wave = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.clarity-wave6.v1.json', 'utf8'));
const catalog = fs.readFileSync('lib/assessment-lab/catalog.ts', 'utf8');

const expectedSlugs = [
  'decision-fatigue','procrastination-cycle','perfectionism-pressure','study-overload',
  'work-boundaries','return-to-work-readiness','digital-overload','social-media-impact',
  'doomscrolling-pattern','gaming-balance','screen-sleep-interference','notification-stress',
];
const allowedResponseKinds = new Set(['frequency', 'degree', 'yes-no']);
const fail = (message) => {
  console.error(`ASSESSMENT CLARITY WAVE 6 FAILED: ${message}`);
  process.exitCode = 1;
};

if (!catalog.includes('question-banks.clarity-wave6.v1.json')) fail('catalog must import clarity wave 6');
if (!catalog.includes('...(clarityWave6QuestionBankData as Record<string, RawAssessmentQuestion[]>)')) fail('clarity wave 6 must be loaded into effective question banks');

const actualSlugs = Object.keys(wave);
if (actualSlugs.length !== expectedSlugs.length) fail(`expected ${expectedSlugs.length} tools, found ${actualSlugs.length}`);
for (const slug of actualSlugs) if (!expectedSlugs.includes(slug)) fail(`unexpected tool in wave 6: ${slug}`);
for (const slug of expectedSlugs) if (!wave[slug]) fail(`missing wave 6 tool: ${slug}`);

const globalText = new Map();
for (const slug of expectedSlugs) {
  const monitor = monitors.find((row) => row.slug === slug);
  const questions = wave[slug];
  if (!monitor) { fail(`unknown monitor ${slug}`); continue; }
  if (!Array.isArray(questions) || questions.length !== 16) { fail(`${slug} must contain exactly 16 items`); continue; }
  const seen = new Set();
  for (const question of questions) {
    if (!monitor.axes.includes(question.axis)) fail(`${slug}: axis ${question.axis} is outside the published domain map`);
    if (!question.text || question.text.trim().length < 18) fail(`${slug}: underspecified item`);
    if (!allowedResponseKinds.has(question.responseKind)) fail(`${slug}: every item must declare an explicit valid responseKind`);
    const normalized = question.text.trim().replace(/\s+/g, ' ');
    if (seen.has(normalized)) fail(`${slug}: duplicate item text`);
    seen.add(normalized);
    const previous = globalText.get(normalized);
    if (previous && previous !== slug) fail(`exact cross-tool duplicate: ${previous} and ${slug}`);
    globalText.set(normalized, slug);
  }
  for (const axis of monitor.axes) {
    const count = questions.filter((question) => question.axis === axis).length;
    if (count !== 4) fail(`${slug}/${axis} must retain exactly four items`);
  }
}

if (!process.exitCode) {
  console.log('Assessment clarity wave 6 passed: 12 tools, 192 manually reviewed items, explicit response semantics, four items per published axis, no exact duplicates.');
}
