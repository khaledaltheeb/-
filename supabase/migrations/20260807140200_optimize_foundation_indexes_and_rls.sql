create index if not exists appointments_specialist_idx on public.appointments(specialist_id);
create index if not exists appointments_center_idx on public.appointments(center_id);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id);
create index if not exists categories_parent_idx on public.categories(parent_id);
create index if not exists categories_sector_idx on public.categories(sector_id);
create index if not exists center_specialists_specialist_idx on public.center_specialists(specialist_id);
create index if not exists content_reviewer_idx on public.content(scientific_reviewer_id);
create index if not exists content_versions_created_by_idx on public.content_versions(created_by);
create index if not exists conversations_created_by_idx on public.conversations(created_by);
create index if not exists messages_sender_idx on public.messages(sender_id);
create index if not exists specialists_verified_by_idx on public.specialists(verified_by);

drop policy if exists profiles_self_select on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using ((select auth.uid()) = id or (select private.is_admin()));
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid()) = id or (select private.is_admin())) with check ((select auth.uid()) = id or (select private.is_admin()));
create policy profiles_admin_insert on public.profiles for insert to authenticated with check ((select private.is_admin()));
create policy profiles_admin_delete on public.profiles for delete to authenticated using ((select private.is_admin()));

drop policy if exists sectors_public_read on public.sectors;
drop policy if exists sectors_admin_all on public.sectors;
create policy sectors_anon_read on public.sectors for select to anon using (is_active = true);
create policy sectors_auth_read on public.sectors for select to authenticated using (is_active = true or (select private.is_admin()));
create policy sectors_admin_insert on public.sectors for insert to authenticated with check ((select private.is_admin()));
create policy sectors_admin_update on public.sectors for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy sectors_admin_delete on public.sectors for delete to authenticated using ((select private.is_admin()));

drop policy if exists categories_public_read on public.categories;
drop policy if exists categories_admin_all on public.categories;
create policy categories_anon_read on public.categories for select to anon using (is_active = true);
create policy categories_auth_read on public.categories for select to authenticated using (is_active = true or (select private.is_admin()));
create policy categories_admin_insert on public.categories for insert to authenticated with check ((select private.is_admin()));
create policy categories_admin_update on public.categories for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy categories_admin_delete on public.categories for delete to authenticated using ((select private.is_admin()));

drop policy if exists content_public_read on public.content;
drop policy if exists content_owned_or_staff_read on public.content;
create policy content_anon_read on public.content for select to anon using (status = 'published'::public.content_status and published_at is not null and published_at <= now());
create policy content_auth_read on public.content for select to authenticated using ((status = 'published'::public.content_status and published_at is not null and published_at <= now()) or author_id = (select auth.uid()) or (select private.is_content_staff()));

drop policy if exists specialists_public_read on public.specialists;
drop policy if exists specialists_owner_read on public.specialists;
create policy specialists_anon_read on public.specialists for select to anon using (verification = 'verified'::public.verification_status and is_active = true);
create policy specialists_auth_read on public.specialists for select to authenticated using ((verification = 'verified'::public.verification_status and is_active = true) or user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists centers_public_read on public.centers;
drop policy if exists centers_manager_read on public.centers;
create policy centers_anon_read on public.centers for select to anon using (verification = 'verified'::public.verification_status and is_active = true);
create policy centers_auth_read on public.centers for select to authenticated using ((verification = 'verified'::public.verification_status and is_active = true) or manager_user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists center_specialists_public_read on public.center_specialists;
drop policy if exists center_specialists_admin_all on public.center_specialists;
create policy center_specialists_read on public.center_specialists for select to anon, authenticated using (true);
create policy center_specialists_admin_insert on public.center_specialists for insert to authenticated with check ((select private.is_admin()));
create policy center_specialists_admin_update on public.center_specialists for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy center_specialists_admin_delete on public.center_specialists for delete to authenticated using ((select private.is_admin()));

drop policy if exists redirects_public_read on public.redirects;
drop policy if exists redirects_admin_all on public.redirects;
create policy redirects_anon_read on public.redirects for select to anon using (is_active = true);
create policy redirects_auth_read on public.redirects for select to authenticated using (is_active = true or (select private.is_admin()));
create policy redirects_admin_insert on public.redirects for insert to authenticated with check ((select private.is_admin()));
create policy redirects_admin_update on public.redirects for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy redirects_admin_delete on public.redirects for delete to authenticated using ((select private.is_admin()));
