import { SITE_URL } from '@/lib/seo';
import { jsonResponse } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const partnerSecurity = [{}, { PartnerApiKey: [] }, { PartnerBearer: [] }];
  const partnerResponses = {
    '401': { $ref: '#/components/responses/Unauthorized' },
    '403': { $ref: '#/components/responses/Forbidden' },
    '429': { $ref: '#/components/responses/RateLimited' },
  };
  const listParameters = [
    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 } },
    { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Opaque cursor returned by the previous response.' },
    { name: 'type', in: 'query', schema: { type: 'string' } },
    { name: 'published_after', in: 'query', schema: { type: 'string', format: 'date-time' } },
    { name: 'updated_after', in: 'query', schema: { type: 'string', format: 'date-time' } },
  ];
  const document = {
    openapi: '3.1.0',
    info: {
      title: 'Rawafid Public & Partner API',
      version: '1.2.0',
      summary: 'Versioned read-only API for public Rawafid knowledge resources, source provenance, feeds and scholarly discovery.',
      description: 'واجهة عامة للمواد المنشورة فقط، مع سجل مصادر مترابط واكتشاف أدلة عبر Europe PMC وCrossref وLens. مفاتيح الشركاء اختيارية وتضيف تعريفًا مؤسسيًا وحصص استخدام؛ ولا تمنح الواجهة تلقائيًا حق إعادة نشر النصوص أو المصادر الخارجية.',
      contact: { name: 'Rawafid', url: `${SITE_URL}/about` },
    },
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    servers: [{ url: `${SITE_URL}/api/v1`, description: 'Canonical production API' }],
    tags: [
      { name: 'Discovery' }, { name: 'Content' }, { name: 'Sources' }, { name: 'Search' }, { name: 'Evidence' },
      { name: 'Taxonomy' }, { name: 'Synchronization' }, { name: 'Operations' },
    ],
    paths: {
      '/': { get: { tags: ['Discovery'], operationId: 'discoverApi', responses: { '200': { description: 'API discovery document' } } } },
      '/content': { get: { tags: ['Content'], operationId: 'listContent', security: partnerSecurity, parameters: listParameters, responses: { '200': { description: 'Paginated public content' }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses } } },
      '/content/{slug}': { get: { tags: ['Content'], operationId: 'getContent', security: partnerSecurity, parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Public content detail' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses } } },
      '/content/{slug}/sources': { get: { tags: ['Content','Sources'], operationId: 'getContentSources', security: partnerSecurity, parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Normalized sources cited by a public content item' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses } } },
      '/sources': { get: { tags: ['Sources'], operationId: 'listSources', security: partnerSecurity, parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
        { name: 'publisher', in: 'query', schema: { type: 'string', maxLength: 160 } },
        { name: 'type', in: 'query', schema: { type: 'string', maxLength: 80 } },
        { name: 'q', in: 'query', schema: { type: 'string', maxLength: 160 } },
      ], responses: { '200': { description: 'Normalized public source registry' }, ...partnerResponses } } },
      '/sources/{id}': { get: { tags: ['Sources'], operationId: 'getSource', security: partnerSecurity, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }], responses: { '200': { description: 'Source metadata including related_identifiers, contributors/ORCID, ROR organizations, versions and citations', content: { 'application/json': { schema: { $ref: '#/components/schemas/SourceDetailResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses } } },
      '/search': { get: { tags: ['Search'], operationId: 'searchContent', security: partnerSecurity, parameters: [
        { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 160 } },
        { name: 'type', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
      ], responses: { '200': { description: 'Search results' }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses } } },
      '/evidence-discovery': { get: {
        tags: ['Evidence'], operationId: 'discoverEvidence', security: partnerSecurity,
        description: 'Search normalized scholarly metadata across Europe PMC, Crossref and, when configured, Lens Scholarly API. Provider failures are isolated.',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 500 } },
          { name: 'providers', in: 'query', schema: { type: 'string', default: 'europe_pmc,crossref,lens' }, description: 'Comma-separated values: europe_pmc,crossref,lens.' },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Anonymous maximum 50; partner maximum 100.' },
          { name: 'cursor', in: 'query', schema: { type: 'string' }, deprecated: true, description: 'Backward-compatible alias for europe_pmc_cursor.' },
          { name: 'europe_pmc_cursor', in: 'query', schema: { type: 'string' }, description: 'Europe PMC cursorMark.' },
          { name: 'crossref_cursor', in: 'query', schema: { type: 'string' }, description: 'Crossref cursor returned by provider status.' },
          { name: 'crossref_from_update_date', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Crossref incremental update-date lower bound.' },
          { name: 'crossref_from_index_date', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Crossref incremental index-date lower bound.' },
        ],
        responses: { '200': { description: 'Normalized evidence records with provider status, independent cursors and provenance' }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses },
      } },
      '/changes': { get: { tags: ['Synchronization'], operationId: 'listChanges', security: partnerSecurity, parameters: [
        { name: 'since', in: 'query', required: true, schema: { type: 'string', format: 'date-time' } },
        { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 1000, default: 100 } },
      ], responses: { '200': { description: 'Incremental public change stream' }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses } } },
      '/stats': { get: { tags: ['Operations'], operationId: 'getStats', security: partnerSecurity, responses: { '200': { description: 'Public content statistics' }, ...partnerResponses } } },
      '/{resource}': { get: { tags: ['Content','Taxonomy'], operationId: 'listNamedResource', security: partnerSecurity, parameters: [
        { name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: ['articles','guides','research','conditions','comparisons','tools','courses','learning-paths','resources','protocols','interventions','assessments','glossary','pages','sectors','categories','tags'] } },
        ...listParameters,
      ], responses: { '200': { description: 'Named collection' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses } } },
    },
    components: {
      securitySchemes: {
        PartnerApiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key', description: 'Rawafid institutional partner key. Displayed once and stored only as SHA-256.' },
        PartnerBearer: { type: 'http', scheme: 'bearer', bearerFormat: 'rawafid_live_*' },
      },
      schemas: {
        RelatedIdentifier: { type: 'object', properties: { identifier: { type: 'string' }, identifier_type: { type: 'string' }, relation_type: { type: 'string' }, relation_scheme: { type: 'string' }, related_metadata_scheme: { type: ['string','null'] }, scheme_uri: { type: ['string','null'] }, scheme_type: { type: ['string','null'] }, verified_at: { type: ['string','null'], format: 'date-time' } } },
        SourceContributor: { type: 'object', properties: { display_name: { type: 'string' }, contributor_type: { type: 'string' }, position: { type: ['integer','null'] }, orcid: { type: ['string','null'], format: 'uri' }, affiliations: { type: 'array', items: { type: 'object' } } } },
        SourceDetailResponse: { type: 'object', properties: { data: { type: 'object', properties: { related_identifiers: { type: 'array', items: { $ref: '#/components/schemas/RelatedIdentifier' } }, contributors: { type: 'array', items: { $ref: '#/components/schemas/SourceContributor' } }, organizations: { type: 'array', items: { type: 'object' } }, versions: { type: 'array', items: { type: 'object' } }, cited_by: { type: 'array', items: { type: 'object' } } } }, meta: { type: 'object' } } },
        Error: { type: 'object', properties: { error: { type: 'object', required: ['code','message','request_id'], properties: { code: { type: 'string' }, message: { type: 'string' }, parameter: { type: ['string','null'] }, request_id: { type: 'string' } } } } },
      },
      responses: {
        BadRequest: { description: 'Invalid request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        NotFound: { description: 'Resource not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Unauthorized: { description: 'Invalid, expired or revoked partner credential when supplied', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Forbidden: { description: 'Credential lacks required scope', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        RateLimited: { description: 'Partner quota exceeded', headers: { 'Retry-After': { schema: { type: 'integer' } } }, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    externalDocs: { description: 'Rawafid developer documentation', url: `${SITE_URL}/developers` },
  };
  return jsonResponse(request, document, { cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' });
}
