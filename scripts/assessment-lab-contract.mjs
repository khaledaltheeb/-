import fs from 'node:fs';

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));

const monitors = readJson('data/assessment-lab/monitors.v1.json');
const instruments = readJson('data/assessment-lab/instruments.v1.json');
const publicationState = readJson('data/assessment-lab/publication-state.v1.json');
const finalBankFiles = [
  'data/assessment-lab/question-banks.clarity-wave2.v1.json',
  'data/assessment-lab/question-banks.clarity-wave3.v1.json',
  'data/assessment-lab/question-banks.clarity-wave4.v1.json',
  'data/assessment-lab/question-banks.clarity-wave5.v1.json',
  'data/assessment-lab/question-banks.clarity-wave6.v1.json',
  'data/assessment-lab/question-banks.clarity-wave7.v1.json',
  'data/assessment-lab/question-banks.safety-hardening.v1.json',
];
const finalBanks = Object.assign({}, ...finalBankFiles.map(readJson));
const catalog = fs.readFileSync('lib/assessment-lab/catalog.ts', 'utf8');
const runner = fs.readFileSync('components/assessment-monitor-runner.tsx', 'utf8');
const hub = fs.readFileSync('app/assessment-lab/page.tsx', 'utf8');
const detail = fs.readFileSync('app/assessment-lab/[slug]/page.tsx', 'utf8');
const sitemap = fs.readFileSync('app/sitemaps/static.xml/route.ts', 'utf8');
const fail = (message) => {
  console.error(`ASSESSMENT LAB CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

if (monitors.length !== 60) fail(`expected 60 current local monitors, found ${monitors.length}`);
if (instruments.length !== 10) fail(`expected 10 source/rights instrument pages, found ${instruments.length}`);
const slugs = new Set([...monitors, ...instruments].map((row) => row.slug));
if (slugs.size !== 70) fail(`expected 70 unique currently published assessment routes, found ${slugs.size}`);
if (
  publicationState.published_routes !== 70 ||
  publicationState.published_rawafid_originals !== 60 ||
  publicationState.published_source_rights !== 10
) fail('publication snapshot must remain locked to 60 originals + 10 source/rights pages');
if (
  !String(publicationState.note || '').includes('deferred future backlog') ||
  String(publicationState.note || '').includes('is the target portfolio')
) fail('publication snapshot must state that roadmap-150 is deferred rather than the active target');

for (const row of monitors) {
  if (!row.title || !row.category || !Array.isArray(row.axes) || row.axes.length !== 4) fail(`invalid monitor: ${row.slug}`);
}
for (const row of instruments) {
  if (!row.sourceUrl?.startsWith('https://') || !row.note || !row.status) fail(`instrument must remain source/rights-backed: ${row.slug}`);
}

const finalBankSlugs = Object.keys(finalBanks);
if (finalBankSlugs.length !== 60) fail(`final runtime banks must cover exactly 60 tools, found ${finalBankSlugs.length}`);
const monitorSlugs = new Set(monitors.map((row) => row.slug));
const validResponseKinds = new Set(['frequency', 'degree', 'yes-no']);
const seenTexts = new Map();

for (const slug of finalBankSlugs) {
  if (!monitorSlugs.has(slug)) fail(`final runtime bank has unknown monitor slug: ${slug}`);
}
for (const monitor of monitors) {
  const bank = finalBanks[monitor.slug];
  if (!Array.isArray(bank) || bank.length !== 16) fail(`expected 16 final reviewed questions for ${monitor.slug}`);
  if (!Array.isArray(bank)) continue;
  const axes = new Set(monitor.axes);
  for (const item of bank) {
    if (!axes.has(item.axis) || !item.text?.trim()) fail(`invalid final bank item for ${monitor.slug}: ${item.axis}`);
    if (!validResponseKinds.has(item.responseKind)) fail(`explicit responseKind missing or invalid for ${monitor.slug}`);
    const normalized = item.text.trim().replace(/\s+/g, ' ');
    const previous = seenTexts.get(normalized);
    if (previous && previous !== monitor.slug) fail(`exact duplicate item text across tools: ${previous} / ${monitor.slug}`);
    seenTexts.set(normalized, monitor.slug);
  }
  for (const axis of monitor.axes) {
    if (bank.filter((item) => item.axis === axis).length !== 4) fail(`axis ${axis} in ${monitor.slug} must have exactly 4 questions`);
  }
}

for (const file of finalBankFiles) {
  const importName = file.split('/').pop();
  if (!catalog.includes(importName)) fail(`catalog must load final reviewed runtime bank: ${importName}`);
}
for (const forbiddenImport of [
  'question-banks.v1.json',
  'question-banks.core-',
  'question-banks.originals-',
]) {
  if (catalog.includes(forbiddenImport)) fail(`historical/base bank must not enter runtime: ${forbiddenImport}`);
}
if (catalog.includes('function questionsForAxis')) fail('generic fallback question generation must not exist');
if (catalog.includes('function inferResponseKind')) fail('response semantics must not be inferred from wording');
if (!catalog.includes('questionBanks')) fail('catalog must assemble final reviewed question banks');
if (!catalog.includes('throw new Error(`Missing tailored Assessment Lab question bank for ${monitor.slug}`)')) fail('missing final reviewed banks must fail closed');

for (const forbidden of ['localStorage', 'sessionStorage', 'fetch(']) {
  if (runner.includes(forbidden)) fail(`runner must not persist or transmit answers: ${forbidden}`);
}
if (!runner.includes('لا تجمع الإجابات في نسبة واحدة') || !runner.includes('لا تحسب درجة تشخيصية')) fail('runner must explicitly prohibit invalid aggregate or diagnostic scoring');
if (!catalog.includes('getSourceInstrumentStatusLabel') || !detail.includes('getSourceInstrumentStatusLabel(instrument!.status)')) fail('source/rights routes must present a readable Arabic status instead of internal status codes');
if (!runner.includes('questions.length')) fail('runner must render the full question bank length');
if (!hub.includes('<strong>60</strong> أداة متابعة محلية') || !hub.includes('<strong>10</strong> صفحات أدوات مصدرية وحقوق') || !hub.includes('<strong>70</strong> مسارًا منشورًا')) fail('hub counts missing');
if (!hub.includes('تمت المراجعة من قبل فريق روافد') || !detail.includes('تمت المراجعة من قبل فريق روافد')) fail('review provenance missing');
if (!detail.includes('index: true') || detail.includes('index: false')) fail('reviewed detail routes must be indexable');
if (!detail.includes('path: `/assessment-lab/${slug}`')) fail('detail routes must self-canonicalize');
if (!sitemap.includes('assessmentSlugs.map')) fail('all assessment detail routes must be in sitemap');
if (!detail.includes('/specialists')) fail('professional escalation path missing');
if (!hub.includes('9789240120785')) fail('2026 WHO self-help framework source missing');

if (!process.exitCode) {
  console.log('Assessment lab contract passed: 60 manually reviewed Rawafid tools / 960 explicit-response items + 10 source-rights pages = 70 published routes; historical banks and generic fallback remain outside runtime, answers are not stored, and no fabricated diagnostic score is produced.');
}
