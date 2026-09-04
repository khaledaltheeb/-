import fs from 'node:fs';

const fail = (message) => {
  console.error(`COCHRANE RESOURCE HUB CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

const read = (path) => fs.readFileSync(path, 'utf8');
const registryPath = 'data/cochrane/resources-v1.json';
const provenancePath = 'data/cochrane/methods-provenance-v1.json';
const pagePath = 'app/cochrane/[[...slug]]/page.tsx';
const apiPath = 'app/api/v1/cochrane-resource-hub/route.ts';
const sitemapPath = 'app/sitemaps/static.xml/route.ts';
const guideIndexPath = 'app/cochrane/guides/page.tsx';
const guidePagePath = 'app/cochrane/guides/[slug]/page.tsx';
const guideFiles = [
  'data/cochrane/guides-foundations-v1.json',
  'data/cochrane/guides-search-bias-v1.json',
  'data/cochrane/guides-statistics-v1.json',
  'data/cochrane/guides-grade-decision-v1.json',
  'data/cochrane/guides-ms-arabic-governance-v1.json',
];

for (const path of [registryPath, provenancePath, pagePath, apiPath, sitemapPath, guideIndexPath, guidePagePath, ...guideFiles]) {
  if (!fs.existsSync(path)) fail(`missing required file: ${path}`);
}

if (process.exitCode) process.exit(process.exitCode);

const registry = JSON.parse(read(registryPath));
const provenance = JSON.parse(read(provenancePath));
const page = read(pagePath);
const api = read(apiPath);
const sitemap = read(sitemapPath);
const guideIndex = read(guideIndexPath);
const guidePage = read(guidePagePath);
const guideBatches = guideFiles.map((path) => JSON.parse(read(path)));
const guides = guideBatches.flatMap((batch) => batch.guides || []);

if (registry.schema_version !== 'rawafid-cochrane-resource-hub-v1') fail('unexpected schema_version');
if (registry.updated_on !== '2026-09-03') fail('release date must remain explicit');
if (!Array.isArray(registry.official_resources) || registry.official_resources.length < 18) fail('official resource registry is not comprehensive enough');

const sourceIds = registry.official_resources.map((item) => item.id);
if (new Set(sourceIds).size !== sourceIds.length) fail('duplicate official resource id');
const requiredResourceIds = new Set([
  'cochrane-evidence', 'cochrane-library', 'systematic-reviews', 'learn', 'courses-resources',
  'evidence-essentials', 'handbook', 'handbooks-manuals', 'grade-chapter-14', 'mecir',
  'cochrane-methodology', 'methods-in-cochrane', 'cochrane-groups', 'group-resources',
  'patient-public-principles', 'translate-evidence', 'scientific-strategy-2025-2030',
  'communications-resources', 'methods-groups', 'ms-group',
]);
for (const id of sourceIds) requiredResourceIds.delete(id);
if (requiredResourceIds.size) fail(`missing core Cochrane resources: ${[...requiredResourceIds].join(', ')}`);

for (const item of registry.official_resources) {
  if (!/^https:\/\//.test(item.url)) fail(`non-HTTPS official source: ${item.id}`);
  if (!item.title_ar || !item.title_en || !item.kind || !item.scope_ar || !Array.isArray(item.audience_ar) || !item.audience_ar.length) fail(`incomplete official source record: ${item.id}`);
}

const requiredReviews = new Set(['CD015005', 'CD012186', 'CD004192']);
if (!Array.isArray(registry.ms_reviews) || registry.ms_reviews.length !== requiredReviews.size) fail('MS review set must contain exactly the agreed phase-1 three reviews');
for (const review of registry.ms_reviews) {
  if (!requiredReviews.delete(review.id)) fail(`unexpected or duplicate MS review: ${review.id}`);
  if (!/^10\.1002\/14651858\.CD\d+\.pub\d+$/.test(review.doi)) fail(`invalid Cochrane DOI: ${review.id}`);
  if (!/^https:\/\//.test(review.cochrane_url) || !/^https:\/\//.test(review.library_url)) fail(`review links must be HTTPS: ${review.id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(review.published_on) || !/^\d{4}-\d{2}-\d{2}$/.test(review.evidence_current_to)) fail(`review dates must be explicit ISO dates: ${review.id}`);
  if (!review.question_ar || !review.evidence_base_ar || !review.certainty_ar || !review.rawafid_use_ar) fail(`review interpretation fields incomplete: ${review.id}`);
  if (!Array.isArray(review.key_messages_ar) || review.key_messages_ar.length < 3) fail(`too few evidence messages: ${review.id}`);
}
if (requiredReviews.size) fail(`missing MS reviews: ${[...requiredReviews].join(', ')}`);

if (registry.arabic_pilot?.status !== 'materials-received-not-yet-translated') fail('pilot status must not imply translation completion');
if (!/لم تُنشر بعد ترجمة عربية معتمدة/.test(registry.arabic_pilot?.public_status_ar || '')) fail('pilot public status must explicitly state that no approved Arabic translation is published');
if (!Array.isArray(registry.arabic_pilot?.workflow_ar) || registry.arabic_pilot.workflow_ar.length < 7) fail('pilot QA workflow is incomplete');
if (!/لا توصف أي مسودة/.test(registry.arabic_pilot?.publication_guard_ar || '')) fail('publication guard is missing');

// Current-method provenance and freshness guardrails.
if (provenance.schema_version !== 'rawafid-cochrane-methods-provenance-v1') fail('unexpected methods provenance schema');
if (provenance.reviewed_on !== '2026-09-04') fail('methods provenance review date must be explicit');
if (!Array.isArray(provenance.records) || provenance.records.length < 5) fail('methods provenance registry is incomplete');
const provenanceById = new Map(provenance.records.map((record) => [record.id, record]));
for (const id of ['cochrane-handbook-current', 'rob-2-current', 'robins-i-v2', 'rob-me-current', 'grade-chapter-14']) {
  if (!provenanceById.has(id)) fail(`missing methods provenance record: ${id}`);
}
for (const record of provenance.records) {
  if (!/^https:\/\//.test(record.url) || !/^https:\/\//.test(record.source_of_status)) fail(`methods provenance URLs must be HTTPS: ${record.id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.verified_on)) fail(`methods provenance verification date invalid: ${record.id}`);
  if (!record.status || !record.version_label || !record.note_ar || record.note_ar.length < 80) fail(`methods provenance record too thin: ${record.id}`);
}
const robinsV2 = provenanceById.get('robins-i-v2');
if (robinsV2?.status !== 'draft-subject-to-change') fail('ROBINS-I V2 must remain explicitly marked draft-subject-to-change');
if (!/draft/i.test(robinsV2?.version_label || '') || !/مسودة|draft/i.test(robinsV2?.note_ar || '')) fail('ROBINS-I V2 draft status is not visible enough');
const handbookCurrent = provenanceById.get('cochrane-handbook-current');
if (!/6\.5\.1/.test(handbookCurrent?.version_label || '') || !/6\.5/.test(handbookCurrent?.note_ar || '')) fail('Handbook base version and subsequent 6.5.1 updates must both be distinguished');
if (!/لا يعيد سجل روافد نشر/.test(provenance.rights_note_ar || '')) fail('methods provenance rights guard is missing');

const nativeRoutes = ['', 'resources', 'read-review', 'certainty', 'ms', 'arabic-pilot'];
for (const key of nativeRoutes) {
  const expected = key ? `key === '${key}'` : "key === ''";
  if (!page.includes(expected)) fail(`native renderer missing for /cochrane/${key ? `${key}/` : ''}`);
}
if (!page.includes('LegacyPreservedRoute')) fail('legacy Cochrane fallback must be preserved');
if (!page.includes('لم يُنجز بعد') && !page.includes('غير مكتمل')) fail('pilot page must visibly distinguish incomplete work');
if (!page.includes('ليست ترجمة')) fail('MS page must state that it is not the received Blogshot translation');

for (const path of ['/cochrane/', '/cochrane/resources/', '/cochrane/read-review/', '/cochrane/certainty/', '/cochrane/ms/', '/cochrane/arabic-pilot/']) {
  if (!sitemap.includes(`path:'${path}'`)) fail(`static sitemap missing ${path}`);
}

if (!api.includes("@/data/cochrane/resources-v1.json")) fail('API must expose the versioned registry as its source of truth');
if (!api.includes('X-Rawafid-Schema')) fail('API schema-version response header is missing');

// 50-guide gold-standard pre-release contract.
if (guides.length !== 50) fail(`gold-standard guide corpus must contain exactly 50 authored guides before editorial QA; found ${guides.length}`);

const slugs = guides.map((guide) => guide.slug);
const titles = guides.map((guide) => guide.title_ar);
const descriptions = guides.map((guide) => guide.description_ar);
if (new Set(slugs).size !== guides.length) fail('duplicate guide slug');
if (new Set(titles).size !== guides.length) fail('duplicate guide title');
if (new Set(descriptions).size !== guides.length) fail('duplicate guide description');

const allSlugs = new Set(slugs);
for (const guide of guides) {
  if (!/^[a-z0-9-]+$/.test(guide.slug)) fail(`invalid guide slug: ${guide.slug}`);
  if (!guide.title_ar || guide.title_ar.length < 20) fail(`guide title too weak: ${guide.slug}`);
  if (!guide.description_ar || guide.description_ar.length < 70) fail(`guide description too thin: ${guide.slug}`);
  if (!guide.intent_ar || guide.intent_ar.length < 35) fail(`guide intent missing or thin: ${guide.slug}`);
  if (!Array.isArray(guide.sections) || guide.sections.length < 5) fail(`guide must contain at least five substantive sections: ${guide.slug}`);
  if (!Array.isArray(guide.checklist_ar) || guide.checklist_ar.length < 5) fail(`guide checklist incomplete: ${guide.slug}`);
  if (!Array.isArray(guide.sources) || guide.sources.length < 1) fail(`guide has no primary/source trail: ${guide.slug}`);

  const sectionHeadings = guide.sections.map((section) => section.heading_ar);
  if (new Set(sectionHeadings).size !== sectionHeadings.length) fail(`duplicate section heading within guide: ${guide.slug}`);
  for (const section of guide.sections) {
    if (!section.heading_ar || section.heading_ar.length < 4) fail(`weak section heading: ${guide.slug}`);
    if (!section.body_ar || section.body_ar.length < 120) fail(`section body too thin: ${guide.slug} / ${section.heading_ar}`);
  }
  for (const source of guide.sources) {
    if (!source.label || !source.kind || !/^https:\/\//.test(source.url)) fail(`invalid source record: ${guide.slug}`);
  }
  if ('pitfalls_ar' in guide && (!Array.isArray(guide.pitfalls_ar) || guide.pitfalls_ar.length < 3)) fail(`pitfalls layer incomplete: ${guide.slug}`);
  if ('connections' in guide) {
    if (!Array.isArray(guide.connections) || guide.connections.length < 2) fail(`guide connections incomplete: ${guide.slug}`);
    for (const linkedSlug of guide.connections) if (!allSlugs.has(linkedSlug)) fail(`broken guide connection: ${guide.slug} -> ${linkedSlug}`);
  }
}

if (!guidePage.includes('index: false')) fail('guide detail routes must remain noindex during pre-release QA');
if (!guideIndex.includes('index: false')) fail('guide index must remain noindex during pre-release QA');
if (!guideIndex.includes('50-guide pre-release corpus')) fail('guide index must declare pre-release corpus status');
if (sitemap.includes('/cochrane/guides/')) fail('pre-release guide corpus must not enter static sitemap before final QA');
if (!guidePage.includes('أخطاء شائعة يجب تجنبها')) fail('guide renderer must expose failure-mode learning layer');
if (!guidePage.includes('صفحات مرتبطة تكمل الفكرة')) fail('guide renderer must expose connected learning path');
if (!guidePage.includes("methods-provenance-v1.json")) fail('guide renderer must consume methods provenance registry');
if (!guidePage.includes('ROBINS-I V2 ما يزال مسودة')) fail('ROBINS-I V2 draft warning must be visible to readers');
if (!guidePage.includes('سجل حداثة المصادر')) fail('guide renderer must expose source freshness review layer');

const msGuideIds = ['ms-azathioprine-cd015005', 'ms-immunotherapy-adverse-effects-cd012186', 'ms-dietary-interventions-cd004192'];
for (const id of msGuideIds) if (!allSlugs.has(id)) fail(`missing MS worked example: ${id}`);
const governanceIds = ['arabic-translation-back-translation', 'arabic-rtl-terminology-visual-qa', 'attribution-rights-pilot-governance'];
for (const id of governanceIds) if (!allSlugs.has(id)) fail(`missing Arabic governance guide: ${id}`);

if (!process.exitCode) {
  console.log('COCHRANE RESOURCE HUB CONTRACT PASSED');
  console.log(`official_resources=${registry.official_resources.length}`);
  console.log(`ms_reviews=${registry.ms_reviews.length}`);
  console.log(`guides=${guides.length}`);
  console.log(`methods_provenance=${provenance.records.length}`);
  console.log(`pilot_status=${registry.arabic_pilot.status}`);
}
