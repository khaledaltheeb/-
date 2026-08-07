create extension if not exists pg_cron with schema extensions;

create or replace function private.schedule_content(p_id uuid, p_scheduled_at timestamptz)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.app_role;
  v_status public.content_status;
  v_version integer;
  v_snapshot jsonb;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  if v_role not in ('owner','admin') then raise exception 'admin required'; end if;
  if p_scheduled_at is null or p_scheduled_at < now() + interval '1 minute' then raise exception 'scheduled time must be in the future'; end if;
  select status into v_status from public.content where id=p_id for update;
  if v_status is null then raise exception 'content not found'; end if;
  if v_status <> 'approved'::public.content_status then raise exception 'only approved content can be scheduled'; end if;

  update public.content set status='scheduled'::public.content_status, scheduled_at=p_scheduled_at where id=p_id;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(max(version),0)+1 into v_version from public.content_versions where content_id=p_id;
  select to_jsonb(c) into v_snapshot from public.content c where c.id=p_id;
  insert into public.content_versions(content_id,version,snapshot,created_by) values(p_id,v_version,v_snapshot,(select auth.uid()));
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values((select auth.uid()),'content',p_id::text,'scheduled',jsonb_build_object('scheduled_at',p_scheduled_at));
  return p_scheduled_at;
end;
$$;

create or replace function public.schedule_content(p_id uuid, p_scheduled_at timestamptz)
returns timestamptz
language sql
security invoker
set search_path = ''
as $$ select private.schedule_content(p_id,p_scheduled_at); $$;
revoke all on function public.schedule_content(uuid,timestamptz) from public,anon;
grant execute on function public.schedule_content(uuid,timestamptz) to authenticated,service_role;
revoke all on function private.schedule_content(uuid,timestamptz) from public,anon;
grant execute on function private.schedule_content(uuid,timestamptz) to authenticated,service_role;

create or replace function private.publish_due_content()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row record;
  v_version integer;
  v_snapshot jsonb;
  v_count integer := 0;
begin
  for v_row in
    update public.content
       set status='published'::public.content_status,
           published_at=coalesce(published_at,now())
     where status='scheduled'::public.content_status
       and scheduled_at is not null
       and scheduled_at <= now()
     returning id
  loop
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_row.id::text));
    select coalesce(max(version),0)+1 into v_version from public.content_versions where content_id=v_row.id;
    select to_jsonb(c) into v_snapshot from public.content c where c.id=v_row.id;
    insert into public.content_versions(content_id,version,snapshot,created_by) values(v_row.id,v_version,v_snapshot,null);
    insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
    values(null,'content',v_row.id::text,'scheduled_publish',jsonb_build_object('published_at',now()));
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
revoke all on function private.publish_due_content() from public,anon,authenticated;
grant execute on function private.publish_due_content() to service_role;

create or replace function private.restore_content_version(p_content_id uuid, p_version integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.app_role;
  v_snapshot jsonb;
  v_old public.content%rowtype;
  v_new_version integer;
  v_new_snapshot jsonb;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  if v_role not in ('owner','admin') then raise exception 'admin required'; end if;
  if p_version < 1 then raise exception 'invalid version'; end if;
  select snapshot into v_snapshot from public.content_versions where content_id=p_content_id and version=p_version;
  if v_snapshot is null then raise exception 'version not found'; end if;
  select * into v_old from jsonb_populate_record(null::public.content,v_snapshot);
  perform 1 from public.content where id=p_content_id for update;
  if not found then raise exception 'content not found'; end if;

  update public.content set
    content_type=v_old.content_type,slug=v_old.slug,title=v_old.title,excerpt=v_old.excerpt,
    body_json=coalesce(v_old.body_json,'{}'::jsonb),body_text=v_old.body_text,
    sector_id=v_old.sector_id,category_id=v_old.category_id,audience=coalesce(v_old.audience,'{}'::text[]),
    search_aliases=coalesce(v_old.search_aliases,'{}'::text[]),seo_title=v_old.seo_title,seo_description=v_old.seo_description,
    canonical_url=v_old.canonical_url,robots_index=v_old.robots_index,robots_follow=v_old.robots_follow,
    schema_json=coalesce(v_old.schema_json,'{}'::jsonb),featured_image_url=v_old.featured_image_url,featured_image_alt=v_old.featured_image_alt,
    primary_keyword=v_old.primary_keyword,secondary_keywords=coalesce(v_old.secondary_keywords,'{}'::text[]),
    semantic_terms=coalesce(v_old.semantic_terms,'{}'::text[]),search_intent=v_old.search_intent,
    author_display_name=v_old.author_display_name,scientific_reviewer_id=v_old.scientific_reviewer_id,
    reviewer_display_name=v_old.reviewer_display_name,reviewer_credentials=v_old.reviewer_credentials,
    last_reviewed_at=v_old.last_reviewed_at,references_json=coalesce(v_old.references_json,'[]'::jsonb),
    medical_disclaimer=v_old.medical_disclaimer,status='draft'::public.content_status,scheduled_at=null,published_at=null
  where id=p_content_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_content_id::text));
  select coalesce(max(version),0)+1 into v_new_version from public.content_versions where content_id=p_content_id;
  select to_jsonb(c) into v_new_snapshot from public.content c where c.id=p_content_id;
  insert into public.content_versions(content_id,version,snapshot,created_by) values(p_content_id,v_new_version,v_new_snapshot,(select auth.uid()));
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values((select auth.uid()),'content',p_content_id::text,'version_restored',jsonb_build_object('source_version',p_version),jsonb_build_object('new_version',v_new_version));
  return v_new_version;
end;
$$;

create or replace function public.restore_content_version(p_content_id uuid,p_version integer)
returns integer
language sql
security invoker
set search_path = ''
as $$ select private.restore_content_version(p_content_id,p_version); $$;
revoke all on function public.restore_content_version(uuid,integer) from public,anon;
grant execute on function public.restore_content_version(uuid,integer) to authenticated,service_role;
revoke all on function private.restore_content_version(uuid,integer) from public,anon;
grant execute on function private.restore_content_version(uuid,integer) to authenticated,service_role;

create or replace function private.transition_content_status(p_id uuid, p_target public.content_status)
returns public.content_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current public.content_status;
  v_role public.app_role;
  v_author uuid;
  v_allowed boolean := false;
  v_version integer;
  v_snapshot jsonb;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  select status,author_id into v_current,v_author from public.content where id=p_id for update;
  if v_current is null then raise exception 'content not found'; end if;

  if v_role in ('owner','admin') then
    v_allowed := (v_current='draft' and p_target='scientific_review')
      or (v_current='scientific_review' and p_target in ('draft','editorial_review'))
      or (v_current='editorial_review' and p_target in ('draft','seo_review'))
      or (v_current='seo_review' and p_target in ('editorial_review','accessibility_review'))
      or (v_current='accessibility_review' and p_target in ('editorial_review','approved'))
      or (v_current='approved' and p_target='editorial_review')
      or (v_current='scheduled' and p_target='approved')
      or (v_current='published' and p_target='archived')
      or (v_current='archived' and p_target='draft');
  elsif v_role='specialist' or v_role='editor' then
    if v_current='draft' and p_target='scientific_review' and (v_role='editor' or v_author=(select auth.uid())) then v_allowed:=true; end if;
    if v_role='editor' and v_current='editorial_review' and p_target in ('draft','seo_review') then v_allowed:=true; end if;
    if v_role='editor' and v_current='accessibility_review' and p_target in ('editorial_review','approved') then v_allowed:=true; end if;
  elsif v_role='scientific_reviewer' then
    if v_current='scientific_review' and p_target in ('draft','editorial_review') then v_allowed:=true; end if;
  elsif v_role='seo_manager' then
    if v_current='seo_review' and p_target in ('editorial_review','accessibility_review') then v_allowed:=true; end if;
  end if;
  if not v_allowed then raise exception 'workflow transition denied'; end if;

  update public.content set status=p_target,
    scheduled_at=case when v_current='scheduled' and p_target='approved' then null else scheduled_at end,
    published_at=case when p_target='draft' and v_current='archived' then null else published_at end
  where id=p_id;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(max(version),0)+1 into v_version from public.content_versions where content_id=p_id;
  select to_jsonb(c) into v_snapshot from public.content c where c.id=p_id;
  insert into public.content_versions(content_id,version,snapshot,created_by) values(p_id,v_version,v_snapshot,(select auth.uid()));
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values((select auth.uid()),'content',p_id::text,'status_transition',jsonb_build_object('from',v_current,'to',p_target));
  return p_target;
end;
$$;

select cron.schedule('rawafid-publish-due-content','* * * * *','select private.publish_due_content();')
where not exists (select 1 from cron.job where jobname='rawafid-publish-due-content');
