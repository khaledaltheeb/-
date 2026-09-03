import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
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

if (!process.exitCode) console.log(`Rawafid central theme import graph passed: ${importedCss.length} unique compatibility modules; admin-only CSS remains route-scoped.`);
