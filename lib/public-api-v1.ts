import { createHash, randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/seo';
import { publicContentHref } from '@/lib/public-content-routing';

export const PUBLIC_API_VERSION = '1.1.0';
export const PUBLIC_API_BASE = '/api/v1';
export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;

export const CONTENT_RESOURCE_TYPES: Record<string, string | string[]> = {
  articles: 'article',
  guides: 'guide',
  research: 'research',
  conditions: 'condition',
  comparisons: 'comparison',
  tools: 'tool',
  courses: 'course',
  'learning-paths': 'learning_path',
  resources: 'resource',
  protocols: 'protocol',
  interventions: 'intervention',
  assessments: 'assessment',
  glossary: 'glossary_term',
  pages: ['landing_page', 'directory_page', 'sector_page'],
};

const CONTENT_FIELDS = 'id,content_type,slug,title,excerpt,body_json,body_text,audience,seo_title,seo_description,canonical_url,schema_json,featured_image_url,featured_image_alt,published_at,updated_at,primary_keyword,secondary_keywords,semantic_terms,search_intent,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,sector_id,category_id' as const;

export type ApiCursor = { published_at: string; id: string };

type JsonRecord = Record<string, unknown>;

const PUBLIC_SCHEMA_KEYS = new Set([
  '@context', '@type', '@id', '@graph', 'name', 'headline', 'description', 'url', 'mainEntityOfPage',
  'datePublished', 'dateModified', 'author', 'reviewedBy', 'publisher', 'image', 'keywords', 'inLanguage',
  'about', 'mentions', 'breadcrumb', 'itemListElement', 'position', 'item', 'mainEntity', 'acceptedAnswer',
  'suggestedAnswer', 'question', 'answer', 'text', 'sameAs', 'identifier', 'citation', 'isPartOf', 'hasPart',
  'educationalLevel', 'learningResourceType', 'audience', 'medicalAudience', 'code', 'codingSystem',
]);

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function safeReferences(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 100).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const url = asString(row.url);
    const title = asString(row.title);
    if (!url && !title) return [];
    const key = (url || title).toLowerCase();
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      title: title || null,
      url: /^https:\/\//i.test(url) ? url : null,
      publisher: asString(row.publisher) || null,
      year: typeof row.year === 'string' || typeof row.year === 'number' ? row.year : null,
      doi: asString(row.doi) || null,
      pmid: asString(row.pmid) || null,
      license: asString(row.license) || null,
    }];
  });
}

function rightsFor(schema: unknown) {
  const root = asRecord(schema);
  const configured = asRecord(root?.public_api_rights);
  const reuse = asString(configured?.reuse);
  return {
    reuse: reuse || 'link_and_citation_only',
    attribution_required: configured?.attribution_required !== false,
    attribution_text: asString(configured?.attribution_text) || `منصة روافد — ${SITE_URL}`,
    license: asString(configured?.license) || null,
    commercial_use: typeof configured?.commercial_use === 'boolean' ? configured.commercial_use : null,
    derivatives: typeof configured?.derivatives === 'boolean' ? configured.derivatives : null,
    note: asString(configured?.note) || 'تعتمد حقوق إعادة الاستخدام على حقوق المادة ومصادرها. غياب ترخيص صريح لا يمنح حق إعادة نشر النص الكامل.',
  };
}

function sanitizeStructuredValue(value: unknown, depth = 0): unknown {
  if (depth > 6) return null;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => sanitizeStructuredValue(item, depth + 1));
  const row = asRecord(value);
  if (!row) return null;
  return Object.fromEntries(
    Object.entries(row)
      .filter(([key]) => PUBLIC_SCHEMA_KEYS.has(key))
      .map(([key, nested]) => [key, sanitizeStructuredValue(nested, depth + 1)]),
  );
}

function publicSchema(value: unknown) {
  const root = asRecord(value);
  const structured = asRecord(root?.structured_data);
  const sanitized = sanitizeStructuredValue(structured || root || {});
  return asRecord(sanitized) || {};
}

function canonicalEtagValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalEtagValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== 'generated_at' && key !== 'request_id')
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalEtagValue(nested)]),
    );
  }
  return value;
}

function requestIdFor(request: Request) {
  const supplied = request.headers.get('x-request-id')?.trim() || '';
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/.test(supplied) ? supplied : randomUUID();
}

export function serializePublicContent(row: Record<string, unknown>, includeBody = false) {
  const canonicalPath = publicContentHref({
    slug: asString(row.slug),
    canonical_url: asString(row.canonical_url) || null,
    content_type: asString(row.content_type) || null,
  });
  const canonicalUrl = canonicalPath.startsWith('http') ? canonicalPath : `${SITE_URL}${canonicalPath}`;
  const payload: Record<string, unknown> = {
    id: row.id,
    type: row.content_type,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    canonical_url: canonicalUrl,
    language: 'ar',
    audience: asStringArray(row.audience),
    sector_id: row.sector_id ?? null,
    category_id: row.category_id ?? null,
    published_at: row.published_at,
    updated_at: row.updated_at,
    featured_image: row.featured_image_url || null,
    featured_image_alt: row.featured_image_alt || null,
    author: row.author_display_name || null,
    reviewer: row.reviewer_display_name || null,
    reviewer_credentials: row.reviewer_credentials || null,
    last_reviewed_at: row.last_reviewed_at || null,
    primary_keyword: row.primary_keyword || null,
    secondary_keywords: asStringArray(row.secondary_keywords),
    semantic_terms: asStringArray(row.semantic_terms),
    search_intent: row.search_intent || null,
    references: safeReferences(row.references_json),
    rights: rightsFor(row.schema_json),
    schema_json: publicSchema(row.schema_json),
  };
  if (includeBody) {
    payload.body = { structured: row.body_json || {}, text: row.body_text || null };
    payload.medical_disclaimer = row.medical_disclaimer || null;
  }
  return payload;
}

export function parseLimit(request: Request) {
  const raw = Number(new URL(request.url).searchParams.get('limit') || DEFAULT_LIMIT);
  if (!Number.isInteger(raw) || raw < 1) return DEFAULT_LIMIT;
  return Math.min(raw, MAX_LIMIT);
}

export function encodeCursor(cursor: ApiCursor) {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodeCursor(value: string | null): ApiCursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<ApiCursor>;
    if (!parsed.published_at || !parsed.id || Number.isNaN(Date.parse(parsed.published_at))) return null;
    if (!/^[0-9a-f-]{36}$/i.test(parsed.id)) return null;
    return { published_at: parsed.published_at, id: parsed.id };
  } catch { return null; }
}

export function parseIsoDate(value: string | null) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function responseHeaders(requestId: string, cacheControl = 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600') {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Accept,Authorization,Content-Type,If-None-Match,If-Modified-Since,X-API-Key,X-Request-Id',
    'Access-Control-Expose-Headers': 'ETag,Last-Modified,X-Request-Id,X-Rawafid-Partner,X-Rawafid-Key-Prefix,X-RateLimit-Minute-Limit,X-RateLimit-Minute-Remaining,X-RateLimit-Minute-Reset,X-RateLimit-Day-Limit,X-RateLimit-Day-Remaining,X-RateLimit-Day-Reset',
    'Cache-Control': cacheControl,
    'Content-Type': 'application/json; charset=utf-8',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Request-Id': requestId,
    'X-Robots-Tag': 'noindex, nofollow',
  };
}

export function optionsResponse() {
  return new Response(null, { status: 204, headers: responseHeaders(randomUUID(), 'public, max-age=86400') });
}

export function apiError(request: Request, status: number, code: string, message: string, parameter?: string) {
  const requestId = requestIdFor(request);
  return jsonResponse(request, {
    error: { code, message, parameter: parameter || null, request_id: requestId },
    meta: { api_version: PUBLIC_API_VERSION },
  }, { status, requestId, cacheControl: 'no-store' });
}

export function jsonResponse(
  request: Request,
  payload: unknown,
  options: { status?: number; requestId?: string; cacheControl?: string; lastModified?: string | null } = {},
) {
  const requestId = options.requestId || requestIdFor(request);
  const body = JSON.stringify(payload);
  const validatorBody = JSON.stringify(canonicalEtagValue(payload));
  const etag = `\"${createHash('sha256').update(validatorBody).digest('base64url')}\"`;
  const headers = new Headers(responseHeaders(requestId, options.cacheControl));
  headers.set('ETag', etag);
  let lastModifiedMs: number | null = null;
  if (options.lastModified) {
    const parsed = Date.parse(options.lastModified);
    if (!Number.isNaN(parsed)) {
      lastModifiedMs = parsed;
      headers.set('Last-Modified', new Date(parsed).toUTCString());
    }
  }
  if (request.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });
  if (!request.headers.get('if-none-match') && lastModifiedMs !== null) {
    const modifiedSince = Date.parse(request.headers.get('if-modified-since') || '');
    if (!Number.isNaN(modifiedSince) && lastModifiedMs <= modifiedSince + 999) return new Response(null, { status: 304, headers });
  }
  return new Response(body, { status: options.status || 200, headers });
}

export async function listPublicContent(request: Request, forcedType?: string | string[]) {
  const url = new URL(request.url);
  const limit = parseLimit(request);
  const cursorRaw = url.searchParams.get('cursor');
  const cursor = decodeCursor(cursorRaw);
  if (cursorRaw && !cursor) return apiError(request, 400, 'invalid_cursor', 'The cursor is invalid or expired.', 'cursor');

  const requestedType = forcedType || asString(url.searchParams.get('type'));
  const publishedAfterRaw = url.searchParams.get('published_after');
  const updatedAfterRaw = url.searchParams.get('updated_after');
  const publishedAfter = parseIsoDate(publishedAfterRaw);
  const updatedAfter = parseIsoDate(updatedAfterRaw);
  if (publishedAfterRaw && !publishedAfter) return apiError(request, 400, 'invalid_parameter', 'published_after must be an ISO-8601 date.', 'published_after');
  if (updatedAfterRaw && !updatedAfter) return apiError(request, 400, 'invalid_parameter', 'updated_after must be an ISO-8601 date.', 'updated_after');

  const supabase = await createClient();
  let query = supabase
    .from('content')
    .select(CONTENT_FIELDS)
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1);

  if (Array.isArray(requestedType)) query = query.in('content_type', requestedType);
  else if (requestedType) query = query.eq('content_type', requestedType);
  if (publishedAfter) query = query.gte('published_at', publishedAfter);
  if (updatedAfter) query = query.gte('updated_at', updatedAfter);
  if (cursor) query = query.or(`published_at.lt.${cursor.published_at},and(published_at.eq.${cursor.published_at},id.lt.${cursor.id})`);

  const { data, error } = await query;
  if (error) return apiError(request, 503, 'upstream_unavailable', 'The public content catalog is temporarily unavailable.');
  const rows = Array.isArray(data) ? data : [];
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);
  const tail = page.at(-1);
  const nextCursor = hasMore && tail?.published_at && tail?.id ? encodeCursor({ published_at: String(tail.published_at), id: String(tail.id) }) : null;

  return jsonResponse(request, {
    data: page.map((row) => serializePublicContent(row as unknown as Record<string, unknown>, false)),
    pagination: { limit, has_more: hasMore, next_cursor: nextCursor },
    meta: {
      api_version: PUBLIC_API_VERSION,
      generated_at: new Date().toISOString(),
      filters: { type: requestedType || null, published_after: publishedAfter, updated_after: updatedAfter },
    },
  }, { lastModified: page[0]?.updated_at ? String(page[0].updated_at) : null });
}

export async function getPublicContent(request: Request, slug: string, forcedType?: string) {
  if (!/^[a-z0-9][a-z0-9-]{0,199}$/i.test(slug)) return apiError(request, 400, 'invalid_parameter', 'The slug is invalid.', 'slug');
  const supabase = await createClient();
  let query = supabase
    .from('content')
    .select(CONTENT_FIELDS)
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString());
  if (forcedType) query = query.eq('content_type', forcedType);
  const { data, error } = await query.maybeSingle();
  if (error) return apiError(request, 503, 'upstream_unavailable', 'The public content catalog is temporarily unavailable.');
  if (!data) return apiError(request, 404, 'not_found', 'The requested public resource was not found.');
  return jsonResponse(request, {
    data: serializePublicContent(data as unknown as Record<string, unknown>, true),
    meta: { api_version: PUBLIC_API_VERSION, generated_at: new Date().toISOString() },
  }, { lastModified: data.updated_at ? String(data.updated_at) : null });
}

export function apiDiscovery() {
  return {
    name: 'Rawafid Public API',
    version: PUBLIC_API_VERSION,
    status: 'stable',
    canonical_origin: SITE_URL,
    base_url: `${SITE_URL}${PUBLIC_API_BASE}`,
    documentation: `${SITE_URL}/developers`,
    openapi: `${SITE_URL}/api/openapi.json`,
    feeds: { rss: `${SITE_URL}/feed.xml`, magazine_rss: `${SITE_URL}/magazine/feed.xml`, json_feed: `${SITE_URL}/feed.json` },
    principles: ['published-only','read-only','versioned','source-aware','accessibility-conscious','privacy-preserving'],
  };
}
