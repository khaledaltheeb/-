import fs from 'node:fs';

let failed = false;
const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => { console.error(`PUBLIC INDEXABILITY CONTRACT FAILED: ${message}`); failed = true; };
const hasIndexTrue = (text) => /index\s*:\s*true/.test(text);
const hasFollowTrue = (text) => /follow\s*:\s*true/.test(text);
const hasNoindex = (text) => /index\s*:\s*false/.test(text);

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
}

const resourceAlias = read('app/resources/[slug]/page.tsx');
if (hasNoindex(resourceAlias)) fail('public historical resources must not receive a noindex override');
for (const marker of ['contentMetadata', 'PublishedContentPage', 'return contentMetadata', 'return PublishedContentPage']) {
  if (!resourceAlias.includes(marker)) fail(`public historical resource routing missing ${marker}`);
}

const legacyPreservation = read('lib/legacy-preserved-page.ts');
if (!legacyPreservation.includes('index: true') || !legacyPreservation.includes('follow: true')) fail('legacy public preservation fallback must remain index/follow');

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
  'app/community/join/page.tsx',
  'app/theme-preview/page.tsx',
  'app/offline/page.tsx',
  'app/share/page.tsx',
];

for (const file of privateTechnicalPages) {
  if (!fs.existsSync(file)) { fail(`private/technical route missing: ${file}`); continue; }
  if (!hasNoindex(read(file))) fail(`${file} must remain noindex because it is private, account-bound, administrative, preview, offline, or technical`);
}

const internalSearchPages = ['app/search/page.tsx', 'app/ai-search/page.tsx'];
for (const file of internalSearchPages) {
  if (!fs.existsSync(file)) { fail(`internal search route missing: ${file}`); continue; }
  if (!hasNoindex(read(file))) fail(`${file} must remain noindex to prevent indexing internal search-result surfaces`);
}

if (failed) process.exit(1);
console.log('PUBLIC INDEXABILITY CONTRACT PASSED: public published surfaces are index/follow; private, account-bound, administrative and internal-search surfaces retain intentional noindex boundaries.');
