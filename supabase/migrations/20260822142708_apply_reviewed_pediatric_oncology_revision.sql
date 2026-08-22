create or replace function private.apply_reviewed_pediatric_oncology_revision(p_revision_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_revision public.content%rowtype;
  v_live public.content%rowtype;
  v_target_id uuid;
  v_source_fingerprint text;
  v_current_fingerprint text;
  v_old_published_at timestamptz;
  v_token text;
  v_release jsonb;
  v_version integer;
  v_snapshot jsonb;
begin
  select * into v_revision from public.content where id=p_revision_id for update;
  if v_revision.id is null then raise exception 'revision not found'; end if;
  if coalesce(v_revision.schema_json->>'revision_of','') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    raise exception 'invalid revision target';
  end if;
  if v_revision.status <> 'draft'::public.content_status then raise exception 'reviewed revision must still be draft'; end if;
  if coalesce(v_revision.schema_json->>'team_review_completed','false') <> 'true'
     or coalesce(v_revision.schema_json->>'human_review_completed','false') <> 'true'
     or coalesce(v_revision.schema_json#>>'{team_review_attestation,status}','') <> 'completed' then
    raise exception 'reviewed revision lacks completed Rawafid team review attestation';
  end if;
  if coalesce(v_revision.schema_json->>'publication_ready','false') <> 'true'
     or coalesce(v_revision.schema_json#>>'{content_quality_audit,status}','') <> 'passed'
     or coalesce(v_revision.schema_json#>>'{content_depth_audit,status}','') <> 'passed'
     or coalesce(v_revision.schema_json#>>'{originality_report,passed}','false') <> 'true' then
    raise exception 'reviewed revision has not passed release audits';
  end if;

  v_target_id := (v_revision.schema_json->>'revision_of')::uuid;
  v_source_fingerprint := nullif(v_revision.schema_json->>'revision_source_fingerprint','');
  select * into v_live from public.content where id=v_target_id for update;
  if v_live.id is null or v_live.status <> 'published'::public.content_status then raise exception 'live target is not published'; end if;
  if not exists(select 1 from public.sectors s where s.id=v_live.sector_id and s.slug='pediatric-oncology' and s.is_active) then
    raise exception 'target is not active pediatric oncology content';
  end if;
  v_current_fingerprint := private.content_revision_fingerprint(v_target_id);
  if v_source_fingerprint is null or v_current_fingerprint is distinct from v_source_fingerprint then
    raise exception 'live content changed after revision started; start a fresh revision';
  end if;
  if v_revision.canonical_url is distinct from v_live.canonical_url then raise exception 'revision cannot change canonical identity'; end if;
  if coalesce((private.pediatric_oncology_cross_page_similarity_audit(p_revision_id)->>'passed')::boolean,false) is not true then
    raise exception 'revision cross-page similarity audit does not pass';
  end if;

  v_old_published_at := v_live.published_at;

  update public.content
  set status='draft'::public.content_status,
      robots_index=false
  where id=v_target_id;

  update public.content c
  set title=v_revision.title,
      excerpt=v_revision.excerpt,
      body_json=v_revision.body_json,
      body_text=v_revision.body_text,
      sector_id=v_revision.sector_id,
      category_id=v_revision.category_id,
      audience=v_revision.audience,
      scientific_reviewer_id=v_revision.scientific_reviewer_id,
      seo_title=v_revision.seo_title,
      seo_description=v_revision.seo_description,
      robots_follow=v_revision.robots_follow,
      schema_json=(coalesce(v_revision.schema_json,'{}'::jsonb)
        -'revision_of'-'revision_source_updated_at'-'revision_source_published_at'-'revision_source_fingerprint'
        -'revision_workflow_version'-'revision_applied_at'-'revision_applied_version'
        -'public_route_verification'-'public_route_verification_stale'-'release_token'),
      featured_image_url=v_revision.featured_image_url,
      is_featured=v_revision.is_featured,
      search_aliases=v_revision.search_aliases,
      primary_keyword=v_revision.primary_keyword,
      secondary_keywords=v_revision.secondary_keywords,
      semantic_terms=v_revision.semantic_terms,
      search_intent=v_revision.search_intent,
      author_display_name=v_revision.author_display_name,
      reviewer_display_name=v_revision.reviewer_display_name,
      reviewer_credentials=v_revision.reviewer_credentials,
      last_reviewed_at=v_revision.last_reviewed_at,
      references_json=v_revision.references_json,
      medical_disclaimer=v_revision.medical_disclaimer,
      featured_image_alt=v_revision.featured_image_alt
  where c.id=v_target_id;

  delete from public.content_categories where content_id=v_target_id;
  insert into public.content_categories(content_id,category_id,is_primary)
  select v_target_id,cc.category_id,cc.is_primary from public.content_categories cc where cc.content_id=p_revision_id
  on conflict(content_id,category_id) do update set is_primary=excluded.is_primary;

  delete from public.content_tags where content_id=v_target_id;
  insert into public.content_tags(content_id,tag_id)
  select v_target_id,ct.tag_id from public.content_tags ct where ct.content_id=p_revision_id on conflict do nothing;

  select * into v_live from public.content where id=v_target_id;
  v_token := private.pediatric_oncology_release_token(v_live);
  update public.content c
  set schema_json=(coalesce(c.schema_json,'{}'::jsonb)-'originality_report') || jsonb_build_object(
        'release_token',v_token,
        'originality_report',coalesce(v_revision.schema_json->'originality_report','{}'::jsonb) || jsonb_build_object('passed',true,'release_token',v_token,'checked_at',now())
      )
  where c.id=v_target_id;

  v_release := private.begin_pediatric_oncology_release(v_target_id);

  if v_old_published_at is not null then
    update public.content set published_at=v_old_published_at where id=v_target_id;
  end if;

  update public.content
  set status='archived'::public.content_status,
      robots_index=false,
      schema_json=coalesce(schema_json,'{}'::jsonb)||jsonb_build_object('revision_applied_at',now(),'revision_applied_to',v_target_id)
  where id=p_revision_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_revision_id::text));
  select coalesce(max(cv.version),0)+1 into v_version from public.content_versions cv where cv.content_id=p_revision_id;
  select private.content_snapshot_with_relations(p_revision_id) into v_snapshot;
  insert into public.content_versions(content_id,version,snapshot,created_by) values(p_revision_id,v_version,v_snapshot,null);

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(null,'content',v_target_id::text,'reviewed_pediatric_oncology_revision_applied',jsonb_build_object(
    'revision_id',p_revision_id,'release_token',v_token,'team_review','فريق روافد','release',v_release));

  return jsonb_build_object('revision_id',p_revision_id,'target_id',v_target_id,'release_token',v_token,'release',v_release);
end;
$function$;

revoke all on function private.apply_reviewed_pediatric_oncology_revision(uuid) from public, anon, authenticated;
