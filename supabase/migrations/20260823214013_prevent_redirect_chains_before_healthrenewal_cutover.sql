create or replace function private.enforce_direct_redirect_only()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if not new.is_active then
    return new;
  end if;

  if exists (
    select 1
    from public.redirects r
    where r.is_active = true
      and r.source_path = new.destination_path
      and r.id is distinct from new.id
  ) then
    raise exception 'redirect chain rejected: destination is already an active redirect source';
  end if;

  if exists (
    select 1
    from public.redirects r
    where r.is_active = true
      and r.destination_path = new.source_path
      and r.id is distinct from new.id
  ) then
    raise exception 'redirect chain rejected: source is already an active redirect destination';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_direct_redirect_only() from public;

drop trigger if exists redirects_direct_only_guard on public.redirects;
create trigger redirects_direct_only_guard
before insert or update of source_path,destination_path,is_active
on public.redirects
for each row
execute function private.enforce_direct_redirect_only();
