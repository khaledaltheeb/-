import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const enforce = process.env.EDITORIAL_REQUIRE_READY === 'true';
const pageSize = 1000;

if (!url || !key) throw new Error('Supabase public configuration is required for editorial readiness.');

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const reviewRequired = new Set(['article','guide','condition','research','intervention','comparison','glossary_term','resource']);
const referenceRequired = new Set(['article','guide','condition','research','intervention','comparison','glossary_term','resource']);

function refCount(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object').length : 0;
}
function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0; }
function asRecord(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : null; }

function reviewDateRequired(row, type) {
  if (!reviewRequired.has(type)) return false;
  const schema = asRecord(row.schema_json);
  const approvedQuickInfoWithoutEditorialReview = Boolean(
    String(row.slug || '').startsWith('quick-info-')
    && String(row.canonical_url || '').startsWith('/quick-info/')
    && schema?.page_role === 'quick-info'
    && schema?.publication_ready === true
    && schema?.editorial_review_required === false,
  );
  return !approvedQuickInfoWithoutEditorialReview;
}

async function loadRows() {
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('content')
      .select('id,slug,title,content_type,last_reviewed_at,references_json,seo_title,seo_description,canonical_url,primary_keyword,schema_json')
      .eq('status', 'published')
      .eq('robots_index', true)
      .lte('published_at', new Date().toISOString())
      .order('id')
      .range(from, to);
    if (error) throw new Error(`Editorial readiness query failed: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

const rows = await loadRows();
const problems = [];
const byType = new Map();

for (const row of rows) {
  const type = String(row.content_type || 'unknown');
  const stats = byType.get(type) || { total: 0, missingReview: 0, missingReferences: 0, seoMetadata: 0 };
  stats.total += 1;

  const missingReview = reviewDateRequired(row, type) && !nonEmpty(row.last_reviewed_at);
  const missingReferences = referenceRequired.has(type) && refCount(row.references_json) < 1;
  const metadataOk = nonEmpty(row.seo_title) && nonEmpty(row.seo_description) && nonEmpty(row.canonical_url) && nonEmpty(row.primary_keyword);

  if (missingReview) stats.missingReview += 1;
  if (missingReferences) stats.missingReferences += 1;
  if (metadataOk) stats.seoMetadata += 1;
  byType.set(type, stats);

  if (missingReview || missingReferences || !metadataOk) {
    problems.push({
      slug: row.slug,
      type,
      missing_review_date: missingReview,
      missing_references: missingReferences,
      missing_core_seo_metadata: !metadataOk,
    });
  }
}

const totals = [...byType.values()].reduce((acc, item) => ({
  missingReview: acc.missingReview + item.missingReview,
  missingReferences: acc.missingReferences + item.missingReferences,
  metadataReady: acc.metadataReady + item.seoMetadata,
}), { missingReview: 0, missingReferences: 0, metadataReady: 0 });

console.log(JSON.stringify({
  indexable_database_pages: rows.length,
  core_seo_metadata_ready: totals.metadataReady,
  missing_review_date: totals.missingReview,
  missing_required_references: totals.missingReferences,
  problem_pages: problems.length,
  by_content_type: Object.fromEntries([...byType.entries()].sort((a,b) => b[1].total - a[1].total)),
  problem_sample: problems.slice(0, 50),
}, null, 2));

if (enforce && totals.missingReview > 0) {
  throw new Error(`EDITORIAL CUTOVER BLOCKED: ${totals.missingReview} indexable knowledge pages lack a recorded review date.`);
}
if (enforce && totals.missingReferences > 0) {
  throw new Error(`EDITORIAL CUTOVER BLOCKED: ${totals.missingReferences} indexable knowledge pages lack a required reference.`);
}
if (enforce && totals.metadataReady !== rows.length) {
  throw new Error(`EDITORIAL CUTOVER BLOCKED: ${rows.length - totals.metadataReady} indexable database pages lack core SEO metadata.`);
}
