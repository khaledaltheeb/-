import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`THEME IMPORT CHECK FAILED: ${message}`); process.exitCode = 1; };
const executableCss = (body) => body.replace(/\/\*[\s\S]*?\*\//g, '').trim();

const themeEntry = read('app/rawafid-theme.css');
const importedCss = [...themeEntry.matchAll(/@import\s+['"]\.\/(.+?\.css)['"]/g)].map((match) => match[1]);
const duplicates = importedCss.filter((value, index) => importedCss.indexOf(value) !== index);

if (duplicates.length) {
  fail(`duplicate imports: ${[...new Set(duplicates)].join(', ')}`);
}

for (const file of importedCss) {
  if (!fs.existsSync(path.join(root, 'app', file))) {
    fail(`missing app/${file}`);
  }
}

const adminLayout = read('app/admin/layout.tsx');
const adminUiStub = read('app/admin-ui.css');
const adminOperationsStub = read('app/admin-operations.css');
const adminUiRoute = read('app/admin/admin-ui.css');
const adminOperationsRoute = read('app/admin/admin-operations.css');

for (const cssImport of ["'./admin-ui.css'", "'./admin-operations.css'"]) {
  if (!adminLayout.includes(cssImport)) {
    fail(`admin layout missing route-scoped ${cssImport}`);
  }
}

if (adminUiStub.includes('.advanced-fields') || adminOperationsStub.includes('.admin-list')) {
  fail('admin-only selectors leaked back into the public compatibility stubs');
}
if (!adminUiRoute.includes('.advanced-fields') || !adminOperationsRoute.includes('.admin-list')) {
  fail('route-scoped admin CSS is missing required admin selectors');
}

const dashboardStub = read('app/dashboard-v3.css');
const dashboardScoped = read('app/dashboard-v3-scoped.css');
if (executableCss(dashboardStub)) {
  fail('dashboard-v3.css must remain a non-executable compatibility stub');
}
for (const selector of ['.dashboard-shell', '.dashboard-card', '.admin-heading']) {
  if (!dashboardScoped.includes(selector)) fail(`route-scoped dashboard CSS missing ${selector}`);
}

const adminThemeStub = read('app/theme-admin-v4.css');
const adminThemeScoped = read('app/theme-admin-v4-scoped.css');
if (executableCss(adminThemeStub)) {
  fail('theme-admin-v4.css must remain a non-executable compatibility stub');
}
for (const selector of ['.admin-app-shell', '.dashboard-card', '.auth-shell', '.status-shell']) {
  if (!adminThemeScoped.includes(selector)) fail(`route-scoped admin theme missing ${selector}`);
}

const portalShared = read('app/portal.css');
const portalScoped = read('app/portal-scoped.css');
if (!portalShared.includes('.portal-notice')) {
  fail('portal.css must retain the shared public portal notice states');
}
for (const selector of ['.account-overview', '.specialist-form', '.verification-card', '.user-access-card']) {
  if (portalShared.includes(selector)) fail(`portal-only selector leaked back into global portal.css: ${selector}`);
  if (!portalScoped.includes(selector)) fail(`route-scoped portal CSS missing ${selector}`);
}

const communityStub = read('app/community.css');
const communityScoped = read('app/community-scoped.css');
if (executableCss(communityStub)) {
  fail('community.css must remain a non-executable compatibility stub');
}
for (const selector of ['.community-directory-shell', '.community-badge', '.community-profile-hero']) {
  if (!communityScoped.includes(selector)) fail(`route-scoped community CSS missing ${selector}`);
}

const sectorShared = read('app/sector-pages.css');
const sectorScoped = read('app/sector-pages-scoped.css');
for (const selector of ['.breadcrumbs', '.mobile-bottom-nav']) {
  if (!sectorShared.includes(selector)) fail(`shared sector navigation CSS missing ${selector}`);
}
for (const selector of ['.sector-hero', '.sector-search', '.sector-quick-nav', '.category-public-grid', '.public-category-card']) {
  if (sectorShared.includes(selector)) fail(`sector-only selector leaked back into global sector-pages.css: ${selector}`);
  if (!sectorScoped.includes(selector)) fail(`route-scoped sector CSS missing ${selector}`);
}

const mediaStub = read('app/media-v3.css');
const mediaScoped = read('app/media-v3-scoped.css');
if (executableCss(mediaStub)) {
  fail('media-v3.css must remain a non-executable compatibility stub');
}
for (const selector of ['.media-upload-form', '.media-library-grid', '.media-card', '.media-thumb']) {
  if (!mediaScoped.includes(selector)) fail(`route-scoped media CSS missing ${selector}`);
}

const systemPortals = read('app/system-portals-v1.css');
const accountSystem = read('app/account-system-v1.css');
for (const selector of ['.join-shell', '.verification-controls']) {
  if (!systemPortals.includes(selector)) fail(`system portal CSS missing ${selector}`);
}
for (const selector of ['.account-shell', '.auth-register-callout']) {
  if (!accountSystem.includes(selector)) fail(`account system CSS missing ${selector}`);
}

const routeCssContracts = [
  ['app/admin/layout.tsx', ["'../media-v3-scoped.css'", "'../dashboard-v3-scoped.css'", "'../system-portals-v1.css'", "'../portal-scoped.css'", "'../theme-admin-v4-scoped.css'"]],
  ['app/account/layout.tsx', ["'../dashboard-v3-scoped.css'", "'../system-portals-v1.css'", "'../portal-scoped.css'", "'../account-system-v1.css'", "'../theme-admin-v4-scoped.css'"]],
  ['app/specialist/layout.tsx', ["'../media-v3-scoped.css'", "'../dashboard-v3-scoped.css'", "'../portal-scoped.css'", "'../theme-admin-v4-scoped.css'"]],
  ['app/center/layout.tsx', ["'../dashboard-v3-scoped.css'", "'../portal-scoped.css'", "'../theme-admin-v4-scoped.css'"]],
  ['app/mfa/layout.tsx', ["'../dashboard-v3-scoped.css'", "'../account-system-v1.css'", "'../theme-admin-v4-scoped.css'"]],
  ['app/community/join/layout.tsx', ["'../../dashboard-v3-scoped.css'", "'../../portal-scoped.css'", "'../../theme-admin-v4-scoped.css'"]],
  ['app/join/layout.tsx', ["'../system-portals-v1.css'", "'../portal-scoped.css'"]],
  ['app/theme-preview/layout.tsx', ["'../dashboard-v3-scoped.css'", "'../portal-scoped.css'", "'../cms-internal.css'", "'../theme-admin-v4-scoped.css'", "'../theme-preview-scoped.css'"]],
  ['app/sectors/layout.tsx', ["'../sector-pages-scoped.css'", "'../institutional-public-v1.css'"]],
  ['app/sections/layout.tsx', ["'../sector-pages-scoped.css'", "'../institutional-public-v1.css'"]],
  ['app/login/layout.tsx', ["'../account-system-v1.css'", "'../theme-admin-v4-scoped.css'"]],
  ['app/register/layout.tsx', ["'../account-system-v1.css'", "'../theme-admin-v4-scoped.css'"]],
  ['app/forgot-password/layout.tsx', ["'../account-system-v1.css'", "'../theme-admin-v4-scoped.css'"]],
  ['app/reset-password/layout.tsx', ["'../account-system-v1.css'", "'../theme-admin-v4-scoped.css'"]],
  ['app/offline/layout.tsx', ["'../theme-admin-v4-scoped.css'"]],
  ['app/share/layout.tsx', ["'../theme-admin-v4-scoped.css'"]],
];

for (const [file, needles] of routeCssContracts) {
  const body = read(file);
  for (const needle of needles) {
    if (!body.includes(needle)) fail(`${file} missing route-scoped CSS import ${needle}`);
  }
}

if (!process.exitCode) {
  console.log(`Rawafid central theme import graph passed: ${importedCss.length} unique compatibility modules; dashboard/admin/auth/account/join/portal/community/sector/media CSS remains route-scoped.`);
}
