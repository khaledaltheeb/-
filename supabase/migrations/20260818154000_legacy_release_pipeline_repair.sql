-- Rawafid legacy release pipeline repair.
--
-- Production data already confirmed as reviewed by the Rawafid team is handled
-- operationally; this migration only repairs durable release-contract behavior.

create or replace function private.is_recognized_authoritative_reference_url(p_url text)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select pg_catalog.lower(coalesce(p_url,'')) ~
    '^https?://([a-z0-9-]+\.)*(who\.int|nih\.gov|cdc\.gov|fda\.gov|clinicaltrials\.gov|ema\.europa\.eu|nice\.org\.uk|cochrane\.org|cochranelibrary\.com|apa\.org|aap\.org|asha\.org|asco\.org|esmo\.org|childrensoncologygroup\.org|siop-online\.org|unicef\.org|nhs\.uk|medlineplus\.gov|samhsa\.gov|cancer\.gov|ed\.gov|ohchr\.org|unesco\.org|aaidd\.org|ectacenter\.org)([:/]|$)';
$$;

revoke all on function private.is_recognized_authoritative_reference_url(text) from public, anon, authenticated;

create or replace function private.promote_legacy_item_to_draft(
  p_source_key text,
  p_content_type text,
  p_slug text
)
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

-- Backfill the discriminator only when the preserved provenance and destination
-- identity still match the audited migration item. This is structural metadata,
-- not an editorial or originality bypass.
update public.content c
set schema_json = jsonb_set(coalesce(c.schema_json,'{}'::jsonb), '{migration_release_contract_version}', '1'::jsonb, true)
from private.legacy_migration_items l
where l.destination_content_id=c.id
  and l.migration_decision='PROMOTED_DRAFT'
  and l.migration_state in ('PUBLISHABLE','PUBLISHABLE_AFTER_REPAIR')
  and c.status='draft'
  and c.schema_json ? 'legacy_migration'
  and c.schema_json #>> '{legacy_migration,source_key}' = l.source_key
  and c.schema_json #>> '{legacy_migration,source_sha256}' = l.source_sha256
  and c.slug = l.destination_slug
  and c.canonical_url = l.destination_canonical
  and coalesce((c.schema_json->>'migration_release_contract_version')::integer,0) < 1;

create or replace function private.content_release_gate_legacy()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_schema jsonb := coalesce(new.schema_json, '{}'::jsonb);
  v_legacy jsonb := coalesce(v_schema -> 'legacy_migration', '{}'::jsonb);
  v_refs jsonb := case
    when pg_catalog.jsonb_typeof(coalesce(new.references_json, '[]'::jsonb)) = 'array' then coalesce(new.references_json, '[]'::jsonb)
    else '[]'::jsonb end;
  v_word_count integer := 0;
  v_ref_count integer := 0;
  v_authoritative_refs integer := 0;
  v_min_words integer := 0;
  v_min_refs integer := 0;
  v_release_state boolean := false;
begin
  v_release_state := new.status in ('accessibility_review'::public.content_status,'approved'::public.content_status,'scheduled'::public.content_status,'published'::public.content_status);
  if not v_release_state then return new; end if;
  if coalesce((v_schema ->> 'migration_release_contract_version')::integer,0) < 1 or pg_catalog.jsonb_typeof(v_legacy) <> 'object' then raise exception 'validated legacy release contract is missing'; end if;
  if v_legacy ->> 'source_kind' <> 'validated-production-site' and coalesce(v_legacy #>> '{source_meta,kind}','') <> 'validated-production-site' then raise exception 'legacy release requires validated-production-site provenance'; end if;
  if coalesce(v_legacy ->> 'source_sha256','') !~ '^[0-9a-f]{64}$' then raise exception 'legacy release requires a valid source SHA-256'; end if;
  if coalesce(v_legacy #>> '{source_meta,artifact_digest}','') !~ '^sha256:[0-9a-f]{64}$' then raise exception 'legacy release requires a pinned production artifact digest'; end if;
  if v_schema ->> 'publication_ready' <> 'true' or v_schema ->> 'editorial_review_required' <> 'false' then raise exception 'legacy content must complete editorial release review'; end if;
  if v_schema #>> '{originality_report,passed}' <> 'true' then raise exception 'legacy content requires a passing originality review'; end if;
  if v_schema ->> 'migration_route_verified' <> 'true' then raise exception 'legacy content requires a verified V3 route before release'; end if;
  if nullif(pg_catalog.btrim(coalesce(new.seo_title,'')),'') is null or pg_catalog.char_length(pg_catalog.btrim(new.seo_title)) > 60 then raise exception 'legacy SEO title is required and must be at most 60 characters'; end if;
  if new.seo_description is null or pg_catalog.char_length(pg_catalog.btrim(new.seo_description)) < 120 or pg_catalog.char_length(pg_catalog.btrim(new.seo_description)) > 170 then raise exception 'legacy meta description must be 120-170 characters'; end if;
  if nullif(pg_catalog.btrim(coalesce(new.primary_keyword,'')),'') is null then raise exception 'legacy primary keyword is required'; end if;
  if new.canonical_url is null or pg_catalog.btrim(new.canonical_url)='' or new.canonical_url !~ '^/' then raise exception 'legacy canonical URL must be site-relative'; end if;
  if nullif(pg_catalog.btrim(coalesce(new.author_display_name,'')),'') is null then raise exception 'visible institutional or named author is required'; end if;
  if new.featured_image_url is not null and nullif(pg_catalog.btrim(coalesce(new.featured_image_alt,'')),'') is null then raise exception 'featured image alt text is required'; end if;
  if new.sector_id is null or new.category_id is null or not exists (select 1 from public.categories c where c.id=new.category_id and c.sector_id=new.sector_id and c.is_active) then raise exception 'legacy release requires a valid active taxonomy mapping'; end if;
  if v_schema ->> 'taxonomy_reviewed' <> 'true' or coalesce((v_schema ->> 'classification_confidence')::numeric,0) < 0.9 or pg_catalog.char_length(pg_catalog.btrim(coalesce(v_schema ->> 'classification_rationale',''))) < 80 then raise exception 'legacy release requires reviewed taxonomy with confidence >= 0.9 and rationale'; end if;
  select pg_catalog.count(*)::integer into v_word_count from pg_catalog.regexp_split_to_table(coalesce(new.body_text,''),'[[:space:]]+') token where token ~ '[ء-يA-Za-z0-9]';
  v_min_words := case new.content_type when 'glossary_term' then 250 when 'condition' then 1000 when 'guide' then 600 when 'article' then 700 when 'comparison' then 500 when 'research' then 600 when 'learning_path' then 700 when 'resource' then 300 when 'directory_page' then 250 when 'landing_page' then 300 when 'sector_page' then 300 when 'course' then 700 when 'faq' then 250 when 'news' then 400 when 'intervention' then 1000 when 'protocol' then 1200 else 0 end;
  if new.content_type in ('tool','assessment','calendar') then
    if v_schema ->> 'functional_parity_verified' <> 'true' or coalesce(v_schema #>> '{interactive_quality,engine_tested}','') <> 'true' or coalesce((v_schema #>> '{interactive_quality,error_count}')::integer,-1) <> 0 or coalesce(v_schema #>> '{interactive_quality,privacy_mode}','') not in ('local-only','anonymous-no-storage') then raise exception 'interactive legacy content requires verified functional parity, tested engine, zero errors and explicit privacy mode'; end if;
  elsif v_word_count < v_min_words then raise exception 'legacy % page requires at least % meaningful words; found %',new.content_type,v_min_words,v_word_count; end if;
  v_ref_count := pg_catalog.jsonb_array_length(v_refs);
  select pg_catalog.count(*)::integer into v_authoritative_refs
  from pg_catalog.jsonb_array_elements(v_refs) r
  where private.is_recognized_authoritative_reference_url(r ->> 'url');
  v_min_refs := case when new.content_type in ('condition','protocol','intervention','assessment','research') then 2 when new.content_type in ('guide','article','comparison','glossary_term','learning_path') then 1 else 0 end;
  if v_ref_count < v_min_refs then raise exception 'legacy % page requires at least % references; found %',new.content_type,v_min_refs,v_ref_count; end if;
  if v_min_refs > 0 and v_authoritative_refs < 1 then raise exception 'legacy evidence-bearing page requires at least one recognized authoritative source'; end if;
  if coalesce(new.body_text,'') ~ '(TODO|FIXME|lorem ipsum|placeholder|قيد التطوير|نص تجريبي)' then raise exception 'development or placeholder language is forbidden in legacy release'; end if;
  if coalesce(new.canonical_url,'') like any(array['/encyclopedia/%','/terms/%','/hubs/%']) and (v_schema ->> 'migration_phase' <> 'encyclopedia-last' or v_schema ->> 'encyclopedia_release_authorized' <> 'true') then raise exception 'encyclopedia, terms and hubs remain blocked until explicit final migration authorization'; end if;
  return new;
end;
$$;

revoke all on function private.content_release_gate_legacy() from public, anon, authenticated;
