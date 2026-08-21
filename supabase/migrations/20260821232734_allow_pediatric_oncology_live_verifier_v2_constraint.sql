alter table public.content
  drop constraint if exists pediatric_oncology_published_route_verified;

alter table public.content
  add constraint pediatric_oncology_published_route_verified
  check (
    status <> 'published'::public.content_status
    or coalesce(schema_json ->> 'pediatric_oncology_program', 'false') <> 'true'
    or (
      coalesce((schema_json ->> 'publication_ready')::boolean, false)
      and coalesce(robots_index, false)
      and (
        (
          coalesce(schema_json #>> '{public_route_verification,status}', '') = 'pending'
          and coalesce(schema_json #>> '{public_route_verification,verification_mode}', '') = 'two-phase-live-route'
          and coalesce(schema_json #>> '{public_route_verification,canonical_url}', '') = coalesce(canonical_url, '')
          and coalesce(schema_json #>> '{public_route_verification,release_token}', '') = coalesce(schema_json ->> 'release_token', '')
        )
        or (
          coalesce(schema_json #>> '{public_route_verification,status}', '') = 'passed'
          and coalesce(schema_json #>> '{public_route_verification,http_status}', '') = '200'
          and coalesce(schema_json #>> '{public_route_verification,canonical_match}', 'false') = 'true'
          and coalesce(schema_json #>> '{public_route_verification,robots_index_match}', 'false') = 'true'
          and coalesce(schema_json #>> '{public_route_verification,sitemap_present}', 'false') = 'true'
          and coalesce(schema_json #>> '{public_route_verification,canonical_url}', '') = coalesce(canonical_url, '')
          and coalesce(schema_json #>> '{public_route_verification,release_token}', '') = coalesce(schema_json ->> 'release_token', '')
          and (
            coalesce(schema_json #>> '{public_route_verification,verifier}', '') = 'database-live-http-v1'
            or (
              coalesce(schema_json #>> '{public_route_verification,verifier}', '') = 'database-live-http-v2'
              and coalesce(schema_json #>> '{public_route_verification,verification_mode}', '') = 'two-phase-live-route'
              and coalesce(schema_json #>> '{public_route_verification,release_token_match}', 'false') = 'true'
              and coalesce(schema_json #>> '{public_route_verification,sitemap_http_status}', '') = '200'
            )
          )
        )
      )
    )
  );
