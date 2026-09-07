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

function findOverrideBlock(catalog, slug) {
  const marker = `  '${slug}': {`;
  const start = catalog.indexOf(marker);
  if (start < 0) return '';
  const next = catalog.slice(start + marker.length).search(/\n  '[^']+': \{/);
  const endObject = catalog.indexOf('\n};', start + marker.length);
  if (next >= 0) return catalog.slice(start, start + marker.length + next);
  if (endObject >= 0) return catalog.slice(start, endObject);
  return catalog.slice(start);
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

const catalog = fs.readFileSync('lib/assessment-measures-catalog.ts', 'utf8');
const operationalCatalog = fs.readFileSync('lib/assessment-measure-operational-catalog.ts', 'utf8');
const rightsDimensions = fs.readFileSync('lib/assessment-measures-rights-dimensions.ts', 'utf8');
const allMeasureSource = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const slugs = blocks.map((x) => x.slug);
const unique = new Set(slugs);
if (blocks.length !== 83) fail(`expected exactly 83 published measures across Waves 1-12, found ${blocks.length}`);
if (unique.size !== blocks.length) fail('duplicate published measure slug detected');
if (/http:\/\//.test(allMeasureSource + catalog)) fail('measure and override sources must not contain insecure HTTP URLs');

let publicDomain = 0;
let openReuse = 0;
let arabicFullPublishedDeclared = 0;
let arabicFullPublishedEffective = 0;
let translationEvidence = 0;
let effectiveRightsSources = 0;

const explicitlyVerifiedArabicRepublishing = new Set([
  'timed-up-and-go',
  '10-meter-walk-test',
  '6-minute-walk-test',
  'patient-health-questionnaire-2',
  'generalized-anxiety-disorder-2',
]);

for (const { slug, file, block } of blocks) {
  const override = findOverrideBlock(catalog, slug);
  const effective = `${block}\n${override}`;
  const rights = effective.match(/rightsStatus:\s*'(public-domain|open-reuse)'/)?.[1];
  if (!rights) fail(`${slug}: missing supported original-instrument rights status (${file})`);
  if (rights === 'public-domain') publicDomain += 1;
  if (rights === 'open-reuse') openReuse += 1;

  if (!/rightsVerifiedOn:\s*'\d{4}-\d{2}-\d{2}'/.test(effective)) fail(`${slug}: missing rights verification date (${file})`);
  if (!/rightsNote:\s*['`]/.test(effective)) fail(`${slug}: missing rights interpretation note (${file})`);
  if (!/rightsLabel:\s*['`]/.test(effective)) fail(`${slug}: missing rights label (${file})`);
  if (!/arabicStatus:\s*'[^']+'/.test(effective)) fail(`${slug}: missing Arabic-version status (${file})`);
  if (!/arabicNote:\s*['`]/.test(effective)) fail(`${slug}: missing Arabic-version note (${file})`);
  if (!/fullArabicFormPublished:\s*(true|false)/.test(effective)) fail(`${slug}: missing Arabic full-form publication decision (${file})`);
  if (!/fullArabicFormNote:\s*['`]/.test(effective)) fail(`${slug}: missing Arabic full-form rights note (${file})`);

  if (!/role:\s*'rights'/.test(effective)) fail(`${slug}: no explicit rights-role source in base record or effective catalog override (${file})`);
  else effectiveRightsSources += 1;

  if (/role:\s*'translation'/.test(effective)) translationEvidence += 1;

  const declaredFull = /fullArabicFormPublished:\s*true/.test(effective);
  if (declaredFull) arabicFullPublishedDeclared += 1;
  const hardened = slug === 'heaviness-of-smoking-index';
  const effectiveFull = declaredFull && !hardened;
  if (effectiveFull) arabicFullPublishedEffective += 1;

  if (effectiveFull && !explicitlyVerifiedArabicRepublishing.has(slug)) {
    fail(`${slug}: effective Arabic full-form publication is not in the independently verified allowlist`);
  }

  if (/arabicStatus:\s*'(validated-version-reported|translation-reported)'/.test(effective) && !/fullArabicFormPublished:\s*(true|false)/.test(effective)) {
    fail(`${slug}: Arabic evidence must not be treated as redistribution permission without a separate full-form decision`);
  }
}

if (!operationalCatalog.includes("'heaviness-of-smoking-index'")) fail('HSI must remain fail-closed in the operational catalog until Arabic translation/republication rights are independently documented');
if (!rightsDimensions.includes("'heaviness-of-smoking-index'")) fail('HSI fail-closed status must remain visible in the public rights dimensions register');

const restricted = fs.readFileSync('lib/assessment-measures-rights-review.ts', 'utf8');
const restrictedMarker = 'export const assessmentMeasuresRightsReview: AssessmentMeasureRightsReviewItem[] = [';
const restrictedBody = restricted.includes(restrictedMarker) ? restricted.slice(restricted.indexOf(restrictedMarker)) : '';
const restrictedSlugs = [...restrictedBody.matchAll(/\n\s*\{\n\s{4}slug:\s*'([^']+)'/g)].map((m) => m[1]);
if (restrictedSlugs.length < 11) fail(`expected at least 11 reference-only/restricted measures, found ${restrictedSlugs.length}`);
for (const slug of restrictedSlugs) if (unique.has(slug)) fail(`${slug}: restricted/reference-only instrument also appears in reusable catalog`);
for (const slug of restrictedSlugs) {
  const marker = `slug: '${slug}'`;
  const start = restrictedBody.indexOf(marker);
  const next = restrictedBody.indexOf("\n  {\n    slug: '", start + marker.length);
  const item = restrictedBody.slice(start, next >= 0 ? next : restrictedBody.length);
  if (!/rightsVerifiedOn:\s*'\d{4}-\d{2}-\d{2}'/.test(item)) fail(`${slug}: restricted reference lacks rights verification date`);
  if (!/rightsSource:\s*'https:\/\//.test(item)) fail(`${slug}: restricted reference lacks HTTPS rights source`);
  if (!/whyReferenceOnly:/.test(item)) fail(`${slug}: restricted reference lacks reason for reference-only treatment`);
  if (!/safeUseOnRawafid:/.test(item)) fail(`${slug}: restricted reference lacks safe-use policy`);
}

const rightsRegister = fs.readFileSync('app/assessment-measures/rights-register/page.tsx', 'utf8');
for (const marker of [
  'حقوق الأداة الأصلية لا تعمم على ترجمتها العربية',
  'مجاني',
  'الأداة الأصلية',
  'وثيقة المصدر',
  'النسخة/الدليل العربي',
  'إعادة نشر النص العربي',
]) {
  if (!rightsRegister.includes(marker)) fail(`rights register missing conservative rights marker: ${marker}`);
}

console.log('ASSESSMENT_MEASURES_RIGHTS_INTEGRITY_SUMMARY');
console.log(JSON.stringify({
  publishedMeasures: blocks.length,
  publicDomain,
  openReuse,
  effectiveRightsSources,
  translationEvidenceRecords: translationEvidence,
  arabicFullPublishedDeclared,
  arabicFullPublishedEffective,
  hsiArabicOperationalForm: 'withheld-fail-closed',
  restrictedReferenceOnly: restrictedSlugs.length,
  wavesCovered: 12,
}, null, 2));

if (failed) process.exit(1);
console.log('Assessment Measures rights integrity contract passed across Waves 1-12 with independent rights dimensions.');
