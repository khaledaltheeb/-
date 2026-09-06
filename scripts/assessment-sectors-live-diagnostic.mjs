const BASE = 'https://healthrenewal.org';
const routes = [
  '/assessment-measures/',
  '/assessment-measures/methodology/',
  '/assessment-measures/patient-health-questionnaire-9/',
  '/assessment-measures/patient-health-questionnaire-9/print/',
  '/assessment-measures/berg-balance-scale/',
  '/assessment-measures/category/mental-health/',
  '/assessment-lab/',
  '/assessment-lab/mood-daily/',
  '/assessment-lab/phq-9-plus/',
  '/cognitive-lab/',
  '/cognitive-lab/choice-reaction/',
  '/cognitive-lab/simple-reaction/',
  '/cognitive-lab/associative-context-binding/',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function probe(route, attempt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  const started = Date.now();
  try {
    const response = await fetch(`${BASE}${route}`, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Rawafid-Low-Load-Diagnostic/1.0' },
    });
    const body = await response.text();
    const elapsed = Date.now() - started;
    const row = {
      route,
      attempt,
      status: response.status,
      ok: response.ok,
      elapsedMs: elapsed,
      bytes: Buffer.byteLength(body),
      finalUrl: response.url,
      cfRay: response.headers.get('cf-ray'),
      retryAfter: response.headers.get('retry-after'),
      server: response.headers.get('server'),
      cacheStatus: response.headers.get('cf-cache-status'),
      contentType: response.headers.get('content-type'),
      internalServerError: /Internal Server Error/i.test(body),
      bodyPrefix: body.replace(/\s+/g, ' ').slice(0, 180),
    };
    console.log(`PROBE ${JSON.stringify(row)}`);
    return row;
  } catch (error) {
    const row = {
      route,
      attempt,
      status: 0,
      ok: false,
      elapsedMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
    console.log(`PROBE ${JSON.stringify(row)}`);
    return row;
  } finally {
    clearTimeout(timeout);
  }
}

const results = [];
for (const route of routes) {
  let last;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    last = await probe(route, attempt);
    results.push(last);
    if (last.ok && !last.internalServerError) break;
    await sleep(1500 * attempt);
  }
  await sleep(800);
}

const latest = new Map();
for (const row of results) latest.set(row.route, row);
const persistentFailures = [...latest.values()].filter((row) => !row.ok || row.internalServerError);
const transientFailures = results.filter((row) => !row.ok || row.internalServerError).length - persistentFailures.length;

console.log('DIAGNOSTIC_SUMMARY');
console.log(JSON.stringify({
  routes: routes.length,
  persistentFailureCount: persistentFailures.length,
  transientFailureAttempts: transientFailures,
  persistentFailures,
}, null, 2));

if (persistentFailures.length) process.exit(1);
