import fs from 'node:fs';

const files = {
  page: 'app/tools/rare-phenotype-navigator/page.tsx',
  workspace: 'components/rare-phenotype-navigator-v2.tsx',
  terms: 'app/api/rare-phenotype/terms/route.ts',
  rank: 'app/api/rare-phenotype/rank/route.ts',
  pavs: 'app/api/rare-phenotype/pavs/route.ts',
  css: 'app/tools/rare-phenotype-navigator/rare-phenotype-navigator.css',
  cssV2: 'app/tools/rare-phenotype-navigator/rare-phenotype-navigator-v2.css',
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
const pavs = read(files.pavs);
const css = read(files.css);
const cssV2 = read(files.cssV2);

requireAll(page, [
  'Rawafid Rare Phenotype Navigator',
  'WebApplication',
  '/sectors/rare-diseases',
  'PAVS Arabic HPO + Cases',
  'Monarch Initiative',
  'GA4GH Phenopackets',
  'PAVS similar-case search',
  'ليست أداة تشخيص ذاتي',
], 'page');

requireAll(workspace, [
  '/api/rare-phenotype/terms',
  '/api/rare-phenotype/rank',
  '/api/rare-phenotype/pavs',
  'Human Diseases',
  'Human Genes',
  'phenopacketSchemaVersion',
  'PAVS Arabic HPO طبقة مستقلة وليست الترجمة العربية الرسمية الكاملة',
  'النتائج فرضيات للمراجعة وليست تشخيصًا',
  'nextPhenotypeQuestions',
  'convergentGenes',
  'إشارة متقاطعة مع حالات PAVS',
  'الحالات المشابهة · PAVS',
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

requireAll(pavs, [
  'pavs.phenomebrowser.net/api/search/phenotype',
  'hpo_ids',
  'include_saudi',
  'include_ddd',
  'include_literature',
  'only_diagnosed',
  'isSaudi',
], 'PAVS API');

requireAll(css, ['.rare-nav-page', '.rare-nav-workspace', '@media(max-width:560px)'], 'CSS');
requireAll(cssV2, ['.rare-nav-triangulation', '.is-convergent', '@media(max-width:760px)'], 'triangulation CSS');

console.log('rare phenotype navigator contract: OK');
