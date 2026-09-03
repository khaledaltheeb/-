import fs from 'node:fs';

const route = fs.readFileSync('app/evidence-guides/social-work/[[...slug]]/route.ts', 'utf8');
const layer = fs.readFileSync('lib/social-work-curated-direct-email-sources.ts', 'utf8');
const coverage = JSON.parse(fs.readFileSync('data/social-work-recovery/email-source-coverage-20260903.json', 'utf8'));
const provenance = fs.readFileSync('lib/social-work-provenance-repair.ts', 'utf8');

function fail(message) {
  console.error(`social-work-email-source-coverage-contract: ${message}`);
  process.exit(1);
}

const directFingerprints = [
  'DRUG4023',
  '2016091213042605',
  'c5aa171b-223d-43b7-9778-05a0d8cede8e',
  'berufskodex_de_2026-07.pdf',
  'code_de_deontologie_fr_2026-07.pdf',
  'pktc.lt/metodine-informacija/metodine-medziaga',
  'f596df101af111eeb233e8b04dc9bb3d',
];

for (const fingerprint of directFingerprints) {
  if (!layer.includes(fingerprint) && !JSON.stringify(coverage).includes(fingerprint)) {
    fail(`direct-email source fingerprint missing: ${fingerprint}`);
  }
}

const directEmailUids = ['UID 391', 'UID 406', 'UID 436', 'UID 505', 'UID 520', 'UID 521'];
for (const uid of directEmailUids) {
  if (!JSON.stringify(coverage).includes(uid)) fail(`email provenance UID missing: ${uid}`);
}

const curatedCoverageSlugs = [
  'participation-and-voice',
  'supported-decision-making',
  'ethics-power-autonomy',
  'privacy-information-sharing',
  'documenting-disagreement',
  'institutional-advocacy',
  'community-resource-map',
  'service-coordination',
  'professional-persistence',
  'help-plan-quality-audit',
  'family-burden-monitoring',
  'poverty-structural-barriers',
  'community-independence-plan',
  'service-exit-plan',
];
for (const slug of curatedCoverageSlugs) {
  if (!layer.includes(`'${slug}'`)) fail(`curated direct-email mapping missing: ${slug}`);
}

if (!route.includes('enrichCuratedPageWithDirectEmailSources')) fail('curated direct-email source layer is not wired into route');
if (!route.includes('SOCIAL_WORK_DIRECT_EMAIL_SOURCE_RELEASE')) fail('route provenance header lacks direct-email source release');
if (!layer.includes("origin: 'direct_email' | 'discovered_within_direct_email_resource'")) fail('source origin taxonomy missing');
if (!layer.includes('لا نضيف المصدر لمجرد وصوله بالبريد')) fail('selective-use disclosure missing');
if (!layer.includes('القانون والأنظمة الوطنية تبقى محلية')) fail('jurisdiction boundary missing');

const coverageText = JSON.stringify(coverage);
if (!coverageText.includes('independently_discovered')) fail('independent-source provenance category missing');
if (!coverageText.includes('This URL was not directly supplied by the Slovenian Association')) fail('201709 Ljubljana provenance guard missing');
if (!coverageText.includes('Legacy generator incorrectly called this the emailed source')) fail('201508 Ljubljana legacy-error disclosure missing');
if (!coverageText.includes('older 2025 PDF URL')) fail('AvenirSocial stale generator issue is not recorded');

if (!provenance.includes('LEGACY_ARCHIVE_URL')) fail('legacy Ljubljana render-time provenance repair missing');
if (!provenance.includes('2016091213042605')) fail('directly supplied Ljubljana URL missing from repair layer');

console.log('social-work-email-source-coverage-contract: OK');
