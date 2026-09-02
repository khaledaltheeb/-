begin;

-- ROR identity is exposed only through reviewed API projections.
-- Keep an explicit RLS deny boundary in addition to revoked table privileges.
drop policy if exists organizations_deny_direct_client_access on public.organizations;
create policy organizations_deny_direct_client_access
on public.organizations
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists source_organizations_deny_direct_client_access on public.source_organizations;
create policy source_organizations_deny_direct_client_access
on public.source_organizations
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

revoke all on public.organizations from anon, authenticated;
revoke all on public.source_organizations from anon, authenticated;

commit;
