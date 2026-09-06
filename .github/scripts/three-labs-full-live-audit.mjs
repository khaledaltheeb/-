import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = 'https://healthrenewal.org';
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function extractMeasureSlugs() {
  const libDir = path.join(ROOT, 'lib');
  const waveFiles = fs.readdirSync(libDir)
    .filter((file) => /^assessment-measures-wave\d+\.ts$/.test(file))
    .sort((a, b) => Number(a.match(/wave(\d+)/)?.[1] ?? 0) - Number(b.match(/wave(\d+)/)?.[1] ?? 0));
  const files = ['lib/assessment-measures.ts', ...waveFiles.map((file) => `lib/${file}`)];
  return [...new Set(files.flatMap((file) => [...read(file).matchAll(/\{\s*slug:\s*'([^']+)'\s*,\s*nameAr:/g)].map((m) => m[1])))];
}

function extractAssessmentCategories() {
  const base = read('lib/assessment-measures.ts');
  const start = base.indexOf('export const assessmentMeasureCategories = [');
  const end = base.indexOf('export const assessmentMeasures: AssessmentMeasure[] = [');
  if (start < 0 || end <= start) throw new Error('Could not locate base assessment category catalog');
  const slugs = [...base.slice(start, end).matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
  const extras = fs.readdirSync(path.join(ROOT, 'lib'))
    .filter((file) => /^assessment-measures-wave\d+-categories\.ts$/.test(file))
    .flatMap((file) => [...read(`lib/${file}`).matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]));
  return [...new Set([...slugs, ...extras])];
}

const measureSlugs = extractMeasureSlugs();
const measureCategories = extractAssessmentCategories();
const assessmentMonitors = readJson('data/assessment-lab/monitors.v1.json');
const sourceInstruments = readJson('data/assessment-lab/instruments.v1.json');
const cognitiveTools = [
  ...readJson('data/cognitive-lab/tools.v1.json'),
  ...readJson('data/cognitive-lab/tools.v2-extension.json'),
];

const cognitiveStaticDirs = fs.readdirSync(path.join(ROOT, 'app/cognitive-lab'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== '[slug]')
  .map((entry) => entry.name);
const cognitiveSlugs = [...new Set([...cognitiveTools.map((tool) => tool.slug), ...cognitiveStaticDirs])];

const routes = [];
const add = (pathName, group, semantics = {}) => routes.push({ path: pathName, group, ...semantics });

add('/assessment-measures/', 'assessment-measures-hub');
for (const slug of measureSlugs) {
  add(`/assessment-measures/${slug}/`, 'assessment-measures-detail', {
    require: ['المقياس / المادة التشغيلية'],
    forbid: ['ورقة توثيق عامة — ليست نموذج المقياس', 'لم تُنشر مادة تشغيلية صريحة بعد'],
  });
  add(`/assessment-measures/${slug}/print/`, 'assessment-measures-print', {
    require: ['العودة إلى دليل المقياس'],
    forbid: ['ورقة توثيق عامة — ليست نموذج المقياس'],
  });
}
for (const slug of measureCategories) add(`/assessment-measures/category/${slug}/`, 'assessment-measures-category');
for (const slug of ['compare', 'methodology', 'rights-register', 'rights-review']) add(`/assessment-measures/${slug}/`, 'assessment-measures-special');

add('/assessment-lab/', 'assessment-lab-hub');
for (const row of [...assessmentMonitors, ...sourceInstruments]) {
  add(`/assessment-lab/${row.slug}/`, 'assessment-lab-detail', { require: [row.title] });
}

add('/cognitive-lab/', 'cognitive-lab-hub');
for (const slug of cognitiveSlugs) add(`/cognitive-lab/${slug}/`, 'cognitive-lab-detail');

const deduped = [];
const seen = new Set();
for (const route of routes) {
  if (seen.has(route.path)) continue;
  seen.add(route.path);
  deduped.push(route);
}

const expectedCounts = {
  measureCatalog: 83,
  measureCategories: 26,
};
if (measureSlugs.length !== expectedCounts.measureCatalog) throw new Error(`Expected 83 measure slugs, found ${measureSlugs.length}`);
if (measureCategories.length !== expectedCounts.measureCategories) throw new Error(`Expected 26 measure categories, found ${measureCategories.length}`);

function normalizeHtmlText(html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function probe(route) {
  const attempts = [];
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const started = Date.now();
    try {
      const response = await fetch(`${BASE}${route.path}`, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Rawafid-Three-Labs-Full-Live-Audit/1.0',
          'Cache-Control': 'no-cache',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
      const rawBody = await response.text();
      const body = normalizeHtmlText(rawBody);
      const issues = [];
      if (response.status !== 200) issues.push(`HTTP ${response.status}`);
      if (/Internal Server Error|server-side exception|Application error/i.test(body)) issues.push('server error marker');
      if (Buffer.byteLength(rawBody) < 1000) issues.push(`unexpectedly small response: ${Buffer.byteLength(rawBody)} bytes`);
      for (const text of route.require ?? []) if (!body.includes(text)) issues.push(`missing required text: ${text}`);
      for (const text of route.forbid ?? []) if (body.includes(text)) issues.push(`forbidden text present: ${text}`);

      const row = {
        path: route.path,
        group: route.group,
        attempt,
        status: response.status,
        ok: issues.length === 0,
        issues,
        elapsedMs: Date.now() - started,
        bytes: Buffer.byteLength(rawBody),
        cfRay: response.headers.get('cf-ray'),
        retryAfter: response.headers.get('retry-after'),
      };
      attempts.push(row);
      console.log(`THREE_LABS_LIVE_PROBE ${JSON.stringify(row)}`);
      if (row.ok) return { ok: true, attempts, last: row };
    } catch (error) {
      const row = {
        path: route.path,
        group: route.group,
        attempt,
        status: 0,
        ok: false,
        issues: [error instanceof Error ? error.message : String(error)],
        elapsedMs: Date.now() - started,
      };
      attempts.push(row);
      console.log(`THREE_LABS_LIVE_PROBE ${JSON.stringify(row)}`);
    } finally {
      clearTimeout(timeout);
    }
    await sleep(2500 * attempt);
  }
  return { ok: false, attempts, last: attempts.at(-1) };
}

console.log('THREE_LABS_FULL_LIVE_AUDIT_PLAN');
console.log(JSON.stringify({
  measureSlugs: measureSlugs.length,
  measurePrintRoutes: measureSlugs.length,
  measureCategories: measureCategories.length,
  assessmentLabSlugs: assessmentMonitors.length + sourceInstruments.length,
  cognitiveSlugs: cognitiveSlugs.length,
  totalRoutes: deduped.length,
}, null, 2));

const results = [];
for (let index = 0; index < deduped.length; index += 1) {
  const route = deduped[index];
  const result = await probe(route);
  results.push({ route, result });
  if ((index + 1) % 25 === 0 || index + 1 === deduped.length) {
    const passed = results.filter((row) => row.result.ok).length;
    console.log(`THREE_LABS_PROGRESS ${index + 1}/${deduped.length} passed=${passed} failed=${results.length - passed}`);
  }
  await sleep(1400);
}

const failures = results.filter(({ result }) => !result.ok);
const allAttempts = results.flatMap(({ result }) => result.attempts);
const groups = {};
for (const { route, result } of results) {
  groups[route.group] ??= { total: 0, passed: 0, failed: 0 };
  groups[route.group].total += 1;
  groups[route.group][result.ok ? 'passed' : 'failed'] += 1;
}

const summary = {
  totalRoutes: deduped.length,
  passed: results.length - failures.length,
  failed: failures.length,
  transientFailedAttempts: allAttempts.filter((row) => !row.ok).length - failures.length,
  groups,
  failures: failures.map(({ route, result }) => ({ path: route.path, group: route.group, last: result.last })),
};
console.log('THREE_LABS_FULL_LIVE_AUDIT_SUMMARY');
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
