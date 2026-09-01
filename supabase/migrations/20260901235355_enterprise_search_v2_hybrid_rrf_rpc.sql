create or replace function public.search_platform_v2_hybrid(
  p_query text,
  p_query_embedding extensions.vector(512),
  p_limit integer default 30,
  p_lexical_weight double precision default 1.15,
  p_semantic_weight double precision default 1.0,
  p_rrf_k integer default 50
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
  lexical_rank bigint,
  semantic_rank bigint,
  matched_heading text,
  matched_chunk text
)
language sql
stable
security definer
set search_path = ''
as $$
with cfg as materialized (
  select
    greatest(1,least(coalesce(p_limit,30),100)) as lim,
    greatest(10,least(greatest(1,least(coalesce(p_limit,30),100))*4,100)) as candidates,
    greatest(1,least(coalesce(p_rrf_k,50),200))::double precision as rrf_k
),
lexical as materialized (
  select
    l.*,
    pg_catalog.row_number() over (order by l.score desc,l.title asc) as rank_ix
  from public.search_platform_v2_lexical(
    p_query,
    (select candidates from cfg)
  ) l
),
semantic_chunks as materialized (
  select
    c.entity_type,c.entity_id,c.slug,c.title,c.destination,c.heading,c.content_text,
    pg_catalog.row_number() over (
      order by c.embedding OPERATOR(extensions.<=>) p_query_embedding
    ) as rank_ix,
    (1.0-(c.embedding OPERATOR(extensions.<=>) p_query_embedding))::double precision as similarity
  from internal_search_v2.chunks c cross join cfg
  where p_query_embedding is not null
    and c.embedding is not null
    and c.is_public=true
    and (c.published_at is null or c.published_at<=pg_catalog.now())
  order by c.embedding OPERATOR(extensions.<=>) p_query_embedding
  limit (select candidates from cfg)
),
semantic_pages as materialized (
  select distinct on (sc.entity_type,sc.entity_id)
    sc.entity_type,sc.entity_id,sc.slug,sc.title,sc.destination,
    sc.rank_ix,sc.similarity,sc.heading,sc.content_text
  from semantic_chunks sc
  order by sc.entity_type,sc.entity_id,sc.rank_ix
),
fused as materialized (
  select
    coalesce(l.entity_type,s.entity_type) as entity_type,
    coalesce(l.entity_id,s.entity_id) as entity_id,
    l.rank_ix as lexical_rank,
    s.rank_ix as semantic_rank,
    l.score as lexical_score,
    s.similarity as semantic_similarity,
    s.heading as matched_heading,
    s.content_text as matched_chunk
  from lexical l
  full outer join semantic_pages s
    on l.entity_type=s.entity_type and l.entity_id=s.entity_id
),
ranked as (
  select
    f.*,
    (
      coalesce(p_lexical_weight/nullif(cfg.rrf_k+f.lexical_rank,0),0.0)
      + coalesce(p_semantic_weight/nullif(cfg.rrf_k+f.semantic_rank,0),0.0)
      + coalesce(least(f.lexical_score,4000.0)/40000000.0,0.0)
    )::double precision as hybrid_score
  from fused f cross join cfg
)
select
  p.entity_type,p.entity_id,p.slug,p.title,p.subtitle,p.excerpt,p.destination,
  r.hybrid_score as score,r.lexical_rank,r.semantic_rank,r.matched_heading,r.matched_chunk
from ranked r
join internal_search_v2.pages p
  on p.entity_type=r.entity_type and p.entity_id=r.entity_id
where p.is_public=true
  and (p.published_at is null or p.published_at<=pg_catalog.now())
order by r.hybrid_score desc,p.title asc
limit (select lim from cfg);
$$;

revoke all on function public.search_platform_v2_hybrid(text,extensions.vector,integer,double precision,double precision,integer) from public;
grant execute on function public.search_platform_v2_hybrid(text,extensions.vector,integer,double precision,double precision,integer) to anon,authenticated,service_role;
