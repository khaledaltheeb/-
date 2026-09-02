create index if not exists source_rights_profiles_version_source_idx
  on public.source_rights_profiles(source_version_id, source_id)
  where source_version_id is not null;

create index if not exists source_translation_version_source_idx
  on public.source_translation_provenance(source_version_id, source_id)
  where source_version_id is not null;
