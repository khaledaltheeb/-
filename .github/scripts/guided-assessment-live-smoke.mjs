import fs from 'node:fs';

const BASE = 'https://healthrenewal.org';
const topics = JSON.parse(fs.readFileSync('data/guided-assessment/topics.v1.json', 'utf8'));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

function normalizedPath(value) {
  if (!value) return null;
  try {
    return new URL(value, BASE).pathname.replace(/\/$/, '') || '/';
  } catch {
    return null;
  }
}

const tests = [
  {
    path: '/guided-assessment/',
    kind: 'hub',
    expectNoindex: false,
    canonicalPath: '/guided-assessment',
    require: [
      'الأسئلة الاسترشادية',
      '<strong>50</strong> موضوعًا',
      '<strong>100</strong> رابط تاريخي محفوظ',
      '0</strong> درجات تشخيصية',
      '0</strong> إجابات تُرسل للخادم',
    ],
  },
  ...topics.flatMap((topic, topicIndex) => ['adult', 'child'].map((audience, audienceIndex) => {
    const number = topicIndex * 2 + audienceIndex + 1;
    const slug = `questions-${String(number).padStart(3, '0')}`;
    return {
      path: `/guided-assessment/${slug}/`,
      kind: audience,
      expectNoindex: true,
      canonicalPath: '/guided-assessment',
      require: [
        topic.label,
        'تركيز خاص بالموضوع',
        'حدود التفسير',
        'المراجع المرتبطة بهذا الموضوع والمنهج',
        'متى لا تنتظر استكمال القائمة؟',
        'لا يوجد مجموع نقاط ولا نتيجة آلية',
      ],
    };
  })),
];

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
          'User-Agent': 'Rawafid-Guided-Assessment-Live-Smoke/1.0',
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
      for (const required of test.require) if (!body.includes(required)) issues.push(`missing text: ${required}`);
      const canonical = canonicalHref(body);
      const canonicalPath = normalizedPath(canonical);
      if (canonicalPath !== test.canonicalPath) issues.push(`canonical mismatch: ${canonical ?? 'missing'} expected ${test.canonicalPath}`);
      const noindex = hasNoindex(body);
      if (test.expectNoindex && !noindex) issues.push('historical alias unexpectedly indexable');
      if (!test.expectNoindex && noindex) issues.push('hub unexpectedly noindex');

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
      };
      attempts.push(row);
      console.log(`GUIDED_ASSESSMENT_LIVE_PROBE ${JSON.stringify(row)}`);
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
      console.log(`GUIDED_ASSESSMENT_LIVE_PROBE ${JSON.stringify(row)}`);
    } finally {
      clearTimeout(timeout);
    }
    await sleep(attempt >= 4 ? 9000 : 2200 * attempt);
  }
  return { ok: false, attempts, last: attempts.at(-1) };
}

const results = [];
for (let index = 0; index < tests.length; index += 1) {
  const test = tests[index];
  results.push({ test, result: await probe(test) });
  await sleep(850);
  if ((index + 1) % 20 === 0) await sleep(5000);
}

const failures = results.filter(({ result }) => !result.ok);
const summary = {
  routes: tests.length,
  passed: tests.length - failures.length,
  failed: failures.length,
  hubPassed: results[0]?.result.ok === true,
  preservedAliasesExpected: 100,
  preservedAliasesPassed: results.slice(1).filter(({ result }) => result.ok).length,
  failedAttempts: results.flatMap(({ result }) => result.attempts).filter((row) => !row.ok).length,
  failures: failures.map(({ test, result }) => ({ path: test.path, kind: test.kind, last: result.last })),
};
console.log('GUIDED_ASSESSMENT_LIVE_SMOKE_SUMMARY');
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
