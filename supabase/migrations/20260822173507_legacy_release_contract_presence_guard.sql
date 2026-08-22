-- Prevent legacy-migration rows from entering release states without the
-- validated migration release contract discriminator. Exact ledger binding is
-- required for any reconciliation backfill so unrelated/obsolete ledger rows
-- cannot authorize a release.

update public.content c
set schema_json = pg_catalog.jsonb_set(
  coalesce(c.schema_json, '{}'::jsonb),
  '{migration_release_contract_version}',
  '1'::jsonb,
  true
)
from private.legacy_migration_items l
where l.destination_content_id = c.id
  and l.migration_decision = 'PROMOTED_DRAFT'
  and l.migration_state in ('PUBLISHABLE', 'PUBLISHABLE_AFTER_REPAIR')
  and c.schema_json ? 'legacy_migration'
  and c.schema_json #>> '{legacy_migration,source_key}' = l.source_key
  and c.schema_json #>> '{legacy_migration,source_sha256}' = l.source_sha256
  and c.slug = l.destination_slug
  and c.canonical_url = l.destination_canonical
  and c.status in (
    'accessibility_review'::public.content_status,
    'approved'::public.content_status,
    'scheduled'::public.content_status,
    'published'::public.content_status
  )
  and not (
    coalesce(c.schema_json ->> 'migration_release_contract_version', '') ~ '^[1-9][0-9]*$'
  );

do $$
begin
  if exists (
    select 1
    from public.content c
    where c.schema_json ? 'legacy_migration'
      and c.status in (
        'accessibility_review'::public.content_status,
        'approved'::public.content_status,
        'scheduled'::public.content_status,
        'published'::public.content_status
      )
      and not (
        coalesce(c.schema_json ->> 'migration_release_contract_version', '') ~ '^[1-9][0-9]*$'
      )
  ) then
    raise exception 'cannot install legacy contract presence guard while release-state legacy rows lack a valid migration release contract';
  end if;
end;
$$;

create or replace function private.content_legacy_contract_presence_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_schema jsonb := coalesce(new.schema_json, '{}'::jsonb);
  v_contract integer := 0;
begin
  if pg_catalog.jsonb_typeof(v_schema) <> 'object'
     or not (v_schema ? 'legacy_migration') then
    return new;
  end if;

  if coalesce(v_schema ->> 'migration_release_contract_version', '') ~ '^[1-9][0-9]*$' then
    begin
      v_contract := (v_schema ->> 'migration_release_contract_version')::integer;
    exception when numeric_value_out_of_range then
      v_contract := 0;
    end;
  end if;

  if new.status in (
    'accessibility_review'::public.content_status,
    'approved'::public.content_status,
    'scheduled'::public.content_status,
    'published'::public.content_status
  ) and v_contract < 1 then
    raise exception 'legacy content release requires migration_release_contract_version >= 1';
  end if;

  return new;
end;
$$;

revoke all on function private.content_legacy_contract_presence_guard() from public, anon, authenticated;

drop trigger if exists aa_content_legacy_contract_presence_guard on public.content;
create trigger aa_content_legacy_contract_presence_guard
before insert or update of status, schema_json on public.content
for each row
execute function private.content_legacy_contract_presence_guard();
