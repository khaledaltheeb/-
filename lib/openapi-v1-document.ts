import { SITE_URL } from '@/lib/seo';
import {
  conditionalResponses,
  contentListParameters,
  openApiComponents,
  partnerResponses,
  partnerSecurity,
  successHeaders,
} from '@/lib/openapi-v1-components';

export function buildOpenApiDocument() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Rawafid Public & Partner API',
      version: '1.2.0',
      summary: 'Versioned read-only API for public Rawafid knowledge resources, source provenance, feeds and scholarly discovery.',
      description: 'Read-only access to published, indexable Rawafid knowledge, source provenance, ranked search, incremental synchronization and scholarly discovery. Technical availability never overrides content or provider rights.',
      contact: { name: 'Rawafid / Health Renewal', url: `${SITE_URL}/about`, email: 'contact@healthrenewal.org' },
      license: { name: 'Endpoint-specific rights apply', url: `${SITE_URL}/terms` },
    },
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    servers: [{ url: `${SITE_URL}/api/v1`, description: 'Canonical production API' }],
    externalDocs: { description: 'Rawafid developer documentation', url: `${SITE_URL}/developers` },
    tags: [
      { name: 'Discovery', description: 'Machine-readable API discovery.' },
      { name: 'Content', description: 'Published and indexable Rawafid content.' },
      { name: 'Sources', description: 'Source registry, connection metadata, rights and provenance.' },
      { name: 'Search', description: 'Ranked search over public Rawafid content.' },
      { name: 'Evidence', description: 'Federated scholarly metadata discovery.' },
      { name: 'Lens', description: 'Dedicated Lens Scholarly API integration manifest and usage contract.' },
      { name: 'Taxonomy', description: 'Named content and taxonomy collections.' },
      { name: 'Synchronization', description: 'Incremental public change stream.' },
      { name: 'Operations', description: 'Public API operational statistics.' },
    ],
    paths: {
      '/': { get: { tags: ['Discovery'], operationId: 'discoverApi', summary: 'Discover the Rawafid API', responses: { '200': { description: 'API discovery document', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiDiscoveryResponse' } } } }, ...conditionalResponses } } },
      '/content': { get: { tags: ['Content'], operationId: 'listContent', summary: 'List public content', security: partnerSecurity, parameters: contentListParameters, responses: { '200': { description: 'Cursor-paginated public content', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentListResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, ...conditionalResponses, ...partnerResponses } } },
      '/content/{slug}': { get: { tags: ['Content'], operationId: 'getContent', summary: 'Get one public content item', security: partnerSecurity, parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string', pattern: '^[A-Za-z0-9][A-Za-z0-9-]{0,199}$' } }], responses: { '200': { description: 'Public content detail including body, references and rights profile', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentDetailResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' }, ...conditionalResponses, ...partnerResponses } } },
      '/content/{slug}/sources': { get: { tags: ['Content','Sources'], operationId: 'getContentSources', summary: 'List normalized sources cited by a content item', security: partnerSecurity, parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Normalized sources cited by a public content item', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/GenericDataResponse' } } } }, '404': { $ref: '#/components/responses/NotFound' }, ...conditionalResponses, ...partnerResponses } } },
      '/sources': { get: { tags: ['Sources'], operationId: 'listSources', summary: 'Browse the public source registry', security: partnerSecurity, parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, maximum: 100000, default: 0 }, description: 'Offset pagination is used by the source registry.' },
        { name: 'publisher', in: 'query', schema: { type: 'string', maxLength: 160 } },
        { name: 'type', in: 'query', schema: { type: 'string', maxLength: 80 } },
        { name: 'q', in: 'query', schema: { type: 'string', maxLength: 160 } },
      ], responses: { '200': { description: 'Normalized public source registry', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/SourceRegistryResponse' } } } }, ...conditionalResponses, ...partnerResponses } } },
      '/sources/{id}': { get: { tags: ['Sources'], operationId: 'getSource', summary: 'Get one source with connection and rights metadata', security: partnerSecurity, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Source metadata including identifiers, ORCID/ROR connections, structured rights, translation provenance, versions and citations', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/SourceDetailResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' }, ...conditionalResponses, ...partnerResponses } } },
      '/search': { get: { tags: ['Search'], operationId: 'searchContent', summary: 'Search public Rawafid content', security: partnerSecurity, description: 'Ranked public-content search.', parameters: [
        { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 160 } },
        { name: 'type', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Anonymous maximum 50; partner maximum 100.' },
      ], responses: { '200': { description: 'Ranked search results', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, ...conditionalResponses, ...partnerResponses } } },
      '/evidence-discovery': { get: { tags: ['Evidence'], operationId: 'discoverEvidence', summary: 'Discover normalized scholarly metadata', security: partnerSecurity, description: 'Search Europe PMC, Crossref and DataCite by default. Lens is explicit opt-in only. Provider failures are isolated and reported independently.', parameters: [
        { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 500 } },
        { name: 'providers', in: 'query', schema: { type: 'string', default: 'europe_pmc,crossref,datacite' }, description: 'Comma-separated values: europe_pmc,crossref,datacite,lens. Lens is never included unless explicitly requested.' },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Anonymous maximum 50; partner maximum 100.' },
        { name: 'cursor', in: 'query', schema: { type: 'string' }, deprecated: true, description: 'Backward-compatible alias for europe_pmc_cursor.' },
        { name: 'europe_pmc_cursor', in: 'query', schema: { type: 'string' }, description: 'Europe PMC cursorMark.' },
        { name: 'crossref_cursor', in: 'query', schema: { type: 'string' }, description: 'Crossref cursor returned by provider status.' },
        { name: 'datacite_cursor', in: 'query', schema: { type: 'string' }, description: 'Opaque DataCite cursor token; use 1 only for the initial cursor request.' },
        { name: 'crossref_from_update_date', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'crossref_from_index_date', in: 'query', schema: { type: 'string', format: 'date-time' } },
      ], responses: { '200': { description: 'Normalized evidence records with typed provider status, independent cursors and provenance', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/EvidenceDiscoveryResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, ...conditionalResponses, ...partnerResponses } } },
      '/lens': { get: { tags: ['Lens'], operationId: 'getLensIntegrationManifest', summary: 'Lens Scholarly API integration manifest', description: 'Machine-readable Rawafid Lens integration status and contract. It never exposes the upstream credential and does not itself consume upstream quota.', responses: { '200': { description: 'Lens integration manifest', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/LensIntegrationManifest' } } } }, ...conditionalResponses } } },
      '/changes': { get: { tags: ['Synchronization'], operationId: 'listChanges', summary: 'Read the incremental public change stream', security: partnerSecurity, description: 'Use since for the first page and next_cursor for subsequent pages. The cursor combines event timestamp and ID to prevent same-timestamp loss.', parameters: [
        { name: 'since', in: 'query', required: true, schema: { type: 'string', format: 'date-time' }, description: 'Initial checkpoint. Keep the same value while paging with cursor.' },
        { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Opaque lossless composite cursor returned as pagination.next_cursor.' },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 1000, default: 100 }, description: 'Anonymous maximum 500; partner maximum 1000.' },
      ], responses: { '200': { description: 'Incremental public change stream', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangeStreamResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, ...conditionalResponses, ...partnerResponses } } },
      '/stats': { get: { tags: ['Operations'], operationId: 'getStats', summary: 'Get public API statistics', security: partnerSecurity, responses: { '200': { description: 'Public content statistics', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/StatsResponse' } } } }, ...conditionalResponses, ...partnerResponses } } },
      '/{resource}': { get: { tags: ['Content','Taxonomy'], operationId: 'listNamedResource', summary: 'List a named public collection', security: partnerSecurity, description: 'Content collections use cursor pagination. Taxonomy collections (sectors, categories, tags) use offset pagination.', parameters: [
        { name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: ['articles','guides','research','conditions','comparisons','tools','courses','learning-paths','resources','protocols','interventions','assessments','glossary','pages','sectors','categories','tags'] } },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 500, default: 25 }, description: 'Content collections are capped at 100; taxonomy collections accept up to 500.' },
        { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Content collections only.' },
        { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, maximum: 100000, default: 0 }, description: 'Taxonomy collections only.' },
        { name: 'published_after', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Content collections only.' },
        { name: 'updated_after', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Content collections only.' },
      ], responses: { '200': { description: 'Named content or taxonomy collection', headers: successHeaders, content: { 'application/json': { schema: { oneOf: [{ $ref: '#/components/schemas/ContentListResponse' }, { $ref: '#/components/schemas/TaxonomyListResponse' }] } } } }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' }, ...conditionalResponses, ...partnerResponses } } },
    },
    components: openApiComponents,
  };
}
