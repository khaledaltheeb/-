create index if not exists internal_search_catalog_normalized_title_btree_idx
  on internal_search.catalog (normalized_title);

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
as $$
  with input as materialized (
    select
      public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160))) as nq,
      pg_catalog.regexp_replace(
        public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160))),
        '^(ذوو|ذوي|ذو)[[:space:]]+','','g'
      ) as nq_core,
      greatest(1,least(coalesce(p_limit,30),100)) as lim,
      least(greatest(greatest(1,least(coalesce(p_limit,30),100)),20)*4,160) as fetch_count
  ),
  exact_hits as materialized (
    select s.entity_type,s.entity_id,s.slug,s.title,s.subtitle,s.excerpt,s.destination,s.normalized_title,s.normalized_terms
    from internal_search.catalog s cross join input i
    where i.nq<>'' and s.is_public=true
      and (s.published_at is null or s.published_at<=pg_catalog.now())
      and s.normalized_title=i.nq
    limit (select fetch_count from input)
  ),
  title_hits as materialized (
    select s.entity_type,s.entity_id,s.slug,s.title,s.subtitle,s.excerpt,s.destination,s.normalized_title,s.normalized_terms
    from internal_search.catalog s cross join input i
    where i.nq<>'' and s.is_public=true
      and (s.published_at is null or s.published_at<=pg_catalog.now())
      and s.normalized_title like '%'||i.nq||'%'
      and not exists (
        select 1 from exact_hits e
        where e.entity_type=s.entity_type and e.entity_id=s.entity_id
      )
    limit (select fetch_count from input)
  ),
  term_hits as materialized (
    select s.entity_type,s.entity_id,s.slug,s.title,s.subtitle,s.excerpt,s.destination,s.normalized_title,s.normalized_terms
    from internal_search.catalog s cross join input i
    where i.nq<>'' and s.is_public=true
      and (s.published_at is null or s.published_at<=pg_catalog.now())
      and s.normalized_terms like '%'||i.nq||'%'
    limit (select fetch_count from input)
  ),
  core_hits as materialized (
    select s.entity_type,s.entity_id,s.slug,s.title,s.subtitle,s.excerpt,s.destination,s.normalized_title,s.normalized_terms
    from internal_search.catalog s cross join input i
    where i.nq_core<>'' and i.nq_core<>i.nq
      and s.is_public=true
      and s.entity_type in ('sector','category')
      and (s.published_at is null or s.published_at<=pg_catalog.now())
      and s.normalized_title like '%'||i.nq_core||'%'
    limit (select fetch_count from input)
  ),
  primary_hits as materialized (
    select * from exact_hits
    union all select * from title_hits
    union all select * from term_hits
    union all select * from core_hits
  ),
  fuzzy_hits as materialized (
    select s.entity_type,s.entity_id,s.slug,s.title,s.subtitle,s.excerpt,s.destination,s.normalized_title,s.normalized_terms
    from internal_search.catalog s cross join input i
    where i.nq<>'' and s.is_public=true
      and (s.published_at is null or s.published_at<=pg_catalog.now())
      and not exists (select 1 from primary_hits)
      and s.normalized_title OPERATOR(extensions.%>) i.nq
    order by extensions.word_similarity(i.nq,s.normalized_title) desc
    limit (select fetch_count from input)
  ),
  candidates as (
    select * from primary_hits
    union all
    select * from fuzzy_hits
  ),
  scored as (
    select c.entity_type,c.entity_id,c.slug,c.title,c.subtitle,c.excerpt,c.destination,
      case
        when c.entity_type='sector' and c.normalized_title=i.nq then 1300.0
        when c.entity_type='category' and c.normalized_title=i.nq then 1250.0
        when c.entity_type='content' and c.normalized_title=i.nq then 1200.0
        when c.entity_type='content' and c.normalized_title in (
          'اضطراب '||i.nq,'متلازمه '||i.nq,'مرض '||i.nq,'حاله '||i.nq
        ) then 1180.0
        when c.entity_type in ('sector','category') and i.nq_core<>'' and i.nq_core<>i.nq
          and c.normalized_title like '%'||i.nq_core||'%' then 1120.0
        when c.normalized_title like '%'||i.nq||'%' then 1050.0
        when c.normalized_terms like '%'||i.nq||'%' then 850.0
        else 600.0
      end::double precision as score,
      pg_catalog.row_number() over (
        partition by c.entity_type,c.entity_id,c.destination
        order by
          case
            when c.normalized_title=i.nq then 1
            when c.normalized_title like '%'||i.nq||'%' then 2
            when c.normalized_terms like '%'||i.nq||'%' then 3
            else 4
          end
      ) as dedupe_rank
    from candidates c cross join input i
  )
  select s.entity_type,s.entity_id,s.slug,s.title,s.subtitle,s.excerpt,s.destination,s.score
  from scored s
  where s.dedupe_rank=1
  order by s.score desc,s.title asc
  limit (select lim from input);
$$;

revoke all on function public.search_platform(text,integer) from public;
grant execute on function public.search_platform(text,integer) to anon,authenticated,service_role;

analyze internal_search.catalog;
