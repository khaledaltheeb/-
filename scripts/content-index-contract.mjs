import fs from 'node:fs';

let failed = false;
const read = (path) => fs.readFileSync(path, 'utf8');
const exists = (path) => fs.existsSync(path);
const fail = (message) => { console.error(`CONTENT_INDEX: ${message}`); failed = true; };

const pagePath = 'app/all-pages/page.tsx';
if (!exists(pagePath)) fail('modern /all-pages index source is missing');
if (!exists('app/sectors/all-pages/page.tsx')) fail('historical /sectors/all-pages/ route must remain preserved');

if (exists(pagePath)) {
  const page = read(pagePath);
  for (const marker of [
    "const PAGE_SIZE = 24",
    "{ count: 'exact' }",
    ".eq('status', 'published')",
    ".eq('robots_index', true)",
    ".range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)",
    'PublicPagination',
    'publicContentHref',
    "'@type': 'CollectionPage'",
    "'@type': 'ItemList'",
    'index: !query',
  ]) {
    if (!page.includes(marker)) fail(`${pagePath} missing ${marker}`);
  }
  if (/\.limit\(\s*100\s*\)/.test(page)) fail('/all-pages must not have a 100-record ceiling');
  if (page.includes("scope === 'published'") || page.includes("scope=published")) fail('/all-pages must not expose noindex/held pages through a public all-published scope');
}

const legacy = read('app/sectors/all-pages/page.tsx');
if (!legacy.includes("const route='/sectors/all-pages/'") || !legacy.includes('LegacyPreservedRoute')) {
  fail('historical /sectors/all-pages/ compatibility route changed unexpectedly');
}

const footer = read('components/site-footer.tsx');
if (!footer.includes("{ href: '/all-pages', label: 'فهرس المحتوى المنشور' }")) fail('footer must expose /all-pages');

const staticSitemap = read('app/sitemaps/static.xml/route.ts');
if (!staticSitemap.includes("{path:'/all-pages',changeFrequency:'daily',priority:.86}")) fail('static sitemap must include /all-pages');

if (failed) process.exit(1);
console.log('CONTENT_INDEX OK: indexable published content has a paginated public index while the historical route and noindex boundaries remain preserved.');
