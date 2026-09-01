begin;

-- Source registry joins and FK maintenance can address source_version_id directly.
-- The existing PK/indexes cover content_id and source_id but not this FK.
create index if not exists content_sources_source_version_idx
  on public.content_sources(source_version_id)
  where source_version_id is not null;

commit;
