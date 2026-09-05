import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`COS_INSTRUMENT_MAPPING_WAVE2_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const basePath = 'lib/core-outcome-sets/instrument-crosswalk.ts';
const wave2Path = 'lib/core-outcome-sets/instrument-crosswalk-wave2.ts';
const wave2DataPaths = [
  'lib/core-outcome-sets/instrument-crosswalk-wave2-addiction.ts',
  'lib/core-outcome-sets/instrument-crosswalk-wave2-autism.ts',
  'lib/core-outcome-sets/instrument-crosswalk-wave2-childhood-cancer.ts',
];
const registryPath = 'lib/core-outcome-sets/instrument-crosswalk-registry.ts';
const coveragePath = 'lib/core-outcome-sets/measurement-coverage.ts';
const detailPath = 'app/core-outcome-sets/[slug]/page.tsx';
const pagePath = 'app/core-outcome-sets/instrument-crosswalk/page.tsx';
const cosRegistryPath = 'lib/core-outcome-sets/registry.ts';

for (const file of [basePath, wave2Path, ...wave2DataPaths, registryPath, coveragePath, detailPath, pagePath, cosRegistryPath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const base = read(basePath);
const wave2Entry = read(wave2Path);
const wave2 = wave2DataPaths.map(read).join('\n');
const aggregate = read(registryPath);
const coverage = read(coveragePath);
const detail = read(detailPath);
const page = read(pagePath);
const cosRegistry = read(cosRegistryPath);

assert(wave2Entry.includes('addictionInstrumentMappings'), 'Wave 2 entry must aggregate addiction mappings');
assert(wave2Entry.includes('autismInstrumentMappings'), 'Wave 2 entry must aggregate autism mappings');
assert(wave2Entry.includes('childhoodCancerInstrumentMappings'), 'Wave 2 entry must aggregate childhood-cancer mappings');

const wave2RecordCount = (wave2.match(/\bid:\s*'/g) || []).length;
assert(wave2RecordCount >= 25, `Wave 2 must retain at least 25 source-verified mapping records; found ${wave2RecordCount}`);

for (const id of [
  'top-addiction-ichom',
  'promis-alcohol-use-7a',
  'promis-substance-use-7a',
  'promis-nicotine-dependence-8a',
  'heaviness-of-smoking-index',
  'pgsi',
  'igdt-10',
  'whodas-addiction-source-level',
  'sure-addiction',
  'promis-global-health-addiction-items',
  'rbs-r-autism',
  'srs-autism',
  'vineland-autism',
  'pac-autism',
  'cfql-2-autism',
  'mcmaster-fad-autism',
  'panas-autism',
  'cbcl-autism',
  'bisq-autism',
  'phq-2-autism',
  'faces-autism',
  'empathy-quotient-autism',
  'psq-autism',
  'pedsql-4-generic-core-23',
  'pedsql-multidimensional-fatigue-18',
]) {
  assert(wave2.includes(`id: '${id}'`), `Wave 2 mapping missing ${id}`);
}

assert(wave2.includes('10.3390/jcm13072154'), 'Addiction mappings must retain the 2024 ICHOM source DOI');
assert(wave2.includes('patient-centered-outcome-measure/autism-spectrum-disorder'), 'Autism mappings must retain the official ICHOM implementation source');
assert(wave2.includes('10.1038/s41591-023-02339-y'), 'Childhood-cancer mappings must retain the Nature Medicine consensus source DOI');
assert(wave2.includes('10.1111/j.1471-6712.2011.00889.x'), 'PedsQL Generic Arabic Jordan evidence must remain traceable');
assert(wave2.includes('10.1080/24694193.2017.1316791'), 'PedsQL Fatigue Arabic Jordan evidence must remain traceable');
assert(wave2.includes("rightsStatus: 'owner-conditions'"), 'Wave 2 must retain owner-controlled instruments');
assert(wave2.includes("rightsStatus: 'license-or-permission-required'"), 'Wave 2 must retain permission/licensing-controlled instruments');
assert(wave2.includes("arabicEvidence: 'psychometric-context'"), 'Wave 2 must retain context-specific Arabic psychometric evidence');
assert(wave2.includes("arabicEvidence: 'not-audited'"), 'Wave 2 must retain explicit Arabic evidence gaps');
assert(wave2.includes('publication does not specify a length/version'), 'Addiction WHODAS mapping must preserve unresolved exact-version status');
assert(wave2.includes('free/low-cost') && wave2.includes('لا يُعامل كإذن إعادة نشر'), 'Autism Track B cost/access language must not be converted into blanket republication permission');

for (const protectedOutcomeOnlySlug of [
  'opioid-use-disorder-cos',
  'critical-illness-physical-rehabilitation-practice',
  'genetic-intellectual-disability-core-pro-set',
  'international-burn-care-cos',
]) {
  assert(!wave2.includes(`'${protectedOutcomeOnlySlug}'`), `Wave 2 must not invent instrument mappings for outcome-only COS ${protectedOutcomeOnlySlug}`);
}

assert(aggregate.includes('baseInstrumentCrosswalk'), 'Aggregate registry must preserve the reviewed base crosswalk');
assert(aggregate.includes('instrumentCrosswalkWave2Seed'), 'Aggregate registry must include Wave 2 source mappings');
assert(aggregate.includes("record.id !== 'kidscreen-10'"), 'Aggregate registry must retain the KIDSCREEN-10 source upgrade');
assert(aggregate.includes("'addiction-ichom-standard-set'"), 'KIDSCREEN-10 must also link to the addiction ICHOM Standard Set');
assert(aggregate.includes('fully open-access'), 'KIDSCREEN-10 must preserve official open-access provenance');
assert(aggregate.includes('Arabic/Arabian') || aggregate.includes('العربية/Arabian'), 'KIDSCREEN-10 must preserve official Arabic language availability');
assert(aggregate.includes('wave2AutomaticPromotionBlockedIds'), 'Wave 2 must retain conservative exact-version auto-promotion safeguards');
assert(aggregate.includes("catalogSync: 'rights-conflict'"), 'Aggregate registry must prevent catalog matches from overriding rights restrictions');

assert(coverage.includes("instrument-crosswalk-registry'"), 'COS coverage must read the aggregated crosswalk');
assert(detail.includes("instrument-crosswalk-registry'"), 'COS detail pages must read the aggregated crosswalk');
assert(page.includes("instrument-crosswalk-registry'"), 'Crosswalk page must read the aggregated registry');
assert(page.includes('instrumentCrosswalkStats.wave2'), 'Crosswalk page must expose Wave 2 size');
assert(page.includes('instrumentCrosswalkStats.officialArabicTranslation'), 'Crosswalk page must expose official Arabic translation count separately from psychometric evidence');

const extractLinkedSlugs = (source) => {
  const slugs = new Set();
  for (const match of source.matchAll(/linkedCosSlugs:\s*\[([^\]]*)\]/g)) {
    for (const slugMatch of match[1].matchAll(/'([a-z0-9-]+)'/g)) slugs.add(slugMatch[1]);
  }
  return slugs;
};
const extractRegistrySlugs = (source) => new Set([...source.matchAll(/\bslug:\s*'([a-z0-9-]+)'/g)].map((match) => match[1]));

const mappedSlugs = new Set([...extractLinkedSlugs(base), ...extractLinkedSlugs(wave2)]);
const registrySlugs = extractRegistrySlugs(cosRegistry);
const unmapped = [...registrySlugs].filter((slug) => !mappedSlugs.has(slug)).sort();
const expectedOutcomeOnly = [
  'critical-illness-physical-rehabilitation-practice',
  'genetic-intellectual-disability-core-pro-set',
  'international-burn-care-cos',
  'opioid-use-disorder-cos',
].sort();

assert(mappedSlugs.has('addiction-ichom-standard-set'), 'Addiction ICHOM must be mapped after Wave 2');
assert(mappedSlugs.has('autism-ichom-standard-set'), 'Autism ICHOM must be mapped after Wave 2');
assert(mappedSlugs.has('childhood-cancer-quality-of-survival'), 'Childhood cancer COS must be mapped after Wave 2');
assert(unmapped.length === expectedOutcomeOnly.length && unmapped.every((slug, index) => slug === expectedOutcomeOnly[index]), `Only the four not-established COS records may remain unmapped; found: ${unmapped.join(', ')}`);

if (!process.exitCode) {
  console.log(`COS_INSTRUMENT_MAPPING_WAVE2_OK records=${wave2RecordCount} mapped_cos=${mappedSlugs.size} outcome_only_unmapped=${unmapped.length}`);
}
