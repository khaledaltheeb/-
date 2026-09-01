import { SITE_URL } from '@/lib/seo';
import { jsonResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

const partnerSecurity = [{}, { PartnerApiKey: [] }, { PartnerBearer: [] }];
const partnerResponses = {
  '401': { $ref: '#/components/responses/Unauthorized' },
  '403': { $ref: '#/components/responses/Forbidden' },
  '429': { $ref: '#/components/responses/RateLimited' },
  '503': { $ref: '#/components/responses/Unavailable' },
};

const contentListParameters = [
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 } },
  { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Opaque cursor returned by pagination.next_cursor. Do not parse or construct it client-side.' },
  { name: 'published_after', in: 'query', schema: { type: 'string', format: 'date-time' } },
  { name: 'updated_after', in: 'query', schema: { type: 'string', format: 'date-time' } },
];

const namedContent = [
  'articles','guides','research','conditions','comparisons','tools','courses','learning-paths',
  'resources','protocols','interventions','assessments','glossary','pages',
] as const;

const namedContentPaths = Object.fromEntries(namedContent.map((resource) => [
  `/${resource}`,
  {
    get: {
      tags: ['Content'],
      operationId: `list_${resource.replace(/-/g, '_')}`,
      security: partnerSecurity,
      parameters: contentListParameters,
      responses: {
        '200': { description: `Paginated ${resource} collection`, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentListResponse' } } } },
        '304': { $ref: '#/components/responses/NotModified' },
        '400': { $ref: '#/components/responses/BadRequest' },
        ...partnerResponses,
      },
    },
  },
]));

const taxonomyPaths = Object.fromEntries(['sectors','categories','tags'].map((resource) => [
  `/${resource}`,
  {
    get: {
      tags: ['Taxonomy'],
      operationId: `list_${resource}`,
      security: partnerSecurity,
      description: 'Public taxonomy projection only. Internal editorial, automation, migration, and governance metadata is never returned.',
      parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 500, default: 100 } }],
      responses: {
        '200': { description: `Public ${resource} taxonomy`, content: { 'application/json': { schema: { $ref: '#/components/schemas/TaxonomyListResponse' } } } },
        '304': { $ref: '#/components/responses/NotModified' },
        ...partnerResponses,
      },
    },
  },
]));

export async function GET(request: Request) {
  const document = {
    openapi: '3.1.0',
    info: {
      title: 'Rawafid Public & Partner API',
      version: PUBLIC_API_VERSION,
      summary: 'Versioned, read-only API for public Rawafid knowledge resources, sources, synchronization, and evidence discovery.',
      description: 'واجهة مؤسسية للمواد المنشورة والقابلة للفهرسة فقط. تعرض إسقاطًا عامًا منضبطًا ولا تكشف metadata التحرير أو الأتمتة أو الهجرة الداخلية. مفاتيح الشركاء اختيارية للمسارات العامة وتضيف تعريف التكامل والحصص والنطاقات. حقوق إعادة الاستخدام تبقى خاضعة لترخيص المادة والمصدر الأصلي.',
      contact: { name: 'Rawafid / منصة روافد', url: `${SITE_URL}/about`, email: 'Contact@healthrenewal.org' },
    },
    jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
    servers: [{ url: `${SITE_URL}/api/v1`, description: 'Canonical production API' }],
    tags: [
      { name: 'Discovery' }, { name: 'Content' }, { name: 'Taxonomy' }, { name: 'Sources' },
      { name: 'Search' }, { name: 'Evidence' }, { name: 'Synchronization' }, { name: 'Operations' },
    ],
    paths: {
      '/': {
        get: {
          tags: ['Discovery'], operationId: 'discoverApi',
          responses: { '200': { description: 'API discovery document' }, '304': { $ref: '#/components/responses/NotModified' } },
        },
      },
      '/content': {
        get: {
          tags: ['Content'], operationId: 'listContent', security: partnerSecurity,
          parameters: [
            ...contentListParameters,
            { name: 'type', in: 'query', schema: { type: 'string', maxLength: 80 } },
          ],
          responses: {
            '200': { description: 'Paginated public content', content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentListResponse' } } } },
            '304': { $ref: '#/components/responses/NotModified' },
            '400': { $ref: '#/components/responses/BadRequest' },
            ...partnerResponses,
          },
        },
      },
      '/content/{slug}': {
        get: {
          tags: ['Content'], operationId: 'getContent', security: partnerSecurity,
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string', pattern: '^[A-Za-z0-9][A-Za-z0-9-]{0,199}$' } }],
          responses: {
            '200': { description: 'Public content detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentDetailResponse' } } } },
            '304': { $ref: '#/components/responses/NotModified' },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
            ...partnerResponses,
          },
        },
      },
      '/content/{slug}/sources': {
        get: {
          tags: ['Content','Sources'], operationId: 'getContentSources', security: partnerSecurity,
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Normalized source registry relationships for a public content item' },
            '304': { $ref: '#/components/responses/NotModified' },
            '400': { $ref: '#/components/responses/BadRequest' },
            '404': { $ref: '#/components/responses/NotFound' },
            ...partnerResponses,
          },
        },
      },
      ...namedContentPaths,
      ...taxonomyPaths,
      '/sources': {
        get: {
          tags: ['Sources'], operationId: 'listSources', security: partnerSecurity,
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, maximum: 100000, default: 0 }, description: 'Offset pagination is supported for source browsing. For durable synchronization use /changes rather than repeatedly paging this ranking.' },
            { name: 'publisher', in: 'query', schema: { type: 'string', maxLength: 160 } },
            { name: 'type', in: 'query', schema: { type: 'string', maxLength: 80 } },
            { name: 'q', in: 'query', schema: { type: 'string', maxLength: 160 } },
          ],
          responses: { '200': { description: 'Normalized sources cited by published, indexable Rawafid content' }, '304': { $ref: '#/components/responses/NotModified' }, ...partnerResponses },
        },
      },
      '/sources/{id}': {
        get: {
          tags: ['Sources'], operationId: 'getSource', security: partnerSecurity,
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { '200': { description: 'Source metadata, ROR organization links where available, observed versions, and public content relationships' }, '304': { $ref: '#/components/responses/NotModified' }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses },
        },
      },
      '/search': {
        get: {
          tags: ['Search'], operationId: 'searchContent', security: partnerSecurity,
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 160 } },
            { name: 'type', in: 'query', schema: { type: 'string', maxLength: 80 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Anonymous maximum is 50; authenticated partner maximum is 100.' },
          ],
          responses: { '200': { description: 'Search results' }, '304': { $ref: '#/components/responses/NotModified' }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses },
        },
      },
      '/evidence-discovery': {
        get: {
          tags: ['Evidence'], operationId: 'discoverEvidence', security: partnerSecurity,
          description: 'Search normalized scholarly metadata. Europe PMC is the default provider. Lens is opt-in and returns not_configured when requested before a server-side Scholarly API credential is installed. A provider failure does not suppress successful results from another requested provider.',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 500 } },
            { name: 'providers', in: 'query', schema: { type: 'string', default: 'europe_pmc' }, description: 'Comma-separated provider list. Allowed values: europe_pmc,lens.' },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Anonymous maximum is 50; authenticated partner maximum is 100.' },
            { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Europe PMC cursorMark returned in the europe_pmc provider status.' },
          ],
          responses: {
            '200': { description: 'Normalized scholarly records with per-provider status and provenance', content: { 'application/json': { schema: { $ref: '#/components/schemas/EvidenceDiscoveryResponse' } } } },
            '304': { $ref: '#/components/responses/NotModified' },
            '400': { $ref: '#/components/responses/BadRequest' },
            ...partnerResponses,
          },
        },
      },
      '/changes': {
        get: {
          tags: ['Synchronization'], operationId: 'listChanges', security: partnerSecurity,
          description: 'Lossless incremental change stream ordered by (occurred_at,id). Start with since, then continue exclusively with pagination.next_cursor. next_since is compatibility-only and is not safe for paging batches that share a timestamp.',
          parameters: [
            { name: 'since', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Required on the first request when cursor is absent.' },
            { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Opaque continuation cursor from pagination.next_cursor. When supplied it supersedes since.' },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 1000, default: 100 }, description: 'Anonymous maximum is 500; authenticated partner maximum is 1000.' },
          ],
          responses: {
            '200': { description: 'Incremental public change stream', content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangeListResponse' } } } },
            '304': { $ref: '#/components/responses/NotModified' },
            '400': { $ref: '#/components/responses/BadRequest' },
            ...partnerResponses,
          },
        },
      },
      '/stats': {
        get: {
          tags: ['Operations'], operationId: 'getStats', security: partnerSecurity,
          responses: { '200': { description: 'Public content statistics' }, '304': { $ref: '#/components/responses/NotModified' }, ...partnerResponses },
        },
      },
    },
    components: {
      securitySchemes: {
        PartnerApiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key', description: 'Rawafid institutional partner key. Plaintext is displayed only at issuance; storage is SHA-256 hash-only.' },
        PartnerBearer: { type: 'http', scheme: 'bearer', bearerFormat: 'rawafid_live_*', description: 'The same institutional partner key may be sent as a Bearer credential.' },
      },
      schemas: {
        Reference: {
          type: 'object', additionalProperties: false,
          properties: { title: { type: ['string','null'] }, url: { type: ['string','null'], format: 'uri' }, publisher: { type: ['string','null'] }, year: { type: ['string','integer','null'] }, doi: { type: ['string','null'] }, pmid: { type: ['string','null'] }, license: { type: ['string','null'] } },
        },
        Rights: {
          type: 'object', required: ['reuse','attribution_required','attribution_text','note'], additionalProperties: false,
          properties: { reuse: { type: 'string' }, attribution_required: { type: 'boolean' }, attribution_text: { type: 'string' }, license: { type: ['string','null'] }, commercial_use: { type: ['boolean','null'] }, derivatives: { type: ['boolean','null'] }, note: { type: 'string' } },
        },
        ContentSummary: {
          type: 'object', required: ['id','type','slug','title','canonical_url','language','references','rights','schema_json'],
          properties: {
            id: { type: 'string', format: 'uuid' }, type: { type: 'string' }, slug: { type: 'string' }, title: { type: 'string' }, excerpt: { type: ['string','null'] }, canonical_url: { type: 'string', format: 'uri' }, language: { type: 'string', const: 'ar' }, audience: { type: 'array', items: { type: 'string' } }, sector_id: { type: ['string','null'], format: 'uuid' }, category_id: { type: ['string','null'], format: 'uuid' }, published_at: { type: ['string','null'], format: 'date-time' }, updated_at: { type: ['string','null'], format: 'date-time' }, featured_image: { type: ['string','null'] }, featured_image_alt: { type: ['string','null'] }, author: { type: ['string','null'] }, reviewer: { type: ['string','null'] }, reviewer_credentials: { type: ['string','null'] }, last_reviewed_at: { type: ['string','null'], format: 'date-time' }, primary_keyword: { type: ['string','null'] }, secondary_keywords: { type: 'array', items: { type: 'string' } }, semantic_terms: { type: 'array', items: { type: 'string' } }, search_intent: { type: ['string','null'] }, references: { type: 'array', items: { $ref: '#/components/schemas/Reference' } }, rights: { $ref: '#/components/schemas/Rights' }, schema_json: { type: 'object', description: 'Sanitized public structured-data projection. Internal editorial, automation, review-lock, migration and governance metadata is excluded.' },
          },
        },
        ContentDetail: { allOf: [{ $ref: '#/components/schemas/ContentSummary' }, { type: 'object', properties: { body: { type: 'object' }, medical_disclaimer: { type: ['string','null'] } } }] },
        ContentListResponse: { type: 'object', required: ['data','pagination','meta'], properties: { data: { type: 'array', items: { $ref: '#/components/schemas/ContentSummary' } }, pagination: { $ref: '#/components/schemas/CursorPagination' }, meta: { type: 'object' } } },
        ContentDetailResponse: { type: 'object', required: ['data','meta'], properties: { data: { $ref: '#/components/schemas/ContentDetail' }, meta: { type: 'object' } } },
        CursorPagination: { type: 'object', properties: { limit: { type: 'integer' }, has_more: { type: 'boolean' }, next_cursor: { type: ['string','null'] } } },
        TaxonomyListResponse: { type: 'object', required: ['data','pagination','meta'], properties: { data: { type: 'array', items: { type: 'object', not: { required: ['metadata'] } } }, pagination: { type: 'object' }, meta: { type: 'object' } } },
        EvidenceAffiliation: { type: 'object', properties: { name: { type: 'string' }, original: { type: ['string','null'] }, ror_id: { type: ['string','null'], format: 'uri' }, country_code: { type: ['string','null'] } } },
        EvidenceAuthor: { type: 'object', properties: { display_name: { type: 'string' }, orcid: { type: ['string','null'] }, affiliations: { type: 'array', items: { $ref: '#/components/schemas/EvidenceAffiliation' } } } },
        EvidenceRecord: { type: 'object', required: ['provider','provider_id','authors','identifiers','provenance'], properties: { provider: { type: 'string', enum: ['europe_pmc','lens'] }, provider_id: { type: 'string' }, title: { type: ['string','null'] }, abstract: { type: ['string','null'] }, publication_type: { type: ['string','null'] }, publication_year: { type: ['integer','null'] }, publication_date: { type: ['string','null'] }, journal: { type: ['string','null'] }, publisher: { type: ['string','null'] }, authors: { type: 'array', items: { $ref: '#/components/schemas/EvidenceAuthor' } }, identifiers: { type: 'object' }, cited_by_count: { type: ['integer','null'] }, is_open_access: { type: ['boolean','null'] }, is_retracted: { type: ['boolean','null'] }, url: { type: ['string','null'] }, provenance: { type: 'object' } } },
        ProviderStatus: { type: 'object', required: ['provider','status','returned','total','next_cursor'], properties: { provider: { type: 'string', enum: ['europe_pmc','lens'] }, status: { type: 'string', enum: ['ok','not_configured','error'] }, returned: { type: 'integer' }, total: { type: ['integer','null'] }, next_cursor: { type: ['string','null'] }, error: { type: 'object' } } },
        EvidenceDiscoveryResponse: { type: 'object', required: ['data','providers','meta'], properties: { data: { type: 'array', items: { $ref: '#/components/schemas/EvidenceRecord' } }, providers: { type: 'array', items: { $ref: '#/components/schemas/ProviderStatus' } }, meta: { type: 'object' } } },
        ChangeEvent: { type: 'object', required: ['id','content_id','event_type','slug','content_type','occurred_at'], properties: { id: { type: ['integer','string'] }, content_id: { type: 'string', format: 'uuid' }, event_type: { type: 'string', enum: ['published','updated','archived'] }, slug: { type: 'string' }, content_type: { type: 'string' }, canonical_url: { type: ['string','null'] }, occurred_at: { type: 'string', format: 'date-time' } } },
        ChangeListResponse: { type: 'object', required: ['data','pagination','meta'], properties: { data: { type: 'array', items: { $ref: '#/components/schemas/ChangeEvent' } }, pagination: { type: 'object', required: ['limit','has_more','next_cursor'], properties: { limit: { type: 'integer' }, has_more: { type: 'boolean' }, next_cursor: { type: ['string','null'] }, next_since: { type: ['string','null'], format: 'date-time' }, next_since_note: { type: 'string' } } }, meta: { type: 'object' } } },
        Error: { type: 'object', required: ['error'], properties: { error: { type: 'object', required: ['code','message','request_id'], properties: { code: { type: 'string' }, message: { type: 'string' }, parameter: { type: ['string','null'] }, request_id: { type: 'string' } } }, meta: { type: 'object' } } },
      },
      responses: {
        BadRequest: { description: 'Invalid request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        NotFound: { description: 'Resource not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Unauthorized: { description: 'Invalid, expired, revoked or malformed partner credential when a credential is supplied', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Forbidden: { description: 'Partner credential does not grant the required scope', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        RateLimited: { description: 'Partner quota exceeded', headers: { 'Retry-After': { schema: { type: 'integer' } } }, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Unavailable: { description: 'Rawafid database or an essential internal dependency is temporarily unavailable', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        NotModified: { description: 'Representation unchanged according to If-None-Match or If-Modified-Since' },
      },
    },
    externalDocs: { description: 'Rawafid developer documentation', url: `${SITE_URL}/developers` },
  };

  return jsonResponse(request, document, { cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' });
}
