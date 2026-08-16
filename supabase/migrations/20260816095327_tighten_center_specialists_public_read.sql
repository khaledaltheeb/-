drop policy if exists center_specialists_read on public.center_specialists;
drop policy if exists center_specialists_public_read on public.center_specialists;
drop policy if exists center_specialists_admin_read on public.center_specialists;

create policy center_specialists_public_read
on public.center_specialists
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.centers c
    where c.id = center_specialists.center_id
      and c.verification = 'verified'::public.verification_status
      and c.is_active = true
  )
  and exists (
    select 1
    from public.specialists s
    where s.id = center_specialists.specialist_id
      and s.verification = 'verified'::public.verification_status
      and s.is_active = true
  )
);

create policy center_specialists_admin_read
on public.center_specialists
for select
to authenticated
using ((select private.is_admin()));

revoke insert, update, delete, truncate, references, trigger
on table public.center_specialists
from anon;

revoke truncate, references, trigger
on table public.center_specialists
from authenticated;
