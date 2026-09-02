create or replace function internal_search_v2.search_v4_evidence_extract(
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
with input as materialized (
  select pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160)) q,
         public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160))) nq,
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
), qp as materialized (
  select coalesce((select pg_catalog.string_agg(raw_token,' ' order by raw_token) from core),(select q from input)) all_q,
         coalesce((select pg_catalog.string_agg(raw_token,' OR ' order by raw_token) from core),(select q from input)) any_q,
         greatest(1,(select count(*) from core))::double precision token_count
), candidates as materialized (
  select c.id,c.entity_type,c.entity_id,c.heading,c.content_text,
         pg_catalog.row_number() over(order by c.id)::integer body_rank
  from internal_search_v2.chunks c cross join qp
  where c.is_public=true
    and (c.published_at is null or c.published_at<=pg_catalog.now())
    and qp.all_q<>''
    and c.content_text OPERATOR(extensions.&@~) qp.all_q
  limit 160
), fallback as materialized (
  select c.id,c.entity_type,c.entity_id,c.heading,c.content_text,
         (1000 + pg_catalog.row_number() over(order by c.id))::integer body_rank
  from internal_search_v2.chunks c cross join qp
  where c.is_public=true
    and (c.published_at is null or c.published_at<=pg_catalog.now())
    and qp.token_count>1
    and qp.any_q<>''
    and c.content_text OPERATOR(extensions.&@~) qp.any_q
  limit 220
), combined as materialized (
  select * from candidates
  union all
  select * from fallback
), dedup as materialized (
  select distinct on (entity_type,entity_id,id) *
  from combined
  order by entity_type,entity_id,id,body_rank
), scored as materialized (
  select d.*,
         coalesce((select count(*)::double precision from core ct where public.normalize_arabic_search(d.content_text) like '%'||ct.nt||'%'),0.0) hits
  from dedup d
), ranked as materialized (
  select s.*,p.destination,p.title,
         pg_catalog.row_number() over(
           partition by s.entity_type,s.entity_id
           order by (s.hits/(select token_count from qp)) desc,s.body_rank asc,s.id asc
         ) as within_page
  from scored s
  join internal_search_v2.pages p using(entity_type,entity_id)
)
select entity_type,entity_id,destination,title,coalesce(heading,''),
       pg_catalog.left(pg_catalog.regexp_replace(content_text,'[[:space:]]+',' ','g'),900),
       pg_catalog.row_number() over(order by hits desc,body_rank asc)::integer
from ranked
where within_page=1
order by hits desc,body_rank asc
limit (select lim from input);
$$;

revoke all on function internal_search_v2.search_v4_evidence_extract(text,integer) from public, anon, authenticated;
grant execute on function internal_search_v2.search_v4_evidence_extract(text,integer) to service_role;
