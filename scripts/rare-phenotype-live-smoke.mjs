const base = (process.env.RAWAFID_BASE_URL || 'https://healthrenewal.org').replace(/\/$/, '');
const stamp = process.env.DEPLOY_SHA || process.env.GITHUB_SHA || `manual-${Date.now()}`;
const attempts = Number(process.env.LIVE_SMOKE_ATTEMPTS || 5);
const timeoutMs = Number(process.env.LIVE_SMOKE_TIMEOUT_MS || 30000);
const routePath = '/tools/rare-phenotype-navigator';
const routeUrl = `${base}${routePath}`;
const pavsSourceUrl = 'https://pavs.phenomebrowser.net/';
const errorBody = /internal server error|application error|500 internal|worker exceeded resource limits/i;

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function targetUrl(path, cacheBust = true) {
  const url = new URL(path, `${base}/`);
  if (cacheBust) url.searchParams.set('deploy', stamp);
  return url.toString();
}

async function fetchAttempt(path, options = {}, cacheBust = true) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(targetUrl(path, cacheBust), {
      redirect: 'manual', cache: 'no-store', ...options, signal: controller.signal,
      headers: {
        'cache-control': 'no-cache, no-store, max-age=0', pragma: 'no-cache',
        'user-agent': 'Rawafid-Rare-Phenotype-Live-Smoke/1.0', ...(options.headers || {}),
      },
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timer);
  }
}

async function request(path, options = {}, cacheBust = true) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await fetchAttempt(path, options, cacheBust);
      if (result.response.status >= 200 && result.response.status < 300) return result;
      lastError = new Error(`${path} returned HTTP ${result.response.status}: ${result.text.slice(0, 300)}`);
    } catch (error) { lastError = error; }
    await sleep(attempt * 1200);
  }
  throw lastError || new Error(`${path} failed without a response`);
}

function assertHealthyBody(path, text, minimum = 200) {
  if (text.length < minimum) throw new Error(`${path} returned an unexpectedly small body (${text.length} bytes)`);
  if (errorBody.test(text)) throw new Error(`${path} returned an application/server error body`);
}

function parseJson(path, text) {
  try { return JSON.parse(text); }
  catch { throw new Error(`${path} returned non-JSON response: ${text.slice(0, 300)}`); }
}

function assertRobotsNoindexFollow(html) {
  const tags = [...html.matchAll(/<meta[^>]+name=["']robots["'][^>]*>/gi)].map((match) => match[0]);
  if (!tags.length) throw new Error(`${routePath} is missing a robots meta tag`);
  const content = tags.join(' ').toLowerCase();
  if (!content.includes('noindex')) throw new Error(`${routePath} must remain noindex during pre-release QA`);
  if (!content.includes('follow')) throw new Error(`${routePath} must remain follow during pre-release QA`);
}

function assertCanonical(html) {
  const escaped = routeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const canonical = new RegExp(`<link[^>]+rel=["']canonical["'][^>]+href=["']${escaped}["']`, 'i');
  const reverse = new RegExp(`<link[^>]+href=["']${escaped}["'][^>]+rel=["']canonical["']`, 'i');
  if (!canonical.test(html) && !reverse.test(html)) throw new Error(`${routePath} is missing self-canonical ${routeUrl}`);
}

async function verifyPage() {
  const { response, text } = await request(routePath);
  assertHealthyBody(routePath, text, 500);
  for (const marker of ['حوّل الوصف السريري إلى ملف HPO قابل للتحليل وإعادة الاستخدام', 'ليست أداة تشخيص ذاتي', 'Triangulation بدل درجة واحدة']) {
    if (!text.includes(marker)) throw new Error(`${routePath} is missing expected marker: ${marker}`);
  }
  assertRobotsNoindexFollow(text); assertCanonical(text);
  console.log(`RARE_PHENOTYPE_LIVE_OK page ${routePath} HTTP ${response.status} noindex/follow canonical`);
}

async function verifySitemapExclusion() {
  const sitemapIndex = await request('/sitemap.xml', {}, false);
  assertHealthyBody('/sitemap.xml', sitemapIndex.text, 50);
  if (sitemapIndex.text.includes(routeUrl) || sitemapIndex.text.includes(routePath)) throw new Error(`${routePath} appeared directly in sitemap index during pre-release QA`);
  const childSitemaps = [...sitemapIndex.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim()).filter((url) => url.startsWith(base));
  for (const sitemapUrl of childSitemaps) {
    const url = new URL(sitemapUrl);
    const { text } = await request(`${url.pathname}${url.search}`, {}, false);
    assertHealthyBody(url.pathname, text, 20);
    if (text.includes(routeUrl) || text.includes(`<loc>${routeUrl}/</loc>`)) throw new Error(`${routePath} appeared in live sitemap ${url.pathname} before release approval`);
  }
  console.log(`RARE_PHENOTYPE_LIVE_OK sitemap exclusion checked across ${childSitemaps.length} canonical child sitemap(s)`);
}

async function verifyTerms() {
  const { text } = await request('/api/rare-phenotype/terms?q=HP%3A0001250');
  const data = parseJson('/api/rare-phenotype/terms', text);
  if (data.source !== 'PAVS Arabic HPO') throw new Error('terms API lost PAVS Arabic HPO provenance');
  if (!Array.isArray(data.results)) throw new Error('terms API results is not an array');
  if (!data.results.some((item) => item && item.id === 'HP:0001250')) throw new Error('terms API did not resolve test HPO identifier HP:0001250');
  console.log(`RARE_PHENOTYPE_LIVE_OK terms HP:0001250 results=${data.results.length}`);
}

async function postJson(path, body) {
  const { text } = await request(path, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(body) });
  return parseJson(path, text);
}

async function verifyMonarchRank() {
  const data = await postJson('/api/rare-phenotype/rank', { phenotypes: ['HP:0001250'], group: 'Human Diseases', limit: 3 });
  if (!Array.isArray(data.phenotypes) || !data.phenotypes.includes('HP:0001250')) throw new Error('rank API did not preserve the HPO-only test profile');
  if (data.source !== 'Monarch Initiative v3 semantic similarity') throw new Error('rank API lost Monarch v3 provenance');
  if (!Object.prototype.hasOwnProperty.call(data, 'results')) throw new Error('rank API response is missing results');
  console.log('RARE_PHENOTYPE_LIVE_OK Monarch semantic ranking');
}

async function verifyPavs() {
  const path = '/api/rare-phenotype/pavs';
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ hpoIds: ['HP:0001250'], method: 'lin', limit: 10, includeSaudi: true, includeDDD: false, includeLiterature: true, onlyDiagnosed: false }),
  };
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { last = await fetchAttempt(path, options, true); }
    catch (error) {
      if (attempt === attempts) throw error;
      await sleep(attempt * 1200);
      continue;
    }
    if (last.response.status >= 200 && last.response.status < 300) {
      const data = parseJson(path, last.text);
      if (data.source !== 'PAVS') throw new Error('PAVS API lost source provenance');
      if (!Array.isArray(data.items)) throw new Error('PAVS API items is not an array');
      if (!data.query || !Array.isArray(data.query.hpo_ids) || !data.query.hpo_ids.includes('HP:0001250')) throw new Error('PAVS API did not preserve the HPO-only test query');
      console.log(`RARE_PHENOTYPE_LIVE_OK PAVS similar-case search items=${data.items.length}`);
      return;
    }
    if (last.response.status === 502) {
      const data = parseJson(path, last.text);
      const knownUpstreamFailure = ['pavs_source_unavailable', 'pavs_source_timeout', 'pavs_source_error'].includes(data.error)
        && data.source_url === pavsSourceUrl;
      if (knownUpstreamFailure) {
        console.warn(`RARE_PHENOTYPE_LIVE_DEGRADED PAVS upstream unavailable error=${data.error} upstream_status=${data.upstream_status ?? 'n/a'} source=${data.source_url}`);
        return;
      }
    }
    if (attempt < attempts) await sleep(attempt * 1200);
  }
  throw new Error(`${path} returned unexpected HTTP ${last?.response.status}: ${last?.text?.slice(0, 300) || 'no response'}`);
}

try {
  await verifyPage(); await verifySitemapExclusion(); await verifyTerms(); await verifyMonarchRank(); await verifyPavs();
  console.log(`RARE_PHENOTYPE_LIVE_COMPLETE ${routeUrl} verified without PII using HP:0001250 only`);
} catch (error) {
  console.error(`RARE_PHENOTYPE_LIVE_FAIL ${error instanceof Error ? error.message : String(error)}`); process.exit(1);
}
