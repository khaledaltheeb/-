import { SITE_URL } from '@/lib/seo';
import { jsonResponse } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const contentSummary = {
    type: 'object',
    required: ['id','type','slug','title','canonical_url'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      type: { type: 'string' },
      slug: { type: 'string' },
      title: { type: 'string' },
      excerpt: { type: ['string','null'] },
      canonical_url: { type: 'string', format: 'uri' },
      language: { type: 'string', const: 'ar' },
      audience: { type: 'array', items: { type: 'string' } },
      published_at: { type: ['string','null'], format: 'date-time' },
      updated_at: { type: ['string','null'], format: 'date-time' },
      references: { type: 'array', items: { $ref: '#/components/schemas/Reference' } },
      rights: { $ref: '#/components/schemas/Rights' },
    },
  };
  const listParameters = [
    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 } },
    { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Opaque cursor returned by the previous response.' },
    { name: 'type', in: 'query', schema: { type: 'string' } },
    { name: 'published_after', in: 'query', schema: { type: 'string', format: 'date-time' } },
    { name: 'updated_after', in: 'query', schema: { type: 'string', format: 'date-time' } },
  ];
  const partnerSecurity = [{}, { PartnerApiKey: [] }, { PartnerBearer: [] }];
  const partnerResponses = {
    '401': { $ref: '#/components/responses/Unauthorized' },
    '403': { $ref: '#/components/responses/Forbidden' },
    '429': { $ref: '#/components/responses/RateLimited' },
  };
  const document = {
    openapi: '3.1.0',
    info: {
      title: 'Rawafid Public & Partner API',
      version: '1.1.0',
      summary: 'Versioned, read-only API for public Rawafid knowledge resources and accountable institutional integrations.',
      description: 'واجهة عامة للمواد المنشورة فقط، مع بيانات المصدر والمراجعة والحقوق. يمكن للشركاء المؤسسيين استخدام مفتاح API اختياري للحصول على تعريف واضح للتكامل، حصص استخدام قابلة للقياس، وسجل استخدام. لا تمنح الواجهة تلقائيًا حق إعادة نشر النصوص أو المصادر الخارجية.',
      contact: { name: 'Rawafid', url: `${SITE_URL}/about` },
    },
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    servers: [{ url: `${SITE_URL}/api/v1`, description: 'Canonical production API' }],
    tags: [
      { name: 'Discovery' }, { name: 'Content' }, { name: 'Sources' }, { name: 'Search' }, { name: 'Taxonomy' }, { name: 'Synchronization' }, { name: 'Operations' }, { name: 'External Metadata' },
    ],
    paths: {
      '/': {
        get: { tags: ['Discovery'], operationId: 'discoverApi', responses: { '200': { description: 'API discovery document' } } },
      },
      '/content': {
        get: {
          tags: ['Content'], operationId: 'listContent', security: partnerSecurity, parameters: listParameters,
          responses: { '200': { description: 'Paginated public content', content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentListResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses },
        },
      },
      '/content/{slug}': {
        get: {
          tags: ['Content'], operationId: 'getContent', security: partnerSecurity, parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Public content detail' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses },
        },
      },
      '/content/{slug}/sources': {
        get: {
          tags: ['Content','Sources'], operationId: 'getContentSources', security: partnerSecurity, parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Normalized source registry relationships for a public content item' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses },
        },
      },
      '/sources': {
        get: {
          tags: ['Sources'], operationId: 'listSources', security: partnerSecurity,
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
            { name: 'publisher', in: 'query', schema: { type: 'string', maxLength: 160 } },
            { name: 'type', in: 'query', schema: { type: 'string', maxLength: 80 } },
            { name: 'q', in: 'query', schema: { type: 'string', maxLength: 160 } },
          ],
          responses: { '200': { description: 'Normalized sources cited by published, indexable Rawafid content' }, ...partnerResponses },
        },
      },
      '/sources/{id}': {
        get: {
          tags: ['Sources'], operationId: 'getSource', security: partnerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Source metadata, observed versions, and published content relationships' }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses },
        },
      },
      '/integrations/crossref/works': {
        get: {
          tags: ['External Metadata','Sources'],
          operationId: 'resolveCrossrefWork',
          security: partnerSecurity,
          summary: 'Resolve governed Crossref bibliographic metadata for one DOI',
          description: 'Uses the Crossref polite pool with identified mailto and User-Agent, 24-hour caching, original-title preservation, explicit member ownership, relations/updates, and no publisher full text or abstract redistribution.',
          parameters: [{ name: 'doi', in: 'query', required: true, schema: { type: 'string', minLength: 7, maxLength: 300 }, examples: { doi: { value: '10.1038/s41586-020-2649-2' }, url: { value: 'https://doi.org/10.1038/s41586-020-2649-2' } } }],
          responses: {
            '200': { description: 'Normalized Crossref metadata with provenance and operational policy' },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
            '429': { $ref: '#/components/responses/RateLimited' },
            '503': { description: 'Crossref metadata is temporarily unavailable' },
            ...partnerResponses,
          },
        },
      },
      '/search': {
        get: {
          tags: ['Search'], operationId: 'searchContent', security: partnerSecurity, parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 160 } },
            { name: 'type', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Anonymous maximum is 50; authenticated partner maximum is 100.' },
          ], responses: { '200': { description: 'Search results' }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses },
        },
      },
      '/changes': {
        get: {
          tags: ['Synchronization'], operationId: 'listChanges', security: partnerSecurity, parameters: [
            { name: 'since', in: 'query', required: true, schema: { type: 'string', format: 'date-time' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 1000, default: 100 }, description: 'Anonymous maximum is 500; authenticated partner maximum is 1000.' },
          ], responses: { '200': { description: 'Incremental public change stream' }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses },
        },
      },
      '/stats': { get: { tags: ['Operations'], operationId: 'getStats', security: partnerSecurity, responses: { '200': { description: 'Public content statistics' }, ...partnerResponses } } },
      '/{resource}': {
        get: {
          tags: ['Content','Taxonomy'], operationId: 'listNamedResource', security: partnerSecurity,
          parameters: [{ name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: ['articles','guides','research','conditions','comparisons','tools','courses','learning-paths','resources','protocols','interventions','assessments','glossary','pages','sectors','categories','tags'] } }, ...listParameters],
          responses: { '200': { description: 'Named collection' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses },
        },
      },
    },
    components: {
      securitySchemes: {
        PartnerApiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key', description: 'Rawafid institutional partner key. Keys are displayed once and stored only as SHA-256 hashes.' },
        PartnerBearer: { type: 'http', scheme: 'bearer', bearerFormat: 'rawafid_live_*', description: 'The same institutional partner key can be supplied as a Bearer credential.' },
      },
      schemas: {
        ContentSummary: contentSummary,
        Reference: {
          type: 'object', properties: { title: { type: ['string','null'] }, url: { type: ['string','null'], format: 'uri' }, publisher: { type: ['string','null'] }, year: {}, doi: { type: ['string','null'] }, pmid: { type: ['string','null'] }, license: { type: ['string','null'] } },
        },
        Rights: {
          type: 'object', required: ['reuse','attribution_required','attribution_text'], properties: { reuse: { type: 'string' }, attribution_required: { type: 'boolean' }, attribution_text: { type: 'string' }, license: { type: ['string','null'] }, commercial_use: { type: ['boolean','null'] }, derivatives: { type: ['boolean','null'] }, note: { type: 'string' } },
        },
        ContentListResponse: {
          type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/ContentSummary' } }, pagination: { type: 'object' }, meta: { type: 'object' } },
        },
        Error: {
          type: 'object', properties: { error: { type: 'object', required: ['code','message','request_id'], properties: { code: { type: 'string' }, message: { type: 'string' }, parameter: { type: ['string','null'] }, request_id: { type: 'string' } } } },
        },
      },
      responses: {
        BadRequest: { description: 'Invalid request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        NotFound: { description: 'Resource not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Unauthorized: { description: 'Invalid, missing, expired, or revoked partner credential when a credential is supplied.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Forbidden: { description: 'Partner credential does not grant the required scope.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        RateLimited: { description: 'Partner quota exceeded. Retry-After is returned.', headers: { 'Retry-After': { schema: { type: 'integer' } } }, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    externalDocs: { description: 'Rawafid developer documentation', url: `${SITE_URL}/developers` },
  };
  return jsonResponse(request, document, { cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' });
}
