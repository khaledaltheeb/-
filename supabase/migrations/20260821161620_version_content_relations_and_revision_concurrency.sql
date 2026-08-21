create or replace function private.content_snapshot_with_relations(p_content_id uuid)
returns jsonb
language sql
stable
set search_path=''
as $function$
  select to_jsonb(c) || jsonb_build_object(
    '_relations',jsonb_build_object(
      'categories',coalesce((
        select jsonb_agg(jsonb_build_object('category_id',cc.category_id,'is_primary',cc.is_primary) order by cc.is_primary desc,cc.category_id)
        from public.content_categories cc where cc.content_id=c.id
      ),'[]'::jsonb),
      'tags',coalesce((
        select jsonb_agg(jsonb_build_object('tag_id',ct.tag_id) order by ct.tag_id)
        from public.content_tags ct where ct.content_id=c.id
      ),'[]'::jsonb)
    )
  )
  from public.content c where c.id=p_content_id;
$function$;
revoke all on function private.content_snapshot_with_relations(uuid) from public,anon,authenticated;

create or replace function private.set_content_relations(p_content_id uuid,p_category_ids uuid[] default '{}'::uuid[],p_tag_ids uuid[] default '{}'::uuid[])
returns uuid
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_role public.app_role;
  v_author uuid;
  v_status public.content_status;
  v_sector uuid;
  v_primary uuid;
  v_schema jsonb;
  v_version integer;
  v_snapshot jsonb;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  v_role:=private.current_role();
  select author_id,status,sector_id,category_id,coalesce(schema_json,'{}'::jsonb)
  into v_author,v_status,v_sector,v_primary,v_schema
  from public.content where id=p_content_id for update;
  if v_status is null then raise exception 'content not found'; end if;

  if v_role in ('owner','admin','editor') then null;
  elsif v_role='specialist' and v_author=(select auth.uid()) and v_status='draft'::public.content_status then null;
  else raise exception 'relation update denied'; end if;

  if v_status in ('published'::public.content_status,'scheduled'::public.content_status) then
    raise exception 'live or scheduled content relations must be changed through an editable revision';
  end if;
  if v_status not in ('draft'::public.content_status,'scientific_review'::public.content_status,'editorial_review'::public.content_status,'seo_review'::public.content_status,'accessibility_review'::public.content_status) then
    raise exception 'content relations can only be changed in an editable workflow state';
  end if;

  if exists(
    select 1 from unnest(coalesce(p_category_ids,'{}'::uuid[])) x(id)
    left join public.categories c on c.id=x.id
    where c.id is null or (v_sector is not null and c.sector_id is distinct from v_sector)
  ) then raise exception 'category does not belong to content sector'; end if;
  if exists(
    select 1 from unnest(coalesce(p_tag_ids,'{}'::uuid[])) x(id)
    left join public.tags t on t.id=x.id
    where t.id is null or t.is_active is distinct from true
  ) then raise exception 'invalid tag'; end if;

  delete from public.content_categories where content_id=p_content_id;
  if v_primary is not null then
    insert into public.content_categories(content_id,category_id,is_primary)
    values(p_content_id,v_primary,true)
    on conflict(content_id,category_id) do update set is_primary=true;
  end if;
  insert into public.content_categories(content_id,category_id,is_primary)
  select p_content_id,id,false from unnest(coalesce(p_category_ids,'{}'::uuid[])) id
  where id is distinct from v_primary
  on conflict(content_id,category_id) do nothing;

  delete from public.content_tags where content_id=p_content_id;
  insert into public.content_tags(content_id,tag_id)
  select p_content_id,id from unnest(coalesce(p_tag_ids,'{}'::uuid[])) id
  on conflict(content_id,tag_id) do nothing;

  update public.content set updated_at=now() where id=p_content_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_content_id::text));
  select coalesce(max(version),0)+1 into v_version from public.content_versions where content_id=p_content_id;
  select private.content_snapshot_with_relations(p_content_id) into v_snapshot;
  insert into public.content_versions(content_id,version,snapshot,created_by)
  values(p_content_id,v_version,v_snapshot,(select auth.uid()));

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values((select auth.uid()),'content',p_content_id::text,'taxonomy_relations_updated',
    jsonb_build_object('categories',coalesce(p_category_ids,'{}'::uuid[]),'tags',coalesce(p_tag_ids,'{}'::uuid[]),'version',v_version));
  return p_content_id;
end;
$function$;

create or replace function private.restore_content_version(p_content_id uuid,p_version integer)
returns integer
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_role public.app_role;
  v_snapshot jsonb;
  v_relations jsonb;
  v_old public.content%rowtype;
  v_current_status public.content_status;
  v_new_version integer;
  v_new_snapshot jsonb;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  v_role:=private.current_role();
  if v_role not in ('owner','admin') then raise exception 'admin required'; end if;
  if p_version<1 then raise exception 'invalid version'; end if;

  select status into v_current_status from public.content where id=p_content_id for update;
  if v_current_status is null then raise exception 'content not found'; end if;
  if v_current_status in ('published'::public.content_status,'scheduled'::public.content_status) then
    raise exception 'live or scheduled content must be explicitly withdrawn before restoring a historical version';
  end if;

  select snapshot into v_snapshot from public.content_versions where content_id=p_content_id and version=p_version;
  if v_snapshot is null then raise exception 'version not found'; end if;
  v_relations:=v_snapshot->'_relations';
  select * into v_old from jsonb_populate_record(null::public.content,v_snapshot);

  update public.content set
    content_type=v_old.content_type,slug=v_old.slug,title=v_old.title,excerpt=v_old.excerpt,
    body_json=coalesce(v_old.body_json,'{}'::jsonb),body_text=v_old.body_text,
    sector_id=v_old.sector_id,category_id=v_old.category_id,
    audience=coalesce(v_old.audience,'{}'::text[]),search_aliases=coalesce(v_old.search_aliases,'{}'::text[]),
    seo_title=v_old.seo_title,seo_description=v_old.seo_description,canonical_url=v_old.canonical_url,
    robots_index=v_old.robots_index,robots_follow=v_old.robots_follow,
    schema_json=coalesce(v_old.schema_json,'{}'::jsonb),featured_image_url=v_old.featured_image_url,
    featured_image_alt=v_old.featured_image_alt,primary_keyword=v_old.primary_keyword,
    secondary_keywords=coalesce(v_old.secondary_keywords,'{}'::text[]),semantic_terms=coalesce(v_old.semantic_terms,'{}'::text[]),
    search_intent=v_old.search_intent,author_display_name=v_old.author_display_name,
    scientific_reviewer_id=v_old.scientific_reviewer_id,reviewer_display_name=v_old.reviewer_display_name,
    reviewer_credentials=v_old.reviewer_credentials,last_reviewed_at=v_old.last_reviewed_at,
    references_json=coalesce(v_old.references_json,'[]'::jsonb),medical_disclaimer=v_old.medical_disclaimer,
    status='draft'::public.content_status,scheduled_at=null,published_at=null
  where id=p_content_id;

  if jsonb_typeof(v_relations)='object' then
    delete from public.content_categories where content_id=p_content_id;
    insert into public.content_categories(content_id,category_id,is_primary)
    select p_content_id,(e->>'category_id')::uuid,coalesce((e->>'is_primary')::boolean,false)
    from jsonb_array_elements(coalesce(v_relations->'categories','[]'::jsonb)) e
    where coalesce(e->>'category_id','') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      and exists(select 1 from public.categories c where c.id=(e->>'category_id')::uuid)
    on conflict(content_id,category_id) do update set is_primary=excluded.is_primary;

    delete from public.content_tags where content_id=p_content_id;
    insert into public.content_tags(content_id,tag_id)
    select p_content_id,(e->>'tag_id')::uuid
    from jsonb_array_elements(coalesce(v_relations->'tags','[]'::jsonb)) e
    where coalesce(e->>'tag_id','') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      and exists(select 1 from public.tags t where t.id=(e->>'tag_id')::uuid)
    on conflict(content_id,tag_id) do nothing;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_content_id::text));
  select coalesce(max(version),0)+1 into v_new_version from public.content_versions where content_id=p_content_id;
  select private.content_snapshot_with_relations(p_content_id) into v_new_snapshot;
  insert into public.content_versions(content_id,version,snapshot,created_by)
  values(p_content_id,v_new_version,v_new_snapshot,(select auth.uid()));
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values((select auth.uid()),'content',p_content_id::text,'version_restored',
    jsonb_build_object('source_version',p_version,'previous_status',v_current_status),
    jsonb_build_object('new_version',v_new_version,'status','draft','relations_restored',jsonb_typeof(v_relations)='object'));
  return v_new_version;
end;
$function$;

create or replace function private.create_published_content_revision(p_content_id uuid)
returns uuid
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_role public.app_role;
  v_live public.content%rowtype;
  v_existing uuid;
  v_revision_id uuid := gen_random_uuid();
  v_revision_slug text;
  v_schema jsonb;
  v_snapshot jsonb;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  v_role:=private.current_role();
  if v_role not in ('owner','admin','editor') then raise exception 'content editor required'; end if;
  select * into v_live from public.content where id=p_content_id for update;
  if v_live.id is null then raise exception 'content not found'; end if;
  if v_live.status<>'published'::public.content_status or v_live.published_at is null or v_live.published_at>now() then raise exception 'only currently published content can start a zero-downtime revision'; end if;
  if coalesce(v_live.schema_json->>'revision_of','')<>'' then raise exception 'cannot create a revision from another revision'; end if;
  select c.id into v_existing from public.content c where c.schema_json->>'revision_of'=p_content_id::text and c.status<>'archived'::public.content_status order by c.created_at desc limit 1;
  if v_existing is not null then return v_existing; end if;

  v_revision_slug:=left(v_live.slug,140)||'-revision-'||substr(replace(v_revision_id::text,'-',''),1,12);
  v_schema:=coalesce(v_live.schema_json,'{}'::jsonb)||jsonb_build_object('revision_of',p_content_id::text,'revision_source_updated_at',v_live.updated_at,'revision_source_published_at',v_live.published_at,'revision_workflow_version',1);
  insert into public.content(id,content_type,slug,title,excerpt,body_json,body_text,sector_id,category_id,audience,author_id,scientific_reviewer_id,status,seo_title,seo_description,canonical_url,robots_index,robots_follow,schema_json,featured_image_url,is_featured,scheduled_at,published_at,search_aliases,primary_keyword,secondary_keywords,semantic_terms,search_intent,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,featured_image_alt)
  values(v_revision_id,v_live.content_type,v_revision_slug,v_live.title,v_live.excerpt,v_live.body_json,v_live.body_text,v_live.sector_id,v_live.category_id,v_live.audience,v_live.author_id,v_live.scientific_reviewer_id,'draft'::public.content_status,v_live.seo_title,v_live.seo_description,v_live.canonical_url,false,v_live.robots_follow,v_schema,v_live.featured_image_url,v_live.is_featured,null,null,v_live.search_aliases,v_live.primary_keyword,v_live.secondary_keywords,v_live.semantic_terms,v_live.search_intent,v_live.author_display_name,v_live.reviewer_display_name,v_live.reviewer_credentials,v_live.last_reviewed_at,v_live.references_json,v_live.medical_disclaimer,v_live.featured_image_alt);
  insert into public.content_categories(content_id,category_id,is_primary) select v_revision_id,cc.category_id,cc.is_primary from public.content_categories cc where cc.content_id=p_content_id on conflict do nothing;
  insert into public.content_tags(content_id,tag_id) select v_revision_id,ct.tag_id from public.content_tags ct where ct.content_id=p_content_id on conflict do nothing;
  select private.content_snapshot_with_relations(v_revision_id) into v_snapshot;
  insert into public.content_versions(content_id,version,snapshot,created_by) values(v_revision_id,1,v_snapshot,v_uid);
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data) values(v_uid,'content',p_content_id::text,'published_revision_started',jsonb_build_object('revision_id',v_revision_id,'source_updated_at',v_live.updated_at));
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data) values(v_uid,'content',v_revision_id::text,'revision_created',jsonb_build_object('revision_of',p_content_id,'source_slug',v_live.slug));
  return v_revision_id;
end;
$function$;

create or replace function private.apply_published_content_revision(p_revision_id uuid)
returns integer
language plpgsql
security definer
set search_path=''
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_role public.app_role;
  v_revision public.content%rowtype;
  v_live public.content%rowtype;
  v_target_id uuid;
  v_source_updated_at timestamptz;
  v_clean_schema jsonb;
  v_new_version integer;
  v_revision_version integer;
  v_snapshot jsonb;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  v_role:=private.current_role();
  if v_role not in ('owner','admin') then raise exception 'admin required'; end if;
  select * into v_revision from public.content where id=p_revision_id for update;
  if v_revision.id is null then raise exception 'revision not found'; end if;
  if v_revision.status<>'approved'::public.content_status then raise exception 'revision must be approved before applying'; end if;
  if coalesce(v_revision.schema_json->>'revision_of','') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then raise exception 'invalid revision target'; end if;
  v_target_id:=(v_revision.schema_json->>'revision_of')::uuid;
  v_source_updated_at:=nullif(v_revision.schema_json->>'revision_source_updated_at','')::timestamptz;
  select * into v_live from public.content where id=v_target_id for update;
  if v_live.id is null then raise exception 'live content target not found'; end if;
  if v_live.status<>'published'::public.content_status or v_live.published_at is null or v_live.published_at>now() then raise exception 'revision target is no longer live'; end if;
  if v_source_updated_at is null or v_live.updated_at is distinct from v_source_updated_at then raise exception 'live content changed after this revision started; start a fresh revision before applying'; end if;
  if v_revision.canonical_url is distinct from v_live.canonical_url then raise exception 'published revision cannot change canonical identity; manage route changes explicitly'; end if;

  v_clean_schema:=coalesce(v_revision.schema_json,'{}'::jsonb)-'revision_of'-'revision_source_updated_at'-'revision_source_published_at'-'revision_workflow_version'-'revision_applied_at'-'revision_applied_version';
  update public.content set title=v_revision.title,excerpt=v_revision.excerpt,body_json=v_revision.body_json,body_text=v_revision.body_text,sector_id=v_revision.sector_id,category_id=v_revision.category_id,audience=v_revision.audience,scientific_reviewer_id=v_revision.scientific_reviewer_id,status='published'::public.content_status,seo_title=v_revision.seo_title,seo_description=v_revision.seo_description,robots_follow=v_revision.robots_follow,schema_json=v_clean_schema,featured_image_url=v_revision.featured_image_url,is_featured=v_revision.is_featured,search_aliases=v_revision.search_aliases,primary_keyword=v_revision.primary_keyword,secondary_keywords=v_revision.secondary_keywords,semantic_terms=v_revision.semantic_terms,search_intent=v_revision.search_intent,author_display_name=v_revision.author_display_name,reviewer_display_name=v_revision.reviewer_display_name,reviewer_credentials=v_revision.reviewer_credentials,last_reviewed_at=v_revision.last_reviewed_at,references_json=v_revision.references_json,medical_disclaimer=v_revision.medical_disclaimer,featured_image_alt=v_revision.featured_image_alt,published_at=v_live.published_at where id=v_target_id;
  delete from public.content_categories where content_id=v_target_id;
  insert into public.content_categories(content_id,category_id,is_primary) select v_target_id,cc.category_id,cc.is_primary from public.content_categories cc where cc.content_id=p_revision_id on conflict(content_id,category_id) do update set is_primary=excluded.is_primary;
  delete from public.content_tags where content_id=v_target_id;
  insert into public.content_tags(content_id,tag_id) select v_target_id,ct.tag_id from public.content_tags ct where ct.content_id=p_revision_id on conflict do nothing;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_target_id::text));
  select coalesce(max(version),0)+1 into v_new_version from public.content_versions where content_id=v_target_id;
  select private.content_snapshot_with_relations(v_target_id) into v_snapshot;
  insert into public.content_versions(content_id,version,snapshot,created_by) values(v_target_id,v_new_version,v_snapshot,v_uid);

  update public.content set status='archived'::public.content_status,robots_index=false,schema_json=coalesce(schema_json,'{}'::jsonb)||jsonb_build_object('revision_applied_at',now(),'revision_applied_version',v_new_version) where id=p_revision_id;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_revision_id::text));
  select coalesce(max(version),0)+1 into v_revision_version from public.content_versions where content_id=p_revision_id;
  select private.content_snapshot_with_relations(p_revision_id) into v_snapshot;
  insert into public.content_versions(content_id,version,snapshot,created_by) values(p_revision_id,v_revision_version,v_snapshot,v_uid);
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data) values(v_uid,'content',v_target_id::text,'published_revision_applied',jsonb_build_object('revision_id',p_revision_id,'version',v_new_version,'published_at_preserved',v_live.published_at));
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data) values(v_uid,'content',p_revision_id::text,'revision_applied',jsonb_build_object('target_content_id',v_target_id,'target_version',v_new_version));
  return v_new_version;
end;
$function$;
