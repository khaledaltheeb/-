import fs from 'node:fs';

const standard = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-quality-standard.v1.json', 'utf8'));
const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const banks = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.v1.json', 'utf8'));
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

if (!process.exitCode) console.log(`Assessment scientific quality gate passed for ${Object.keys(banks).length} custom-reviewed banks; validated labels remain forbidden without empirical evidence.`);
