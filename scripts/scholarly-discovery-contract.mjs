import fs from 'node:fs';

const required = {
  'app/open-books/page.tsx': ['OAPEN', 'DOAB', 'Crossref', 'PRISM', '/research-tools/doi-resolver/'],
  'lib/open-book-discovery.ts': ['directory.doabooks.org/rest/search', 'library.oapen.org/rest/search', 'directory.doabooks.org/rest/peerReviews'],
  'lib/crossref-discovery.ts': ['api.crossref.org/works', 'mailto:Contact@healthrenewal.org', 'revalidate: 86400'],
  'app/research-tools/doi-resolver/page.tsx': ['Crossref REST API', 'وجود DOI أو كثرة الاستشهادات لا يساوي جودة منهجية'],
  'app/api/scholarly/books/route.ts': ['searchOpenBooks', 'Cache-Control'],
  'app/api/scholarly/doi/route.ts': ['resolveCrossrefDoi', 'Cache-Control'],
  'app/sitemaps/static.xml/route.ts': ['/open-books/', '/research-tools/doi-resolver/'],
};

for (const [path, needles] of Object.entries(required)) {
  if (!fs.existsSync(path)) throw new Error(`Missing scholarly discovery file: ${path}`);
  const text = fs.readFileSync(path, 'utf8');
  for (const needle of needles) {
    if (!text.includes(needle)) throw new Error(`${path} is missing required contract text: ${needle}`);
  }
}

const openBooks = fs.readFileSync('app/open-books/page.tsx', 'utf8');
if (!openBooks.includes("<option value=\"both\">OAPEN + DOAB</option>")) throw new Error('Unified OAPEN + DOAB search must remain the default option.');
if (!openBooks.includes('لا نستنتج الترخيص أو مراجعة الأقران')) throw new Error('Rights/peer-review non-inference safeguard is missing.');

const crossref = fs.readFileSync('lib/crossref-discovery.ts', 'utf8');
if (!crossref.includes("url.searchParams.set('mailto', CROSSREF_MAILTO)")) throw new Error('Crossref polite-pool mailto identification is missing.');
if (!crossref.includes("'User-Agent': USER_AGENT")) throw new Error('Crossref identifying User-Agent is missing.');

console.log('scholarly discovery contract: PASS');
