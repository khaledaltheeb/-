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
const FLAT_TARGET = path.join(ROOT, 'public', 'practical-static');

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

function firstExisting(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function writeFlatPair(slug, htmlSource, rscSource) {
  // Keep normal extensions for diagnostics, opaque legacy fallbacks, and
  // text-safe payloads. The .txt variants are intentionally simple static
  // objects so Cloudflare Assets cannot apply HTML canonicalization rules.
  fs.copyFileSync(htmlSource, path.join(FLAT_TARGET, `${slug}.html`));
  fs.copyFileSync(rscSource, path.join(FLAT_TARGET, `${slug}.rsc`));
  fs.copyFileSync(htmlSource, path.join(FLAT_TARGET, `${slug}.page-data`));
  fs.copyFileSync(rscSource, path.join(FLAT_TARGET, `${slug}.rsc-data`));
  fs.copyFileSync(htmlSource, path.join(FLAT_TARGET, `${slug}.html.txt`));
  fs.copyFileSync(rscSource, path.join(FLAT_TARGET, `${slug}.rsc.txt`));
}

fs.rmSync(FLAT_TARGET, { recursive: true, force: true });
fs.mkdirSync(FLAT_TARGET, { recursive: true });

const worksheetSource = path.join(ROOT, '.next', 'server', 'app', 'resources', 'worksheets');
const worksheetTarget = path.join(ROOT, 'public', 'resources', 'worksheets');
const worksheetCounts = materializeRouteTree(worksheetSource, worksheetTarget);

for (const slug of REQUIRED_WORKSHEET_SLUGS) {
  const html = path.join(worksheetTarget, slug, 'index.html');
  const rsc = path.join(worksheetTarget, slug, 'index.rsc');
  if (!fs.existsSync(html)) throw new Error(`Required worksheet HTML was not materialized: ${slug}`);
  if (!fs.existsSync(rsc)) throw new Error(`Required worksheet RSC was not materialized: ${slug}`);
  writeFlatPair(slug, html, rsc);
}

const evidenceRoot = path.join(ROOT, '.next', 'server', 'app', 'evidence-guides');
const toolkitHtmlSource = firstExisting([
  path.join(evidenceRoot, `${TOOLKIT_SLUG}.html`),
  path.join(evidenceRoot, TOOLKIT_SLUG, 'page.html'),
  path.join(evidenceRoot, TOOLKIT_SLUG, 'index.html'),
]);
const toolkitRscSource = firstExisting([
  path.join(evidenceRoot, `${TOOLKIT_SLUG}.rsc`),
  path.join(evidenceRoot, TOOLKIT_SLUG, 'page.rsc'),
  path.join(evidenceRoot, TOOLKIT_SLUG, 'index.rsc'),
]);
if (!toolkitHtmlSource) throw new Error(`Required Dyslexia Norway toolkit HTML source was not found: ${TOOLKIT_SLUG}`);
if (!toolkitRscSource) throw new Error(`Required Dyslexia Norway toolkit RSC source was not found: ${TOOLKIT_SLUG}`);

const toolkitTarget = path.join(ROOT, 'public', 'evidence-guides', TOOLKIT_SLUG);
fs.mkdirSync(toolkitTarget, { recursive: true });
fs.copyFileSync(toolkitHtmlSource, path.join(toolkitTarget, 'index.html'));
fs.copyFileSync(toolkitRscSource, path.join(toolkitTarget, 'index.rsc'));
writeFlatPair(TOOLKIT_SLUG, toolkitHtmlSource, toolkitRscSource);

for (const slug of [...REQUIRED_WORKSHEET_SLUGS, TOOLKIT_SLUG]) {
  for (const extension of ['html', 'rsc', 'page-data', 'rsc-data', 'html.txt', 'rsc.txt']) {
    const file = path.join(FLAT_TARGET, `${slug}.${extension}`);
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error(`Required flat practical asset missing: ${slug}.${extension}`);
  }
}

console.log(`Practical resource public asset staging complete: worksheets ${worksheetCounts.htmlCount} HTML / ${worksheetCounts.rscCount} RSC; 42 flat Dyslexia Norway assets created under public/practical-static, including text-safe Worker payloads.`);
