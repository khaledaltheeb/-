import fs from 'node:fs';

const requiredFiles = [
  'lib/crossref-work-metadata.ts',
  'app/api/v1/integrations/crossref/works/route.ts',
  'app/api/v1/route.ts',
  'app/api/openapi.json/route.ts',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Missing Crossref work metadata file: ${file}`);
}

const core = fs.readFileSync('lib/crossref-work-metadata.ts', 'utf8');
const route = fs.readFileSync('app/api/v1/integrations/crossref/works/route.ts', 'utf8');
const discovery = fs.readFileSync('app/api/v1/route.ts', 'utf8');
const openapi = fs.readFileSync('app/api/openapi.json/route.ts', 'utf8');

for (const marker of [
  "https://api.crossref.org/works",
  "contact@healthrenewal.org",
  "original_title",
  "local_title_ar: null",
  "member_id",
  "prefix",
  "licenses",
  "relations",
  "updates",
  "deposited",
  "indexed",
  "Public Data File",
  "protected_full_text_retrieval: false",
]) {
  if (!core.includes(marker)) throw new Error(`Crossref resolver missing required marker: ${marker}`);
}

for (const marker of [
  "withOptionalPartnerAccess(request, 'sources:read')",
  "invalid_parameter",
  "upstream_rate_limited",
  "upstream_unavailable",
  "s-maxage=86400",
  "stale-while-revalidate=604800",
  "decoratePartnerResponse",
]) {
  if (!route.includes(marker)) throw new Error(`Crossref route missing required marker: ${marker}`);
}

for (const marker of [
  "crossref_work_metadata",
  "/api/v1/integrations/crossref/works?doi={doi}",
  "metadata_only: true",
  "optional_partner_scope: 'sources:read'",
]) {
  if (!discovery.includes(marker)) throw new Error(`Crossref API discovery missing required marker: ${marker}`);
}

for (const marker of [
  "'/integrations/crossref/works'",
  "operationId: 'resolveCrossrefWork'",
  "name: 'doi'",
  "required: true",
  "This endpoint does not retrieve publisher full text",
  "'503':",
]) {
  if (!openapi.includes(marker)) throw new Error(`Crossref OpenAPI coverage missing required marker: ${marker}`);
}

if (!openapi.includes("contributors: { type: 'array', items: { $ref: '#/components/schemas/SourceContributor' } }")) {
  throw new Error('Crossref OpenAPI update must preserve the existing SourceContributor schema reference.');
}

if (/api\.crossref\.org\/v1/.test(core)) {
  throw new Error('Legacy /v1 Crossref base must not be reintroduced.');
}

if (/abstract\s*:/.test(core)) {
  throw new Error('Direct DOI metadata resolver must not expose publisher abstracts by default.');
}

console.log('Crossref governed DOI metadata contract passed with API discovery and OpenAPI coverage.');
