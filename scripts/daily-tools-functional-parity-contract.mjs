import fs from 'node:fs';

const DATA_PATH = 'data/legacy-production-batches/daily-tools/001.json';
const COMPONENT_PATH = 'components/daily-tool-four-step-checklist.tsx';
const ENHANCER_PATH = 'lib/daily-tools.ts';
const RENDERER_PATH = 'components/content-renderer.tsx';
const LEGACY_VIEW_PATH = 'components/legacy-preserved-page.tsx';
const READ_BOUNDARY_PATH = 'supabase/migrations/20260816040102_fix_legacy_preserved_page_source_key.sql';
const EXPECTED_TOTAL = 151;
const HUB_PATH = 'daily-tools/index.html';
const SLEEP_PATH = 'daily-tools/sleep-wind-down-plan/index.html';
const EXPECTED_STANDARD = EXPECTED_TOTAL - 2;
const STEP_HEADING = 'خطوات الاستخدام';
const PROGRESS_RE = /^أُنجز\s+\d+\s+من\s+4(?:\s|$)/u;

let failed = false;
const fail = (message) => {
  console.error(`DAILY TOOLS FUNCTIONAL PARITY CONTRACT FAILED: ${message}`);
  failed = true;
};

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeListItem(item) {
  if (typeof item === 'string') return item.trim();
  if (item && typeof item === 'object') {
    return text(item.text || item.label || item.value || item.title);
  }
  return '';
}

function blocks(record) {
  const body = record?.body_json;
  if (!body || typeof body !== 'object' || Array.isArray(body) || !Array.isArray(body.blocks)) return [];
  return body.blocks;
}

function blockText(block) {
  return text(block?.text || block?.title);
}

function fourStepsAtUsageHeading(record) {
  const list = blocks(record);
  const headingIndex = list.findIndex((block) => block?.type === 'heading' && blockText(block) === STEP_HEADING);
  if (headingIndex < 0) return null;
  for (let index = headingIndex + 1; index < list.length; index += 1) {
    const block = list[index];
    if (block?.type === 'heading') return null;
    if (block?.type !== 'list' || !Array.isArray(block.items)) continue;
    const items = block.items.map(normalizeListItem).filter(Boolean);
    if (items.length !== 4) return null;
    const hasProgress = list.slice(headingIndex + 1, index).some((candidate) => candidate?.type === 'paragraph' && PROGRESS_RE.test(blockText(candidate)));
    return hasProgress ? items : null;
  }
  return null;
}

function headings(record) {
  return blocks(record)
    .filter((block) => block?.type === 'heading')
    .map(blockText)
    .filter(Boolean);
}

const payload = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const records = Array.isArray(payload?.records) ? payload.records : [];
const unique = new Map();
for (const record of records) {
  const sourcePath = text(record?.source_path);
  if (!sourcePath.startsWith('daily-tools/')) continue;
  if (unique.has(sourcePath)) fail(`duplicate source_path in preserved batch: ${sourcePath}`);
  else unique.set(sourcePath, record);
}

if (unique.size !== EXPECTED_TOTAL) {
  fail(`expected ${EXPECTED_TOTAL} unique Daily Tools records, found ${unique.size}`);
}

const hub = unique.get(HUB_PATH);
const sleep = unique.get(SLEEP_PATH);
if (!hub) fail(`missing Daily Tools hub: ${HUB_PATH}`);
if (!sleep) fail(`missing sleep tracker outlier: ${SLEEP_PATH}`);

const standard = [...unique.entries()].filter(([sourcePath]) => sourcePath !== HUB_PATH && sourcePath !== SLEEP_PATH);
if (standard.length !== EXPECTED_STANDARD) {
  fail(`expected ${EXPECTED_STANDARD} standard four-step tools, found ${standard.length}`);
}

let fourStepCount = 0;
let localPrivacyCount = 0;
for (const [sourcePath, record] of standard) {
  if (!/^daily-tools\/[a-z0-9][a-z0-9-]{0,119}\/index\.html$/i.test(sourcePath)) {
    fail(`${sourcePath}: standard Daily Tool source path is outside the supported one-tool route contract`);
    continue;
  }
  const steps = fourStepsAtUsageHeading(record);
  if (!steps) {
    fail(`${sourcePath}: expected exactly four steps bound to the preserved "${STEP_HEADING}" section and its progress marker`);
    continue;
  }
  fourStepCount += 1;

  if (!/(?:localStorage|المتصفح|محلي)/u.test(text(record?.body_text))) {
    fail(`${sourcePath}: preserved local/privacy behavior marker is missing`);
  } else {
    localPrivacyCount += 1;
  }
}

if (fourStepCount !== EXPECTED_STANDARD) fail(`usage-heading extraction covered ${fourStepCount}/${EXPECTED_STANDARD}`);
if (localPrivacyCount !== EXPECTED_STANDARD) fail(`local/privacy behavior covered ${localPrivacyCount}/${EXPECTED_STANDARD}`);

if (hub) {
  const hubWords = text(hub.body_text).split(/\s+/u).filter(Boolean).length;
  if (hubWords < 500) fail(`Daily Tools hub looks unexpectedly thin (${hubWords} words)`);
  if (fourStepsAtUsageHeading(hub)) fail('Daily Tools hub must remain a hub, not be coerced into the standard checklist engine');
}

if (sleep) {
  const sleepHeadings = headings(sleep);
  for (const required of ['إضافة سجل', 'السجلات المحفوظة', 'مخطط الاتجاهات لآخر 14 سجلًا']) {
    if (!sleepHeadings.some((heading) => heading.includes(required))) {
      fail(`${SLEEP_PATH}: missing preserved tracker heading: ${required}`);
    }
  }
  if (!/(?:localStorage|المتصفح|محلي)/u.test(text(sleep.body_text))) {
    fail(`${SLEEP_PATH}: local-only tracker behavior marker is missing`);
  }
}

const component = fs.readFileSync(COMPONENT_PATH, 'utf8');
for (const required of [
  "const STORAGE_PREFIX = 'rawafid:daily-tool:'",
  'value.length !== 4',
  'window.localStorage.getItem(key)',
  'window.localStorage.setItem(key',
  'window.localStorage.removeItem(key)',
  'أُنجز {completed} من 4',
  'aria-live="polite"',
  '<fieldset',
  'الخصوصية:',
  'لا تُرسل إلى روافد',
]) {
  if (!component.includes(required)) fail(`reusable checklist engine missing contract marker: ${required}`);
}
for (const forbidden of ['fetch(', 'XMLHttpRequest', 'sendBeacon', '@supabase/', 'createClient(']) {
  if (component.includes(forbidden)) fail(`reusable checklist engine must remain local-only; forbidden marker: ${forbidden}`);
}

const enhancer = fs.readFileSync(ENHANCER_PATH, 'utf8');
for (const required of [
  "const HUB_SOURCE_PATH = 'daily-tools/index.html'",
  "const SLEEP_SOURCE_PATH = 'daily-tools/sleep-wind-down-plan/index.html'",
  "const STEP_HEADING = 'خطوات الاستخدام'",
  "sourceFamily && sourceFamily !== 'daily-tools'",
  "type: 'daily_tool_four_step_checklist'",
  'index === listIndex',
  'PROGRESS_PATTERN.test',
]) {
  if (!enhancer.includes(required)) fail(`provenance-gated enhancer missing contract marker: ${required}`);
}

const renderer = fs.readFileSync(RENDERER_PATH, 'utf8');
for (const required of [
  'allowDailyToolInteractions?: boolean',
  "type === 'daily_tool_four_step_checklist'",
  'if (!allowDailyToolInteractions) return null',
  '<DailyToolFourStepChecklist',
]) {
  if (!renderer.includes(required)) fail(`content renderer missing Daily Tools safety marker: ${required}`);
}

const legacyView = fs.readFileSync(LEGACY_VIEW_PATH, 'utf8');
for (const required of ['enhanceLegacyDailyToolBody', 'sourceFamily: page.source_family', 'sourcePath: page.source_path', 'allowDailyToolInteractions={dailyTool.interactive}']) {
  if (!legacyView.includes(required)) fail(`legacy preserved view missing Daily Tools wiring marker: ${required}`);
}

const readBoundary = fs.readFileSync(READ_BOUNDARY_PATH, 'utf8');
if (!readBoundary.includes("not in ('INTERACTIVE_REVIEW','ASSET_REVIEW')")) {
  fail('legacy read boundary must continue excluding INTERACTIVE_REVIEW while parity is under repair');
}

if (failed) process.exit(1);
console.log(`Daily Tools parity contract passed: ${unique.size} preserved records = ${standard.length} standard four-step tools + hub + sleep tracker outlier.`);
console.log('The 149 standard interactions are provenance-gated and the public legacy read boundary still excludes INTERACTIVE_REVIEW.');
console.log('No publication, robots, or Supabase blocker state is changed by this contract.');
