import fs from 'node:fs';

let failed = false;
const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => { console.error(`ACCESSIBILITY_STATEMENT_RECOVERY: ${message}`); failed = true; };

const page = read('app/accessibility-statement/page.tsx');
for (const marker of [
  "const route = '/accessibility-statement/'",
  "path: '/accessibility-statement'",
  'index: true',
  'WCAG 2.2',
  'المستوى AA',
  'لم تُصدر روافد بعد ادعاء توافق شامل للموقع كله مع WCAG 2.2 AA',
  'اجتياز فحوص آلية أو درجات Lighthouse لا يُعامل وحده كدليل امتثال',
  'لا ترسل بيانات صحية أو شخصية حساسة لمجرد الإبلاغ عن مشكلة إتاحة',
  'السجل التاريخي',
  'lead={<AccessibilityStatementCurrent />}',
]) {
  if (!page.includes(marker)) fail(`current statement lost marker: ${marker}`);
}

const route = read('components/legacy-preserved-route.tsx');
if (!route.includes('lead?: ReactNode')) fail('LegacyPreservedRoute must retain optional current lead support');
if (!route.includes('lead={lead}')) fail('LegacyPreservedRoute must forward the current lead to the historical renderer');

const historical = read('components/legacy-preserved-page.tsx');
for (const marker of [
  'lead?: ReactNode',
  "const HistoricalHeading = lead ? 'h2' : 'h1'",
  '{lead}',
  "lead ? 'السجل التاريخي المحفوظ' : 'نسخة إنتاجية محفوظة'",
  '<HistoricalHeading>{title}</HistoricalHeading>',
]) {
  if (!historical.includes(marker)) fail(`historical preservation layer lost marker: ${marker}`);
}

const trust = read('components/trust-page.tsx');
if (!trust.includes("{ href: '/accessibility-statement', label: 'الإتاحة الرقمية' }")) fail('trust navigation must expose the accessibility statement');

if (failed) process.exit(1);
console.log('ACCESSIBILITY_STATEMENT_RECOVERY OK: current WCAG-target statement, preserved history, one-H1 behavior and trust discovery remain intact.');
