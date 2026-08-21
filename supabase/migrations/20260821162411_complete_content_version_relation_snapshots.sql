create or replace function private.sync_content_primary_category_relation()
returns trigger
language plpgsql
set search_path=''
as $function$
begin
  delete from public.content_categories cc
  where cc.content_id=new.id
    and cc.is_primary=true
    and (new.category_id is null or cc.category_id is distinct from new.category_id);

  if new.category_id is not null then
    insert into public.content_categories(content_id,category_id,is_primary)
    values(new.id,new.category_id,true)
    on conflict(content_id,category_id) do update set is_primary=true;
  end if;
  return new;
end;
$function$;

revoke all on function private.sync_content_primary_category_relation() from public,anon,authenticated;

drop trigger if exists zz_generic_content_primary_category_sync on public.content;
create trigger zz_generic_content_primary_category_sync
after insert or update of category_id on public.content
for each row execute function private.sync_content_primary_category_relation();

create or replace function private.enrich_content_version_snapshot_relations()
returns trigger
language plpgsql
set search_path=''
as $function$
declare
  v_relations jsonb;
begin
  if new.snapshot is null or jsonb_typeof(new.snapshot)<>'object' then
    return new;
  end if;

  select jsonb_build_object(
    'categories',coalesce((
      select jsonb_agg(jsonb_build_object('category_id',cc.category_id,'is_primary',cc.is_primary) order by cc.is_primary desc,cc.category_id)
      from public.content_categories cc where cc.content_id=new.content_id
    ),'[]'::jsonb),
    'tags',coalesce((
      select jsonb_agg(jsonb_build_object('tag_id',ct.tag_id) order by ct.tag_id)
      from public.content_tags ct where ct.content_id=new.content_id
    ),'[]'::jsonb)
  ) into v_relations;

  new.snapshot := (new.snapshot - '_relations') || jsonb_build_object('_relations',v_relations);
  return new;
end;
$function$;

revoke all on function private.enrich_content_version_snapshot_relations() from public,anon,authenticated;

drop trigger if exists content_versions_relations_snapshot_guard on public.content_versions;
create trigger content_versions_relations_snapshot_guard
before insert or update of snapshot on public.content_versions
for each row execute function private.enrich_content_version_snapshot_relations();
