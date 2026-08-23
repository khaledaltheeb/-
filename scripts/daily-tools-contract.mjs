import fs from 'node:fs';

const DATA_PATH = 'data/legacy-production-batches/daily-tools/001.json';
const EXPECTED_TOTAL = 151;
const EXPECTED_TOOLS = 150;
const HUB_PATH = 'daily-tools/index.html';
const SLEEP_PATH = 'daily-tools/sleep-wind-down-plan/index.html';
const EXPECTED_STANDARD = 149;
const read = (path) => fs.readFileSync(path, 'utf8');
let bad = false;
const fail = (message) => { console.error(`DAILY TOOLS CONTRACT FAILED: ${message}`); bad = true; };
const text = (value) => typeof value === 'string' ? value.trim() : '';
const blocks = (record) => record?.body_json && typeof record.body_json === 'object' && !Array.isArray(record.body_json) && Array.isArray(record.body_json.blocks) ? record.body_json.blocks : [];

function runtimeShape(record) {
  const source = blocks(record);
  const stepBlock = source.find((block) => block?.type === 'list' && block?.ordered === true && Array.isArray(block.items) && text(block.items[0]).startsWith('الخطوة '));
  const steps = Array.isArray(stepBlock?.items) ? stepBlock.items.map((item) => text(item).replace(/^الخطوة\s+\d+\s*:\s*/, '')).filter(Boolean) : [];
  const fieldsBlock = source.find((block) => block?.type === 'paragraph' && text(block.text).startsWith('تشمل حقول المتابعة:'));
  const fieldsLine = text(fieldsBlock?.text);
  const fields = fieldsLine ? fieldsLine.replace(/^تشمل حقول المتابعة:\s*/, '').split(/\.\s+اقرأها\b/, 1)[0].replace(/[.،\s]+$/, '').split('،').map((item) => item.trim()).filter(Boolean) : [];
  return { steps, fields };
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
const standard = [...daily.entries()].filter(([path]) => path !== HUB_PATH && path !== SLEEP_PATH);
if (standard.length !== EXPECTED_STANDARD) fail(`expected ${EXPECTED_STANDARD} standard tools, found ${standard.length}`);

let runtimeMatches = 0;
for (const [sourcePath, record] of standard) {
  if (!/^daily-tools\/[a-z0-9][a-z0-9-]{0,119}\/index\.html$/i.test(sourcePath)) {
    fail(`${sourcePath}: unsupported standard tool route shape`);
    continue;
  }
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
  workspace: 'components/daily-tool-workspace.tsx',
  sleep: 'components/sleep-log-local.tsx',
  directory: 'components/daily-tools-directory.tsx',
  index: 'app/daily-tools/page.tsx',
  detail: 'app/daily-tools/[slug]/page.tsx',
  sitemap: 'app/sitemaps/daily-tools.xml/route.ts',
  sitemapIndex: 'app/sitemap.xml/route.ts',
};
for (const [name, path] of Object.entries(files)) {
  if (!fs.existsSync(path)) fail(`${name} missing: ${path}`);
}

if (!bad) {
  const parser = read(files.parser);
  const catalog = read(files.catalog);
  const workspace = read(files.workspace);
  const sleepSource = read(files.sleep);
  const directory = read(files.directory);
  const index = read(files.index);
  const detail = read(files.detail);
  const sitemap = read(files.sitemap);
  const sitemapIndex = read(files.sitemapIndex);

  for (const marker of ['deriveDailyToolSpec', 'تشمل حقول المتابعة:', 'stepBlock', 'fieldKind']) {
    if (!parser.includes(marker)) fail(`source-derived specification marker missing: ${marker}`);
  }
  for (const marker of ['DAILY_TOOLS_TOTAL = 150', 'dailyToolsPayload', 'getDailyToolSlugs', 'getDailyToolRoutes', 'dailyToolMetadata', 'index: true']) {
    if (!catalog.includes(marker)) fail(`first-class catalog marker missing: ${marker}`);
  }
  if (/createClient|getLegacyPreservedPage|get_legacy_preserved_page/.test(catalog)) fail('first-class Daily Tools catalog must not depend on Supabase/legacy RPC at runtime');

  for (const marker of ['localStorage', 'rawafid:daily-tool:', 'تصدير JSON', 'window.print()', 'progress', 'مسح']) {
    if (!workspace.includes(marker)) fail(`workspace marker missing: ${marker}`);
  }
  for (const marker of ['rawafid:sleep-log:v2', 'localConsent', 'تصدير JSON', 'تصدير CSV', 'حذف جميع البيانات المحلية', 'SleepChart', 'duration(']) {
    if (!sleepSource.includes(marker)) fail(`sleep-log marker missing: ${marker}`);
  }
  for (const marker of ['type="search"', 'useMemo', '150 أداة عملية']) {
    if (!directory.includes(marker)) fail(`directory marker missing: ${marker}`);
  }

  for (const marker of ["dynamic = 'force-static'", 'getDailyToolPage', 'dailyToolMetadata', 'deriveDailyToolDirectory', 'ContentRenderer']) {
    if (!index.includes(marker)) fail(`first-class Daily Tools hub marker missing: ${marker}`);
  }
  if (/getLegacyPreservedPage|force-dynamic/.test(index)) fail('Daily Tools hub must not use legacy runtime lookup');

  for (const marker of ["dynamic = 'force-static'", 'dynamicParams = false', 'generateStaticParams', 'getDailyToolSlugs', 'getDailyToolPage', 'dailyToolMetadata', "slug === 'sleep-wind-down-plan'", 'DailyToolWorkspace', 'ContentRenderer']) {
    if (!detail.includes(marker)) fail(`first-class Daily Tools detail marker missing: ${marker}`);
  }
  if (/getLegacyPreservedPage|force-dynamic/.test(detail)) fail('Daily Tools detail pages must not use legacy runtime lookup');

  if (!sitemap.includes('getDailyToolRoutes') || !sitemap.includes('sitemapResponse')) fail('Daily Tools sitemap must enumerate the first-class catalog');
  if (!sitemapIndex.includes("'/sitemaps/daily-tools.xml'")) fail('main sitemap index must include Daily Tools sitemap');

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
console.log('Daily Tools are repository-backed, statically published, sitemap-covered, canonical in place, and keep user inputs local-only.');
