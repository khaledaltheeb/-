alter extension pg_trgm set schema extensions;

alter function public.create_content_draft(text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) set schema private;
alter function public.update_content_draft(uuid,text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) set schema private;
alter function public.transition_content_status(uuid,public.content_status) set schema private;

revoke all on function private.create_content_draft(text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public, anon;
revoke all on function private.update_content_draft(uuid,text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public, anon;
revoke all on function private.transition_content_status(uuid,public.content_status) from public, anon;

grant usage on schema private to authenticated;
grant execute on function private.create_content_draft(text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated;
grant execute on function private.update_content_draft(uuid,text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated;
grant execute on function private.transition_content_status(uuid,public.content_status) to authenticated;

create function public.create_content_draft(
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
language sql
security invoker
set search_path = ''
as $$
  select private.create_content_draft(
    p_content_type,p_slug,p_title,p_excerpt,p_body_text,p_sector_id,p_category_id,
    p_audience,p_search_aliases,p_seo_title,p_seo_description,p_canonical_url,p_robots_index,p_robots_follow
  );
$$;

create function public.update_content_draft(
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
language sql
security invoker
set search_path = ''
as $$
  select private.update_content_draft(
    p_id,p_content_type,p_slug,p_title,p_excerpt,p_body_text,p_sector_id,p_category_id,
    p_audience,p_search_aliases,p_seo_title,p_seo_description,p_canonical_url,p_robots_index,p_robots_follow
  );
$$;

create function public.transition_content_status(p_id uuid, p_target public.content_status)
returns public.content_status
language sql
security invoker
set search_path = ''
as $$
  select private.transition_content_status(p_id,p_target);
$$;

revoke all on function public.create_content_draft(text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public, anon;
revoke all on function public.update_content_draft(uuid,text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) from public, anon;
revoke all on function public.transition_content_status(uuid,public.content_status) from public, anon;

grant execute on function public.create_content_draft(text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated, service_role;
grant execute on function public.update_content_draft(uuid,text,text,text,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean) to authenticated, service_role;
grant execute on function public.transition_content_status(uuid,public.content_status) to authenticated, service_role;
