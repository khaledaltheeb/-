import fs from 'node:fs';
import path from 'node:path';

let failed = false;
const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => { console.error(`PUBLIC INDEXABILITY CONTRACT FAILED: ${message}`); failed = true; };
const hasIndexTrue = (text) => /index\s*:\s*true/.test(text);
const hasFollowTrue = (text) => /follow\s*:\s*true/.test(text);
const hasNoindex = (text) => /index\s*:\s*false/.test(text);
const normalized = (file) => file.split(path.sep).join('/');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

const explicitPublicPages = [
  'app/resources/worksheets/[slug]/page.tsx',
  'app/sectors/calendars/women/page.tsx',
  'app/specialists-partners/join/page.tsx',
  'app/specialists-partners/join.html/page.tsx',
  'app/specialists-partners/contact/page.tsx',
  'app/specialists-partners/contact.html/page.tsx',
  'app/cognitive-tests/page.tsx',
  'app/cognitive-tests/[slug]/page.tsx',
  'app/cognitive-lab/prospective-memory-cues/page.tsx',
  'app/cognitive-lab/associative-context-binding/page.tsx',
  'app/guided-assessment/[slug]/page.tsx',
  'app/guides/[slug]/page.tsx',
  'app/experiences/page.tsx',
  'app/cochrane/guides/page.tsx',
  'app/cochrane/guides/[slug]/page.tsx',
  'app/tools/rare-phenotype-navigator/page.tsx',
  'app/stats/page.tsx',
  'app/media-kit/page.tsx',
];

for (const file of explicitPublicPages) {
  if (!fs.existsSync(file)) { fail(`public page missing: ${file}`); continue; }
  const text = read(file);
  if (!hasIndexTrue(text)) fail(`${file} must explicitly permit indexing`);
  if (!hasFollowTrue(text)) fail(`${file} must explicitly permit following links`);
  if (hasNoindex(text)) fail(`${file} contains an explicit noindex marker`);
  if (!text.includes('buildSeoMetadata(') && !text.includes('contentMetadata(') && !text.includes('legacyPreservedMetadata(')) {
    fail(`${file} must use the centralized SEO metadata path`);
  }
}

const resourceAlias = read('app/resources/[slug]/page.tsx');
if (hasNoindex(resourceAlias)) fail('public historical resources must not receive a noindex override');
for (const marker of ['contentMetadata', 'PublishedContentPage', 'return contentMetadata', 'return PublishedContentPage']) {
  if (!resourceAlias.includes(marker)) fail(`public historical resource routing missing ${marker}`);
}

const legacyPreservation = read('lib/legacy-preserved-page.ts');
if (!legacyPreservation.includes('index: true') || !legacyPreservation.includes('follow: true')) fail('legacy public preservation fallback must remain index/follow');

const proxy = read('lib/supabase/proxy.ts');
for (const marker of ['preservedContentAliasCanonical', 'applyPreservedAliasSeoHeaders', 'rel="canonical"']) {
  if (!proxy.includes(marker)) fail(`public alias canonical guard missing: ${marker}`);
}
if (/headers\.set\(\s*['"]X-Robots-Tag['"]\s*,\s*['"][^'"]*noindex/i.test(proxy)) {
  fail('public proxy aliases must not inject X-Robots-Tag noindex');
}

const dbMigrationPath = 'supabase/migrations/20260910224000_enforce_published_content_indexability.sql';
if (!fs.existsSync(dbMigrationPath)) fail('published-content indexability database migration is missing');
else {
  const dbMigration = read(dbMigrationPath);
  for (const marker of [
    'content_published_must_be_indexable',
    "status::text <> 'published'",
    'robots_index is true',
    'robots_follow is true',
    'validate constraint content_published_must_be_indexable',
  ]) {
    if (!dbMigration.includes(marker)) fail(`database indexability invariant missing: ${marker}`);
  }
}

const rootSitemap = read('app/sitemap.xml/route.ts');
for (const sitemap of ['/sitemaps/cochrane-guides.xml', '/sitemaps/rare-phenotype.xml', '/sitemaps/practical-worksheets.xml']) {
  if (!rootSitemap.includes(sitemap)) fail(`root sitemap index missing ${sitemap}`);
}

const privateTechnicalPages = [
  'app/login/page.tsx',
  'app/register/page.tsx',
  'app/forgot-password/page.tsx',
  'app/reset-password/page.tsx',
  'app/mfa/page.tsx',
  'app/dashboard/page.tsx',
  'app/messages/page.tsx',
  'app/messages/new/page.tsx',
  'app/messages/[id]/page.tsx',
  'app/notifications/page.tsx',
  'app/appointments/page.tsx',
  'app/appointments/new/page.tsx',
  'app/account/security/page.tsx',
  'app/account/delete/page.tsx',
  'app/account/verification-documents/page.tsx',
  'app/admin/media/page.tsx',
  'app/admin/seo/page.tsx',
  'app/specialist/content/page.tsx',
  'app/specialist/content/new/page.tsx',
  'app/specialist/content/[id]/page.tsx',
  'app/specialist/media/page.tsx',
  'app/specialists-partners/admin/page.tsx',
  'app/specialists-partners/account/page.tsx',
  'app/specialists-partners/portal/page.tsx',
  'app/specialists-partners/recover/page.tsx',
  'app/specialists-partners/password-reset/page.tsx',
  'app/community/join/page.tsx',
  'app/theme-preview/page.tsx',
  'app/offline/page.tsx',
  'app/share/page.tsx',
];

for (const file of privateTechnicalPages) {
  if (!fs.existsSync(file)) { fail(`private/technical route missing: ${file}`); continue; }
  if (!hasNoindex(read(file))) fail(`${file} must remain noindex because it is private, account-bound, administrative, recovery, preview, offline, or technical`);
}

const internalSearchPages = ['app/search/page.tsx', 'app/ai-search/page.tsx'];
for (const file of internalSearchPages) {
  if (!fs.existsSync(file)) { fail(`internal search route missing: ${file}`); continue; }
  if (!hasNoindex(read(file))) fail(`${file} must remain noindex to prevent indexing internal search-result surfaces`);
}

const intentionalNoindexPages = new Set([
  ...privateTechnicalPages,
  ...internalSearchPages,
  'app/all-pages/page.tsx',
  'app/tools/favorites/page.tsx',
  'app/assessment-measures/[slug]/print/page.tsx',
]);

// Audit every App Router page, not only a hand-picked list. Static noindex is allowed only
// on explicitly classified private/technical/search/print surfaces. Dynamic record routes
// may carry a noindex branch only when the same page has a notFound/permanentRedirect exit;
// this covers missing/merged aliases rather than a published canonical page.
const allPageFiles = walk('app')
  .filter((file) => /[/\\]page\.(tsx|ts)$/.test(file))
  .map(normalized);
let explicitNoindexPageCount = 0;
for (const file of allPageFiles) {
  const source = read(file);
  if (!hasNoindex(source)) continue;
  explicitNoindexPageCount += 1;
  if (intentionalNoindexPages.has(file)) continue;
  if (source.includes('notFound(') || source.includes('permanentRedirect(')) continue;
  fail(`${file} contains an unclassified explicit noindex; classify it as private/technical or remove noindex from the public page`);
}

if (failed) process.exit(1);
console.log(`PUBLIC INDEXABILITY CONTRACT PASSED: audited ${allPageFiles.length} App Router pages; ${explicitNoindexPageCount} explicit noindex pages are classified private/technical/search/print or conditional missing/redirect branches. Public published surfaces remain index/follow through centralized metadata; public aliases avoid X-Robots noindex; PostgreSQL forbids published content from becoming noindex/nofollow.`);
