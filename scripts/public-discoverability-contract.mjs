import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const allPages = read('app/all-pages/page.tsx');
const allPagesLayout = read('app/all-pages/layout.tsx');
const sectionPage = read('app/sections/[slug]/page.tsx');
const sectionsIndex = read('app/sections/page.tsx');
const sectorPage = read('app/sectors/[slug]/page.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const tree = read('lib/public-category-tree.ts');
const staticSitemap = read('app/sitemaps/static.xml/route.ts');

const fail = (message) => {
  console.error(`PUBLIC DISCOVERABILITY CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

for (const [label, source] of [['section page', sectionPage], ['sector page', sectorPage]]) {
  if (!source.includes("content_categories!inner(category_id)")) fail(`${label} must filter content through an inner taxonomy relation instead of loading an unbounded ID list`);
  if (!source.includes('<PublicPagination')) fail(`${label} must expose numbered pagination`);
  if (source.includes(".eq('robots_index', true)")) fail(`${label} must not hide published pages internally because of search-engine indexing policy`);
  if (!source.includes(".eq('status', 'published')")) fail(`${label} must only expose published content`);
}

for (const required of [
  'return `/all-pages',
  'action="/all-pages"',
  ".eq('status', 'published')",
  '<PublicPagination',
  'content_categories',
  'publicContentHref',
  'البحث في الصفحات المنشورة',
]) {
  if (!allPages.includes(required)) fail(`all-pages index missing required contract: ${required}`);
}
if (allPages.includes(".eq('robots_index', true)")) fail('all-pages index must include published noindex pages for internal discoverability');
if (!allPagesLayout.includes("../institutional-public-v1.css")) fail('all-pages index must retain the institutional public visual system');

for (const required of ['buildPublicCategoryForest', 'unassignedCategories', 'PublicCategoryTree', '/all-pages']) {
  if (!sectionsIndex.includes(required)) fail(`sections index missing lossless taxonomy contract: ${required}`);
}
for (const required of ['pure cycle', 'missing', 'visited', 'forest.push']) {
  if (!tree.includes(required)) fail(`category tree builder missing malformed-taxonomy safeguard: ${required}`);
}

if (!header.includes("href: '/all-pages'")) fail('global header must expose the complete published-page index');
if (!footer.includes("href: '/all-pages'")) fail('global footer must expose the complete published-page index');
if (!staticSitemap.includes("path:'/all-pages'")) fail('all-pages index must be present in the static sitemap');

if (!process.exitCode) {
  console.log('Public discoverability contract passed: complete index, lossless taxonomy tree, scalable relation filtering, and internal visibility are guarded.');
}
