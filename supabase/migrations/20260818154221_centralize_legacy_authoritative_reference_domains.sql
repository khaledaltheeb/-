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
  v_word_count integer := 0; v_ref_count integer := 0; v_authoritative_refs integer := 0;
  v_min_words integer := 0; v_min_refs integer := 0; v_release_state boolean := false;
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
