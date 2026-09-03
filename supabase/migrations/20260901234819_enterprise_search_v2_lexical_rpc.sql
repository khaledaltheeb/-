create or replace function public.search_platform_v2_lexical(
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
with input as materialized (
  select
    pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160)) as q,
    public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160))) as nq,
    greatest(1,least(coalesce(p_limit,30),100)) as lim
),
raw_tokens as materialized (
  select distinct
    t.raw_token,
    public.normalize_arabic_search(t.raw_token) as nt
  from input i
  cross join lateral pg_catalog.regexp_split_to_table(
    pg_catalog.regexp_replace(i.q,'[[:space:]،,؛;:!?؟._/\\-]+',' ','g'),
    '[[:space:]]+'
  ) as t(raw_token)
  where pg_catalog.char_length(t.raw_token)>=2
),
core_tokens as materialized (
  select raw_token,nt
  from raw_tokens
  where nt<>''
    and nt not in (
      'كيف','هل','ما','ماذا','من','في','على','الى','عن','مع','عند','عنده','عندها',
      'لدي','لديه','لديها','انا','ان','هذا','هذه','ذلك','الذي','التي','هو','هي',
      'يكون','تكون','يمكن','اريد','ابحث','اود','لو','اذا','ثم','قد','او'
    )
),
query_parts as materialized (
  select
    coalesce(
      (select pg_catalog.string_agg(raw_token,' ' order by raw_token) from core_tokens),
      (select q from input)
    ) as all_query,
    coalesce(
      (select pg_catalog.string_agg(raw_token,' OR ' order by raw_token) from core_tokens),
      (select q from input)
    ) as any_query,
    greatest(1,(select count(*) from core_tokens))::double precision as token_count
),
exact_candidates as materialized (
  select p.*,1 as tier
  from internal_search_v2.pages p cross join input i
  where i.nq<>'' and p.is_public=true
    and (p.published_at is null or p.published_at<=pg_catalog.now())
    and (p.normalized_title=i.nq or p.normalized_title like '%'||i.nq||'%' or p.high_priority_terms like '%'||i.nq||'%')
  limit 240
),
all_candidates as materialized (
  select p.*,2 as tier
  from internal_search_v2.pages p cross join input i cross join query_parts qp
  where i.nq<>'' and p.is_public=true
    and (p.published_at is null or p.published_at<=pg_catalog.now())
    and qp.all_query<>''
    and p.search_text OPERATOR(extensions.&@~) qp.all_query
  limit 500
),
any_candidates as materialized (
  select p.*,3 as tier
  from internal_search_v2.pages p cross join input i cross join query_parts qp
  where i.nq<>'' and p.is_public=true
    and (p.published_at is null or p.published_at<=pg_catalog.now())
    and qp.any_query<>''
    and p.search_text OPERATOR(extensions.&@~) qp.any_query
  limit 900
),
fuzzy_candidates as materialized (
  select p.*,4 as tier
  from internal_search_v2.pages p cross join input i
  where i.nq<>'' and p.is_public=true
    and (p.published_at is null or p.published_at<=pg_catalog.now())
    and (
      extensions.word_similarity(i.nq,p.normalized_title)>0.24
      or extensions.word_similarity(i.nq,p.high_priority_terms)>0.18
    )
  order by greatest(
    extensions.word_similarity(i.nq,p.normalized_title),
    extensions.word_similarity(i.nq,p.high_priority_terms)
  ) desc
  limit 300
),
unioned as materialized (
  select * from exact_candidates
  union all select * from all_candidates
  union all select * from any_candidates
  union all select * from fuzzy_candidates
),
deduped as materialized (
  select distinct on (entity_type,entity_id) u.*
  from unioned u
  order by entity_type,entity_id,tier
),
scored as (
  select
    d.entity_type,d.entity_id,d.slug,d.title,d.subtitle,d.excerpt,d.destination,d.tier,
    (
      case
        when d.normalized_title=i.nq and d.entity_type='sector' then 2200.0
        when d.normalized_title=i.nq and d.entity_type='category' then 2175.0
        when d.normalized_title=i.nq then 2150.0
        when d.normalized_title like '%'||i.nq||'%' then 1500.0
        when d.high_priority_terms like '%'||i.nq||'%' then 1250.0
        else 0.0
      end
      + case d.tier when 1 then 320.0 when 2 then 260.0 when 3 then 120.0 else 40.0 end
      + least(650.0,
          650.0 * coalesce((
            select count(*)::double precision
            from core_tokens ct
            where d.normalized_title like '%'||ct.nt||'%'
          ),0.0) / qp.token_count
        )
      + least(420.0,
          420.0 * coalesce((
            select count(*)::double precision
            from core_tokens ct
            where d.high_priority_terms like '%'||ct.nt||'%'
          ),0.0) / qp.token_count
        )
      + greatest(
          extensions.word_similarity(i.nq,d.normalized_title)::double precision*260.0,
          extensions.word_similarity(i.nq,d.high_priority_terms)::double precision*180.0
        )
      + case d.entity_type when 'sector' then 35.0 when 'category' then 25.0 else 0.0 end
    )::double precision as score
  from deduped d cross join input i cross join query_parts qp
)
select
  s.entity_type,s.entity_id,s.slug,s.title,s.subtitle,s.excerpt,s.destination,s.score,s.tier
from scored s
order by s.score desc,s.title asc
limit (select lim from input);
$$;

revoke all on function public.search_platform_v2_lexical(text,integer) from public;
grant execute on function public.search_platform_v2_lexical(text,integer) to anon,authenticated,service_role;
