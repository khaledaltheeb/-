-- Synchronize the production CMS integrity hardening applied during the end-to-end audit.
-- This migration is intentionally idempotent with the already-applied production migration
-- version 20260821113049.

create or replace function private.restore_content_version(p_content_id uuid, p_version integer)
returns integer
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_role public.app_role;
  v_snapshot jsonb;
  v_old public.content%rowtype;
  v_current_status public.content_status;
  v_new_version integer;
  v_new_snapshot jsonb;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  if v_role not in ('owner','admin') then raise exception 'admin required'; end if;
  if p_version < 1 then raise exception 'invalid version'; end if;

  select status into v_current_status from public.content where id=p_content_id for update;
  if v_current_status is null then raise exception 'content not found'; end if;
  if v_current_status in ('published'::public.content_status,'scheduled'::public.content_status) then
    raise exception 'live or scheduled content must be explicitly withdrawn before restoring a historical version';
  end if;

  select snapshot into v_snapshot
  from public.content_versions
  where content_id=p_content_id and version=p_version;
  if v_snapshot is null then raise exception 'version not found'; end if;

  select * into v_old from jsonb_populate_record(null::public.content,v_snapshot);
  update public.content set
    content_type=v_old.content_type,slug=v_old.slug,title=v_old.title,excerpt=v_old.excerpt,
    body_json=coalesce(v_old.body_json,'{}'::jsonb),body_text=v_old.body_text,
    sector_id=v_old.sector_id,category_id=v_old.category_id,
    audience=coalesce(v_old.audience,'{}'::text[]),search_aliases=coalesce(v_old.search_aliases,'{}'::text[]),
    seo_title=v_old.seo_title,seo_description=v_old.seo_description,canonical_url=v_old.canonical_url,
    robots_index=v_old.robots_index,robots_follow=v_old.robots_follow,
    schema_json=coalesce(v_old.schema_json,'{}'::jsonb),featured_image_url=v_old.featured_image_url,
    featured_image_alt=v_old.featured_image_alt,primary_keyword=v_old.primary_keyword,
    secondary_keywords=coalesce(v_old.secondary_keywords,'{}'::text[]),semantic_terms=coalesce(v_old.semantic_terms,'{}'::text[]),
    search_intent=v_old.search_intent,author_display_name=v_old.author_display_name,
    scientific_reviewer_id=v_old.scientific_reviewer_id,reviewer_display_name=v_old.reviewer_display_name,
    reviewer_credentials=v_old.reviewer_credentials,last_reviewed_at=v_old.last_reviewed_at,
    references_json=coalesce(v_old.references_json,'[]'::jsonb),medical_disclaimer=v_old.medical_disclaimer,
    status='draft'::public.content_status,scheduled_at=null,published_at=null
  where id=p_content_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_content_id::text));
  select coalesce(max(version),0)+1 into v_new_version from public.content_versions where content_id=p_content_id;
  select to_jsonb(c) into v_new_snapshot from public.content c where c.id=p_content_id;
  insert into public.content_versions(content_id,version,snapshot,created_by)
  values(p_content_id,v_new_version,v_new_snapshot,(select auth.uid()));
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values((select auth.uid()),'content',p_content_id::text,'version_restored',
    jsonb_build_object('source_version',p_version,'previous_status',v_current_status),
    jsonb_build_object('new_version',v_new_version,'status','draft'));
  return v_new_version;
end;
$function$;

create or replace function private.set_content_seo_authority(
  p_id uuid,
  p_primary_keyword text default null::text,
  p_secondary_keywords text[] default '{}'::text[],
  p_semantic_terms text[] default '{}'::text[],
  p_search_intent text default null::text,
  p_author_display_name text default null::text,
  p_reviewer_display_name text default null::text,
  p_reviewer_credentials text default null::text,
  p_last_reviewed_at timestamptz default null::timestamptz,
  p_references jsonb default '[]'::jsonb,
  p_medical_disclaimer text default null::text,
  p_featured_image_alt text default null::text
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_status public.content_status;
  v_version integer;
  v_snapshot jsonb;
begin
  if not private.is_content_staff() then raise exception 'content staff required'; end if;
  if p_search_intent is not null and p_search_intent not in ('informational','transactional','navigational','commercial','local') then raise exception 'invalid search intent'; end if;
  if jsonb_typeof(coalesce(p_references,'[]'::jsonb)) <> 'array' then raise exception 'references must be array'; end if;

  select status into v_status from public.content where id=p_id for update;
  if v_status is null then raise exception 'content not found'; end if;
  if v_status='published'::public.content_status then raise exception 'published content authority data must be updated through a new draft/version workflow'; end if;

  update public.content set
    primary_keyword=nullif(trim(p_primary_keyword),''),
    secondary_keywords=coalesce(p_secondary_keywords,'{}'),
    semantic_terms=coalesce(p_semantic_terms,'{}'),
    search_intent=nullif(trim(p_search_intent),''),
    author_display_name=nullif(trim(p_author_display_name),''),
    reviewer_display_name=nullif(trim(p_reviewer_display_name),''),
    reviewer_credentials=nullif(trim(p_reviewer_credentials),''),
    last_reviewed_at=p_last_reviewed_at,
    references_json=coalesce(p_references,'[]'::jsonb),
    medical_disclaimer=nullif(trim(p_medical_disclaimer),''),
    featured_image_alt=nullif(trim(p_featured_image_alt),'')
  where id=p_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(max(version),0)+1 into v_version from public.content_versions where content_id=p_id;
  select to_jsonb(c) into v_snapshot from public.content c where c.id=p_id;
  insert into public.content_versions(content_id,version,snapshot,created_by)
  values(p_id,v_version,v_snapshot,(select auth.uid()));

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values((select auth.uid()),'content',p_id::text,'content_seo_authority_update',
    jsonb_build_object('primary_keyword',p_primary_keyword,'search_intent',p_search_intent,
      'references_count',jsonb_array_length(coalesce(p_references,'[]'::jsonb)),'version',v_version));
  return p_id;
end;
$function$;

revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
revoke maintain on all tables in schema public from anon, authenticated;
