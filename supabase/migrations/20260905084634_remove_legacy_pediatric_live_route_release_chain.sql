do $$
declare r record;
begin
  for r in select jobid from cron.job where jobname='pediatric-oncology-release-timeout-sweep' loop
    perform cron.unschedule(r.jobid);
  end loop;
end $$;

drop trigger if exists zzzzz_pediatric_oncology_public_route_release_guard on public.content;

create or replace function private.pediatric_oncology_public_route_ready(p_row public.content)
returns boolean
language sql
stable
set search_path to ''
as $function$
  select
    coalesce(p_row.schema_json ->> 'pediatric_oncology_program', 'false') = 'true'
    and coalesce(p_row.schema_json ->> 'publication_ready', 'false') = 'true'
    and coalesce(p_row.robots_index, false)
    and coalesce(p_row.canonical_url, '') ~ '^/';
$function$;

create or replace function private.verify_pediatric_oncology_public_route(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_row public.content%rowtype;
begin
  select c.* into v_row
  from public.content c
  join public.sectors s on s.id=c.sector_id
  where c.id=p_id and s.slug='pediatric-oncology' and s.is_active;
  if not found then return false; end if;
  return private.pediatric_oncology_public_route_ready(v_row);
end;
$function$;

create or replace function private.verify_pediatric_oncology_release(
  p_id uuid,
  p_base_url text default 'https://healthrenewal.org'::text
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_row public.content%rowtype;
  v_ready boolean := false;
begin
  select * into v_row from public.content where id=p_id;
  if v_row.id is null then raise exception 'content not found'; end if;
  v_ready := private.pediatric_oncology_public_route_ready(v_row);
  return pg_catalog.jsonb_build_object(
    'id',p_id,
    'status',v_row.status::text,
    'verification','not-required',
    'ready',v_ready,
    'policy','local-release-checks-only'
  );
end;
$function$;

create or replace function private.begin_pediatric_oncology_release(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_row public.content%rowtype;
  v_token text;
  v_version integer;
  v_snapshot jsonb;
  v_started timestamptz := pg_catalog.now();
begin
  select * into v_row from public.content where id=p_id for update;
  if v_row.id is null then raise exception 'content not found'; end if;
  if not exists(select 1 from public.sectors s where s.id=v_row.sector_id and s.slug='pediatric-oncology' and s.is_active) then
    raise exception 'content is not active pediatric oncology content';
  end if;
  if v_row.status::text <> 'draft' then
    raise exception 'release candidate must be draft; found %',v_row.status;
  end if;

  v_token := private.pediatric_oncology_release_token(v_row);

  update public.content c
  set schema_json=(coalesce(c.schema_json,'{}'::jsonb)-'release_blocker'-'public_route_verification'-'public_route_verification_stale')
        || pg_catalog.jsonb_build_object(
          'publication_ready',true,
          'release_token',v_token,
          'deployment_audit_status','live-route-verification-not-required'
        ),
      robots_index=true,
      status='published'::public.content_status,
      published_at=coalesce(c.published_at,v_started)
  where c.id=p_id;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_id::text));
  select coalesce(pg_catalog.max(cv.version),0)+1 into v_version
  from public.content_versions cv where cv.content_id=p_id;
  select pg_catalog.to_jsonb(c) into v_snapshot from public.content c where c.id=p_id;
  insert into public.content_versions(content_id,version,snapshot,created_by)
  values(p_id,v_version,v_snapshot,null);

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(null,'content',p_id::text,'pediatric_oncology_release',pg_catalog.jsonb_build_object(
    'release_token',v_token,
    'verification','not-required',
    'published_at',v_started
  ));

  return pg_catalog.jsonb_build_object(
    'id',p_id,
    'status','published',
    'verification','not-required',
    'release_token',v_token
  );
end;
$function$;

create or replace function private.publish_due_content()
returns integer
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_id uuid;
  v_row public.content%rowtype;
  v_version integer;
  v_snapshot jsonb;
  v_count integer := 0;
begin
  for v_id in
    select c.id
    from public.content c
    where c.status='scheduled'::public.content_status
      and c.scheduled_at is not null
      and c.scheduled_at <= pg_catalog.now()
    order by c.scheduled_at,c.id
  loop
    select c.* into v_row
    from public.content c
    where c.id=v_id
    for update;

    if not found
       or v_row.status <> 'scheduled'::public.content_status
       or v_row.scheduled_at is null
       or v_row.scheduled_at > pg_catalog.now() then
      continue;
    end if;

    begin
      update public.content c
      set status='published'::public.content_status,
          published_at=coalesce(c.published_at,pg_catalog.now())
      where c.id=v_row.id and c.status='scheduled'::public.content_status;

      if not found then continue; end if;

      perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_row.id::text));
      select coalesce(pg_catalog.max(cv.version),0)+1 into v_version
      from public.content_versions cv where cv.content_id=v_row.id;
      select pg_catalog.to_jsonb(c) into v_snapshot
      from public.content c where c.id=v_row.id;
      insert into public.content_versions(content_id,version,snapshot,created_by)
      values(v_row.id,v_version,v_snapshot,null);

      insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
      values(null,'content',v_row.id::text,'scheduled_publish',pg_catalog.jsonb_build_object(
        'published_at',pg_catalog.now(),
        'verification','not-required'
      ));
      v_count := v_count+1;
    exception when others then
      if not exists(
        select 1 from public.audit_logs a
        where a.entity_type='content'
          and a.entity_id=v_row.id::text
          and a.action='scheduled_publish_failed'
          and a.created_at > pg_catalog.now()-interval '1 hour'
      ) then
        insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
        values(null,'content',v_row.id::text,'scheduled_publish_failed',pg_catalog.jsonb_build_object(
          'error',SQLERRM,'sqlstate',SQLSTATE,'failed_at',pg_catalog.now()
        ));
      end if;
    end;
  end loop;
  return v_count;
end;
$function$;
