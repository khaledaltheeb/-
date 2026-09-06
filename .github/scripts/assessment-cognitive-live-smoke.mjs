const BASE = 'https://healthrenewal.org';
const tests = [
  { path: '/assessment-lab/', require: ['اختبر نفسك'] },
  { path: '/assessment-lab/mood-daily/', require: ['متابعة المزاج اليومية', 'متابعة ذاتية · لا تشخيص'] },
  { path: '/assessment-lab/relationship-safety/', require: ['مؤشر الأمان في العلاقة', 'متابعة ذاتية · لا تشخيص'] },
  { path: '/assessment-lab/phq-9-plus/', require: ['PHQ-9 — استبيان صحة المريض', 'أداة مصدرية · توثيق قبل الاستخدام'] },
  { path: '/assessment-lab/mbi-source/', require: ['MBI — Maslach Burnout Inventory', 'أداة مصدرية · توثيق قبل الاستخدام'] },
  { path: '/cognitive-lab/', require: ['100 نشاط معرفي واضح', 'تعلم ذاتي · خصوصية بالتصميم', 'الأساس العلمي وحدود الاستدلال'] },
  { path: '/cognitive-lab/choice-reaction/', require: ['سرعة الاستجابة الاختيارية', 'تعليمي غير تشخيصي', 'اقرأ الأساس العلمي وحدود الاستدلال للمختبر'] },
  { path: '/cognitive-lab/stroop-basic/', require: ['مهمة ستروب الأساسية', 'تعليمي غير تشخيصي'] },
  { path: '/cognitive-lab/simon-conflict/', require: ['تعارض الموقع والاستجابة', 'تعليمي غير تشخيصي', 'توسعة بحثية 2026'] },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalize = (html) => html
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>');

async function probe(test) {
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
          'User-Agent': 'Rawafid-Assessment-Cognitive-Live-Smoke/1.1',
          'Cache-Control': 'no-cache',
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

      const row = {
        path: test.path,
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
      console.log(`LABS_LIVE_PROBE ${JSON.stringify(row)}`);
      if (row.ok) return { ok: true, attempts, last: row };
    } catch (error) {
      const row = {
        path: test.path,
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
    await sleep(2500 * attempt);
  }
  return { ok: false, attempts, last: attempts.at(-1) };
}

const results = [];
for (const test of tests) {
  results.push({ test, result: await probe(test) });
  await sleep(2200);
}

const failures = results.filter(({ result }) => !result.ok);
const summary = {
  routes: tests.length,
  passed: results.length - failures.length,
  failed: failures.length,
  failedAttempts: results.flatMap(({ result }) => result.attempts).filter((row) => !row.ok).length,
  failures: failures.map(({ test, result }) => ({ path: test.path, last: result.last })),
};
console.log('ASSESSMENT_COGNITIVE_LIVE_SMOKE_SUMMARY');
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exit(1);
