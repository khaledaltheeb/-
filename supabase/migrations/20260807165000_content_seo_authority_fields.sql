alter table public.content
  add column if not exists primary_keyword text,
  add column if not exists secondary_keywords text[] not null default '{}',
  add column if not exists semantic_terms text[] not null default '{}',
  add column if not exists search_intent text,
  add column if not exists author_display_name text,
  add column if not exists reviewer_display_name text,
  add column if not exists reviewer_credentials text,
  add column if not exists last_reviewed_at timestamptz,
  add column if not exists references_json jsonb not null default '[]'::jsonb,
  add column if not exists medical_disclaimer text,
  add column if not exists featured_image_alt text;

alter table public.content drop constraint if exists content_search_intent_check;
alter table public.content add constraint content_search_intent_check check (
  search_intent is null or search_intent in ('informational','transactional','navigational','commercial','local')
);

alter table public.content drop constraint if exists content_references_json_array;
alter table public.content add constraint content_references_json_array check (jsonb_typeof(references_json)='array');

create or replace function private.set_content_seo_authority(
  p_id uuid,
  p_primary_keyword text default null,
  p_secondary_keywords text[] default '{}',
  p_semantic_terms text[] default '{}',
  p_search_intent text default null,
  p_author_display_name text default null,
  p_reviewer_display_name text default null,
  p_reviewer_credentials text default null,
  p_last_reviewed_at timestamptz default null,
  p_references jsonb default '[]'::jsonb,
  p_medical_disclaimer text default null,
  p_featured_image_alt text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_status public.content_status;
begin
  if not private.is_content_staff() then raise exception 'content staff required'; end if;
  if p_search_intent is not null and p_search_intent not in ('informational','transactional','navigational','commercial','local') then raise exception 'invalid search intent'; end if;
  if jsonb_typeof(coalesce(p_references,'[]'::jsonb)) <> 'array' then raise exception 'references must be array'; end if;
  select status into v_status from public.content where id=p_id;
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

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values((select auth.uid()),'content',p_id::text,'content_seo_authority_update',jsonb_build_object('primary_keyword',p_primary_keyword,'search_intent',p_search_intent,'references_count',jsonb_array_length(coalesce(p_references,'[]'::jsonb))));
  return p_id;
end;
$$;

revoke all on function private.set_content_seo_authority(uuid,text,text[],text[],text,text,text,text,timestamptz,jsonb,text,text) from public;
grant execute on function private.set_content_seo_authority(uuid,text,text[],text[],text,text,text,text,timestamptz,jsonb,text,text) to authenticated;

create or replace function public.set_content_seo_authority(
  p_id uuid,
  p_primary_keyword text default null,
  p_secondary_keywords text[] default '{}',
  p_semantic_terms text[] default '{}',
  p_search_intent text default null,
  p_author_display_name text default null,
  p_reviewer_display_name text default null,
  p_reviewer_credentials text default null,
  p_last_reviewed_at timestamptz default null,
  p_references jsonb default '[]'::jsonb,
  p_medical_disclaimer text default null,
  p_featured_image_alt text default null
)
returns uuid language sql security invoker set search_path=''
as $$ select private.set_content_seo_authority(p_id,p_primary_keyword,p_secondary_keywords,p_semantic_terms,p_search_intent,p_author_display_name,p_reviewer_display_name,p_reviewer_credentials,p_last_reviewed_at,p_references,p_medical_disclaimer,p_featured_image_alt); $$;

revoke all on function public.set_content_seo_authority(uuid,text,text[],text[],text,text,text,text,timestamptz,jsonb,text,text) from public,anon;
grant execute on function public.set_content_seo_authority(uuid,text,text[],text[],text,text,text,text,timestamptz,jsonb,text,text) to authenticated,service_role;
