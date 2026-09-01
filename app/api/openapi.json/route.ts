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
  const document = {
    openapi: '3.1.0',
    info: {
      title: 'Rawafid Public API',
      version: '1.0.0',
      summary: 'Versioned, read-only API for public Rawafid knowledge resources.',
      description: 'واجهة عامة للمواد المنشورة فقط، مع بيانات المصدر والمراجعة والحقوق. لا تمنح الواجهة تلقائيًا حق إعادة نشر النصوص أو المصادر الخارجية.',
      contact: { name: 'Rawafid', url: `${SITE_URL}/about` },
    },
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    servers: [{ url: `${SITE_URL}/api/v1`, description: 'Canonical production API' }],
    tags: [
      { name: 'Discovery' }, { name: 'Content' }, { name: 'Search' }, { name: 'Taxonomy' }, { name: 'Synchronization' }, { name: 'Operations' },
    ],
    paths: {
      '/': {
        get: { tags: ['Discovery'], operationId: 'discoverApi', responses: { '200': { description: 'API discovery document' } } },
      },
      '/content': {
        get: {
          tags: ['Content'], operationId: 'listContent', parameters: listParameters,
          responses: { '200': { description: 'Paginated public content', content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentListResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' } },
        },
      },
      '/content/{slug}': {
        get: {
          tags: ['Content'], operationId: 'getContent', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Public content detail' }, '404': { $ref: '#/components/responses/NotFound' } },
        },
      },
      '/content/{slug}/sources': {
        get: {
          tags: ['Content'], operationId: 'getContentSources', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Machine-readable source registry for a public content item' }, '404': { $ref: '#/components/responses/NotFound' } },
        },
      },
      '/search': {
        get: {
          tags: ['Search'], operationId: 'searchContent', parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 160 } },
            { name: 'type', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } },
          ], responses: { '200': { description: 'Search results' }, '400': { $ref: '#/components/responses/BadRequest' } },
        },
      },
      '/changes': {
        get: {
          tags: ['Synchronization'], operationId: 'listChanges', parameters: [
            { name: 'since', in: 'query', required: true, schema: { type: 'string', format: 'date-time' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 500, default: 100 } },
          ], responses: { '200': { description: 'Incremental public change stream' }, '400': { $ref: '#/components/responses/BadRequest' } },
        },
      },
      '/stats': { get: { tags: ['Operations'], operationId: 'getStats', responses: { '200': { description: 'Public content statistics' } } } },
      '/{resource}': {
        get: {
          tags: ['Content','Taxonomy'], operationId: 'listNamedResource',
          parameters: [{ name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: ['articles','guides','research','conditions','comparisons','tools','courses','learning-paths','resources','protocols','interventions','assessments','glossary','sectors','categories','tags'] } }, ...listParameters],
          responses: { '200': { description: 'Named collection' }, '404': { $ref: '#/components/responses/NotFound' } },
        },
      },
    },
    components: {
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
      },
    },
    externalDocs: { description: 'Rawafid developer documentation', url: `${SITE_URL}/developers` },
  };
  return jsonResponse(request, document, { cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' });
}
