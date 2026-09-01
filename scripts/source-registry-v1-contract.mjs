import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const requireMarkers = (path, markers) => {
  const text = read(path);
  for (const marker of markers) {
    if (!text.includes(marker)) throw new Error(`${path}: missing ${marker}`);
  }
};

requireMarkers('supabase/migrations/20260901073000_global_source_registry_v1.sql', [
  'create table if not exists public.sources',
  'create table if not exists public.source_versions',
  'create table if not exists public.content_sources',
  'enable row level security',
  'revoke all on public.sources from anon, authenticated',
  'api_source_registry',
  'api_source_detail',
]);

requireMarkers('supabase/migrations/20260901080000_global_source_registry_sync_v1.sql', [
  'private.sync_content_source_registry',
  'content_source_registry_sync',
  'after insert or update of references_json',
]);

requireMarkers('supabase/migrations/20260901081500_global_source_registry_content_rpc_v1.sql', [
  'api_content_sources',
  "c.status='published'",
  'c.robots_index=true',
]);

requireMarkers('supabase/migrations/20260901212203_source_connection_metadata_v1.sql', [
  'create table if not exists public.source_related_identifiers',
  'create table if not exists public.source_contributors',
  'create table if not exists public.source_contributor_organizations',
  'source_contributors_orcid_canonical',
  "'related_identifiers'",
  "'contributors'",
  "'organizations'",
  'enable row level security',
  'revoke all on table public.source_related_identifiers from anon, authenticated',
]);

requireMarkers('supabase/migrations/20260901215918_source_governance_provenance_v1.sql', [
  'create table if not exists public.source_rights_profiles',
  'create table if not exists public.source_translation_provenance',
  'metadata_reuse_status',
  'content_reuse_status',
  'source_translation_human_attribution_check',
  'source_translation_machine_tool_check',
  'source_translation_review_attribution_check',
  "'rights_profiles'",
  "'translations'",
  'alter table public.source_rights_profiles enable row level security',
  'alter table public.source_translation_provenance enable row level security',
  'revoke all on table public.source_rights_profiles from anon, authenticated',
  'revoke all on table public.source_translation_provenance from anon, authenticated',
]);

requireMarkers('supabase/migrations/20260901221854_source_governance_provenance_indexes_v1.sql', [
  'source_rights_profiles_version_source_idx',
  'source_translation_version_source_idx',
  'source_version_id, source_id',
]);

requireMarkers('app/api/v1/sources/route.ts', [
  "withOptionalPartnerAccess(request, 'sources:read')",
  "supabase.rpc('api_source_registry'",
]);
requireMarkers('app/api/v1/sources/[id]/route.ts', [
  "withOptionalPartnerAccess(request, 'sources:read')",
  "supabase.rpc('api_source_detail'",
]);
requireMarkers('app/api/v1/content/[slug]/sources/route.ts', [
  "supabase.rpc('api_content_sources'",
  "registry: 'normalized-v1'",
]);

console.log('Source Registry V1 + connection metadata + rights/translation provenance contract passed.');