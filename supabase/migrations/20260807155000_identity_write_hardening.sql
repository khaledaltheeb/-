revoke insert, update, delete, truncate, references, trigger on public.profiles from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.specialists from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.centers from anon, authenticated;

revoke select on public.profiles from anon;

grant select on public.profiles to authenticated;

create or replace function private.update_my_profile(
  p_display_name text default null,
  p_phone text default null,
  p_locale text default 'ar'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_locale text := lower(coalesce(nullif(trim(p_locale),''),'ar'));
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if v_locale not in ('ar','en') then raise exception 'unsupported locale'; end if;

  update public.profiles
  set display_name = nullif(trim(p_display_name),''),
      phone = nullif(trim(p_phone),''),
      locale = v_locale
  where id = v_uid;

  if not found then raise exception 'profile not found'; end if;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_uid,'profile',v_uid::text,'self_profile_update',jsonb_build_object('locale',v_locale));
  return v_uid;
end;
$$;

create or replace function private.admin_set_user_access(
  p_user_id uuid,
  p_role public.app_role,
  p_is_active boolean default true
)
returns public.app_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before public.profiles%rowtype;
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  if p_user_id = (select auth.uid()) and (p_role <> private.current_role() or not p_is_active) then
    raise exception 'cannot demote or disable current admin session';
  end if;

  select * into v_before from public.profiles where id=p_user_id;
  if v_before.id is null then raise exception 'profile not found'; end if;

  update public.profiles set role=p_role,is_active=p_is_active where id=p_user_id;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values(
    (select auth.uid()),'profile',p_user_id::text,'admin_access_change',
    jsonb_build_object('role',v_before.role,'is_active',v_before.is_active),
    jsonb_build_object('role',p_role,'is_active',p_is_active)
  );
  return p_role;
end;
$$;

revoke all on function private.update_my_profile(text,text,text) from public;
revoke all on function private.admin_set_user_access(uuid,public.app_role,boolean) from public;
grant usage on schema private to authenticated;
grant execute on function private.update_my_profile(text,text,text) to authenticated;
grant execute on function private.admin_set_user_access(uuid,public.app_role,boolean) to authenticated;

create or replace function public.update_my_profile(
  p_display_name text default null,
  p_phone text default null,
  p_locale text default 'ar'
)
returns uuid
language sql
security invoker
set search_path = ''
as $$ select private.update_my_profile(p_display_name,p_phone,p_locale); $$;

create or replace function public.admin_set_user_access(
  p_user_id uuid,
  p_role public.app_role,
  p_is_active boolean default true
)
returns public.app_role
language sql
security invoker
set search_path = ''
as $$ select private.admin_set_user_access(p_user_id,p_role,p_is_active); $$;

revoke all on function public.update_my_profile(text,text,text) from public,anon;
revoke all on function public.admin_set_user_access(uuid,public.app_role,boolean) from public,anon;
grant execute on function public.update_my_profile(text,text,text) to authenticated,service_role;
grant execute on function public.admin_set_user_access(uuid,public.app_role,boolean) to authenticated,service_role;
