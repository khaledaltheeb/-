const nativeFetch = globalThis.fetch.bind(globalThis);
const retryableStatuses = new Set([429, 500, 502, 503, 504, 520, 521, 522, 523, 524]);
const attempts = Math.max(1, Math.min(5, Number(process.env.SMOKE_FETCH_ATTEMPTS || 3)));
const timeoutMs = Math.max(3000, Number(process.env.SMOKE_FETCH_TIMEOUT_MS || 20000));
const baseDelayMs = Math.max(50, Number(process.env.SMOKE_FETCH_RETRY_DELAY_MS || 250));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function bufferedFetch(input, init = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await nativeFetch(input, { ...init, signal: controller.signal });
      if (retryableStatuses.has(response.status) && attempt < attempts) {
        clearTimeout(timer);
        await response.body?.cancel().catch(() => {});
        await sleep(baseDelayMs * attempt);
        continue;
      }

      // Buffer the response before returning it to the smoke assertions. This moves
      // transient Next.js/undici stream-closure errors into the retry boundary instead
      // of weakening any status, header, content, or marker assertion downstream.
      let body = null;
      if (![101, 204, 205, 304].includes(response.status) && init.method !== 'HEAD') {
        body = await response.arrayBuffer();
      }
      clearTimeout(timer);
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt >= attempts) throw error;
      await sleep(baseDelayMs * attempt);
    }
  }
  throw lastError || new Error('Smoke fetch failed');
}

globalThis.fetch = bufferedFetch;
