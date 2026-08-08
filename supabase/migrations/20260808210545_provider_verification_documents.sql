create table if not exists public.provider_verification_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider_type text not null check (provider_type in ('specialist','center')),
  document_type text not null check (document_type in ('identity','license','qualification','registration','insurance','other')),
  bucket_id text not null default 'provider-verification' check (bucket_id='provider-verification'),
  object_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 300),
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png','image/webp')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  review_status text not null default 'pending' check (review_status in ('pending','accepted','rejected')),
  review_note text check (review_note is null or char_length(review_note) <= 2000),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists provider_verification_documents_user_idx on public.provider_verification_documents(user_id,provider_type,created_at desc);
create index if not exists provider_verification_documents_review_idx on public.provider_verification_documents(review_status,created_at desc);
create trigger provider_verification_documents_updated before update on public.provider_verification_documents for each row execute function public.set_updated_at();

alter table public.provider_verification_documents enable row level security;
revoke all on public.provider_verification_documents from anon,authenticated;
grant select on public.provider_verification_documents to authenticated;

create policy provider_verification_documents_select on public.provider_verification_documents
for select to authenticated using (user_id=(select auth.uid()) or (select private.is_admin()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('provider-verification','provider-verification',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy provider_verification_storage_insert on storage.objects for insert to authenticated with check (
  bucket_id='provider-verification'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_active=true and p.role='user')
);
create policy provider_verification_storage_select on storage.objects for select to authenticated using (
  bucket_id='provider-verification'
  and ((owner_id=(select auth.uid()::text)) or (select private.is_admin()))
);
create policy provider_verification_storage_delete on storage.objects for delete to authenticated using (
  bucket_id='provider-verification'
  and ((owner_id=(select auth.uid()::text)) or (select private.is_admin()))
);

create or replace function private.provider_application_exists(p_uid uuid,p_provider_type text)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select case
    when p_provider_type='specialist' then exists(select 1 from public.specialists s where s.user_id=p_uid and s.verification in ('unverified','pending','rejected'))
    when p_provider_type='center' then exists(select 1 from public.centers c where c.manager_user_id=p_uid and c.parent_center_id is null and c.verification in ('unverified','pending','rejected'))
    else false
  end;
$$;

create or replace function private.register_provider_verification_document(
  p_provider_type text,
  p_document_type text,
  p_object_path text,
  p_file_name text,
  p_mime_type text,
  p_size_bytes bigint
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if private.current_role() <> 'user' then raise exception 'provider document upload is only available during application review'; end if;
  if p_provider_type not in ('specialist','center') then raise exception 'invalid provider type'; end if;
  if not private.provider_application_exists(v_uid,p_provider_type) then raise exception 'matching provider application not found'; end if;
  if p_document_type not in ('identity','license','qualification','registration','insurance','other') then raise exception 'invalid document type'; end if;
  if p_object_path is null or p_object_path !~ ('^' || v_uid::text || '/' || p_provider_type || '/[A-Za-z0-9._/-]+$') then raise exception 'invalid object path'; end if;
  if p_mime_type not in ('application/pdf','image/jpeg','image/png','image/webp') then raise exception 'unsupported document type'; end if;
  if p_size_bytes <= 0 or p_size_bytes > 10485760 then raise exception 'document file size invalid'; end if;
  if not exists(select 1 from storage.objects o where o.bucket_id='provider-verification' and o.name=p_object_path) then raise exception 'uploaded object not found'; end if;

  insert into public.provider_verification_documents(user_id,provider_type,document_type,object_path,file_name,mime_type,size_bytes)
  values(v_uid,p_provider_type,p_document_type,p_object_path,left(p_file_name,300),p_mime_type,p_size_bytes)
  returning id into v_id;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_uid,'provider_verification_document',v_id::text,'provider_document_register',jsonb_build_object('provider_type',p_provider_type,'document_type',p_document_type,'mime_type',p_mime_type,'size_bytes',p_size_bytes));
  return v_id;
end;
$$;

create or replace function public.register_provider_verification_document(
  p_provider_type text,p_document_type text,p_object_path text,p_file_name text,p_mime_type text,p_size_bytes bigint
)
returns uuid language sql set search_path='' as $$
  select private.register_provider_verification_document(p_provider_type,p_document_type,p_object_path,p_file_name,p_mime_type,p_size_bytes);
$$;

create or replace function private.delete_provider_verification_document(p_id uuid)
returns text
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_doc public.provider_verification_documents%rowtype;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  select * into v_doc from public.provider_verification_documents where id=p_id;
  if v_doc.id is null or v_doc.user_id<>v_uid then raise exception 'document not found'; end if;
  if v_doc.review_status='accepted' then raise exception 'accepted document cannot be deleted during review'; end if;
  if not private.provider_application_exists(v_uid,v_doc.provider_type) then raise exception 'application is not editable'; end if;
  delete from public.provider_verification_documents where id=p_id;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data)
  values(v_uid,'provider_verification_document',p_id::text,'provider_document_delete',jsonb_build_object('provider_type',v_doc.provider_type,'document_type',v_doc.document_type,'object_path',v_doc.object_path));
  return v_doc.object_path;
end;
$$;

create or replace function public.delete_provider_verification_document(p_id uuid)
returns text language sql set search_path='' as $$ select private.delete_provider_verification_document(p_id); $$;

create or replace function private.admin_review_provider_verification_document(p_id uuid,p_status text,p_note text default null)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_doc public.provider_verification_documents%rowtype;
begin
  if v_uid is null or not private.is_admin() then raise exception 'admin access required'; end if;
  if p_status not in ('pending','accepted','rejected') then raise exception 'invalid review status'; end if;
  if p_status='rejected' and nullif(btrim(coalesce(p_note,'')),'') is null then raise exception 'review note required for rejection'; end if;
  select * into v_doc from public.provider_verification_documents where id=p_id;
  if v_doc.id is null then raise exception 'document not found'; end if;
  update public.provider_verification_documents
  set review_status=p_status,review_note=nullif(btrim(coalesce(p_note,'')),''),reviewed_by=v_uid,reviewed_at=case when p_status='pending' then null else now() end
  where id=p_id;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values(v_uid,'provider_verification_document',p_id::text,'provider_document_review',jsonb_build_object('review_status',v_doc.review_status),jsonb_build_object('review_status',p_status,'review_note',nullif(btrim(coalesce(p_note,'')),'')));
end;
$$;

create or replace function public.admin_review_provider_verification_document(p_id uuid,p_status text,p_note text default null)
returns void language sql set search_path='' as $$ select private.admin_review_provider_verification_document(p_id,p_status,p_note); $$;

revoke all on function private.provider_application_exists(uuid,text) from public,anon,authenticated;
revoke all on function private.register_provider_verification_document(text,text,text,text,text,bigint) from public,anon,authenticated;
revoke all on function private.delete_provider_verification_document(uuid) from public,anon,authenticated;
revoke all on function private.admin_review_provider_verification_document(uuid,text,text) from public,anon,authenticated;
revoke all on function public.register_provider_verification_document(text,text,text,text,text,bigint) from public,anon;
revoke all on function public.delete_provider_verification_document(uuid) from public,anon;
revoke all on function public.admin_review_provider_verification_document(uuid,text,text) from public,anon;
grant execute on function public.register_provider_verification_document(text,text,text,text,text,bigint) to authenticated;
grant execute on function public.delete_provider_verification_document(uuid) to authenticated;
grant execute on function public.admin_review_provider_verification_document(uuid,text,text) to authenticated;
