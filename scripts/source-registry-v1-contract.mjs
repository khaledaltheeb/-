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

console.log('Source Registry V1 contract passed.');
