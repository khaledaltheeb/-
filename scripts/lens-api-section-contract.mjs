import fs from 'node:fs';

const required = [
  'app/api/v1/lens/route.ts',
  'app/developers/lens/page.tsx',
  'app/api/v1/route.ts',
  'app/api/v1/evidence-discovery/route.ts',
  'app/api/openapi.json/route.ts',
  'lib/research-integrations/lens.ts',
  'lib/research-integrations/lens-quota.ts',
  'supabase/migrations/20260907114800_lens_scholarly_quota_guard.sql',
];
for (const file of required) if (!fs.existsSync(file)) throw new Error(`Lens API section missing ${file}`);

const manifest = fs.readFileSync('app/api/v1/lens/route.ts', 'utf8');
const docs = fs.readFileSync('app/developers/lens/page.tsx', 'utf8');
const discovery = fs.readFileSync('app/api/v1/route.ts', 'utf8');
const evidence = fs.readFileSync('app/api/v1/evidence-discovery/route.ts', 'utf8');
const openapi = fs.readFileSync('app/api/openapi.json/route.ts', 'utf8');
const lens = fs.readFileSync('lib/research-integrations/lens.ts', 'utf8');
const quota = fs.readFileSync('lib/research-integrations/lens-quota.ts', 'utf8');
const migration = fs.readFileSync('supabase/migrations/20260907114800_lens_scholarly_quota_guard.sql', 'utf8');

const mustContain = (text, markers, label) => {
  for (const marker of markers) if (!text.includes(marker)) throw new Error(`${label} missing ${marker}`);
};

mustContain(manifest, [
  "status: configured ? 'configured' : 'awaiting_credential'",
  "mode: 'explicit_opt_in'",
  "required_provider_parameter: 'providers=lens'",
  "label: 'Data Sourced from The Lens'",
  'lens_id_preserved: true',
  'requests_per_minute: 10',
  'requests_per_month: 20000',
  "credential: 'server_side_only'",
  'lens_specific_user_tracking: false',
  'quota_accounting_contains_user_identifiers: false',
  'api_access_does_not_imply_full_text_reuse_rights: true',
  'other_providers_remain_available: true',
], 'Lens machine-readable manifest');

mustContain(docs, [
  'Lens.org وLens Labs',
  '/api/v1/lens',
  'providers=lens',
  'Data Sourced from The Lens',
  '10 طلبات في الدقيقة',
  '20,000 طلب في الشهر',
  'LENS_SCHOLARLY_API_TOKEN',
  'SECURITY INVOKER',
  'collective_name',
  'not_configured',
  'rate_limited',
  'provider_unavailable',
], 'Lens developer section');

mustContain(discovery, [
  "'evidence-discovery','lens','changes'",
  "default_providers: ['europe_pmc','crossref','datacite']",
  "href: '/api/v1/lens'",
  "documentation: '/developers/lens'",
  "mode: 'explicit_opt_in'",
], 'API discovery');
if (discovery.includes("default_providers: ['europe_pmc','crossref','datacite','lens']")) {
  throw new Error('Lens must never re-enter the default provider set.');
}

mustContain(evidence, [
  "const DEFAULT_PROVIDERS: EvidenceProvider[] = ['europe_pmc', 'crossref', 'datacite']",
  'LENS_ATTRIBUTION',
  "enforcement: 'distributed_fail_closed'",
], 'Evidence route');

mustContain(openapi, [
  "{ name: 'Lens', description: 'Dedicated Lens Scholarly API integration manifest and usage contract.' }",
  "'/lens': { get:",
  "operationId: 'getLensIntegrationManifest'",
  "#/components/schemas/LensIntegrationManifest",
  'LensIntegrationManifest:',
  "const: 'explicit_opt_in'",
  "const: 'providers=lens'",
  "const: 'Data Sourced from The Lens'",
  'requests_per_minute: { type: \'integer\', const: 10 }',
  'requests_per_month: { type: \'integer\', const: 20000 }',
  "const: 'distributed_fail_closed'",
  "const: 'server_side_only'",
  'exposed_to_client: { type: \'boolean\', const: false }',
  'lens_specific_user_tracking: { type: \'boolean\', const: false }',
  'api_access_does_not_imply_full_text_reuse_rights: { type: \'boolean\', const: true }',
], 'OpenAPI Lens contract');

mustContain(lens, [
  "provider: 'The Lens'",
  'Data Sourced from The Lens',
  'identifiers: { doi:',
  'lens: lensId',
  'collective_name',
  'await acquireLensScholarlyQuota()',
  'attempts: 1',
], 'Lens connector');

mustContain(quota, ["client.rpc('acquire_lens_scholarly_quota')", 'failed closed'], 'Lens quota client');
mustContain(migration, [
  'private.acquire_lens_scholarly_quota_internal()',
  'security definer',
  'public.acquire_lens_scholarly_quota()',
  'security invoker',
  'grant execute on function public.acquire_lens_scholarly_quota() to service_role',
], 'Lens quota migration');

const combined = [manifest, docs, discovery, evidence, openapi, lens, quota].join('\n');
for (const pattern of [/LENS_SCHOLARLY_API_TOKEN\s*=\s*['\"][^'\"]+/, /Bearer\s+[A-Za-z0-9_-]{24,}/]) {
  if (pattern.test(combined)) throw new Error('Possible Lens credential disclosure detected.');
}

console.log('lens-api-section-contract: PASS');
