import fs from 'node:fs';
import path from 'node:path';

const appRoot = 'app';

function walk(dir, predicate, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, predicate, out);
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function pageRoute(file) {
  const relative = path.relative(appRoot, path.dirname(file)).split(path.sep).filter(Boolean);
  if (relative.some((segment) => segment.includes('['))) return null;
  const visible = relative.filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')));
  return visible.length ? `/${visible.join('/')}` : '/';
}

function variants(route) {
  if (route === '/') return ["'/'", '"/"'];
  return [
    `'${route}'`, `"${route}"`, `\`${route}\``,
    `'${route}/'`, `"${route}/"`, `\`${route}/\``,
  ];
}

const pageFiles = walk(appRoot, (file) => /\/page\.(?:ts|tsx)$/.test(file.replaceAll('\\', '/')));
const sitemapFiles = [
  'app/sitemap.xml/route.ts',
  ...walk('app/sitemaps', (file) => /\/route\.(?:ts|tsx)$/.test(file.replaceAll('\\', '/'))),
];
const sitemapSource = sitemapFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

const candidates = [];
for (const file of pageFiles) {
  const route = pageRoute(file);
  if (!route) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('buildSeoMetadata')) continue;
  if (/index\s*:\s*false/.test(source)) continue;
  candidates.push({ file, route });
}

const missing = candidates.filter(({ route }) => !variants(route).some((variant) => sitemapSource.includes(variant)));

if (missing.length) {
  console.error(`STATIC SITEMAP COVERAGE CONTRACT FAILED: ${missing.length} indexable static route(s) are absent from all sitemap sources.`);
  for (const item of missing) console.error(`- ${item.route} (${item.file})`);
  process.exit(1);
}

console.log(`Static sitemap coverage contract passed: ${candidates.length} indexable static routes are represented in sitemap sources.`);
