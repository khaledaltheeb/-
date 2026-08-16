create or replace function private.content_release_gate_legacy_ledger()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_schema jsonb := coalesce(new.schema_json, '{}'::jsonb);
  v_legacy jsonb := coalesce(v_schema -> 'legacy_migration', '{}'::jsonb);
  v_source_key text := nullif(v_legacy ->> 'source_key', '');
  v_source_sha256 text := nullif(v_legacy ->> 'source_sha256', '');
  v_bound boolean := false;
begin
  if new.status not in (
    'accessibility_review'::public.content_status,
    'approved'::public.content_status,
    'scheduled'::public.content_status,
    'published'::public.content_status
  ) then
    return new;
  end if;

  if coalesce((v_schema ->> 'migration_release_contract_version')::integer, 0) < 1
     or v_source_key is null
     or v_source_sha256 is null then
    raise exception 'legacy release requires a trusted migration ledger binding';
  end if;

  select exists (
    select 1
    from private.legacy_migration_items i
    where i.destination_content_id = new.id
      and i.source_key = v_source_key
      and i.source_sha256 = v_source_sha256
      and i.destination_slug = new.slug
      and i.destination_canonical = new.canonical_url
      and i.migration_decision = 'PROMOTED_DRAFT'
      and i.migration_state in ('PUBLISHABLE','PUBLISHABLE_AFTER_REPAIR')
  ) into v_bound;

  if not v_bound then
    raise exception 'legacy release denied: content is not bound to a promoted private migration-ledger item';
  end if;

  if exists (
    select 1
    from private.legacy_quality_issues q
    where q.destination_content_id = new.id
      and q.status = 'open'
      and q.severity = 'blocking'
  ) then
    raise exception 'legacy release denied: unresolved blocking migration quality issues remain';
  end if;

  return new;
end;
$$;

revoke all on function private.content_release_gate_legacy_ledger() from public, anon, authenticated;

drop trigger if exists content_release_gate_legacy_ledger on public.content;
create trigger content_release_gate_legacy_ledger
before insert or update of status on public.content
for each row
when (
  coalesce((new.schema_json ->> 'migration_release_contract_version')::integer, 0) >= 1
  and new.schema_json ? 'legacy_migration'
)
execute function private.content_release_gate_legacy_ledger();
