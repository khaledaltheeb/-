create or replace function private.bootstrap_initial_owner(p_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_email text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_email,'')));
begin
  if v_email = '' then raise exception 'owner email is required'; end if;
  if exists(select 1 from public.profiles p where p.role='owner'::public.app_role and p.is_active=true) then
    raise exception 'an active owner already exists';
  end if;

  select u.id into v_user_id
  from auth.users u
  where pg_catalog.lower(coalesce(u.email,'')) = v_email
    and u.deleted_at is null
  order by u.created_at asc
  limit 1;
  if v_user_id is null then raise exception 'registered user not found'; end if;
  if not exists(select 1 from public.profiles p where p.id=v_user_id) then raise exception 'profile not initialized'; end if;

  update public.profiles
  set role='owner'::public.app_role,is_active=true,updated_at=now()
  where id=v_user_id;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(null,'profile',v_user_id::text,'initial_owner_bootstrap',jsonb_build_object('role','owner','email',v_email));
  return v_user_id;
end;
$$;

revoke all on function private.bootstrap_initial_owner(text) from public,anon,authenticated;
grant execute on function private.bootstrap_initial_owner(text) to service_role;
