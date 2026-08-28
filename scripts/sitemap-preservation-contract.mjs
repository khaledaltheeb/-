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
const dailyToolsSource = JSON.parse(fs.readFileSync('data/legacy-production-batches/daily-tools/001.json', 'utf8'));
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

function dailyToolSourcePathToRoute(sourcePath) {
  if (sourcePath === 'daily-tools/index.html') return '/daily-tools/';
  const match = /^daily-tools\/([a-z0-9][a-z0-9-]{0,119})\/index\.html$/i.exec(sourcePath);
  return match ? `/daily-tools/${match[1].toLowerCase()}/` : null;
}

const dailyToolSourceRecords = Array.isArray(dailyToolsSource?.records) ? dailyToolsSource.records : [];
const normalizedDailyToolRoutes = dailyToolSourceRecords
  .map((record) => typeof record?.source_path === 'string' ? dailyToolSourcePathToRoute(record.source_path.trim()) : null)
  .filter(Boolean)
  .map(normalizePath);
const dailyToolRouteSet = new Set(normalizedDailyToolRoutes);
if (normalizedDailyToolRoutes.length !== 151) {
  fail(`Daily Tools source corpus must resolve to exactly 151 routes, found ${normalizedDailyToolRoutes.length}`);
}
if (!dailyToolRouteSet.has('/daily-tools/')) fail('Daily Tools source corpus must contain /daily-tools/');
if (dailyToolRouteSet.size !== normalizedDailyToolRoutes.length) fail('Daily Tools source corpus contains duplicate public routes');
if (!dailyToolsRoute.includes('EXPECTED_ROUTES = 151') || !dailyToolsRoute.includes("dailyToolRoutes[0] !== '/daily-tools/'")) {
  fail('Daily Tools sitemap route must retain its immutable 151-route integrity guard');
}

for (const [label, source] of [['content sitemap', contentRoute], ['sitemap index', indexRoute]]) {
  if (source.includes(".is('schema_json->legacy_migration', null)")) {
    fail(`${label} must not exclude an indexable published page merely because legacy_migration metadata exists`);
  }
  for (const marker of [".eq('status', 'published')", ".eq('robots_index', true)"]) {
    if (!source.includes(marker)) fail(`${label} missing coverage marker: ${marker}`);
  }
  for (const marker of [
    ".not('canonical_url', 'like', '/encyclopedia/%')",
    ".not('canonical_url', 'like', '/quick-info/%')",
    ".not('canonical_url', 'like', '/daily-tools/%')",
    ".not('canonical_url', 'like', '/addiction/substances/%')",
    ".not('canonical_url', 'like', '/addiction/compare/%')",
    "'/addiction/methodology/'",
  ]) {
    if (!source.includes(marker)) fail(`${label} missing exclusive ownership filter: ${marker}`);
  }
  if (source.includes(".neq('content_type', 'condition')")) {
    fail(`${label} must partition encyclopedia ownership by canonical namespace, not content_type`);
  }
  if (source.includes(".not('slug', 'like', 'quick-info-%')")) {
    fail(`${label} must partition Quick Info by canonical ownership, not by an internal slug prefix`);
  }
}

for (const marker of [
  ".in('content_type', ['glossary_term', 'condition'])",
  ".like('canonical_url', '/encyclopedia/%')",
  ".eq('status', 'published')",
  ".eq('robots_index', true)",
]) {
  if (!encyclopediaRoute.includes(marker)) fail(`encyclopedia sitemap missing canonical ownership marker: ${marker}`);
}
if (encyclopediaRoute.includes(".eq('content_type', 'condition')")) {
  fail('encyclopedia sitemap must not claim every condition regardless of its canonical namespace');
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
const nowMs = Date.now();
const nowIso = new Date(nowMs).toISOString();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(label, task, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delayMs = 500 * attempt;
      console.warn(`SITEMAP PRESERVATION RETRY: ${label} failed on attempt ${attempt}; retrying in ${delayMs}ms.`);
      await sleep(delayMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`${label}: transient database check failed`);
}

async function fetchQuickInfoSchemaById(ids) {
  const schemaById = new Map();
  const batchSize = 100;

  for (let start = 0; start < ids.length; start += batchSize) {
    const idBatch = ids.slice(start, start + batchSize);
    const batch = await withRetry(`quick-info schema batch ${start / batchSize + 1}`, async () => {
      const { data, error } = await supabase
        .from('content')
        .select('id,schema_json')
        .in('id', idBatch)
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    });
    for (const row of batch) schemaById.set(row.id, row.schema_json ?? null);
  }

  return schemaById;
}

async function fetchIndexablePublishedInventory() {
  const rows = [];
  const batchSize = 500;
  let lastId = null;

  // Keyset pagination preserves the same stable id ordering used by the sitemap
  // while avoiding increasingly expensive OFFSET scans. Keep the main inventory
  // deliberately narrow: schema_json is large and only Quick Info eligibility
  // needs it, so that metadata is fetched separately for those canonical rows.
  for (let batchNumber = 1; batchNumber <= 100; batchNumber += 1) {
    const batch = await withRetry(`content inventory batch ${batchNumber}`, async () => {
      let query = supabase
        .from('content')
        .select('id,slug,content_type,canonical_url,published_at,updated_at')
        .eq('status', 'published')
        .eq('robots_index', true)
        .lte('published_at', nowIso)
        .order('id', { ascending: true })
        .limit(batchSize);
      if (lastId) query = query.gt('id', lastId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    });

    if (!batch.length) break;
    rows.push(...batch);

    const nextLastId = batch[batch.length - 1]?.id;
    if (!nextLastId || nextLastId === lastId) {
      throw new Error(`content inventory keyset pagination made no progress at batch ${batchNumber}`);
    }
    lastId = nextLastId;
    if (batch.length < batchSize) break;
  }

  const quickInfoRows = rows.filter((row) => {
    const canonical = typeof row.canonical_url === 'string' ? row.canonical_url.trim() : '';
    return canonical.startsWith('/quick-info/');
  });
  const quickInfoSchemaById = await fetchQuickInfoSchemaById(quickInfoRows.map((row) => row.id));
  for (const row of quickInfoRows) {
    row.schema_json = quickInfoSchemaById.get(row.id) ?? null;
  }

  return rows;
}

function encyclopediaOwned(row) {
  const canonical = typeof row.canonical_url === 'string' ? row.canonical_url.trim() : '';
  if (!canonical.startsWith('/encyclopedia/')) return false;
  const slug = typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : '';
  const eligibleType = row.content_type === 'glossary_term' || row.content_type === 'condition';
  const eligible = eligibleType
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    && normalizePath(canonical) === normalizePath(`/encyclopedia/${slug}/`);
  if (!eligible) {
    fail(`indexable encyclopedia canonical row ${row.id} is excluded from content sitemap but is not eligible for the encyclopedia sitemap`);
  }
  return true;
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
    fail(`indexable Daily Tools canonical ${canonical || row.id} is excluded from content sitemap but absent from the authoritative 151-route Daily Tools source corpus`);
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
  // One bounded inventory drives every ownership assertion. Sitemap ownership
  // follows canonical namespaces, so internal content types cannot create a dropped
  // page or a competing non-canonical URL. Large schema metadata is loaded only for
  // the Quick Info rows whose dedicated-sitemap eligibility actually depends on it.
  const publishedRows = await fetchIndexablePublishedInventory();
  const total = publishedRows.length;
  const seenCanonicals = new Set();
  let encyclopediaOwnedCount = 0;
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

    if (encyclopediaOwned(row)) {
      encyclopediaOwnedCount += 1;
      continue;
    }
    if (quickInfoOwned(row) || dailyToolsOwned(row) || atlasOwned(row)) {
      dedicatedOwned += 1;
    }
  }

  const contentOwned = total - encyclopediaOwnedCount - dedicatedOwned;
  if (contentOwned < 0 || total !== encyclopediaOwnedCount + dedicatedOwned + contentOwned) {
    fail(`indexable published canonical partition mismatch: total=${total}, encyclopedia=${encyclopediaOwnedCount}, dedicated=${dedicatedOwned}, content=${contentOwned}`);
  }

  if (failures.length) {
    for (const message of failures) console.error(`SITEMAP PRESERVATION CONTRACT FAILED: ${message}`);
    process.exit(1);
  }

  console.log(`Sitemap preservation contract passed: ${total} indexable published DB pages = ${encyclopediaOwnedCount} encyclopedia-canonical DB pages + ${dedicatedOwned} other dedicated-map DB pages + ${contentOwned} content-sitemap safety-net pages; Daily Tools ownership is proven from the same immutable source corpus used to generate its 151-route sitemap; canonical URLs are unique production HTTPS URLs with updated_at, and paginated sitemap boundaries are stable.`);
} catch (error) {
  console.error(`SITEMAP PRESERVATION CONTRACT FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
