import fs from 'node:fs';

const required = [
  'lib/public-api-v1.ts',
  'lib/partner-api-v1.ts',
  'lib/openapi-v1-components.ts',
  'lib/openapi-v1-document.ts',
  'lib/feed-http.ts',
  'app/api/v1/route.ts',
  'app/api/v1/lens/route.ts',
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
  'app/en/developers/page.tsx',
  'app/developers/lens/page.tsx',
  'supabase/migrations/20260901032000_public_api_v1_change_log.sql',
  'supabase/migrations/20260901035000_partner_api_core_v1.sql',
  'supabase/migrations/20260901212203_source_connection_metadata_v1.sql',
  'supabase/migrations/20260912130135_public_api_search_content_ids_v1.sql',
];

let failed = false;
const fail = (message) => { console.error(`PUBLIC API V1 CONTRACT FAILED: ${message}`); failed = true; };
for (const file of required) if (!fs.existsSync(file)) fail(`missing ${file}`);

const core = fs.readFileSync('lib/public-api-v1.ts', 'utf8');
for (const marker of [
  "PUBLIC_API_VERSION = '1.2.0'",
  ".eq('status', 'published')",
  ".eq('robots_index', true)",
  "headers.set('ETag'",
  "'X-Request-Id'",
  "'Access-Control-Allow-Origin': '*'",
  "reuse: reuse || 'link_and_citation_only'",
  "pages: ['landing_page', 'directory_page', 'sector_page']",
  'encodeCursor',
  'decodeCursor',
  'latestTimestamp',
  "headers.set('Retry-After', '60')",
  "request.headers.get('if-modified-since')",
]) if (!core.includes(marker)) fail(`core missing ${marker}`);
for (const forbidden of ['SERVICE_ROLE', 'SUPABASE_SERVICE', 'service_role_key', 'NEXT_PUBLIC_SUPABASE_SERVICE']) if (core.includes(forbidden)) fail(`public API core must not use privileged database secret: ${forbidden}`);

const feedHttp = fs.readFileSync('lib/feed-http.ts', 'utf8');
for (const marker of ['feedResponse', 'feedUnavailable', "'Retry-After': '60'", "request.headers.get('if-modified-since')", "status: 503", "status: 304"]) if (!feedHttp.includes(marker)) fail(`feed HTTP helper missing ${marker}`);
for (const file of ['app/feed.xml/route.ts','app/feed.json/route.ts','app/magazine/feed.xml/route.ts']) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes('feedResponse')) fail(`${file} is not using shared feed validators`);
  if (!text.includes('feedUnavailable')) fail(`${file} is not fail-safe on catalog failure`);
}

const partner = fs.readFileSync('lib/partner-api-v1.ts', 'utf8');
for (const marker of ["createHash('sha256')", "'x-api-key'", "'authorization'", 'api_partner_authorize', "'rate_limited'", 'decoratePartnerResponse', "headers['Retry-After'] = '60'"]) if (!partner.includes(marker)) fail(`partner API helper missing ${marker}`);
if (/service.role|SERVICE_ROLE|service_role_key/i.test(partner)) fail('partner API runtime must not embed a service-role secret');

const apiRoot = fs.readFileSync('app/api/v1/route.ts', 'utf8');
for (const marker of ["'lens'", "href: '/api/v1/lens'", "documentation: '/developers/lens'", "default_providers: ['europe_pmc','crossref','datacite']", "lens_is_opt_in: true", "attribution: 'Data Sourced from The Lens'", 'lens_id_retention_required: true']) if (!apiRoot.includes(marker)) fail(`API discovery Lens section missing ${marker}`);
if (apiRoot.includes("default_providers: ['europe_pmc','crossref','datacite','lens']")) fail('API discovery must never advertise Lens as a default provider');

const searchRoute = fs.readFileSync('app/api/v1/search/route.ts', 'utf8');
for (const marker of ['api_search_public_content_ids', "search_mode: 'ranked_public_content'", ".eq('robots_index', true)", 'serializePublicContent', 'latestUpdatedAt']) if (!searchRoute.includes(marker)) fail(`public search route missing ${marker}`);
if (searchRoute.includes(".textSearch('search_vector'")) fail('public search route must not depend on PostgREST parsing of the tsvector expression');

const searchMigration = fs.readFileSync('supabase/migrations/20260912130135_public_api_search_content_ids_v1.sql', 'utf8');
for (const marker of ['api_search_public_content_ids', 'security invoker', "c.status = 'published'", 'c.robots_index = true', 'websearch_to_tsquery', 'grant execute']) if (!searchMigration.toLowerCase().includes(marker.toLowerCase())) fail(`public search migration missing ${marker}`);

const changeRoute = fs.readFileSync('app/api/v1/changes/route.ts', 'utf8');
for (const marker of ['ChangeCursor', 'encodeChangeCursor', 'decodeChangeCursor', 'next_cursor', 'cursor_recommended', 'occurred_at.eq.', 'id.gt.']) if (!changeRoute.includes(marker)) fail(`change stream missing ${marker}`);

const namedResourceRoute = fs.readFileSync('app/api/v1/[resource]/route.ts', 'utf8');
for (const marker of ['next_offset', 'has_more', "pagination_mode: 'offset'", '.range(offset, offset + limit)', 'latestUpdatedAt']) if (!namedResourceRoute.includes(marker)) fail(`named resource route missing ${marker}`);

const lensManifest = fs.readFileSync('app/api/v1/lens/route.ts', 'utf8');
for (const marker of [
  "mode: 'explicit_opt_in'",
  "required_provider_parameter: 'providers=lens'",
  "label: 'Data Sourced from The Lens'",
  'lens_id_preserved: true',
  'requests_per_minute: 10',
  'requests_per_month: 20000',
  "enforcement: 'distributed_fail_closed'",
  "credential: 'server_side_only'",
  'exposed_to_client: false',
  'lens_specific_user_tracking: false',
  'quota_accounting_contains_user_identifiers: false',
  'api_access_does_not_imply_full_text_reuse_rights: true',
  'lens_id_and_attribution_must_be_retained_when_lens_data_is_displayed_or_redistributed: true',
  "documentation: '/developers/lens'",
  "openapi: '/api/openapi.json'",
]) if (!lensManifest.includes(marker)) fail(`Lens manifest missing ${marker}`);
if (/token\s*:\s*process\.env\.LENS_SCHOLARLY_API_TOKEN|LENS_SCHOLARLY_API_TOKEN\?\.trim\(\)\s*[,}]/.test(lensManifest)) fail('Lens manifest must never serialize the Lens credential');

const openapiRoute = fs.readFileSync('app/api/openapi.json/route.ts', 'utf8');
if (!openapiRoute.includes('buildOpenApiDocument')) fail('OpenAPI route must use the modular document builder');
const openapi = [
  fs.readFileSync('lib/openapi-v1-document.ts', 'utf8'),
  fs.readFileSync('lib/openapi-v1-components.ts', 'utf8'),
].join('\n');
for (const marker of [
  "openapi: '3.1.0'", "version: '1.2.0'", "'/content/{slug}/sources'", "'/sources/{id}'", "'/evidence-discovery'", "'/changes'", "'/search'", "'/stats'", "'/{resource}'",
  'PartnerApiKey', 'PartnerBearer', 'related_identifiers', 'crossref_cursor', 'EvidenceProviderStatus', 'EvidenceDiscoveryResponse',
  'PublicContent:', 'ContentBody:', 'ContentListResponse:', 'TaxonomyListResponse:', 'SearchResponse:', 'ChangeStreamResponse:', "name: 'cursor'", 'cursor_recommended', 'X-Request-Id', 'X-RateLimit-Minute-Limit', 'X-RateLimit-Minute-Reset', 'NotModified:', 'oneOf:',
]) if (!openapi.includes(marker)) fail(`OpenAPI contract missing ${marker}`);
if (!openapi.includes("default: 'europe_pmc,crossref,datacite'")) fail('OpenAPI evidence provider default must exclude Lens');
if (openapi.includes("default: 'europe_pmc,crossref,datacite,lens'")) fail('OpenAPI must never advertise Lens as a default provider');
if (!openapi.includes('Lens is never included unless explicitly requested.')) fail('OpenAPI must describe Lens as explicit opt-in');
if (!openapi.includes("enum: ['ok','not_configured','error']")) fail('OpenAPI provider status enum is incomplete');

const migration = fs.readFileSync('supabase/migrations/20260901032000_public_api_v1_change_log.sql', 'utf8');
for (const marker of ['enable row level security', 'api_change_log_public_read', 'api_public_stats', 'public_api_content_change_log']) if (!migration.includes(marker)) fail(`migration missing ${marker}`);

const partnerMigration = fs.readFileSync('supabase/migrations/20260901035000_partner_api_core_v1.sql', 'utf8');
for (const marker of ['api_partners','api_partner_keys','api_partner_usage_windows','api_partner_authorize','admin_issue_api_partner_key',"digest(v_plain,'sha256')",'pg_advisory_xact_lock','enable row level security','rawafid-partner-api-prune-v1']) if (!partnerMigration.includes(marker)) fail(`partner migration missing ${marker}`);
if (/insert\s+into\s+public\.api_partner_keys[\s\S]*?v_plain[\s\S]*?key_hash/i.test(partnerMigration) && !partnerMigration.includes("digest(v_plain,'sha256')")) fail('partner key storage must remain hash-only');

const routeFiles = ['app/api/v1/content/route.ts','app/api/v1/content/[slug]/route.ts','app/api/v1/content/[slug]/sources/route.ts','app/api/v1/[resource]/route.ts','app/api/v1/search/route.ts','app/api/v1/changes/route.ts','app/api/v1/stats/route.ts'];
for (const file of routeFiles) if (!fs.readFileSync(file, 'utf8').includes('withOptionalPartnerAccess')) fail(`${file} does not participate in Partner API access control`);

const layout = fs.readFileSync('app/layout.tsx', 'utf8');
for (const marker of ['application/rss+xml', 'application/feed+json']) if (!layout.includes(marker)) fail(`layout discovery missing ${marker}`);

const docs = fs.readFileSync('app/developers/page.tsx', 'utf8');
for (const marker of ['/api/v1','/api/openapi.json','/feed.xml','/feed.json','link_and_citation_only','crossref','related_identifiers','next_cursor','X-Request-Id','120 طلبًا/دقيقة','25,000 طلب/يوم','/en/developers']) if (!docs.includes(marker)) fail(`developer docs missing ${marker}`);
const englishDocs = fs.readFileSync('app/en/developers/page.tsx', 'utf8');
for (const marker of ['/api/v1','/api/openapi.json','link_and_citation_only','next_cursor','X-Request-Id','120 requests/minute','25,000 requests/day','/developers']) if (!englishDocs.includes(marker)) fail(`English developer docs missing ${marker}`);
const lensDocs = fs.readFileSync('app/developers/lens/page.tsx', 'utf8');
for (const marker of ['/api/v1/lens','providers=lens','Data Sourced from The Lens','Lens ID','20,000','service_role','not_configured','provider_unavailable','private, no-store']) if (!lensDocs.includes(marker)) fail(`Lens developer docs missing ${marker}`);

if (failed) process.exit(1);
console.log('PUBLIC API V1.2 + PARTNER API + SEARCH + LOSSLESS SYNC + TAXONOMY + OPENAPI + LENS + FEEDS + GLOBAL DOCS CONTRACT OK');
