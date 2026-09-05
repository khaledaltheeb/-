import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const executableCss = (body) => body.replace(/\/\*[\s\S]*?\*\//g, '').trim();
const themeEntry = read('app/rawafid-theme.css');
const importedCss = [...themeEntry.matchAll(/@import\s+['"]\.\/(.+?\.css)['"]/g)].map((match) => match[1]);
const duplicates = importedCss.filter((value, index) => importedCss.indexOf(value) !== index);

if (duplicates.length) {
  console.error(`THEME IMPORT CHECK FAILED: duplicate imports: ${[...new Set(duplicates)].join(', ')}`);
  process.exitCode = 1;
}

for (const file of importedCss) {
  if (!fs.existsSync(path.join(root, 'app', file))) {
    console.error(`THEME IMPORT CHECK FAILED: missing app/${file}`);
    process.exitCode = 1;
  }
}

const adminLayout = read('app/admin/layout.tsx');
const adminUiStub = read('app/admin-ui.css');
const adminOperationsStub = read('app/admin-operations.css');
const adminUiRoute = read('app/admin/admin-ui.css');
const adminOperationsRoute = read('app/admin/admin-operations.css');

for (const cssImport of ["'./admin-ui.css'", "'./admin-operations.css'"]) {
  if (!adminLayout.includes(cssImport)) {
    console.error(`THEME IMPORT CHECK FAILED: admin layout missing route-scoped ${cssImport}`);
    process.exitCode = 1;
  }
}

if (adminUiStub.includes('.advanced-fields') || adminOperationsStub.includes('.admin-list')) {
  console.error('THEME IMPORT CHECK FAILED: admin-only selectors leaked back into the public compatibility stubs');
  process.exitCode = 1;
}
if (!adminUiRoute.includes('.advanced-fields') || !adminOperationsRoute.includes('.admin-list')) {
  console.error('THEME IMPORT CHECK FAILED: route-scoped admin CSS is missing required admin selectors');
  process.exitCode = 1;
}

const protectedStubs = ['portal.css', 'dashboard-v3.css', 'media-v3.css', 'theme-admin-v4.css'];
for (const file of protectedStubs) {
  if (executableCss(read(`app/${file}`))) {
    console.error(`THEME IMPORT CHECK FAILED: protected selectors leaked into public compatibility stub app/${file}`);
    process.exitCode = 1;
  }
}

const portalShell = read('app/portal-shell.css');
for (const file of ['route-portal.css', 'route-dashboard-v3.css', 'route-media-v3.css', 'route-theme-admin-v4.css']) {
  if (!portalShell.includes(`@import './${file}'`)) {
    console.error(`THEME IMPORT CHECK FAILED: portal-shell.css missing ${file}`);
    process.exitCode = 1;
  }
}
if (!read('app/route-portal.css').includes('.account-overview') ||
    !read('app/route-dashboard-v3.css').includes('.dashboard-shell') ||
    !read('app/route-media-v3.css').includes('.media-library-grid') ||
    !read('app/route-theme-admin-v4.css').includes('.admin-app-shell')) {
  console.error('THEME IMPORT CHECK FAILED: route-scoped protected CSS is missing required selectors');
  process.exitCode = 1;
}

const protectedLayouts = [
  'app/admin/layout.tsx',
  'app/account/layout.tsx',
  'app/specialist/layout.tsx',
  'app/center/layout.tsx',
  'app/mfa/layout.tsx',
  'app/join/layout.tsx',
  'app/login/layout.tsx',
  'app/register/layout.tsx',
  'app/forgot-password/layout.tsx',
  'app/reset-password/layout.tsx',
  'app/share/layout.tsx',
  'app/offline/layout.tsx',
  'app/community/join/layout.tsx',
];
for (const file of protectedLayouts) {
  const body = read(file);
  if (!body.includes('portal-shell.css')) {
    console.error(`THEME IMPORT CHECK FAILED: ${file} must load the route-scoped portal theme`);
    process.exitCode = 1;
  }
}

if (!process.exitCode) console.log(`Rawafid central theme import graph passed: ${importedCss.length} unique public compatibility modules; protected portal/admin/auth CSS remains route-scoped.`);
