const BASE = 'https://healthrenewal.org';
const routes = [
  '/assessment-lab/',
  '/assessment-lab/avoidance-cycle/',
  '/assessment-lab/loneliness/',
  '/assessment-lab/mood-daily/',
  '/cognitive-lab/',
  '/cognitive-lab/prospective-memory-cues/',
  '/cognitive-lab/simple-reaction/',
  '/assessment-measures/',
  '/assessment-measures/patient-health-questionnaire-9/',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function probe(route, attempt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const started = Date.now();
  try {
    const response = await fetch(`${BASE}${route}`, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Rawafid-Isolated-503-Diagnostic/2.0',
        'Cache-Control': 'no-cache',
      },
    });
    const body = await response.text();
    const row = {
      route,
      attempt,
      status: response.status,
      ok: response.ok,
      elapsedMs: Date.now() - started,
      bytes: Buffer.byteLength(body),
      finalUrl: response.url,
      cfRay: response.headers.get('cf-ray'),
      retryAfter: response.headers.get('retry-after'),
      server: response.headers.get('server'),
      cacheStatus: response.headers.get('cf-cache-status'),
      contentType: response.headers.get('content-type'),
      internalServerError: /Internal Server Error|server-side exception/i.test(body),
      cloudflare503: response.status === 503 && /cloudflare/i.test(body),
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
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    last = await probe(route, attempt);
    results.push(last);
    if (last.ok && !last.internalServerError) break;
    await sleep(3000 * attempt);
  }
  await sleep(2500);
}

const latest = new Map();
for (const row of results) latest.set(row.route, row);
const persistentFailures = [...latest.values()].filter((row) => !row.ok || row.internalServerError);
const transientFailureAttempts = results.filter((row) => !row.ok || row.internalServerError).length - persistentFailures.length;

console.log('DIAGNOSTIC_SUMMARY');
console.log(JSON.stringify({
  routes: routes.length,
  persistentFailureCount: persistentFailures.length,
  transientFailureAttempts,
  persistentFailures,
}, null, 2));

if (persistentFailures.length) process.exit(1);
