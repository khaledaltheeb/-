import fs from 'node:fs';

const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json','utf8'));
const instruments = JSON.parse(fs.readFileSync('data/assessment-lab/instruments.v1.json','utf8'));
const catalog = fs.readFileSync('lib/assessment-lab/catalog.ts','utf8');
const runner = fs.readFileSync('components/assessment-monitor-runner.tsx','utf8');
const hub = fs.readFileSync('app/assessment-lab/page.tsx','utf8');
const detail = fs.readFileSync('app/assessment-lab/[slug]/page.tsx','utf8');
const sitemap = fs.readFileSync('app/sitemaps/static.xml/route.ts','utf8');
const fail = (message) => { console.error(`ASSESSMENT LAB CONTRACT FAILED: ${message}`); process.exitCode=1; };

if (monitors.length !== 36) fail(`expected 36 legacy local monitors, found ${monitors.length}`);
if (instruments.length !== 4) fail(`expected 4 source instruments, found ${instruments.length}`);
const slugs = new Set([...monitors,...instruments].map((row)=>row.slug));
if (slugs.size !== 40) fail(`expected 40 unique tool slugs, found ${slugs.size}`);
for (const row of monitors) if (!row.title || !row.category || !Array.isArray(row.axes) || row.axes.length !== 4) fail(`invalid monitor: ${row.slug}`);
for (const row of instruments) if (!row.sourceUrl?.startsWith('https://') || !row.note) fail(`instrument must remain source-backed: ${row.slug}`);

for (const forbidden of ['localStorage','sessionStorage','fetch(']) if (runner.includes(forbidden)) fail(`runner must not persist or transmit answers: ${forbidden}`);
if (!runner.includes('لا تجمع الإجابات في نسبة واحدة') || !runner.includes('لا تحسب درجة تشخيصية')) fail('runner must explicitly prohibit invalid aggregate or diagnostic scoring');
if (!catalog.includes('questionsForAxis') || !catalog.includes('flatMap')) fail('monitor questions must be axis-aware and deterministic');
if (!catalog.includes('4') || !runner.includes('questions.length')) fail('runner must support the expanded four-question-per-axis model');
if (!hub.includes('36') || !hub.includes('4') || !hub.includes('16</strong> بندًا لكل متابعة')) fail('hub counts or V2 monitor depth missing');
if (!hub.includes('تمت المراجعة من قبل فريق روافد') || !detail.includes('تمت المراجعة من قبل فريق روافد')) fail('review provenance missing');
if (!detail.includes('index: true') || detail.includes('index: false')) fail('reviewed detail routes must be indexable');
if (!detail.includes('path: `/assessment-lab/${slug}`')) fail('detail routes must self-canonicalize');
if (!sitemap.includes('assessmentSlugs.map')) fail('all assessment detail routes must be in sitemap');
if (!detail.includes('/specialists')) fail('professional escalation path missing');
if (!hub.includes('9789240120785')) fail('2026 WHO self-help framework source missing');

if (!process.exitCode) console.log('Assessment lab V2 contract passed: 36 axis-aware local monitors + 4 source-instrument pages, no stored answers, no fabricated scoring, indexable self-canonical detail pages, full sitemap coverage.');
