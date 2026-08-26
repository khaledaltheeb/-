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
const dailyToolsRoute = fs.readFileSync('app/sitemaps/daily-tools.xml/route.ts', 'utf8');
const dailyToolRoutes = JSON.parse(fs.readFileSync('generated/daily-tools-routes.json', 'utf8'));
const indexRoute = fs.readFileSync('app/sitemap.xml/route.ts', 'utf8');
const encyclopediaRoute = fs.readFileSync('app/sitemaps/encyclopedia.xml/route.ts', 'utf8');
const staticRoute = fs.readFileSync('app/sitemaps/static.xml/route.ts', 'utf8');
const atlasRoute = fs.readFileSync('app/sitemaps/addiction-atlas.xml/route.ts', 'utf8');
const failures = [];
const fail = (message) => failures.push(message);

function normalizePath(value) {
  try {
    const parsed = new URL(String(value || ''), 'https://healthrenewal.org');
    let path = parsed.pathname || '/';
    if (path !== '/' && !path.endsWith('/')) path += '/';
    return path;
  } catch {
    return '';
  }
}

const normalizedDailyToolRoutes = Array.isArray(dailyToolRoutes) ? dailyToolRoutes.map(normalizePath) : [];
const dailyToolRouteSet = new Set(normalizedDailyToolRoutes);
if (!Array.isArray(dailyToolRoutes) || dailyToolRoutes.length !== 151) {
  fail(`Daily Tools sitemap manifest must contain exactly 151 routes, found ${Array.isArray(dailyToolRoutes) ? dailyToolRoutes.length : 'invalid manifest'}`);
}
if (normalizedDailyToolRoutes[0] !== '/daily-tools/') {
  fail('Daily Tools sitemap manifest must begin with /daily-tools/');
}
if (dailyToolRouteSet.size !== normalizedDailyToolRoutes.length) {
  fail('Daily Tools sitemap manifest contains duplicate canonical routes');
}
if (!dailyToolsRoute.includes('EXPECTED_ROUTES = 151') || !dailyToolsRoute.includes("dailyToolRoutes[0] !== '/daily-tools/'")) {
  fail('Daily Tools sitemap route must retain its immutable 151-route integrity guard');
}

for (const [label, source] of [['content sitemap', contentRoute], ['sitemap index', indexRoute]]) {
  if (source.includes(".is('schema_json->legacy_migration', null)")) {
    fail(`${label} must not exclude an indexable published page merely because legacy_migration metadata exists`);
  }
  for (const marker of [".eq('status', 'published')", ".neq('content_type', 'condition')", ".eq('robots_index', true)"]) {
    if (!source.includes(marker)) fail(`${label} missing coverage marker: ${marker}`);
  }
  for (const marker of [
    ".not('canonical_url', 'like', '/quick-info/%')",
    ".not('canonical_url', 'like', '/daily-tools/%')",
    ".not('canonical_url', 'like', '/addiction/substances/%')",
    ".not('canonical_url', 'like', '/addiction/compare/%')",
    "'/addiction/methodology/'",
  ]) {
    if (!source.includes(marker)) fail(`${label} missing exclusive ownership filter: ${marker}`);
  }
  if (source.includes(".not('slug', 'like', 'quick-info-%')")) {
    fail(`${label} must partition Quick Info by canonical ownership, not by an internal slug prefix`);
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
  "'/sitemaps/addiction-atlas.xml'",
  "'/sitemaps/specialists.xml'",
  "'/sitemaps/centers.xml'",
  "'/sitemaps/community.xml'",
  '/sitemaps/quick-info.xml?page=${page}',
  '/sitemaps/encyclopedia.xml?page=${page}',
  '/sitemaps/content.xml?page=${page}',
]) {
  if (!indexRoute.includes(marker)) fail(`sitemap index missing child sitemap marker: ${marker}`);
}

for (const duplicateHub of [
  "path:'/quick-info/'",
  "path:'/encyclopedia/'",
  "path:'/care-guides/'",
  "path:'/evidence-guides/'",
  "path:'/specialists'",
  "path:'/centers'",
  "path:'/cognitive-lab'",
  "path:'/community'",
]) {
  if (staticRoute.includes(duplicateHub)) fail(`static sitemap must not duplicate child/content-owned canonical: ${duplicateHub}`);
}
if (!atlasRoute.includes("path: '/addiction/methodology/'")) {
  fail('addiction atlas sitemap must own /addiction/methodology/ before content sitemap excludes it');
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
      .select('id,slug,content_type,canonical_url,updated_at,schema_json')
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

function quickInfoOwned(row) {
  const canonical = typeof row.canonical_url === 'string' ? row.canonical_url.trim() : '';
  if (!canonical.startsWith('/quick-info/')) return false;
  const slug = typeof row.slug === 'string' ? row.slug.trim() : '';
  const routeSlug = slug.startsWith('quick-info-') ? slug.slice('quick-info-'.length) : '';
  const schema = row.schema_json && typeof row.schema_json === 'object' && !Array.isArray(row.schema_json) ? row.schema_json : null;
  const eligible = /^[a-z0-9][a-z0-9-]*$/.test(routeSlug)
    && normalizePath(canonical) === normalizePath(`/quick-info/${routeSlug}/`)
    && schema?.page_role === 'quick-info'
    && schema?.publication_ready === true
    && schema?.editorial_review_required === false;
  if (!eligible) fail(`indexable canonical Quick Info row ${row.id} is excluded from content sitemap but is not eligible for its dedicated sitemap`);
  return true;
}

function dailyToolsOwned(row) {
  const canonical = typeof row.canonical_url === 'string' ? row.canonical_url.trim() : '';
  if (!canonical.startsWith('/daily-tools/')) return false;
  const normalized = normalizePath(canonical);
  if (!normalized || !dailyToolRouteSet.has(normalized)) {
    fail(`indexable Daily Tools canonical ${canonical || row.id} is excluded from content sitemap but absent from immutable Daily Tools sitemap`);
  }
  return true;
}

function atlasOwned(row) {
  const canonical = typeof row.canonical_url === 'string' ? row.canonical_url.trim() : '';
  return canonical === '/addiction/methodology/'
    || canonical === '/addiction/substances/'
    || canonical === '/addiction/compare/'
    || canonical === '/addiction/interactions/'
    || canonical === '/addiction/prevalence/'
    || canonical === '/addiction/mortality/'
    || canonical.startsWith('/addiction/substances/')
    || canonical.startsWith('/addiction/compare/');
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
  let dedicatedOwned = 0;
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

    if (row.content_type !== 'condition' && (quickInfoOwned(row) || dailyToolsOwned(row) || atlasOwned(row))) {
      dedicatedOwned += 1;
    }
  }

  const contentOwned = nonConditions - dedicatedOwned;
  if (contentOwned < 0) fail(`negative content-owned sitemap partition: ${contentOwned}`);

  if (failures.length) {
    for (const message of failures) console.error(`SITEMAP PRESERVATION CONTRACT FAILED: ${message}`);
    process.exit(1);
  }

  console.log(`Sitemap preservation contract passed: ${total} indexable published DB pages = ${conditions} encyclopedia conditions + ${dedicatedOwned} dedicated-map DB pages + ${contentOwned} content-sitemap safety-net pages; canonical URLs are unique production HTTPS URLs with updated_at, and paginated sitemap boundaries are stable.`);
} catch (error) {
  console.error(`SITEMAP PRESERVATION CONTRACT FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
