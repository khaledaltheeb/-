import fs from 'node:fs';

let failed = false;
const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => { console.error(`DIRECTORY_PAGINATION: ${message}`); failed = true; };

for (const path of ['app/specialists/page.tsx', 'app/centers/page.tsx']) {
  const source = read(path);
  for (const marker of [
    "const PAGE_SIZE = 24",
    "{ count: 'exact' }",
    ".range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)",
    'PublicPagination',
    'pageHref(targetPage, filters)',
    'index: !state.hasFilters',
    'CollectionPage',
    'ItemList',
  ]) {
    if (!source.includes(marker)) fail(`${path} missing ${marker}`);
  }
  if (/\.limit\(\s*100\s*\)/.test(source)) fail(`${path} regressed to a 100-record ceiling`);
  if (!source.includes(".order('id', { ascending: true })")) fail(`${path} needs a stable secondary ordering key`);
}

if (failed) process.exit(1);
console.log('DIRECTORY_PAGINATION OK: specialists and centers use exact-count pagination with no 100-record ceiling.');
