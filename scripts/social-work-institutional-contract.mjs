import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`SOCIAL WORK INSTITUTIONAL CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

const route = read('app/evidence-guides/social-work/[[...slug]]/route.ts');
const layer = read('lib/social-work-institutional-enrichment.ts');
const comparative = read('lib/social-work-comparative-pages.ts');
const talentia = read('lib/social-work-talentia-pages.ts');
const recovered = read('lib/social-work-pages.generated.ts');
const ledger = JSON.parse(read('data/social-work-recovery/institutional-source-ledger-20260902.json'));

const recoveredKeys = [...recovered.matchAll(/^\s{2}"([^"]+)":/gm)].map((match) => match[1]);
const talentiaKeys = [...talentia.matchAll(/^\s{2}'([^']+)':/gm)].map((match) => match[1]);
const comparativeKeys = [...comparative.matchAll(/\{slug:'([^']+)'/g)].map((match) => match[1]);
const allContentKeys = new Set([...recoveredKeys.filter(Boolean), ...talentiaKeys.filter(Boolean), ...comparativeKeys.filter(Boolean)]);

if (!route.includes('enrichSocialWorkInstitutionalPage')) fail('route does not invoke the institutional enrichment layer');
const directInstitutionalCalls = (route.match(/enrichSocialWorkInstitutionalPage\(/g) || []).length;
const finalizerCalls = (route.match(/finalizeSocialWorkPage\(/g) || []).length;
const htmlResponseCalls = (route.match(/htmlResponse\(/g) || []).length;
const centralizedCoverage =
  route.includes('function finalizeSocialWorkPage') &&
  route.includes('function htmlResponse') &&
  route.includes('new Response(finalizeSocialWorkPage(html, key)') &&
  directInstitutionalCalls >= 1 &&
  finalizerCalls >= 2 &&
  htmlResponseCalls >= 4;
const legacyCoverage = directInstitutionalCalls >= 3;
if (!centralizedCoverage && !legacyCoverage) fail('institutional layer must cover comparative, Talentia and recovered routes, directly or through the shared response/finalizer chain');
if (!route.includes('institutional-evidence-${SOCIAL_WORK_INSTITUTIONAL_RELEASE}')) fail('response provenance header is missing institutional release');

const requiredFingerprints = [
  'DRUG4023',
  '2016091213042605',
  'c5aa171b-223d-43b7-9778-05a0d8cede8e',
  'berufskodex_de_2026-07.pdf',
  'code_de_deontologie_fr_2026-07.pdf',
  'f596df101af111eeb233e8b04dc9bb3d',
  'pktc.lt/metodine-informacija/metodine-medziaga',
  'global-social-work-statement-of-ethical-principles',
];
for (const fingerprint of requiredFingerprints) {
  if (!layer.includes(fingerprint) && !ledger.records.some((record) => JSON.stringify(record).includes(fingerprint))) {
    fail(`missing source fingerprint: ${fingerprint}`);
  }
}

if (!layer.includes('https://avenirsocial.ch/app/uploads/2025/12/berufskodex_de_2026-07.pdf')) fail('final German AvenirSocial 2026 code is missing');
if (!layer.includes('https://avenirsocial.ch/app/uploads/2025/12/code_de_deontologie_fr_2026-07.pdf')) fail('final French AvenirSocial 2026 code is missing');
if (!layer.includes(".split(STALE_AVENIR_DRAFT).join(FINAL_AVENIR_DE)")) fail('legacy AvenirSocial draft URL is not patched out at render time');
if (!layer.includes("portal/lt/legalAct/f596df101af111eeb233e8b04dc9bb3d")) fail('exact LSDA-supplied e-TAR URL is missing');

if (ledger.implementation.public_content_routes_excluding_collection_root !== 78) fail('ledger must record 78 public content routes excluding collection root');
if (recoveredKeys.filter(Boolean).length !== 55) fail(`expected 55 recovered content routes excluding root; found ${recoveredKeys.filter(Boolean).length}`);
if (new Set(talentiaKeys).size !== 7) fail(`expected 7 Talentia additive pages; found ${new Set(talentiaKeys).size}`);
if (new Set(comparativeKeys).size !== 16) fail(`expected 16 comparative additive pages; found ${new Set(comparativeKeys).size}`);
if (allContentKeys.size !== 78) fail(`expected 78 unique Social Work content routes; found ${allContentKeys.size}`);

for (const phrase of [
  'الإحالة إلى مؤسسة أو مصدر لا تعني أن المؤسسة راجعت هذه الصفحة أو اعتمدتها',
  'القانون والسياسة والأهلية ومسارات الحماية والإحالة تحتاج دائمًا تحققًا محليًا',
  'كيف نقرأ قوة الدليل هنا؟',
  'اختبار جودة سريع',
]) {
  if (!layer.includes(phrase)) fail(`governance/quality phrase missing: ${phrase}`);
}

const talentiaRecord = ledger.records.find((record) => record.organization?.startsWith('Talentia'));
const sloveniaRecord = ledger.records.find((record) => record.organization === 'Slovenian Association of Social Workers');
const avenirRecord = ledger.records.find((record) => record.organization === 'AvenirSocial, Switzerland');
const lithuaniaRecord = ledger.records.find((record) => record.organization?.startsWith('Lithuanian Association'));
if (!talentiaRecord?.status.includes('implementation update sent')) fail('Talentia implementation-update state is not tracked');
if (!sloveniaRecord?.status.includes('implementation update sent')) fail('Slovenia implementation-update state is not tracked');
if (!avenirRecord?.status.includes('not yet sent')) fail('AvenirSocial follow-up state is not tracked conservatively');
if (!lithuaniaRecord?.status.includes('not yet sent')) fail('LSDA follow-up state is not tracked conservatively');

if (!process.exitCode) {
  console.log(`SOCIAL WORK INSTITUTIONAL CONTRACT OK: ${allContentKeys.size} unique content routes; source provenance, jurisdiction boundaries and institution-wide enrichment verified.`);
}
