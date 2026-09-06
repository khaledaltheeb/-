import fs from 'node:fs';

const BASE = 'https://healthrenewal.org';
const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const instruments = JSON.parse(fs.readFileSync('data/assessment-lab/instruments.v1.json', 'utf8'));

const assessmentTests = [
  {
    path: '/assessment-lab/',
    require: [
      'اختبر نفسك',
      '<strong>60</strong> أداة متابعة محلية',
      '<strong>10</strong> صفحات أدوات مصدرية وحقوق',
      '<strong>70</strong> مسارًا منشورًا',
      'تمت المراجعة من قبل فريق روافد',
    ],
    canonicalPath: '/assessment-lab',
    expectIndexable: true,
    kind: 'assessment-hub',
  },
  ...monitors.map((row) => ({
    path: `/assessment-lab/${row.slug}/`,
    require: [
      row.title,
      'متابعة ذاتية · لا تشخيص',
      '<strong>16</strong> بندًا',
      'الملف العلمي للأداة',
      'خريطة الأدلة · Claim-to-evidence',
      'حدود الاستدلال:',
      'تمت المراجعة من قبل فريق روافد',
      'لا تحفظ بياناتك',
      'لا تجمع الإجابات في نسبة واحدة',
      'لا ينطبق / لم أجرّب',
    ],
    canonicalPath: `/assessment-lab/${row.slug}`,
    expectIndexable: true,
    kind: 'rawafid-monitor',
  })),
  ...instruments.map((row) => ({
    path: `/assessment-lab/${row.slug}/`,
    require: [
      row.title,
      'أداة مصدرية · توثيق قبل الاستخدام',
      'صفحة مصدر لا أداة تسجيل درجات',
      row.source,
      'تمت المراجعة من قبل فريق روافد',
    ],
    canonicalPath: `/assessment-lab/${row.slug}`,
    expectIndexable: true,
    kind: 'source-rights',
  })),
];

const cognitiveSentinels = [
  { path: '/cognitive-lab/', require: ['100 نشاط معرفي واضح', 'تعلم ذاتي · خصوصية بالتصميم', 'الأساس العلمي وحدود الاستدلال'], kind: 'cognitive-sentinel' },
  { path: '/cognitive-lab/choice-reaction/', require: ['سرعة الاستجابة الاختيارية', 'تعليمي غير تشخيصي', 'اقرأ الأساس العلمي وحدود الاستدلال للمختبر'], kind: 'cognitive-sentinel' },
  { path: '/cognitive-lab/stroop-basic/', require: ['مهمة ستروب الأساسية', 'تعليمي غير تشخيصي'], kind: 'cognitive-sentinel' },
];

const tests = [...assessmentTests, ...cognitiveSentinels];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const transientStatuses = new Set([0, 403, 408, 409, 425, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524]);
const normalize = (html) => html
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>');

function canonicalHref(body) {
  return body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1]
    ?? body.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i)?.[1]
    ?? null;
}

function hasNoindex(body) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(body)
    || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(body);
}

function normalizedUrlPath(value) {
  if (!value) return null;
  try {
    return new URL(value, BASE).pathname.replace(/\/$/, '') || '/';
  } catch {
    return null;
  }
}

function retryDelayMs(status, attempt) {
  if (transientStatuses.has(status)) {
    return [2500, 6000, 12000, 22000, 0][attempt - 1] ?? 0;
  }
  return [1500, 3000, 5000, 8000, 0][attempt - 1] ?? 0;
}

async function probe(test) {
  const attempts = [];
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const started = Date.now();
    try {
      const response = await fetch(`${BASE}${test.path}`, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Rawafid-Assessment-Cognitive-Live-Smoke/2.2',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
      const rawBody = await response.text();
      const body = normalize(rawBody);
      const issues = [];
      if (response.status !== 200) issues.push(`HTTP ${response.status}`);
      if (/Internal Server Error|server-side exception|Application error/i.test(body)) issues.push('server error marker');
      if (Buffer.byteLength(rawBody) < 1000) issues.push(`small body: ${Buffer.byteLength(rawBody)} bytes`);
      for (const required of test.require ?? []) if (!body.includes(required)) issues.push(`missing text: ${required}`);

      const canonical = canonicalHref(body);
      if (test.canonicalPath) {
        const actualCanonicalPath = normalizedUrlPath(canonical);
        const expectedCanonicalPath = test.canonicalPath.replace(/\/$/, '') || '/';
        if (actualCanonicalPath !== expectedCanonicalPath) issues.push(`canonical mismatch: ${canonical ?? 'missing'} expected ${expectedCanonicalPath}`);
      }
      if (test.expectIndexable && hasNoindex(body)) issues.push('unexpected noindex');

      const row = {
        path: test.path,
        kind: test.kind,
        attempt,
        status: response.status,
        ok: issues.length === 0,
        issues,
        elapsedMs: Date.now() - started,
        bytes: Buffer.byteLength(rawBody),
        canonical,
        cfRay: response.headers.get('cf-ray'),
        cfCacheStatus: response.headers.get('cf-cache-status'),
        retryAfter: response.headers.get('retry-after'),
      };
      attempts.push(row);
      console.log(`LABS_LIVE_PROBE ${JSON.stringify(row)}`);
      if (row.ok) return { ok: true, attempts, last: row };
    } catch (error) {
      const row = {
        path: test.path,
        kind: test.kind,
        attempt,
        status: 0,
        ok: false,
        issues: [error instanceof Error ? error.message : String(error)],
        elapsedMs: Date.now() - started,
      };
      attempts.push(row);
      console.log(`LABS_LIVE_PROBE ${JSON.stringify(row)}`);
    } finally {
      clearTimeout(timeout);
    }

    if (attempt < 5) {
      const status = attempts.at(-1)?.status ?? 0;
      const delay = retryDelayMs(status, attempt);
      console.log(`LABS_LIVE_BACKOFF ${JSON.stringify({ path: test.path, status, attempt, delayMs: delay })}`);
      await sleep(delay);
    }
  }
  return { ok: false, attempts, last: attempts.at(-1) };
}

async function probeOfficialSource(instrument) {
  const attempts = [];
  const accessRestrictedStatuses = new Set([401, 403, 405, 429]);
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const started = Date.now();
    try {
      const response = await fetch(instrument.sourceUrl, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Rawafid-Assessment-Source-Health/1.0',
          Accept: 'text/html,application/xhtml+xml,application/pdf;q=0.8,*/*;q=0.5',
        },
      });
      const restricted = accessRestrictedStatuses.has(response.status);
      const dead = response.status === 404 || response.status === 410;
      const retryable = response.status === 0 || response.status === 408 || response.status >= 500;
      const ok = !dead && (response.ok || (response.status >= 300 && response.status < 400) || restricted);
      const row = {
        slug: instrument.slug,
        source: instrument.source,
        url: instrument.sourceUrl,
        attempt,
        status: response.status,
        ok,
        restricted,
        retryable,
        elapsedMs: Date.now() - started,
        finalUrl: response.url,
      };
      attempts.push(row);
      console.log(`ASSESSMENT_SOURCE_PROBE ${JSON.stringify(row)}`);
      if (ok || dead || !retryable) return { ok, attempts, last: row };
    } catch (error) {
      const row = {
        slug: instrument.slug,
        source: instrument.source,
        url: instrument.sourceUrl,
        attempt,
        status: 0,
        ok: false,
        restricted: false,
        retryable: true,
        elapsedMs: Date.now() - started,
        issue: error instanceof Error ? error.message : String(error),
      };
      attempts.push(row);
      console.log(`ASSESSMENT_SOURCE_PROBE ${JSON.stringify(row)}`);
    } finally {
      clearTimeout(timeout);
    }
    if (attempt < 3) await sleep(2500 * attempt);
  }
  return { ok: false, attempts, last: attempts.at(-1) };
}

const results = [];
for (let index = 0; index < tests.length; index += 1) {
  const test = tests[index];
  results.push({ test, result: await probe(test) });
  await sleep(900);
  // Give the Worker/POP a real cooldown during a broad audit so the audit itself
  // does not manufacture burst-related 503/52x responses.
  if ((index + 1) % 12 === 0 && index + 1 < tests.length) {
    console.log(`LABS_LIVE_BATCH_COOLDOWN ${JSON.stringify({ completed: index + 1, delayMs: 5000 })}`);
    await sleep(5000);
  }
}

const sourceResults = [];
for (const instrument of instruments) {
  sourceResults.push({ instrument, result: await probeOfficialSource(instrument) });
  await sleep(750);
}

const failures = results.filter(({ result }) => !result.ok);
const sourceFailures = sourceResults.filter(({ result }) => !result.ok);
const assessmentResults = results.filter(({ test }) => test.kind?.startsWith('assessment') || test.kind === 'rawafid-monitor' || test.kind === 'source-rights');
const assessmentFailures = assessmentResults.filter(({ result }) => !result.ok);
const transientAttempts = results
  .flatMap(({ result }) => result.attempts)
  .filter((row) => transientStatuses.has(row.status));

const summary = {
  routes: tests.length,
  passed: results.length - failures.length,
  failed: failures.length,
  assessmentLab: {
    expectedPublicDetailRoutes: 70,
    testedRoutesIncludingHub: assessmentResults.length,
    passed: assessmentResults.length - assessmentFailures.length,
    failed: assessmentFailures.length,
    officialSourcesTested: sourceResults.length,
    officialSourcesHealthyOrAccessRestricted: sourceResults.length - sourceFailures.length,
    officialSourcesFailed: sourceFailures.length,
  },
  failedAttempts: results.flatMap(({ result }) => result.attempts).filter((row) => !row.ok).length,
  transientAttempts: transientAttempts.length,
  failures: failures.map(({ test, result }) => ({ path: test.path, kind: test.kind, last: result.last, attempts: result.attempts })),
  sourceFailures: sourceFailures.map(({ instrument, result }) => ({ slug: instrument.slug, url: instrument.sourceUrl, last: result.last })),
};
console.log('ASSESSMENT_COGNITIVE_LIVE_SMOKE_SUMMARY');
console.log(JSON.stringify(summary, null, 2));
if (failures.length || sourceFailures.length) process.exit(1);
