-- Purpose-aware encyclopedia gold-standard guard.
--
-- Legacy `content_type=condition` includes both full condition references and
-- focused educational/support pages. This revision lets gold pages declare a
-- mode so focused support pages are not forced to duplicate a disease monograph.
--
-- It also drops SECURITY DEFINER: the trigger only validates NEW/OLD values and
-- does not need elevated privileges.

create or replace function private.enforce_encyclopedia_gold_standard()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
declare
  marker jsonb := coalesce(new.schema_json -> 'encyclopedia_gold_standard', '{}'::jsonb);
  old_marker jsonb := case when tg_op = 'UPDATE' then coalesce(old.schema_json -> 'encyclopedia_gold_standard', '{}'::jsonb) else '{}'::jsonb end;
  marker_version integer := 0;
  old_marker_version integer := 0;
  evidence_limited boolean := false;
  page_mode text := null;
  reference_count integer := 0;
  claim_count integer := 0;
  block_count integer := 0;
  minimum_references integer := 0;
  minimum_claims integer := 0;
  minimum_blocks integer := 0;
begin
  begin
    marker_version := greatest(coalesce(nullif(marker ->> 'version', '')::integer, 0), 0);
  exception when invalid_text_representation then
    raise exception 'encyclopedia_gold_standard.version must be an integer';
  end;

  if tg_op = 'UPDATE' then
    begin
      old_marker_version := greatest(coalesce(nullif(old_marker ->> 'version', '')::integer, 0), 0);
    exception when invalid_text_representation then
      old_marker_version := 0;
    end;
  end if;

  if tg_op = 'UPDATE'
     and old_marker_version >= 1
     and new.status = 'published'
     and new.robots_index is true
     and marker_version < old_marker_version then
    raise exception 'published gold-standard encyclopedia pages cannot downgrade encyclopedia_gold_standard.version';
  end if;

  if new.status <> 'published'
     or new.robots_index is not true
     or coalesce(new.canonical_url, '') not like '/encyclopedia/%'
     or marker_version < 1 then
    return new;
  end if;

  if new.content_type not in ('condition', 'glossary_term') then
    raise exception 'gold-standard encyclopedia content_type must be condition or glossary_term';
  end if;

  if coalesce(new.canonical_url, '') !~ '^/encyclopedia/[a-z0-9]+(-[a-z0-9]+)*/$' then
    raise exception 'gold-standard encyclopedia canonical is invalid: %', new.canonical_url;
  end if;

  page_mode := nullif(btrim(coalesce(marker ->> 'mode', '')), '');
  if page_mode is null then
    page_mode := case when new.content_type = 'glossary_term' then 'glossary' else 'condition_reference' end;
  end if;

  if page_mode not in ('condition_reference', 'specialized_support', 'glossary') then
    raise exception 'unsupported encyclopedia_gold_standard.mode: %', page_mode;
  end if;

  if page_mode = 'glossary' and new.content_type <> 'glossary_term' then
    raise exception 'encyclopedia gold mode glossary requires content_type=glossary_term';
  end if;

  if page_mode in ('condition_reference', 'specialized_support') and new.content_type <> 'condition' then
    raise exception 'encyclopedia gold mode % requires content_type=condition', page_mode;
  end if;

  if new.last_reviewed_at is null then
    raise exception 'gold-standard encyclopedia pages require a real last_reviewed_at timestamp';
  end if;

  if nullif(btrim(coalesce(new.seo_title, '')), '') is null
     or nullif(btrim(coalesce(new.seo_description, '')), '') is null then
    raise exception 'gold-standard encyclopedia pages require SEO title and description';
  end if;

  if jsonb_typeof(coalesce(new.references_json, 'null'::jsonb)) <> 'array' then
    raise exception 'gold-standard encyclopedia references_json must be an array';
  end if;

  if jsonb_typeof(coalesce(new.body_json -> 'blocks', 'null'::jsonb)) <> 'array' then
    raise exception 'gold-standard encyclopedia body_json.blocks must be an array';
  end if;

  if jsonb_typeof(coalesce(new.schema_json -> 'claim_source_map', 'null'::jsonb)) <> 'array' then
    raise exception 'gold-standard encyclopedia schema_json.claim_source_map must be an array';
  end if;

  begin
    evidence_limited := coalesce(nullif(marker ->> 'evidence_limited', '')::boolean, false);
  exception when invalid_text_representation then
    raise exception 'encyclopedia_gold_standard.evidence_limited must be boolean';
  end;

  reference_count := jsonb_array_length(new.references_json);
  claim_count := jsonb_array_length(new.schema_json -> 'claim_source_map');
  block_count := jsonb_array_length(new.body_json -> 'blocks');

  if page_mode = 'condition_reference' then
    minimum_references := case when evidence_limited then 2 else 4 end;
    minimum_claims := 4;
    minimum_blocks := case when evidence_limited then 14 else 20 end;
  elsif page_mode = 'specialized_support' then
    minimum_references := case when evidence_limited then 2 else 3 end;
    minimum_claims := 3;
    minimum_blocks := case when evidence_limited then 10 else 12 end;
  else
    minimum_references := 2;
    minimum_claims := 2;
    minimum_blocks := 8;
  end if;

  if reference_count < minimum_references then
    raise exception 'gold-standard encyclopedia % page requires at least % references; found %', page_mode, minimum_references, reference_count;
  end if;

  if claim_count < minimum_claims then
    raise exception 'gold-standard encyclopedia % page requires at least % claim-source mappings; found %', page_mode, minimum_claims, claim_count;
  end if;

  if block_count < minimum_blocks then
    raise exception 'gold-standard encyclopedia % page requires at least % structured blocks; found %', page_mode, minimum_blocks, block_count;
  end if;

  return new;
end;
$$;

revoke execute on function private.enforce_encyclopedia_gold_standard() from public, anon, authenticated;
