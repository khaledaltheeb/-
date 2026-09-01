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
  'app/api/v1/changes/route.ts',
  'app/api/v1/stats/route.ts',
  'app/api/openapi.json/route.ts',
  'app/feed.xml/route.ts',
  'app/feed.json/route.ts',
  'app/magazine/feed.xml/route.ts',
  'app/developers/page.tsx',
  'supabase/migrations/20260901032000_public_api_v1_change_log.sql',
  'supabase/migrations/20260901035000_partner_api_core_v1.sql',
];

let failed = false;
const fail = (message) => { console.error(`PUBLIC API V1 CONTRACT FAILED: ${message}`); failed = true; };
for (const file of required) if (!fs.existsSync(file)) fail(`missing ${file}`);

const core = fs.readFileSync('lib/public-api-v1.ts', 'utf8');
for (const marker of [
  "PUBLIC_API_VERSION = '1.1.0'",
  ".eq('status', 'published')",
  ".eq('robots_index', true)",
  "'ETag'",
  "'X-Request-Id'",
  "'Access-Control-Allow-Origin': '*'",
  "reuse: reuse || 'link_and_citation_only'",
  "pages: ['landing_page', 'directory_page', 'sector_page']",
  'encodeCursor',
  'decodeCursor',
]) if (!core.includes(marker)) fail(`core missing ${marker}`);

for (const forbidden of ['SERVICE_ROLE', 'SUPABASE_SERVICE', 'service_role_key', 'NEXT_PUBLIC_SUPABASE_SERVICE']) {
  if (core.includes(forbidden)) fail(`public API core must not use privileged database secret: ${forbidden}`);
}

const partner = fs.readFileSync('lib/partner-api-v1.ts', 'utf8');
for (const marker of [
  "createHash('sha256')",
  "'x-api-key'",
  "'authorization'",
  "api_partner_authorize",
  "'rate_limited'",
  'decoratePartnerResponse',
]) if (!partner.includes(marker)) fail(`partner API helper missing ${marker}`);
if (/service.role|SERVICE_ROLE|service_role_key/i.test(partner)) fail('partner API runtime must not embed a service-role secret');

const openapi = fs.readFileSync('app/api/openapi.json/route.ts', 'utf8');
for (const marker of ["openapi: '3.1.0'", "version: '1.1.0'", "'/content/{slug}/sources'", "'/changes'", "'/search'", "'/stats'", 'PartnerApiKey', 'PartnerBearer', "'pages'"]) {
  if (!openapi.includes(marker)) fail(`OpenAPI contract missing ${marker}`);
}

const migration = fs.readFileSync('supabase/migrations/20260901032000_public_api_v1_change_log.sql', 'utf8');
for (const marker of ['enable row level security', 'api_change_log_public_read', 'api_public_stats', 'public_api_content_change_log']) {
  if (!migration.includes(marker)) fail(`migration missing ${marker}`);
}

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
if (/insert\s+into\s+public\.api_partner_keys[\s\S]*?v_plain[\s\S]*?key_hash/i.test(partnerMigration) && !partnerMigration.includes("digest(v_plain,'sha256')")) {
  fail('partner key storage must remain hash-only');
}

const routeFiles = [
  'app/api/v1/content/route.ts',
  'app/api/v1/content/[slug]/route.ts',
  'app/api/v1/content/[slug]/sources/route.ts',
  'app/api/v1/[resource]/route.ts',
  'app/api/v1/search/route.ts',
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
for (const marker of ['/api/v1', '/api/openapi.json', '/feed.xml', '/feed.json', 'link_and_citation_only']) {
  if (!docs.includes(marker)) fail(`developer docs missing ${marker}`);
}

if (failed) process.exit(1);
console.log('PUBLIC API V1.1 + PARTNER API CONTRACT OK');
