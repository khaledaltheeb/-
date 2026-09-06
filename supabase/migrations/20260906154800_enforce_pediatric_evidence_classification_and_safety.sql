-- Prevent pediatric-oncology study/thesis evidence records from reaching a release
-- state without an explicit evidence classification or high-stakes safety notice.
-- Scope is deliberately limited to governed evidence records so legacy editorial
-- pediatric-oncology pages are not blocked by this change.

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
    if pg_catalog.nullif(pg_catalog.btrim(coalesce(new.schema_json->>'evidence_kind','')), '') is null then
      raise exception 'pediatric oncology evidence release blocked: evidence_kind must be explicit before release' using errcode='23514';
    end if;
    if pg_catalog.nullif(pg_catalog.btrim(coalesce(new.medical_disclaimer,'')), '') is null then
      raise exception 'pediatric oncology evidence release blocked: medical_disclaimer must be explicit before release' using errcode='23514';
    end if;
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
