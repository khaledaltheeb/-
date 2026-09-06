import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE = 'https://healthrenewal.org';
const sector = process.argv[2];
if (!['assessment-measures', 'assessment-lab', 'cognitive-lab'].includes(sector)) {
  throw new Error('Usage: node scripts/assessment-sector-bounded-live-audit.mjs <assessment-measures|assessment-lab|cognitive-lab>');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const failures = [];
const results = [];
const transient = new Set([429, 500, 502, 503, 504]);

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));

function measureSlugs() {
  const files = fs.readdirSync(path.join(ROOT, 'lib'))
    .filter((name) => /^assessment-measures(?:-wave\d+)?\.ts$/.test(name));
  const slugs = new Set();
  for (const file of files) {
    for (const match of read(`lib/${file}`).matchAll(/^\s{4}slug:\s*'([^']+)',/gm)) slugs.add(match[1]);
  }
  return [...slugs].sort();
}

function categorySlugs() {
  const slugs = new Set();
  const files = fs.readdirSync(path.join(ROOT, 'lib'))
    .filter((name) => name === 'assessment-measures.ts' || /^assessment-measures-wave\d+-categories\.ts$/.test(name));
  for (const file of files) {
    const source = read(`lib/${file}`);
    const area = file === 'assessment-measures.ts'
      ? source.slice(Math.max(0, source.indexOf('export const assessmentMeasureCategories')))
      : source;
    for (const match of area.matchAll(/^\s{4}slug:\s*'([^']+)',/gm)) slugs.add(match[1]);
  }
  return [...slugs].sort();
}

function routesForSector() {
  if (sector === 'assessment-measures') {
    const routes = new Set([
      '/assessment-measures/',
      '/assessment-measures/compare/',
      '/assessment-measures/methodology/',
      '/assessment-measures/rights-register/',
      '/assessment-measures/rights-review/',
    ]);
    for (const slug of measureSlugs()) {
      routes.add(`/assessment-measures/${slug}/`);
      routes.add(`/assessment-measures/${slug}/print/`);
    }
    for (const slug of categorySlugs()) routes.add(`/assessment-measures/category/${slug}/`);
    return [...routes].sort();
  }
  if (sector === 'assessment-lab') {
    const rows = [
      ...readJson('data/assessment-lab/monitors.v1.json'),
      ...readJson('data/assessment-lab/instruments.v1.json'),
    ];
    const routes = new Set(['/assessment-lab/']);
    for (const row of rows) routes.add(`/assessment-lab/${row.slug}/`);
    return [...routes].sort();
  }
  const rows = [
    ...readJson('data/cognitive-lab/tools.v1.json'),
    ...readJson('data/cognitive-lab/tools.v2-extension.json'),
  ];
  const routes = new Set([
    '/cognitive-lab/',
    '/cognitive-lab/associative-context-binding/',
    '/cognitive-lab/prospective-memory-cues/',
  ]);
  for (const row of rows) routes.add(`/cognitive-lab/${row.slug}/`);
  return [...routes].sort();
}

function validateBody(route, body) {
  if (!body.trim()) failures.push(`EMPTY ${route}`);
  for (const marker of ['Internal Server Error', 'Application error: a server-side exception has occurred', 'This page could not be found']) {
    if (body.includes(marker)) failures.push(`ERROR_BODY ${route}: ${marker}`);
  }
  if (!/<title>[^<]+<\/title>/i.test(body)) failures.push(`NO_TITLE ${route}`);

  if (sector === 'assessment-measures') {
    if (/^\/assessment-measures\/[^/]+\/$/.test(route)
      && !['/assessment-measures/compare/', '/assessment-measures/methodology/', '/assessment-measures/rights-register/', '/assessment-measures/rights-review/'].includes(route)) {
      for (const marker of ['حالة الاستخدام', 'الحقوق والنسخة العربية', 'RMD مصدر للأدلة']) {
        if (!body.includes(marker)) failures.push(`CONTENT ${route}: missing ${marker}`);
      }
    }
    if (/\/print\/$/.test(route) && !body.includes('العودة إلى دليل المقياس')) failures.push(`PRINT ${route}: missing guide return`);
  }

  if (sector === 'assessment-lab' && route !== '/assessment-lab/') {
    const safeMonitor = body.includes('متابعة ذاتية') && body.includes('لا تشخيص');
    const safeSource = body.includes('أداة مصدرية') && body.includes('توثيق قبل الاستخدام');
    if (!safeMonitor && !safeSource) failures.push(`BOUNDARY ${route}: no monitor/source safety boundary`);
    if (!body.includes('تمت المراجعة من قبل فريق روافد')) failures.push(`PROVENANCE ${route}: review provenance missing`);
  }

  if (sector === 'cognitive-lab' && route !== '/cognitive-lab/') {
    for (const marker of ['تعليمي غير تشخيصي', '5 مستويات', '10 محاولات لكل جلسة']) {
      if (!body.includes(marker)) failures.push(`CONTENT ${route}: missing ${marker}`);
    }
  }
}

async function probe(route) {
  let lastStatus = 0;
  let lastBody = '';
  let lastUrl = '';
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(`${BASE}${route}`, {
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': `Rawafid-Bounded-${sector}-Audit/1.0` },
      });
      const body = await response.text();
      lastStatus = response.status;
      lastBody = body;
      lastUrl = response.url;
      if (response.ok) break;
      if (!transient.has(response.status)) break;
    } catch (error) {
      lastBody = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timeout);
    }
    await sleep(attempt * 800);
  }

  results.push({ route, status: lastStatus, finalUrl: lastUrl, bytes: Buffer.byteLength(lastBody) });
  if (lastStatus !== 200) {
    failures.push(`HTTP_${lastStatus || 'FETCH'} ${route}: ${lastBody.replace(/\s+/g, ' ').slice(0, 160)}`);
    return;
  }
  validateBody(route, lastBody);
}

const routes = routesForSector();
let cursor = 0;
async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= routes.length) return;
    await probe(routes[index]);
    await sleep(200);
  }
}
await Promise.all(Array.from({ length: 3 }, () => worker()));

const statusCounts = results.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] ?? 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({ sector, routeCount: routes.length, statusCounts, failureCount: failures.length, failures }, null, 2));
if (failures.length) process.exit(1);
