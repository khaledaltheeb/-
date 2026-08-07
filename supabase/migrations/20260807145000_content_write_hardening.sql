create or replace function public.create_content_draft(
  p_content_type text,
  p_slug text,
  p_title text,
  p_excerpt text default null,
  p_body_text text default null,
  p_sector_id uuid default null,
  p_category_id uuid default null,
  p_audience text[] default '{}'::text[],
  p_search_aliases text[] default '{}'::text[],
  p_seo_title text default null,
  p_seo_description text default null,
  p_canonical_url text default null,
  p_robots_index boolean default true,
  p_robots_follow boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_snapshot jsonb;
  v_role public.app_role;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  if v_role not in ('owner','admin','editor','specialist') then raise exception 'role cannot create content'; end if;
  if v_role = 'specialist' and p_content_type not in ('article','guide','resource') then raise exception 'specialist content type denied'; end if;

  if p_category_id is not null and p_sector_id is not null and not exists (
    select 1 from public.categories c where c.id = p_category_id and c.sector_id = p_sector_id
  ) then raise exception 'category does not belong to sector'; end if;

  insert into public.content(
    content_type, slug, title, excerpt, body_text, body_json, sector_id, category_id,
    audience, search_aliases, author_id, seo_title, seo_description, canonical_url,
    robots_index, robots_follow, status
  ) values (
    p_content_type, p_slug, p_title, nullif(p_excerpt, ''), nullif(p_body_text, ''),
    jsonb_build_object('version', 1, 'format', 'plain_text'), p_sector_id, p_category_id,
    coalesce(p_audience, '{}'::text[]), coalesce(p_search_aliases, '{}'::text[]), (select auth.uid()),
    nullif(p_seo_title, ''), nullif(p_seo_description, ''), nullif(p_canonical_url, ''),
    p_robots_index, p_robots_follow, 'draft'::public.content_status
  ) returning id into v_id;

  select to_jsonb(c) into v_snapshot from public.content c where c.id = v_id;
  insert into public.content_versions(content_id, version, snapshot, created_by)
  values(v_id, 1, v_snapshot, (select auth.uid()));
  return v_id;
end;
$$;

create or replace function public.update_content_draft(
  p_id uuid,
  p_content_type text,
  p_slug text,
  p_title text,
  p_excerpt text default null,
  p_body_text text default null,
  p_sector_id uuid default null,
  p_category_id uuid default null,
  p_audience text[] default '{}'::text[],
  p_search_aliases text[] default '{}'::text[],
  p_seo_title text default null,
  p_seo_description text default null,
  p_canonical_url text default null,
  p_robots_index boolean default true,
  p_robots_follow boolean default true
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version integer;
  v_snapshot jsonb;
  v_role public.app_role;
  v_author uuid;
  v_status public.content_status;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  select author_id, status into v_author, v_status from public.content where id = p_id;
  if v_status is null then raise exception 'content not found'; end if;

  if v_role in ('owner','admin') then
    if v_status not in ('draft','scientific_review','editorial_review','seo_review','accessibility_review') then raise exception 'locked content state'; end if;
  elsif v_role = 'editor' then
    if v_status not in ('draft','editorial_review','accessibility_review') then raise exception 'editor cannot modify this state'; end if;
  elsif v_role = 'specialist' then
    if v_author <> (select auth.uid()) or v_status <> 'draft' then raise exception 'specialist update denied'; end if;
    if p_content_type not in ('article','guide','resource') then raise exception 'specialist content type denied'; end if;
  else
    raise exception 'role cannot edit content';
  end if;

  if p_category_id is not null and p_sector_id is not null and not exists (
    select 1 from public.categories c where c.id = p_category_id and c.sector_id = p_sector_id
  ) then raise exception 'category does not belong to sector'; end if;

  update public.content
  set content_type = p_content_type, slug = p_slug, title = p_title,
      excerpt = nullif(p_excerpt, ''), body_text = nullif(p_body_text, ''),
      body_json = jsonb_build_object('version', 1, 'format', 'plain_text'),
      sector_id = p_sector_id, category_id = p_category_id,
      audience = coalesce(p_audience, '{}'::text[]), search_aliases = coalesce(p_search_aliases, '{}'::text[]),
      seo_title = nullif(p_seo_title, ''), seo_description = nullif(p_seo_description, ''),
      canonical_url = nullif(p_canonical_url, ''), robots_index = p_robots_index, robots_follow = p_robots_follow
  where id = p_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(max(version), 0) + 1 into v_version from public.content_versions where content_id = p_id;
  select to_jsonb(c) into v_snapshot from public.content c where c.id = p_id;
  insert into public.content_versions(content_id, version, snapshot, created_by)
  values(p_id, v_version, v_snapshot, (select auth.uid()));
  return v_version;
end;
$$;

create or replace function public.transition_content_status(p_id uuid, p_target public.content_status)
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
  select status, author_id into v_current, v_author from public.content where id = p_id;
  if v_current is null then raise exception 'content not found'; end if;

  if v_role in ('owner','admin') then
    v_allowed := (v_current = 'draft' and p_target = 'scientific_review')
      or (v_current = 'scientific_review' and p_target in ('draft','editorial_review'))
      or (v_current = 'editorial_review' and p_target in ('draft','seo_review'))
      or (v_current = 'seo_review' and p_target in ('editorial_review','accessibility_review'))
      or (v_current = 'accessibility_review' and p_target in ('editorial_review','approved'))
      or (v_current = 'approved' and p_target in ('editorial_review','published'))
      or (v_current = 'published' and p_target = 'archived')
      or (v_current = 'archived' and p_target = 'draft');
  elsif v_role = 'specialist' or v_role = 'editor' then
    if v_current = 'draft' and p_target = 'scientific_review' and (v_role = 'editor' or v_author = (select auth.uid())) then v_allowed := true; end if;
    if v_role = 'editor' and v_current = 'editorial_review' and p_target in ('draft','seo_review') then v_allowed := true; end if;
    if v_role = 'editor' and v_current = 'accessibility_review' and p_target in ('editorial_review','approved') then v_allowed := true; end if;
  elsif v_role = 'scientific_reviewer' then
    if v_current = 'scientific_review' and p_target in ('draft','editorial_review') then v_allowed := true; end if;
  elsif v_role = 'seo_manager' then
    if v_current = 'seo_review' and p_target in ('editorial_review','accessibility_review') then v_allowed := true; end if;
  end if;

  if not v_allowed then raise exception 'workflow transition denied'; end if;

  update public.content
  set status = p_target,
      published_at = case
        when p_target = 'published' then coalesce(published_at, now())
        when p_target = 'draft' and v_current = 'archived' then null
        else published_at
      end
  where id = p_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(max(version), 0) + 1 into v_version from public.content_versions where content_id = p_id;
  select to_jsonb(c) into v_snapshot from public.content c where c.id = p_id;
  insert into public.content_versions(content_id, version, snapshot, created_by)
  values(p_id, v_version, v_snapshot, (select auth.uid()));

  insert into public.audit_logs(actor_id, entity_type, entity_id, action, after_data)
  values((select auth.uid()), 'content', p_id::text, 'status_transition', jsonb_build_object('from', v_current, 'to', p_target));

  return p_target;
end;
$$;

revoke insert, update, delete on public.content from authenticated;
revoke insert, update, delete on public.content_versions from authenticated;

revoke all on function public.create_content_draft(text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public;
grant execute on function public.create_content_draft(text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated;
revoke all on function public.update_content_draft(uuid,text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public;
grant execute on function public.update_content_draft(uuid,text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated;
revoke all on function public.transition_content_status(uuid,public.content_status) from public;
grant execute on function public.transition_content_status(uuid,public.content_status) to authenticated;
