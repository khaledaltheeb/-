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

if (!process.exitCode) console.log(`Rawafid central theme import graph passed: ${importedCss.length} unique compatibility modules.`);
