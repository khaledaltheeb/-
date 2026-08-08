create or replace function private.provider_verification_upload_allowed(p_uid uuid,p_provider_type text)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select
    p_uid is not null
    and p_provider_type in ('specialist','center')
    and private.provider_application_exists(p_uid,p_provider_type)
    and (
      select count(*)
      from storage.objects o
      where o.bucket_id='provider-verification'
        and o.name like (p_uid::text || '/' || p_provider_type || '/%')
    ) < 20;
$$;

revoke all on function private.provider_verification_upload_allowed(uuid,text) from public,anon;
grant execute on function private.provider_verification_upload_allowed(uuid,text) to authenticated;

drop policy if exists provider_verification_storage_insert on storage.objects;
create policy provider_verification_storage_insert on storage.objects
for insert to authenticated
with check (
  bucket_id='provider-verification'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and (storage.foldername(name))[2] in ('specialist','center')
  and coalesce(array_length(storage.foldername(name),1),0)=2
  and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_active=true and p.role='user')
  and private.provider_verification_upload_allowed((select auth.uid()),(storage.foldername(name))[2])
);

drop policy if exists provider_verification_storage_delete on storage.objects;
create policy provider_verification_storage_delete on storage.objects
for delete to authenticated
using (
  bucket_id='provider-verification'
  and (
    (select private.is_admin())
    or (
      owner_id=(select auth.uid()::text)
      and not exists(
        select 1
        from public.provider_verification_documents d
        where d.object_path=name
      )
    )
  )
);
