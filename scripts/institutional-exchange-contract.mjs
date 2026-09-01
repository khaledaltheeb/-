import fs from 'node:fs';

let failed = false;
const fail = (message) => { console.error(`INSTITUTIONAL EXCHANGE CONTRACT FAILED: ${message}`); failed = true; };
const read = (path) => fs.readFileSync(path, 'utf8');

const required = [
  'lib/partner-api-v1.ts',
  'app/api/v1/integrations/[resource]/route.ts',
  'supabase/migrations/20260901213000_institutional_exchange_v1.sql',
];
for (const path of required) if (!fs.existsSync(path)) fail(`missing ${path}`);

const partner = read('lib/partner-api-v1.ts');
for (const scope of [
  'people:submit','specialists:submit','organizations:submit','courses:submit',
  'events:submit','schedules:submit','imports:read','webhooks:manage',
]) if (!partner.includes(`'${scope}'`)) fail(`partner scope missing ${scope}`);
for (const marker of ['partnerCredentialHash', "createHash('sha256')", 'Idempotency-Key']) {
  if (!partner.includes(marker)) fail(`partner helper missing ${marker}`);
}
if (/SERVICE_ROLE|service_role_key|NEXT_PUBLIC_SUPABASE_SERVICE/i.test(partner)) fail('partner runtime must not embed a service-role credential');

const route = read('app/api/v1/integrations/[resource]/route.ts');
for (const marker of [
  "new Set(['person', 'specialist', 'organization', 'course', 'event', 'schedule'])",
  "request.headers.get('idempotency-key')",
  'MAX_BODY_BYTES',
  'api_partner_submit_integration',
  'api_partner_integration_status',
  'review_required: true',
  "publication_boundary: 'Submissions enter governed staging",
  "'Cache-Control', 'private, no-store'",
  "'GET,POST,OPTIONS'",
]) if (!route.includes(marker)) fail(`integration route missing ${marker}`);
if (/\.from\(['"](?:content|specialists|organizations|centers)['"]\)\.(?:insert|upsert|update)/.test(route)) {
  fail('integration HTTP route must never write directly to live publication/provider tables');
}
if (/SERVICE_ROLE|service_role_key|NEXT_PUBLIC_SUPABASE_SERVICE/i.test(route)) fail('integration runtime must not embed a service-role credential');

const migration = read('supabase/migrations/20260901213000_institutional_exchange_v1.sql');
for (const marker of [
  'api_integration_items',
  'api_integration_requests',
  'unique(partner_id,resource_type,external_id)',
  'unique(partner_id,idempotency_key)',
  'payload_sha256',
  'api_partner_submit_integration',
  'api_partner_integration_status',
  'admin_review_api_integration_item',
  'admin_mark_api_integration_published',
  'enable row level security',
  'api_integration_items_deny_direct',
  'api_integration_requests_deny_direct',
  "status='accepted'",
  "^https://healthrenewal\\.org/",
  'pg_advisory_xact_lock',
  'extensions.digest',
  "set search_path=''",
]) if (!migration.includes(marker)) fail(`exchange migration missing ${marker}`);

for (const liveTable of ['public.specialists', 'public.organizations', 'public.content', 'public.centers']) {
  const directWrite = new RegExp(`(?:insert\\s+into|update|delete\\s+from)\\s+${liveTable.replace('.', '\\.')}`, 'i');
  if (directWrite.test(migration)) fail(`exchange migration writes directly to live table ${liveTable}`);
}

if (!migration.includes("octet_length(p_payload::text)>262144")) fail('database payload size ceiling missing');
if (!migration.includes("octet_length(p_provenance::text)>65536")) fail('database provenance size ceiling missing');

if (failed) process.exit(1);
console.log('RAWAFID INSTITUTIONAL EXCHANGE V1 GOVERNANCE CONTRACT OK');
