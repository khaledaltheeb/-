create or replace function public.api_search_public_content_ids(
  p_query text,
  p_limit integer default 20,
  p_type text default null
)
returns table (
  content_id uuid,
  score double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  with input as (
    select
      trim(left(coalesce(p_query, ''), 160)) as q,
      greatest(1, least(coalesce(p_limit, 20), 100)) as lim,
      nullif(trim(coalesce(p_type, '')), '') as requested_type
  )
  select
    c.id as content_id,
    (
      coalesce(
        pg_catalog.ts_rank_cd(
          coalesce(c.search_vector, ''::pg_catalog.tsvector),
          pg_catalog.websearch_to_tsquery('pg_catalog.simple'::pg_catalog.regconfig, i.q)
        ),
        0
      )::double precision
      + case when lower(c.title) = lower(i.q) then 10.0 else 0.0 end
      + case when c.title ilike '%' || i.q || '%' then 3.0 else 0.0 end
      + case when coalesce(c.primary_keyword, '') ilike '%' || i.q || '%' then 1.5 else 0.0 end
      + case when coalesce(c.excerpt, '') ilike '%' || i.q || '%' then 0.5 else 0.0 end
    ) as score
  from public.content c
  cross join input i
  where i.q <> ''
    and c.status = 'published'::public.content_status
    and c.robots_index = true
    and c.published_at is not null
    and c.published_at <= now()
    and (i.requested_type is null or c.content_type = i.requested_type)
    and (
      coalesce(c.search_vector, ''::pg_catalog.tsvector) @@ pg_catalog.websearch_to_tsquery('pg_catalog.simple'::pg_catalog.regconfig, i.q)
      or c.title ilike '%' || i.q || '%'
      or coalesce(c.primary_keyword, '') ilike '%' || i.q || '%'
      or coalesce(c.excerpt, '') ilike '%' || i.q || '%'
    )
  order by score desc, c.updated_at desc, c.id
  limit (select lim from input);
$$;

revoke all on function public.api_search_public_content_ids(text, integer, text) from public;
grant execute on function public.api_search_public_content_ids(text, integer, text) to anon, authenticated;

comment on function public.api_search_public_content_ids(text, integer, text) is
  'Rawafid Public API v1.2 search candidate RPC. Returns public, indexable content IDs ranked server-side so PostgREST does not need to expose the tsvector expression directly.';
