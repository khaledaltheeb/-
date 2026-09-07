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
const TOOLKIT_SLUG = 'dyslexia-norway-school-observation-toolkit';

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function routeParts(relative, extension) {
  const withoutExtension = relative.slice(0, -extension.length);
  const parts = withoutExtension.split(path.sep).filter(Boolean);
  if (parts.at(-1) === 'page') parts.pop();
  return parts;
}

function materializeTree(sourceRoot, assetRoot) {
  if (!fs.existsSync(sourceRoot)) throw new Error(`Next output is missing: ${sourceRoot}`);
  const written = [];
  for (const source of walk(sourceRoot)) {
    const extension = path.extname(source);
    if (extension !== '.html' && extension !== '.rsc') continue;
    const relative = path.relative(sourceRoot, source);
    const parts = routeParts(relative, extension);
    if (!parts.length) continue;
    const destinationDir = path.join(assetRoot, ...parts);
    fs.mkdirSync(destinationDir, { recursive: true });
    const destination = path.join(destinationDir, extension === '.html' ? 'index.html' : 'index.rsc');
    fs.copyFileSync(source, destination);
    written.push({ extension, parts, destination });
  }
  return written;
}

const worksheetsSource = path.join(ROOT, '.next', 'server', 'app', 'resources', 'worksheets');
const worksheetsTarget = path.join(ROOT, 'public', 'resources', 'worksheets');
const worksheetFiles = materializeTree(worksheetsSource, worksheetsTarget);

for (const slug of REQUIRED_WORKSHEET_SLUGS) {
  const html = path.join(worksheetsTarget, slug, 'index.html');
  const rsc = path.join(worksheetsTarget, slug, 'index.rsc');
  if (!fs.existsSync(html)) throw new Error(`Required worksheet HTML was not materialized: ${slug}`);
  if (!fs.existsSync(rsc)) throw new Error(`Required worksheet RSC was not materialized: ${slug}`);
}

const evidenceSource = path.join(ROOT, '.next', 'server', 'app', 'evidence-guides');
const evidenceTarget = path.join(ROOT, 'public', 'evidence-guides');
const evidenceFiles = materializeTree(evidenceSource, evidenceTarget);
const toolkitHtml = path.join(evidenceTarget, TOOLKIT_SLUG, 'index.html');
const toolkitRsc = path.join(evidenceTarget, TOOLKIT_SLUG, 'index.rsc');
if (!fs.existsSync(toolkitHtml)) throw new Error(`Toolkit HTML was not materialized: ${TOOLKIT_SLUG}`);
if (!fs.existsSync(toolkitRsc)) throw new Error(`Toolkit RSC was not materialized: ${TOOLKIT_SLUG}`);

const worksheetHtmlCount = worksheetFiles.filter((item) => item.extension === '.html').length;
const worksheetRscCount = worksheetFiles.filter((item) => item.extension === '.rsc').length;
const evidenceHtmlCount = evidenceFiles.filter((item) => item.extension === '.html').length;
const evidenceRscCount = evidenceFiles.filter((item) => item.extension === '.rsc').length;
console.log(`Practical resources static staging complete: worksheets ${worksheetHtmlCount} HTML / ${worksheetRscCount} RSC; evidence guides ${evidenceHtmlCount} HTML / ${evidenceRscCount} RSC.`);
