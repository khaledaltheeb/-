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
  publishedContent: 3660,
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

async function exactCount(table, configure) {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });
  query = configure(query);
  const { count, error } = await query;
  if (error) throw new Error(`${table}: ${error.message}`);
  return count ?? 0;
}

try {
  const [publicSectors, publicCategories, publishedContent, sectorRows] = await Promise.all([
    exactCount('sectors', (query) => query.eq('is_active', true).eq('visibility', 'public')),
    exactCount('categories', (query) => query.eq('is_active', true).eq('visibility', 'public')),
    exactCount('content', (query) => query.eq('status', 'published').lte('published_at', now)),
    supabase.from('sectors').select('slug').eq('is_active', true).eq('visibility', 'public').limit(100),
  ]);

  if (sectorRows.error) throw new Error(`sectors: ${sectorRows.error.message}`);

  if (publicSectors < baseline.publicSectors) fail(`public sectors decreased: ${publicSectors} < ${baseline.publicSectors}`);
  if (publicCategories < baseline.publicCategories) fail(`public categories decreased: ${publicCategories} < ${baseline.publicCategories}`);
  if (publishedContent < baseline.publishedContent) fail(`published content decreased: ${publishedContent} < ${baseline.publishedContent}`);

  const sectorSlugs = new Set((sectorRows.data ?? []).map((row) => row.slug));
  for (const slug of requiredSectorSlugs) {
    if (!sectorSlugs.has(slug)) fail(`required public sector disappeared: ${slug}`);
  }

  const criticalSearches = [
    { query: 'سرطان الأطفال', expectedType: 'sector', expectedDestination: '/sectors/pediatric-oncology' },
    { query: 'الصحة النفسية', expectedType: 'sector', expectedDestination: '/sectors/mental-health' },
    { query: 'الإدمان والتعافي', expectedType: 'sector', expectedDestination: '/sectors/addiction-recovery' },
  ];

  for (const test of criticalSearches) {
    const { data, error } = await supabase.rpc('search_platform', { p_query: test.query, p_limit: 5 });
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
