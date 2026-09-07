import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const sourceRoot = path.join(ROOT, '.next', 'server', 'app', 'capabilities', 'kids-lab');
const assetRoot = path.join(ROOT, '.open-next', 'assets', 'capabilities', 'kids-lab');
if (!fs.existsSync(sourceRoot)) throw new Error(`Kids Lab Next output is missing: ${sourceRoot}`);
if (!fs.existsSync(path.join(ROOT, '.open-next', 'assets'))) throw new Error('OpenNext assets directory is missing; run this after opennextjs-cloudflare build.');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

fs.rmSync(assetRoot, { recursive: true, force: true });
let htmlCount = 0;
let rscCount = 0;
for (const source of walk(sourceRoot)) {
  const extension = path.extname(source);
  if (extension !== '.html' && extension !== '.rsc') continue;
  let relative = path.relative(sourceRoot, source);
  const withoutExtension = relative.slice(0, -extension.length);
  const parts = withoutExtension.split(path.sep);
  if (parts.at(-1) === 'page') parts.pop();
  const destinationDir = path.join(assetRoot, ...parts);
  fs.mkdirSync(destinationDir, { recursive: true });
  const destination = path.join(destinationDir, extension === '.html' ? 'index.html' : 'index.rsc');
  fs.copyFileSync(source, destination);
  if (extension === '.html') htmlCount += 1;
  else rscCount += 1;
}

if (htmlCount < 1000) throw new Error(`Expected at least 1000 prerendered Kids Lab HTML documents; materialized ${htmlCount}`);
console.log(`Kids Lab static HTML materialization complete: ${htmlCount} HTML and ${rscCount} RSC assets.`);
