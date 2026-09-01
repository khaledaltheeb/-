const base = (process.env.INSTITUTIONAL_EXCHANGE_TEST_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
let failed = false;
const fail = (message) => { console.error(`INSTITUTIONAL EXCHANGE HTTP CONTRACT FAILED: ${message}`); failed = true; };

async function request(path, init = {}) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual', ...init });
  const text = await response.text();
  let json = null;
  if (text) {
    try { json = JSON.parse(text); } catch { /* checked by caller */ }
  }
  return { response, text, json };
}

const discovery = await request('/api/v1/integrations');
if (discovery.response.status !== 200) fail(`discovery expected 200, got ${discovery.response.status}`);
if (discovery.json?.model !== 'governed_staging') fail('discovery must declare governed_staging model');
const declared = Array.isArray(discovery.json?.resources) ? discovery.json.resources.map((item) => item?.resource) : [];
for (const resource of ['person','specialist','organization','course','page','learning_path','event','schedule']) {
  if (!declared.includes(resource)) fail(`discovery missing ${resource}`);
}
if (!Array.isArray(discovery.json?.guarantees) || !discovery.json.guarantees.some((line) => String(line).includes('never publish directly'))) {
  fail('discovery must state the no-direct-publication guarantee');
}
if (discovery.response.headers.get('x-robots-tag') !== 'noindex, nofollow') fail('discovery must remain noindex');

const preflight = await request('/api/v1/integrations/course', { method: 'OPTIONS' });
if (preflight.response.status !== 204) fail(`preflight expected 204, got ${preflight.response.status}`);
if (!String(preflight.response.headers.get('access-control-allow-methods')).includes('POST')) fail('preflight must allow POST');
if (!String(preflight.response.headers.get('access-control-allow-headers')).toLowerCase().includes('idempotency-key')) fail('preflight must allow Idempotency-Key');

const unknown = await request('/api/v1/integrations/not-a-resource', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
});
if (unknown.response.status !== 404) fail(`unknown resource expected 404, got ${unknown.response.status}`);

const unauthenticated = await request('/api/v1/integrations/course', {
  method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': 'contract-0001' },
  body: JSON.stringify({ external_id: 'contract-course', data: { name: 'contract only' } }),
});
if (unauthenticated.response.status !== 401) fail(`missing partner key expected 401, got ${unauthenticated.response.status}`);
if (unauthenticated.response.headers.get('cache-control') !== 'private, no-store') fail('auth failure must be private, no-store');

const syntacticallyValidFakeKey = `rawafid_live_${'a'.repeat(64)}`;
const missingIdempotency = await request('/api/v1/integrations/course', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': syntacticallyValidFakeKey },
  body: JSON.stringify({ external_id: 'contract-course', data: { name: 'contract only' } }),
});
if (missingIdempotency.response.status !== 400) fail(`missing Idempotency-Key expected 400, got ${missingIdempotency.response.status}`);
if (missingIdempotency.json?.error?.parameter !== 'Idempotency-Key') fail('missing Idempotency-Key must identify the parameter');

const statusWithoutKey = await request('/api/v1/integrations/course?external_id=contract-course');
if (statusWithoutKey.response.status !== 401) fail(`status lookup without key expected 401, got ${statusWithoutKey.response.status}`);

if (failed) process.exit(1);
console.log('RAWAFID INSTITUTIONAL EXCHANGE HTTP BOUNDARY CONTRACT OK');
