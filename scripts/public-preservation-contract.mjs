import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('PUBLIC PRESERVATION CONTRACT FAILED: Supabase public environment is not configured.');
  process.exit(1);
}

const baseline = {
  publicSectors: 9,
  publicCategories: 126,
  publishedContent: 3642,
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

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const now = new Date().toISOString();
const failures = [];
const fail = (message) => failures.push(message);
const RETRY_ATTEMPTS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientSupabaseError(error) {
  if (!error) return false;
  const code = String(error.code ?? '').toUpperCase();
  const message = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase();
  if (code === '57014') return true;
  return /timeout|timed out|fetch failed|network|connection|econn|socket|429|502|503|504|temporarily unavailable|upstream/.test(message);
}

async function withTransientRetry(label, operation) {
  let lastError;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      const result = await operation();
      if (!result?.error) return result;
      lastError = result.error;
      if (!isTransientSupabaseError(result.error) || attempt === RETRY_ATTEMPTS) return result;
    } catch (error) {
      lastError = error;
      if (!isTransientSupabaseError(error) || attempt === RETRY_ATTEMPTS) throw error;
    }
    console.warn(`PUBLIC PRESERVATION CONTRACT: transient ${label} failure; retry ${attempt}/${RETRY_ATTEMPTS}`);
    await sleep(300 * attempt);
  }
  throw lastError ?? new Error(`${label}: exhausted retries`);
}

async function exactCount(table, configure) {
  const result = await withTransientRetry(`${table} count`, async () => {
    let query = supabase.from(table).select('id', { count: 'exact', head: true });
    query = configure(query);
    return await query;
  });
  if (result.error) throw new Error(`${table}: ${result.error.message}`);
  return result.count ?? 0;
}

async function loadPublicSectors() {
  const result = await withTransientRetry('public sectors', async () => (
    await supabase.from('sectors').select('slug').eq('is_active', true).eq('visibility', 'public').limit(100)
  ));
  if (result.error) throw new Error(`sectors: ${result.error.message}`);
  return result.data ?? [];
}

async function runCriticalSearch(test) {
  const result = await withTransientRetry(`search «${test.query}»`, async () => (
    await supabase.rpc('search_platform', { p_query: test.query, p_limit: 5 })
  ));
  if (result.error) return { data: null, error: result.error };
  return { data: result.data ?? [], error: null };
}

try {
  const [publicSectors, publicCategories, publishedContent, sectorRows] = await Promise.all([
    exactCount('sectors', (query) => query.eq('is_active', true).eq('visibility', 'public')),
    exactCount('categories', (query) => query.eq('is_active', true).eq('visibility', 'public')),
    exactCount('content', (query) => query.eq('status', 'published').lte('published_at', now)),
    loadPublicSectors(),
  ]);

  if (publicSectors < baseline.publicSectors) fail(`public sectors decreased: ${publicSectors} < ${baseline.publicSectors}`);
  if (publicCategories < baseline.publicCategories) fail(`public categories decreased: ${publicCategories} < ${baseline.publicCategories}`);
  if (publishedContent < baseline.publishedContent) fail(`published content decreased: ${publishedContent} < ${baseline.publishedContent}`);

  const sectorSlugs = new Set(sectorRows.map((row) => row.slug));
  for (const slug of requiredSectorSlugs) {
    if (!sectorSlugs.has(slug)) fail(`required public sector disappeared: ${slug}`);
  }

  const criticalSearches = [
    { query: 'سرطان الأطفال', expectedType: 'sector', expectedDestination: '/sectors/pediatric-oncology' },
    { query: 'الصحة النفسية', expectedType: 'sector', expectedDestination: '/sectors/mental-health' },
    { query: 'الإدمان والتعافي', expectedType: 'sector', expectedDestination: '/sectors/addiction-recovery' },
  ];

  for (const test of criticalSearches) {
    const { data, error } = await runCriticalSearch(test);
    if (error) {
      fail(`search failed for «${test.query}»: ${error.message}`);
      continue;
    }
    const first = data?.[0];
    if (!first || first.entity_type !== test.expectedType || first.destination !== test.expectedDestination) {
      fail(`search regression for «${test.query}»: expected ${test.expectedDestination} first`);
    }
  }

  if (failures.length) {
    for (const message of failures) console.error(`PUBLIC PRESERVATION CONTRACT FAILED: ${message}`);
    process.exit(1);
  }

  console.log(`Public preservation contract passed: ${publicSectors} sectors, ${publicCategories} categories, ${publishedContent} published pages.`);
} catch (error) {
  console.error(`PUBLIC PRESERVATION CONTRACT FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
