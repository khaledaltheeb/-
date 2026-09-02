import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260828192233_content_published_indexable_canonical_owner.sql';
const siteOrigin = 'https://healthrenewal.org';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const failures = [];

function fail(message) {
  failures.push(message);
}

if (!fs.existsSync(migrationPath)) {
  fail(`canonical ownership migration is missing: ${migrationPath}`);
} else {
  const migration = fs.readFileSync(migrationPath, 'utf8')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  for (const marker of [
    'create unique index if not exists content_published_indexable_canonical_owner_uidx',
    "lower(coalesce(nullif(rtrim(btrim(canonical_url), '/'), ''), '/'))",
    "where status = 'published'",
    'and robots_index is true',
    'and canonical_url is not null',
    "and btrim(canonical_url) <> ''",
  ]) {
    if (!migration.includes(marker)) {
      fail(`canonical ownership migration is missing required marker: ${marker}`);
    }
  }
}

if (!supabaseUrl || !supabaseKey) {
  fail('Supabase public environment is not configured for canonical ownership verification.');
}

function normalizeCanonical(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return null;

  let parsed;
  try {
    parsed = new URL(raw, siteOrigin);
  } catch {
    return { error: `malformed canonical URL: ${raw}` };
  }

  if (parsed.protocol !== 'https:' || parsed.hostname.toLowerCase() !== 'healthrenewal.org' || parsed.search || parsed.hash) {
    return { error: `non-production canonical URL: ${raw}` };
  }

  let path = parsed.pathname || '/';
  if (path !== '/') path = path.replace(/\/+$/, '') || '/';
  return { key: path.toLowerCase(), canonical: raw };
}

async function fetchPublishedIndexableInventory() {
  const rows = [];
  let lastId = null;
  const batchSize = 1000;

  for (let batchNumber = 1; batchNumber <= 100; batchNumber += 1) {
    const endpoint = new URL('/rest/v1/content', supabaseUrl);
    endpoint.searchParams.set('select', 'id,slug,canonical_url');
    endpoint.searchParams.set('status', 'eq.published');
    endpoint.searchParams.set('robots_index', 'is.true');
    endpoint.searchParams.set('canonical_url', 'not.is.null');
    endpoint.searchParams.set('order', 'id.asc');
    endpoint.searchParams.set('limit', String(batchSize));
    if (lastId) endpoint.searchParams.set('id', `gt.${lastId}`);

    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(`canonical ownership inventory query failed (${response.status}): ${detail}`);
    }

    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('canonical ownership inventory response is not an array');
    if (!batch.length) return rows;

    rows.push(...batch);
    const nextLastId = batch[batch.length - 1]?.id;
    if (!nextLastId || nextLastId === lastId) {
      throw new Error(`canonical ownership keyset pagination made no progress at batch ${batchNumber}`);
    }
    lastId = nextLastId;
    if (batch.length < batchSize) return rows;
  }

  throw new Error('canonical ownership inventory exceeded the 100000-row safety bound');
}

if (supabaseUrl && supabaseKey) {
  try {
    const rows = await fetchPublishedIndexableInventory();
    const owners = new Map();

    for (const row of rows) {
      const normalized = normalizeCanonical(row.canonical_url);
      if (!normalized) continue;
      if (normalized.error) {
        fail(`row ${row.id}: ${normalized.error}`);
        continue;
      }

      const previous = owners.get(normalized.key);
      if (previous) {
        fail(`duplicate published/indexable canonical owner ${normalized.key}: ${previous.slug} (${previous.id}) and ${row.slug} (${row.id})`);
        continue;
      }
      owners.set(normalized.key, row);
    }

    console.log(`Canonical ownership inventory: ${rows.length} published/indexable rows, ${owners.size} normalized owners.`);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

if (failures.length) {
  for (const message of failures) console.error(`CANONICAL OWNERSHIP CONTRACT FAILED: ${message}`);
  process.exit(1);
}

console.log('Canonical ownership contract passed.');
