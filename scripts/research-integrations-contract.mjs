import fs from 'node:fs';

const required = [
  'lib/research-integrations/http.ts',
  'lib/research-integrations/types.ts',
  'lib/research-integrations/ror.ts',
  'lib/research-integrations/europe-pmc.ts',
  'lib/research-integrations/crossref.ts',
  'lib/research-integrations/lens.ts',
  'lib/research-integrations/dedupe.ts',
  'lib/research-integrations/evidence-discovery.ts',
  'app/api/v1/evidence-discovery/route.ts',
  'app/api/openapi.json/route.ts',
  'app/developers/page.tsx',
  'examples/lens-scholarly-demo/lens-demo.mjs',
  'docs/integrations/research-evidence.md',
  'supabase/migrations/20260901190000_ror_source_registry_v1.sql',
  'supabase/migrations/20260901192000_ror_registry_explicit_deny.sql',
  'supabase/migrations/20260901212203_source_connection_metadata_v1.sql',
];

for (const file of required) if (!fs.existsSync(file)) throw new Error(`Missing required research integration file: ${file}`);

const lens = fs.readFileSync('lib/research-integrations/lens.ts', 'utf8');
const crossref = fs.readFileSync('lib/research-integrations/crossref.ts', 'utf8');
const ror = fs.readFileSync('lib/research-integrations/ror.ts', 'utf8');
const europe = fs.readFileSync('lib/research-integrations/europe-pmc.ts', 'utf8');
const route = fs.readFileSync('app/api/v1/evidence-discovery/route.ts', 'utf8');
const openapi = fs.readFileSync('app/api/openapi.json/route.ts', 'utf8');
const developers = fs.readFileSync('app/developers/page.tsx', 'utf8');
const demo = fs.readFileSync('examples/lens-scholarly-demo/lens-demo.mjs', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260901190000_ror_source_registry_v1.sql', 'utf8');
const denyMigration = fs.readFileSync('supabase/migrations/20260901192000_ror_registry_explicit_deny.sql', 'utf8');
const connectionMigration = fs.readFileSync('supabase/migrations/20260901212203_source_connection_metadata_v1.sql', 'utf8');

const lensRetractionGuard = lens.includes('function isRetracted') && lens.includes('update_nature') && lens.includes(".toLowerCase()") && lens.includes("nature === 'retraction'") && lens.includes('is_retracted: isRetracted(row.retraction_updates)');
const crossrefContract = crossref.includes('https://api.crossref.org/works') && crossref.includes("'query.bibliographic'") && crossref.includes('mailto') && crossref.includes("'User-Agent'") && crossref.includes("cursor: options.cursor?.trim() || '*'") && crossref.includes('from-update-date') && crossref.includes('from-index-date') && crossref.includes('relations(row');
const developerEvidenceContract = developers.includes('/api/v1/evidence-discovery') && developers.includes('europe_pmc') && developers.includes('crossref') && developers.includes('LENS_SCHOLARLY_API_TOKEN') && developers.includes('ROR') && developers.includes('ORCID') && developers.includes('related_identifiers') && developers.includes('503') && developers.includes('إعادة نشر');

const checks = [
  [lens.includes('https://api.lens.org/scholarly/search'), 'Lens Scholarly endpoint missing'],
  [lens.includes('Bearer ${token}'), 'Lens Bearer authorization missing'],
  [lensRetractionGuard, 'Lens retraction semantic guard missing'],
  [crossrefContract, 'Crossref polite-pool/cursor/incremental contract missing'],
  [ror.includes('https://api.ror.org/v2/organizations'), 'ROR v2 endpoint missing'],
  [ror.includes('candidate.chosen === true'), 'ROR chosen:true selection missing'],
  [ror.includes('resolveRorFromDataset'), 'ROR dataset resolution missing'],
  [europe.includes('/fullTextXML'), 'Europe PMC full text XML support missing'],
  [europe.includes('/supplementaryFiles'), 'Europe PMC supplementary-files support missing'],
  [europe.includes('normalizeOrcid'), 'Europe PMC typed ORCID normalization missing'],
  [europe.includes('rorFromOrgIdentifier'), 'Europe PMC ROR affiliation normalization missing'],
  [route.includes("withOptionalPartnerAccess(request, 'search:read')"), 'Partner search scope missing'],
  [route.includes("['europe_pmc', 'crossref', 'lens']"), 'Unified provider list is incomplete'],
  [route.includes('crossref_cursor'), 'Crossref independent cursor missing'],
  [openapi.includes("'/evidence-discovery'"), 'Evidence discovery OpenAPI path missing'],
  [openapi.includes("operationId: 'discoverEvidence'"), 'Evidence discovery OpenAPI operation missing'],
  [developerEvidenceContract, 'Public developer evidence-discovery documentation is incomplete'],
  [migration.includes('enable row level security'), 'ROR registry RLS missing'],
  [migration.includes('source_organizations'), 'ROR source relationship table missing'],
  [denyMigration.includes('as restrictive'), 'ROR explicit restrictive RLS policy missing'],
  [denyMigration.includes('using (false)'), 'ROR explicit direct-access deny missing'],
  [connectionMigration.includes('source_related_identifiers'), 'RelatedIdentifier registry missing'],
  [connectionMigration.includes('source_contributors'), 'Contributor/ORCID registry missing'],
  [connectionMigration.includes('source_contributor_organizations'), 'Contributor/ROR relationship missing'],
];

for (const [ok, message] of checks) if (!ok) throw new Error(message);

const combined = [lens, demo].join('\n');
const obviousSecretPatterns = [/Bearer\s+[A-Za-z0-9_-]{24,}/, /LENS_SCHOLARLY_API_TOKEN\s*=\s*['\"][^.'\"]{12,}/];
for (const pattern of obviousSecretPatterns) if (pattern.test(combined)) throw new Error('Possible hard-coded Lens credential detected.');

console.log('research-integrations-contract: PASS');
