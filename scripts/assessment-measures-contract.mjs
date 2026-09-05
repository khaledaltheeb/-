import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`ASSESSMENT_MEASURES_CONTRACT_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

function extractMeasureBlocks(file, marker) {
  const source = read(file);
  const markerIndex = source.indexOf(marker);
  assert(markerIndex >= 0, `${file}: catalog marker is missing`);
  if (markerIndex < 0) return [];
  const body = source.slice(markerIndex);
  const matches = [...body.matchAll(/^\s{4}slug: '([^']+)',/gm)];
  return matches.map((match, index) => ({
    slug: match[1],
    file,
    block: body.slice(match.index, matches[index + 1]?.index ?? body.length),
  }));
}

const waveSpecs = [
  ['lib/assessment-measures.ts', 'export const assessmentMeasures: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave2.ts', 'export const assessmentMeasuresWave2: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave3.ts', 'export const assessmentMeasuresWave3: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave4.ts', 'export const assessmentMeasuresWave4: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave5.ts', 'export const assessmentMeasuresWave5: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave6.ts', 'export const assessmentMeasuresWave6: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave7.ts', 'export const assessmentMeasuresWave7: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave8.ts', 'export const assessmentMeasuresWave8: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave9.ts', 'export const assessmentMeasuresWave9: AssessmentMeasure[] = ['],
  ['lib/assessment-measures-wave10.ts', 'export const assessmentMeasuresWave10: AssessmentMeasure[] = ['],
];

const blocks = waveSpecs.flatMap(([file, marker]) => extractMeasureBlocks(file, marker));
assert(blocks.length >= 76, `expected at least 76 verified measures, found ${blocks.length}`);

const slugs = blocks.map((entry) => entry.slug);
const uniqueSlugs = new Set(slugs);
assert(uniqueSlugs.size === slugs.length, `duplicate measure slug detected: ${slugs.filter((slug, index) => slugs.indexOf(slug) !== index).join(', ')}`);

const allowedCategories = new Set([
  'mobility-walking',
  'balance-falls',
  'neurological-outcomes',
  'brain-injury',
  'mental-health',
  'pain-function',
  'participation',
  'older-adults',
  'rehabilitation-outcomes',
  'movement-disorders',
  'cognition-neuropsychology',
  'trauma-stress',
  'substance-use-addiction',
  'symptom-burden',
  'respiratory-function',
  'vision',
  'dermatology',
  'gastroenterology',
  'critical-care',
  'hepatology-liver-disease',
  'cardiovascular-risk',
  'infectious-disease-severity',
  'oncology-staging',
  'pediatric-puberty-development',
  'disorders-of-consciousness',
  'acute-kidney-injury',
]);
const fullArabicProtocolAllowlist = new Set(['timed-up-and-go', '10-meter-walk-test', '6-minute-walk-test']);

for (const { slug, file, block } of blocks) {
  assert(/rightsStatus: '(public-domain|open-reuse)'/.test(block), `${slug}: rightsStatus missing or unsupported (${file})`);
  assert(/rightsVerifiedOn: '\d{4}-\d{2}-\d{2}'/.test(block), `${slug}: rightsVerifiedOn missing (${file})`);
  assert(/role: 'rights'/.test(block), `${slug}: authoritative rights source missing (${file})`);
  assert(/role: 'evidence'/.test(block) || /role: 'original'/.test(block) || /role: 'translation'/.test(block), `${slug}: evidence/original/translation source missing (${file})`);
  assert(/safetyNotes: \[/.test(block), `${slug}: safety notes missing (${file})`);
  assert(/limitations: \[/.test(block), `${slug}: limitations missing (${file})`);
  assert(/administrationSteps: \[/.test(block), `${slug}: administration steps missing (${file})`);
  assert(/fullArabicFormPublished: (true|false)/.test(block), `${slug}: Arabic publication state missing (${file})`);

  if (/fullArabicFormPublished: true/.test(block)) {
    assert(fullArabicProtocolAllowlist.has(slug), `${slug}: full Arabic content is not in the verified procedural-protocol allowlist`);
  }

  const categoriesMatch = block.match(/categories: \[([^\]]*)\]/);
  assert(Boolean(categoriesMatch), `${slug}: categories missing (${file})`);
  if (categoriesMatch) {
    const categories = [...categoriesMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
    assert(categories.length > 0, `${slug}: no category assigned (${file})`);
    for (const category of categories) {
      assert(allowedCategories.has(category), `${slug}: unknown category ${category}`);
    }
  }
}

for (const { slug, block } of blocks) {
  const relatedMatch = block.match(/related: \[([^\]]*)\]/);
  assert(Boolean(relatedMatch), `${slug}: related list missing`);
  if (!relatedMatch) continue;
  const related = [...relatedMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  for (const relatedSlug of related) {
    assert(uniqueSlugs.has(relatedSlug), `${slug}: related measure does not exist: ${relatedSlug}`);
    assert(relatedSlug !== slug, `${slug}: measure cannot relate to itself`);
  }
}

const sourceFiles = waveSpecs.map(([file]) => read(file)).join('\n');
assert(!/http:\/\//.test(sourceFiles), 'measure sources must not use insecure HTTP URLs');
assert(sourceFiles.includes("const CDISC_QRS = 'https://") || sourceFiles.includes('https://www.cdisc.org/standards/foundational/qrs'), 'CDISC rights registry reference must remain HTTPS');

const catalog = read('lib/assessment-measures-catalog.ts');
for (let wave = 1; wave <= 10; wave += 1) {
  assert(catalog.includes(`assessmentMeasuresWave${wave}`), `catalog aggregator must include assessmentMeasuresWave${wave}`);
}
for (const categoryWave of [4, 6, 7, 8, 9, 10]) {
  assert(catalog.includes(`assessmentMeasureCategoriesWave${categoryWave}`), `canonical catalog must include wave-${categoryWave} category expansion`);
}

const categoryFiles = [
  ['lib/assessment-measures-wave4-categories.ts', ['movement-disorders', 'cognition-neuropsychology', 'trauma-stress', 'substance-use-addiction', 'symptom-burden', 'respiratory-function', 'vision']],
  ['lib/assessment-measures-wave6-categories.ts', ['dermatology', 'gastroenterology', 'critical-care']],
  ['lib/assessment-measures-wave7-categories.ts', ['hepatology-liver-disease', 'cardiovascular-risk']],
  ['lib/assessment-measures-wave8-categories.ts', ['infectious-disease-severity', 'oncology-staging']],
  ['lib/assessment-measures-wave9-categories.ts', ['pediatric-puberty-development']],
  ['lib/assessment-measures-wave10-categories.ts', ['disorders-of-consciousness', 'acute-kidney-injury']],
];
for (const [file, categories] of categoryFiles) {
  const source = read(file);
  for (const category of categories) assert(source.includes(`slug: '${category}'`), `${file}: category definition missing: ${category}`);
}

const rightsReview = read('lib/assessment-measures-rights-review.ts');
const rightsReviewMarker = 'export const assessmentMeasuresRightsReview: AssessmentMeasureRightsReviewItem[] = [';
const rightsReviewIndex = rightsReview.indexOf(rightsReviewMarker);
assert(rightsReviewIndex >= 0, 'restricted rights review queue marker missing');
const rightsReviewBody = rightsReviewIndex >= 0 ? rightsReview.slice(rightsReviewIndex) : '';
const restrictedSlugs = [...rightsReviewBody.matchAll(/^\s{4}slug: '([^']+)',/gm)].map((match) => match[1]);
assert(restrictedSlugs.length >= 11, `expected at least 11 restricted/reference-only instruments, found ${restrictedSlugs.length}`);
assert(new Set(restrictedSlugs).size === restrictedSlugs.length, 'duplicate slug in restricted rights review queue');
for (const restrictedSlug of restrictedSlugs) assert(!uniqueSlugs.has(restrictedSlug), `${restrictedSlug}: restricted instrument must not also appear in reusable catalog`);
for (const status of ['granted-to-cdisc', 'author-permission-required', 'denied', 'no-response-received']) {
  assert(rightsReview.includes(`status: '${status}'`), `restricted rights review queue missing status class: ${status}`);
}
assert(!/http:\/\//.test(rightsReview), 'restricted rights review sources must use HTTPS');
assert((rightsReview.match(/rightsVerifiedOn: '2026-09-05'/g) ?? []).length >= restrictedSlugs.length, 'every restricted item must carry a rights verification date');
assert((rightsReview.match(/whyReferenceOnly:/g) ?? []).length >= restrictedSlugs.length, 'every restricted item must explain why it is reference-only');
assert((rightsReview.match(/safeUseOnRawafid:/g) ?? []).length >= restrictedSlugs.length, 'every restricted item must define safe Rawafid handling');

const bySlug = (slug) => blocks.find((entry) => entry.slug === slug);
const mustInclude = (slug, text, message) => {
  const entry = bySlug(slug);
  assert(Boolean(entry), `${slug}: required measure missing`);
  assert(Boolean(entry && entry.block.includes(text)), message);
};

// Existing scientific, rights and safety boundaries.
mustInclude('ptsd-checklist-for-dsm5', "arabicStatus: 'validated-version-reported'", 'PCL-5 must preserve documented Arabic validation status');
mustInclude('ptsd-checklist-for-dsm5', 'National Center for PTSD', 'PCL-5 must preserve official VA rights provenance');
mustInclude('alcohol-use-disorders-identification-test-self-report', "arabicStatus: 'validated-version-reported'", 'AUDIT-SR must preserve documented Arabic validation status');
mustInclude('alcohol-use-disorders-identification-test-self-report', '107 سجناء', 'AUDIT-SR Arabic evidence must retain its population limitation');
mustInclude('apache-ii', 'لا تستخدم APACHE II لتقرير سحب العلاج', 'APACHE II must preserve explicit individual-decision safety boundary');
mustInclude('apache-ii', 'لن تنشر روافد حاسبة وفيات فردية', 'APACHE II must not expose an individual mortality calculator');
mustInclude('rey-auditory-verbal-learning-test', 'لا تستخدم قائمة مترجمة محليًا مع معايير إنجليزية', 'RAVLT must preserve language/norm boundary');
mustInclude('sofa-27mar2024', 'لا تستخدم SOFA وحده لتشخيص الإنتان أو لاستبعاد العلاج أو لتقرير سحب الدعم الحيوي', 'SOFA must preserve explicit no-withdrawal/no-denial boundary');
mustInclude('sofa-27mar2024', 'لا تحول روافد SOFA إلى حاسبة وفاة فردية', 'SOFA must not expose an individual mortality calculator');
mustInclude('model-for-end-stage-liver-disease', 'MELD 3.0', 'MELD page must distinguish historical MELD from current MELD 3.0 allocation policy');
mustInclude('model-for-end-stage-liver-disease', 'لا تنشر روافد حاسبة MELD عامة', 'MELD must not expose a versionless general calculator');
mustInclude('assign-cardiovascular-risk-score', 'لا تحوّل روافد النموذج إلى حاسبة عربية عامة', 'ASSIGN must preserve population-calibration boundary');
mustInclude('assign-cardiovascular-risk-score', 'تبالغ في الخطر', 'ASSIGN must preserve recalibration warning');
for (const timedSlug of ['four-stair-ascend', 'four-stair-descend', 'rising-from-floor']) mustInclude(timedSlug, "rightsStatus: 'public-domain'", `${timedSlug}: timed functional test must preserve Public Domain status`);
mustInclude('harvey-bradshaw-index', "related: ['crohns-disease-activity-index-v1']", 'HBI must link to CDAI for comparison');
mustInclude('pain-relief-cdisc', "related: ['pain-intensity-cdisc']", 'Pain Relief must link to Pain Intensity');
mustInclude('bode-index', 'modified-medical-research-council-dyspnea-scale', 'BODE must link to mMRC');
mustInclude('bode-index', '6-minute-walk-test', 'BODE must link to 6MWT');
mustInclude('bode-index', 'لا تستخدم BODE وحده لتحديد أهلية علاج', 'BODE must preserve individual-decision safety boundary');

// Wave 8 boundaries.
mustInclude('extended-glasgow-outcome-scale', "arabicStatus: 'validated-version-reported'", 'GOSE must preserve documented Arabic/Moroccan translation evidence status');
mustInclude('extended-glasgow-outcome-scale', '123 مريضًا', 'GOSE Arabic evidence must preserve the Moroccan sample context');
mustInclude('extended-glasgow-outcome-scale', 'لا تستخدم انخفاض الدرجة لتبرير سحب علاج أو حرمان من خدمات تأهيلية', 'GOSE must preserve no-withdrawal/no-rehabilitation-denial boundary');
mustInclude('framingham-cvd-10-year-risk', 'روافد لا تقدم حاسبة Framingham فردية عامة', 'Framingham must not expose a generic individual calculator');
mustInclude('framingham-cvd-10-year-risk', 'دون تحقق محلي', 'Framingham must preserve local population-calibration boundary');
mustInclude('atlas-cdi-score', 'لا تستخدم ATLAS لتأخير علاج CDI شديد أو مهدد للحياة', 'ATLAS must preserve urgent-treatment safety boundary');
mustInclude('simple-endoscopic-score-crohns-disease-v1', 'modified-van-assche-index', 'SES-CD must link to MVAI for complementary Crohn assessment');
mustInclude('modified-van-assche-index', 'simple-endoscopic-score-crohns-disease-v1', 'MVAI must link back to SES-CD');
mustInclude('modified-van-assche-index', 'لا تستخدم نماذج رؤية آلية غير محققة', 'MVAI must reject unvalidated automated image scoring');
mustInclude('valg-small-cell-lung-cancer-staging', 'TNM', 'VALG must preserve TNM context');
mustInclude('valg-small-cell-lung-cancer-staging', 'NCI', 'VALG must preserve current NCI staging context');
mustInclude('clinical-global-impression', 'general-clinical-global-impression', 'CGI must remain distinct from and linked to GCGI');
mustInclude('clinical-global-impression', "rightsStatus: 'public-domain'", 'CGI must preserve Public Domain status');

// Wave 9 boundaries.
mustInclude('child-pugh-classification', 'model-for-end-stage-liver-disease', 'Child-Pugh must link to MELD for comparison');
mustInclude('child-pugh-classification', 'لا تستخدم Child-Pugh وحده لتحديد أهلية زراعة الكبد', 'Child-Pugh must preserve transplant/treatment decision boundary');
mustInclude('roland-morris-disability-questionnaire', "arabicStatus: 'validated-version-reported'", 'RMDQ must preserve documented Arabic validation status');
mustInclude('roland-morris-disability-questionnaire', '201 مريضًا', 'RMDQ Arabic evidence must preserve the MSA validation sample context');
mustInclude('roland-morris-disability-questionnaire', 'لا يعني أن روافد يملك حق نسخ نص الترجمة المنشورة حرفيًا', 'RMDQ must preserve translation-rights boundary');
mustInclude('rutgeerts-score', 'i2a/i2b', 'Rutgeerts must distinguish original i2 from modified i2a/i2b');
mustInclude('rutgeerts-score', 'simple-endoscopic-score-crohns-disease-v1', 'Rutgeerts must link to SES-CD');
mustInclude('covi-anxiety-scale', 'hamilton-anxiety-rating-scale', 'COVI must link to HAM-A');
mustInclude('covi-anxiety-scale', 'generalized-anxiety-disorder-7', 'COVI must link to GAD-7');
mustInclude('covi-anxiety-scale', 'ليس أداة تشخيص مستقلة', 'COVI must preserve non-diagnostic boundary');
for (const tannerSlug of ['tanner-scale-boy', 'tanner-scale-girl']) {
  const entry = bySlug(tannerSlug);
  assert(Boolean(entry), `${tannerSlug}: Tanner measure missing`);
  assert(Boolean(entry && entry.block.includes("rightsStatus: 'public-domain'")), `${tannerSlug}: Tanner measure must preserve Public Domain status`);
  assert(Boolean(entry && entry.block.includes('لا تعرض روافد صورًا حساسة')), `${tannerSlug}: Tanner page must prohibit sensitive images`);
  assert(Boolean(entry && entry.block.includes('لا يُقدَّم كتقييم ذاتي')), `${tannerSlug}: Tanner page must prohibit self-staging`);
  assert(Boolean(entry && !entry.block.includes('data:image')), `${tannerSlug}: embedded image data is prohibited`);
  assert(Boolean(entry && !entry.block.includes('<img')), `${tannerSlug}: image markup is prohibited in Tanner measure data`);
}
mustInclude('observer-global-impression', 'patient-global-impression', 'OGI must link to PGI');
mustInclude('observer-global-impression', 'clinical-global-impression', 'OGI must link to CGI');
mustInclude('observer-global-impression', 'لا تستخدم OGI لتخمين أعراض داخلية', 'OGI must preserve observability boundary');

// Wave 10 boundaries.
mustInclude('jfk-coma-recovery-scale-revised', 'لا تستخدم CRS-R منفردًا للتنبؤ الحتمي بالمآل أو لتبرير سحب العلاج أو حرمان المريض من التأهيل', 'CRS-R must preserve no-withdrawal/no-rehabilitation-denial boundary');
mustInclude('jfk-coma-recovery-scale-revised', 'glasgow-coma-scale-ninds', 'CRS-R must link to GCS');
mustInclude('jfk-coma-recovery-scale-revised', 'disability-rating-scale', 'CRS-R must link to DRS');
mustInclude('kdigo-acute-kidney-injury-stage', 'لا تستخدم مرحلة KDIGO وحدها لاتخاذ قرار بدء أو إيقاف غسيل الكلى', 'KDIGO must preserve kidney-replacement decision boundary');
mustInclude('kdigo-acute-kidney-injury-stage', 'baseline', 'KDIGO must preserve baseline kidney-function documentation');
mustInclude('expanded-drs-postacute-interview-survivor', 'نسخة الناجي', 'Expanded DRS-PI survivor must preserve source identity');
mustInclude('expanded-drs-postacute-interview-survivor', 'لا تستخدم الدرجة وحدها لتحديد أهلية خدمات التأهيل', 'Expanded DRS-PI survivor must preserve service-eligibility boundary');
mustInclude('expanded-drs-postacute-interview-caregiver', 'مصدر التقرير هو مقدم الرعاية', 'Expanded DRS-PI caregiver must preserve proxy-source documentation');
mustInclude('expanded-drs-postacute-interview-caregiver', 'لا تستخدم تقرير مقدم الرعاية وحده لحجب صوت الناجي', 'Expanded DRS-PI caregiver must preserve survivor-voice boundary');
mustInclude('international-physical-activity-questionnaire-short-form-self-administered', "arabicStatus: 'validated-version-reported'", 'IPAQ-SF must preserve Arabic evidence status');
mustInclude('international-physical-activity-questionnaire-short-form-self-administered', 'accelerometer', 'IPAQ-SF must preserve criterion-validity limitation');
mustInclude('international-physical-activity-questionnaire-short-form-self-administered', 'international-physical-activity-questionnaire-long-form', 'IPAQ-SF must link to IPAQ-LF');
mustInclude('vignos-lower-extremity-rating-scale', 'لا تطلب تجربة درج أو نهوض غير آمن', 'Vignos must preserve fall-safety boundary');
mustInclude('vignos-lower-extremity-rating-scale', 'four-stair-ascend', 'Vignos must link to stair performance testing');
mustInclude('west-haven-hepatic-encephalopathy-grade', 'لا تستخدم مستوى الأمونيا وحده', 'West Haven must preserve ammonia diagnostic boundary');
mustInclude('west-haven-hepatic-encephalopathy-grade', 'glasgow-coma-scale-ninds', 'West Haven must link to GCS for severe altered consciousness context');

const hub = read('app/assessment-measures/page.tsx');
assert(hub.includes('المقاييس وأدوات التقييم المستخدمة عالميًا'), 'public hub title changed unexpectedly');
for (const route of ['/assessment-measures/compare/', '/assessment-measures/methodology/', '/assessment-measures/rights-register/']) assert(hub.includes(route), `hub link missing: ${route}`);

const rightsRegister = read('app/assessment-measures/rights-register/page.tsx');
assert(rightsRegister.includes('assessmentMeasures.map'), 'rights register must derive from the canonical catalog');
assert(rightsRegister.includes("source.role === 'rights'"), 'rights register must expose an authoritative rights source');
assert(rightsRegister.includes('/assessment-measures/rights-review/'), 'rights register must link to restricted rights review queue');

const rightsReviewPage = read('app/assessment-measures/rights-review/page.tsx');
assert(rightsReviewPage.includes('assessmentMeasuresRightsReview.map'), 'rights review page must derive from the canonical restricted queue');
assert(rightsReviewPage.includes('Granted لـCDISC'), 'rights review page must explain that Granted is not a Rawafid reproduction license');
assert(rightsReviewPage.includes('<tr id={item.slug} key={item.slug}>'), 'restricted rights review rows must expose stable anchors for search results');
assert(rightsReviewPage.includes("url: `${SITE_URL}/assessment-measures/rights-review/#${item.slug}`"), 'restricted rights JSON-LD must point to its stable Rawafid anchor');

const header = read('components/site-header.tsx');
assert(header.includes('/assessment-measures/'), 'assessment measures library is not present in global navigation');

const unifiedSearch = read('app/search/page.tsx');
assert(unifiedSearch.includes("from '@/lib/assessment-measures-catalog'"), 'unified search must import the canonical assessment catalog');
assert(unifiedSearch.includes("from '@/lib/assessment-measures-rights-review'"), 'unified search must import the restricted assessment rights queue');
assert(unifiedSearch.includes('function searchAssessmentMeasures'), 'assessment-specific search scoring is missing');
assert(unifiedSearch.includes('function searchRestrictedAssessmentMeasures'), 'restricted assessment search scoring is missing');
assert(unifiedSearch.includes('const restrictedMeasures = searchRestrictedAssessmentMeasures(q, 20);'), 'restricted assessment search is not executed');
assert(unifiedSearch.includes('...measures, ...restrictedMeasures, ...expanded'), 'restricted assessment results are not merged into unified results');
assert(unifiedSearch.includes('`/assessment-measures/rights-review/#${measure.slug}`'), 'restricted assessment result must deep-link to the rights review row');
assert(unifiedSearch.includes('مقياس مرجعي مقيد'), 'restricted assessment results must carry a visible rights-boundary label');
assert(unifiedSearch.includes('href="/assessment-measures/"'), 'assessment library is missing from search discovery navigation');
assert(unifiedSearch.includes('href="/assessment-measures/rights-review/"'), 'restricted rights review is missing from search discovery navigation');
for (const searchableRestricted of ['mmse-2-standard-version', 'montreal-cognitive-assessment', 'hospital-anxiety-depression-scale']) assert(rightsReview.includes(`slug: '${searchableRestricted}'`), `representative restricted search fixture missing: ${searchableRestricted}`);

const sitemap = read('app/sitemaps/static.xml/route.ts');
assert(sitemap.includes("from '@/lib/assessment-measures-catalog'"), 'static sitemap must use the aggregated catalog');
for (const route of ['/assessment-measures/compare/', '/assessment-measures/methodology/', '/assessment-measures/rights-register/', '/assessment-measures/rights-review/']) assert(sitemap.includes(route), `static sitemap route missing: ${route}`);

const requiredRoutes = [
  'app/assessment-measures/page.tsx',
  'app/assessment-measures/[slug]/page.tsx',
  'app/assessment-measures/category/[slug]/page.tsx',
  'app/assessment-measures/compare/page.tsx',
  'app/assessment-measures/methodology/page.tsx',
  'app/assessment-measures/rights-register/page.tsx',
  'app/assessment-measures/rights-review/page.tsx',
];
for (const route of requiredRoutes) assert(fs.existsSync(path.join(root, route)), `required route missing: ${route}`);

if (!process.exitCode) {
  console.log(`ASSESSMENT_MEASURES_CONTRACT_PASS: ${blocks.length} reusable measures, ${restrictedSlugs.length} restricted searchable references, ${uniqueSlugs.size} unique public slugs, 26 categories, rights/evidence/safety/Arabic/search checks passed.`);
}
