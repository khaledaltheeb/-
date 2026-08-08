create or replace function private.content_release_gate()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_reference_count integer := 0;
  v_evidence_required boolean := false;
begin
  if new.status in ('accessibility_review'::public.content_status,'approved'::public.content_status,'published'::public.content_status) then
    if nullif(pg_catalog.btrim(coalesce(new.seo_title,'')),'') is null or pg_catalog.char_length(pg_catalog.btrim(new.seo_title)) > 47 then
      raise exception 'SEO title is required and must fit the branded title contract';
    end if;
    if new.seo_description is null or pg_catalog.char_length(pg_catalog.btrim(new.seo_description)) < 150 or pg_catalog.char_length(pg_catalog.btrim(new.seo_description)) > 160 then
      raise exception 'meta description must be 150-160 characters';
    end if;
    if nullif(pg_catalog.btrim(coalesce(new.primary_keyword,'')),'') is null then
      raise exception 'primary keyword is required before accessibility review';
    end if;
    if new.canonical_url is null or pg_catalog.btrim(new.canonical_url) = '' then
      new.canonical_url := '/content/' || new.slug;
    end if;
  end if;

  if new.status in ('approved'::public.content_status,'published'::public.content_status) then
    if nullif(pg_catalog.btrim(coalesce(new.author_display_name,'')),'') is null then
      new.author_display_name := (select nullif(pg_catalog.btrim(coalesce(p.display_name,'')),'') from public.profiles p where p.id=new.author_id);
    end if;
    if new.author_display_name is null then raise exception 'visible author is required before approval'; end if;

    -- Scientific-review identity is optional. Evidence quality is enforced for evidence-heavy content types.
    v_evidence_required := new.content_type in ('condition','protocol','intervention','assessment','research','guide');
    if v_evidence_required then
      if pg_catalog.jsonb_typeof(coalesce(new.references_json,'[]'::jsonb)) <> 'array' then raise exception 'references must be an array'; end if;
      v_reference_count := pg_catalog.jsonb_array_length(coalesce(new.references_json,'[]'::jsonb));
      if v_reference_count < 1 then raise exception 'at least one authoritative reference is required for evidence-heavy content'; end if;
    end if;

    if new.featured_image_url is not null and nullif(pg_catalog.btrim(coalesce(new.featured_image_alt,'')),'') is null then
      raise exception 'featured image alt text is required';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.content_release_gate() from public,anon,authenticated;

drop trigger if exists content_release_gate on public.content;
create trigger content_release_gate
before insert or update of status on public.content
for each row execute function private.content_release_gate();

create or replace function private.transition_content_status(p_id uuid, p_target public.content_status)
returns public.content_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current public.content_status;
  v_role public.app_role;
  v_author uuid;
  v_allowed boolean := false;
  v_version integer;
  v_snapshot jsonb;
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  select status,author_id into v_current,v_author from public.content where id=p_id for update;
  if v_current is null then raise exception 'content not found'; end if;

  if v_role in ('owner','admin') then
    v_allowed := (v_current='draft' and p_target in ('editorial_review','scientific_review'))
      or (v_current='scientific_review' and p_target in ('draft','editorial_review'))
      or (v_current='editorial_review' and p_target in ('draft','seo_review'))
      or (v_current='seo_review' and p_target in ('editorial_review','accessibility_review'))
      or (v_current='accessibility_review' and p_target in ('editorial_review','approved'))
      or (v_current='approved' and p_target='editorial_review')
      or (v_current='scheduled' and p_target='approved')
      or (v_current='published' and p_target='archived')
      or (v_current='archived' and p_target='draft');
  elsif v_role='specialist' or v_role='editor' then
    if v_current='draft' and p_target='editorial_review' and (v_role='editor' or v_author=(select auth.uid())) then v_allowed:=true; end if;
    if v_role='editor' and v_current='editorial_review' and p_target in ('draft','seo_review') then v_allowed:=true; end if;
    if v_role='editor' and v_current='accessibility_review' and p_target in ('editorial_review','approved') then v_allowed:=true; end if;
  elsif v_role='scientific_reviewer' then
    if v_current='scientific_review' and p_target in ('draft','editorial_review') then v_allowed:=true; end if;
  elsif v_role='seo_manager' then
    if v_current='seo_review' and p_target in ('editorial_review','accessibility_review') then v_allowed:=true; end if;
  end if;
  if not v_allowed then raise exception 'workflow transition denied'; end if;

  update public.content set status=p_target,
    scheduled_at=case when v_current='scheduled' and p_target='approved' then null else scheduled_at end,
    published_at=case when p_target='draft' and v_current='archived' then null else published_at end
  where id=p_id;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(max(version),0)+1 into v_version from public.content_versions where content_id=p_id;
  select to_jsonb(c) into v_snapshot from public.content c where c.id=p_id;
  insert into public.content_versions(content_id,version,snapshot,created_by) values(p_id,v_version,v_snapshot,(select auth.uid()));
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values((select auth.uid()),'content',p_id::text,'status_transition',jsonb_build_object('from',v_current,'to',p_target));
  return p_target;
end;
$$;
