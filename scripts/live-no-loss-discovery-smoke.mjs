const base = (process.env.RAWAFID_BASE_URL || 'https://healthrenewal.org').replace(/\/$/, '');
const stamp = process.env.DEPLOY_SHA || process.env.GITHUB_SHA || `manual-${Date.now()}`;
const attempts = Number(process.env.LIVE_SMOKE_ATTEMPTS || 5);
const timeoutMs = Number(process.env.LIVE_SMOKE_TIMEOUT_MS || 30000);

const pages = [
  // The homepage is already protected by the production deploy smoke and does not
  // currently emit a self-canonical link. Keep it in this no-loss sweep for live
  // content/indexability/error checks, but reserve canonical ownership assertions
  // for the reviewed discovery routes below.
  { path: '/', canonical: `${base}/`, marker: 'كل أدوات روافد في منطقة واحدة', requireCanonical: false },
  { path: '/all-pages', canonical: `${base}/all-pages`, marker: 'فهرس المحتوى المنشور' },
  { path: '/institutions', canonical: `${base}/institutions`, marker: 'العربية ليست طبقة ترجمة أخيرة' },
  { path: '/en/institutions', canonical: `${base}/en/institutions`, marker: 'Arabic quality is more than translation' },
  { path: '/institutions/arabic-rtl-assurance', canonical: `${base}/institutions/arabic-rtl-assurance`, marker: 'اختبار العربية كما يستخدمها الناس' },
  { path: '/institutions/terminology-qa', canonical: `${base}/institutions/terminology-qa`, marker: 'حوّل دليل المصطلحات' },
  { path: '/institutions/open-source', canonical: `${base}/institutions/open-source`, marker: 'نواة عامة يمكن لأي مشروع استخدامها' },
  { path: '/institutions/technology-evaluation', canonical: `${base}/institutions/technology-evaluation`, marker: 'نقيّم التقنية قبل أن نحولها إلى توصية أو pilot' },
  { path: '/institutions/patient-participation', canonical: `${base}/institutions/patient-participation`, marker: 'من «لدي موعد» إلى مسار يمكن للمستخدم متابعته بنفسه' },
  { path: '/media/', canonical: `${base}/media/`, marker: 'مركز الوسائط والمواد العملية' },
  { path: '/external-review/', canonical: `${base}/external-review/`, marker: 'برنامج المراجعة الخارجية' },
  { path: '/external-review/addiction-safety/', canonical: `${base}/external-review/addiction-safety`, marker: 'حزمة المراجعة الخارجية لسلامة محتوى الإدمان' },
  { path: '/external-review/reviewer-governance/', canonical: `${base}/external-review/reviewer-governance`, marker: 'ما الذي يجب أن يعرفه المراجع الخارجي قبل قبول أي حزمة من روافد' },
  { path: '/accessibility-statement', canonical: `${base}/accessibility-statement`, marker: 'بيان الإتاحة والوصول الرقمي' },
];

const historicalRoutes = [
  { path: '/sectors/all-pages/', canonical: `${base}/sectors/all-pages/` },
];

const errorBody = /internal server error|application error|500 internal|worker exceeded resource limits/i;
const robotsNoindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function canonicalPresent(html, canonical) {
  const target = escapeRegex(canonical);
  return new RegExp(`<link[^>]+rel=["']canonical["'][^>]+href=["']${target}["']`, 'i').test(html)
    || new RegExp(`<link[^>]+href=["']${target}["'][^>]+rel=["']canonical["']`, 'i').test(html);
}

function withStamp(path) {
  const url = new URL(path, `${base}/`);
  url.searchParams.set('deploy', stamp);
  return url.toString();
}

async function fetchText(path) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(withStamp(path), {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'cache-control': 'no-cache, no-store, max-age=0',
          pragma: 'no-cache',
          'user-agent': 'Rawafid-Live-No-Loss-Smoke/1.2',
        },
      });
      const text = await response.text();
      if (response.status >= 200 && response.status < 300) return { response, text };
      lastError = new Error(`${path} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timer);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
  }
  throw lastError || new Error(`${path} failed without a response`);
}

function assertHealthyHtml(path, html) {
  if (html.length < 200) throw new Error(`${path} returned an unexpectedly small HTML body (${html.length} bytes)`);
  if (errorBody.test(html)) throw new Error(`${path} returned an application/server error body`);
}

async function verifyPage(entry) {
  const { response, text } = await fetchText(entry.path);
  assertHealthyHtml(entry.path, text);
  if (!text.includes(entry.marker)) throw new Error(`${entry.path} is missing expected marker: ${entry.marker}`);
  if (entry.requireCanonical !== false && !canonicalPresent(text, entry.canonical)) {
    throw new Error(`${entry.path} is missing self-canonical ${entry.canonical}`);
  }
  if (robotsNoindex.test(text)) throw new Error(`${entry.path} unexpectedly renders a robots noindex meta tag`);
  console.log(`LIVE_NO_LOSS_OK page ${entry.path} HTTP ${response.status}`);
}

async function verifyHistorical(entry) {
  const { response, text } = await fetchText(entry.path);
  assertHealthyHtml(entry.path, text);
  if (!canonicalPresent(text, entry.canonical)) throw new Error(`${entry.path} historical compatibility route lost self-canonical ${entry.canonical}`);
  console.log(`LIVE_NO_LOSS_OK historical ${entry.path} HTTP ${response.status}`);
}

async function verifySitemaps() {
  const index = await fetchText('/sitemap.xml');
  if (!index.text.includes(`${base}/sitemaps/discovery.xml`)) throw new Error('sitemap index is missing /sitemaps/discovery.xml');
  if (errorBody.test(index.text)) throw new Error('sitemap index returned an error body');

  const discovery = await fetchText('/sitemaps/discovery.xml');
  if (errorBody.test(discovery.text)) throw new Error('discovery sitemap returned an error body');
  const reviewed = pages.filter((item) => item.path !== '/');
  for (const entry of reviewed) {
    if (!discovery.text.includes(`<loc>${entry.canonical}</loc>`)) {
      throw new Error(`discovery sitemap is missing ${entry.canonical}`);
    }
  }
  const urlCount = (discovery.text.match(/<url>/g) || []).length;
  if (urlCount !== reviewed.length) throw new Error(`discovery sitemap must expose exactly ${reviewed.length} reviewed routes; found ${urlCount}`);
  console.log(`LIVE_NO_LOSS_OK sitemap index + ${reviewed.length}-route discovery sitemap`);
}

try {
  for (const page of pages) await verifyPage(page);
  for (const route of historicalRoutes) await verifyHistorical(route);
  await verifySitemaps();
  console.log(`LIVE_NO_LOSS_COMPLETE ${pages.length} current pages + ${historicalRoutes.length} historical route verified on ${base}`);
} catch (error) {
  console.error(`LIVE_NO_LOSS_FAIL ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
