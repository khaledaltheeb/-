create or replace function private.block_pediatric_oncology_v7_template_release()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  v_is_pediatric boolean := false;
begin
  if new.sector_id is null then
    return new;
  end if;

  select exists(
    select 1
    from public.sectors s
    where s.id = new.sector_id
      and s.slug = 'pediatric-oncology'
      and s.is_active
  ) into v_is_pediatric;

  if not v_is_pediatric then
    return new;
  end if;

  if new.status in (
       'approved'::public.content_status,
       'scheduled'::public.content_status,
       'published'::public.content_status
     )
     and coalesce(new.schema_json->>'migration_stage','') = 'v7-published'
  then
    raise exception 'pediatric oncology release blocked: generic care-guide v7 template output is not permitted; use a topic-specific evidence-led body and the governed release workflow'
      using errcode = '23514';
  end if;

  return new;
end;
$function$;

drop trigger if exists zzz_pediatric_oncology_block_v7_template_release on public.content;
create trigger zzz_pediatric_oncology_block_v7_template_release
before insert or update of status, sector_id, schema_json on public.content
for each row execute function private.block_pediatric_oncology_v7_template_release();
