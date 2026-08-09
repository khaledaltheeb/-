-- Content Contract V6: block weak, misclassified, untraceable or warning-heavy
-- editorial pages at the final release boundary. Existing published rows remain
-- readable; the gate runs when a row enters or is edited in a release state.

create or replace function private.content_release_gate()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_schema jsonb := coalesce(new.schema_json, '{}'::jsonb);
  v_blocks jsonb := case
    when pg_catalog.jsonb_typeof(coalesce(new.body_json, '{}'::jsonb) -> 'blocks') = 'array'
      then coalesce(new.body_json, '{}'::jsonb) -> 'blocks'
    else '[]'::jsonb
  end;
  v_references jsonb := case
    when pg_catalog.jsonb_typeof(coalesce(new.references_json, '[]'::jsonb)) = 'array'
      then coalesce(new.references_json, '[]'::jsonb)
    else '[]'::jsonb
  end;
  v_search_questions jsonb := case
    when pg_catalog.jsonb_typeof(coalesce(new.schema_json, '{}'::jsonb) -> 'search_intent_questions') = 'array'
      then coalesce(new.schema_json, '{}'::jsonb) -> 'search_intent_questions'
    else '[]'::jsonb
  end;
  v_claims jsonb := case
    when pg_catalog.jsonb_typeof(coalesce(new.schema_json, '{}'::jsonb) -> 'claim_source_map') = 'array'
      then coalesce(new.schema_json, '{}'::jsonb) -> 'claim_source_map'
    else '[]'::jsonb
  end;
  v_versions jsonb := case
    when pg_catalog.jsonb_typeof(coalesce(new.schema_json, '{}'::jsonb) -> 'source_versions_reviewed') = 'array'
      then coalesce(new.schema_json, '{}'::jsonb) -> 'source_versions_reviewed'
    else '[]'::jsonb
  end;
  v_contract_version integer := 0;
  v_reference_count integer := 0;
  v_primary_reference_count integer := 0;
  v_claim_count integer := 0;
  v_word_count integer := 0;
  v_h2_count integer := 0;
  v_h3_count integer := 0;
  v_faq_count integer := 0;
  v_minimum_references integer := 5;
  v_minimum_claims integer := 5;
  v_generated_trials integer := 0;
  v_accepted_answers integer := 0;
  v_rejected_answers integer := 0;
  v_error_count integer := -1;
  v_classification_confidence numeric := 0;
  v_rationale_words integer := 0;
  v_mechanism_field text;
  v_mechanism_words integer := 0;
  v_interactive boolean := false;
  v_strategic boolean := false;
  v_release_state boolean := false;
begin
  v_release_state := new.status in (
    'approved'::public.content_status,
    'scheduled'::public.content_status,
    'published'::public.content_status
  );

  -- Preserve the existing SEO boundary before the complete V6 release review.
  if new.status in (
    'accessibility_review'::public.content_status,
    'approved'::public.content_status,
    'scheduled'::public.content_status,
    'published'::public.content_status
  ) then
    if nullif(pg_catalog.btrim(coalesce(new.seo_title, '')), '') is null
      or pg_catalog.char_length(pg_catalog.btrim(new.seo_title)) > 47 then
      raise exception 'SEO title is required and must fit the branded title contract';
    end if;
    if new.seo_description is null
      or pg_catalog.char_length(pg_catalog.btrim(new.seo_description)) < 150
      or pg_catalog.char_length(pg_catalog.btrim(new.seo_description)) > 160 then
      raise exception 'meta description must be 150-160 characters';
    end if;
    if nullif(pg_catalog.btrim(coalesce(new.primary_keyword, '')), '') is null then
      raise exception 'primary keyword is required before accessibility review';
    end if;
    if new.canonical_url is null or pg_catalog.btrim(new.canonical_url) = '' then
      new.canonical_url := '/content/' || new.slug;
    end if;
  end if;

  if not v_release_state then
    return new;
  end if;

  if nullif(pg_catalog.btrim(coalesce(new.author_display_name, '')), '') is null then
    new.author_display_name := (
      select nullif(pg_catalog.btrim(coalesce(p.display_name, '')), '')
      from public.profiles p
      where p.id = new.author_id
    );
  end if;
  if new.author_display_name is null then
    raise exception 'visible author is required before approval';
  end if;
  if new.featured_image_url is not null
    and nullif(pg_catalog.btrim(coalesce(new.featured_image_alt, '')), '') is null then
    raise exception 'featured image alt text is required';
  end if;

  v_contract_version := case
    when coalesce(v_schema ->> 'content_contract_version', '') ~ '^[0-9]+$'
      then (v_schema ->> 'content_contract_version')::integer
    else 0
  end;
  if v_contract_version < 6 then
    raise exception 'content_contract_version must be at least 6';
  end if;

  v_interactive := new.content_type in ('assessment', 'resource', 'tool')
    and v_schema ->> 'page_kind' = 'interactive';
  v_strategic := v_schema ->> 'strategic_scientific_value' = 'high';
  v_minimum_references := case when v_interactive then 2 when v_strategic then 8 else 5 end;
  v_minimum_claims := case when v_interactive then 2 when v_strategic then 8 else 5 end;

  select pg_catalog.count(*)::integer
  into v_word_count
  from pg_catalog.regexp_split_to_table(coalesce(new.body_text, ''), '[[:space:]]+') as token
  where token ~ '[ء-ي]';

  select
    pg_catalog.count(*) filter (
      where block ->> 'type' = 'heading' and block ->> 'level' = '2'
    )::integer,
    pg_catalog.count(*) filter (
      where block ->> 'type' = 'heading' and block ->> 'level' = '3'
    )::integer
  into v_h2_count, v_h3_count
  from pg_catalog.jsonb_array_elements(v_blocks) as block;

  select coalesce(pg_catalog.sum(pg_catalog.jsonb_array_length(block -> 'items')), 0)::integer
  into v_faq_count
  from pg_catalog.jsonb_array_elements(v_blocks) as block
  where block ->> 'type' = 'faq'
    and pg_catalog.jsonb_typeof(block -> 'items') = 'array';

  if not v_interactive then
    if v_word_count < 2500 then
      raise exception 'V6 editorial pages require at least 2500 Arabic words; found %', v_word_count;
    end if;
    if v_h2_count < 8 or v_h3_count < 4 then
      raise exception 'V6 editorial structure requires at least 8 H2 and 4 H3 headings';
    end if;
    if v_faq_count < 6 then
      raise exception 'V6 editorial pages require at least 6 structured search-intent FAQs';
    end if;
    if pg_catalog.jsonb_array_length(v_search_questions) < 8 then
      raise exception 'V6 editorial pages require at least 8 explicit search-intent questions';
    end if;
    if coalesce(pg_catalog.array_length(new.secondary_keywords, 1), 0) < 5
      or coalesce(pg_catalog.array_length(new.semantic_terms, 1), 0) < 8
      or nullif(pg_catalog.btrim(coalesce(new.search_intent, '')), '') is null then
      raise exception 'V6 search metadata requires intent, 5 secondary keywords and 8 semantic terms';
    end if;
  else
    v_generated_trials := case
      when coalesce(v_schema #>> '{interactive_quality,generated_trials}', '') ~ '^[0-9]+$'
        then (v_schema #>> '{interactive_quality,generated_trials}')::integer
      else 0
    end;
    v_accepted_answers := case
      when coalesce(v_schema #>> '{interactive_quality,accepted_correct_answers}', '') ~ '^[0-9]+$'
        then (v_schema #>> '{interactive_quality,accepted_correct_answers}')::integer
      else 0
    end;
    v_rejected_answers := case
      when coalesce(v_schema #>> '{interactive_quality,rejected_wrong_answers}', '') ~ '^[0-9]+$'
        then (v_schema #>> '{interactive_quality,rejected_wrong_answers}')::integer
      else 0
    end;
    v_error_count := case
      when coalesce(v_schema #>> '{interactive_quality,error_count}', '') ~ '^[0-9]+$'
        then (v_schema #>> '{interactive_quality,error_count}')::integer
      else -1
    end;
    if v_schema #>> '{interactive_quality,engine_tested}' <> 'true'
      or v_generated_trials < 1000
      or v_accepted_answers < 1
      or v_rejected_answers < 1
      or v_error_count <> 0
      or coalesce(v_schema #>> '{interactive_quality,privacy_mode}', '') not in ('local-only', 'anonymous-no-storage') then
      raise exception 'interactive V6 exemption requires tested capacity, correct and incorrect answer coverage, zero errors and explicit privacy';
    end if;
  end if;

  if pg_catalog.jsonb_path_exists(
    coalesce(new.body_json, '{}'::jsonb),
    '$.blocks[*] ? (@.type == "callout" && (@.tone == "warning" || @.tone == "danger"))'
  ) then
    raise exception 'warning and danger callouts are forbidden; use the central disclaimer link';
  end if;
  if coalesce(new.body_text, '') ~ '(تنبيه|تحذير|إخلاء[[:space:]]+المسؤولية)' then
    raise exception 'inline warning and disclaimer language is forbidden; use the central disclaimer page';
  end if;
  if nullif(pg_catalog.btrim(coalesce(new.medical_disclaimer, '')), '') is not null then
    raise exception 'medical_disclaimer must be empty; the site renders one central disclaimer link';
  end if;
  if v_schema ->> 'disclaimer_url' <> '/disclaimer'
    or v_schema ->> 'disclaimer_label' <> 'إخلاء المسؤولية والتنبيهات' then
    raise exception 'the exact central disclaimer route and label are required';
  end if;

  if new.sector_id is null or new.category_id is null
    or not exists (
      select 1
      from public.categories c
      where c.id = new.category_id and c.sector_id = new.sector_id and c.is_active
    ) then
    raise exception 'an active category belonging to the exact selected sector is required';
  end if;
  v_classification_confidence := case
    when coalesce(v_schema ->> 'classification_confidence', '') ~ '^(0([.][0-9]+)?|1([.]0+)?)$'
      then (v_schema ->> 'classification_confidence')::numeric
    else 0
  end;
  select pg_catalog.count(*)::integer
  into v_rationale_words
  from pg_catalog.regexp_split_to_table(coalesce(v_schema ->> 'classification_rationale', ''), '[[:space:]]+') as token
  where token ~ '[ء-ي]';
  if v_schema ->> 'taxonomy_reviewed' <> 'true'
    or v_classification_confidence < 0.9
    or v_rationale_words < 25 then
    raise exception 'taxonomy requires review, confidence >= 0.9 and a 25-word classification rationale';
  end if;

  v_reference_count := pg_catalog.jsonb_array_length(v_references);
  select pg_catalog.count(*)::integer
  into v_primary_reference_count
  from pg_catalog.jsonb_array_elements(v_references) as reference
  where reference ->> 'authority_tier' = 'primary'
    or reference ->> 'source_type' in ('official-definition', 'guideline', 'systematic-review');
  if v_reference_count < v_minimum_references then
    raise exception 'V6 requires at least % authoritative references; found %', v_minimum_references, v_reference_count;
  end if;
  if v_primary_reference_count < case when v_interactive then 1 else 2 end then
    raise exception 'V6 requires enough primary, official, guideline or systematic-review sources';
  end if;

  v_claim_count := pg_catalog.jsonb_array_length(v_claims);
  if v_claim_count < v_minimum_claims then
    raise exception 'V6 requires at least % claims mapped to sources; found %', v_minimum_claims, v_claim_count;
  end if;
  if pg_catalog.jsonb_array_length(v_versions) < 1 then
    raise exception 'all discovered legacy source versions must be listed and reviewed';
  end if;
  if v_schema ->> 'rewrite_method' <> 'evidence-led-rewrite'
    or v_schema #>> '{originality_report,passed}' <> 'true' then
    raise exception 'V6 requires an evidence-led rewrite and a passing originality review';
  end if;

  if pg_catalog.jsonb_typeof(v_schema -> 'page_mechanism') <> 'object' then
    raise exception 'V6 requires a documented page mechanism';
  end if;
  foreach v_mechanism_field in array array['purpose', 'audience', 'interaction_model', 'content_model'] loop
    select pg_catalog.count(*)::integer
    into v_mechanism_words
    from pg_catalog.regexp_split_to_table(coalesce(v_schema #>> array['page_mechanism', v_mechanism_field], ''), '[[:space:]]+') as token
    where token ~ '[ء-ي]';
    if v_mechanism_words < 5 then
      raise exception 'page_mechanism.% requires at least 5 meaningful Arabic words', v_mechanism_field;
    end if;
  end loop;

  if v_strategic then
    select pg_catalog.count(*)::integer
    into v_rationale_words
    from pg_catalog.regexp_split_to_table(coalesce(v_schema ->> 'uniqueness_rationale', ''), '[[:space:]]+') as token
    where token ~ '[ء-ي]';
    if v_rationale_words < 40 then
      raise exception 'strategic scientific pages require a 40-word uniqueness rationale';
    end if;
  end if;

  if coalesce(new.canonical_url, '') like any (array['/encyclopedia/%', '/terms/%', '/hubs/%'])
    and (
      v_schema ->> 'migration_phase' <> 'encyclopedia-last'
      or v_schema ->> 'encyclopedia_release_authorized' <> 'true'
    ) then
    raise exception 'encyclopedia content remains blocked until the explicit final migration phase';
  end if;

  return new;
end;
$$;

revoke all on function private.content_release_gate() from public, anon, authenticated, service_role;

drop trigger if exists content_release_gate on public.content;
create trigger content_release_gate
before insert or update of
  status,
  title,
  body_text,
  body_json,
  sector_id,
  category_id,
  primary_keyword,
  secondary_keywords,
  semantic_terms,
  search_intent,
  seo_title,
  seo_description,
  canonical_url,
  author_display_name,
  references_json,
  medical_disclaimer,
  schema_json,
  featured_image_url,
  featured_image_alt
on public.content
for each row execute function private.content_release_gate();

-- A narrow, versioned write boundary for the V6 quality panel. It accepts only
-- contract keys and preserves unrelated schema_json values owned by other modules.
create or replace function private.set_content_contract_v6(p_id uuid, p_contract jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.app_role;
  v_status public.content_status;
  v_author uuid;
  v_key text;
  v_version integer;
  v_snapshot jsonb;
  v_allowed_keys text[] := array[
    'content_contract_version',
    'page_kind',
    'strategic_scientific_value',
    'disclaimer_url',
    'disclaimer_label',
    'search_intent_questions',
    'source_versions_reviewed',
    'claim_source_map',
    'page_mechanism',
    'rewrite_method',
    'taxonomy_reviewed',
    'classification_confidence',
    'classification_rationale',
    'originality_report',
    'uniqueness_rationale',
    'interactive_quality',
    'migration_phase',
    'encyclopedia_release_authorized'
  ];
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;
  v_role := private.current_role();
  select c.status, c.author_id into v_status, v_author
  from public.content c
  where c.id = p_id;
  if v_status is null then
    raise exception 'content not found';
  end if;
  if v_status not in (
    'draft'::public.content_status,
    'scientific_review'::public.content_status,
    'editorial_review'::public.content_status,
    'seo_review'::public.content_status,
    'accessibility_review'::public.content_status
  ) then
    raise exception 'content contract is locked in this workflow state';
  end if;
  if v_role = 'specialist'::public.app_role then
    if v_author <> (select auth.uid()) or v_status <> 'draft'::public.content_status then
      raise exception 'specialist content-contract update denied';
    end if;
  elsif v_role not in (
    'owner'::public.app_role,
    'admin'::public.app_role,
    'editor'::public.app_role,
    'scientific_reviewer'::public.app_role,
    'seo_manager'::public.app_role
  ) then
    raise exception 'content staff required';
  end if;
  if p_contract is null or pg_catalog.jsonb_typeof(p_contract) <> 'object'
    or pg_catalog.octet_length(p_contract::text) > 300000 then
    raise exception 'invalid V6 content contract';
  end if;
  for v_key in select pg_catalog.jsonb_object_keys(p_contract) loop
    if not (v_key = any(v_allowed_keys)) then
      raise exception 'unsupported V6 content-contract key: %', v_key;
    end if;
  end loop;
  if p_contract ->> 'content_contract_version' <> '6'
    or p_contract ->> 'disclaimer_url' <> '/disclaimer'
    or p_contract ->> 'disclaimer_label' <> 'إخلاء المسؤولية والتنبيهات'
    or p_contract ->> 'rewrite_method' <> 'evidence-led-rewrite' then
    raise exception 'fixed V6 contract values are invalid';
  end if;

  update public.content c
  set schema_json = (coalesce(c.schema_json, '{}'::jsonb) - v_allowed_keys) || p_contract
  where c.id = p_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(pg_catalog.max(cv.version), 0) + 1 into v_version
  from public.content_versions cv
  where cv.content_id = p_id;
  select pg_catalog.to_jsonb(c) into v_snapshot from public.content c where c.id = p_id;
  insert into public.content_versions(content_id, version, snapshot, created_by)
  values(p_id, v_version, v_snapshot, (select auth.uid()));
  insert into public.audit_logs(actor_id, entity_type, entity_id, action, after_data)
  values(
    (select auth.uid()),
    'content',
    p_id::text,
    'content_contract_v6_update',
    pg_catalog.jsonb_build_object('version', 6, 'page_kind', p_contract ->> 'page_kind')
  );
  return p_id;
end;
$$;

create or replace function public.set_content_contract_v6(p_id uuid, p_contract jsonb)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.set_content_contract_v6(p_id, p_contract);
$$;

revoke all on function private.set_content_contract_v6(uuid, jsonb) from public, anon;
revoke all on function public.set_content_contract_v6(uuid, jsonb) from public, anon;
grant execute on function private.set_content_contract_v6(uuid, jsonb) to authenticated, service_role;
grant execute on function public.set_content_contract_v6(uuid, jsonb) to authenticated, service_role;
