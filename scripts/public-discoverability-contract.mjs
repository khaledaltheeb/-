import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
let failed = false;
const fail = (message) => { console.error(`PUBLIC DISCOVERABILITY FAILED: ${message}`); failed = true; };
const requireText = (file, needles) => {
  if (!fs.existsSync(file)) { fail(`missing ${file}`); return; }
  const body = read(file);
  for (const needle of needles) if (!body.includes(needle)) fail(`${file} missing ${needle}`);
};
const forbidText = (file, needles) => {
  if (!fs.existsSync(file)) { fail(`missing ${file}`); return; }
  const body = read(file);
  for (const needle of needles) if (body.includes(needle)) fail(`${file} must not contain ${needle}`);
};

for (const file of ['app/specialists/page.tsx', 'app/centers/page.tsx']) {
  requireText(file, [
    "{ count: 'exact' }",
    '.range(',
    'PublicPagination',
    'const PAGE_SIZE = 24',
    'total.toLocaleString',
    'generateMetadata',
    'index: !state.hasFilters',
    'path: pageHref(state.page, state.filters)',
  ]);
  forbidText(file, ['.limit(100)']);
}

requireText('app/all-pages/page.tsx', [
  "const PAGE_SIZE = 24",
  "{ count: 'exact' }",
  '.range(',
  'PublicPagination',
  'publicContentHref',
  'publicContentTypeLabel',
  'CollectionPage',
  'ItemList',
  'index: !query',
  'كل سجلات المحتوى المنشورة',
]);
requireText('app/all-pages/layout.tsx', ["'../institutional-public-v1.css'", "'./all-pages.css'"]);
requireText('app/all-pages/all-pages.css', ['content-index-grid', 'content-index-card', '@media(max-width:680px)']);
requireText('components/site-footer.tsx', ["href: '/all-pages'", "label: 'فهرس المحتوى المنشور'"]);
requireText('app/sitemaps/static.xml/route.ts', ["path:'/all-pages'", "changeFrequency:'daily'"]);

if (failed) process.exit(1);
console.log('Public discoverability contract passed: directories paginate without 100-row truncation, filter states stay noindex, pagination stays canonical, and the published-content index is linked, styled, structured, and advertised in sitemap.');
