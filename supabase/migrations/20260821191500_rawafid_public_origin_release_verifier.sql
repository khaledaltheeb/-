-- Align pediatric-oncology live-route verification with the actual Rawafid public Worker.
-- healthrenewal.org is a legacy/source reference and is not the public origin of this repository.

create or replace function private.verify_pediatric_oncology_public_route(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_row public.content%rowtype;
  v_token text;
  v_public_base constant text := 'https://rawafid-platform-staging.khaledaltheeb.workers.dev';
  v_absolute_canonical text;
  v_page record;
  v_sitemap record;
  v_page_lower text;
  v_canonical_match boolean := false;
  v_robots_match boolean := false;
  v_token_match boolean := false;
  v_sitemap_present boolean := false;
begin
  select c.* into v_row
  from public.content c
  join public.sectors s on s.id = c.sector_id
  where c.id = p_id
    and s.slug = 'pediatric-oncology'
    and s.is_active
  for update of c;

  if not found then return false; end if;
  if v_row.status not in ('approved'::public.content_status, 'scheduled'::public.content_status) then return false; end if;
  if not (
    coalesce(v_row.canonical_url,'') ~ '^/content/[a-zA-Z0-9-]+/?$'
    or coalesce(v_row.canonical_url,'') ~ '^/care-guides/[a-zA-Z0-9-]+/?$'
    or coalesce(v_row.canonical_url,'') ~ '^/magazine/pediatric-oncology/[a-zA-Z0-9-]+/[a-zA-Z0-9-]+/?$'
  ) then return false; end if;

  v_token := private.pediatric_oncology_release_token(v_row);
  v_absolute_canonical := v_public_base || v_row.canonical_url;

  begin
    select * into v_page
    from extensions.http_get((v_absolute_canonical || '?release_verify=' || v_token)::varchar);
    select * into v_sitemap
    from extensions.http_get((v_public_base || '/sitemap.xml?release_verify=' || v_token)::varchar);
  exception when others then
    return false;
  end;

  if coalesce(v_page.status,0) <> 200 or coalesce(v_sitemap.status,0) <> 200 then
    return false;
  end if;

  v_page_lower := pg_catalog.lower(coalesce(v_page.content,''));
  v_canonical_match :=
    pg_catalog.strpos(v_page_lower, pg_catalog.lower(v_absolute_canonical)) > 0
    and pg_catalog.strpos(v_page_lower, 'rel="canonical"') > 0;
  v_robots_match :=
    pg_catalog.strpos(v_page_lower, 'name="robots"') > 0
    and pg_catalog.strpos(v_page_lower, 'noindex') = 0
    and pg_catalog.strpos(v_page_lower, 'index') > 0;
  v_token_match :=
    pg_catalog.strpos(v_page_lower, 'name="rawafid-release-token"') > 0
    and pg_catalog.strpos(v_page_lower, pg_catalog.lower(v_token)) > 0;
  v_sitemap_present :=
    pg_catalog.strpos(coalesce(v_sitemap.content,''), v_absolute_canonical) > 0;

  if not (v_canonical_match and v_robots_match and v_token_match and v_sitemap_present) then
    return false;
  end if;

  update public.content c
  set schema_json = coalesce(c.schema_json,'{}'::jsonb) || pg_catalog.jsonb_build_object(
        'public_route_verification', pg_catalog.jsonb_build_object(
          'status','passed',
          'http_status',200,
          'canonical_match',true,
          'robots_index_match',true,
          'sitemap_present',true,
          'canonical_url',v_row.canonical_url,
          'release_token',v_token,
          'checked_at',pg_catalog.now(),
          'verifier','database-live-http-v1',
          'public_origin',v_public_base,
          'sitemap_strategy','production-sitemap-exact-canonical'
        ),
        'deployment_audit_status','public-route-verified'
      ),
      updated_at = pg_catalog.now()
  where c.id = v_row.id;

  return true;
end;
$function$;

create or replace function private.verify_pediatric_oncology_release(
  p_id uuid,
  p_base_url text default 'https://rawafid-platform-staging.khaledaltheeb.workers.dev'::text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_row public.content%rowtype;
  v_token text;
  v_expected_url text;
  v_page_status integer := 0;
  v_page_html text := '';
  v_sitemap_status integer := 0;
  v_sitemap_xml text := '';
  v_canonical_match boolean := false;
  v_robots_match boolean := false;
  v_sitemap_present boolean := false;
  v_ok boolean := false;
  v_reason text;
  v_version integer;
  v_snapshot jsonb;
begin
  select * into v_row from public.content where id=p_id for update;
  if v_row.id is null then raise exception 'content not found'; end if;
  if v_row.status::text <> 'published' then raise exception 'content is not in published verification window'; end if;
  if coalesce(v_row.schema_json #>> '{public_route_verification,status}','') <> 'pending' then raise exception 'content does not have pending route verification'; end if;
  v_token := private.pediatric_oncology_release_token(v_row);
  if coalesce(v_row.schema_json #>> '{public_route_verification,release_token}','') <> v_token then return private.rollback_pediatric_oncology_release(p_id,'release token changed before route verification'); end if;
  if (v_row.schema_json #>> '{public_route_verification,expires_at}')::timestamptz <= pg_catalog.now() then return private.rollback_pediatric_oncology_release(p_id,'public route verification window expired'); end if;
  v_expected_url := pg_catalog.rtrim(p_base_url,'/') || v_row.canonical_url;

  begin
    select h.status,h.content into v_page_status,v_page_html from extensions.http_get(v_expected_url) h;
  exception when others then v_page_status:=0; v_page_html:=''; end;
  v_canonical_match := v_page_status=200 and pg_catalog.strpos(v_page_html,'<link rel="canonical" href="'||v_expected_url||'">')>0;
  v_robots_match := v_page_status=200 and pg_catalog.strpos(pg_catalog.lower(v_page_html),'<meta name="robots" content="index,follow')>0 and pg_catalog.strpos(pg_catalog.lower(v_page_html),'noindex')=0;

  begin
    select h.status,h.content into v_sitemap_status,v_sitemap_xml from extensions.http_get(pg_catalog.rtrim(p_base_url,'/')||'/sitemaps/content.xml?page=0') h;
  exception when others then v_sitemap_status:=0; v_sitemap_xml:=''; end;
  v_sitemap_present := v_sitemap_status=200 and pg_catalog.strpos(v_sitemap_xml,v_expected_url)>0;
  v_ok := v_page_status=200 and v_canonical_match and v_robots_match and v_sitemap_present;
  if not v_ok then
    v_reason := pg_catalog.format('public route verification failed: http=%s canonical=%s robots=%s sitemap=%s sitemap_http=%s',v_page_status,v_canonical_match,v_robots_match,v_sitemap_present,v_sitemap_status);
    return private.rollback_pediatric_oncology_release(p_id,v_reason);
  end if;

  update public.content c set schema_json=(coalesce(c.schema_json,'{}'::jsonb)-'release_blocker'-'public_route_verification') || pg_catalog.jsonb_build_object(
    'publication_ready',true,
    'public_route_verification',pg_catalog.jsonb_build_object(
      'status','passed','verified_at',pg_catalog.now(),'http_status',v_page_status,'canonical_match',true,
      'robots_index_match',true,'sitemap_present',true,'sitemap_http_status',v_sitemap_status,'canonical_url',c.canonical_url,
      'release_token',v_token,'verification_mode','two-phase-live-route','verifier','database-live-http-v1','public_origin',pg_catalog.rtrim(p_base_url,'/')))
  where c.id=p_id;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(pg_catalog.max(cv.version),0)+1 into v_version from public.content_versions cv where cv.content_id=p_id;
  select pg_catalog.to_jsonb(c) into v_snapshot from public.content c where c.id=p_id;
  insert into public.content_versions(content_id,version,snapshot,created_by) values(p_id,v_version,v_snapshot,null);
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(null,'content',p_id::text,'pediatric_oncology_release_verified',pg_catalog.jsonb_build_object('http_status',v_page_status,'sitemap_http_status',v_sitemap_status,'release_token',v_token,'verifier','database-live-http-v1','public_origin',pg_catalog.rtrim(p_base_url,'/')));
  return pg_catalog.jsonb_build_object('id',p_id,'status','published','verification','passed','http_status',v_page_status,'canonical_match',true,'robots_index_match',true,'sitemap_present',true);
end;
$function$;
