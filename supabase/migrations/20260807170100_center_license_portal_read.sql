create or replace function private.get_my_center_license(p_center_id uuid)
returns table(license_number text,regulatory_authority text,license_expiry_date date)
language plpgsql
stable
security definer
set search_path=''
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if not private.is_admin() and not exists(select 1 from public.centers c where c.id=p_center_id and c.manager_user_id=v_uid) then raise exception 'center manager denied'; end if;
  return query select c.license_number,c.regulatory_authority,c.license_expiry_date from public.centers c where c.id=p_center_id;
end;
$$;
revoke all on function private.get_my_center_license(uuid) from public;
grant execute on function private.get_my_center_license(uuid) to authenticated;
create or replace function public.get_my_center_license(p_center_id uuid)
returns table(license_number text,regulatory_authority text,license_expiry_date date)
language sql stable security invoker set search_path=''
as $$ select * from private.get_my_center_license(p_center_id); $$;
revoke all on function public.get_my_center_license(uuid) from public,anon;
grant execute on function public.get_my_center_license(uuid) to authenticated,service_role;
