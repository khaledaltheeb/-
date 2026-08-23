import fs from 'node:fs';

const DATA_PATH = 'data/legacy-production-batches/daily-tools/001.json';
const EXPECTED_TOTAL = 151;
const EXPECTED_TOOLS = 150;
const HUB_PATH = 'daily-tools/index.html';
const SLEEP_PATH = 'daily-tools/sleep-wind-down-plan/index.html';
const EXPECTED_STANDARD = 149;
const read = (file) => fs.readFileSync(file, 'utf8');
const text = (value) => typeof value === 'string' ? value.trim() : '';
const blocks = (record) => record?.body_json && typeof record.body_json === 'object' && !Array.isArray(record.body_json) && Array.isArray(record.body_json.blocks) ? record.body_json.blocks : [];
let bad = false;
const fail = (message) => { console.error(`DAILY TOOLS CONTRACT FAILED: ${message}`); bad = true; };

function sourcePathToRoute(sourcePath) {
  if (sourcePath === HUB_PATH) return '/daily-tools/';
  const match = /^daily-tools\/([a-z0-9][a-z0-9-]{0,119})\/index\.html$/i.exec(sourcePath);
  return match ? `/daily-tools/${match[1]}/` : null;
}

function runtimeShape(record) {
  const source = blocks(record);
  const stepBlock = source.find((block) => block?.type === 'list' && block?.ordered === true && Array.isArray(block.items) && text(block.items[0]).startsWith('الخطوة '));
  const steps = Array.isArray(stepBlock?.items) ? stepBlock.items.map((item) => text(item).replace(/^الخطوة\s+\d+\s*:\s*/, '')).filter(Boolean) : [];
  const fieldsBlock = source.find((block) => block?.type === 'paragraph' && text(block.text).startsWith('تشمل حقول المتابعة:'));
  const fieldsLine = text(fieldsBlock?.text);
  const fields = fieldsLine ? fieldsLine.replace(/^تشمل حقول المتابعة:\s*/, '').split(/\.\s+اقرأها\b/, 1)[0].replace(/[.،\s]+$/, '').split('،').map((item) => item.trim()).filter(Boolean) : [];
  return { steps, fields };
}

function hubToolLinks(record) {
  const raw = Array.isArray(record?.internal_links_json) ? record.internal_links_json : [];
  const seen = new Set();
  for (const value of raw) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const rawUrl = text(value.url ?? value.href);
    if (!rawUrl) continue;
    try {
      const pathname = new URL(rawUrl, 'https://healthrenewal.org').pathname;
      if (/^\/daily-tools\/[a-z0-9][a-z0-9-]{0,119}\/?$/i.test(pathname)) seen.add(pathname.replace(/\/?$/, '/'));
    } catch {}
  }
  return seen;
}

const payload = JSON.parse(read(DATA_PATH));
const records = Array.isArray(payload?.records) ? payload.records : [];
const daily = new Map();
for (const record of records) {
  const sourcePath = text(record?.source_path);
  if (!sourcePath.startsWith('daily-tools/')) continue;
  if (daily.has(sourcePath)) fail(`duplicate source_path: ${sourcePath}`);
  else daily.set(sourcePath, record);
}

if (daily.size !== EXPECTED_TOTAL) fail(`expected ${EXPECTED_TOTAL} Daily Tools records, found ${daily.size}`);
const hub = daily.get(HUB_PATH);
const sleep = daily.get(SLEEP_PATH);
if (!hub) fail(`missing hub: ${HUB_PATH}`);
if (!sleep) fail(`missing sleep tracker: ${SLEEP_PATH}`);
const standard = [...daily.entries()].filter(([sourcePath]) => sourcePath !== HUB_PATH && sourcePath !== SLEEP_PATH);
if (standard.length !== EXPECTED_STANDARD) fail(`expected ${EXPECTED_STANDARD} standard tools, found ${standard.length}`);

const expectedRoutes = [...new Set([...daily.keys()].map(sourcePathToRoute).filter(Boolean))];
if (expectedRoutes.length !== EXPECTED_TOTAL) fail(`source corpus must resolve to ${EXPECTED_TOTAL} unique public routes, found ${expectedRoutes.length}`);
if (!expectedRoutes.includes('/daily-tools/')) fail('Daily Tools public hub route is missing');

if (hub) {
  const linkedTools = hubToolLinks(hub);
  if (linkedTools.size !== EXPECTED_TOOLS) fail(`Daily Tools hub must expose exactly ${EXPECTED_TOOLS} unique tool routes, found ${linkedTools.size}`);
}

let runtimeMatches = 0;
for (const [sourcePath, record] of standard) {
  const { steps, fields } = runtimeShape(record);
  if (steps.length !== 4) {
    fail(`${sourcePath}: runtime parser must derive exactly four steps, found ${steps.length}`);
    continue;
  }
  if (fields.length < 3) {
    fail(`${sourcePath}: runtime parser must derive at least three local fields, found ${fields.length}`);
    continue;
  }
  if (!/(?:localStorage|المتصفح|محلي)/u.test(text(record?.body_text))) {
    fail(`${sourcePath}: preserved local/privacy marker missing`);
    continue;
  }
  runtimeMatches += 1;
}
if (runtimeMatches !== EXPECTED_STANDARD) fail(`runtime parser coverage ${runtimeMatches}/${EXPECTED_STANDARD}`);

if (sleep) {
  const headings = blocks(sleep).filter((block) => block?.type === 'heading').map((block) => text(block.text || block.title));
  for (const required of ['إضافة سجل', 'السجلات المحفوظة', 'مخطط الاتجاهات لآخر 14 سجلًا']) {
    if (!headings.some((heading) => heading.includes(required))) fail(`${SLEEP_PATH}: missing preserved tracker heading: ${required}`);
  }
}

const files = {
  parser: 'lib/daily-tools-preserved.ts',
  catalog: 'lib/daily-tools-catalog.ts',
  manifestGenerator: 'scripts/build-daily-tools-route-manifest.mjs',
  manifest: 'generated/daily-tools-routes.json',
  resources: 'components/daily-tool-resources.tsx',
  workspace: 'components/daily-tool-workspace.tsx',
  sleep: 'components/sleep-log-local.tsx',
  directory: 'components/daily-tools-directory.tsx',
  index: 'app/daily-tools/page.tsx',
  detail: 'app/daily-tools/[slug]/page.tsx',
  sitemap: 'app/sitemaps/daily-tools.xml/route.ts',
  sitemapIndex: 'app/sitemap.xml/route.ts',
  header: 'components/site-header.tsx',
};
for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) fail(`${name} missing: ${file}`);
}

if (!bad) {
  const parser = read(files.parser);
  const catalog = read(files.catalog);
  const generator = read(files.manifestGenerator);
  const resources = read(files.resources);
  const workspace = read(files.workspace);
  const sleepSource = read(files.sleep);
  const directory = read(files.directory);
  const index = read(files.index);
  const detail = read(files.detail);
  const sitemap = read(files.sitemap);
  const sitemapIndex = read(files.sitemapIndex);
  const header = read(files.header);

  for (const marker of ['deriveDailyToolSpec', 'تشمل حقول المتابعة:', 'stepBlock', 'fieldKind']) {
    if (!parser.includes(marker)) fail(`source-derived specification marker missing: ${marker}`);
  }
  for (const marker of ["import 'server-only'", 'getCloudflareContext', "@/generated/daily-tools-routes.json", "ASSET_ROOT = '/daily-tools-data/records'", 'readCloudflareAsset', 'readLocalAsset', 'getDailyToolSlugs', 'getDailyToolRoutes', 'getDailyToolRelatedLinks', 'getDailyToolReferences', 'dailyToolMetadata', 'index: true']) {
    if (!catalog.includes(marker)) fail(`asset-backed catalog marker missing: ${marker}`);
  }
  if (/readFileSync|loadPayload\s*\(/.test(catalog)) fail('Daily Tools runtime catalog must not synchronously read the multi-megabyte source corpus');
  if (/createClient|getLegacyPreservedPage|get_legacy_preserved_page/.test(catalog)) fail('first-class Daily Tools catalog must not depend on Supabase/legacy RPC at runtime');

  for (const marker of ['EXPECTED_TOOL_COUNT = 150', 'generated/daily-tools-routes.json', 'public/daily-tools-data/records', 'const assets = new Map()', 'source_path', 'fs.writeFileSync']) {
    if (!generator.includes(marker)) fail(`route/content asset generator marker missing: ${marker}`);
  }

  for (const marker of ['أدوات ومسارات مرتبطة', 'المصادر والمراجع', 'getDailyToolReferences', 'getDailyToolRelatedLinks', 'noopener noreferrer']) {
    if (!resources.includes(marker)) fail(`resources renderer marker missing: ${marker}`);
  }
  for (const marker of ['localStorage', 'rawafid:daily-tool:', 'تصدير JSON', 'window.print()', 'progress', 'مسح']) {
    if (!workspace.includes(marker)) fail(`workspace marker missing: ${marker}`);
  }
  for (const marker of ['rawafid:sleep-log:v2', 'localConsent', 'تصدير JSON', 'تصدير CSV', 'حذف جميع البيانات المحلية', 'SleepChart', 'duration(']) {
    if (!sleepSource.includes(marker)) fail(`sleep-log marker missing: ${marker}`);
  }
  for (const marker of ['type="search"', 'useMemo', '150 أداة عملية']) {
    if (!directory.includes(marker)) fail(`directory marker missing: ${marker}`);
  }

  for (const marker of ["dynamic = 'force-static'", 'revalidate = false', 'await getDailyToolPage', 'dailyToolMetadata', 'deriveDailyToolDirectory', 'ContentRenderer']) {
    if (!index.includes(marker)) fail(`first-class Daily Tools hub marker missing: ${marker}`);
  }
  if (/getLegacyPreservedPage|force-dynamic/.test(index)) fail('Daily Tools hub must not use legacy runtime lookup');

  for (const marker of ["dynamic = 'force-static'", 'dynamicParams = false', 'revalidate = false', 'generateStaticParams', 'getDailyToolSlugs', 'await getDailyToolPage', 'dailyToolMetadata', "slug === 'sleep-wind-down-plan'", 'DailyToolWorkspace', 'DailyToolResources', 'ContentRenderer']) {
    if (!detail.includes(marker)) fail(`first-class Daily Tools detail marker missing: ${marker}`);
  }
  if (/getLegacyPreservedPage|force-dynamic/.test(detail)) fail('Daily Tools detail pages must not use legacy runtime lookup');

  for (const marker of ["@/generated/daily-tools-routes.json", "dynamic = 'force-static'", 'EXPECTED_ROUTES = 151', 'sitemapResponse']) {
    if (!sitemap.includes(marker)) fail(`Daily Tools sitemap build-manifest marker missing: ${marker}`);
  }
  if (sitemap.includes('daily-tools-catalog')) fail('Daily Tools sitemap must not import the content catalog into the Worker');
  if (!sitemapIndex.includes("'/sitemaps/daily-tools.xml'")) fail('main sitemap index must include Daily Tools sitemap');
  if (!header.includes("href: '/daily-tools/'") || !header.includes("label: 'الأدوات اليومية'")) fail('global navigation must expose the migrated Daily Tools hub');

  for (const [name, source] of Object.entries({ workspace, sleep: sleepSource, directory })) {
    if (/\bfetch\s*\(/.test(source)) fail(`${name} must not send personal tool input over the network`);
    if (/XMLHttpRequest|sendBeacon|WebSocket/.test(source)) fail(`${name} contains a forbidden network primitive`);
  }
  for (const source of [index, detail]) {
    if (/\bredirect\s*\(|permanentRedirect/.test(source)) fail('Daily Tools migration routes must render in place at their original URLs');
  }
}

if (bad) process.exit(1);
console.log(`Daily Tools contract passed: ${EXPECTED_TOOLS} first-class indexable tools + hub, including ${runtimeMatches} standard source-derived tools and the specialized sleep tracker.`);
console.log('Daily Tools stay repository-backed and statically published; build materializes per-route content assets for Cloudflare while the sitemap uses a lightweight route manifest.');
