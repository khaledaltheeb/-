import fs from 'node:fs';
import path from 'node:path';

const INPUT = path.resolve(process.cwd(), 'data/legacy-production-batches/daily-tools/001.json');
const OUTPUT = path.resolve(process.cwd(), 'generated/daily-tools-routes.json');
const ASSET_DIR = path.resolve(process.cwd(), 'public/daily-tools-data/records');
const EXPECTED_TOOL_COUNT = 150;
const HUB_ROUTE = '/daily-tools/';

const payload = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const records = Array.isArray(payload?.records) ? payload.records : [];
const routes = new Set();
const assets = new Map();

function sourcePathToRoute(sourcePath) {
  if (sourcePath === 'daily-tools/index.html') return HUB_ROUTE;
  const match = /^daily-tools\/([a-z0-9][a-z0-9-]{0,119})\/index\.html$/i.exec(sourcePath);
  return match ? `/daily-tools/${match[1].toLowerCase()}/` : null;
}

function routeToAssetName(route) {
  if (route === HUB_ROUTE) return 'hub.json';
  const match = /^\/daily-tools\/([a-z0-9][a-z0-9-]{0,119})\/$/i.exec(route);
  return match ? `${match[1].toLowerCase()}.json` : null;
}

for (const record of records) {
  const sourcePath = typeof record?.source_path === 'string' ? record.source_path.trim() : '';
  const route = sourcePathToRoute(sourcePath);
  if (!route) continue;
  const assetName = routeToAssetName(route);
  if (!assetName) continue;
  if (routes.has(route) || assets.has(assetName)) {
    throw new Error(`Daily Tools asset generation failed: duplicate route ${route}.`);
  }
  routes.add(route);
  assets.set(assetName, record);
}

const tools = [...routes].filter((route) => route !== HUB_ROUTE).sort();
if (!routes.has(HUB_ROUTE)) {
  throw new Error('Daily Tools route manifest generation failed: hub route is missing.');
}
if (tools.length !== EXPECTED_TOOL_COUNT) {
  throw new Error(`Daily Tools route manifest generation failed: expected ${EXPECTED_TOOL_COUNT} tools, found ${tools.length}.`);
}
if (assets.size !== EXPECTED_TOOL_COUNT + 1) {
  throw new Error(`Daily Tools content asset generation failed: expected ${EXPECTED_TOOL_COUNT + 1} records, found ${assets.size}.`);
}

const manifest = [HUB_ROUTE, ...tools];
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

fs.rmSync(ASSET_DIR, { recursive: true, force: true });
fs.mkdirSync(ASSET_DIR, { recursive: true });
for (const [assetName, record] of assets) {
  fs.writeFileSync(path.join(ASSET_DIR, assetName), `${JSON.stringify(record)}\n`, 'utf8');
}

console.log(`Daily Tools route manifest generated: ${manifest.length} routes (${EXPECTED_TOOL_COUNT} tools + hub).`);
console.log(`Daily Tools content assets materialized: ${assets.size} immutable JSON records under public/daily-tools-data/records/.`);
