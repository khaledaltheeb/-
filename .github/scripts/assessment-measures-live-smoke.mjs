const BASE = 'https://healthrenewal.org';
const tests = [
  { path: '/assessment-measures/', kind: 'index' },
  { path: '/assessment-measures/patient-health-questionnaire-9/', kind: 'explicit-control' },
  { path: '/assessment-measures/patient-health-questionnaire-9/print/', kind: 'explicit-print' },
  { path: '/assessment-measures/chart-short-form/', kind: 'explicit-final' },
  { path: '/assessment-measures/combat-exposure-scale/', kind: 'explicit-final' },
  { path: '/assessment-measures/deployment-risk-resilience-inventory-2/', kind: 'explicit-final' },
  { path: '/assessment-measures/expanded-drs-postacute-interview-survivor/', kind: 'explicit-final' },
  { path: '/assessment-measures/expanded-drs-postacute-interview-caregiver/', kind: 'explicit-final' },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
          'User-Agent': 'Rawafid-Assessment-Measures-Live-Smoke/1.1',
          'Cache-Control': 'no-cache',
        },
      });
      const body = await response.text();
      const httpOk = response.status === 200 && !/Internal Server Error|server-side exception|Application error/i.test(body);
      const semanticIssues = [];
      if (test.kind === 'explicit-print') {
        if (!body.includes('العودة إلى دليل المقياس')) semanticIssues.push('print back-link missing');
        if (body.includes('ورقة توثيق عامة — ليست نموذج المقياس')) semanticIssues.push('explicit print route rendered as generic fallback');
        if (body.includes('لم تُنشر مادة تشغيلية صريحة بعد')) semanticIssues.push('explicit print route reports no explicit material');
      } else if (test.kind !== 'index') {
        if (!body.includes('فتح المادة التشغيلية')) semanticIssues.push('explicit operational CTA missing');
        if (!body.includes('المقياس / المادة التشغيلية')) semanticIssues.push('explicit operational heading missing');
        if (body.includes('ورقة توثيق عامة — ليست نموذج المقياس')) semanticIssues.push('explicit route rendered as generic fallback');
        if (body.includes('لم تُنشر مادة تشغيلية صريحة بعد')) semanticIssues.push('explicit route reports no explicit material');
      }
      const row = {
        path: test.path,
        attempt,
        status: response.status,
        ok: httpOk && semanticIssues.length === 0,
        semanticIssues,
        elapsedMs: Date.now() - started,
        bytes: Buffer.byteLength(body),
        cfRay: response.headers.get('cf-ray'),
        retryAfter: response.headers.get('retry-after'),
        server: response.headers.get('server'),
      };
      attempts.push(row);
      console.log(`ASSESSMENT_LIVE_PROBE ${JSON.stringify(row)}`);
      if (row.ok) return { ok: true, attempts, last: row };
    } catch (error) {
      const row = {
        path: test.path,
        attempt,
        status: 0,
        ok: false,
        semanticIssues: [],
        elapsedMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      };
      attempts.push(row);
      console.log(`ASSESSMENT_LIVE_PROBE ${JSON.stringify(row)}`);
    } finally {
      clearTimeout(timeout);
    }
    await sleep(2500 * attempt);
  }
  return { ok: false, attempts, last: attempts.at(-1) };
}

const results = [];
for (const test of tests) {
  results.push({ test, result: await fetchWithRetry(test) });
  // Deliberately slow: broad concurrent sweeps previously produced transient Cloudflare 503 responses.
  await sleep(2500);
}

const failures = results.filter(({ result }) => !result.ok);
const summary = {
  routes: tests.length,
  passed: results.length - failures.length,
  failed: failures.length,
  totalFailedAttempts: results.flatMap(({ result }) => result.attempts).filter((row) => !row.ok).length,
  failures: failures.map(({ test, result }) => ({ path: test.path, last: result.last })),
};
console.log('ASSESSMENT_MEASURES_LIVE_SMOKE_SUMMARY');
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
