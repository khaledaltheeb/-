import fs from 'node:fs';

const required = [
  'lib/public-api-v1.ts',
  'lib/partner-api-v1.ts',
  'app/api/v1/route.ts',
  'app/api/v1/content/route.ts',
  'app/api/v1/content/[slug]/route.ts',
  'app/api/v1/content/[slug]/sources/route.ts',
  'app/api/v1/[resource]/route.ts',
  'app/api/v1/search/route.ts',
  'app/api/v1/evidence-discovery/route.ts',
  'app/api/v1/changes/route.ts',
  'app/api/v1/stats/route.ts',
  'app/api/openapi.json/route.ts',
  'app/feed.xml/route.ts',
  'app/feed.json/route.ts',
  'app/magazine/feed.xml/route.ts',
  'app/developers/page.tsx',
  'supabase/migrations/20260901032000_public_api_v1_change_log.sql',
  'supabase/migrations/20260901035000_partner_api_core_v1.sql',
  'supabase/migrations/20260901203000_public_api_change_log_semantics_v2.sql',
  'supabase/migrations/20260901204500_partner_api_admin_acl_hardening_v2.sql',
];

let failed = false;
const fail = (message) => { console.error(`PUBLIC API V1 CONTRACT FAILED: ${message}`); failed = true; };
for (const file of required) if (!fs.existsSync(file)) fail(`missing ${file}`);

const core = fs.readFileSync('lib/public-api-v1.ts', 'utf8');
for (const marker of [
  "PUBLIC_API_VERSION = '1.2.0'",
  ".eq('status', 'published')",
  ".eq('robots_index', true)",
  "'ETag'",
  'If-Modified-Since',
  "request.headers.get('if-modified-since')",
  "'X-Request-Id'",
  "'Access-Control-Allow-Origin': '*'",
  "reuse: reuse || 'link_and_citation_only'",
  "pages: ['landing_page', 'directory_page', 'sector_page']",
  'encodeCursor',
  'decodeCursor',
  'PUBLIC_SCHEMA_KEYS',
  'sanitizeStructuredValue',
  'requestIdFor',
  'latestTimestamp',
]) if (!core.includes(marker)) fail(`core missing ${marker}`);

for (const forbidden of ['SERVICE_ROLE', 'SUPABASE_SERVICE', 'service_role_key', 'NEXT_PUBLIC_SUPABASE_SERVICE']) {
  if (core.includes(forbidden)) fail(`public API core must not use privileged database secret: ${forbidden}`);
}

const partner = fs.readFileSync('lib/partner-api-v1.ts', 'utf8');
for (const marker of [
  "createHash('sha256')",
  "'x-api-key'",
  "'authorization'",
  'api_partner_authorize',
  "'rate_limited'",
  'decoratePartnerResponse',
  'requestIdFor',
  "merged.set('Cache-Control', 'private, no-store')",
  "merged.set('Vary', 'Authorization, X-API-Key')",
]) if (!partner.includes(marker)) fail(`partner API helper missing ${marker}`);
if (/service.role|SERVICE_ROLE|service_role_key/i.test(partner)) fail('partner API runtime must not embed a service-role secret');

const taxonomy = fs.readFileSync('app/api/v1/[resource]/route.ts', 'utf8');
if (/fields:\s*['"][^'"]*metadata/.test(taxonomy)) fail('public taxonomy must not select internal metadata');

const changes = fs.readFileSync('app/api/v1/changes/route.ts', 'utf8');
for (const marker of ['encodeChangeCursor', 'decodeChangeCursor', 'next_cursor', 'id.gt.', 'Compatibility only']) {
  if (!changes.includes(marker)) fail(`lossless change stream missing ${marker}`);
}

const evidence = fs.readFileSync('app/api/v1/evidence-discovery/route.ts', 'utf8');
if (!evidence.includes("if (!value) return ['europe_pmc'];")) fail('Europe PMC must be the default evidence provider');

const openapi = fs.readFileSync('app/api/openapi.json/route.ts', 'utf8');
for (const marker of [
  "openapi: '3.1.0'",
  'version: PUBLIC_API_VERSION',
  "'/content/{slug}/sources'",
  "'/evidence-discovery'",
  "'/changes'",
  "name: 'cursor'",
  "default: 'europe_pmc'",
  'PartnerApiKey',
  'PartnerBearer',
  'Sanitized public structured-data projection',
]) if (!openapi.includes(marker)) fail(`OpenAPI contract missing ${marker}`);

const migration = fs.readFileSync('supabase/migrations/20260901032000_public_api_v1_change_log.sql', 'utf8');
for (const marker of ['enable row level security', 'api_change_log_public_read', 'api_public_stats', 'public_api_content_change_log']) {
  if (!migration.includes(marker)) fail(`migration missing ${marker}`);
}

const semanticMigration = fs.readFileSync('supabase/migrations/20260901203000_public_api_change_log_semantics_v2.sql', 'utf8');
for (const marker of [
  'public_payload_changed',
  "schema_json -> 'structured_data'",
  "schema_json -> 'public_api_rights'",
  'old.references_json is distinct from new.references_json',
  'old_public and new_public and public_payload_changed',
]) if (!semanticMigration.includes(marker)) fail(`semantic change-log migration missing ${marker}`);

const partnerMigration = fs.readFileSync('supabase/migrations/20260901035000_partner_api_core_v1.sql', 'utf8');
for (const marker of [
  'api_partners',
  'api_partner_keys',
  'api_partner_usage_windows',
  'api_partner_authorize',
  'admin_issue_api_partner_key',
  "digest(v_plain,'sha256')",
  'pg_advisory_xact_lock',
  'enable row level security',
  'rawafid-partner-api-prune-v1',
]) if (!partnerMigration.includes(marker)) fail(`partner migration missing ${marker}`);

const aclMigration = fs.readFileSync('supabase/migrations/20260901204500_partner_api_admin_acl_hardening_v2.sql', 'utf8');
for (const marker of [
  'admin_create_api_partner(text,text,text,text,text[],integer,integer) from anon, public',
  'admin_issue_api_partner_key(uuid,text,text[],timestamptz) from anon, public',
  'admin_revoke_api_partner_key(uuid) from anon, public',
  'admin_set_api_partner_status(uuid,text) from anon, public',
  'admin_api_partner_dashboard() from anon, public',
  'to authenticated, service_role',
]) if (!aclMigration.includes(marker)) fail(`partner admin ACL hardening missing ${marker}`);

const rss = fs.readFileSync('app/feed.xml/route.ts', 'utf8');
const jsonFeed = fs.readFileSync('app/feed.json/route.ts', 'utf8');
for (const [name, text] of [['RSS', rss], ['JSON Feed', jsonFeed]]) {
  for (const marker of ['X-Rawafid-Feed-Status', 'degraded', 'Retry-After', 'no-store']) {
    if (!text.includes(marker)) fail(`${name} degradation contract missing ${marker}`);
  }
}

const routeFiles = [
  'app/api/v1/content/route.ts',
  'app/api/v1/content/[slug]/route.ts',
  'app/api/v1/content/[slug]/sources/route.ts',
  'app/api/v1/[resource]/route.ts',
  'app/api/v1/search/route.ts',
  'app/api/v1/evidence-discovery/route.ts',
  'app/api/v1/changes/route.ts',
  'app/api/v1/stats/route.ts',
];
for (const file of routeFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('withOptionalPartnerAccess')) fail(`${file} does not participate in Partner API access control`);
}

const layout = fs.readFileSync('app/layout.tsx', 'utf8');
for (const marker of ['application/rss+xml', 'application/feed+json']) if (!layout.includes(marker)) fail(`layout discovery missing ${marker}`);

const docs = fs.readFileSync('app/developers/page.tsx', 'utf8');
for (const marker of ['/api/v1', '/api/openapi.json', '/feed.xml', '/feed.json', 'link_and_citation_only', 'v1.2.0', 'next_cursor', 'metadata', 'If-Modified-Since']) {
  if (!docs.includes(marker)) fail(`developer docs missing ${marker}`);
}

if (failed) process.exit(1);
console.log('PUBLIC API V1.2 + PARTNER API INSTITUTIONAL CONTRACT OK');
