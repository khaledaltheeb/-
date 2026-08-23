import fs from 'node:fs';
import path from 'node:path';

const SOURCE = 'data/legacy-production-batches/daily-tools/001.json';
const OUTPUT = 'public/sitemaps/daily-tools.xml';
const EXPECTED_TOOLS = 150;
const HUB_ROUTE = '/daily-tools/';

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function sourcePathToRoute(value) {
  if (typeof value !== 'string') return null;
  const sourcePath = value.trim();
  if (sourcePath === 'daily-tools/index.html') return HUB_ROUTE;
  const match = /^daily-tools\/([a-z0-9][a-z0-9-]{0,119})\/index\.html$/i.exec(sourcePath);
  return match ? `/daily-tools/${match[1].toLowerCase()}/` : null;
}

function productionOrigin() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').trim().replace(/\/$/, '');
  const url = new URL(raw);
  if (url.protocol !== 'https:') throw new Error(`Daily Tools sitemap requires an HTTPS site URL, received ${raw}`);
  return url.origin;
}

const payload = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
const records = Array.isArray(payload?.records) ? payload.records : [];
const routes = new Set();

for (const record of records) {
  const route = sourcePathToRoute(record?.source_path);
  if (route) routes.add(route);
}

if (!routes.has(HUB_ROUTE) || routes.size !== EXPECTED_TOOLS + 1) {
  throw new Error(`Daily Tools sitemap integrity failure: expected hub + ${EXPECTED_TOOLS} tools, found ${routes.size} routes.`);
}

const origin = productionOrigin();
const orderedRoutes = [HUB_ROUTE, ...[...routes].filter((route) => route !== HUB_ROUTE).sort()];
const rows = orderedRoutes
  .map((route) => `<url><loc>${escapeXml(`${origin}${route}`)}</loc></url>`)
  .join('');
const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows}</urlset>\n`;

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, xml, 'utf8');
console.log(`Built ${OUTPUT}: ${orderedRoutes.length} canonical Daily Tools URLs for ${origin}.`);
