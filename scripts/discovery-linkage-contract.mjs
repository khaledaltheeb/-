import fs from 'node:fs';

let failed = false;
const fail = (message) => { console.error(`DISCOVERY_LINKAGE: ${message}`); failed = true; };
const read = (path) => fs.readFileSync(path, 'utf8');
const exists = (path) => fs.existsSync(path);

const routes = [
  ['/all-pages', 'app/all-pages/page.tsx'],
  ['/institutions', 'app/institutions/page.tsx'],
  ['/en/institutions', 'app/en/institutions/page.tsx'],
  ['/institutions/arabic-rtl-assurance', 'app/institutions/arabic-rtl-assurance/page.tsx'],
  ['/institutions/terminology-qa', 'app/institutions/terminology-qa/page.tsx'],
  ['/institutions/open-source', 'app/institutions/open-source/page.tsx'],
  ['/media/', 'app/media/page.tsx'],
  ['/external-review/', 'app/external-review/page.tsx'],
  ['/accessibility-statement', 'app/accessibility-statement/page.tsx'],
];

for (const [route, source] of routes) {
  if (!exists(source)) fail(`public discovery route source missing: ${route} -> ${source}`);
}

if (!exists('app/sectors/all-pages/page.tsx')) {
  fail('historical /sectors/all-pages/ compatibility source is missing');
} else {
  const legacy = read('app/sectors/all-pages/page.tsx');
  if (!legacy.includes("const route='/sectors/all-pages/'") || !legacy.includes('LegacyPreservedRoute')) {
    fail('historical /sectors/all-pages/ route must remain preserved rather than replaced');
  }
}

const home = read('app/page.tsx');
if (!home.includes('id="labs-tools"') || !home.includes('كل أدوات روافد في منطقة واحدة')) {
  fail('homepage unified labs/tools zone is missing');
}

const header = read('components/site-header.tsx');
for (const marker of [
  "{ href: '/#labs-tools', label: 'المختبرات والتقييمات والأدوات', icon: 'tools' as const }",
  "{ href: '/all-pages', label: 'فهرس المحتوى المنشور', icon: 'knowledge' as const }",
]) {
  if (!header.includes(marker)) fail(`header discovery entry missing: ${marker}`);
}

const sitemap = read('app/sitemaps/discovery.xml/route.ts');
for (const [route] of routes) {
  if (!sitemap.includes(`path: '${route}'`)) fail(`discovery sitemap missing ${route}`);
}
if ((sitemap.match(/path:\s*'/g) || []).length !== routes.length) {
  fail(`discovery sitemap must contain exactly ${routes.length} reviewed public entry points`);
}

const sitemapIndex = read('app/sitemap.xml/route.ts');
if (!sitemapIndex.includes("'/sitemaps/discovery.xml'")) fail('sitemap index does not register the discovery sitemap');

const llms = read('public/llms.txt');
for (const url of [
  'https://healthrenewal.org/all-pages',
  'https://healthrenewal.org/#labs-tools',
  'https://healthrenewal.org/institutions',
  'https://healthrenewal.org/media/',
  'https://healthrenewal.org/external-review/',
  'https://healthrenewal.org/accessibility-statement',
  'https://healthrenewal.org/sitemaps/discovery.xml',
]) {
  if (!llms.includes(url)) fail(`llms.txt missing discovery URL: ${url}`);
}
if (!llms.includes('Do not infer external review, endorsement, accreditation or partnership')) {
  fail('llms.txt must retain the no-inferred-endorsement boundary');
}

for (const path of ['components/site-header.tsx', 'app/sitemap.xml/route.ts', 'public/llms.txt', 'app/sitemaps/discovery.xml/route.ts']) {
  const source = read(path);
  if (source.includes('permanentRedirect(')) fail(`discovery-only file must not introduce permanent redirects: ${path}`);
}

if (failed) process.exit(1);
console.log(`DISCOVERY_LINKAGE OK: ${routes.length} public entry points linked through header/sitemap/llms without replacing historical routes.`);
