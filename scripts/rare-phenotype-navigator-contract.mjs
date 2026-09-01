import fs from 'node:fs';

const files = {
  page: 'app/tools/rare-phenotype-navigator/page.tsx',
  workspace: 'components/rare-phenotype-navigator.tsx',
  terms: 'app/api/rare-phenotype/terms/route.ts',
  rank: 'app/api/rare-phenotype/rank/route.ts',
  css: 'app/tools/rare-phenotype-navigator/rare-phenotype-navigator.css',
};

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`missing ${path}`);
  return fs.readFileSync(path, 'utf8');
}
function requireAll(text, markers, label) {
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`${label} missing marker: ${marker}`);
}

const page = read(files.page);
const workspace = read(files.workspace);
const terms = read(files.terms);
const rank = read(files.rank);
const css = read(files.css);

requireAll(page, [
  'Rawafid Rare Phenotype Navigator',
  'WebApplication',
  '/sectors/rare-diseases',
  'PAVS Arabic HPO',
  'Monarch Initiative',
  'GA4GH Phenopackets',
  'ليست أداة تشخيص ذاتي',
], 'page');

requireAll(workspace, [
  '/api/rare-phenotype/terms',
  '/api/rare-phenotype/rank',
  'Human Diseases',
  'Human Genes',
  'phenopacketSchemaVersion',
  'PAVS مستقلة وليست الترجمة العربية الرسمية الكاملة',
  'النتائج فرضيات للمراجعة وليست تشخيصًا',
  'nextPhenotypeQuestions',
], 'workspace');

requireAll(terms, [
  'hpo_arabic_translations.tsv',
  'PAVS Arabic HPO',
  '/^HP:\\d{7}$/',
  'CACHE_MS',
  'Cache-Control',
], 'terms API');

requireAll(rank, [
  'api-v3.monarchinitiative.org/v3/api/semsim/search',
  'ancestor_information_content',
  'bidirectional',
  "'Human Diseases'",
  "'Human Genes'",
  'AbortSignal.timeout',
], 'rank API');

requireAll(css, ['.rare-nav-page', '.rare-nav-workspace', '@media(max-width:560px)'], 'CSS');

console.log('rare phenotype navigator contract: OK');
