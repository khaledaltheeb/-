import fs from 'node:fs';

const BASE = process.env.ASSESSMENT_MEASURES_SMOKE_BASE || 'https://healthrenewal.org';
const sourceFiles = [
  'lib/assessment-measures.ts',
  ...Array.from({ length: 11 }, (_, i) => `lib/assessment-measures-wave${i + 2}.ts`),
];

function extractMeasureArray(text, exportNamePattern) {
  const startPattern = new RegExp(`export\\s+const\\s+${exportNamePattern}[^=]*=\\s*\\[`);
  const match = startPattern.exec(text);
  if (!match) return '';
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = match.index + match[0].length - 1; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) return text.slice(match.index, i + 1);
    }
  }
  return '';
}

const slugs = new Set();
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const exportPattern = file.endsWith('assessment-measures.ts') ? 'assessmentMeasures' : 'assessmentMeasuresWave\\d+';
  const arrayText = extractMeasureArray(text, exportPattern);
  if (!arrayText) throw new Error(`Could not isolate measure array in ${file}`);
  for (const match of arrayText.matchAll(/\bslug\s*:\s*['"]([^'"]+)['"]/g)) slugs.add(match[1]);
}

const publishedSlugs = [...slugs].sort();
if (publishedSlugs.length !== 83) throw new Error(`Expected 83 published Assessment Measures, found ${publishedSlugs.length}`);

const tests = [
  { path: '/assessment-measures/', kind: 'hub', canonical: '/assessment-measures/' },
  { path: '/assessment-measures/compare/', kind: 'compare', canonical: '/assessment-measures/compare/' },
  { path: '/assessment-measures/methodology/', kind: 'methodology', canonical: '/assessment-measures/methodology/' },
  ...publishedSlugs.map((slug) => ({ path: `/assessment-measures/${slug}/`, kind: 'detail', canonical: `/assessment-measures/${slug}/`, slug })),
  { path: '/assessment-measures/patient-health-questionnaire-9/print/', kind: 'explicit-print', canonical: null },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function extractCanonical(body) {
  const match = body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || body.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return match?.[1] || null;
}

function isNoIndex(body) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(body)
    || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(body);
}

function normalizedCanonicalPath(value) {
  if (!value) return null;
  try { return new URL(value, BASE).pathname; } catch { return value; }
}

async function fetchWithRetry(test) {
  const attempts = [];
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const started = Date.now();
    try {
      const response = await fetch(`${BASE}${test.path}`, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Rawafid-Assessment-Measures-Full-Live-Smoke/2.0',
          'Cache-Control': 'no-cache',
        },
      });
      const body = await response.text();
      const semanticIssues = [];
      const serverError = /Internal Server Error|server-side exception|Application error/i.test(body);
      if (response.status !== 200) semanticIssues.push(`HTTP ${response.status}`);
      if (serverError) semanticIssues.push('server error marker');
      if (Buffer.byteLength(body) < 2000) semanticIssues.push(`small body: ${Buffer.byteLength(body)} bytes`);

      if (test.kind === 'detail') {
        for (const marker of ['نوع أداة القياس وسياق استخدامها', 'فصل منهجي:', 'الحقوق والنسخة العربية', 'السلامة والحدود المهنية']) {
          if (!body.includes(marker)) semanticIssues.push(`missing detail marker: ${marker}`);
        }
        if (body.includes('التصنيف يحتاج مراجعة صريحة')) semanticIssues.push('published measure still reports taxonomy review required');
        if (isNoIndex(body)) semanticIssues.push('published detail unexpectedly noindex');
        const canonicalPath = normalizedCanonicalPath(extractCanonical(body));
        if (canonicalPath !== test.canonical) semanticIssues.push(`canonical mismatch: ${canonicalPath || 'missing'} expected ${test.canonical}`);
      } else if (test.kind === 'hub') {
        if (!body.includes('المقاييس وأدوات التقييم')) semanticIssues.push('hub marker missing');
        if (isNoIndex(body)) semanticIssues.push('hub unexpectedly noindex');
      } else if (test.kind === 'compare') {
        for (const marker of ['نوع أداة القياس', 'استخدامات القياس', 'نوع الأداة']) if (!body.includes(marker)) semanticIssues.push(`compare marker missing: ${marker}`);
        if (isNoIndex(body)) semanticIssues.push('compare unexpectedly noindex');
      } else if (test.kind === 'methodology') {
        if (!body.includes('منهجية')) semanticIssues.push('methodology marker missing');
        if (isNoIndex(body)) semanticIssues.push('methodology unexpectedly noindex');
      } else if (test.kind === 'explicit-print') {
        if (!body.includes('العودة إلى دليل المقياس')) semanticIssues.push('print back-link missing');
        if (body.includes('ورقة توثيق عامة — ليست نموذج المقياس')) semanticIssues.push('explicit print route rendered as generic fallback');
      }

      const row = {
        path: test.path,
        kind: test.kind,
        attempt,
        status: response.status,
        ok: semanticIssues.length === 0,
        semanticIssues,
        elapsedMs: Date.now() - started,
        bytes: Buffer.byteLength(body),
        canonical: extractCanonical(body),
        cfRay: response.headers.get('cf-ray'),
        retryAfter: response.headers.get('retry-after'),
        cfCacheStatus: response.headers.get('cf-cache-status'),
      };
      attempts.push(row);
      console.log(`ASSESSMENT_MEASURES_LIVE_PROBE ${JSON.stringify(row)}`);
      if (row.ok) return { ok: true, attempts, last: row };
    } catch (error) {
      const row = {
        path: test.path,
        kind: test.kind,
        attempt,
        status: 0,
        ok: false,
        semanticIssues: [],
        elapsedMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      };
      attempts.push(row);
      console.log(`ASSESSMENT_MEASURES_LIVE_PROBE ${JSON.stringify(row)}`);
    } finally {
      clearTimeout(timeout);
    }
    await sleep(1800 * attempt);
  }
  return { ok: false, attempts, last: attempts.at(-1) };
}

const results = [];
for (const test of tests) {
  results.push({ test, result: await fetchWithRetry(test) });
  // Keep the sweep deliberately sequential. Cloudflare can emit empty transient 503s under bursts.
  await sleep(650);
}

const failures = results.filter(({ result }) => !result.ok);
const summary = {
  routes: tests.length,
  publishedMeasuresExpected: 83,
  publishedMeasuresProbed: publishedSlugs.length,
  passed: results.length - failures.length,
  failed: failures.length,
  totalFailedAttempts: results.flatMap(({ result }) => result.attempts).filter((row) => !row.ok).length,
  failures: failures.map(({ test, result }) => ({ path: test.path, last: result.last })),
};
console.log('ASSESSMENT_MEASURES_LIVE_SMOKE_SUMMARY');
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
