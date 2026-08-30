import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('PUBLIC PRESERVATION CONTRACT FAILED: Supabase public environment is not configured.');
  process.exit(1);
}

// Monotonic no-loss baseline captured after the 2026-08-24 visibility-preservation guard.
// These are minimums only: new publishing may increase them, but existing public inventory must not fall below them.
const baseline = {
  publicSectors: 9,
  publicCategories: 126,
  publishedContent: 3752,
  indexablePublishedContent: 3519,
};

const requiredSectorSlugs = [
  'knowledge',
  'pediatric-oncology',
  'special-needs-inclusion',
  'mental-health',
  'capabilities',
  'child-family-education',
  'trainees-volunteers',
  'short-encyclopedia',
  'addiction-recovery',
];

const REQUEST_TIMEOUT_MS = 15_000;
const RETRY_DELAYS_MS = [1_500, 3_000, 6_000, 12_000];

function describeError(error) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message || '(no message)'}`;
  }
  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

async function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController();
  const upstreamSignal = init.signal;
  const forwardAbort = () => controller.abort(upstreamSignal?.reason);
  const timeout = setTimeout(() => {
    controller.abort(new Error(`Supabase request exceeded ${REQUEST_TIMEOUT_MS}ms`));
  }, REQUEST_TIMEOUT_MS);

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      forwardAbort();
    } else {
      upstreamSignal.addEventListener('abort', forwardAbort, { once: true });
    }
  }

  try {
    return await globalThis.fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
    if (upstreamSignal) upstreamSignal.removeEventListener('abort', forwardAbort);
  }
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: fetchWithTimeout },
});

const now = new Date().toISOString();
const failures = [];
const fail = (message) => failures.push(message);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(label, task, attempts = RETRY_DELAYS_MS.length + 1) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delayMs = RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)];
      console.warn(
        `PUBLIC PRESERVATION CONTRACT RETRY: ${label} failed on attempt ${attempt}: ${describeError(error)}; retrying in ${delayMs}ms.`,
      );
      await sleep(delayMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`${label}: transient check failed: ${describeError(lastError)}`);
}

async function exactCount(table, configure) {
  return withRetry(`${table} count`, async () => {
    let query = supabase.from(table).select('id', { count: 'exact', head: true });
    query = configure(query);
    const { count, error } = await query;
    if (error) throw new Error(`${table}: ${error.message || describeError(error)}`);
    return count ?? 0;
  });
}

try {
  // Keep preservation checks sequential: this is a safety gate, not a load test.
  const publicSectors = await exactCount('sectors', (query) => query.eq('is_active', true).eq('visibility', 'public'));
  const publicCategories = await exactCount('categories', (query) => query.eq('is_active', true).eq('visibility', 'public'));
  const publishedContent = await exactCount('content', (query) => query.eq('status', 'published').lte('published_at', now));
  const indexablePublishedContent = await exactCount('content', (query) => query.eq('status', 'published').lte('published_at', now).eq('robots_index', true));
  const sectorRows = await withRetry('public sector list', async () => {
    const result = await supabase.from('sectors').select('slug').eq('is_active', true).eq('visibility', 'public').limit(100);
    if (result.error) throw new Error(`sectors: ${result.error.message || describeError(result.error)}`);
    return result.data ?? [];
  });

  if (publicSectors < baseline.publicSectors) fail(`public sectors decreased: ${publicSectors} < ${baseline.publicSectors}`);
  if (publicCategories < baseline.publicCategories) fail(`public categories decreased: ${publicCategories} < ${baseline.publicCategories}`);
  if (publishedContent < baseline.publishedContent) fail(`published content decreased: ${publishedContent} < ${baseline.publishedContent}`);
  if (indexablePublishedContent < baseline.indexablePublishedContent) fail(`indexable published content decreased: ${indexablePublishedContent} < ${baseline.indexablePublishedContent}`);

  const sectorSlugs = new Set(sectorRows.map((row) => row.slug));
  for (const slug of requiredSectorSlugs) {
    if (!sectorSlugs.has(slug)) fail(`required public sector disappeared: ${slug}`);
  }

  const criticalSearches = [
    { query: 'سرطان الأطفال', expectedType: 'sector', expectedDestination: '/sectors/pediatric-oncology' },
    { query: 'الصحة النفسية', expectedType: 'sector', expectedDestination: '/sectors/mental-health' },
    { query: 'الإدمان والتعافي', expectedType: 'sector', expectedDestination: '/sectors/addiction-recovery' },
    { query: 'ذوو الاحتياجات الخاصة', expectedType: 'sector', expectedDestination: '/sectors/special-needs-inclusion' },
    { query: 'القلق الاجتماعي', expectedType: 'content', expectedDestination: '/content/legacy-psychology-social-anxiety' },
  ];

  for (const test of criticalSearches) {
    try {
      const data = await withRetry(`search «${test.query}»`, async () => {
        const result = await supabase.rpc('search_platform', { p_query: test.query, p_limit: 5 });
        if (result.error) throw new Error(result.error.message || describeError(result.error));
        return result.data ?? [];
      });
      const first = data[0];
      if (!first || first.entity_type !== test.expectedType || first.destination !== test.expectedDestination) {
        fail(`search regression for «${test.query}»: expected ${test.expectedDestination} first`);
      }
    } catch (error) {
      fail(`search failed for «${test.query}»: ${describeError(error)}`);
    }
  }

  if (failures.length) {
    for (const message of failures) console.error(`PUBLIC PRESERVATION CONTRACT FAILED: ${message}`);
    process.exit(1);
  }

  console.log(`Public preservation contract passed: ${publicSectors} sectors, ${publicCategories} categories, ${publishedContent} published pages, ${indexablePublishedContent} indexable published pages.`);
} catch (error) {
  console.error(`PUBLIC PRESERVATION CONTRACT FAILED: ${describeError(error)}`);
  process.exit(1);
}
