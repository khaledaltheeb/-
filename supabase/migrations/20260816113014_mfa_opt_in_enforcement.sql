create or replace function private.mfa_session_allowed()
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select case
    when (select auth.uid()) is null then false
    when exists (
      select 1
      from auth.mfa_factors f
      where f.user_id = (select auth.uid())
        and f.status = 'verified'
    ) then coalesce((select auth.jwt()->>'aal'), 'aal1') = 'aal2'
    else true
  end;
$function$;

revoke all on function private.mfa_session_allowed() from public, anon;
grant execute on function private.mfa_session_allowed() to authenticated;

create or replace function private."current_role"()
returns public.app_role
language sql
stable
security definer
set search_path to ''
as $function$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
    and p.is_active = true
    and private.mfa_session_allowed();
$function$;

create or replace function private.require_active_user()
returns uuid
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'authentication required';
  end if;
  if not exists(select 1 from public.profiles p where p.id=v_uid and p.is_active=true) then
    raise exception 'active account required';
  end if;
  if not private.mfa_session_allowed() then
    raise exception 'mfa required';
  end if;
  return v_uid;
end;
$function$;

create or replace function private.provider_verification_upload_allowed(p_uid uuid, p_provider_type text)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select
    p_uid is not null
    and p_uid = (select auth.uid())
    and private.mfa_session_allowed()
    and p_provider_type in ('specialist','center')
    and private.provider_application_exists(p_uid,p_provider_type)
    and (
      select count(*)
      from storage.objects o
      where o.bucket_id='provider-verification'
        and o.name like (p_uid::text || '/' || p_provider_type || '/%')
    ) < 20;
$function$;

create or replace function private.delete_provider_verification_document(p_id uuid)
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_doc public.provider_verification_documents%rowtype;
begin
  select * into v_doc from public.provider_verification_documents where id=p_id;
  if v_doc.id is null or v_doc.user_id<>v_uid then raise exception 'document not found'; end if;
  if v_doc.review_status='accepted' then raise exception 'accepted document cannot be deleted during review'; end if;
  if not private.provider_application_exists(v_uid,v_doc.provider_type) then raise exception 'application is not editable'; end if;
  delete from public.provider_verification_documents where id=p_id;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data)
  values(v_uid,'provider_verification_document',p_id::text,'provider_document_delete',jsonb_build_object('provider_type',v_doc.provider_type,'document_type',v_doc.document_type,'object_path',v_doc.object_path));
  return v_doc.object_path;
end;
$function$;

create or replace function private.admin_review_provider_verification_document(p_id uuid, p_status text, p_note text default null)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_doc public.provider_verification_documents%rowtype;
begin
  if not private.is_admin() then raise exception 'admin access required'; end if;
  if p_status not in ('pending','accepted','rejected') then raise exception 'invalid review status'; end if;
  if p_status='rejected' and nullif(btrim(coalesce(p_note,'')),'') is null then raise exception 'review note required for rejection'; end if;
  select * into v_doc from public.provider_verification_documents where id=p_id;
  if v_doc.id is null then raise exception 'document not found'; end if;
  update public.provider_verification_documents
  set review_status=p_status,
      review_note=nullif(btrim(coalesce(p_note,'')),''),
      reviewed_by=v_uid,
      reviewed_at=case when p_status='pending' then null else now() end
  where id=p_id;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values(v_uid,'provider_verification_document',p_id::text,'provider_document_review',jsonb_build_object('review_status',v_doc.review_status),jsonb_build_object('review_status',p_status,'review_note',nullif(btrim(coalesce(p_note,'')),'')));
end;
$function$;

drop policy if exists profiles_mfa_opt_in_guard on public.profiles;
create policy profiles_mfa_opt_in_guard
on public.profiles
as restrictive
for select
to authenticated
using (private.mfa_session_allowed());

drop policy if exists provider_verification_documents_mfa_opt_in_guard on public.provider_verification_documents;
create policy provider_verification_documents_mfa_opt_in_guard
on public.provider_verification_documents
as restrictive
for select
to authenticated
using (private.mfa_session_allowed());

drop policy if exists specialists_mfa_private_read_guard on public.specialists;
create policy specialists_mfa_private_read_guard
on public.specialists
as restrictive
for select
to authenticated
using (
  (verification = 'verified'::public.verification_status and is_active = true)
  or private.mfa_session_allowed()
);

drop policy if exists specialists_mfa_insert_guard on public.specialists;
create policy specialists_mfa_insert_guard
on public.specialists
as restrictive
for insert
to authenticated
with check (private.mfa_session_allowed());

drop policy if exists centers_mfa_private_read_guard on public.centers;
create policy centers_mfa_private_read_guard
on public.centers
as restrictive
for select
to authenticated
using (
  (verification = 'verified'::public.verification_status and is_active = true)
  or private.mfa_session_allowed()
);

drop policy if exists centers_mfa_insert_guard on public.centers;
create policy centers_mfa_insert_guard
on public.centers
as restrictive
for insert
to authenticated
with check (private.mfa_session_allowed());

drop policy if exists storage_provider_verification_mfa_select_guard on storage.objects;
create policy storage_provider_verification_mfa_select_guard
on storage.objects
as restrictive
for select
to authenticated
using (bucket_id <> 'provider-verification' or private.mfa_session_allowed());

drop policy if exists storage_sensitive_mfa_insert_guard on storage.objects;
create policy storage_sensitive_mfa_insert_guard
on storage.objects
as restrictive
for insert
to authenticated
with check (bucket_id not in ('provider-verification','rawafid-media') or private.mfa_session_allowed());

drop policy if exists storage_rawafid_media_mfa_update_guard on storage.objects;
create policy storage_rawafid_media_mfa_update_guard
on storage.objects
as restrictive
for update
to authenticated
using (bucket_id <> 'rawafid-media' or private.mfa_session_allowed())
with check (bucket_id <> 'rawafid-media' or private.mfa_session_allowed());

drop policy if exists storage_sensitive_mfa_delete_guard on storage.objects;
create policy storage_sensitive_mfa_delete_guard
on storage.objects
as restrictive
for delete
to authenticated
using (bucket_id not in ('provider-verification','rawafid-media') or private.mfa_session_allowed());
