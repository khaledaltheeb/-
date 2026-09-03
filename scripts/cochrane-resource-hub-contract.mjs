import fs from 'node:fs';

const fail = (message) => {
  console.error(`COCHRANE RESOURCE HUB CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

const read = (path) => fs.readFileSync(path, 'utf8');
const registryPath = 'data/cochrane/resources-v1.json';
const pagePath = 'app/cochrane/[[...slug]]/page.tsx';
const apiPath = 'app/api/v1/cochrane-resource-hub/route.ts';
const sitemapPath = 'app/sitemaps/static.xml/route.ts';

for (const path of [registryPath, pagePath, apiPath, sitemapPath]) {
  if (!fs.existsSync(path)) fail(`missing required file: ${path}`);
}

if (process.exitCode) process.exit(process.exitCode);

const registry = JSON.parse(read(registryPath));
const page = read(pagePath);
const api = read(apiPath);
const sitemap = read(sitemapPath);

if (registry.schema_version !== 'rawafid-cochrane-resource-hub-v1') fail('unexpected schema_version');
if (registry.updated_on !== '2026-09-03') fail('release date must remain explicit');
if (!Array.isArray(registry.official_resources) || registry.official_resources.length < 18) fail('official resource registry is not comprehensive enough');

const sourceIds = registry.official_resources.map((item) => item.id);
if (new Set(sourceIds).size !== sourceIds.length) fail('duplicate official resource id');
const requiredResourceIds = new Set([
  'cochrane-evidence',
  'cochrane-library',
  'systematic-reviews',
  'learn',
  'courses-resources',
  'evidence-essentials',
  'handbook',
  'handbooks-manuals',
  'grade-chapter-14',
  'mecir',
  'cochrane-methodology',
  'methods-in-cochrane',
  'cochrane-groups',
  'group-resources',
  'patient-public-principles',
  'translate-evidence',
  'scientific-strategy-2025-2030',
  'communications-resources',
  'methods-groups',
  'ms-group',
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

if (!process.exitCode) {
  console.log('COCHRANE RESOURCE HUB CONTRACT PASSED');
  console.log(`official_resources=${registry.official_resources.length}`);
  console.log(`ms_reviews=${registry.ms_reviews.length}`);
  console.log(`pilot_status=${registry.arabic_pilot.status}`);
}
