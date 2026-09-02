-- Remove temporary Workers host references from operational verification metadata.
-- Do not rewrite them to healthrenewal.org: production verification has not happened yet.
-- Instead mark the historical verification stale so the route must be revalidated after cutover.

update public.content
set schema_json = jsonb_set(
      schema_json #- '{public_route_verification,public_origin}',
      '{public_route_verification_stale}',
      'true'::jsonb,
      true
    )
where schema_json->'public_route_verification'->>'public_origin' = 'https://rawafid-platform-staging.khaledaltheeb.workers.dev';

update public.content
set schema_json = jsonb_set(
      (schema_json #- '{live_qa,staging_url}') #- '{live_qa,url}',
      '{live_qa,cutover_revalidation_required}',
      'true'::jsonb,
      true
    )
where coalesce(schema_json->'live_qa'->>'staging_url','') like 'https://rawafid-platform-staging.khaledaltheeb.workers.dev%'
   or coalesce(schema_json->'live_qa'->>'url','') like 'https://rawafid-platform-staging.khaledaltheeb.workers.dev%';
