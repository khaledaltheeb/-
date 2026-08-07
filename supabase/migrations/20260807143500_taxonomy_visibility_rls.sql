drop policy if exists sectors_public_read on public.sectors;
drop policy if exists sectors_authenticated_read on public.sectors;

create policy sectors_public_read on public.sectors
  for select to anon
  using (is_active = true and visibility = 'public');

create policy sectors_authenticated_read on public.sectors
  for select to authenticated
  using (is_active = true and visibility in ('public','authenticated'));

drop policy if exists categories_public_read on public.categories;
drop policy if exists categories_authenticated_read on public.categories;

create policy categories_public_read on public.categories
  for select to anon
  using (is_active = true and visibility = 'public');

create policy categories_authenticated_read on public.categories
  for select to authenticated
  using (is_active = true and visibility in ('public','authenticated'));
