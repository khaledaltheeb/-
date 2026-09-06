import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = 'https://healthrenewal.org';
const PREFIXES = ['/assessment-measures', '/assessment-lab', '/cognitive-lab'];
const CONCURRENCY = 2;
const MAX_ATTEMPTS = 4;
const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

const failures = [];
const warnings = [];
const checked = new Map();
const discovered = new Set();

const fail = (message) => failures.push(message);
const warn = (message) => warnings.push(message);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));

function normalizePath(value) {
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return null;
    const pathname = url.pathname.replace(/\/{2,}/g, '/');
    if (!PREFIXES.some((prefix) => pathname === prefix || pathname === `${prefix}/` || pathname.startsWith(`${prefix}/`))) return null;
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  } catch {
    return null;
  }
}

function extractHrefs(html) {
  const hrefs = [];
  for (const match of html.matchAll(/\bhref=(?:"([^"]+)"|'([^']+)')/gi)) {
    const normalized = normalizePath(match[1] ?? match[2]);
    if (normalized) hrefs.push(normalized);
  }
  return hrefs;
}

function extractRawLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
}

function extractMeasureSlugs() {
  const files = fs.readdirSync(path.join(ROOT, 'lib'))
    .filter((name) => /^assessment-measures(?:-wave\d+)?\.ts$/.test(name))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const slugs = new Set();
  for (const name of files) {
    for (const match of read(`lib/${name}`).matchAll(/^\s{4}slug:\s*'([^']+)',/gm)) slugs.add(match[1]);
  }
  return [...slugs].sort();
}

function extractCategorySlugs() {
  const slugs = new Set();
  const base = read('lib/assessment-measures.ts');
  const markerIndex = base.indexOf('export const assessmentMeasureCategories');
  if (markerIndex >= 0) {
    for (const match of base.slice(markerIndex).matchAll(/^\s{4}slug:\s*'([^']+)',/gm)) slugs.add(match[1]);
  }
  const files = fs.readdirSync(path.join(ROOT, 'lib')).filter((name) => /^assessment-measures-wave\d+-categories\.ts$/.test(name));
  for (const name of files) {
    for (const match of read(`lib/${name}`).matchAll(/^\s{4}slug:\s*'([^']+)',/gm)) slugs.add(match[1]);
  }
  return [...slugs].sort();
}

function buildExpectedRoutes() {
  const routes = new Set([
    '/assessment-measures/',
    '/assessment-measures/compare/',
    '/assessment-measures/methodology/',
    '/assessment-measures/rights-register/',
    '/assessment-measures/rights-review/',
    '/assessment-lab/',
    '/cognitive-lab/',
    '/cognitive-lab/associative-context-binding/',
    '/cognitive-lab/prospective-memory-cues/',
  ]);

  const measures = extractMeasureSlugs();
  if (measures.length < 80) fail(`SOURCE_COUNT: expected at least 80 assessment measures, found ${measures.length}`);
  for (const slug of measures) {
    routes.add(`/assessment-measures/${slug}/`);
    routes.add(`/assessment-measures/${slug}/print/`);
  }

  const categories = extractCategorySlugs();
  if (categories.length < 10) fail(`SOURCE_COUNT: expected at least 10 assessment measure categories, found ${categories.length}`);
  for (const slug of categories) routes.add(`/assessment-measures/category/${slug}/`);

  const monitors = readJson('data/assessment-lab/monitors.v1.json');
  const instruments = readJson('data/assessment-lab/instruments.v1.json');
  if (monitors.length !== 60) fail(`SOURCE_COUNT: expected 60 Assessment Lab monitors, found ${monitors.length}`);
  if (instruments.length !== 10) fail(`SOURCE_COUNT: expected 10 Assessment Lab source/rights pages, found ${instruments.length}`);
  const assessmentSlugs = new Set([...monitors, ...instruments].map((row) => row.slug));
  if (assessmentSlugs.size !== 70) fail(`SOURCE_COUNT: expected 70 unique Assessment Lab detail routes, found ${assessmentSlugs.size}`);
  for (const slug of assessmentSlugs) routes.add(`/assessment-lab/${slug}/`);

  const cognitive = [
    ...readJson('data/cognitive-lab/tools.v1.json'),
    ...readJson('data/cognitive-lab/tools.v2-extension.json'),
  ];
  if (cognitive.length !== 100) fail(`SOURCE_COUNT: expected 100 Cognitive Lab tools, found ${cognitive.length}`);
  const cognitiveSlugs = new Set(cognitive.map((row) => row.slug));
  if (cognitiveSlugs.size !== 100) fail(`SOURCE_COUNT: expected 100 unique Cognitive Lab slugs, found ${cognitiveSlugs.size}`);
  for (const slug of cognitiveSlugs) routes.add(`/cognitive-lab/${slug}/`);

  return { routes, measures, categories, assessmentSlugs, cognitiveSlugs };
}

function assertStaticRmdBoundary() {
  const detail = read('app/assessment-measures/[slug]/page.tsx');
  for (const phrase of [
    'RMD مصدر للأدلة والمعلومات عن المقاييس',
    'ليس بالضرورة مالك حقوق الأداة',
    'حقوق الأصل',
    'حالة العربية',
  ]) {
    if (!detail.includes(phrase)) fail(`RMD_BOUNDARY: assessment measure detail template missing: ${phrase}`);
  }
}

function validateHtml(route, html, finalUrl) {
  if (!html.trim()) fail(`EMPTY_BODY: ${route}`);
  for (const marker of [
    'Internal Server Error',
    'Application error: a server-side exception has occurred',
    'This page could not be found',
  ]) {
    if (html.includes(marker)) fail(`ERROR_BODY: ${route} contains "${marker}"`);
  }
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(`SEO_TITLE: ${route} has no rendered <title>`);

  const pathOnly = route.replace(/\/$/, '');
  const isPrint = /\/assessment-measures\/[^/]+\/print$/.test(pathOnly);
  if (!isPrint && !/rel="canonical"/i.test(html)) warn(`CANONICAL: ${route} has no rendered canonical link`);

  if (pathOnly === '/assessment-measures') {
    for (const phrase of ['المقاييس وأدوات التقييم', 'حقوق', 'النسخة العربية']) {
      if (!html.includes(phrase)) fail(`CONTENT_HUB: ${route} missing ${phrase}`);
    }
  } else if (/^\/assessment-measures\/[^/]+$/.test(pathOnly) && !['compare', 'methodology', 'rights-register', 'rights-review'].includes(pathOnly.split('/').at(-1))) {
    for (const phrase of ['حالة الاستخدام', 'دليل الاستخدام التفصيلي', 'السلامة والحدود المهنية', 'الحقوق والنسخة العربية', 'RMD مصدر للأدلة']) {
      if (!html.includes(phrase)) fail(`MEASURE_DETAIL: ${route} missing ${phrase}`);
    }
  } else if (isPrint) {
    if (!html.includes('العودة إلى دليل المقياس')) fail(`PRINT_VIEW: ${route} missing return-to-guide control`);
  } else if (/^\/cognitive-lab\/[^/]+$/.test(pathOnly)) {
    for (const phrase of ['تعليمي غير تشخيصي', '5 مستويات', '10 محاولات لكل جلسة', 'ماذا يقدم هذا النشاط، وماذا لا يقدم؟']) {
      if (!html.includes(phrase)) fail(`COGNITIVE_DETAIL: ${route} missing ${phrase}`);
    }
  } else if (/^\/assessment-lab\/[^/]+$/.test(pathOnly)) {
    const hasMonitorBoundary = html.includes('متابعة ذاتية') && html.includes('لا تشخيص');
    const hasSourceBoundary = html.includes('أداة مصدرية') && html.includes('توثيق قبل الاستخدام');
    if (!hasMonitorBoundary && !hasSourceBoundary) fail(`ASSESSMENT_DETAIL: ${route} missing monitor/source safety boundary`);
    if (!html.includes('تمت المراجعة من قبل فريق روافد')) fail(`ASSESSMENT_DETAIL: ${route} missing review provenance`);
  }

  try {
    if (new URL(finalUrl).origin !== BASE) fail(`REDIRECT_ORIGIN: ${route} ended at ${finalUrl}`);
  } catch {
    fail(`FINAL_URL: ${route} returned invalid final URL ${finalUrl}`);
  }
}

async function requestText(url, label, { recordFailure = true } = {}) {
  let last = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'Rawafid-Assessment-Sectors-Audit/2.0' },
      });
      const text = await response.text();
      last = { response, text };
      if (response.ok) return last;
      if (!TRANSIENT_STATUSES.has(response.status)) break;
    } catch (error) {
      last = { error };
    } finally {
      clearTimeout(timeout);
    }
    if (attempt < MAX_ATTEMPTS) await sleep(750 * attempt);
  }

  if (recordFailure) {
    if (last?.response) fail(`HTTP_${last.response.status}: ${label}`);
    else fail(`FETCH: ${label}: ${last?.error instanceof Error ? last.error.message : String(last?.error ?? 'unknown error')}`);
  }
  return last;
}

async function collectSitemapRoutes(url = `${BASE}/sitemap.xml`, depth = 0, seen = new Set()) {
  if (depth > 3 || seen.has(url)) return [];
  seen.add(url);
  const result = await requestText(url, `sitemap ${url}`);
  if (!result?.response?.ok) return [];
  const locs = extractRawLocs(result.text);
  if (/<sitemapindex\b/i.test(result.text)) {
    const collected = [];
    for (const loc of locs) {
      try {
        const child = new URL(loc);
        if (child.origin === BASE) collected.push(...await collectSitemapRoutes(child.toString(), depth + 1, seen));
      } catch {}
    }
    return collected;
  }
  return locs.map(normalizePath).filter(Boolean);
}

async function checkRoute(route) {
  const result = await requestText(new URL(route, BASE), route);
  if (!result?.response?.ok) {
    checked.set(route, { status: result?.response?.status ?? 0, bytes: result?.text ? Buffer.byteLength(result.text) : 0 });
    return [];
  }
  validateHtml(route, result.text, result.response.url);
  checked.set(route, { status: result.response.status, finalUrl: result.response.url, bytes: Buffer.byteLength(result.text) });
  return extractHrefs(result.text);
}

async function runBatch(routes) {
  const list = [...routes];
  let cursor = 0;
  const links = new Set();
  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= list.length) return;
      const route = list[index];
      const found = await checkRoute(route);
      for (const href of found) links.add(href);
      await sleep(250);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, list.length || 1) }, () => worker()));
  return links;
}

async function main() {
  const source = buildExpectedRoutes();
  assertStaticRmdBoundary();

  const sitemapRoutes = [...new Set(await collectSitemapRoutes())];
  for (const route of sitemapRoutes) source.routes.add(route);

  let pending = new Set(source.routes);
  for (let round = 0; round < 3 && pending.size; round += 1) {
    const links = await runBatch(pending);
    for (const route of pending) discovered.add(route);
    const next = new Set();
    for (const href of links) {
      if (!discovered.has(href) && !checked.has(href)) next.add(href);
    }
    pending = next;
  }

  const sitemapSet = new Set(sitemapRoutes);
  for (const slug of source.assessmentSlugs) {
    const route = `/assessment-lab/${slug}/`;
    if (!sitemapSet.has(route)) fail(`SITEMAP_MISSING: ${route}`);
  }
  for (const slug of source.cognitiveSlugs) {
    const route = `/cognitive-lab/${slug}/`;
    if (!sitemapSet.has(route)) fail(`SITEMAP_MISSING: ${route}`);
  }
  for (const slug of source.measures) {
    const route = `/assessment-measures/${slug}/`;
    if (!sitemapSet.has(route)) fail(`SITEMAP_MISSING: ${route}`);
  }

  const counts = {
    expectedAssessmentMeasures: source.measures.length,
    expectedAssessmentMeasureCategories: source.categories.length,
    expectedAssessmentLabDetails: source.assessmentSlugs.size,
    expectedCognitiveTools: source.cognitiveSlugs.size,
    sitemapSectionRoutes: sitemapRoutes.length,
    checkedRoutes: checked.size,
    checkedAssessmentMeasures: [...checked.keys()].filter((route) => route.startsWith('/assessment-measures')).length,
    checkedAssessmentLab: [...checked.keys()].filter((route) => route.startsWith('/assessment-lab')).length,
    checkedCognitiveLab: [...checked.keys()].filter((route) => route.startsWith('/cognitive-lab')).length,
  };

  console.log(JSON.stringify({
    status: failures.length ? 'failed' : 'passed',
    counts,
    warningCount: warnings.length,
    warnings,
    failureCount: failures.length,
    failures,
  }, null, 2));
  if (failures.length) process.exit(1);
}

await main();
