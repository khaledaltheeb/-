import fs from 'node:fs';

const files = [
  'lib/assessment-measures.ts',
  ...Array.from({ length: 11 }, (_, i) => `lib/assessment-measures-wave${i + 2}.ts`),
];

let failed = false;
const fail = (message) => {
  console.error(`ASSESSMENT_MEASURES_RIGHTS_INTEGRITY_FAIL: ${message}`);
  failed = true;
};

function extractArray(text, exportNamePattern) {
  const marker = new RegExp(`export\\s+const\\s+${exportNamePattern}[^=]*=\\s*\\[`);
  const match = marker.exec(text);
  if (!match) return '';
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = match.index + match[0].length - 1; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) return text.slice(match.index, i + 1);
    }
  }
  return '';
}

function blocksFromArray(arrayText, file) {
  const matches = [...arrayText.matchAll(/\n\s*\{\n\s{4}slug:\s*['"]([^'"]+)['"]/g)];
  return matches.map((match, index) => ({
    slug: match[1],
    file,
    block: arrayText.slice(match.index, matches[index + 1]?.index ?? arrayText.length),
  }));
}

const blocks = [];
for (const file of files) {
  if (!fs.existsSync(file)) {
    fail(`missing source file ${file}`);
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  const exportPattern = file === 'lib/assessment-measures.ts' ? 'assessmentMeasures' : 'assessmentMeasuresWave\\d+';
  const array = extractArray(text, exportPattern);
  if (!array) {
    fail(`could not isolate measure array in ${file}`);
    continue;
  }
  blocks.push(...blocksFromArray(array, file));
}

const slugs = blocks.map((x) => x.slug);
const unique = new Set(slugs);
if (blocks.length !== 83) fail(`expected exactly 83 published measures across Waves 1-12, found ${blocks.length}`);
if (unique.size !== blocks.length) fail('duplicate published measure slug detected');

let publicDomain = 0;
let openReuse = 0;
let arabicFullPublished = 0;
let translationEvidence = 0;

for (const { slug, file, block } of blocks) {
  const rights = block.match(/rightsStatus:\s*'(public-domain|open-reuse)'/)?.[1];
  if (!rights) fail(`${slug}: missing supported original-instrument rights status (${file})`);
  if (rights === 'public-domain') publicDomain += 1;
  if (rights === 'open-reuse') openReuse += 1;

  if (!/rightsVerifiedOn:\s*'\d{4}-\d{2}-\d{2}'/.test(block)) fail(`${slug}: missing rights verification date (${file})`);
  if (!/rightsNote:\s*['`]/.test(block)) fail(`${slug}: missing rights interpretation note (${file})`);
  if (!/rightsLabel:\s*['`]/.test(block)) fail(`${slug}: missing rights label (${file})`);
  if (!/arabicStatus:\s*'[^']+'/.test(block)) fail(`${slug}: missing Arabic-version status (${file})`);
  if (!/arabicNote:\s*['`]/.test(block)) fail(`${slug}: missing Arabic-version note (${file})`);
  if (!/fullArabicFormPublished:\s*(true|false)/.test(block)) fail(`${slug}: missing Arabic full-form publication decision (${file})`);
  if (!/fullArabicFormNote:\s*['`]/.test(block)) fail(`${slug}: missing Arabic full-form rights note (${file})`);

  const rightsSources = [...block.matchAll(/\{\s*label:\s*['`][\s\S]*?url:\s*['`]([^'`]+)['`][\s\S]*?role:\s*'rights'\s*\}/g)].map((m) => m[1]);
  if (!rightsSources.length) fail(`${slug}: no explicit rights-role source (${file})`);
  for (const url of rightsSources) if (!url.startsWith('https://')) fail(`${slug}: rights source must use HTTPS: ${url}`);

  const hasTranslationSource = /role:\s*'translation'/.test(block);
  if (hasTranslationSource) translationEvidence += 1;
  const fullPublished = /fullArabicFormPublished:\s*true/.test(block);
  if (fullPublished) {
    arabicFullPublished += 1;
    if (!['timed-up-and-go', '10-meter-walk-test', '6-minute-walk-test'].includes(slug)) {
      fail(`${slug}: Arabic full-form publication exceeds the verified procedural-protocol allowlist`);
    }
  }

  // A translation study/reference is evidence of a language version, not a redistribution license.
  // Therefore every item that mentions Arabic validation/translation must still carry a separate full-form decision.
  if (/arabicStatus:\s*'(validated-version-reported|translation-reported)'/.test(block) && !/fullArabicFormPublished:\s*(true|false)/.test(block)) {
    fail(`${slug}: Arabic evidence must not be treated as redistribution permission without a separate full-form decision`);
  }
}

const restricted = fs.readFileSync('lib/assessment-measures-rights-review.ts', 'utf8');
const restrictedMarker = 'export const assessmentMeasuresRightsReview: AssessmentMeasureRightsReviewItem[] = [';
const restrictedBody = restricted.includes(restrictedMarker) ? restricted.slice(restricted.indexOf(restrictedMarker)) : '';
const restrictedSlugs = [...restrictedBody.matchAll(/\n\s*\{\n\s{4}slug:\s*'([^']+)'/g)].map((m) => m[1]);
if (restrictedSlugs.length < 11) fail(`expected at least 11 reference-only/restricted measures, found ${restrictedSlugs.length}`);
for (const slug of restrictedSlugs) if (unique.has(slug)) fail(`${slug}: restricted/reference-only instrument also appears in reusable catalog`);
if (!/rightsVerifiedOn:\s*'\d{4}-\d{2}-\d{2}'/.test(restrictedBody)) fail('restricted rights review lacks verification dates');

const rightsRegister = fs.readFileSync('app/assessment-measures/rights-register/page.tsx', 'utf8');
for (const marker of ['حقوق الأداة الأصلية لا تعمم على ترجمتها العربية', 'مجاني', 'مصدر الحقوق']) {
  if (!rightsRegister.includes(marker)) fail(`rights register missing conservative rights marker: ${marker}`);
}

console.log('ASSESSMENT_MEASURES_RIGHTS_INTEGRITY_SUMMARY');
console.log(JSON.stringify({
  publishedMeasures: blocks.length,
  publicDomain,
  openReuse,
  translationEvidenceRecords: translationEvidence,
  arabicFullPublished,
  restrictedReferenceOnly: restrictedSlugs.length,
  wavesCovered: 12,
}, null, 2));

if (failed) process.exit(1);
console.log('Assessment Measures rights integrity contract passed across Waves 1-12.');
