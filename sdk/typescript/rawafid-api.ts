export type RawafidClientOptions = {
  baseUrl?: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
  userAgent?: string;
};

export type RawafidErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    parameter?: string | null;
    request_id?: string;
  };
};

export class RawafidApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly parameter?: string | null;
  readonly requestId?: string;
  readonly retryAfter?: number;

  constructor(message: string, options: {
    status: number;
    code?: string;
    parameter?: string | null;
    requestId?: string;
    retryAfter?: number;
  }) {
    super(message);
    this.name = 'RawafidApiError';
    this.status = options.status;
    this.code = options.code;
    this.parameter = options.parameter;
    this.requestId = options.requestId;
    this.retryAfter = options.retryAfter;
  }
}

export type ListOptions = {
  limit?: number;
  cursor?: string;
  type?: string;
  publishedAfter?: string;
  updatedAfter?: string;
};

export type SourceListOptions = {
  limit?: number;
  offset?: number;
  publisher?: string;
  type?: string;
  q?: string;
};

export type ChangesOptions = {
  since: string;
  limit?: number;
};

export type SearchOptions = {
  q: string;
  type?: string;
  limit?: number;
};

function append(params: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return;
  params.set(key, String(value));
}

export class RawafidClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly userAgent?: string;

  constructor(options: RawafidClientOptions = {}) {
    this.baseUrl = (options.baseUrl || 'https://healthrenewal.org/api/v1').replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl || fetch;
    this.userAgent = options.userAgent;
  }

  private async request<T>(path: string, query?: URLSearchParams): Promise<T> {
    const url = new URL(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    if (query) url.search = query.toString();

    const headers = new Headers({ Accept: 'application/json' });
    if (this.apiKey) headers.set('X-API-Key', this.apiKey);
    if (this.userAgent && typeof window === 'undefined') headers.set('User-Agent', this.userAgent);

    const response = await this.fetchImpl(url, { method: 'GET', headers });
    if (response.ok) return response.json() as Promise<T>;

    let payload: RawafidErrorPayload = {};
    try { payload = await response.json() as RawafidErrorPayload; } catch { /* non-JSON upstream failure */ }
    const retryAfterRaw = response.headers.get('retry-after');
    const retryAfter = retryAfterRaw && /^\d+$/.test(retryAfterRaw) ? Number(retryAfterRaw) : undefined;
    throw new RawafidApiError(
      payload.error?.message || `Rawafid API request failed with HTTP ${response.status}`,
      {
        status: response.status,
        code: payload.error?.code,
        parameter: payload.error?.parameter,
        requestId: payload.error?.request_id || response.headers.get('x-request-id') || undefined,
        retryAfter,
      },
    );
  }

  discovery<T = unknown>() { return this.request<T>('/'); }
  stats<T = unknown>() { return this.request<T>('/stats'); }

  listContent<T = unknown>(options: ListOptions = {}) {
    const q = new URLSearchParams();
    append(q, 'limit', options.limit);
    append(q, 'cursor', options.cursor);
    append(q, 'type', options.type);
    append(q, 'published_after', options.publishedAfter);
    append(q, 'updated_after', options.updatedAfter);
    return this.request<T>('/content', q);
  }

  content<T = unknown>(slug: string) {
    return this.request<T>(`/content/${encodeURIComponent(slug)}`);
  }

  contentSources<T = unknown>(slug: string) {
    return this.request<T>(`/content/${encodeURIComponent(slug)}/sources`);
  }

  listResource<T = unknown>(resource: string, options: ListOptions = {}) {
    const q = new URLSearchParams();
    append(q, 'limit', options.limit);
    append(q, 'cursor', options.cursor);
    append(q, 'published_after', options.publishedAfter);
    append(q, 'updated_after', options.updatedAfter);
    return this.request<T>(`/${encodeURIComponent(resource)}`, q);
  }

  search<T = unknown>(options: SearchOptions) {
    const q = new URLSearchParams();
    append(q, 'q', options.q);
    append(q, 'type', options.type);
    append(q, 'limit', options.limit);
    return this.request<T>('/search', q);
  }

  changes<T = unknown>(options: ChangesOptions) {
    const q = new URLSearchParams();
    append(q, 'since', options.since);
    append(q, 'limit', options.limit);
    return this.request<T>('/changes', q);
  }

  sources<T = unknown>(options: SourceListOptions = {}) {
    const q = new URLSearchParams();
    append(q, 'limit', options.limit);
    append(q, 'offset', options.offset);
    append(q, 'publisher', options.publisher);
    append(q, 'type', options.type);
    append(q, 'q', options.q);
    return this.request<T>('/sources', q);
  }

  source<T = unknown>(id: string) {
    return this.request<T>(`/sources/${encodeURIComponent(id)}`);
  }
}
