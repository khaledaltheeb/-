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
set search_path = ''
as $$
declare
  v_id uuid;
  v_snapshot jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;

  if p_category_id is not null and p_sector_id is not null and not exists (
    select 1 from public.categories c where c.id = p_category_id and c.sector_id = p_sector_id
  ) then
    raise exception 'category does not belong to sector';
  end if;

  insert into public.content(
    content_type, slug, title, excerpt, body_text, body_json,
    sector_id, category_id, audience, search_aliases, author_id,
    seo_title, seo_description, canonical_url, robots_index, robots_follow,
    status
  ) values (
    p_content_type, p_slug, p_title, nullif(p_excerpt, ''), nullif(p_body_text, ''),
    jsonb_build_object('version', 1, 'format', 'plain_text'),
    p_sector_id, p_category_id, coalesce(p_audience, '{}'::text[]), coalesce(p_search_aliases, '{}'::text[]), (select auth.uid()),
    nullif(p_seo_title, ''), nullif(p_seo_description, ''), nullif(p_canonical_url, ''), p_robots_index, p_robots_follow,
    'draft'::public.content_status
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
set search_path = ''
as $$
declare
  v_version integer;
  v_snapshot jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;

  if p_category_id is not null and p_sector_id is not null and not exists (
    select 1 from public.categories c where c.id = p_category_id and c.sector_id = p_sector_id
  ) then
    raise exception 'category does not belong to sector';
  end if;

  update public.content
  set content_type = p_content_type,
      slug = p_slug,
      title = p_title,
      excerpt = nullif(p_excerpt, ''),
      body_text = nullif(p_body_text, ''),
      body_json = jsonb_build_object('version', 1, 'format', 'plain_text'),
      sector_id = p_sector_id,
      category_id = p_category_id,
      audience = coalesce(p_audience, '{}'::text[]),
      search_aliases = coalesce(p_search_aliases, '{}'::text[]),
      seo_title = nullif(p_seo_title, ''),
      seo_description = nullif(p_seo_description, ''),
      canonical_url = nullif(p_canonical_url, ''),
      robots_index = p_robots_index,
      robots_follow = p_robots_follow
  where id = p_id;

  if not found then
    raise exception 'content not found or update denied';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_id::text));
  select coalesce(max(version), 0) + 1 into v_version
  from public.content_versions where content_id = p_id;

  select to_jsonb(c) into v_snapshot from public.content c where c.id = p_id;
  insert into public.content_versions(content_id, version, snapshot, created_by)
  values(p_id, v_version, v_snapshot, (select auth.uid()));

  return v_version;
end;
$$;

revoke all on function public.create_content_draft(text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public;
grant execute on function public.create_content_draft(text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated;

revoke all on function public.update_content_draft(uuid,text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public;
grant execute on function public.update_content_draft(uuid,text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated;
