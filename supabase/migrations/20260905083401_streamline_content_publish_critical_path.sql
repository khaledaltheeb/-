drop trigger if exists quick_info_release_gate_v1 on public.content;
drop trigger if exists aa_special_needs_hourly_batch_cap_v1 on public.content;
drop trigger if exists zzzz_pediatric_oncology_similarity_release_guard on public.content;

create or replace function private.quick_info_originality_guard()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.slug not like 'quick-info-%' then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.slug is not distinct from old.slug
     and new.status is not distinct from old.status
     and new.schema_json is not distinct from old.schema_json
     and new.body_text is not distinct from old.body_text then
    return new;
  end if;

  if new.status not in ('approved'::public.content_status,'scheduled'::public.content_status,'published'::public.content_status)
     and not coalesce((new.schema_json ->> 'publication_ready')::boolean, false) then
    return new;
  end if;

  if coalesce(new.body_text,'') like any (array[
    '%هذه النقطة مأخوذة من المحتوى الأصلي للصفحة%',
    '%عند تطبيق هذه النقطة على حياتك%',
    '%شرح موسع للإشارات الموجودة في المحتوى الأصلي%',
    '%تطبيق أعمق لما ورد في الصفحة الأصلية%',
    '%أما المحتوى الأصلي للصفحة فقد تم الحفاظ عليه ثم شرحه وتوسيعه%',
    '%الباحث غالبًا يريد أن يعرف كيف يميز بين التفسيرات المتشابهة%'
  ]) then
    raise exception 'Quick Info generic migration/filler language is forbidden';
  end if;

  return new;
end;
$function$;

create or replace function private.capabilities_content_quality_guard()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  v_words integer := 0;
  v_route_slug text;
begin
  if new.slug not like 'capabilities-%' then
    return new;
  end if;

  v_route_slug := pg_catalog.regexp_replace(new.slug, '^capabilities-', '');
  new.canonical_url := case when new.slug = 'capabilities-hub' then '/capabilities/' else '/capabilities/' || v_route_slug || '/' end;

  if new.status <> 'published'::public.content_status then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.body_text is not distinct from old.body_text
     and new.slug is not distinct from old.slug
     and new.status is not distinct from old.status then
    return new;
  end if;

  v_words := coalesce(pg_catalog.array_length(pg_catalog.regexp_split_to_array(pg_catalog.btrim(coalesce(new.body_text,'')), '[[:space:]]+'),1),0);
  if v_words < 1500 then
    raise exception 'capabilities page must contain at least 1500 useful words before publication';
  end if;

  if new.slug not in ('capabilities-hub','capabilities-methodology','capabilities-protocol','capabilities-registry') then
    if coalesce(new.body_text,'') like '%البروتوكول الكامل: تسع مراحل من الأمان إلى القرار المشترك%'
       or coalesce(new.body_text,'') like '%المخرج المطلوب: قائمة مخاطر وحدود مشاركة آمنة.%' then
      raise exception 'legacy repeated capabilities protocol must be removed before publication';
    end if;
  end if;

  return new;
end;
$function$;

create or replace function private.care_guides_indexability_review_guard()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  v_is_care_guide boolean := coalesce(new.canonical_url, '') like '/care-guides/%';
  v_contract_version integer := case
    when coalesce(new.schema_json ->> 'content_contract_version', '') ~ '^[0-9]+$'
      then (new.schema_json ->> 'content_contract_version')::integer
    else 0
  end;
  v_is_v8 boolean := false;
  v_is_wave004 boolean := coalesce(new.schema_json ->> 'batch_id', '') = 'care-guides-rich-wave-004';
  v_ready boolean := coalesce((new.schema_json ->> 'publication_ready')::boolean, false);
  v_old_ready boolean := false;
  v_activation boolean := false;
  v_contract_change boolean := false;
  v_wave_revalidation boolean := false;
  v_word_count integer := 0;
  v_reference_count integer := 0;
  v_claim_count integer := 0;
begin
  if not v_is_care_guide then
    return new;
  end if;

  v_is_v8 := v_contract_version >= 8;

  if v_is_v8 and coalesce(new.robots_index, false) then
    if new.status::text <> 'published' then
      raise exception 'an indexable V8+ care guide must already be published';
    end if;
    if not v_ready then
      raise exception 'an indexable V8+ care guide requires publication_ready=true';
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

    v_contract_change :=
      v_is_v8
      and (coalesce(new.robots_index, false) or v_ready)
      and (
        new.schema_json is distinct from old.schema_json
        or new.medical_disclaimer is distinct from old.medical_disclaimer
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
    v_contract_change := v_is_v8 and (coalesce(new.robots_index, false) or v_ready);
    v_wave_revalidation := v_is_wave004 and (coalesce(new.robots_index, false) or v_ready);
  end if;

  if v_is_v8 and (v_activation or v_contract_change) then
    if coalesce(new.schema_json ->> 'disclaimer_url', '') <> '/disclaimer'
       or coalesce(new.schema_json ->> 'disclaimer_label', '') <> 'إخلاء المسؤولية والتنبيهات' then
      raise exception 'V8+ care guide indexability/readiness requires the central disclaimer contract';
    end if;
    if nullif(pg_catalog.btrim(coalesce(new.medical_disclaimer, '')), '') is not null then
      raise exception 'V8+ care guide medical_disclaimer must remain empty; use the central disclaimer contract';
    end if;
  end if;

  if v_is_wave004 and (v_activation or v_wave_revalidation) then
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

create or replace function private.pediatric_oncology_quality_release_guard()
returns trigger
language plpgsql
set search_path to ''
as $function$
declare
  v_is_pediatric boolean := false;
  v_release_state boolean := false;
  v_evidence boolean := false;
  v_token text;
  v_words integer := 0;
  v_originality jsonb := '{}'::jsonb;
begin
  if new.sector_id is not null then
    select exists(
      select 1 from public.sectors s
      where s.id=new.sector_id and s.slug='pediatric-oncology' and s.is_active
    ) into v_is_pediatric;
  end if;
  if not v_is_pediatric then return new; end if;

  new.schema_json := pg_catalog.jsonb_set(
    coalesce(new.schema_json,'{}'::jsonb),
    '{pediatric_oncology_program}',
    'true'::jsonb,
    true
  );

  v_token := private.pediatric_oncology_release_token(new);
  new.schema_json := pg_catalog.jsonb_set(new.schema_json,'{release_token}',pg_catalog.to_jsonb(v_token),true);

  v_release_state := new.status in (
    'approved'::public.content_status,
    'scheduled'::public.content_status,
    'published'::public.content_status
  );
  if not v_release_state then return new; end if;

  if coalesce((new.schema_json->>'publication_ready')::boolean,false) is not true then
    raise exception 'pediatric oncology release blocked: publication_ready must be true' using errcode='23514';
  end if;

  if not coalesce(new.robots_index,false) then
    raise exception 'pediatric oncology release blocked: robots_index must be true' using errcode='23514';
  end if;

  if coalesce(new.canonical_url,'') !~ '^/' or coalesce(new.canonical_url,'') like '//%' then
    raise exception 'pediatric oncology release blocked: canonical_url must be a safe site-relative route' using errcode='23514';
  end if;

  v_originality := coalesce(new.schema_json->'originality_report','{}'::jsonb);
  if coalesce((v_originality->>'passed')::boolean,false) is not true
     or coalesce(v_originality->>'release_token','') <> v_token then
    raise exception 'pediatric oncology release blocked: originality audit is missing, failed, or stale for this release token' using errcode='23514';
  end if;

  v_evidence := coalesce((new.schema_json->>'evidence_digest_contract_version')::integer,0) >= 1
    and new.schema_json->>'evidence_record_type' in ('study','thesis');

  if v_evidence then
    if new.content_type <> 'research' then
      raise exception 'pediatric oncology evidence release blocked: content_type must be research' using errcode='23514';
    end if;
    if new.schema_json->>'content_evidence_audit_status' <> 'passed'
       or coalesce(new.schema_json->>'content_evidence_audit_release_token','') <> v_token then
      raise exception 'pediatric oncology evidence release blocked: independent evidence audit is missing or stale' using errcode='23514';
    end if;
    if coalesce((new.schema_json->>'source_identity_verified')::boolean,false) is not true then
      raise exception 'pediatric oncology evidence release blocked: source identity is not verified' using errcode='23514';
    end if;
  else
    if coalesce(new.schema_json->>'audit_status','') <> 'passed' then
      raise exception 'pediatric oncology editorial release blocked: audit_status must be passed' using errcode='23514';
    end if;
    if coalesce(new.schema_json#>>'{content_quality_audit,status}','') = 'template-contamination-detected-needs-substantive-rewrite' then
      raise exception 'pediatric oncology editorial release blocked: template contamination requires substantive rewrite' using errcode='23514';
    end if;
    if coalesce(new.schema_json#>>'{content_depth_audit,status}','') = 'insufficient-for-editorial-release' then
      raise exception 'pediatric oncology editorial release blocked: editorial depth audit has not passed' using errcode='23514';
    end if;

    select pg_catalog.count(*)::integer into v_words
    from pg_catalog.regexp_split_to_table(coalesce(new.body_text,''),'[[:space:]]+') token
    where token ~ '[ء-ي]';
    if v_words < 2500 then
      raise exception 'pediatric oncology editorial release blocked: at least 2500 useful Arabic words are required; found %',v_words using errcode='23514';
    end if;
  end if;

  return new;
end;
$function$;
