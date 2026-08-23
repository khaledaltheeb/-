import fs from 'node:fs';
import path from 'node:path';

const INPUT = path.resolve(process.cwd(), 'data/legacy-production-batches/daily-tools/001.json');
const OUTPUT = path.resolve(process.cwd(), 'generated/daily-tools-routes.json');
const EXPECTED_TOOL_COUNT = 150;
const HUB_ROUTE = '/daily-tools/';

const payload = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const records = Array.isArray(payload?.records) ? payload.records : [];
const routes = new Set();

for (const record of records) {
  const sourcePath = typeof record?.source_path === 'string' ? record.source_path.trim() : '';
  if (sourcePath === 'daily-tools/index.html') {
    routes.add(HUB_ROUTE);
    continue;
  }
  const match = /^daily-tools\/([a-z0-9][a-z0-9-]{0,119})\/index\.html$/i.exec(sourcePath);
  if (match) routes.add(`/daily-tools/${match[1]}/`);
}

const tools = [...routes].filter((route) => route !== HUB_ROUTE).sort();
if (!routes.has(HUB_ROUTE)) {
  throw new Error('Daily Tools route manifest generation failed: hub route is missing.');
}
if (tools.length !== EXPECTED_TOOL_COUNT) {
  throw new Error(`Daily Tools route manifest generation failed: expected ${EXPECTED_TOOL_COUNT} tools, found ${tools.length}.`);
}

const manifest = [HUB_ROUTE, ...tools];
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Daily Tools route manifest generated: ${manifest.length} routes (${EXPECTED_TOOL_COUNT} tools + hub).`);
