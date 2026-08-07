create or replace function private.can_contact_provider(p_specialist_id uuid default null,p_center_id uuid default null)
returns boolean
language plpgsql
stable
security definer
set search_path=''
as $$
begin
  if (p_specialist_id is null) = (p_center_id is null) then return false; end if;
  if p_specialist_id is not null then
    return exists(
      select 1 from public.specialists s
      join public.profiles p on p.id=s.user_id and p.is_active=true
      where s.id=p_specialist_id and s.is_active=true and s.verification='verified'::public.verification_status and s.user_id is not null
    );
  end if;
  return exists(
    select 1 from public.centers c
    join public.profiles p on p.id=c.manager_user_id and p.is_active=true
    where c.id=p_center_id and c.is_active=true and c.verification='verified'::public.verification_status and c.manager_user_id is not null
  );
end;
$$;

revoke all on function private.can_contact_provider(uuid,uuid) from public;
grant usage on schema private to anon,authenticated;
grant execute on function private.can_contact_provider(uuid,uuid) to anon,authenticated;

create or replace function public.can_contact_provider(p_specialist_id uuid default null,p_center_id uuid default null)
returns boolean
language sql
stable
security invoker
set search_path=''
as $$ select private.can_contact_provider(p_specialist_id,p_center_id); $$;

revoke all on function public.can_contact_provider(uuid,uuid) from public;
grant execute on function public.can_contact_provider(uuid,uuid) to anon,authenticated,service_role;
