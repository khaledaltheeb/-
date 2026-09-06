import fs from 'node:fs';

let failed = false;
const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => { console.error(`PUBLIC_DISCOVERABILITY: ${message}`); failed = true; };
const requireAll = (path, markers) => {
  const source = read(path);
  for (const marker of markers) if (!source.includes(marker)) fail(`${path} missing ${marker}`);
  return source;
};

const allPages = requireAll('app/all-pages/page.tsx', [
  "const PAGE_SIZE = 24",
  ".select('id,slug,title,excerpt,content_type,published_at,canonical_url,robots_index', { count: 'exact' })",
  ".range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)",
  "scope === 'indexable'",
  ".eq('robots_index', true)",
  "scope === 'published'",
  "index: indexableState",
  "PublicPagination",
  "CollectionPage",
  "ItemList",
]);
if (/\.limit\(\s*100\s*\)/.test(allPages)) fail('all-pages must not have a 100-row ceiling');

for (const path of ['app/specialists/page.tsx', 'app/centers/page.tsx']) {
  const source = requireAll(path, [
    "const PAGE_SIZE = 24",
    "{ count: 'exact' }",
    ".range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)",
    'PublicPagination',
    'pageHref(targetPage, filters)',
    'index: !state.hasFilters',
    'CollectionPage',
    'ItemList',
  ]);
  if (/\.limit\(\s*100\s*\)/.test(source)) fail(`${path} regressed to a 100-row ceiling`);
}

requireAll('components/site-footer.tsx', ["{ href: '/all-pages', label: 'فهرس المحتوى المنشور' }"]);
requireAll('app/sitemaps/static.xml/route.ts', ["{ path:'/all-pages', changeFrequency:'daily', priority:.86 }"]);
requireAll('app/all-pages/layout.tsx', ["import './all-pages.css'"]);

if (failed) process.exit(1);
console.log('Public discoverability contract passed: index + paginated directories + SEO state are guarded.');
