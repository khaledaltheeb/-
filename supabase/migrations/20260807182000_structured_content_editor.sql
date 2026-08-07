-- Rawafid V3 structured content editor.
-- Keeps existing RPCs intact while introducing a block-aware transactional path.

create or replace function private.validate_content_body_v3(p_body_json jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_body_json is null or pg_catalog.jsonb_typeof(p_body_json) <> 'object' then
    raise exception 'body_json must be an object';
  end if;
  if not (p_body_json ? 'blocks') or pg_catalog.jsonb_typeof(p_body_json -> 'blocks') <> 'array' then
    raise exception 'body_json.blocks must be an array';
  end if;
  if pg_catalog.jsonb_array_length(p_body_json -> 'blocks') > 500 then
    raise exception 'body_json contains too many blocks';
  end if;
  return p_body_json;
end;
$$;

create or replace function private.create_content_draft_v3(
  p_content_type text,
  p_slug text,
  p_title text,
  p_body_json jsonb,
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
  v_body jsonb;
begin
  v_body := private.validate_content_body_v3(p_body_json);
  v_id := private.create_content_draft(
    p_content_type, p_slug, p_title, p_excerpt, p_body_text, p_sector_id, p_category_id,
    p_audience, p_search_aliases, p_seo_title, p_seo_description, p_canonical_url,
    p_robots_index, p_robots_follow
  );

  update public.content set body_json = v_body where id = v_id;
  update public.content_versions cv
  set snapshot = (select pg_catalog.to_jsonb(c) from public.content c where c.id = v_id)
  where cv.content_id = v_id and cv.version = 1;

  return v_id;
end;
$$;

create or replace function private.update_content_draft_v3(
  p_id uuid,
  p_content_type text,
  p_slug text,
  p_title text,
  p_body_json jsonb,
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
  v_body jsonb;
begin
  v_body := private.validate_content_body_v3(p_body_json);
  v_version := private.update_content_draft(
    p_id, p_content_type, p_slug, p_title, p_excerpt, p_body_text, p_sector_id, p_category_id,
    p_audience, p_search_aliases, p_seo_title, p_seo_description, p_canonical_url,
    p_robots_index, p_robots_follow
  );

  update public.content set body_json = v_body where id = p_id;
  update public.content_versions cv
  set snapshot = (select pg_catalog.to_jsonb(c) from public.content c where c.id = p_id)
  where cv.content_id = p_id and cv.version = v_version;

  return v_version;
end;
$$;

create or replace function public.create_content_draft_v3(
  p_content_type text,
  p_slug text,
  p_title text,
  p_body_json jsonb,
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
language sql
set search_path = ''
as $$
  select private.create_content_draft_v3(
    p_content_type, p_slug, p_title, p_body_json, p_excerpt, p_body_text, p_sector_id, p_category_id,
    p_audience, p_search_aliases, p_seo_title, p_seo_description, p_canonical_url,
    p_robots_index, p_robots_follow
  );
$$;

create or replace function public.update_content_draft_v3(
  p_id uuid,
  p_content_type text,
  p_slug text,
  p_title text,
  p_body_json jsonb,
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
language sql
set search_path = ''
as $$
  select private.update_content_draft_v3(
    p_id, p_content_type, p_slug, p_title, p_body_json, p_excerpt, p_body_text, p_sector_id, p_category_id,
    p_audience, p_search_aliases, p_seo_title, p_seo_description, p_canonical_url,
    p_robots_index, p_robots_follow
  );
$$;

revoke all on function private.validate_content_body_v3(jsonb) from public, anon;
revoke all on function private.create_content_draft_v3(text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public, anon;
revoke all on function private.update_content_draft_v3(uuid,text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public, anon;
grant execute on function private.create_content_draft_v3(text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated;
grant execute on function private.update_content_draft_v3(uuid,text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated;

revoke all on function public.create_content_draft_v3(text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public, anon;
revoke all on function public.update_content_draft_v3(uuid,text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public, anon;
grant execute on function public.create_content_draft_v3(text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated;
grant execute on function public.update_content_draft_v3(uuid,text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated;
