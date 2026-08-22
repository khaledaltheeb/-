create or replace function private.promote_legacy_item_to_draft(p_source_key text, p_content_type text, p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item private.legacy_migration_items%rowtype;
  v_id uuid;
  v_existing public.content%rowtype;
  v_route text;
  v_title text;
  v_schema jsonb;
begin
  select * into v_item
  from private.legacy_migration_items
  where source_key=p_source_key
  for update;

  if not found then raise exception 'legacy source item not found'; end if;
  if v_item.migration_decision <> 'UNRESOLVED' then
    return jsonb_build_object('status','skipped','decision',v_item.migration_decision,'source_key',p_source_key);
  end if;

  if p_content_type not in (
    'article','guide','condition','research','comparison','tool','news','sector_page',
    'landing_page','assessment','intervention','protocol','course','learning_path',
    'resource','calendar','glossary_term','faq','directory_page'
  ) then raise exception 'unsupported destination content type: %', p_content_type; end if;
  if p_slug is null or p_slug !~ '^[a-z0-9][a-z0-9-]{1,190}$' then raise exception 'unsafe destination slug: %', p_slug; end if;

  v_route := case
    when coalesce(v_item.canonical_url,'') ~ '^https?://(www\.)?healthrenewal\.org' then regexp_replace(v_item.canonical_url,'^https?://(www\.)?healthrenewal\.org','')
    when coalesce(v_item.canonical_url,'') like '/%' then v_item.canonical_url
    when coalesce(v_item.source_url,'') ~ '^https?://(www\.)?healthrenewal\.org' then regexp_replace(v_item.source_url,'^https?://(www\.)?healthrenewal\.org','')
    when v_item.source_path='index.html' then '/'
    when v_item.source_path ~ '/index\.html$' then '/'||regexp_replace(v_item.source_path,'index\.html$','')
    else '/'||v_item.source_path
  end;
  if v_route <> '/' and v_route !~ '\.[A-Za-z0-9]+$' and right(v_route,1) <> '/' then v_route:=v_route||'/'; end if;

  select * into v_existing from public.content c
  where c.canonical_url=v_route or c.slug=p_slug
  order by (c.canonical_url=v_route) desc,(c.status='published') desc,c.updated_at desc
  limit 1;
  if found then
    update private.legacy_migration_items
    set migration_decision='MATCH_EXISTING',destination_content_id=v_existing.id,destination_slug=v_existing.slug,destination_canonical=v_existing.canonical_url,
        decision_reason=jsonb_build_object('match',case when v_existing.canonical_url=v_route then 'exact_canonical' else 'slug_collision' end),updated_at=now()
    where source_key=p_source_key;
    return jsonb_build_object('status','matched_existing','content_id',v_existing.id,'slug',v_existing.slug,'canonical_url',v_existing.canonical_url);
  end if;

  v_title:=coalesce(nullif(btrim(v_item.h1),''),nullif(btrim(regexp_replace(coalesce(v_item.title,''),'\s*\|\s*.*$','')),''),'محتوى محفوظ من روافد');
  v_schema:=jsonb_build_object(
    'content_contract_version',0,
    'migration_release_contract_version',1,
    'publication_ready',false,
    'editorial_review_required',true,
    'rewrite_method','legacy-preservation-pending-evidence-led-review',
    'legacy_migration',jsonb_build_object(
      'source_key',v_item.source_key,'source_path',v_item.source_path,'source_sha256',v_item.source_sha256,
      'source_family',v_item.source_family,'source_meta',v_item.source_meta,'quality_flags',v_item.quality_flags
    ),
    'legacy_schema',v_item.legacy_schema_json,
    'legacy_internal_links',coalesce(v_item.internal_links_json,'[]'::jsonb),
    'legacy_images',coalesce(v_item.images_json,'[]'::jsonb),
    'legacy_source_url',v_item.source_url,
    'legacy_robots',v_item.robots,
    'source_versions_reviewed',jsonb_build_array(jsonb_build_object(
      'source_kind',v_item.source_kind,'source_path',v_item.source_path,'source_sha256',v_item.source_sha256
    ))
  );
  if p_content_type='glossary_term' and v_route like '/encyclopedia/%' then
    v_schema:=v_schema||jsonb_build_object('migration_phase','encyclopedia-last','encyclopedia_release_authorized',false);
  end if;

  insert into public.content(
    content_type,slug,title,excerpt,body_json,body_text,audience,status,
    seo_title,seo_description,canonical_url,robots_index,robots_follow,schema_json,
    is_featured,search_aliases,secondary_keywords,semantic_terms,search_intent,references_json,medical_disclaimer
  ) values (
    p_content_type,p_slug,v_title,nullif(v_item.meta_description,''),coalesce(v_item.body_json,'{}'::jsonb),v_item.body_text,'{}'::text[],'draft'::public.content_status,
    nullif(v_item.title,''),nullif(v_item.meta_description,''),v_route,false,case when coalesce(v_item.robots,'') ilike '%nofollow%' then false else true end,v_schema,
    false,'{}'::text[],'{}'::text[],'{}'::text[],'informational',coalesce(v_item.references_json,'[]'::jsonb),null
  ) returning id into v_id;

  insert into public.content_versions(content_id,version,snapshot,created_by)
  select c.id,1,to_jsonb(c),null from public.content c where c.id=v_id;

  update private.legacy_migration_items
  set migration_decision='PROMOTED_DRAFT',destination_content_id=v_id,destination_slug=p_slug,destination_canonical=v_route,promoted_at=now(),
      decision_reason=jsonb_build_object('promotion','new_draft','content_type',p_content_type,'robots_index',false),updated_at=now()
  where source_key=p_source_key;

  return jsonb_build_object('status','promoted_draft','content_id',v_id,'slug',p_slug,'canonical_url',v_route,'content_type',p_content_type);
end;
$$;

revoke all on function private.promote_legacy_item_to_draft(text,text,text) from public, anon, authenticated;
