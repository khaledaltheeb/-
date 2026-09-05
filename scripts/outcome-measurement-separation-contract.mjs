import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`OUTCOME_MEASUREMENT_SEPARATION_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const cosPagePath = 'app/core-outcome-sets/page.tsx';
const cosDetailPath = 'app/core-outcome-sets/[slug]/page.tsx';
const cosCrosswalkPagePath = 'app/core-outcome-sets/instrument-crosswalk/page.tsx';
const cosRegistryPath = 'lib/core-outcome-sets/registry.ts';
const cosCrosswalkPath = 'lib/core-outcome-sets/instrument-crosswalk.ts';
const cosCoveragePath = 'lib/core-outcome-sets/measurement-coverage.ts';
const searchPath = 'app/search/page.tsx';
const labPath = 'app/assessment-lab/page.tsx';
const measuresPath = 'app/assessment-measures/page.tsx';
const methodologyPath = 'app/assessment-measures/methodology/page.tsx';
const sitemapPath = 'app/sitemaps/static.xml/route.ts';

assert(exists(cosPagePath), 'Core Outcome Sets page must exist');
assert(exists(cosDetailPath), 'Core Outcome Set detail route must exist');
assert(exists(cosCrosswalkPagePath), 'COS instrument crosswalk page must exist');
assert(exists(cosRegistryPath), 'Core Outcome Set registry must exist');
assert(exists(cosCrosswalkPath), 'COS instrument crosswalk data must exist');
assert(exists(cosCoveragePath), 'COS measurement coverage audit must exist');
assert(exists(searchPath), 'Unified search page must exist');
assert(exists(labPath), 'Assessment Lab page must exist');
assert(exists(measuresPath), 'Assessment Measures page must exist');
assert(exists(methodologyPath), 'Assessment Measures methodology page must exist');

if (exists(cosPagePath)) {
  const cos = read(cosPagePath);
  assert(cos.includes('ماذا ينبغي قياسه؟'), 'COS page must explicitly answer WHAT to measure');
  assert(cos.includes('ليست استبيانًا'), 'COS page must state that a COS is not a questionnaire');
  assert(cos.includes('COMS — Core Outcome Measurement Set'), 'COS page must distinguish COMS from COS');
  assert(cos.includes('الحالة أو المجال الصحي'), 'COS scope must include health condition/domain');
  assert(cos.includes('السكان المستهدفون'), 'COS scope must include target population');
  assert(cos.includes('التدخلات'), 'COS scope must include intervention applicability');
  assert(cos.includes('تبنّي أو تكييف COS للسياق العربي ≠ تكييف أداة القياس إلى العربية'), 'COS contextual adoption/adaptation must remain separate from Arabic instrument adaptation');
  assert(cos.includes('ترجمة أو تلخيص COS بالعربية لا يثبت ملاءمته الثقافية للسياق العربي'), 'Arabic translation of a COS must not be presented as proof of contextual applicability');
  assert(cos.includes('ملاءمة مجموعة النتائج') || cos.includes('ملاءمة <strong>مجموعة النتائج</strong>'), 'COS page must preserve the distinction between outcome-set applicability and instrument applicability');
  assert(cos.includes('https://doi.org/10.1186/s13063-026-09834-w'), 'COS contextual-adaptation section must retain the Kenya adoption/adaptation example');
  assert(cos.includes('حقوق + تكييف لغوي/ثقافي + تحقق سيكومتري مناسب'), 'Arabic status must not collapse rights, adaptation and psychometrics');
  assert(cos.includes('https://www.comet-initiative.org/Studies'), 'COS page must link to the COMET database');
  assert(cos.includes('https://www.cosmin.nl/finding-right-tool/developing-core-outcome-set/'), 'COS page must link to COSMIN/COMET instrument-selection guidance');
  assert(cos.includes('id="registry"'), 'COS landing page must expose the operational registry');
  assert(cos.includes('coreOutcomeRegistry.map'), 'COS landing page must render registry records from structured data');
}

if (exists(cosRegistryPath)) {
  const registry = read(cosRegistryPath);
  const slugCount = (registry.match(/\bslug:\s*'/g) || []).length;
  assert(slugCount >= 12, `Operational COS registry must contain at least 12 verified records; found ${slugCount}`);
  for (const field of ['measurementStatus', 'arabicReview', 'cometUrl', 'lastVerified', 'qualityNote', 'rawafidSectors']) {
    assert(registry.includes(field), `COS registry must preserve field: ${field}`);
  }
  for (const requiredSlug of [
    'addiction-ichom-standard-set',
    'opioid-use-disorder-cos',
    'autism-ichom-standard-set',
    'youth-anxiety-depression-ocd-ptsd-ichom',
    'childhood-cancer-quality-of-survival',
    'cerebral-palsy-lower-limb-surgery',
    'musculoskeletal-rehabilitation-core-measures',
    'critical-illness-physical-rehabilitation-practice',
    'adult-depression-anxiety-ichom-standard-set',
    'adult-epilepsy-ichom-standard-set',
    'genetic-intellectual-disability-core-pro-set',
    'international-burn-care-cos',
  ]) {
    assert(registry.includes(`slug: '${requiredSlug}'`), `COS registry must retain seeded record ${requiredSlug}`);
  }
  assert(registry.includes("instrumentAdaptation: 'not-assessed'"), 'Registry must not imply Arabic instrument validation without evidence');
  assert(registry.includes("measurementStatus: 'not-established'"), 'Registry must support an explicit no-COMS/not-established state');
  assert(registry.includes("stage: 'published'"), 'Registry must support published records whose COMET Current Stage is not applicable instead of mislabelling them completed');
  assert(registry.includes('Current Stage: Not Applicable'), 'Published ICHOM mental-health record must preserve COMET stage nuance');
  assert(registry.includes('Core PROM Set لم يُحسم بعد'), 'GID record must preserve the separation between the 2026 core PRO set and future PROM selection');
}

if (exists(cosCrosswalkPath)) {
  const crosswalk = read(cosCrosswalkPath);
  const recordCount = (crosswalk.match(/\bid:\s*'/g) || []).length;
  assert(recordCount >= 12, `Instrument crosswalk must contain at least 12 audited instrument records; found ${recordCount}`);
  for (const field of ['rawafidStatus', 'rightsStatus', 'arabicEvidence', 'arabicEvidenceNote', 'linkedCosSlugs', 'lastVerified']) {
    assert(crosswalk.includes(field), `Instrument crosswalk must preserve field: ${field}`);
  }
  for (const requiredInstrument of ['phq-9', 'gad-7', 'whodas-2-12', 'rcads', 'c-ssrs-screening', 'gad-2', 'qolie-10', 'promis-cognition-sleep', 'gmfm', 'promis-pain-fatigue', 'eq-5d-5l']) {
    assert(crosswalk.includes(`id: '${requiredInstrument}'`), `Instrument crosswalk must retain audited record ${requiredInstrument}`);
  }
  assert(crosswalk.includes("rawafidStatus: 'operational-full'"), 'Crosswalk must distinguish operational instruments');
  assert(crosswalk.includes("rawafidStatus: 'reference-rights'"), 'Crosswalk must distinguish rights-limited references');
  assert(crosswalk.includes("rawafidStatus: 'not-in-library'"), 'Crosswalk must expose library gaps rather than hiding them');
  assert(crosswalk.includes('دليل RCADS-25 العربي') || crosswalk.includes('RCADS25-Arabic'), 'Crosswalk must preserve exact-version caveat for RCADS');
  assert(crosswalk.includes('دليل GAD-7 العربي لا يُنقل تلقائيًا إلى GAD-2'), 'Crosswalk must prevent parent-instrument evidence from being transferred to GAD-2');
  assert(crosswalk.includes('الأردن') && crosswalk.includes('Columbia Lighthouse Project'), 'C-SSRS record must preserve country-specific Arabic translation provenance');
  assert(crosswalk.includes('HealthMeasures') && crosswalk.includes('ترجمات PROMIS محمية'), 'PROMIS records must preserve translation permissions');
  assert(crosswalk.includes("catalogSync?: 'seed'"), 'Crosswalk must retain catalog synchronization state');
  assert(crosswalk.includes('automaticPromotionBlockedIds'), 'Crosswalk must retain exact-version family promotion safeguards');
}

if (exists(cosCoveragePath)) {
  const coverage = read(cosCoveragePath);
  assert(coverage.includes('linkedCosSlugs.includes(record.slug)'), 'Coverage audit must derive mappings from structured crosswalk links');
  assert(coverage.includes("record.measurementStatus === 'explicit'"), 'Coverage audit must distinguish explicit measurement recommendations');
  assert(coverage.includes("record.measurementStatus === 'linked'"), 'Coverage audit must distinguish linked measurement recommendations');
  assert(coverage.includes("coverageStatus: 'outcome-only'"), 'Coverage audit must preserve an outcome-only/no-established-HOW state');
  assert(coverage.includes('mappedInstrumentCount: 0'), 'Coverage audit must explicitly represent unmapped COS records');
  assert(coverage.includes('measurementCoverageStats'), 'Coverage audit must expose aggregate COS coverage statistics');
  assert(coverage.includes('unmappedCoreOutcomeMeasurementCoverage'), 'Coverage audit must expose the actionable unmapped COS queue');
}

if (exists(cosCrosswalkPagePath)) {
  const crosswalkPage = read(cosCrosswalkPagePath);
  assert(crosswalkPage.includes('قاعدة exact-version'), 'Crosswalk page must explain exact-version matching');
  assert(crosswalkPage.includes('instrumentCrosswalk.map'), 'Crosswalk page must render structured instrument records');
  assert(crosswalkPage.includes('كيف نقرر أن الأداة «جاهزة بالعربية»؟'), 'Crosswalk page must expose Arabic readiness criteria');
  assert(crosswalkPage.includes('C-SSRS تحتاج تدريبًا'), 'Crosswalk page must preserve safety boundary for suicide-risk tools');
  assert(crosswalkPage.includes('measurementCoverageStats'), 'Crosswalk page must expose COS-level mapping coverage statistics');
  assert(crosswalkPage.includes('unmappedCoreOutcomeMeasurementCoverage.map'), 'Crosswalk page must render the unmapped COS audit queue');
  assert(crosswalkPage.includes('«لا mapping في روافد» ≠ «لا توجد أداة»'), 'Crosswalk page must not equate a Rawafid mapping gap with global instrument absence');
  assert(crosswalkPage.includes('لا نخترع HOW'), 'Crosswalk page must preserve the no-invented-measurement boundary');
}

if (exists(cosDetailPath)) {
  const detail = read(cosDetailPath);
  assert(detail.includes('generateStaticParams'), 'COS detail pages must be statically enumerable');
  assert(detail.includes('getCoreOutcomeRecord'), 'COS detail page must resolve structured registry data');
  assert(detail.includes('getInstrumentCrosswalkForCos'), 'COS detail page must resolve linked instrument crosswalk records');
  assert(detail.includes('حالة التقييم العربي'), 'COS detail page must expose Arabic review status');
  assert(detail.includes('كيف نقيس؟ — COMS / measurement recommendations'), 'COS detail page must separate HOW from WHAT');
  assert(detail.includes('ما حالة الأدوات المرتبطة بهذا COS داخل روافد؟'), 'COS detail page must expose linked instrument readiness');
  assert(detail.includes('السجل الأصلي في COMET'), 'COS detail page must preserve source traceability');
}

if (exists(searchPath)) {
  const search = read(searchPath);
  assert(search.includes("coreOutcomeRegistry"), 'Unified search must import the structured COS registry');
  assert(search.includes('function searchCoreOutcomeSets'), 'Unified search must expose a dedicated COS search function');
  assert(search.includes('const coreOutcomeSets = searchCoreOutcomeSets'), 'Unified search pipeline must execute COS search');
  assert(search.includes('...coreOutcomeSets'), 'COS search results must participate in unified result ranking');
  assert(search.includes('/core-outcome-sets/${item.slug}/'), 'COS search results must resolve to detail pages');
  assert(search.includes("href=\"/core-outcome-sets/\""), 'Search discovery UI must expose the COS registry');
  assert(search.includes('مجموعات النتائج الأساسية'), 'Search explanatory copy must mention Core Outcome Sets as a distinct content layer');
}

if (exists(labPath)) {
  const lab = read(labPath);
  assert(lab.includes('WHAT → HOW → QUALITY → ARABIC'), 'Assessment Lab must expose the measurement decision map');
  assert(lab.includes('Core Outcome Set — ماذا نقيس؟'), 'Assessment Lab must distinguish Core Outcome Sets');
  assert(lab.includes('Outcome Measurement Instrument — كيف نقيس؟'), 'Assessment Lab must distinguish measurement instruments');
  assert(lab.includes('/assessment-measures/methodology/#measurement-properties'), 'Assessment Lab must link to measurement-properties methodology');
  assert(lab.includes('/assessment-measures/methodology/#arabic-adaptation'), 'Assessment Lab must link to Arabic adaptation methodology');
  assert(lab.includes('ليست Core Outcome Sets'), 'Rawafid self-monitoring tools must not be presented as COS');
}

if (exists(measuresPath)) {
  const measures = read(measuresPath);
  assert(measures.includes('HOW TO MEASURE'), 'Measurement library must identify itself as the HOW layer');
  assert(measures.includes('/core-outcome-sets/'), 'Measurement library must link back to Core Outcome Sets');
  assert(measures.includes('COS ≠ أداة قياس'), 'Measurement library must explicitly separate COS from instruments');
  assert(measures.includes('Core Outcome Measurement Set (COMS)'), 'Measurement library must recognize COMS when present');
}

if (exists(methodologyPath)) {
  const methodology = read(methodologyPath);
  assert(methodology.includes('id="measurement-properties"'), 'Methodology must expose a stable measurement-properties anchor');
  assert(methodology.includes('id="arabic-adaptation"'), 'Methodology must expose a stable Arabic-adaptation anchor');
  for (const property of [
    'Content validity',
    'Structural validity',
    'Internal consistency',
    'Reliability',
    'Measurement error',
    'Hypotheses testing for construct validity',
    'Cross-cultural validity / measurement invariance',
    'Criterion validity',
    'Responsiveness',
  ]) {
    assert(methodology.includes(property), `Methodology must retain COSMIN property: ${property}`);
  }
  assert(methodology.includes('ليسا خصائص قياس'), 'Methodology must distinguish interpretability and feasibility from measurement properties');
  assert(methodology.includes('الترجمة أو التكييف اللغوي ليست بحد ذاتها «خاصية سيكومترية»'), 'Methodology must distinguish translation from psychometric validation');
  assert(methodology.includes('حالة الحقوق ≠ حالة الترجمة ≠ التكييف الثقافي ≠ التحقق السيكومتري ≠ التكافؤ بين اللغات'), 'Arabic status dimensions must remain separate');
}

if (exists(sitemapPath)) {
  const sitemap = read(sitemapPath);
  assert(sitemap.includes("path:'/core-outcome-sets/'"), 'Static sitemap must include Core Outcome Sets');
  assert(sitemap.includes("path:'/core-outcome-sets/instrument-crosswalk/'"), 'Static sitemap must include COS instrument crosswalk');
  assert(sitemap.includes('coreOutcomeRegistrySlugs'), 'Static sitemap must include COS registry detail routes');
}

const assessmentContract = read('scripts/assessment-lab-contract.mjs');
assert(assessmentContract.includes('70') || assessmentContract.includes('assessmentSlugs'), 'Existing Assessment Lab preservation contract must remain present');

if (!process.exitCode) {
  console.log('OUTCOME_MEASUREMENT_SEPARATION_OK');
}
