import fs from 'node:fs';

const lib = fs.readFileSync('lib/open-book-discovery.ts', 'utf8');
const page = fs.readFileSync('app/open-books/page.tsx', 'utf8');
const sitemap = fs.readFileSync('app/sitemaps/open-books.xml/route.ts', 'utf8');
const sitemapIndex = fs.readFileSync('app/sitemap.xml/route.ts', 'utf8');

const failures = [];
const required = [
  'https://directory.doabooks.org/rest/search',
  'https://library.oapen.org/rest/search',
  'https://directory.doabooks.org/rest/peerReviews',
  'dc.publisher',
  'dc.identifier.isbn',
  'dc.identifier.doi',
  'dc.rights',
  'dc.language',
];
for (const token of required) if (!lib.includes(token)) failures.push(`missing discovery token: ${token}`);
if (!lib.includes("cache: 'no-store'")) failures.push('external metadata fetch must not be silently cached as permanent local truth');
if (!page.includes('الترخيص/الحقوق المسجلة')) failures.push('rights/license field is not surfaced');
if (!page.includes('فتح السجل الأصلي')) failures.push('canonical external record link is not surfaced');
if (!page.includes('مراجعة الأقران في PRISM')) failures.push('PRISM peer-review verification action missing');
const hasIndependenceGuard = page.includes('لا تعني اعتمادًا أو شراكة') || page.includes('ولا تعني اعتمادًا أو شراكة');
if (!hasIndependenceGuard || !page.includes('OAPEN/DOAB') || !page.includes('Crossref')) failures.push('independence/non-endorsement safeguard missing or incomplete');
if (!page.includes('/research-tools/doi-resolver/')) failures.push('Crossref DOI resolver link missing');
if (!sitemap.includes("'/open-books/'")) failures.push('open-books canonical missing from dedicated sitemap');
if (!sitemapIndex.includes("'/sitemaps/open-books.xml'")) failures.push('open-books sitemap missing from sitemap index');

if (failures.length) {
  console.error('Open books OAPEN/DOAB contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Open books OAPEN/DOAB contract passed: REST search, provenance fields, rights, canonical records, PRISM lookup, Crossref linking and dedicated sitemap are wired.');
