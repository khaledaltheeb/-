import fs from 'node:fs';

let failed = false;
const fail = (message) => { console.error(`INSTITUTIONS_RECOVERY: ${message}`); failed = true; };
const read = (path) => fs.readFileSync(path, 'utf8');
const exists = (path) => fs.existsSync(path);

const routes = [
  ['app/institutions/page.tsx', "path: '/institutions'"],
  ['app/en/institutions/page.tsx', "path: '/en/institutions'"],
  ['app/institutions/arabic-rtl-assurance/page.tsx', "path: '/institutions/arabic-rtl-assurance'"],
  ['app/institutions/terminology-qa/page.tsx', "path: '/institutions/terminology-qa'"],
  ['app/institutions/open-source/page.tsx', "path: '/institutions/open-source'"],
];

for (const [path, metadataMarker] of routes) {
  if (!exists(path)) {
    fail(`missing recovered route source: ${path}`);
    continue;
  }
  const source = read(path);
  if (!source.includes(metadataMarker)) fail(`${path} missing canonical metadata marker ${metadataMarker}`);
  if (!source.includes('index: true') || !source.includes('follow: true')) fail(`${path} must remain intentionally public and indexable`);
}

if (!exists('components/institutional-assurance-page.module.css')) fail('institutional CSS module is missing');

const ar = read('app/institutions/page.tsx');
const en = read('app/en/institutions/page.tsx');
if (!ar.includes("hreflang: { ar: '/institutions', en: '/en/institutions', 'x-default': '/institutions' }")) fail('Arabic gateway hreflang contract missing');
if (!en.includes("hreflang: { en: '/en/institutions', ar: '/institutions', 'x-default': '/institutions' }")) fail('English gateway hreflang contract missing');

for (const marker of [
  'لا يعني أن الجهة راجعت روافد أو أيدتها أو دخلت معها في شراكة',
  'الأدوات الآلية لا تثبت الصحة الدلالية الكاملة للترجمة',
]) {
  if (!ar.includes(marker)) fail(`Arabic gateway lost claims boundary: ${marker}`);
}
if (!en.includes('We never claim endorsement, accreditation or partnership without explicit written confirmation.')) fail('English gateway lost explicit claims boundary');

const terminology = read('app/institutions/terminology-qa/page.tsx');
if (!terminology.includes('المحرك طبقة QA للقواعد المحددة، وليس بديلًا عن المراجعة اللغوية المتخصصة')) fail('terminology QA must retain human-review boundary');

const rtl = read('app/institutions/arabic-rtl-assurance/page.tsx');
if (!rtl.includes('نجاح اختبار آلي لا يعني توافق WCAG الكامل')) fail('RTL assurance must retain WCAG non-conformance boundary');

const footer = read('components/site-footer.tsx');
if (!footer.includes("{ href: '/institutions', label: 'للجهات والمؤسسات' }")) fail('site footer must expose the institutional gateway');
if (!footer.includes("{ href: '/all-pages', label: 'فهرس المحتوى المنشور' }")) fail('institutional recovery must preserve the newly added content index link');

if (failed) process.exit(1);
console.log('INSTITUTIONS_RECOVERY OK: 5 public institutional routes, hreflang, claims boundaries, CSS and footer discovery are preserved.');
