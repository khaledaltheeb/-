drop policy if exists circle_push_devices_deny_direct on public.circle_push_devices;
create policy circle_push_devices_deny_direct
on public.circle_push_devices
for all
to anon, authenticated
using (false)
with check (false);
