import fs from 'node:fs';

const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json','utf8'));
const instruments = JSON.parse(fs.readFileSync('data/assessment-lab/instruments.v1.json','utf8'));
const questionBanks = JSON.parse(fs.readFileSync('data/assessment-lab/question-banks.v1.json','utf8'));
const catalog = fs.readFileSync('lib/assessment-lab/catalog.ts','utf8');
const runner = fs.readFileSync('components/assessment-monitor-runner.tsx','utf8');
const hub = fs.readFileSync('app/assessment-lab/page.tsx','utf8');
const detail = fs.readFileSync('app/assessment-lab/[slug]/page.tsx','utf8');
const sitemap = fs.readFileSync('app/sitemaps/static.xml/route.ts','utf8');
const fail = (message) => { console.error(`ASSESSMENT LAB CONTRACT FAILED: ${message}`); process.exitCode=1; };

if (monitors.length !== 48) fail(`expected 48 current local monitors, found ${monitors.length}`);
if (instruments.length !== 10) fail(`expected 10 source/rights instrument pages, found ${instruments.length}`);
const slugs = new Set([...monitors,...instruments].map((row)=>row.slug));
if (slugs.size !== 58) fail(`expected 58 unique currently published assessment routes, found ${slugs.size}`);
for (const row of monitors) if (!row.title || !row.category || !Array.isArray(row.axes) || row.axes.length !== 4) fail(`invalid monitor: ${row.slug}`);
for (const row of instruments) if (!row.sourceUrl?.startsWith('https://') || !row.note || !row.status) fail(`instrument must remain source/rights-backed: ${row.slug}`);

const customSlugs = ['decision-fatigue','procrastination-cycle','perfectionism-pressure','study-overload','work-boundaries','return-to-work-readiness','digital-overload','social-media-impact','doomscrolling-pattern','gaming-balance','screen-sleep-interference','notification-stress'];
for (const slug of customSlugs) {
  const monitor = monitors.find((row) => row.slug === slug);
  const bank = questionBanks[slug];
  if (!monitor) fail(`missing new Rawafid monitor ${slug}`);
  if (!Array.isArray(bank) || bank.length !== 16) fail(`expected 16 custom questions for ${slug}`);
  if (monitor && Array.isArray(bank)) {
    const axes = new Set(monitor.axes);
    for (const item of bank) if (!axes.has(item.axis) || !item.text?.trim()) fail(`invalid question bank item for ${slug}: ${item.axis}`);
    for (const axis of monitor.axes) if (bank.filter((item) => item.axis === axis).length !== 4) fail(`axis ${axis} in ${slug} must have exactly 4 questions`);
  }
}

for (const forbidden of ['localStorage','sessionStorage','fetch(']) if (runner.includes(forbidden)) fail(`runner must not persist or transmit answers: ${forbidden}`);
if (!runner.includes('لا تجمع الإجابات في نسبة واحدة') || !runner.includes('لا تحسب درجة تشخيصية')) fail('runner must explicitly prohibit invalid aggregate or diagnostic scoring');
if (!catalog.includes('questionBanks') || !catalog.includes('questionsForAxis')) fail('catalog must support custom question banks plus safe fallback questions');
if (!runner.includes('questions.length')) fail('runner must render the full question bank length');
if (!hub.includes('<strong>48</strong> أداة متابعة محلية') || !hub.includes('<strong>10</strong> صفحات أدوات مصدرية وحقوق') || !hub.includes('<strong>58</strong> مسارًا منشورًا')) fail('hub counts missing');
if (!hub.includes('تمت المراجعة من قبل فريق روافد') || !detail.includes('تمت المراجعة من قبل فريق روافد')) fail('review provenance missing');
if (!detail.includes('index: true') || detail.includes('index: false')) fail('reviewed detail routes must be indexable');
if (!detail.includes('path: `/assessment-lab/${slug}`')) fail('detail routes must self-canonicalize');
if (!sitemap.includes('assessmentSlugs.map')) fail('all assessment detail routes must be in sitemap');
if (!detail.includes('/specialists')) fail('professional escalation path missing');
if (!hub.includes('9789240120785')) fail('2026 WHO self-help framework source missing');

if (!process.exitCode) console.log('Assessment lab contract passed: 48 Rawafid monitoring tools + 10 source/rights pages = 58 published routes; 12 new originals use validated custom 16-item banks with no stored answers or fabricated scoring.');
