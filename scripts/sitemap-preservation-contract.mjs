import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('SITEMAP PRESERVATION CONTRACT FAILED: Supabase public environment is not configured.');
  process.exit(1);
}

const contentRoute = fs.readFileSync('app/sitemaps/content.xml/route.ts', 'utf8');
const quickInfoRoute = fs.readFileSync('app/sitemaps/quick-info.xml/route.ts', 'utf8');
const indexRoute = fs.readFileSync('app/sitemap.xml/route.ts', 'utf8');
const encyclopediaRoute = fs.readFileSync('app/sitemaps/encyclopedia.xml/route.ts', 'utf8');
const failures = [];
const fail = (message) => failures.push(message);

for (const [label, source] of [['content sitemap', contentRoute], ['sitemap index', indexRoute]]) {
  if (source.includes(".is('schema_json->legacy_migration', null)")) {
    fail(`${label} must not exclude an indexable published page merely because legacy_migration metadata exists`);
  }
  if (source.includes(".not('slug', 'like', 'quick-info-%')")) {
    fail(`${label} must not exclude all quick-info slugs from the no-loss content safety net`);
  }
  for (const marker of [".eq('status', 'published')", ".neq('content_type', 'condition')", ".eq('robots_index', true)"]) {
    if (!source.includes(marker)) fail(`${label} missing coverage marker: ${marker}`);
  }
}

for (const marker of [".eq('content_type', 'condition')", ".eq('status', 'published')", ".eq('robots_index', true)"]) {
  if (!encyclopediaRoute.includes(marker)) fail(`encyclopedia sitemap missing condition coverage marker: ${marker}`);
}
if (!contentRoute.includes('DB_BATCH_SIZE = 1000') || !contentRoute.includes('PAGE_SIZE = 5000')) {
  fail('content sitemap must retain bounded database batching and 5000-URL paging');
}
if (!contentRoute.includes(".order('id', { ascending: true })") || contentRoute.includes(".order('updated_at'")) {
  fail('content sitemap page boundaries must use stable id ordering; updated_at may only feed <lastmod>');
}
if (!quickInfoRoute.includes(".order('id', { ascending: true })") || quickInfoRoute.includes(".order('title'")) {
  fail('quick-info sitemap page boundaries must use stable id ordering so edits cannot move URLs between pages');
}
for (const marker of [
  "'/sitemaps/static.xml'",
  "'/sitemaps/daily-tools.xml'",
  "'/sitemaps/taxonomy.xml'",
  "'/sitemaps/cognitive-lab.xml'",
  "'/sitemaps/specialists.xml'",
  "'/sitemaps/centers.xml'",
  "'/sitemaps/community.xml'",
  '/sitemaps/quick-info.xml?page=${page}',
  '/sitemaps/encyclopedia.xml?page=${page}',
  '/sitemaps/content.xml?page=${page}',
]) {
  if (!indexRoute.includes(marker)) fail(`sitemap index missing child sitemap marker: ${marker}`);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const now = new Date().toISOString();

async function exactCount(configure) {
  let query = supabase.from('content').select('id', { count: 'exact', head: true });
  query = configure(query);
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function fetchConditionSlugs() {
  const rows = [];
  const batchSize = 1000;
  for (let start = 0; start < 10000; start += batchSize) {
    const { data, error } = await supabase
      .from('content')
      .select('slug')
      .eq('status', 'published')
      .eq('content_type', 'condition')
      .eq('robots_index', true)
      .lte('published_at', now)
      .order('id', { ascending: true })
      .range(start, start + batchSize - 1);
    if (error) throw new Error(error.message);
    const batch = Array.isArray(data) ? data : [];
    rows.push(...batch);
    if (batch.length < batchSize) break;
  }
  return rows;
}

async function fetchPublishedCanonicals() {
  const rows = [];
  const batchSize = 1000;
  for (let start = 0; start < 50000; start += batchSize) {
    const { data, error } = await supabase
      .from('content')
      .select('id,slug,canonical_url,updated_at')
      .eq('status', 'published')
      .eq('robots_index', true)
      .lte('published_at', now)
      .order('id', { ascending: true })
      .range(start, start + batchSize - 1);
    if (error) throw new Error(error.message);
    const batch = Array.isArray(data) ? data : [];
    rows.push(...batch);
    if (batch.length < batchSize) break;
  }
  return rows;
}

try {
  const [total, conditions, nonConditions] = await Promise.all([
    exactCount((query) => query.eq('status', 'published').eq('robots_index', true).lte('published_at', now)),
    exactCount((query) => query.eq('status', 'published').eq('robots_index', true).lte('published_at', now).eq('content_type', 'condition')),
    exactCount((query) => query.eq('status', 'published').eq('robots_index', true).lte('published_at', now).neq('content_type', 'condition')),
  ]);

  if (total !== conditions + nonConditions) {
    fail(`indexable published partition mismatch: total=${total}, conditions=${conditions}, nonConditions=${nonConditions}`);
  }

  const conditionRows = await fetchConditionSlugs();
  const invalidConditionSlugs = conditionRows
    .map((row) => typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : '')
    .filter((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug));
  if (invalidConditionSlugs.length) {
    fail(`encyclopedia sitemap would drop ${invalidConditionSlugs.length} indexable condition slug(s): ${invalidConditionSlugs.slice(0, 5).join(', ')}`);
  }

  const publishedRows = await fetchPublishedCanonicals();
  if (publishedRows.length !== total) {
    fail(`published canonical inventory mismatch: fetched=${publishedRows.length}, expected=${total}`);
  }
  const seenCanonicals = new Set();
  for (const row of publishedRows) {
    const canonical = typeof row.canonical_url === 'string' ? row.canonical_url.trim() : '';
    const slug = typeof row.slug === 'string' ? row.slug.trim() : '';
    if (!slug) fail(`published row ${row.id} has no slug`);
    if (!row.updated_at) fail(`published row ${row.id} has no updated_at for trustworthy <lastmod>`);
    if (!canonical) {
      fail(`published row ${row.id} has no canonical_url`);
      continue;
    }
    let parsed;
    try {
      parsed = new URL(canonical, 'https://healthrenewal.org');
    } catch {
      fail(`published row ${row.id} has malformed canonical_url: ${canonical}`);
      continue;
    }
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'healthrenewal.org' || parsed.search || parsed.hash) {
      fail(`published row ${row.id} has non-production canonical_url: ${canonical}`);
    }
    const normalized = parsed.href;
    if (seenCanonicals.has(normalized)) fail(`duplicate published canonical_url: ${canonical}`);
    seenCanonicals.add(normalized);
  }

  if (failures.length) {
    for (const message of failures) console.error(`SITEMAP PRESERVATION CONTRACT FAILED: ${message}`);
    process.exit(1);
  }

  console.log(`Sitemap preservation contract passed: ${total} indexable published DB pages = ${nonConditions} content-sitemap pages + ${conditions} encyclopedia conditions; canonical URLs are unique production HTTPS URLs with updated_at, and paginated sitemap boundaries are stable.`);
} catch (error) {
  console.error(`SITEMAP PRESERVATION CONTRACT FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
