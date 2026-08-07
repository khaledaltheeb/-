alter table public.centers
  add column if not exists license_number text,
  add column if not exists regulatory_authority text,
  add column if not exists license_expiry_date date;

create or replace function private.set_center_license(
  p_center_id uuid,
  p_license_number text default null,
  p_regulatory_authority text default null,
  p_license_expiry_date date default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_before public.centers%rowtype;
  v_is_admin boolean := private.is_admin();
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_before from public.centers where id=p_center_id;
  if v_before.id is null then raise exception 'center not found'; end if;
  if not v_is_admin and v_before.manager_user_id <> v_uid then raise exception 'center manager denied'; end if;
  if not v_is_admin and private.current_role() <> 'center_manager'::public.app_role then raise exception 'center manager role required'; end if;

  update public.centers set
    license_number=nullif(trim(p_license_number),''),
    regulatory_authority=nullif(trim(p_regulatory_authority),''),
    license_expiry_date=p_license_expiry_date,
    verification=case when v_before.verification='verified'::public.verification_status and (
      v_before.license_number is distinct from nullif(trim(p_license_number),'')
      or v_before.regulatory_authority is distinct from nullif(trim(p_regulatory_authority),'')
      or v_before.license_expiry_date is distinct from p_license_expiry_date
    ) then 'pending'::public.verification_status else v_before.verification end,
    verified_at=case when v_before.verification='verified'::public.verification_status and (
      v_before.license_number is distinct from nullif(trim(p_license_number),'')
      or v_before.regulatory_authority is distinct from nullif(trim(p_regulatory_authority),'')
      or v_before.license_expiry_date is distinct from p_license_expiry_date
    ) then null else verified_at end,
    verified_by=case when v_before.verification='verified'::public.verification_status and (
      v_before.license_number is distinct from nullif(trim(p_license_number),'')
      or v_before.regulatory_authority is distinct from nullif(trim(p_regulatory_authority),'')
      or v_before.license_expiry_date is distinct from p_license_expiry_date
    ) then null else verified_by end
  where id=p_center_id;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values(v_uid,'center',p_center_id::text,'center_license_update',jsonb_build_object('license_number',v_before.license_number,'regulatory_authority',v_before.regulatory_authority,'license_expiry_date',v_before.license_expiry_date),jsonb_build_object('license_number',p_license_number,'regulatory_authority',p_regulatory_authority,'license_expiry_date',p_license_expiry_date));
  return p_center_id;
end;
$$;

create or replace function private.get_public_center_license(p_center_id uuid)
returns table(license_number text,regulatory_authority text,license_expiry_date date)
language sql
stable
security definer
set search_path=''
as $$
  select c.license_number,c.regulatory_authority,c.license_expiry_date
  from public.centers c
  where c.id=p_center_id and c.verification='verified'::public.verification_status and c.is_active=true
  limit 1;
$$;

revoke all on function private.set_center_license(uuid,text,text,date) from public;
revoke all on function private.get_public_center_license(uuid) from public;
grant execute on function private.set_center_license(uuid,text,text,date) to authenticated;
grant execute on function private.get_public_center_license(uuid) to anon,authenticated;

create or replace function public.set_center_license(p_center_id uuid,p_license_number text default null,p_regulatory_authority text default null,p_license_expiry_date date default null)
returns uuid language sql security invoker set search_path=''
as $$ select private.set_center_license(p_center_id,p_license_number,p_regulatory_authority,p_license_expiry_date); $$;
create or replace function public.get_public_center_license(p_center_id uuid)
returns table(license_number text,regulatory_authority text,license_expiry_date date)
language sql stable security invoker set search_path=''
as $$ select * from private.get_public_center_license(p_center_id); $$;

revoke all on function public.set_center_license(uuid,text,text,date) from public,anon;
revoke all on function public.get_public_center_license(uuid) from public;
grant execute on function public.set_center_license(uuid,text,text,date) to authenticated,service_role;
grant execute on function public.get_public_center_license(uuid) to anon,authenticated,service_role;
