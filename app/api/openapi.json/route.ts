import { SITE_URL } from '@/lib/seo';
import { jsonResponse } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const partnerSecurity = [{}, { PartnerApiKey: [] }, { PartnerBearer: [] }];
  const partnerResponses = {
    '401': { $ref: '#/components/responses/Unauthorized' },
    '403': { $ref: '#/components/responses/Forbidden' },
    '429': { $ref: '#/components/responses/RateLimited' },
    '503': { $ref: '#/components/responses/ServiceUnavailable' },
  };
  const successHeaders = {
    ETag: { description: 'Representation validator for conditional GET requests.', schema: { type: 'string' } },
    'Last-Modified': { description: 'Modification validator when the endpoint has a stable source timestamp.', schema: { type: 'string' } },
    'X-Request-Id': { description: 'Request correlation identifier.', schema: { type: 'string' } },
    'X-Rawafid-Partner': { description: 'Partner slug when a valid institutional key is supplied.', schema: { type: 'string' } },
    'X-RateLimit-Minute-Limit': { description: 'Partner minute quota.', schema: { type: 'integer' } },
    'X-RateLimit-Minute-Remaining': { description: 'Partner minute quota remaining.', schema: { type: 'integer' } },
    'X-RateLimit-Day-Limit': { description: 'Partner daily quota.', schema: { type: 'integer' } },
    'X-RateLimit-Day-Remaining': { description: 'Partner daily quota remaining.', schema: { type: 'integer' } },
  };
  const listParameters = [
    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }, description: 'Maximum records per page.' },
    { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Opaque composite cursor returned by the previous response.' },
    { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Optional Rawafid content type.' },
    { name: 'published_after', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'ISO-8601 publication lower bound.' },
    { name: 'updated_after', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'ISO-8601 update lower bound.' },
  ];
  const document = {
    openapi: '3.1.0',
    info: {
      title: 'Rawafid Public & Partner API',
      version: '1.2.0',
      summary: 'Versioned read-only API for public Rawafid knowledge resources, source provenance, feeds and scholarly discovery.',
      description: 'واجهة قراءة فقط للمواد المنشورة والقابلة للفهرسة، مع سجل مصادر مترابط، بحث عام، مزامنة تفاضلية، واكتشاف أدلة عبر Europe PMC وCrossref وDataCite وLens. مفاتيح الشركاء اختيارية وتضيف تعريفًا مؤسسيًا وحصص استخدام. إتاحة metadata أو نتائج الاكتشاف لا تمنح تلقائيًا حق إعادة نشر النصوص أو الملفات أو بيانات المزودات.',
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
      '/': { get: {
        tags: ['Discovery'], operationId: 'discoverApi', summary: 'Discover the Rawafid API',
        responses: { '200': { description: 'API discovery document', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiDiscoveryResponse' } } } } },
      } },
      '/content': { get: {
        tags: ['Content'], operationId: 'listContent', summary: 'List public content', security: partnerSecurity, parameters: listParameters,
        responses: { '200': { description: 'Cursor-paginated public content', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentListResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses },
      } },
      '/content/{slug}': { get: {
        tags: ['Content'], operationId: 'getContent', summary: 'Get one public content item', security: partnerSecurity,
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string', pattern: '^[A-Za-z0-9][A-Za-z0-9-]{0,199}$' } }],
        responses: { '200': { description: 'Public content detail including body, references and rights profile', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentDetailResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses },
      } },
      '/content/{slug}/sources': { get: {
        tags: ['Content','Sources'], operationId: 'getContentSources', summary: 'List normalized sources cited by a content item', security: partnerSecurity,
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Normalized sources cited by a public content item', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/GenericDataResponse' } } } }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses },
      } },
      '/sources': { get: {
        tags: ['Sources'], operationId: 'listSources', summary: 'Browse the public source registry', security: partnerSecurity,
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, maximum: 100000, default: 0 }, description: 'Offset pagination is used by the source registry.' },
          { name: 'publisher', in: 'query', schema: { type: 'string', maxLength: 160 } },
          { name: 'type', in: 'query', schema: { type: 'string', maxLength: 80 } },
          { name: 'q', in: 'query', schema: { type: 'string', maxLength: 160 } },
        ],
        responses: { '200': { description: 'Normalized public source registry', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/SourceRegistryResponse' } } } }, ...partnerResponses },
      } },
      '/sources/{id}': { get: {
        tags: ['Sources'], operationId: 'getSource', summary: 'Get one source with connection and rights metadata', security: partnerSecurity,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'Source metadata including related identifiers, ORCID/ROR connections, structured rights, translation provenance, versions and citations', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/SourceDetailResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses },
      } },
      '/search': { get: {
        tags: ['Search'], operationId: 'searchContent', summary: 'Search public Rawafid content', security: partnerSecurity,
        description: 'Ranked public-content search. The response shape is the same public content representation used by content listing, with search metadata in meta.',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 160 } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Anonymous maximum 50; partner maximum 100.' },
        ],
        responses: { '200': { description: 'Ranked search results', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses },
      } },
      '/evidence-discovery': { get: {
        tags: ['Evidence'], operationId: 'discoverEvidence', summary: 'Discover normalized scholarly metadata', security: partnerSecurity,
        description: 'Search normalized scholarly metadata across Europe PMC, Crossref and DataCite by default. Lens Scholarly API is explicit opt-in only. DataCite creator/contributor identifiers, affiliations and related identifiers are normalized when supplied. Provider failures are isolated and reported per provider.',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2, maxLength: 500 } },
          { name: 'providers', in: 'query', schema: { type: 'string', default: 'europe_pmc,crossref,datacite' }, description: 'Comma-separated values: europe_pmc,crossref,datacite,lens. Lens is never included unless explicitly requested.' },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }, description: 'Anonymous maximum 50; partner maximum 100.' },
          { name: 'cursor', in: 'query', schema: { type: 'string' }, deprecated: true, description: 'Backward-compatible alias for europe_pmc_cursor.' },
          { name: 'europe_pmc_cursor', in: 'query', schema: { type: 'string' }, description: 'Europe PMC cursorMark.' },
          { name: 'crossref_cursor', in: 'query', schema: { type: 'string' }, description: 'Crossref cursor returned by provider status.' },
          { name: 'datacite_cursor', in: 'query', schema: { type: 'string' }, description: 'Opaque DataCite page[cursor] token returned by provider status; use 1 only for the initial cursor request.' },
          { name: 'crossref_from_update_date', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Crossref incremental update-date lower bound.' },
          { name: 'crossref_from_index_date', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Crossref incremental index-date lower bound.' },
        ],
        responses: {
          '200': { description: 'Normalized evidence records with typed provider status, independent cursors and provenance', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/EvidenceDiscoveryResponse' } } } },
          '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses,
        },
      } },
      '/lens': { get: {
        tags: ['Lens'],
        operationId: 'getLensIntegrationManifest',
        summary: 'Lens Scholarly API integration manifest',
        description: 'Machine-readable Rawafid Lens integration status and contract. This endpoint never exposes the Lens credential and does not itself consume Lens upstream quota.',
        responses: {
          '200': { description: 'Lens integration manifest', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/LensIntegrationManifest' } } } },
        },
      } },
      '/changes': { get: {
        tags: ['Synchronization'], operationId: 'listChanges', summary: 'Read the incremental public change stream', security: partnerSecurity,
        description: 'Use since for the first page and next_cursor for every subsequent page. The composite cursor contains the event timestamp and ID, preventing missed events when multiple changes share the same timestamp. next_since is retained only as a backward-compatible timestamp checkpoint.',
        parameters: [
          { name: 'since', in: 'query', required: true, schema: { type: 'string', format: 'date-time' }, description: 'Initial ISO-8601 checkpoint. Keep the same value while paging with cursor.' },
          { name: 'cursor', in: 'query', schema: { type: 'string' }, description: 'Opaque lossless composite cursor returned as pagination.next_cursor.' },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 1000, default: 100 }, description: 'Anonymous maximum 500; partner maximum 1000.' },
        ],
        responses: { '200': { description: 'Incremental public change stream', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangeStreamResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, ...partnerResponses },
      } },
      '/stats': { get: {
        tags: ['Operations'], operationId: 'getStats', summary: 'Get public API statistics', security: partnerSecurity,
        responses: { '200': { description: 'Public content statistics', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/StatsResponse' } } } }, ...partnerResponses },
      } },
      '/{resource}': { get: {
        tags: ['Content','Taxonomy'], operationId: 'listNamedResource', summary: 'List a named public collection', security: partnerSecurity,
        parameters: [
          { name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: ['articles','guides','research','conditions','comparisons','tools','courses','learning-paths','resources','protocols','interventions','assessments','glossary','pages','sectors','categories','tags'] } },
          ...listParameters,
        ],
        responses: { '200': { description: 'Named collection', headers: successHeaders, content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentListResponse' } } } }, '400': { $ref: '#/components/responses/BadRequest' }, '404': { $ref: '#/components/responses/NotFound' }, ...partnerResponses },
      } },
    },
    components: {
      securitySchemes: {
        PartnerApiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key', description: 'Optional Rawafid institutional partner key. Displayed once at issuance; only its SHA-256 digest is stored.' },
        PartnerBearer: { type: 'http', scheme: 'bearer', bearerFormat: 'rawafid_live_*', description: 'The same optional partner credential may be supplied as an Authorization Bearer token.' },
      },
      schemas: {
        ApiMeta: { type: 'object', required: ['api_version','generated_at'], properties: { api_version: { type: 'string', example: '1.2.0' }, generated_at: { type: 'string', format: 'date-time' } } },
        RightsProfile: { type: 'object', required: ['reuse','attribution_required'], properties: {
          reuse: { type: 'string', example: 'link_and_citation_only' }, attribution_required: { type: 'boolean' }, attribution_text: { type: ['string','null'] }, license: { type: ['string','null'] }, commercial_use: { type: ['boolean','null'] }, derivatives: { type: ['boolean','null'] }, note: { type: ['string','null'] },
        } },
        PublicContent: { type: 'object', required: ['id','type','slug','title','canonical_url','language','rights'], properties: {
          id: { type: 'string', format: 'uuid' }, type: { type: 'string' }, slug: { type: 'string' }, title: { type: 'string' }, excerpt: { type: ['string','null'] }, canonical_url: { type: 'string', format: 'uri' }, language: { type: 'string', const: 'ar' }, audience: { type: 'array', items: { type: 'string' } }, sector_id: { type: ['string','null'], format: 'uuid' }, category_id: { type: ['string','null'], format: 'uuid' }, published_at: { type: ['string','null'], format: 'date-time' }, updated_at: { type: 'string', format: 'date-time' }, featured_image: { type: ['string','null'] }, featured_image_alt: { type: ['string','null'] }, author: { type: ['string','null'] }, reviewer: { type: ['string','null'] }, reviewer_credentials: { type: ['string','null'] }, last_reviewed_at: { type: ['string','null'], format: 'date-time' }, primary_keyword: { type: ['string','null'] }, secondary_keywords: { type: 'array', items: { type: 'string' } }, semantic_terms: { type: 'array', items: { type: 'string' } }, search_intent: { type: ['string','null'] }, references: { type: 'array', items: { type: 'object' } }, rights: { $ref: '#/components/schemas/RightsProfile' }, schema_json: { type: 'object' }, body: { type: 'object' }, medical_disclaimer: { type: ['string','null'] },
        } },
        ContentPagination: { type: 'object', required: ['limit','has_more','next_cursor'], properties: { limit: { type: 'integer' }, has_more: { type: 'boolean' }, next_cursor: { type: ['string','null'] } } },
        ContentListResponse: { type: 'object', required: ['data','pagination','meta'], properties: { data: { type: 'array', items: { $ref: '#/components/schemas/PublicContent' } }, pagination: { $ref: '#/components/schemas/ContentPagination' }, meta: { $ref: '#/components/schemas/ApiMeta' } } },
        ContentDetailResponse: { type: 'object', required: ['data','meta'], properties: { data: { $ref: '#/components/schemas/PublicContent' }, meta: { $ref: '#/components/schemas/ApiMeta' } } },
        SearchResponse: { type: 'object', required: ['data','meta'], properties: { data: { type: 'array', items: { $ref: '#/components/schemas/PublicContent' } }, meta: { type: 'object', required: ['api_version','generated_at','query','count'], properties: { api_version: { type: 'string' }, generated_at: { type: 'string', format: 'date-time' }, query: { type: 'string' }, type: { type: ['string','null'] }, count: { type: 'integer' }, search_mode: { type: 'string', const: 'ranked_public_content' } } } } },
        GenericDataResponse: { type: 'object', required: ['data'], properties: { data: {}, meta: { type: 'object' }, pagination: { type: 'object' } } },
        SourceRegistryResponse: { type: 'object', required: ['data','pagination','meta'], properties: { data: { type: 'array', items: { type: 'object' } }, pagination: { type: 'object', required: ['limit','offset','returned','next_offset'], properties: { limit: { type: 'integer' }, offset: { type: 'integer' }, returned: { type: 'integer' }, next_offset: { type: ['integer','null'] } } }, meta: { type: 'object' } } },
        ChangeEvent: { type: 'object', required: ['id','content_id','event_type','slug','content_type','occurred_at'], properties: { id: { type: 'integer' }, content_id: { type: 'string', format: 'uuid' }, event_type: { type: 'string' }, slug: { type: 'string' }, content_type: { type: 'string' }, canonical_url: { type: ['string','null'] }, occurred_at: { type: 'string', format: 'date-time' } } },
        ChangeStreamResponse: { type: 'object', required: ['data','pagination','meta'], properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/ChangeEvent' } },
          pagination: { type: 'object', required: ['limit','has_more','next_cursor','next_since','cursor_recommended'], properties: { limit: { type: 'integer' }, has_more: { type: 'boolean' }, next_cursor: { type: ['string','null'] }, next_since: { type: 'string', format: 'date-time' }, cursor_recommended: { type: 'boolean', const: true } } },
          meta: { type: 'object', properties: { api_version: { type: 'string' }, generated_at: { type: 'string', format: 'date-time' }, since: { type: 'string', format: 'date-time' }, pagination_note: { type: 'string' } } },
        } },
        StatsResponse: { type: 'object', required: ['data','meta'], properties: { data: { type: ['object','null'] }, meta: { $ref: '#/components/schemas/ApiMeta' } } },
        ApiDiscoveryResponse: { type: 'object', required: ['name','version','status','canonical_origin','base_url','documentation','openapi','principles','resources'], properties: { name: { type: 'string' }, version: { type: 'string' }, status: { type: 'string', const: 'stable' }, canonical_origin: { type: 'string', format: 'uri' }, base_url: { type: 'string', format: 'uri' }, documentation: { type: 'string', format: 'uri' }, openapi: { type: 'string', format: 'uri' }, feeds: { type: 'object' }, principles: { type: 'array', items: { type: 'string' } }, resources: { type: 'array', items: { type: 'string' } }, evidence_discovery: { type: 'object' }, lens: { type: 'object' } } },
        EvidenceProviderStatus: { type: 'object', required: ['provider','status','returned','total','next_cursor'], properties: {
          provider: { type: 'string', enum: ['europe_pmc','crossref','datacite','lens'] },
          status: { type: 'string', enum: ['ok','not_configured','error'] },
          returned: { type: 'integer', minimum: 0 }, total: { type: ['integer','null'], minimum: 0 }, next_cursor: { type: ['string','null'] },
          error: { type: 'object', properties: { code: { type: 'string', enum: ['rate_limited','provider_unavailable'] }, retryable: { type: 'boolean' } } },
        } },
        EvidenceDiscoveryResponse: { type: 'object', required: ['data','providers','meta'], properties: {
          data: { type: 'array', items: { type: 'object' } }, providers: { type: 'array', items: { $ref: '#/components/schemas/EvidenceProviderStatus' } },
          meta: { type: 'object', required: ['api_version','generated_at','query','requested_providers','default_providers','lens'], properties: { api_version: { type: 'string' }, generated_at: { type: 'string', format: 'date-time' }, query: { type: 'string' }, requested_providers: { type: 'array', items: { type: 'string', enum: ['europe_pmc','crossref','datacite','lens'] } }, default_providers: { type: 'array', items: { type: 'string', enum: ['europe_pmc','crossref','datacite'] } }, lens: { type: 'object' }, note: { type: 'string' } } },
        } },
        LensIntegrationManifest: { type: 'object', required: ['name','api_version','status','mode','search','attribution','identifiers','quota','security','privacy','rights','failure_behavior','documentation','openapi'], properties: {
          name: { type: 'string' }, api_version: { type: 'string' }, status: { type: 'string', enum: ['configured','awaiting_credential'] }, mode: { type: 'string', const: 'explicit_opt_in' },
          search: { type: 'object', required: ['endpoint','required_provider_parameter','default_provider_set_excludes_lens'], properties: { endpoint: { type: 'string', const: '/api/v1/evidence-discovery' }, required_provider_parameter: { type: 'string', const: 'providers=lens' }, example: { type: 'string' }, mixed_example: { type: 'string' }, default_provider_set_excludes_lens: { type: 'boolean', const: true } } },
          attribution: { type: 'object', required: ['provider','label','url','terms_url'], properties: { provider: { type: 'string', const: 'The Lens' }, label: { type: 'string', const: 'Data Sourced from The Lens' }, url: { type: 'string', format: 'uri' }, terms_url: { type: 'string', format: 'uri' } } },
          identifiers: { type: 'object', properties: { lens_id_preserved: { type: 'boolean', const: true }, record_fields: { type: 'array', items: { type: 'string' } }, original_record_link_preserved: { type: 'boolean', const: true } } },
          quota: { type: 'object', required: ['requests_per_minute','requests_per_month','enforcement','accounting_scope','retries_per_upstream_request'], properties: { requests_per_minute: { type: 'integer', const: 10 }, requests_per_month: { type: 'integer', const: 20000 }, enforcement: { type: 'string', const: 'distributed_fail_closed' }, accounting_scope: { type: 'string', const: 'global_service_allocation' }, retries_per_upstream_request: { type: 'integer', const: 0 } } },
          security: { type: 'object', properties: { credential: { type: 'string', const: 'server_side_only' }, credential_name: { type: 'string', const: 'LENS_SCHOLARLY_API_TOKEN' }, exposed_to_client: { type: 'boolean', const: false }, database_guard: { type: 'string' }, rpc_execution_role: { type: 'string', const: 'service_role_only' } } },
          privacy: { type: 'object', properties: { lens_specific_user_tracking: { type: 'boolean', const: false }, lens_specific_user_profiles: { type: 'boolean', const: false }, lens_specific_fingerprinting: { type: 'boolean', const: false }, quota_accounting_contains_user_identifiers: { type: 'boolean', const: false } } },
          rights: { type: 'object', properties: { metadata_discovery_only: { type: 'boolean', const: true }, api_access_does_not_imply_full_text_reuse_rights: { type: 'boolean', const: true }, redistribution_requires_upstream_rights_and_terms: { type: 'boolean', const: true }, lens_id_and_attribution_must_be_retained_when_lens_data_is_displayed_or_redistributed: { type: 'boolean', const: true } } },
          failure_behavior: { type: 'object', properties: { missing_credential: { type: 'string' }, quota_exhausted: { type: 'string' }, quota_guard_unavailable: { type: 'string' }, other_providers_remain_available: { type: 'boolean', const: true } } },
          documentation: { type: 'string' }, openapi: { type: 'string' },
        } },
        RelatedIdentifier: { type: 'object', properties: { identifier: { type: 'string' }, identifier_type: { type: 'string' }, relation_type: { type: 'string' }, relation_scheme: { type: 'string' }, related_metadata_scheme: { type: ['string','null'] }, scheme_uri: { type: ['string','null'] }, scheme_type: { type: ['string','null'] }, verified_at: { type: ['string','null'], format: 'date-time' } } },
        SourceContributor: { type: 'object', properties: { display_name: { type: 'string' }, contributor_type: { type: 'string' }, position: { type: ['integer','null'] }, orcid: { type: ['string','null'], format: 'uri' }, affiliations: { type: 'array', items: { type: 'object' } } } },
        SourceRightsProfile: { type: 'object', properties: { source_version_id: { type: ['string','null'], format: 'uuid' }, metadata: { type: 'object', properties: { access_status: { enum: ['unknown','public','restricted','embargoed'] }, reuse_status: { enum: ['unknown','allowed','conditional','prohibited'] }, license: { type: ['string','null'] }, terms_url: { type: ['string','null'], format: 'uri' } } }, content: { type: 'object', properties: { access_status: { enum: ['unknown','public','restricted','embargoed'] }, reuse_status: { enum: ['unknown','allowed','conditional','prohibited'] }, license: { type: ['string','null'] }, terms_url: { type: ['string','null'], format: 'uri' } } }, rights_basis: { enum: ['unknown','provider_terms','record_license','direct_permission','public_domain','other'] }, verified_at: { type: ['string','null'], format: 'date-time' } } },
        SourceTranslationProvenance: { type: 'object', properties: { source_version_id: { type: ['string','null'], format: 'uuid' }, field_path: { type: 'string' }, source_language: { type: ['string','null'] }, target_language: { type: 'string' }, translation_method: { enum: ['human','machine','hybrid','unknown'] }, translation_tool: { type: ['string','null'] }, translation_tool_version: { type: ['string','null'] }, translator: { type: 'object', properties: { display_name: { type: ['string','null'] }, orcid: { type: ['string','null'], format: 'uri' }, affiliation: { type: ['string','null'] }, ror_id: { type: ['string','null'], format: 'uri' } } }, review: { type: 'object', properties: { status: { enum: ['unreviewed','reviewed','approved'] }, reviewer_display_name: { type: ['string','null'] }, reviewer_orcid: { type: ['string','null'], format: 'uri' }, reviewer_affiliation: { type: ['string','null'] }, reviewer_ror_id: { type: ['string','null'], format: 'uri' }, reviewed_at: { type: ['string','null'], format: 'date-time' } } }, value_sha256: { type: ['string','null'], pattern: '^[0-9a-f]{64}$' } } },
        SourceDetailResponse: { type: 'object', properties: { data: { type: 'object', properties: { related_identifiers: { type: 'array', items: { $ref: '#/components/schemas/RelatedIdentifier' } }, contributors: { type: 'array', items: { $ref: '#/components/schemas/SourceContributor' } }, organizations: { type: 'array', items: { type: 'object' } }, rights_profiles: { type: 'array', items: { $ref: '#/components/schemas/SourceRightsProfile' } }, translations: { type: 'array', items: { $ref: '#/components/schemas/SourceTranslationProvenance' } }, versions: { type: 'array', items: { type: 'object' } }, cited_by: { type: 'array', items: { type: 'object' } } } }, meta: { type: 'object' } } },
        Error: { type: 'object', required: ['error'], properties: { error: { type: 'object', required: ['code','message','request_id'], properties: { code: { type: 'string' }, message: { type: 'string' }, parameter: { type: ['string','null'] }, request_id: { type: 'string' } } }, meta: { type: 'object' } } },
      },
      responses: {
        BadRequest: { description: 'Invalid request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        NotFound: { description: 'Resource not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Unauthorized: { description: 'Invalid, expired or revoked partner credential when supplied', headers: { 'WWW-Authenticate': { schema: { type: 'string' } } }, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        Forbidden: { description: 'Credential lacks the required scope', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        RateLimited: { description: 'Partner quota exceeded', headers: { 'Retry-After': { schema: { type: 'integer' } } }, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        ServiceUnavailable: { description: 'A required internal or upstream service is temporarily unavailable', headers: { 'Retry-After': { schema: { type: 'integer' } } }, content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  };
  return jsonResponse(request, document, { cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' });
}
