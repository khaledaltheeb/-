import fs from 'node:fs';

const config = fs.readFileSync('next.config.ts', 'utf8');
const proxy = fs.readFileSync('lib/supabase/proxy.ts', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const fail = (message) => {
  console.error(`LEGACY INTERACTIVE ROUTE CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

const routes = [
  'app/ai-search/page.tsx',
  'app/specialists-partners/account/page.tsx',
  'app/specialists-partners/admin/page.tsx',
  'app/specialists-partners/contact/page.tsx',
  'app/specialists-partners/join/page.tsx',
  'app/specialists-partners/password-reset/page.tsx',
  'app/specialists-partners/portal/page.tsx',
  'app/specialists-partners/recover/page.tsx',
];
for (const file of routes) {
  if (!fs.existsSync(file)) fail(`missing real migrated route: ${file}`);
}

for (const source of [
  '/ai-search',
  '/specialists-partners/account',
  '/specialists-partners/admin',
  '/specialists-partners/contact',
  '/specialists-partners/join',
  '/specialists-partners/password-reset',
  '/specialists-partners/portal',
  '/specialists-partners/recover',
]) {
  if (config.includes(`source: '${source}'`)) fail(`migration redirect still exists for ${source}`);
}

const ai = fs.readFileSync('app/ai-search/page.tsx', 'utf8');
const search = fs.readFileSync('app/search/page.tsx', 'utf8');
const contact = fs.readFileSync('app/specialists-partners/contact/page.tsx', 'utf8');
if (!ai.includes('PlatformSearchExperience') || !search.includes('اكتب سؤالك بلغتك الطبيعية') || !search.includes('ليس محرك تشخيص')) {
  fail('historical AI search content/function was not transferred');
}
if (!contact.includes('ابدأ رسالة مهنية دون كشف بريد المختص') || !contact.includes('ليست قناة طوارئ')) {
  fail('specialist contact privacy/safety content missing');
}

const account = fs.readFileSync('app/specialists-partners/account/page.tsx', 'utf8');
const admin = fs.readFileSync('app/specialists-partners/admin/page.tsx', 'utf8');
const portal = fs.readFileSync('app/specialists-partners/portal/page.tsx', 'utf8');

if (!account.includes("@/app/account/page")) fail('legacy account route must use current secure account implementation');
if (!admin.includes("@/app/admin/page")) fail('legacy admin route must use current role-aware admin implementation');
if (!portal.includes("@/app/messages/page")) fail('legacy portal route must use current message implementation');

const privateLegacyRoutes = [
  '/specialists-partners/account',
  '/specialists-partners/admin',
  '/specialists-partners/portal',
];

for (const [name, source, nextPath] of [
  ['account', account, privateLegacyRoutes[0]],
  ['admin', admin, privateLegacyRoutes[1]],
  ['portal', portal, privateLegacyRoutes[2]],
]) {
  if (!source.includes("@/lib/supabase/server") || !source.includes('getClaims()')) {
    fail(`legacy ${name} route must authenticate at the page boundary as defense in depth`);
  }
  if (!source.includes(`redirect('/login?next=${nextPath}')`)) {
    fail(`legacy ${name} route must preserve an explicit unauthenticated login redirect`);
  }
}

if (!admin.includes(".select('role,is_active')") || !admin.includes("['owner', 'admin'].includes(profile.role)")) {
  fail('legacy admin route must enforce active owner/admin authorization before rendering the shared admin page');
}

for (const route of privateLegacyRoutes) {
  const occurrences = proxy.split(`'${route}'`).length - 1;
  if (occurrences < 2) {
    fail(`legacy private route must appear in both protectedPrefixes and redirectExcludedPrefixes: ${route}`);
  }
}
if (!proxy.includes('const protectedPrefixes') || !proxy.includes('const redirectExcludedPrefixes')) {
  fail('request-boundary protection arrays are missing from Supabase proxy');
}

if (!pkg.scripts?.['legacy-interactive-routes:validate']) fail('package validation script missing');
if (!process.exitCode) {
  console.log('Legacy interactive route contract passed: historical routes remain real; private specialist routes are protected at both proxy and page boundaries.');
}
