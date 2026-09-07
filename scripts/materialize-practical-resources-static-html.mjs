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

function materializeRouteTree(sourceRoot, assetRoot) {
  if (!fs.existsSync(sourceRoot)) throw new Error(`Next output is missing: ${sourceRoot}`);
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
  return { htmlCount, rscCount };
}

const worksheetSource = path.join(ROOT, '.next', 'server', 'app', 'resources', 'worksheets');
const worksheetTarget = path.join(ROOT, 'public', 'resources', 'worksheets');
const worksheetCounts = materializeRouteTree(worksheetSource, worksheetTarget);

for (const slug of REQUIRED_WORKSHEET_SLUGS) {
  const html = path.join(worksheetTarget, slug, 'index.html');
  const rsc = path.join(worksheetTarget, slug, 'index.rsc');
  if (!fs.existsSync(html)) throw new Error(`Required worksheet HTML was not materialized: ${slug}`);
  if (!fs.existsSync(rsc)) throw new Error(`Required worksheet RSC was not materialized: ${slug}`);
}

const toolkitSource = path.join(ROOT, '.next', 'server', 'app', 'evidence-guides', TOOLKIT_SLUG);
const toolkitTarget = path.join(ROOT, 'public', 'evidence-guides', TOOLKIT_SLUG);
const toolkitCounts = materializeRouteTree(toolkitSource, toolkitTarget);
const toolkitHtml = path.join(toolkitTarget, 'index.html');
const toolkitRsc = path.join(toolkitTarget, 'index.rsc');
if (!fs.existsSync(toolkitHtml)) throw new Error(`Required Dyslexia Norway toolkit HTML was not materialized: ${TOOLKIT_SLUG}`);
if (!fs.existsSync(toolkitRsc)) throw new Error(`Required Dyslexia Norway toolkit RSC was not materialized: ${TOOLKIT_SLUG}`);

console.log(`Practical resource public asset staging complete: worksheets ${worksheetCounts.htmlCount} HTML / ${worksheetCounts.rscCount} RSC; toolkit ${toolkitCounts.htmlCount} HTML / ${toolkitCounts.rscCount} RSC.`);
