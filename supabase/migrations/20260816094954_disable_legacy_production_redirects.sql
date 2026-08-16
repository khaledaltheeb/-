with legacy_routes as (
  select case when source_path='index.html' then '/'
              when source_path like '%/index.html' then '/' || regexp_replace(source_path,'/index\.html$','') || '/'
              else '/' || source_path end as route
  from private.legacy_migration_items
  where source_kind='production-baseline'
    and coalesce(migration_state,'') <> 'DEVELOPMENT_ONLY'
    and coalesce(migration_decision,'') <> ''
    and migration_decision not like 'EXCLUDE_%'
)
update public.redirects r
set is_active=false,
    updated_at=now(),
    note=concat_ws(' | ',nullif(r.note,''),'disabled: preserved production URL renders content in place')
where r.is_active=true
  and exists (
    select 1 from legacy_routes l
    where r.source_path in (l.route,regexp_replace(l.route,'/$',''))
  );
