alter function public.search_platform(text, integer) rename to search_platform_base_20260823;

create function public.search_platform(p_query text, p_limit integer default 30)
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
  with input as (
    select
      pg_catalog.btrim(pg_catalog.left(coalesce(p_query, ''::text), 160)) as q,
      public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query, ''::text), 160))) as nq,
      pg_catalog.regexp_replace(
        public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query, ''::text), 160))),
        '^(ذوو|ذوي|ذو)[[:space:]]+',
        '',
        'g'
      ) as nq_core,
      greatest(1, least(coalesce(p_limit, 30), 100)) as lim
  ),
  base as (
    select
      r.entity_type,
      r.entity_id,
      r.slug,
      r.title,
      r.subtitle,
      r.excerpt,
      r.destination,
      r.score,
      public.normalize_arabic_search(r.title) as ntitle
    from input i
    cross join lateral public.search_platform_base_20260823(i.q, 100) r
  ),
  ranked as (
    select
      b.entity_type,
      b.entity_id,
      b.slug,
      b.title,
      b.subtitle,
      b.excerpt,
      b.destination,
      (
        b.score +
        case
          when b.entity_type in ('sector', 'category') and b.ntitle = i.nq then 700.0
          when b.entity_type in ('sector', 'category') and b.ntitle like '%' || i.nq || '%' then 500.0
          when b.entity_type in ('sector', 'category') and i.nq_core <> '' and i.nq_core <> i.nq and b.ntitle like '%' || i.nq_core || '%' then 500.0
          when b.entity_type in ('content', 'condition') and b.ntitle = i.nq then 600.0
          when b.entity_type in ('content', 'condition') and b.ntitle in (
            'اضطراب ' || i.nq,
            'متلازمه ' || i.nq,
            'مرض ' || i.nq,
            'حاله ' || i.nq
          ) then 450.0
          when b.entity_type in ('content', 'condition') and b.ntitle like '% ' || i.nq then 180.0
          when b.entity_type in ('content', 'condition') and b.ntitle like i.nq || ' %' then 160.0
          else 0.0
        end
      )::double precision as adjusted_score
    from base b
    cross join input i
  )
  select
    r.entity_type,
    r.entity_id,
    r.slug,
    r.title,
    r.subtitle,
    r.excerpt,
    r.destination,
    r.adjusted_score as score
  from ranked r
  cross join input i
  order by r.adjusted_score desc, r.title asc
  limit (select lim from input);
$$;

revoke all on function public.search_platform(text, integer) from public;
grant execute on function public.search_platform(text, integer) to anon, authenticated, service_role;

revoke all on function public.search_platform_base_20260823(text, integer) from public;
grant execute on function public.search_platform_base_20260823(text, integer) to anon, authenticated, service_role;
