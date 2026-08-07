create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references public.profiles(id) on delete restrict,
  bucket_id text not null default 'rawafid-media',
  object_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 6291456),
  alt_text text not null check (char_length(btrim(alt_text)) between 3 and 500),
  caption text,
  purpose text not null default 'content' check (purpose in ('content','featured','profile','center','community','other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_assets_uploader_created_idx on public.media_assets(uploader_id,created_at desc);
create index if not exists media_assets_purpose_created_idx on public.media_assets(purpose,created_at desc);
create trigger media_assets_updated before update on public.media_assets for each row execute function public.set_updated_at();

alter table public.media_assets enable row level security;
revoke all on public.media_assets from anon,authenticated;
grant select on public.media_assets to authenticated;

create policy media_assets_select on public.media_assets for select to authenticated using (
  uploader_id=(select auth.uid()) or (select private.is_content_staff())
);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('rawafid-media','rawafid-media',true,6291456,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy rawafid_media_insert on storage.objects for insert to authenticated with check (
  bucket_id='rawafid-media'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_active=true and p.role in ('owner','admin','editor','specialist'))
);
create policy rawafid_media_update on storage.objects for update to authenticated using (
  bucket_id='rawafid-media'
  and (owner_id=(select auth.uid()::text) or (select private.is_admin()))
) with check (
  bucket_id='rawafid-media'
  and (owner_id=(select auth.uid()::text) or (select private.is_admin()))
);
create policy rawafid_media_delete on storage.objects for delete to authenticated using (
  bucket_id='rawafid-media'
  and (owner_id=(select auth.uid()::text) or (select private.is_admin()))
);

create or replace function private.register_media_asset(
  p_object_path text,
  p_file_name text,
  p_mime_type text,
  p_size_bytes bigint,
  p_alt_text text,
  p_caption text default null,
  p_purpose text default 'content'
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_role public.app_role;
  v_id uuid;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  if v_role not in ('owner','admin','editor','specialist') then raise exception 'media upload denied'; end if;
  if p_object_path is null or p_object_path !~ ('^' || v_uid::text || '/[A-Za-z0-9._/-]+$') then raise exception 'invalid object path'; end if;
  if p_mime_type not in ('image/jpeg','image/png','image/webp','image/avif') then raise exception 'unsupported media type'; end if;
  if p_size_bytes <= 0 or p_size_bytes > 6291456 then raise exception 'media file size invalid'; end if;
  if char_length(btrim(coalesce(p_alt_text,''))) < 3 or char_length(btrim(p_alt_text)) > 500 then raise exception 'alt text is required'; end if;
  if p_purpose not in ('content','featured','profile','center','community','other') then raise exception 'invalid media purpose'; end if;
  if not exists(select 1 from storage.objects o where o.bucket_id='rawafid-media' and o.name=p_object_path) then raise exception 'uploaded object not found'; end if;

  insert into public.media_assets(uploader_id,bucket_id,object_path,file_name,mime_type,size_bytes,alt_text,caption,purpose)
  values(v_uid,'rawafid-media',p_object_path,left(p_file_name,300),p_mime_type,p_size_bytes,btrim(p_alt_text),nullif(btrim(coalesce(p_caption,'')),''),p_purpose)
  returning id into v_id;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_uid,'media',v_id::text,'media_register',jsonb_build_object('object_path',p_object_path,'mime_type',p_mime_type,'size_bytes',p_size_bytes,'purpose',p_purpose));
  return v_id;
end;
$$;

create or replace function public.register_media_asset(
  p_object_path text,p_file_name text,p_mime_type text,p_size_bytes bigint,p_alt_text text,p_caption text default null,p_purpose text default 'content'
)
returns uuid language sql set search_path='' as $$
  select private.register_media_asset(p_object_path,p_file_name,p_mime_type,p_size_bytes,p_alt_text,p_caption,p_purpose);
$$;

create or replace function private.delete_media_asset(p_id uuid)
returns text
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_role public.app_role;
  v_asset public.media_assets%rowtype;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  select * into v_asset from public.media_assets where id=p_id;
  if v_asset.id is null then raise exception 'media asset not found'; end if;
  if not (v_asset.uploader_id=v_uid or v_role in ('owner','admin')) then raise exception 'media deletion denied'; end if;
  delete from public.media_assets where id=p_id;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data)
  values(v_uid,'media',p_id::text,'media_delete',jsonb_build_object('object_path',v_asset.object_path,'mime_type',v_asset.mime_type,'size_bytes',v_asset.size_bytes));
  return v_asset.object_path;
end;
$$;

create or replace function public.delete_media_asset(p_id uuid)
returns text language sql set search_path='' as $$ select private.delete_media_asset(p_id); $$;

revoke all on function private.register_media_asset(text,text,text,bigint,text,text,text) from public,anon;
revoke all on function private.delete_media_asset(uuid) from public,anon;
grant execute on function private.register_media_asset(text,text,text,bigint,text,text,text) to authenticated;
grant execute on function private.delete_media_asset(uuid) to authenticated;
revoke all on function public.register_media_asset(text,text,text,bigint,text,text,text) from public,anon;
revoke all on function public.delete_media_asset(uuid) from public,anon;
grant execute on function public.register_media_asset(text,text,text,bigint,text,text,text) to authenticated;
grant execute on function public.delete_media_asset(uuid) to authenticated;
