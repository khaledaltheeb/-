import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'artifacts', 'kids-lab-routes');
const nativeRequire = createRequire(import.meta.url);
const moduleCache = new Map();

const domains = [
  { key: 'attention', data: 'lib/capabilities/attention-lab.ts', route: 'attention', mode: 'nested' },
  { key: 'memory', data: 'lib/capabilities/memory-lab.ts', route: 'memory', mode: 'nested' },
  { key: 'executive-functions', data: 'lib/capabilities/executive-functions-lab.ts', route: 'executive-functions', mode: 'nested' },
  { key: 'visual-perception', data: 'lib/capabilities/visual-perception-lab.ts', route: 'visual-perception', mode: 'nested' },
  { key: 'visual-motor', data: 'lib/capabilities/visual-motor-lab.ts', route: 'visual-motor', mode: 'nested' },
  { key: 'fine-motor', data: 'lib/capabilities/fine-motor-lab.ts', route: 'fine-motor', mode: 'nested' },
  { key: 'bilateral-tracks', data: 'lib/capabilities/bilateral-tracks.ts', route: 'bilateral-tracks', mode: 'flat', fixedSeriesNumber: 43, fixedSeriesSlug: 'bilateral-tracks', categorySlug: 'bilateral' },
  { key: 'bilateral', data: 'lib/capabilities/bilateral-lab.ts', route: 'bilateral', mode: 'nested', categorySlug: 'bilateral' },
  { key: 'language-reading', data: 'lib/capabilities/language-reading-lab.ts', route: 'language-reading', mode: 'nested' },
  { key: 'math-logic', data: 'lib/capabilities/math-logic-lab.ts', route: 'math-logic', mode: 'nested' },
  { key: 'emotional-regulation', data: 'lib/capabilities/emotional-regulation-lab.ts', route: 'emotional-regulation', mode: 'nested' },
  { key: 'social-skills', data: 'lib/capabilities/social-skills-lab.ts', route: 'social-skills', mode: 'nested' },
  { key: 'sensory-self-regulation', data: 'lib/capabilities/sensory-self-regulation-lab.ts', route: 'sensory-self-regulation', mode: 'nested' },
];

function resolveModule(fromFile, specifier) {
  let base;
  if (specifier.startsWith('@/')) base = path.join(ROOT, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromFile), specifier);
  else return null;
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`, path.join(base, 'index.ts')];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function loadTsModule(file) {
  const absolute = path.resolve(ROOT, file);
  if (moduleCache.has(absolute)) return moduleCache.get(absolute).exports;
  const source = fs.readFileSync(absolute, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      moduleResolution: ts.ModuleResolutionKind.Node10,
    },
    fileName: absolute,
  }).outputText;
  const record = { exports: {} };
  moduleCache.set(absolute, record);
  const localRequire = (specifier) => {
    const resolved = resolveModule(absolute, specifier);
    if (resolved) return loadTsModule(resolved);
    return nativeRequire(specifier);
  };
  // The QA harness executes transpiled local TypeScript modules without changing application runtime code.
  // eslint-disable-next-line no-new-func
  const fn = new Function('require', 'module', 'exports', '__filename', '__dirname', compiled);
  fn(localRequire, record, record.exports, absolute, path.dirname(absolute));
  return record.exports;
}

function findActivities(exportsObject, domainKey) {
  const candidates = Object.values(exportsObject)
    .filter((value) => Array.isArray(value) && value.length > 0)
    .filter((value) => value.slice(0, Math.min(5, value.length)).every((item) => item && typeof item === 'object' && typeof item.slug === 'string' && Number.isInteger(item.level) && typeof item.kind === 'string'))
    .sort((a, b) => b.length - a.length);
  if (!candidates.length) throw new Error(`No activity array detected for ${domainKey}`);
  return candidates[0];
}

function requiredFile(relative, failures, label) {
  const absolute = path.join(ROOT, relative);
  if (!fs.existsSync(absolute)) failures.push(`${label}: missing ${relative}`);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : '';
}

function normalizedRoute(value) {
  return value.endsWith('/') ? value : `${value}/`;
}

const failures = [];
const activityRecords = [];
const seriesMap = new Map();
const domainStats = [];
const rootSource = requiredFile('app/capabilities/kids-lab/page.tsx', failures, 'Kids Lab hub');

for (const domain of domains) {
  const module = loadTsModule(domain.data);
  const activities = findActivities(module, domain.key);
  let tests = 0;
  requiredFile(`app/capabilities/kids-lab/${domain.route}/page.tsx`, failures, `${domain.key} hub`);

  let seriesTemplate = '';
  let activityTemplate = '';
  let imageTemplate = '';
  if (domain.mode === 'nested') {
    seriesTemplate = requiredFile(`app/capabilities/kids-lab/${domain.route}/[series]/page.tsx`, failures, `${domain.key} series template`);
    activityTemplate = requiredFile(`app/capabilities/kids-lab/${domain.route}/[series]/[activity]/page.tsx`, failures, `${domain.key} activity template`);
    imageTemplate = requiredFile(`app/capabilities/kids-lab/${domain.route}/[series]/[activity]/image/route.ts`, failures, `${domain.key} image route`);
    if (seriesTemplate && !seriesTemplate.includes('generateStaticParams')) failures.push(`${domain.key}: series page lacks generateStaticParams`);
  } else {
    activityTemplate = requiredFile(`app/capabilities/kids-lab/${domain.route}/[activity]/page.tsx`, failures, `${domain.key} activity template`);
    imageTemplate = requiredFile(`app/capabilities/kids-lab/${domain.route}/[activity]/image/route.ts`, failures, `${domain.key} image route`);
  }
  if (activityTemplate && !activityTemplate.includes('generateStaticParams')) failures.push(`${domain.key}: activity page lacks generateStaticParams`);
  if (activityTemplate && !activityTemplate.includes('notFound')) failures.push(`${domain.key}: activity page lacks invalid-route notFound guard`);
  if (activityTemplate && !activityTemplate.includes('/image')) failures.push(`${domain.key}: activity page does not expose its worksheet image route`);
  if (imageTemplate && !/export\s+async\s+function\s+GET|export\s+function\s+GET/.test(imageTemplate)) failures.push(`${domain.key}: image route lacks GET handler`);

  for (const activity of activities) {
    const seriesNumber = Number.isInteger(activity.seriesNumber) ? activity.seriesNumber : domain.fixedSeriesNumber;
    const seriesSlug = activity.seriesSlug ?? domain.fixedSeriesSlug;
    if (!Number.isInteger(seriesNumber)) {
      failures.push(`${domain.key}/${activity.slug}: missing series number`);
      continue;
    }
    if (!seriesSlug) {
      failures.push(`${domain.key}/${activity.slug}: missing series slug`);
      continue;
    }
    if (!Number.isInteger(activity.level) || activity.level < 1 || activity.level > 5) failures.push(`${domain.key}/${activity.slug}: invalid level ${activity.level}`);
    if (activity.kind === 'test') tests += 1;
    const base = domain.mode === 'flat'
      ? `/capabilities/kids-lab/${domain.route}/${activity.slug}`
      : `/capabilities/kids-lab/${domain.route}/${seriesSlug}/${activity.slug}`;
    const record = {
      domain: domain.key,
      categorySlug: domain.categorySlug ?? domain.route,
      routeRoot: domain.route,
      seriesNumber,
      seriesSlug,
      activitySlug: activity.slug,
      level: activity.level,
      kind: activity.kind,
      pageRoute: normalizedRoute(base),
      imageRoute: normalizedRoute(`${base}/image`),
    };
    activityRecords.push(record);
    if (!seriesMap.has(seriesNumber)) {
      seriesMap.set(seriesNumber, { number: seriesNumber, slug: seriesSlug, categorySlug: record.categorySlug, routeRoot: domain.route, mode: domain.mode, items: [] });
    }
    const series = seriesMap.get(seriesNumber);
    if (series.slug !== seriesSlug) failures.push(`Series ${seriesNumber}: conflicting slugs ${series.slug} / ${seriesSlug}`);
    series.items.push(record);
  }
  domainStats.push({ domain: domain.key, items: activities.length, tests });
}

const catalog = loadTsModule('lib/capabilities/kids-lab-catalog.ts');
const catalogSeries = catalog.kidsLabSeries;
if (!Array.isArray(catalogSeries)) failures.push('kidsLabSeries export is missing from catalog');
const catalogByNumber = new Map((catalogSeries ?? []).map((item) => [item.number, item]));
if (activityRecords.length !== 1000) failures.push(`Expected 1000 activity/test pages; got ${activityRecords.length}`);
if (seriesMap.size !== 67) failures.push(`Expected 67 series; got ${seriesMap.size}`);
const testCount = activityRecords.filter((item) => item.kind === 'test').length;
if (testCount !== 335) failures.push(`Expected 335 level tests; got ${testCount}`);
if ((catalogSeries ?? []).length !== 67) failures.push(`Catalog expected 67 series; got ${(catalogSeries ?? []).length}`);

const pageRoutes = activityRecords.map((item) => item.pageRoute);
const imageRoutes = activityRecords.map((item) => item.imageRoute);
for (const [label, routes] of [['activity page', pageRoutes], ['image', imageRoutes]]) {
  const seen = new Set();
  for (const route of routes) {
    if (seen.has(route)) failures.push(`Duplicate ${label} route: ${route}`);
    seen.add(route);
  }
}

const seriesRoutes = [];
for (const series of [...seriesMap.values()].sort((a, b) => a.number - b.number)) {
  const levels = new Map();
  for (const item of series.items) {
    if (!levels.has(item.level)) levels.set(item.level, []);
    levels.get(item.level).push(item);
  }
  const levelKeys = [...levels.keys()].sort((a, b) => a - b);
  if (levelKeys.join(',') !== '1,2,3,4,5') failures.push(`Series ${series.number}: missing levels; found ${levelKeys.join(',')}`);
  for (let level = 1; level <= 5; level += 1) {
    const items = levels.get(level) ?? [];
    const tests = items.filter((item) => item.kind === 'test');
    if (tests.length !== 1) failures.push(`Series ${series.number} level ${level}: expected exactly one test; got ${tests.length}`);
    if (items.length < 2 || items.length > 3) failures.push(`Series ${series.number} level ${level}: expected 2-3 final items; got ${items.length}`);
  }
  const catalogItem = catalogByNumber.get(series.number);
  if (!catalogItem) failures.push(`Series ${series.number}: absent from kids-lab catalog`);
  else {
    if (catalogItem.slug !== series.slug) failures.push(`Series ${series.number}: catalog slug ${catalogItem.slug} does not match data slug ${series.slug}`);
    if (catalogItem.categorySlug !== series.categorySlug) failures.push(`Series ${series.number}: catalog category ${catalogItem.categorySlug} does not match route category ${series.categorySlug}`);
  }
  const route = series.mode === 'flat'
    ? normalizedRoute(`/capabilities/kids-lab/${series.routeRoot}`)
    : normalizedRoute(`/capabilities/kids-lab/${series.routeRoot}/${series.slug}`);
  seriesRoutes.push(route);
}

const hubRoutes = [
  '/capabilities/kids-lab/',
  ...[...new Set(domains.filter((domain) => domain.mode === 'nested').map((domain) => `/capabilities/kids-lab/${domain.route}/`))],
];
for (const hub of hubRoutes.slice(1)) {
  if (!rootSource.includes(hub)) failures.push(`Kids Lab hub does not link category route ${hub}`);
}
if (!rootSource.includes("slug==='bilateral-tracks'")) failures.push('Kids Lab hub lacks the series-43 bilateral-tracks special route mapping');
if (!rootSource.includes('kidsLabCategories.map')) failures.push('Kids Lab hub is not generating series links from the catalog');

const clickedRoutes = [...new Set([...hubRoutes, ...seriesRoutes, ...pageRoutes])];
if (clickedRoutes.length !== 1080) failures.push(`Expected 1080 unique click routes (13 hubs + 67 series + 1000 items); got ${clickedRoutes.length}`);
if (imageRoutes.length !== 1000) failures.push(`Expected 1000 worksheet image routes; got ${imageRoutes.length}`);
const testRecords = activityRecords.filter((item) => item.kind === 'test');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const manifest = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  summary: {
    hubs: hubRoutes.length,
    series: seriesMap.size,
    items: activityRecords.length,
    tests: testCount,
    clickRoutes: clickedRoutes.length,
    imageRoutes: imageRoutes.length,
    failures: failures.length,
  },
  hubRoutes,
  seriesRoutes,
  activityRoutes: pageRoutes,
  imageRoutes,
  clickedRoutes,
  testRoutes: testRecords.map((item) => item.pageRoute),
  testImageRoutes: testRecords.map((item) => item.imageRoute),
  activities: activityRecords,
  domains: domainStats,
  failures,
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(OUT, 'click-routes.txt'), `${clickedRoutes.join('\n')}\n`);
fs.writeFileSync(path.join(OUT, 'image-routes.txt'), `${imageRoutes.join('\n')}\n`);
fs.writeFileSync(path.join(OUT, 'test-routes.txt'), `${manifest.testRoutes.join('\n')}\n`);
fs.writeFileSync(path.join(OUT, 'report.md'), [
  '# Kids Lab exhaustive route contract',
  '',
  `- Hubs: **${hubRoutes.length}**`,
  `- Series: **${seriesMap.size}**`,
  `- Final activities/tests: **${activityRecords.length}**`,
  `- Level tests: **${testCount}**`,
  `- Clickable HTML routes: **${clickedRoutes.length}**`,
  `- Worksheet image routes: **${imageRoutes.length}**`,
  `- Failures: **${failures.length}**`,
  '',
  '## Failures',
  ...(failures.length ? failures.map((item) => `- ${item}`) : ['- None']),
].join('\n'));
console.log(`Kids Lab routes: ${hubRoutes.length} hubs, ${seriesMap.size} series, ${activityRecords.length} items, ${testCount} tests, ${clickedRoutes.length} click routes, ${imageRoutes.length} image routes, ${failures.length} failures.`);
if (failures.length) {
  console.error(failures.slice(0, 200).join('\n'));
  process.exit(1);
}
