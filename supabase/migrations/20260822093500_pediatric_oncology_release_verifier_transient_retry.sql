-- Keep verified pediatric-oncology content from being rolled back to draft because of a
-- single transient Worker/sitemap failure. Real route/content mismatches still fail closed.

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
  v_page_url text;
  v_sitemap_url text;
  v_page_status integer := 0;
  v_page_html text := '';
  v_page_lower text := '';
  v_sitemap_status integer := 0;
  v_sitemap_xml text := '';
  v_canonical_match boolean := false;
  v_robots_match boolean := false;
  v_token_match boolean := false;
  v_sitemap_present boolean := false;
  v_ok boolean := false;
  v_reason text;
  v_version integer;
  v_snapshot jsonb;
  v_attempt integer;
  v_page_attempts integer := 0;
  v_sitemap_attempts integer := 0;
  v_max_attempts constant integer := 3;
  v_page_transient boolean := false;
  v_sitemap_transient boolean := false;
begin
  select * into v_row from public.content where id=p_id for update;
  if v_row.id is null then raise exception 'content not found'; end if;
  if v_row.status::text <> 'published' then raise exception 'content is not in published verification window'; end if;
  if coalesce(v_row.schema_json #>> '{public_route_verification,status}','') <> 'pending' then
    raise exception 'content does not have pending route verification';
  end if;

  v_token := private.pediatric_oncology_release_token(v_row);
  if coalesce(v_row.schema_json #>> '{public_route_verification,release_token}','') <> v_token then
    return private.rollback_pediatric_oncology_release(p_id,'release token changed before route verification');
  end if;
  if (v_row.schema_json #>> '{public_route_verification,expires_at}')::timestamptz <= pg_catalog.now() then
    return private.rollback_pediatric_oncology_release(p_id,'public route verification window expired');
  end if;

  v_expected_url := pg_catalog.rtrim(p_base_url,'/') || v_row.canonical_url;
  v_page_url := v_expected_url || case when pg_catalog.strpos(v_expected_url,'?')>0 then '&' else '?' end || 'release_verify=' || v_token;
  v_sitemap_url := pg_catalog.rtrim(p_base_url,'/') || '/sitemaps/content.xml?page=0&release_verify=' || v_token;

  for v_attempt in 1..v_max_attempts loop
    v_page_attempts := v_attempt;
    begin
      select h.status,h.content into v_page_status,v_page_html from extensions.http_get(v_page_url) h;
    exception when others then
      v_page_status:=0;
      v_page_html:='';
    end;

    v_page_transient := v_page_status = any(array[0,429,500,502,503,504]);
    exit when not v_page_transient;
    if v_attempt < v_max_attempts then
      perform pg_catalog.pg_sleep(0.20 * v_attempt);
    end if;
  end loop;

  v_page_lower := pg_catalog.lower(coalesce(v_page_html,''));
  v_canonical_match := v_page_status=200
    and pg_catalog.strpos(v_page_lower,'rel="canonical"')>0
    and pg_catalog.strpos(v_page_lower,pg_catalog.lower(v_expected_url))>0;
  v_robots_match := v_page_status=200
    and pg_catalog.strpos(v_page_lower,'name="robots"')>0
    and (
      pg_catalog.strpos(v_page_lower,'content="index,follow')>0
      or pg_catalog.strpos(v_page_lower,'content="index, follow')>0
      or pg_catalog.strpos(v_page_lower,'content="follow,index')>0
      or pg_catalog.strpos(v_page_lower,'content="follow, index')>0
    )
    and pg_catalog.strpos(v_page_lower,'content="noindex')=0;
  v_token_match := v_page_status=200
    and pg_catalog.strpos(v_page_lower,'name="rawafid-release-token"')>0
    and pg_catalog.strpos(v_page_lower,pg_catalog.lower(v_token))>0;

  for v_attempt in 1..v_max_attempts loop
    v_sitemap_attempts := v_attempt;
    begin
      select h.status,h.content into v_sitemap_status,v_sitemap_xml from extensions.http_get(v_sitemap_url) h;
    exception when others then
      v_sitemap_status:=0;
      v_sitemap_xml:='';
    end;

    v_sitemap_transient := v_sitemap_status = any(array[0,429,500,502,503,504]);
    exit when not v_sitemap_transient;
    if v_attempt < v_max_attempts then
      perform pg_catalog.pg_sleep(0.20 * v_attempt);
    end if;
  end loop;

  v_sitemap_present := v_sitemap_status=200 and pg_catalog.strpos(v_sitemap_xml,v_expected_url)>0;

  -- A persistent transport/server failure is not evidence that a previously publishable
  -- route is invalid. Keep the row published and pending so a later verification can retry.
  if v_page_transient or v_sitemap_transient then
    v_reason := pg_catalog.format(
      'public route verification deferred after transient HTTP failure: http=%s sitemap_http=%s page_attempts=%s sitemap_attempts=%s',
      v_page_status,v_sitemap_status,v_page_attempts,v_sitemap_attempts
    );

    update public.content c
    set schema_json=(coalesce(c.schema_json,'{}'::jsonb)-'release_blocker') || pg_catalog.jsonb_build_object(
      'publication_ready',true,
      'public_route_verification',coalesce(c.schema_json->'public_route_verification','{}'::jsonb) || pg_catalog.jsonb_build_object(
        'status','pending',
        'verification_mode','two-phase-live-route',
        'canonical_url',c.canonical_url,
        'release_token',v_token,
        'last_attempt_at',pg_catalog.now(),
        'page_http_status',v_page_status,
        'sitemap_http_status',v_sitemap_status,
        'page_attempts',v_page_attempts,
        'sitemap_attempts',v_sitemap_attempts,
        'transient_deferred',true,
        'retry_strategy','transient-http-retry-v1',
        'reason',v_reason,
        'public_origin',pg_catalog.rtrim(p_base_url,'/')))
    where c.id=p_id;

    insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
    values(null,'content',p_id::text,'pediatric_oncology_release_verification_deferred',pg_catalog.jsonb_build_object(
      'page_http_status',v_page_status,
      'sitemap_http_status',v_sitemap_status,
      'page_attempts',v_page_attempts,
      'sitemap_attempts',v_sitemap_attempts,
      'release_token',v_token,
      'retry_strategy','transient-http-retry-v1',
      'public_origin',pg_catalog.rtrim(p_base_url,'/')));

    return pg_catalog.jsonb_build_object(
      'id',p_id,
      'status','published',
      'verification','deferred',
      'reason',v_reason,
      'http_status',v_page_status,
      'sitemap_http_status',v_sitemap_status,
      'page_attempts',v_page_attempts,
      'sitemap_attempts',v_sitemap_attempts
    );
  end if;

  v_ok := v_page_status=200 and v_canonical_match and v_robots_match and v_token_match and v_sitemap_present;
  if not v_ok then
    v_reason := pg_catalog.format(
      'public route verification failed: http=%s canonical=%s robots=%s token=%s sitemap=%s sitemap_http=%s',
      v_page_status,v_canonical_match,v_robots_match,v_token_match,v_sitemap_present,v_sitemap_status
    );
    return private.rollback_pediatric_oncology_release(p_id,v_reason);
  end if;

  update public.content c
  set schema_json=(coalesce(c.schema_json,'{}'::jsonb)-'release_blocker'-'public_route_verification') || pg_catalog.jsonb_build_object(
    'publication_ready',true,
    'public_route_verification',pg_catalog.jsonb_build_object(
      'status','passed',
      'verified_at',pg_catalog.now(),
      'http_status',v_page_status,
      'canonical_match',true,
      'robots_index_match',true,
      'release_token_match',true,
      'sitemap_present',true,
      'sitemap_http_status',v_sitemap_status,
      'canonical_url',c.canonical_url,
      'release_token',v_token,
      'verification_mode','two-phase-live-route',
      'verifier','database-live-http-v2',
      'public_origin',pg_catalog.rtrim(p_base_url,'/'),
      'sitemap_strategy','content-sitemap-cache-busted-exact-canonical',
      'page_attempts',v_page_attempts,
      'sitemap_attempts',v_sitemap_attempts,
      'retry_strategy','transient-http-retry-v1'))
  where c.id=p_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(pg_catalog.max(cv.version),0)+1 into v_version from public.content_versions cv where cv.content_id=p_id;
  select pg_catalog.to_jsonb(c) into v_snapshot from public.content c where c.id=p_id;
  insert into public.content_versions(content_id,version,snapshot,created_by) values(p_id,v_version,v_snapshot,null);
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(null,'content',p_id::text,'pediatric_oncology_release_verified',pg_catalog.jsonb_build_object(
    'http_status',v_page_status,
    'sitemap_http_status',v_sitemap_status,
    'page_attempts',v_page_attempts,
    'sitemap_attempts',v_sitemap_attempts,
    'release_token',v_token,
    'verifier','database-live-http-v2',
    'retry_strategy','transient-http-retry-v1',
    'public_origin',pg_catalog.rtrim(p_base_url,'/')));

  return pg_catalog.jsonb_build_object(
    'id',p_id,
    'status','published',
    'verification','passed',
    'http_status',v_page_status,
    'canonical_match',true,
    'robots_index_match',true,
    'release_token_match',true,
    'sitemap_present',true,
    'page_attempts',v_page_attempts,
    'sitemap_attempts',v_sitemap_attempts
  );
end;
$function$;
