create or replace function public.search_platform_v4_evidence(
  p_query text,
  p_limit integer default 6
)
returns table(
  entity_type text,
  entity_id uuid,
  destination text,
  title text,
  heading text,
  evidence_text text,
  evidence_rank integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select * from internal_search_v2.search_v4_evidence_extract(p_query,p_limit);
$$;

create or replace function public.search_platform_v4_evidence_for_pages(
  p_query text,
  p_entity_ids uuid[],
  p_limit integer default 6
)
returns table(
  entity_id uuid,
  destination text,
  title text,
  heading text,
  evidence_text text,
  evidence_score double precision
)
language sql
stable
security definer
set search_path = ''
as $$
with input as materialized (
  select pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160)) q,
         greatest(1,least(coalesce(p_limit,6),12)) lim
), raw_tokens as materialized (
  select distinct pg_catalog.btrim(t.raw_token) raw_token,
         public.normalize_arabic_search(t.raw_token) nt
  from input i
  cross join lateral pg_catalog.regexp_split_to_table(
    pg_catalog.regexp_replace(i.q,'[[:space:]،,؛;:!?؟._/\\-]+',' ','g'),'[[:space:]]+'
  ) t(raw_token)
  where pg_catalog.char_length(t.raw_token)>=2
), core as materialized (
  select raw_token,nt from raw_tokens where nt<>'' and nt not in (
    'كيف','هل','ما','ماذا','من','في','علي','الى','عن','مع','عند','لدي','هذا','هذه','ذلك','هو','هي','او','بعد','قبل','اعرف','مصاب','مصابه','ابني','ابنتي','طفلي','طفلتي','ولدي','بنتي','اساعد','ساعد','مساعده','افعل','اتعامل','التعامل','لا'
  )
), ranked as materialized (
  select c.entity_id,p.destination,p.title,c.heading,c.content_text,
         coalesce((select count(*)::double precision from core ct where public.normalize_arabic_search(c.content_text) like '%'||ct.nt||'%'),0.0) hits,
         greatest(
           extensions.word_similarity(public.normalize_arabic_search((select q from input)),public.normalize_arabic_search(c.content_text))::double precision,
           extensions.word_similarity(public.normalize_arabic_search((select q from input)),public.normalize_arabic_search(coalesce(c.heading,'')))::double precision
         ) similarity_score,
         pg_catalog.row_number() over(partition by c.entity_id order by c.chunk_index asc,c.id asc) chunk_pos
  from internal_search_v2.chunks c
  join internal_search_v2.pages p using(entity_type,entity_id)
  where c.is_public=true
    and c.entity_id=any(coalesce(p_entity_ids,array[]::uuid[]))
    and (c.published_at is null or c.published_at<=pg_catalog.now())
), scored as materialized (
  select *, (hits*100.0 + similarity_score*35.0 + greatest(0.0,12.0-chunk_pos::double precision))::double precision score
  from ranked
  where hits>0 or similarity_score>0.06
), one_per_page as materialized (
  select distinct on (entity_id) entity_id,destination,title,heading,content_text,score
  from scored
  order by entity_id,score desc
)
select entity_id,destination,title,coalesce(heading,''),
       pg_catalog.left(pg_catalog.regexp_replace(content_text,'[[:space:]]+',' ','g'),1000),score
from one_per_page
order by score desc
limit (select lim from input);
$$;

revoke all on function public.search_platform_v4_evidence(text,integer) from public, anon, authenticated;
revoke all on function public.search_platform_v4_evidence_for_pages(text,uuid[],integer) from public, anon, authenticated;
grant execute on function public.search_platform_v4_evidence(text,integer) to service_role;
grant execute on function public.search_platform_v4_evidence_for_pages(text,uuid[],integer) to service_role;
