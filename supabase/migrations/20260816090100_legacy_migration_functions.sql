create or replace function private.ingest_legacy_migration_payload(p_url text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status integer;
  v_content text;
  v_payload jsonb;
  v_item jsonb;
  v_count integer := 0;
  v_family text;
  v_source jsonb;
begin
  if p_url is null
     or p_url !~ '^https://raw\.githubusercontent\.com/khaledaltheeb/-/' then
    raise exception 'legacy migration payload URL is not allowed';
  end if;

  select (r).status, (r).content
    into v_status, v_content
  from (select extensions.http_get(p_url::varchar) as r) q;

  if v_status <> 200 then
    raise exception 'legacy migration payload fetch failed: HTTP %', v_status;
  end if;

  begin
    v_payload := v_content::jsonb;
  exception when others then
    raise exception 'legacy migration payload is not valid JSON';
  end;

  if coalesce((v_payload->>'schema_version')::integer, 0) <> 1 then
    raise exception 'unsupported legacy migration payload schema version';
  end if;
  if jsonb_typeof(v_payload->'records') <> 'array' then
    raise exception 'legacy migration payload records must be an array';
  end if;

  v_family := coalesce(v_payload->>'family', 'unknown');
  v_source := coalesce(v_payload->'source', '{}'::jsonb);

  for v_item in select value from jsonb_array_elements(v_payload->'records')
  loop
    if coalesce(v_item->>'source_key', '') = ''
       or coalesce(v_item->>'source_path', '') = ''
       or coalesce(v_item->>'source_sha256', '') = '' then
      raise exception 'legacy migration payload record is missing source identity';
    end if;

    insert into private.legacy_migration_items (
      source_key, source_kind, source_family, source_path, source_url,
      source_sha256, source_meta, title, h1, meta_description, canonical_url,
      robots, word_count, body_json, body_text, references_json,
      internal_links_json, images_json, legacy_schema_json, migration_state,
      quality_flags, updated_at
    ) values (
      v_item->>'source_key',
      coalesce(nullif(v_item->>'source_kind',''), 'production-baseline'),
      coalesce(nullif(v_item->>'source_family',''), v_family),
      v_item->>'source_path',
      nullif(v_item->>'source_url',''),
      v_item->>'source_sha256',
      v_source,
      nullif(v_item->>'title',''),
      nullif(v_item->>'h1',''),
      nullif(v_item->>'meta_description',''),
      nullif(v_item->>'canonical_url',''),
      nullif(v_item->>'robots',''),
      greatest(coalesce((v_item->>'word_count')::integer, 0), 0),
      coalesce(v_item->'body_json', '{}'::jsonb),
      nullif(v_item->>'body_text',''),
      coalesce(v_item->'references_json', '[]'::jsonb),
      coalesce(v_item->'internal_links_json', '[]'::jsonb),
      coalesce(v_item->'images_json', '[]'::jsonb),
      coalesce(v_item->'legacy_schema_json', '[]'::jsonb),
      v_item->>'migration_state',
      coalesce(v_item->'quality_flags', '[]'::jsonb),
      now()
    )
    on conflict (source_key) do update set
      source_kind = excluded.source_kind,
      source_family = excluded.source_family,
      source_path = excluded.source_path,
      source_url = excluded.source_url,
      source_sha256 = excluded.source_sha256,
      source_meta = excluded.source_meta,
      title = excluded.title,
      h1 = excluded.h1,
      meta_description = excluded.meta_description,
      canonical_url = excluded.canonical_url,
      robots = excluded.robots,
      word_count = excluded.word_count,
      body_json = excluded.body_json,
      body_text = excluded.body_text,
      references_json = excluded.references_json,
      internal_links_json = excluded.internal_links_json,
      images_json = excluded.images_json,
      legacy_schema_json = excluded.legacy_schema_json,
      migration_state = excluded.migration_state,
      quality_flags = excluded.quality_flags,
      updated_at = now();

    v_count := v_count + 1;
  end loop;

  return jsonb_build_object(
    'status','ok',
    'family',v_family,
    'records',v_count,
    'source',v_source
  );
end;
$$;

revoke all on function private.ingest_legacy_migration_payload(text) from public, anon, authenticated;
comment on function private.ingest_legacy_migration_payload(text) is
  'Internal idempotent loader for audited Rawafid legacy migration JSON payloads from an allowlisted GitHub raw URL.';

create or replace function private.ingest_legacy_migration_manifest(
  p_manifest_url text,
  p_data_base_url text,
  p_families text[] default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status integer;
  v_content text;
  v_manifest jsonb;
  v_batch jsonb;
  v_path text;
  v_family text;
  v_result jsonb;
  v_batch_count integer := 0;
  v_record_count integer := 0;
  v_failed_count integer := 0;
  v_expected_total integer := 0;
  v_failures jsonb := '[]'::jsonb;
begin
  if p_manifest_url is null
     or p_manifest_url !~ '^https://raw\.githubusercontent\.com/khaledaltheeb/-/' then
    raise exception 'legacy migration manifest URL is not allowed';
  end if;
  if p_data_base_url is null
     or p_data_base_url !~ '^https://raw\.githubusercontent\.com/khaledaltheeb/-/'
     or right(p_data_base_url, 1) <> '/' then
    raise exception 'legacy migration data base URL is not allowed';
  end if;

  select (r).status, (r).content
    into v_status, v_content
  from (select extensions.http_get(p_manifest_url::varchar) as r) q;

  if v_status <> 200 then
    raise exception 'legacy migration manifest fetch failed: HTTP %', v_status;
  end if;

  begin
    v_manifest := v_content::jsonb;
  exception when others then
    raise exception 'legacy migration manifest is not valid JSON';
  end;

  if coalesce((v_manifest->'summary'->>'schema_version')::integer, 0) <> 1 then
    raise exception 'unsupported migration manifest schema';
  end if;
  if jsonb_typeof(v_manifest->'batches') <> 'array' then
    raise exception 'migration manifest batches must be an array';
  end if;

  v_expected_total := coalesce((v_manifest->'summary'->>'total_html')::integer, 0);

  for v_batch in select value from jsonb_array_elements(v_manifest->'batches')
  loop
    v_family := coalesce(v_batch->>'family', '');
    if p_families is not null and not (v_family = any(p_families)) then
      continue;
    end if;

    v_path := coalesce(v_batch->>'path', '');
    if v_path = ''
       or v_path ~ '(^|/)\.\.(/|$)'
       or v_path !~ '^legacy-production-batches/[A-Za-z0-9._-]+/[0-9]{3}\.json$' then
      raise exception 'unsafe migration batch path: %', v_path;
    end if;

    begin
      v_result := private.ingest_legacy_migration_payload(p_data_base_url || v_path);
      v_batch_count := v_batch_count + 1;
      v_record_count := v_record_count + coalesce((v_result->>'records')::integer, 0);
    exception when others then
      v_failed_count := v_failed_count + 1;
      v_failures := v_failures || jsonb_build_array(jsonb_build_object(
        'family',v_family,
        'path',v_path,
        'error',left(sqlerrm,500)
      ));
    end;
  end loop;

  return jsonb_build_object(
    'status',case when v_failed_count=0 then 'ok' else 'partial' end,
    'successful_batches',v_batch_count,
    'failed_batches',v_failed_count,
    'records_processed',v_record_count,
    'manifest_total_html',v_expected_total,
    'families',coalesce(to_jsonb(p_families),'null'::jsonb),
    'failures',v_failures
  );
end;
$$;

revoke all on function private.ingest_legacy_migration_manifest(text,text,text[]) from public, anon, authenticated;
comment on function private.ingest_legacy_migration_manifest(text,text,text[]) is
  'Internal fault-tolerant loader for version-pinned Rawafid legacy production manifests.';

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

  if not found then
    raise exception 'legacy source item not found';
  end if;

  if v_item.migration_decision <> 'UNRESOLVED' then
    return jsonb_build_object(
      'status','skipped',
      'decision',v_item.migration_decision,
      'source_key',p_source_key
    );
  end if;

  if p_content_type not in (
    'article','guide','condition','research','comparison','tool','news','sector_page',
    'landing_page','assessment','intervention','protocol','course','learning_path',
    'resource','calendar','glossary_term','faq','directory_page'
  ) then
    raise exception 'unsupported destination content type: %', p_content_type;
  end if;

  if p_slug is null or p_slug !~ '^[a-z0-9][a-z0-9-]{1,190}$' then
    raise exception 'unsafe destination slug: %', p_slug;
  end if;

  v_route := case
    when coalesce(v_item.canonical_url,'') ~ '^https?://(www\.)?healthrenewal\.org'
      then regexp_replace(v_item.canonical_url,'^https?://(www\.)?healthrenewal\.org','')
    when coalesce(v_item.canonical_url,'') like '/%'
      then v_item.canonical_url
    when coalesce(v_item.source_url,'') ~ '^https?://(www\.)?healthrenewal\.org'
      then regexp_replace(v_item.source_url,'^https?://(www\.)?healthrenewal\.org','')
    when v_item.source_path='index.html'
      then '/'
    when v_item.source_path ~ '/index\.html$'
      then '/'||regexp_replace(v_item.source_path,'index\.html$','')
    else '/'||v_item.source_path
  end;

  if v_route <> '/' and v_route !~ '\.[A-Za-z0-9]+$' and right(v_route,1) <> '/' then
    v_route := v_route||'/';
  end if;

  select * into v_existing
  from public.content c
  where c.canonical_url=v_route or c.slug=p_slug
  order by (c.canonical_url=v_route) desc,(c.status='published') desc,c.updated_at desc
  limit 1;

  if found then
    update private.legacy_migration_items
    set migration_decision='MATCH_EXISTING',
        destination_content_id=v_existing.id,
        destination_slug=v_existing.slug,
        destination_canonical=v_existing.canonical_url,
        decision_reason=jsonb_build_object(
          'match',case when v_existing.canonical_url=v_route then 'exact_canonical' else 'slug_collision' end
        ),
        updated_at=now()
    where source_key=p_source_key;

    return jsonb_build_object(
      'status','matched_existing',
      'content_id',v_existing.id,
      'slug',v_existing.slug,
      'canonical_url',v_existing.canonical_url
    );
  end if;

  v_title := coalesce(
    nullif(btrim(v_item.h1),''),
    nullif(btrim(regexp_replace(coalesce(v_item.title,''),'\s*\|\s*.*$','')),''),
    'محتوى محفوظ من روافد'
  );

  v_schema := jsonb_build_object(
    'content_contract_version',0,
    'publication_ready',false,
    'editorial_review_required',true,
    'rewrite_method','legacy-preservation-pending-evidence-led-review',
    'legacy_migration',jsonb_build_object(
      'source_key',v_item.source_key,
      'source_path',v_item.source_path,
      'source_sha256',v_item.source_sha256,
      'source_family',v_item.source_family,
      'source_meta',v_item.source_meta,
      'quality_flags',v_item.quality_flags
    ),
    'legacy_schema',v_item.legacy_schema_json,
    'legacy_internal_links',coalesce(v_item.internal_links_json,'[]'::jsonb),
    'legacy_images',coalesce(v_item.images_json,'[]'::jsonb),
    'legacy_source_url',v_item.source_url,
    'legacy_robots',v_item.robots,
    'source_versions_reviewed',jsonb_build_array(jsonb_build_object(
      'source_kind',v_item.source_kind,
      'source_path',v_item.source_path,
      'source_sha256',v_item.source_sha256
    ))
  );

  if p_content_type='glossary_term' and v_route like '/encyclopedia/%' then
    v_schema := v_schema || jsonb_build_object(
      'migration_phase','encyclopedia-last',
      'encyclopedia_release_authorized',false
    );
  end if;

  insert into public.content(
    content_type,slug,title,excerpt,body_json,body_text,audience,status,
    seo_title,seo_description,canonical_url,robots_index,robots_follow,schema_json,
    is_featured,search_aliases,secondary_keywords,semantic_terms,search_intent,
    references_json,medical_disclaimer
  ) values (
    p_content_type,
    p_slug,
    v_title,
    nullif(v_item.meta_description,''),
    coalesce(v_item.body_json,'{}'::jsonb),
    v_item.body_text,
    '{}'::text[],
    'draft'::public.content_status,
    nullif(v_item.title,''),
    nullif(v_item.meta_description,''),
    v_route,
    false,
    case when coalesce(v_item.robots,'') ilike '%nofollow%' then false else true end,
    v_schema,
    false,
    '{}'::text[],
    '{}'::text[],
    '{}'::text[],
    'informational',
    coalesce(v_item.references_json,'[]'::jsonb),
    null
  ) returning id into v_id;

  insert into public.content_versions(content_id,version,snapshot,created_by)
  select c.id,1,to_jsonb(c),null
  from public.content c
  where c.id=v_id;

  update private.legacy_migration_items
  set migration_decision='PROMOTED_DRAFT',
      destination_content_id=v_id,
      destination_slug=p_slug,
      destination_canonical=v_route,
      promoted_at=now(),
      decision_reason=jsonb_build_object(
        'promotion','new_draft',
        'content_type',p_content_type,
        'robots_index',false
      ),
      updated_at=now()
  where source_key=p_source_key;

  return jsonb_build_object(
    'status','promoted_draft',
    'content_id',v_id,
    'slug',p_slug,
    'canonical_url',v_route,
    'content_type',p_content_type
  );
end;
$$;

revoke all on function private.promote_legacy_item_to_draft(text,text,text) from public, anon, authenticated;
comment on function private.promote_legacy_item_to_draft(text,text,text) is
  'Internal idempotent promoter for preserved legacy staging items. It never publishes or indexes content and preserves links/media/provenance for release review.';
