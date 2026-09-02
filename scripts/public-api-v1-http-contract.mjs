const base = (process.env.PUBLIC_API_TEST_BASE_URL || process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const expectedOrigin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://healthrenewal.org').replace(/\/$/, '');

function fail(message) { throw new Error(`PUBLIC API HTTP CONTRACT FAILED: ${message}`); }
function absolute(path) { return `${base}${path}`; }

async function fetchWithTimeout(path, init = {}, timeoutMs = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(absolute(path), { ...init, signal: controller.signal, redirect: 'error' });
  } finally {
    clearTimeout(timer);
  }
}

async function json(path, options = {}) {
  const response = await fetchWithTimeout(path, options.init || {}, options.timeoutMs || 45000);
  let body = null;
  const text = options.method === 'HEAD' ? '' : await response.text();
  if (text) {
    try { body = JSON.parse(text); } catch { fail(`${path} returned non-JSON body: ${text.slice(0, 120)}`); }
  }
  return { response, body };
}

function expectStatus(result, expected, label) {
  if (result.response.status !== expected) fail(`${label}: expected HTTP ${expected}, got ${result.response.status}`);
}

function assertNoPrivateSchemaKeys(value, path = 'schema_json') {
  const forbiddenExact = new Set([
    'automation_run_id','automation_batch_id','automation_review_lock','automation_review_lock_at',
    'manual_batch_id','manual_review_lock','manual_review_lock_at','agent_run_key','hourly_release_batch',
    'migration_phase','migration_program','migration_source_repo','migration_stage','migration_verified_at',
    'live_verification_request_id','post_publish_http_request_id','classification_rationale','originality_report',
    'source_versions_reviewed','rewrite_method','taxonomy_reviewed','human_review_completed','team_review_completed',
  ]);
  const forbiddenPrefixes = ['automation_', 'migration_', 'manual_review_', 'agent_', 'post_publish_', 'internal_'];
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoPrivateSchemaKeys(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (forbiddenExact.has(key) || forbiddenPrefixes.some((prefix) => key.startsWith(prefix))) fail(`${path}.${key} exposes internal metadata`);
    assertNoPrivateSchemaKeys(nested, `${path}.${key}`);
  }
}

function tupleGreater(a, b) {
  const at = Date.parse(a.occurred_at);
  const bt = Date.parse(b.occurred_at);
  if (bt > at) return true;
  if (bt < at) return false;
  return BigInt(String(b.id)) > BigInt(String(a.id));
}

const discovery = await json('/api/v1');
expectStatus(discovery, 200, 'discovery');
if (discovery.body?.version !== '1.2.0' || discovery.body?.status !== 'stable') fail('discovery version/status mismatch');
if (discovery.body?.canonical_origin !== expectedOrigin) fail('canonical API origin mismatch');
if (discovery.body?.evidence_discovery?.default_provider !== 'europe_pmc') fail('Europe PMC is not the discovery default provider');

const openapi = await json('/api/openapi.json');
expectStatus(openapi, 200, 'OpenAPI');
if (openapi.body?.openapi !== '3.1.0' || openapi.body?.info?.version !== '1.2.0') fail('OpenAPI version mismatch');
if (!openapi.body?.paths?.['/evidence-discovery'] || !openapi.body?.paths?.['/changes']) fail('OpenAPI evidence/change paths missing');
const evidenceProviderParam = openapi.body.paths['/evidence-discovery'].get.parameters.find((item) => item.name === 'providers');
if (evidenceProviderParam?.schema?.default !== 'europe_pmc') fail('OpenAPI evidence provider default mismatch');
const changesParams = openapi.body.paths['/changes'].get.parameters.map((item) => item.name);
if (!changesParams.includes('cursor')) fail('OpenAPI change cursor missing');
if (!openapi.body?.components?.securitySchemes?.PartnerApiKey || !openapi.body?.components?.securitySchemes?.PartnerBearer) fail('OpenAPI partner auth schemes missing');

const content = await json('/api/v1/content?limit=10');
expectStatus(content, 200, 'content list');
if (!Array.isArray(content.body?.data) || content.body.data.length === 0) fail('content list is empty or invalid');
for (const row of content.body.data) {
  if (!row?.canonical_url?.startsWith(expectedOrigin)) fail('content canonical URL is not absolute/canonical');
  if (row?.schema_json === undefined) fail('sanitized schema_json projection missing');
  assertNoPrivateSchemaKeys(row.schema_json);
  if (!row?.rights?.reuse) fail('rights contract missing');
}
if (!content.response.headers.get('etag')) fail('content ETag missing');
if (!content.response.headers.get('x-request-id')) fail('content X-Request-Id missing');
if (!content.response.headers.get('last-modified')) fail('content Last-Modified missing');
if (content.response.headers.get('access-control-allow-origin') !== '*') fail('content CORS origin missing');

const invalidContentLimit = await json('/api/v1/content?limit=101');
expectStatus(invalidContentLimit, 400, 'content invalid limit');
if (invalidContentLimit.body?.error?.parameter !== 'limit') fail('content invalid limit parameter not identified');

const invalidContentCursor = await json('/api/v1/content?cursor=not-a-real-cursor');
expectStatus(invalidContentCursor, 400, 'content invalid cursor');
if (invalidContentCursor.body?.error?.code !== 'invalid_cursor') fail('content invalid cursor contract mismatch');

const sectors = await json('/api/v1/sectors?limit=20');
expectStatus(sectors, 200, 'sectors');
if (!Array.isArray(sectors.body?.data)) fail('sectors payload invalid');
for (const row of sectors.body.data) if (Object.prototype.hasOwnProperty.call(row, 'metadata')) fail('sectors leaks internal metadata');
const categories = await json('/api/v1/categories?limit=20');
expectStatus(categories, 200, 'categories');
for (const row of categories.body?.data || []) if (Object.prototype.hasOwnProperty.call(row, 'metadata')) fail('categories leaks internal metadata');
const invalidTaxonomyLimit = await json('/api/v1/categories?limit=501');
expectStatus(invalidTaxonomyLimit, 400, 'taxonomy invalid limit');

const searchMissing = await json('/api/v1/search');
expectStatus(searchMissing, 400, 'search missing query');
const searchInvalidLimit = await json('/api/v1/search?q=autism&limit=51');
expectStatus(searchInvalidLimit, 400, 'search invalid anonymous limit');
const searchInvalidType = await json('/api/v1/search?q=autism&type=%2Finvalid');
expectStatus(searchInvalidType, 400, 'search invalid type');

const sources = await json('/api/v1/sources?limit=3');
expectStatus(sources, 200, 'sources');
if (!Array.isArray(sources.body?.data)) fail('sources payload invalid');
const invalidSourceOffset = await json('/api/v1/sources?offset=-1');
expectStatus(invalidSourceOffset, 400, 'source invalid offset');
const invalidSourceLimit = await json('/api/v1/sources?limit=101');
expectStatus(invalidSourceLimit, 400, 'source invalid limit');

const stats = await json('/api/v1/stats');
expectStatus(stats, 200, 'stats');
if (typeof stats.body?.data?.total !== 'number') fail('stats total missing');

const changes1 = await json('/api/v1/changes?since=2026-08-19T14%3A35%3A01.411Z&limit=1');
expectStatus(changes1, 200, 'changes first page');
if (!Array.isArray(changes1.body?.data) || changes1.body.data.length !== 1) fail('changes first page invalid');
if (!changes1.body?.pagination?.next_cursor) fail('changes next_cursor missing on known dense batch');
if (!String(changes1.body?.pagination?.next_since_note || '').includes('Compatibility only')) fail('changes next_since compatibility warning missing');
const cursor = encodeURIComponent(changes1.body.pagination.next_cursor);
const changes2 = await json(`/api/v1/changes?cursor=${cursor}&limit=1`);
expectStatus(changes2, 200, 'changes second page');
if (!Array.isArray(changes2.body?.data) || changes2.body.data.length !== 1) fail('changes second page invalid');
if (String(changes1.body.data[0].id) === String(changes2.body.data[0].id)) fail('change cursor repeated the same event');
if (!tupleGreater(changes1.body.data[0], changes2.body.data[0])) fail('change cursor ordering is not strictly increasing by (occurred_at,id)');
const invalidChangeCursor = await json('/api/v1/changes?cursor=broken');
expectStatus(invalidChangeCursor, 400, 'changes invalid cursor');
const invalidChangeLimit = await json('/api/v1/changes?since=2026-01-01T00%3A00%3A00Z&limit=501');
expectStatus(invalidChangeLimit, 400, 'changes invalid anonymous limit');

const invalidEvidenceProvider = await json('/api/v1/evidence-discovery?q=autism&providers=unknown');
expectStatus(invalidEvidenceProvider, 400, 'evidence invalid provider');
const invalidEvidenceLimit = await json('/api/v1/evidence-discovery?q=autism&limit=51');
expectStatus(invalidEvidenceLimit, 400, 'evidence invalid anonymous limit');
const evidence = await json('/api/v1/evidence-discovery?q=autism&limit=1', { timeoutMs: 60000 });
expectStatus(evidence, 200, 'default evidence discovery');
if (JSON.stringify(evidence.body?.meta?.requested_providers) !== JSON.stringify(['europe_pmc'])) fail('default evidence discovery unexpectedly requested Lens');
if (!Array.isArray(evidence.body?.providers) || evidence.body.providers.length !== 1 || evidence.body.providers[0]?.provider !== 'europe_pmc') fail('default evidence provider status invalid');
if (!['ok','error'].includes(evidence.body.providers[0]?.status)) fail('Europe PMC provider status is invalid');

const invalidKey = await json('/api/v1/content?limit=1', { init: { headers: { 'X-API-Key': 'definitely-invalid' } } });
expectStatus(invalidKey, 401, 'invalid partner key');
if (invalidKey.body?.error?.code !== 'invalid_api_key') fail('invalid partner key error code mismatch');
if (!invalidKey.response.headers.get('www-authenticate')) fail('invalid bearer-compatible credential response missing WWW-Authenticate');

const safeRequestId = 'rawafid-contract-123';
const safeIdResponse = await json('/api/v1/content?limit=1', { init: { headers: { 'X-Request-Id': safeRequestId } } });
expectStatus(safeIdResponse, 200, 'safe request id');
if (safeIdResponse.response.headers.get('x-request-id') !== safeRequestId) fail('safe request id was not preserved');
const unsafeRequestId = 'A'.repeat(100);
const unsafeIdResponse = await json('/api/v1/content?limit=1', { init: { headers: { 'X-Request-Id': unsafeRequestId } } });
expectStatus(unsafeIdResponse, 200, 'unsafe request id');
const replacementId = unsafeIdResponse.response.headers.get('x-request-id') || '';
if (!replacementId || replacementId === unsafeRequestId || replacementId.length > 64) fail('unsafe request id was not replaced safely');

const options = await fetchWithTimeout('/api/v1/content', { method: 'OPTIONS' });
if (options.status !== 204) fail(`OPTIONS expected 204, got ${options.status}`);
const allowedMethods = options.headers.get('access-control-allow-methods') || '';
const allowedHeaders = options.headers.get('access-control-allow-headers') || '';
if (!allowedMethods.includes('GET') || !allowedMethods.includes('HEAD') || !allowedMethods.includes('OPTIONS')) fail('OPTIONS methods incomplete');
if (!allowedHeaders.toLowerCase().includes('x-request-id') || !allowedHeaders.toLowerCase().includes('if-modified-since')) fail('OPTIONS allowed headers incomplete');

const head = await fetchWithTimeout('/api/v1/content?limit=1', { method: 'HEAD' });
if (head.status !== 200) fail(`HEAD expected 200, got ${head.status}`);
if (!head.headers.get('etag') || !head.headers.get('x-request-id')) fail('HEAD validators missing');

const etag = content.response.headers.get('etag');
const conditionalEtag = await fetchWithTimeout('/api/v1/content?limit=10', { headers: { 'If-None-Match': etag } });
if (conditionalEtag.status !== 304) fail(`If-None-Match expected 304, got ${conditionalEtag.status}`);
const lastModified = content.response.headers.get('last-modified');
const conditionalModified = await fetchWithTimeout('/api/v1/content?limit=10', { headers: { 'If-Modified-Since': lastModified } });
if (conditionalModified.status !== 304) fail(`If-Modified-Since expected 304, got ${conditionalModified.status}`);

console.log('PUBLIC API V1.2 HTTP CONTRACT OK');
