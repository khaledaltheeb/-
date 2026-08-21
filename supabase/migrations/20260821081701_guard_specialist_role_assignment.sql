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

  select * into v_before from public.profiles where id=p_user_id for update;
  if v_before.id is null then raise exception 'profile not found'; end if;

  if p_role='specialist'::public.app_role and v_before.role<>'specialist'::public.app_role then
    if not exists(
      select 1 from public.specialists s
      where s.user_id=p_user_id
        and s.verification='verified'::public.verification_status
        and s.is_active=true
    ) then
      raise exception 'specialist role requires verified specialist profile';
    end if;
  end if;

  update public.profiles set role=p_role,is_active=p_is_active,updated_at=now() where id=p_user_id;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values(
    (select auth.uid()),'profile',p_user_id::text,'admin_access_change',
    jsonb_build_object('role',v_before.role,'is_active',v_before.is_active),
    jsonb_build_object('role',p_role,'is_active',p_is_active)
  );
  return p_role;
end;
$$;
