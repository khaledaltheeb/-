const BASE = 'https://healthrenewal.org';
const routes = [
  '/assessment-lab/',
  '/assessment-lab/avoidance-cycle/',
  '/assessment-lab/loneliness/',
  '/cognitive-lab/',
  '/cognitive-lab/prospective-memory-cues/',
  '/assessment-measures/',
  '/assessment-measures/patient-health-questionnaire-9/',
  '/assessment-measures/framingham-cvd-10-year-risk/',
  '/assessment-measures/framingham-cvd-10-year-risk/print/',
  '/assessment-measures/atlas-cdi-score/',
  '/assessment-measures/hamilton-depression-rating-scale-24/',
  '/assessment-measures/apache-ii/',
  '/assessment-measures/apache-ii/print/',
];

const explicitOperationalRoutes = new Set([
  '/assessment-measures/patient-health-questionnaire-9/',
  '/assessment-measures/framingham-cvd-10-year-risk/',
  '/assessment-measures/atlas-cdi-score/',
  '/assessment-measures/hamilton-depression-rating-scale-24/',
]);
const explicitPrintRoutes = new Set([
  '/assessment-measures/framingham-cvd-10-year-risk/print/',
]);
const fallbackRoutes = new Set([
  '/assessment-measures/apache-ii/',
  '/assessment-measures/apache-ii/print/',
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function semanticFailures(route, body) {
  const failures = [];
  if (explicitOperationalRoutes.has(route)) {
    if (!body.includes('فتح المادة التشغيلية')) failures.push('explicit operational CTA missing');
    if (body.includes('ورقة توثيق عامة — ليست نموذج المقياس')) failures.push('explicit route incorrectly rendered as generic fallback');
  }
  if (explicitPrintRoutes.has(route)) {
    if (body.includes('ورقة توثيق عامة — ليست نموذج المقياس')) failures.push('explicit print route incorrectly rendered as generic fallback');
  }
  if (fallbackRoutes.has(route)) {
    if (!body.includes('ورقة توثيق عامة — ليست نموذج المقياس')) failures.push('fallback disclosure missing');
    if (route.endsWith('/print/') && !body.includes('لا تتضمن بنود المقياس الأصلي')) failures.push('fallback print safety disclosure missing');
  }
  return failures;
}

async function probe(route, attempt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const started = Date.now();
  try {
    const response = await fetch(`${BASE}${route}`, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Rawafid-Isolated-Assessment-Production-Diagnostic/3.0',
        'Cache-Control': 'no-cache',
      },
    });
    const body = await response.text();
    const semantic = response.ok ? semanticFailures(route, body) : [];
    const row = {
      route,
      attempt,
      status: response.status,
      ok: response.ok && semantic.length === 0,
      httpOk: response.ok,
      semantic,
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
      httpOk: false,
      semantic: [],
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
