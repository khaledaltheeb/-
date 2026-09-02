create or replace function public.search_platform_v3_lexical(
  p_query text,
  p_limit integer default 30
)
returns table (
  entity_type text,
  entity_id uuid,
  slug text,
  title text,
  subtitle text,
  excerpt text,
  destination text,
  score double precision,
  retrieval_tier integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select *
  from internal_search_v2.search_lexical_v3_final(p_query,p_limit);
$$;

revoke all on function public.search_platform_v3_lexical(text,integer) from public,anon,authenticated;
grant execute on function public.search_platform_v3_lexical(text,integer) to service_role;
