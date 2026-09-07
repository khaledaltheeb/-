const BASE = process.env.COGNITIVE_TESTS_SMOKE_BASE || 'https://healthrenewal.org';

const routes = [
  { path: '/cognitive-tests/', canonical: '/cognitive-lab', markers: ['ثماني مهام معرفية قديمة محفوظة', 'Cognitive Lab'] },
  { path: '/cognitive-tests/digit-span/', canonical: '/cognitive-lab/digit-span-forward', markers: ['المهمة الفعلية مفعّلة', 'لا توجد درجة ذكاء', 'المرجع الحالي: Cognitive Lab'] },
  { path: '/cognitive-tests/matrix-reasoning/', canonical: '/cognitive-lab/matrix-patterns', markers: ['المهمة الفعلية مفعّلة', 'لا يوجد تشخيص', 'المرجع الحالي: Cognitive Lab'] },
  { path: '/cognitive-tests/n-back/', canonical: '/cognitive-lab/two-back', markers: ['المهمة الفعلية مفعّلة', 'لا توجد درجة ذكاء', 'المرجع الحالي: Cognitive Lab'] },
  { path: '/cognitive-tests/number-series/', canonical: '/cognitive-lab/number-series', markers: ['المهمة الفعلية مفعّلة', 'لا يوجد تشخيص', 'المرجع الحالي: Cognitive Lab'] },
  { path: '/cognitive-tests/reaction-time/', canonical: '/cognitive-lab/simple-reaction', markers: ['المهمة الفعلية مفعّلة', 'لا توجد درجة ذكاء', 'المرجع الحالي: Cognitive Lab'] },
  { path: '/cognitive-tests/spatial-rotation/', canonical: '/cognitive-lab/mental-rotation', markers: ['المهمة الفعلية مفعّلة', 'لا يوجد تشخيص', 'المرجع الحالي: Cognitive Lab'] },
  { path: '/cognitive-tests/stroop/', canonical: '/cognitive-lab/stroop-basic', markers: ['المهمة الفعلية مفعّلة', 'لا توجد درجة ذكاء', 'المرجع الحالي: Cognitive Lab'] },
  { path: '/cognitive-tests/verbal-analogies/', canonical: '/cognitive-lab/verbal-analogy', markers: ['المهمة الفعلية مفعّلة', 'لا يوجد تشخيص', 'المرجع الحالي: Cognitive Lab'] },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function extractCanonical(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return match?.[1] || null;
}

function hasNoIndex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
    || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
}

async function probe(route) {
  let last = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const started = Date.now();
    try {
      const response = await fetch(`${BASE}${route.path}`, {
        headers: { 'user-agent': 'HealthRenewal-CognitiveTests-Smoke/1.0', 'cache-control': 'no-cache' },
        redirect: 'follow',
        signal: AbortSignal.timeout(30000),
      });
      const html = await response.text();
      const canonical = extractCanonical(html);
      const issues = [];
      if (response.status !== 200) issues.push(`HTTP ${response.status}`);
      if (html.length < 2000) issues.push(`small body: ${html.length}`);
      for (const marker of route.markers) if (!html.includes(marker)) issues.push(`missing marker: ${marker}`);
      if (!hasNoIndex(html)) issues.push('missing noindex');
      if (!canonical || !canonical.endsWith(route.canonical)) issues.push(`canonical mismatch: ${canonical || 'missing'}`);
      last = { path: route.path, attempt, status: response.status, ok: issues.length === 0, issues, elapsedMs: Date.now() - started, canonical, cfRay: response.headers.get('cf-ray') };
      console.log('COGNITIVE_TESTS_LIVE_PROBE', JSON.stringify(last));
      if (last.ok) return last;
    } catch (error) {
      last = { path: route.path, attempt, status: null, ok: false, issues: [String(error)], elapsedMs: Date.now() - started };
      console.log('COGNITIVE_TESTS_LIVE_PROBE', JSON.stringify(last));
    }
    await sleep(1200 * attempt);
  }
  return last;
}

const results = [];
for (const route of routes) {
  results.push(await probe(route));
  await sleep(500);
}
const failures = results.filter((result) => !result?.ok);
console.log('COGNITIVE_TESTS_LIVE_SMOKE_SUMMARY');
console.log(JSON.stringify({ routes: routes.length, passed: results.length - failures.length, failed: failures.length, failures }, null, 2));
if (failures.length) process.exit(1);
