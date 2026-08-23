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

const FETCH_TIMEOUT_MS = 15000;
const fetchWithTimeout = (input, init = {}) => fetch(input, {
  ...init,
  signal: init.signal || AbortSignal.timeout(FETCH_TIMEOUT_MS),
});

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: fetchWithTimeout },
});

const now = new Date().toISOString();
const failures = [];
const fail = (message) => failures.push(message);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function errorMessage(error) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object') {
    const values = ['message', 'details', 'hint', 'code']
      .map((key) => error[key])
      .filter((value) => typeof value === 'string' && value.trim());
    if (values.length) return values.join(' | ');
    try { return JSON.stringify(error); } catch { /* ignore */ }
  }
  return String(error || 'unknown error');
}

async function withRetry(label, task, attempts = 5) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delayMs = Math.min(6000, 750 * (2 ** (attempt - 1)));
      console.warn(`PUBLIC PRESERVATION CONTRACT RETRY: ${label} failed on attempt ${attempt}: ${errorMessage(error)}; retrying in ${delayMs}ms.`);
      await sleep(delayMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`${label}: ${errorMessage(lastError)}`);
}

async function countByRows(table, configure) {
  const batchSize = 1000;
  let total = 0;
  for (let start = 0; start < 50000; start += batchSize) {
    const batch = await withRetry(`${table} paged count rows ${start}-${start + batchSize - 1}`, async () => {
      let query = supabase.from(table).select('id');
      query = configure(query);
      const { data, error } = await query.order('id', { ascending: true }).range(start, start + batchSize - 1);
      if (error) throw new Error(`${table}: ${errorMessage(error)}`);
      if (!Array.isArray(data)) throw new Error(`${table}: paged count returned no data array`);
      return data;
    });
    total += batch.length;
    if (batch.length < batchSize) return total;
  }
  throw new Error(`${table}: paged count exceeded the 50000-row safety bound`);
}

async function exactCount(table, configure) {
  try {
    return await withRetry(`${table} exact count`, async () => {
      let query = supabase.from(table).select('id', { count: 'exact', head: true });
      query = configure(query);
      const { count, error } = await query;
      if (error) throw new Error(`${table}: ${errorMessage(error)}`);
      if (typeof count !== 'number') throw new Error(`${table}: exact count was unavailable`);
      return count;
    }, 2);
  } catch (error) {
    // Do not convert a transient HEAD/count failure into zero. Fall back to paged row reads,
    // which independently verifies the same filtered inventory before applying the no-loss floor.
    console.warn(`PUBLIC PRESERVATION CONTRACT FALLBACK: ${table} exact count unavailable (${errorMessage(error)}); verifying by paged row reads.`);
    return countByRows(table, configure);
  }
}

try {
  // Keep preservation checks sequential: this is a safety gate, not a load test.
  const publicSectors = await exactCount('sectors', (query) => query.eq('is_active', true).eq('visibility', 'public'));
  const publicCategories = await exactCount('categories', (query) => query.eq('is_active', true).eq('visibility', 'public'));
  const publishedContent = await exactCount('content', (query) => query.eq('status', 'published').lte('published_at', now));
  const indexablePublishedContent = await exactCount('content', (query) => query.eq('status', 'published').lte('published_at', now).eq('robots_index', true));
  const sectorRows = await withRetry('public sector list', async () => {
    const result = await supabase.from('sectors').select('slug').eq('is_active', true).eq('visibility', 'public').limit(100);
    if (result.error) throw new Error(`sectors: ${errorMessage(result.error)}`);
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
        if (result.error) throw new Error(errorMessage(result.error));
        return result.data ?? [];
      });
      const first = data[0];
      if (!first || first.entity_type !== test.expectedType || first.destination !== test.expectedDestination) {
        fail(`search regression for «${test.query}»: expected ${test.expectedDestination} first`);
      }
    } catch (error) {
      fail(`search failed for «${test.query}»: ${errorMessage(error)}`);
    }
  }

  if (failures.length) {
    for (const message of failures) console.error(`PUBLIC PRESERVATION CONTRACT FAILED: ${message}`);
    process.exit(1);
  }

  console.log(`Public preservation contract passed: ${publicSectors} sectors, ${publicCategories} categories, ${publishedContent} published pages, ${indexablePublishedContent} indexable published pages.`);
} catch (error) {
  console.error(`PUBLIC PRESERVATION CONTRACT FAILED: ${errorMessage(error)}`);
  process.exit(1);
}
