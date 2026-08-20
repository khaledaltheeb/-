-- Pediatric oncology two-phase public release guard.
-- Phase 1: require evidence/publication readiness before status=published.
-- Phase 2: verify the now-reachable public route (HTTP/canonical/sitemap) after release.
-- This removes the circular dependency where a route had to return HTTP 200 before
-- the row could become published, while preserving the strict guard on later edits.

create or replace function private.pediatric_oncology_public_route_release_guard()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  v_token text;
  v_verified_token text;
  v_is_pediatric boolean := false;
  v_initial_publish boolean := false;
begin
  if new.sector_id is not null then
    select exists(
      select 1
      from public.sectors s
      where s.id = new.sector_id
        and s.slug = 'pediatric-oncology'
        and s.is_active
    ) into v_is_pediatric;
  end if;

  if not v_is_pediatric then
    return new;
  end if;

  new.schema_json := pg_catalog.jsonb_set(
    coalesce(new.schema_json, '{}'::jsonb),
    '{pediatric_oncology_program}',
    'true'::jsonb,
    true
  );

  v_token := private.pediatric_oncology_release_token(new);
  v_verified_token := coalesce(new.schema_json #>> '{public_route_verification,release_token}', '');

  new.schema_json := pg_catalog.jsonb_set(
    new.schema_json,
    '{release_token}',
    pg_catalog.to_jsonb(v_token),
    true
  );

  if tg_op = 'INSERT' then
    v_initial_publish := new.status::text = 'published';
  else
    v_initial_publish := new.status::text = 'published'
      and old.status::text is distinct from 'published';
  end if;

  if new.status::text <> 'published'
     and v_verified_token <> ''
     and v_verified_token <> v_token then
    new.schema_json := (new.schema_json - 'public_route_verification')
      || pg_catalog.jsonb_build_object(
        'public_route_verification_stale',
        pg_catalog.jsonb_build_object(
          'invalidated_at', pg_catalog.now(),
          'reason', 'render-relevant-content-changed',
          'previous_release_token', v_verified_token,
          'current_release_token', v_token
        )
      );
  end if;

  if v_initial_publish then
    if coalesce(new.schema_json ->> 'publication_ready', 'false') <> 'true' then
      raise exception 'pediatric oncology publication blocked: publication_ready is not true'
        using errcode = '23514';
    end if;
    if not coalesce(new.robots_index, false) then
      raise exception 'pediatric oncology publication blocked: robots_index must be true before release'
        using errcode = '23514';
    end if;
    if coalesce(new.canonical_url, '') !~ '^/' then
      raise exception 'pediatric oncology publication blocked: canonical_url must be a site-relative public route'
        using errcode = '23514';
    end if;

    new.schema_json := (new.schema_json - 'public_route_verification')
      || pg_catalog.jsonb_build_object(
        'public_route_verification',
        pg_catalog.jsonb_build_object(
          'status', 'pending_post_publish',
          'canonical_url', new.canonical_url,
          'release_token', v_token,
          'requested_at', pg_catalog.now(),
          'verification_mode', 'post_publish_http_canonical_sitemap'
        )
      );
    return new;
  end if;

  if new.status::text = 'published'
     and not private.pediatric_oncology_public_route_ready(new) then
    raise exception 'pediatric oncology published-row change blocked: verified live route is missing, stale, non-indexable, or absent from sitemap'
      using errcode = '23514';
  end if;

  return new;
end;
$function$;
