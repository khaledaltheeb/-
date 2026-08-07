create or replace function private.delete_content_draft(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.app_role;
  v_author uuid;
  v_status public.content_status;
  v_title text;
  v_slug text;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  select author_id,status,title,slug into v_author,v_status,v_title,v_slug from public.content where id=p_id;
  if v_status is null then raise exception 'content not found'; end if;
  if v_status <> 'draft'::public.content_status then raise exception 'only drafts can be permanently deleted'; end if;

  if v_role in ('owner','admin') then
    null;
  elsif v_role='specialist' and v_author=(select auth.uid()) then
    null;
  else
    raise exception 'draft deletion denied';
  end if;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data)
  values((select auth.uid()),'content',p_id::text,'draft_delete',jsonb_build_object('title',v_title,'slug',v_slug,'status',v_status));
  delete from public.content where id=p_id;
  return true;
end;
$$;

create or replace function public.delete_content_draft(p_id uuid)
returns boolean
language sql
set search_path = ''
as $$ select private.delete_content_draft(p_id); $$;

revoke all on function private.delete_content_draft(uuid) from public,anon;
grant execute on function private.delete_content_draft(uuid) to authenticated;
revoke all on function public.delete_content_draft(uuid) from public,anon;
grant execute on function public.delete_content_draft(uuid) to authenticated;
