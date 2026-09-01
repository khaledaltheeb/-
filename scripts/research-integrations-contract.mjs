import fs from 'node:fs';

const required = [
  'lib/research-integrations/http.ts',
  'lib/research-integrations/types.ts',
  'lib/research-integrations/ror.ts',
  'lib/research-integrations/europe-pmc.ts',
  'lib/research-integrations/lens.ts',
  'lib/research-integrations/dedupe.ts',
  'lib/research-integrations/evidence-discovery.ts',
  'app/api/v1/evidence-discovery/route.ts',
  'examples/lens-scholarly-demo/lens-demo.mjs',
  'docs/integrations/research-evidence.md',
  'supabase/migrations/20260901190000_ror_source_registry_v1.sql',
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing required research integration file: ${file}`);
}

const lens = fs.readFileSync('lib/research-integrations/lens.ts', 'utf8');
const ror = fs.readFileSync('lib/research-integrations/ror.ts', 'utf8');
const europe = fs.readFileSync('lib/research-integrations/europe-pmc.ts', 'utf8');
const route = fs.readFileSync('app/api/v1/evidence-discovery/route.ts', 'utf8');
const demo = fs.readFileSync('examples/lens-scholarly-demo/lens-demo.mjs', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260901190000_ror_source_registry_v1.sql', 'utf8');

const checks = [
  [lens.includes('https://api.lens.org/scholarly/search'), 'Lens Scholarly endpoint missing'],
  [lens.includes('Bearer ${token}'), 'Lens Bearer authorization missing'],
  [ror.includes('https://api.ror.org/v2/organizations'), 'ROR v2 endpoint missing'],
  [ror.includes('candidate.chosen === true'), 'ROR chosen:true selection missing'],
  [ror.includes('resolveRorFromDataset'), 'ROR dataset resolution missing'],
  [europe.includes('/fullTextXML'), 'Europe PMC full text XML support missing'],
  [europe.includes('/supplementaryFiles'), 'Europe PMC supplementary-files support missing'],
  [route.includes("withOptionalPartnerAccess(request, 'search:read')"), 'Partner search scope missing'],
  [migration.includes('enable row level security'), 'ROR registry RLS missing'],
  [migration.includes('source_organizations'), 'ROR source relationship table missing'],
];

for (const [ok, message] of checks) if (!ok) throw new Error(message);

const combined = [lens, demo].join('\n');
const obviousSecretPatterns = [/Bearer\s+[A-Za-z0-9_-]{24,}/, /LENS_SCHOLARLY_API_TOKEN\s*=\s*['\"][^.'\"]{12,}/];
for (const pattern of obviousSecretPatterns) {
  if (pattern.test(combined)) throw new Error('Possible hard-coded Lens credential detected.');
}

console.log('research-integrations-contract: PASS');
