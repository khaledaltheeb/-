-- Prevent a capability page that has been explicitly merged into another canonical
-- from being republished by parallel/import writers.
-- The content is retained in CMS as draft/noindex for provenance, while the unique
-- useful material is consolidated into the stronger canonical page.

alter table public.content
  drop constraint if exists content_capabilities_merged_not_published_chk;

alter table public.content
  add constraint content_capabilities_merged_not_published_chk
  check (
    status <> 'published'::public.content_status
    or slug not like 'capabilities-%'
    or coalesce(schema_json->>'merged_into', '') = ''
  );
