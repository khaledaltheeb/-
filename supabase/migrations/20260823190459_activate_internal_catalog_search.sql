create or replace function public.search_platform(p_query text, p_limit integer default 30)
returns table (
  entity_type text,
  entity_id uuid,
  slug text,
  title text,
  subtitle text,
  excerpt text,
  destination text,
  score double precision
)
language sql
stable
security invoker
set search_path = ''
set enable_seqscan = off
as $$
  with input as (
    select
      public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160))) as nq,
      pg_catalog.regexp_replace(
        public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160))),
        '^(ذوو|ذوي|ذو)[[:space:]]+','','g'
      ) as nq_core,
      greatest(1,least(coalesce(p_limit,30),100)) as lim
  ),
  matched as (
    select s.entity_type,s.entity_id,s.slug,s.title,s.subtitle,s.excerpt,s.destination,
      case
        when s.entity_type='sector' and s.normalized_title=i.nq then 1300.0
        when s.entity_type='category' and s.normalized_title=i.nq then 1250.0
        when s.entity_type='content' and s.normalized_title=i.nq then 1200.0
        when s.entity_type='content' and s.normalized_title in (
          'اضطراب '||i.nq,'متلازمه '||i.nq,'مرض '||i.nq,'حاله '||i.nq
        ) then 1180.0
        when s.entity_type in ('sector','category') and i.nq_core<>'' and i.nq_core<>i.nq
          and s.normalized_title like '%'||i.nq_core||'%' then 1120.0
        when s.normalized_title like '%'||i.nq||'%' then 1050.0
        when s.normalized_terms like '%'||i.nq||'%' then 850.0
        else 600.0
      end::double precision as score
    from internal_search.catalog s cross join input i
    where i.nq<>'' and s.is_public=true
      and (s.published_at is null or s.published_at<=pg_catalog.now())
      and (
        s.normalized_title like '%'||i.nq||'%'
        or i.nq OPERATOR(extensions.<%) s.normalized_title
        or s.normalized_terms like '%'||i.nq||'%'
        or (
          s.entity_type in ('sector','category') and i.nq_core<>'' and i.nq_core<>i.nq
          and s.normalized_title like '%'||i.nq_core||'%'
        )
      )
  )
  select m.entity_type,m.entity_id,m.slug,m.title,m.subtitle,m.excerpt,m.destination,m.score
  from matched m cross join input i
  order by m.score desc,m.title asc
  limit (select lim from input);
$$;

revoke all on function public.search_platform(text,integer) from public;
grant execute on function public.search_platform(text,integer) to anon,authenticated,service_role;
