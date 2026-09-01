import { jsonResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const resources = ['person','specialist','organization','course','page','learning_path','event','schedule'] as const;

export async function GET(request: Request) {
  const document = {
    openapi: '3.1.0',
    info: {
      title: 'Rawafid Institutional Data Exchange API',
      version: PUBLIC_API_VERSION,
      summary: 'Governed inbound partner submissions for people, providers, organizations, learning content, events, and schedules.',
      description: 'Partner writes never publish directly. Submissions enter a provenance-tracked staging boundary and require explicit review before publication.',
      contact: { name: 'Rawafid / منصة روافد', email: 'Contact@healthrenewal.org', url: `${SITE_URL}/developers` },
    },
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    servers: [{ url: `${SITE_URL}/api/v1/integrations`, description: 'Canonical production integration API' }],
    paths: {
      '/': {
        get: {
          operationId: 'discoverInstitutionalExchange',
          summary: 'Discover supported inbound resources and governance guarantees',
          responses: { '200': { description: 'Exchange discovery document' } },
        },
      },
      '/{resource}': {
        post: {
          operationId: 'submitInstitutionalResource',
          summary: 'Stage a partner-owned resource for governed review',
          security: [{ PartnerApiKey: [] }, { PartnerBearer: [] }],
          parameters: [
            { name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: resources } },
            { name: 'Idempotency-Key', in: 'header', required: true, schema: { type: 'string', pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$' }, description: 'Partner-scoped idempotency identity. Concurrent requests sharing this key are serialized.' },
            { name: 'X-Request-Id', in: 'header', required: false, schema: { type: 'string', maxLength: 64 } },
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmissionEnvelope' } } },
          },
          responses: {
            '202': { description: 'New submission accepted into governed staging', content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmissionResponse' } } } },
            '200': { description: 'Idempotent replay of an existing submission', content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmissionResponse' } } } },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '409': { $ref: '#/components/responses/Conflict' },
            '413': { $ref: '#/components/responses/PayloadTooLarge' },
            '429': { $ref: '#/components/responses/RateLimited' },
            '503': { $ref: '#/components/responses/Unavailable' },
          },
        },
        get: {
          operationId: 'getInstitutionalResourceStatus',
          summary: 'Read the partner-owned staging/review/publication status',
          security: [{ PartnerApiKey: [] }, { PartnerBearer: [] }],
          parameters: [
            { name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: resources } },
            { name: 'external_id', in: 'query', required: true, schema: { type: 'string', minLength: 1, maxLength: 200 } },
          ],
          responses: {
            '200': { description: 'Partner-owned staged item status', content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusResponse' } } } },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '403': { $ref: '#/components/responses/Forbidden' },
            '404': { $ref: '#/components/responses/NotFound' },
            '429': { $ref: '#/components/responses/RateLimited' },
            '503': { $ref: '#/components/responses/Unavailable' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        PartnerApiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
        PartnerBearer: { type: 'http', scheme: 'bearer', bearerFormat: 'rawafid_live_*' },
      },
      schemas: {
        ResourceType: { type: 'string', enum: resources },
        SubmissionEnvelope: {
          type: 'object', additionalProperties: false, required: ['external_id','data'],
          properties: {
            external_id: { type: 'string', minLength: 1, maxLength: 200, description: 'Stable identifier in the partner source system.' },
            data: { type: 'object', additionalProperties: true, description: 'Resource payload. It is staged, not directly published.' },
            provenance: { type: 'object', additionalProperties: true, default: {}, description: 'Source URL, source record version, retrieved_at, license, attribution, or other provenance evidence.' },
          },
        },
        SubmissionData: {
          type: 'object', required: ['submission_id','item_id','resource_type','external_id','status','review_required','idempotent_replay'],
          properties: {
            submission_id: { type: 'string', format: 'uuid' }, item_id: { type: 'string', format: 'uuid' },
            resource_type: { $ref: '#/components/schemas/ResourceType' }, external_id: { type: 'string' },
            status: { type: 'string', enum: ['received','needs_review','accepted','rejected','published','failed'] },
            review_required: { type: 'boolean', const: true }, idempotent_replay: { type: 'boolean' },
            published_url: { type: ['string','null'], format: 'uri' },
          },
        },
        SubmissionResponse: {
          type: 'object', required: ['data','meta'],
          properties: {
            data: { $ref: '#/components/schemas/SubmissionData' },
            meta: { type: 'object', required: ['api_version','publication_boundary'], properties: { api_version: { type: 'string' }, partner: { type: ['string','null'] }, accepted_at: { type: 'string', format: 'date-time' }, publication_boundary: { type: 'string' } } },
          },
        },
        StatusResponse: {
          type: 'object', required: ['data','meta'],
          properties: {
            data: { type: 'object', required: ['item_id','resource_type','external_id','status'], properties: {
              item_id: { type: 'string', format: 'uuid' }, resource_type: { $ref: '#/components/schemas/ResourceType' }, external_id: { type: 'string' },
              status: { type: 'string', enum: ['received','needs_review','accepted','rejected','published','failed'] },
              review_note: { type: ['string','null'] }, published_entity_type: { type: ['string','null'] }, published_entity_id: { type: ['string','null'], format: 'uuid' }, published_url: { type: ['string','null'], format: 'uri' },
              received_at: { type: 'string', format: 'date-time' }, updated_at: { type: 'string', format: 'date-time' }, reviewed_at: { type: ['string','null'], format: 'date-time' }, published_at: { type: ['string','null'], format: 'date-time' },
            } },
            meta: { type: 'object', properties: { api_version: { type: 'string' }, partner: { type: ['string','null'] } } },
          },
        },
        Error: { type: 'object', properties: { error: { type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' }, parameter: { type: ['string','null'] }, request_id: { type: 'string' } } }, meta: { type: 'object', properties: { api_version: { type: 'string' } } } } },
      },
      responses: {
        BadRequest: { description: 'Invalid request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Unauthorized: { description: 'Missing or invalid partner credential', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Forbidden: { description: 'Partner credential lacks the required scope', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        NotFound: { description: 'No partner-owned staged item found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Conflict: { description: 'Idempotency-Key was reused with different input', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        PayloadTooLarge: { description: 'Request exceeds the integration payload ceiling', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        RateLimited: { description: 'Partner quota exceeded', headers: { 'Retry-After': { schema: { type: 'integer' } } }, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Unavailable: { description: 'Integration service temporarily unavailable', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  };

  return jsonResponse(request, document, { cacheControl: 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600' });
}
