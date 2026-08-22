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

for (const file of ['app/sectors/[slug]/page.tsx', 'app/sections/[slug]/page.tsx']) {
  requireText(file, [
    'content_categories!inner(category_id)',
    ".eq('status', 'published')",
    'PublicPagination',
    "href=\"/all-pages\"",
  ]);
  forbidText(file, [".eq('robots_index', true)"]);
}
requireText('app/sectors/[slug]/page.tsx', ['buildPublicCategoryForest', 'PublicCategoryTree', 'countPublicCategoryNodes', "path: metadataPath(sector.slug, page)"]);
requireText('app/sections/[slug]/page.tsx', ['const FETCH_BATCH = 500', 'index: !query', 'path: pageHref(slug, page, query)', '.order(\'id\')']);
requireText('app/sections/page.tsx', ['buildPublicCategoryForest', 'unassignedCategories', 'PublicCategoryTree', 'taxonomy-sector-group--fallback', "href=\"/all-pages\""]);
requireText('lib/public-category-tree.ts', ['pure cycle', 'missing', 'visited', 'forest.push', 'countPublicCategoryNodes']);
requireText('components/public-category-tree.tsx', ['public-category-tree', 'data-depth', 'ariaLabel', 'PublicCategoryTree nodes={node.children}']);
requireText('app/institutional-public-v1.css', ['taxonomy-sector-group--fallback', 'public-category-tree', 'category-descendant-count', ':focus-visible']);

if (failed) process.exit(1);
console.log('Public discoverability contract passed: directories paginate without truncation, filter states stay noindex, published content remains internally reachable independent of robots policy, taxonomy trees are lossless at arbitrary depth, and the complete content index is linked and advertised.');
