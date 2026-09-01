export class ExternalServiceError extends Error {
  readonly provider: string;
  readonly status: number | null;
  readonly retryable: boolean;

  constructor(provider: string, message: string, status: number | null, retryable: boolean) {
    super(message);
    this.name = 'ExternalServiceError';
    this.provider = provider;
    this.status = status;
    this.retryable = retryable;
  }
}

type RequestOptions = {
  provider: string;
  url: string;
  init?: RequestInit;
  attempts?: number;
  timeout_ms?: number;
};

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function retryDelayMs(response: Response | null, attempt: number) {
  const retryAfter = response?.headers.get('retry-after')?.trim();
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.min(5_000, Math.max(0, seconds * 1_000));
    const timestamp = Date.parse(retryAfter);
    if (!Number.isNaN(timestamp)) return Math.min(5_000, Math.max(0, timestamp - Date.now()));
  }
  const base = Math.min(2_000, 250 * (2 ** attempt));
  return base + Math.floor(Math.random() * 150);
}

async function request({ provider, url, init, attempts = 3, timeout_ms = 12_000 }: RequestOptions) {
  const totalAttempts = Math.max(1, Math.min(5, attempts));
  for (let attempt = 0; attempt < totalAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout_ms);
    let response: Response | null = null;
    try {
      response = await fetch(url, { ...init, signal: controller.signal });
      if (!response.ok) {
        const retryable = RETRYABLE_STATUS.has(response.status);
        if (retryable && attempt + 1 < totalAttempts) {
          await sleep(retryDelayMs(response, attempt));
          continue;
        }
        throw new ExternalServiceError(provider, `${provider} returned HTTP ${response.status}.`, response.status, retryable);
      }
      return response;
    } catch (error) {
      if (error instanceof ExternalServiceError) throw error;
      if (attempt + 1 < totalAttempts) {
        await sleep(retryDelayMs(response, attempt));
        continue;
      }
      const aborted = error instanceof DOMException && error.name === 'AbortError';
      throw new ExternalServiceError(provider, aborted ? `${provider} request timed out.` : `${provider} request failed.`, null, true);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new ExternalServiceError(provider, `Unable to reach ${provider}.`, null, true);
}

export async function requestJson<T>(options: RequestOptions): Promise<T> {
  const response = await request(options);
  return await response.json() as T;
}

export async function requestText(options: RequestOptions): Promise<string> {
  const response = await request(options);
  return response.text();
}

export async function requestArrayBuffer(options: RequestOptions): Promise<ArrayBuffer> {
  const response = await request(options);
  return response.arrayBuffer();
}
