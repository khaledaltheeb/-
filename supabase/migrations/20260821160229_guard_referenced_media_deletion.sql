create or replace function private.delete_media_asset(p_id uuid)
returns text
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_role public.app_role;
  v_asset public.media_assets%rowtype;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  select * into v_asset from public.media_assets where id=p_id for update;
  if v_asset.id is null then raise exception 'media asset not found'; end if;
  if not (v_asset.uploader_id=v_uid or v_role in ('owner','admin')) then raise exception 'media deletion denied'; end if;

  if exists(
    select 1 from public.content c
    where coalesce(c.featured_image_url,'') like '%'||v_asset.object_path||'%'
       or coalesce(c.body_json,'{}'::jsonb)::text like '%'||v_asset.object_path||'%'
       or coalesce(c.schema_json,'{}'::jsonb)::text like '%'||v_asset.object_path||'%'
  ) then raise exception 'media asset is referenced by content'; end if;

  if exists(select 1 from public.profiles p where coalesce(p.avatar_url,'') like '%'||v_asset.object_path||'%') then
    raise exception 'media asset is referenced by a profile';
  end if;

  if exists(select 1 from public.centers c where coalesce(c.logo_url,'') like '%'||v_asset.object_path||'%') then
    raise exception 'media asset is referenced by a center';
  end if;

  delete from public.media_assets where id=p_id;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data)
  values(v_uid,'media',p_id::text,'media_delete',jsonb_build_object('object_path',v_asset.object_path,'mime_type',v_asset.mime_type,'size_bytes',v_asset.size_bytes));
  return v_asset.object_path;
end;
$function$;

revoke all on function private.delete_media_asset(uuid) from public,anon;
grant execute on function private.delete_media_asset(uuid) to authenticated;
