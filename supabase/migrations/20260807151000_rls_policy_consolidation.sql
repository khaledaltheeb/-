drop policy if exists sectors_anon_read on public.sectors;
drop policy if exists sectors_auth_read on public.sectors;
drop policy if exists sectors_public_read on public.sectors;
drop policy if exists sectors_authenticated_read on public.sectors;

create policy sectors_public_read on public.sectors
  for select to anon
  using (is_active = true and visibility = 'public');

create policy sectors_authenticated_read on public.sectors
  for select to authenticated
  using ((select private.is_admin()) or (is_active = true and visibility in ('public','authenticated')));

drop policy if exists categories_anon_read on public.categories;
drop policy if exists categories_auth_read on public.categories;
drop policy if exists categories_public_read on public.categories;
drop policy if exists categories_authenticated_read on public.categories;

create policy categories_public_read on public.categories
  for select to anon
  using (is_active = true and visibility = 'public');

create policy categories_authenticated_read on public.categories
  for select to authenticated
  using ((select private.is_admin()) or (is_active = true and visibility in ('public','authenticated')));

drop policy if exists tags_public_read on public.tags;
drop policy if exists tags_staff_all on public.tags;

create policy tags_anon_read on public.tags
  for select to anon
  using (is_active = true);

create policy tags_authenticated_read on public.tags
  for select to authenticated
  using (is_active = true or (select private.is_content_staff()));

create policy tags_staff_insert on public.tags
  for insert to authenticated
  with check ((select private.is_content_staff()));

create policy tags_staff_update on public.tags
  for update to authenticated
  using ((select private.is_content_staff()))
  with check ((select private.is_content_staff()));

create policy tags_staff_delete on public.tags
  for delete to authenticated
  using ((select private.is_content_staff()));

drop policy if exists content_tags_public_read on public.content_tags;
drop policy if exists content_tags_staff_or_author_all on public.content_tags;

create policy content_tags_anon_read on public.content_tags
  for select to anon
  using (exists (
    select 1 from public.content c
    where c.id = content_id
      and c.status = 'published'::public.content_status
      and c.published_at is not null
      and c.published_at <= now()
  ));

create policy content_tags_authenticated_read on public.content_tags
  for select to authenticated
  using (
    (select private.is_content_staff())
    or exists (select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid()))
    or exists (
      select 1 from public.content c
      where c.id = content_id
        and c.status = 'published'::public.content_status
        and c.published_at is not null
        and c.published_at <= now()
    )
  );

create policy content_tags_write_insert on public.content_tags
  for insert to authenticated
  with check ((select private.is_content_staff()) or exists (
    select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid())
  ));

create policy content_tags_write_update on public.content_tags
  for update to authenticated
  using ((select private.is_content_staff()) or exists (
    select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid())
  ))
  with check ((select private.is_content_staff()) or exists (
    select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid())
  ));

create policy content_tags_write_delete on public.content_tags
  for delete to authenticated
  using ((select private.is_content_staff()) or exists (
    select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid())
  ));

drop policy if exists content_categories_public_read on public.content_categories;
drop policy if exists content_categories_staff_or_author_all on public.content_categories;

create policy content_categories_anon_read on public.content_categories
  for select to anon
  using (exists (
    select 1 from public.content c
    where c.id = content_id
      and c.status = 'published'::public.content_status
      and c.published_at is not null
      and c.published_at <= now()
  ));

create policy content_categories_authenticated_read on public.content_categories
  for select to authenticated
  using (
    (select private.is_content_staff())
    or exists (select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid()))
    or exists (
      select 1 from public.content c
      where c.id = content_id
        and c.status = 'published'::public.content_status
        and c.published_at is not null
        and c.published_at <= now()
    )
  );

create policy content_categories_write_insert on public.content_categories
  for insert to authenticated
  with check ((select private.is_content_staff()) or exists (
    select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid())
  ));

create policy content_categories_write_update on public.content_categories
  for update to authenticated
  using ((select private.is_content_staff()) or exists (
    select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid())
  ))
  with check ((select private.is_content_staff()) or exists (
    select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid())
  ));

create policy content_categories_write_delete on public.content_categories
  for delete to authenticated
  using ((select private.is_content_staff()) or exists (
    select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid())
  ));
