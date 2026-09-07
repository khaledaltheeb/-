import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REQUIRED_WORKSHEET_SLUGS = [
  'dyslexia-reading-observation',
  'dyscalculia-math-observation',
  'dld-language-observation',
  'learning-support-four-week-log',
  'learning-referral-evidence-pack',
  'family-school-learning-communication',
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const sourceRoot = path.join(ROOT, '.next', 'server', 'app', 'resources', 'worksheets');
const assetRoot = path.join(ROOT, 'public', 'resources', 'worksheets');
if (!fs.existsSync(sourceRoot)) throw new Error(`Worksheet Next output is missing: ${sourceRoot}`);

let htmlCount = 0;
let rscCount = 0;
for (const source of walk(sourceRoot)) {
  const extension = path.extname(source);
  if (extension !== '.html' && extension !== '.rsc') continue;
  const relative = path.relative(sourceRoot, source);
  const withoutExtension = relative.slice(0, -extension.length);
  const parts = withoutExtension.split(path.sep).filter(Boolean);
  if (parts.at(-1) === 'page') parts.pop();
  if (!parts.length) continue;
  const destinationDir = path.join(assetRoot, ...parts);
  fs.mkdirSync(destinationDir, { recursive: true });
  const destination = path.join(destinationDir, extension === '.html' ? 'index.html' : 'index.rsc');
  fs.copyFileSync(source, destination);
  if (extension === '.html') htmlCount += 1;
  else rscCount += 1;
}

for (const slug of REQUIRED_WORKSHEET_SLUGS) {
  const html = path.join(assetRoot, slug, 'index.html');
  const rsc = path.join(assetRoot, slug, 'index.rsc');
  if (!fs.existsSync(html)) throw new Error(`Required worksheet HTML was not materialized: ${slug}`);
  if (!fs.existsSync(rsc)) throw new Error(`Required worksheet RSC was not materialized: ${slug}`);
}

console.log(`Worksheet public asset staging complete: ${htmlCount} HTML and ${rscCount} RSC assets.`);
