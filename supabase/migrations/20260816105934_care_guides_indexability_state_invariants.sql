create or replace function private.care_guides_indexability_review_guard()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  v_is_care_guide boolean := coalesce(new.canonical_url, '') like '/care-guides/%';
  v_is_wave004 boolean := coalesce(new.schema_json ->> 'batch_id', '') = 'care-guides-rich-wave-004';
  v_ready boolean := coalesce((new.schema_json ->> 'publication_ready')::boolean, false);
  v_old_ready boolean := false;
  v_activation boolean := false;
  v_review_metadata_change boolean := false;
  v_wave_revalidation boolean := false;
  v_word_count integer := 0;
  v_reference_count integer := 0;
  v_claim_count integer := 0;
begin
  if not v_is_care_guide then
    return new;
  end if;

  if coalesce(new.robots_index, false) then
    if new.status::text <> 'published' then
      raise exception 'an indexable care guide must already be published';
    end if;
    if not v_ready then
      raise exception 'an indexable care guide requires publication_ready=true';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    v_old_ready := coalesce((old.schema_json ->> 'publication_ready')::boolean, false);
    v_activation :=
      (coalesce(new.robots_index, false) and not coalesce(old.robots_index, false))
      or (v_ready and not v_old_ready)
      or (
        coalesce(old.canonical_url, '') not like '/care-guides/%'
        and (coalesce(new.robots_index, false) or v_ready)
      );

    v_review_metadata_change :=
      (coalesce(new.robots_index, false) or v_ready)
      and (
        new.reviewer_display_name is distinct from old.reviewer_display_name
        or new.reviewer_credentials is distinct from old.reviewer_credentials
        or new.last_reviewed_at is distinct from old.last_reviewed_at
      );

    v_wave_revalidation :=
      v_is_wave004
      and (coalesce(new.robots_index, false) or v_ready)
      and (
        new.body_text is distinct from old.body_text
        or new.references_json is distinct from old.references_json
        or new.schema_json is distinct from old.schema_json
      );
  else
    v_activation := coalesce(new.robots_index, false) or v_ready;
    v_wave_revalidation := v_is_wave004 and (coalesce(new.robots_index, false) or v_ready);
  end if;

  if not (v_activation or v_review_metadata_change or v_wave_revalidation) then
    return new;
  end if;

  if nullif(pg_catalog.btrim(coalesce(new.reviewer_display_name, '')), '') is null then
    raise exception 'care guide indexability/readiness requires a recorded human reviewer';
  end if;
  if nullif(pg_catalog.btrim(coalesce(new.reviewer_credentials, '')), '') is null then
    raise exception 'care guide indexability/readiness requires reviewer credentials';
  end if;
  if new.last_reviewed_at is null then
    raise exception 'care guide indexability/readiness requires a recorded review date';
  end if;
  if new.last_reviewed_at > pg_catalog.now() then
    raise exception 'care guide review date cannot be in the future';
  end if;
  if nullif(pg_catalog.btrim(coalesce(new.author_display_name, '')), '') is not null
     and pg_catalog.lower(pg_catalog.btrim(new.author_display_name)) = pg_catalog.lower(pg_catalog.btrim(new.reviewer_display_name)) then
    raise exception 'care guide indexability/readiness requires an independent reviewer distinct from the visible author';
  end if;

  if coalesce(new.schema_json ->> 'disclaimer_url', '') <> '/disclaimer'
     or coalesce(new.schema_json ->> 'disclaimer_label', '') <> 'إخلاء المسؤولية والتنبيهات' then
    raise exception 'care guide indexability/readiness requires the central disclaimer contract';
  end if;
  if nullif(pg_catalog.btrim(coalesce(new.medical_disclaimer, '')), '') is not null then
    raise exception 'care guide medical_disclaimer must remain empty; use the central disclaimer contract';
  end if;

  if v_is_wave004 and (coalesce(new.robots_index, false) or v_ready) then
    select pg_catalog.count(*)::integer
      into v_word_count
      from pg_catalog.regexp_split_to_table(coalesce(new.body_text, ''), '[[:space:]]+') token
     where token ~ '[ء-ي]';

    if v_word_count < 3000 then
      raise exception 'Wave 004 care guides require at least 3000 useful Arabic words before readiness/indexing; found %', v_word_count;
    end if;

    v_reference_count := case
      when pg_catalog.jsonb_typeof(coalesce(new.references_json, '[]'::jsonb)) = 'array'
        then pg_catalog.jsonb_array_length(coalesce(new.references_json, '[]'::jsonb))
      else 0
    end;
    if v_reference_count < 5 then
      raise exception 'Wave 004 care guides require at least 5 references before readiness/indexing; found %', v_reference_count;
    end if;

    v_claim_count := case
      when pg_catalog.jsonb_typeof(coalesce(new.schema_json -> 'claim_source_map', '[]'::jsonb)) = 'array'
        then pg_catalog.jsonb_array_length(coalesce(new.schema_json -> 'claim_source_map', '[]'::jsonb))
      else 0
    end;
    if v_claim_count < 5 then
      raise exception 'Wave 004 care guides require at least 5 claim-source mappings before readiness/indexing; found %', v_claim_count;
    end if;
  end if;

  return new;
end;
$function$;

revoke all on function private.care_guides_indexability_review_guard() from public;
revoke all on function private.care_guides_indexability_review_guard() from anon;
revoke all on function private.care_guides_indexability_review_guard() from authenticated;
