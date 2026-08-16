import fs from 'node:fs';

const routes = JSON.parse(fs.readFileSync('data/legacy-route-consolidations/guides.v1.json', 'utf8'));
const config = fs.readFileSync('next.config.ts', 'utf8');
const fail = (message) => { console.error(`LEGACY GUIDE ROUTE CONTRACT FAILED: ${message}`); process.exitCode = 1; };

if (!Array.isArray(routes) || routes.length !== 18) fail(`expected 18 consolidated legacy guide routes; found ${routes.length}`);
const sources = new Set();
for (const row of routes) {
  if (!row.source?.startsWith('/guides/') || !row.destination?.startsWith('/') || !row.reason) fail(`invalid route record: ${JSON.stringify(row)}`);
  if (sources.has(row.source)) fail(`duplicate source route: ${row.source}`);
  sources.add(row.source);
  if (row.source === row.destination) fail(`self redirect: ${row.source}`);
  if (!config.includes(`source: '${row.source}'`) || !config.includes(`destination: '${row.destination}'`)) fail(`next.config.ts is missing consolidation route ${row.source} -> ${row.destination}`);
}
if (!config.includes('...legacyThinGuideRedirects')) fail('legacy guide redirects must be registered as one explicit migration group');
if (!process.exitCode) console.log('Legacy guide consolidation contract passed: 18 thin legacy guides map to richer published destinations.');
