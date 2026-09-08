import fs from 'node:fs';

const fail = (message) => {
  console.error(`RARE PHENOTYPE RECOVERY CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};
const read = (path) => fs.readFileSync(path, 'utf8');
const required = [
  'app/tools/rare-phenotype-navigator/page.tsx',
  'app/tools/rare-phenotype-navigator/rare-phenotype-navigator.css',
  'app/tools/rare-phenotype-navigator/rare-phenotype-navigator-v2.css',
  'components/rare-phenotype-navigator-v2.tsx',
  'lib/rare-phenotype.ts',
  'app/api/rare-phenotype/terms/route.ts',
  'app/api/rare-phenotype/rank/route.ts',
  'app/api/rare-phenotype/pavs/route.ts',
  'app/sitemap.xml/route.ts',
  'app/sitemaps/static.xml/route.ts',
];
for (const path of required) if (!fs.existsSync(path)) fail(`missing ${path}`);
if (process.exitCode) process.exit(process.exitCode);

const page = read(required[0]);
const component = read(required[3]);
const lib = read(required[4]);
const terms = read(required[5]);
const rank = read(required[6]);
const pavs = read(required[7]);
const rootSitemap = read(required[8]);
const staticSitemap = read(required[9]);

if (!page.includes('index: false') || !page.includes('follow: true')) fail('page must remain noindex/follow during recovery QA');
if (!page.includes('ليست أداة تشخيص ذاتي') || !page.includes('لا تنتج الأداة تشخيصًا نهائيًا أو قرارًا علاجيًا')) fail('non-diagnostic boundary missing');
if (!page.includes('ليست النسخة العربية الرسمية الكاملة لـHPO')) fail('PAVS Arabic independence disclosure missing');
if (!page.includes('إشارة للمراجعة، لا كنسبة تشخيص')) fail('cross-source convergence must not be represented as diagnostic probability');
for (const source of ['https://hpo.jax.org/', 'https://pavs.phenomebrowser.net/', 'https://api-v3.monarchinitiative.org/v3/docs', 'https://phenopacket-schema.readthedocs.io/']) {
  if (!page.includes(source)) fail(`primary source link missing: ${source}`);
}

if (!component.includes("fetch(`/api/rare-phenotype/terms")) fail('terms API not wired');
if (!component.includes("fetch('/api/rare-phenotype/rank'")) fail('Monarch rank API not wired');
if (!component.includes("fetch('/api/rare-phenotype/pavs'")) fail('PAVS case API not wired');
if (/\/api\/rare-phenotype\/hpo/.test(component)) fail('dead legacy HPO endpoint must not be required by v2');
if (!component.includes('localStorage.setItem')) fail('local-only persistence missing');
if (!component.includes('حُفظ الملف محليًا على هذا الجهاز فقط')) fail('local-storage disclosure missing');
if (!component.includes('الصفات المنفية تُحفظ في Phenopacket ولا تدخل المطابقة الحالية')) fail('negative phenotype ranking boundary missing');
if (!component.includes("phenopacketSchemaVersion: '2.0'")) fail('Phenopacket v2 export missing');
if (!component.includes('النتائج فرضيات للمراجعة وليست تشخيصًا')) fail('analysis result boundary missing');
if (!component.includes('لا تُدخل اسمًا كاملًا أو رقم هوية')) fail('PII warning missing');
if (!lib.includes('/^HP:\\d{7}$/')) fail('HPO identifier validation missing');

if (!terms.includes('PAVS Arabic HPO')) fail('Arabic terminology provenance missing');
if (!terms.includes('bio-ontology-research-group/hpo-arabic')) fail('Arabic HPO source missing');
if (!rank.includes('api-v3.monarchinitiative.org')) fail('Monarch v3 source missing');
if (!pavs.includes('pavs.phenomebrowser.net')) fail('PAVS source missing');

for (const text of [rootSitemap, staticSitemap]) {
  if (text.includes('/tools/rare-phenotype-navigator')) fail('pre-release navigator must not enter sitemap before final QA');
}

console.log('RARE PHENOTYPE RECOVERY CONTRACT PASSED');
