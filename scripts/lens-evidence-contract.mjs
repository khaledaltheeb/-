import fs from 'node:fs';

const requiredFiles = [
  '.env.example',
  'lib/lens/client.ts',
  'lib/lens/types.ts',
  'lib/lens/aggregation.ts',
  'lib/evidence/types.ts',
  'lib/evidence/normalize-lens.ts',
  'lib/evidence/dedupe.ts',
  'app/api/evidence/lens/scholarly/route.ts',
  'app/api/evidence/lens/landscape/route.ts',
  'docs/lens-evidence-discovery.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing Lens evidence file: ${file}`);
}

const env = fs.readFileSync('.env.example', 'utf8');
if (!env.includes('LENS_SCHOLARLY_API_TOKEN=')) throw new Error('Missing Lens server token placeholder');
if (env.includes('NEXT_PUBLIC_LENS_')) throw new Error('Lens token must never be public');

const client = fs.readFileSync('lib/lens/client.ts', 'utf8');
if (!client.includes("import 'server-only'")) throw new Error('Lens client must remain server-only');
if (!client.includes("cache: 'no-store'")) throw new Error('Lens upstream calls must remain uncached until policy approval');
if (!client.includes('https://api.lens.org/scholarly/search')) throw new Error('Unexpected Lens scholarly endpoint');

const aggregation = fs.readFileSync('lib/lens/aggregation.ts', 'utf8');
if (!aggregation.includes("import 'server-only'")) throw new Error('Lens aggregation client must remain server-only');
if (!aggregation.includes('https://api.lens.org/scholarly/aggregate')) throw new Error('Unexpected Lens aggregation endpoint');
if (!aggregation.includes("cache: 'no-store'")) throw new Error('Lens aggregations must remain uncached until policy approval');

for (const routePath of [
  'app/api/evidence/lens/scholarly/route.ts',
  'app/api/evidence/lens/landscape/route.ts',
]) {
  const route = fs.readFileSync(routePath, 'utf8');
  if (!route.includes("'X-Robots-Tag': 'noindex, nofollow'")) throw new Error(`${routePath} must stay noindex during trial`);
  if (!route.includes("'Cache-Control': 'private, no-store'")) throw new Error(`${routePath} must stay no-store during trial`);
  if (!route.includes('Data sourced from The Lens')) throw new Error(`${routePath} is missing Lens attribution`);
}

const normalize = fs.readFileSync('lib/evidence/normalize-lens.ts', 'utf8');
for (const field of ['doi:', 'pmid:', 'isRetractedOrUpdated:', 'openAccess:', 'sourceUrls:']) {
  if (!normalize.includes(field)) throw new Error(`Normalizer missing ${field}`);
}

const dedupe = fs.readFileSync('lib/evidence/dedupe.ts', 'utf8');
if (!dedupe.includes('doi:')) throw new Error('Evidence dedupe must prioritize DOI');
if (!dedupe.includes('pmid:')) throw new Error('Evidence dedupe must support PMID');

console.log('Lens evidence contract: OK');
