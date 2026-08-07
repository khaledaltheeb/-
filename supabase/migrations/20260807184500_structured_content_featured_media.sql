create or replace function private.validate_featured_media(p_url text,p_alt text)
returns jsonb
language plpgsql
immutable
set search_path=''
as $$
declare v_url text:=nullif(btrim(coalesce(p_url,'')),''); v_alt text:=nullif(btrim(coalesce(p_alt,'')),'');
begin
  if v_url is null then return jsonb_build_object('url',null,'alt',null); end if;
  if v_url !~* '^https://[^\s]+$' then raise exception 'featured image URL must use HTTPS'; end if;
  if v_alt is null or char_length(v_alt)<3 or char_length(v_alt)>500 then raise exception 'featured image alt text is required'; end if;
  return jsonb_build_object('url',v_url,'alt',v_alt);
end;
$$;

create or replace function private.create_content_draft_v4(
  p_content_type text,p_slug text,p_title text,p_body_json jsonb,p_excerpt text default null,p_body_text text default null,
  p_sector_id uuid default null,p_category_id uuid default null,p_audience text[] default '{}'::text[],p_search_aliases text[] default '{}'::text[],
  p_seo_title text default null,p_seo_description text default null,p_canonical_url text default null,p_robots_index boolean default true,p_robots_follow boolean default true,
  p_featured_image_url text default null,p_featured_image_alt text default null
)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_media jsonb;
begin
  v_media:=private.validate_featured_media(p_featured_image_url,p_featured_image_alt);
  v_id:=private.create_content_draft_v3(p_content_type,p_slug,p_title,p_body_json,p_excerpt,p_body_text,p_sector_id,p_category_id,p_audience,p_search_aliases,p_seo_title,p_seo_description,p_canonical_url,p_robots_index,p_robots_follow);
  update public.content set featured_image_url=v_media->>'url',featured_image_alt=v_media->>'alt' where id=v_id;
  update public.content_versions cv set snapshot=(select pg_catalog.to_jsonb(c) from public.content c where c.id=v_id) where cv.content_id=v_id and cv.version=1;
  return v_id;
end; $$;

create or replace function private.update_content_draft_v4(
  p_id uuid,p_content_type text,p_slug text,p_title text,p_body_json jsonb,p_excerpt text default null,p_body_text text default null,
  p_sector_id uuid default null,p_category_id uuid default null,p_audience text[] default '{}'::text[],p_search_aliases text[] default '{}'::text[],
  p_seo_title text default null,p_seo_description text default null,p_canonical_url text default null,p_robots_index boolean default true,p_robots_follow boolean default true,
  p_featured_image_url text default null,p_featured_image_alt text default null
)
returns integer language plpgsql security definer set search_path='' as $$
declare v_version integer; v_media jsonb;
begin
  v_media:=private.validate_featured_media(p_featured_image_url,p_featured_image_alt);
  v_version:=private.update_content_draft_v3(p_id,p_content_type,p_slug,p_title,p_body_json,p_excerpt,p_body_text,p_sector_id,p_category_id,p_audience,p_search_aliases,p_seo_title,p_seo_description,p_canonical_url,p_robots_index,p_robots_follow);
  update public.content set featured_image_url=v_media->>'url',featured_image_alt=v_media->>'alt' where id=p_id;
  update public.content_versions cv set snapshot=(select pg_catalog.to_jsonb(c) from public.content c where c.id=p_id) where cv.content_id=p_id and cv.version=v_version;
  return v_version;
end; $$;

create or replace function public.create_content_draft_v4(
  p_content_type text,p_slug text,p_title text,p_body_json jsonb,p_excerpt text default null,p_body_text text default null,
  p_sector_id uuid default null,p_category_id uuid default null,p_audience text[] default '{}'::text[],p_search_aliases text[] default '{}'::text[],
  p_seo_title text default null,p_seo_description text default null,p_canonical_url text default null,p_robots_index boolean default true,p_robots_follow boolean default true,
  p_featured_image_url text default null,p_featured_image_alt text default null
)
returns uuid language sql set search_path='' as $$ select private.create_content_draft_v4(p_content_type,p_slug,p_title,p_body_json,p_excerpt,p_body_text,p_sector_id,p_category_id,p_audience,p_search_aliases,p_seo_title,p_seo_description,p_canonical_url,p_robots_index,p_robots_follow,p_featured_image_url,p_featured_image_alt); $$;

create or replace function public.update_content_draft_v4(
  p_id uuid,p_content_type text,p_slug text,p_title text,p_body_json jsonb,p_excerpt text default null,p_body_text text default null,
  p_sector_id uuid default null,p_category_id uuid default null,p_audience text[] default '{}'::text[],p_search_aliases text[] default '{}'::text[],
  p_seo_title text default null,p_seo_description text default null,p_canonical_url text default null,p_robots_index boolean default true,p_robots_follow boolean default true,
  p_featured_image_url text default null,p_featured_image_alt text default null
)
returns integer language sql set search_path='' as $$ select private.update_content_draft_v4(p_id,p_content_type,p_slug,p_title,p_body_json,p_excerpt,p_body_text,p_sector_id,p_category_id,p_audience,p_search_aliases,p_seo_title,p_seo_description,p_canonical_url,p_robots_index,p_robots_follow,p_featured_image_url,p_featured_image_alt); $$;

revoke all on function private.validate_featured_media(text,text) from public,anon,authenticated;
revoke all on function private.create_content_draft_v4(text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean,text,text) from public,anon;
revoke all on function private.update_content_draft_v4(uuid,text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean,text,text) from public,anon;
grant execute on function private.create_content_draft_v4(text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean,text,text) to authenticated;
grant execute on function private.update_content_draft_v4(uuid,text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean,text,text) to authenticated;
revoke all on function public.create_content_draft_v4(text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean,text,text) from public,anon;
revoke all on function public.update_content_draft_v4(uuid,text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean,text,text) from public,anon;
grant execute on function public.create_content_draft_v4(text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean,text,text) to authenticated;
grant execute on function public.update_content_draft_v4(uuid,text,text,text,jsonb,text,text,uuid,uuid,text[],text[],text,text,text,boolean,boolean,text,text) to authenticated;
