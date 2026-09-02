create or replace function internal_search_v2.search_lexical_v4_fast3(
  p_query text,
  p_limit integer default 30
)
returns table (
  entity_type text, entity_id uuid, slug text, title text, subtitle text, excerpt text,
  destination text, score double precision, retrieval_tier integer
)
language sql stable security definer set search_path=''
as $$
with input as materialized (
  select pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160)) q,
         public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160))) nq,
         greatest(1,least(coalesce(p_limit,30),100)) lim
), raw_tokens as materialized (
  select distinct t.raw_token,
    public.normalize_arabic_search(t.raw_token) raw_nt,
    internal_search_v2.normalize_query_token_v3(t.raw_token) nt
  from input i cross join lateral pg_catalog.regexp_split_to_table(
    pg_catalog.regexp_replace(i.q,'[[:space:]،,؛;:!?؟._/\\\\-]+',' ','g'),'[[:space:]]+'
  ) t(raw_token)
  where pg_catalog.char_length(t.raw_token)>=2
), core_tokens as materialized (
  select * from raw_tokens where nt<>'' and nt not in (
    'كيف','هل','ما','ماذا','من','في','علي','الى','عن','مع','عند','عنده','عندها','لدي','لديه','لديها','انا','ان','هذا','هذه','ذلك','الذي','التي','هو','هي','يكون','تكون','يمكن','اريد','ابحث','اود','لو','اذا','ثم','قد','او','بعد','قبل','اعرف','يعني','تعني','متي','لماذا','مصاب','مصابه','ابني','ابنتي','طفلي','طفلتي','ولدي','بنتي','اساعد','ساعد','مساعده','افعل','اتعامل','التعامل','لا'
  )
), latin_tokens as materialized (
  select pg_catalog.lower(raw_token) token from raw_tokens where raw_token ~ '[A-Za-z0-9]' and pg_catalog.char_length(raw_token)>=2
), f as materialized (
  select
    exists(select 1 from raw_tokens where raw_nt in ('ابني','ابنتي','طفلي','طفلتي','ولدي','بنتي')) parent_context,
    exists(select 1 from raw_tokens where raw_nt in ('اساعد','ساعد','مساعده','افعل','اتعامل','التعامل','دعم')) support_intent,
    exists(select 1 from raw_tokens where raw_nt in ('اعرف','علامات','اعراض','مصاب','مصابه','تشخيص','تقييم','متي')) assessment_intent,
    exists(select 1 from raw_tokens where raw_nt in ('يتكلم','يتحدث','ينطق','كلام','الكلام','نطق','النطق','تواصل','التواصل')) speech_intent,
    (exists(select 1 from raw_tokens where raw_nt='لا') and exists(select 1 from raw_tokens where raw_nt in ('يتكلم','يتحدث','ينطق'))) not_speaking_intent,
    (exists(select 1 from raw_tokens where raw_nt in ('اعرف','علامات','اعراض','مصاب','مصابه')) and exists(select 1 from raw_tokens where raw_nt in ('ابني','ابنتي','طفلي','طفلتي','ولدي','بنتي'))) child_recognition_intent
), qp as materialized (
  select coalesce((select pg_catalog.string_agg(nt,' ' order by nt) from core_tokens),(select nq from input)) all_query,
         coalesce((select pg_catalog.string_agg(nt,' OR ' order by nt) from core_tokens),(select nq from input)) any_query,
         coalesce((select pg_catalog.string_agg(nt,' ' order by nt) from core_tokens),(select nq from input)) anchor_query,
         greatest(1,(select count(*) from core_tokens))::double precision token_count
), exact_ids as materialized (
  select p.entity_type,p.entity_id,1 tier,0::bigint body_rank
  from internal_search_v2.pages p cross join input i
  where p.is_public=true and (p.published_at is null or p.published_at<=pg_catalog.now())
    and (p.normalized_title=i.nq or p.normalized_title like '%'||i.nq||'%' or p.high_priority_terms like '%'||i.nq||'%')
  limit 160
), token_ids as materialized (
  select distinct x.entity_type,x.entity_id,1 tier,0::bigint body_rank
  from core_tokens ct
  cross join lateral (
    select p.entity_type,p.entity_id
    from internal_search_v2.pages p
    where p.is_public=true and (p.published_at is null or p.published_at<=pg_catalog.now())
      and (p.normalized_title like '%'||ct.nt||'%' or p.high_priority_terms like '%'||ct.nt||'%')
    order by case when p.normalized_title like '%'||ct.nt||'%' then 0 else 1 end,p.entity_id
    limit 140
  ) x
), title_fuzzy_ids as materialized (
  select p.entity_type,p.entity_id,4 tier,0::bigint body_rank
  from internal_search_v2.pages p cross join qp
  where p.is_public=true and (p.published_at is null or p.published_at<=pg_catalog.now())
    and p.normalized_title OPERATOR(extensions.%) qp.anchor_query
  order by extensions.similarity(p.normalized_title,qp.anchor_query) desc
  limit 120
), body_all as materialized (
  select c.entity_type,c.entity_id,2 tier,pg_catalog.row_number() over(order by c.id) body_rank
  from internal_search_v2.chunks c cross join qp
  where qp.all_query<>'' and c.is_public=true and (c.published_at is null or c.published_at<=pg_catalog.now())
    and c.content_text OPERATOR(extensions.&@~) qp.all_query
  limit 220
), body_any as materialized (
  select c.entity_type,c.entity_id,3 tier,pg_catalog.row_number() over(order by c.id) body_rank
  from internal_search_v2.chunks c cross join qp
  where qp.token_count>1 and qp.any_query<>'' and c.is_public=true and (c.published_at is null or c.published_at<=pg_catalog.now())
    and c.content_text OPERATOR(extensions.&@~) qp.any_query
  limit 280
), ids as materialized (
  select * from exact_ids union all select * from token_ids union all select * from title_fuzzy_ids union all select * from body_all union all select * from body_any
), dids as materialized (
  select entity_type,entity_id,min(tier) tier,min(body_rank) filter(where body_rank>0) body_rank
  from ids group by entity_type,entity_id
), s as materialized (
  select p.*,d.tier,d.body_rank,
    coalesce((select count(*)::double precision from core_tokens ct where p.normalized_title like '%'||ct.nt||'%'),0.0) title_anchor_hits,
    coalesce((select count(*)::double precision from core_tokens ct where p.high_priority_terms like '%'||ct.nt||'%'),0.0) terms_anchor_hits,
    (p.normalized_title like '%طفل%' or p.normalized_title like '%اسره%' or p.normalized_title like '%والد%' or p.normalized_title like '%دعم%' or p.normalized_title like '%مساعد%' or p.high_priority_terms like '%طفل%' or p.high_priority_terms like '%الاسره%' or p.high_priority_terms like '%الوالد%' or p.high_priority_terms like '%دعم%' or p.high_priority_terms like '%مساعد%') parent_support_match,
    (p.normalized_title like '%كيف%طفل%' or p.normalized_title like '%طفل%كيف%' or p.normalized_title like '%المنزل%' or p.normalized_title like '%المنزلي%' or p.normalized_title like '%دليل الاسره%' or p.normalized_title like '%للاسره%' or p.normalized_title like '%الوالدين%') parent_action_title,
    (p.normalized_title like '%علامات%' or p.normalized_title like '%اعراض%' or p.normalized_title like '%تشخيص%' or p.normalized_title like '%تقييم%' or p.high_priority_terms like '%علامات%' or p.high_priority_terms like '%اعراض%' or p.high_priority_terms like '%تشخيص%' or p.high_priority_terms like '%تقييم%') assessment_match,
    (p.normalized_title like '%علامات%' or p.normalized_title like '%اعراض%' or p.normalized_title like '%تشخيص%' or p.normalized_title like '%تقييم%') assessment_title,
    (p.normalized_title like '%يتكلم%' or p.normalized_title like '%كلام%' or p.normalized_title like '%نطق%' or p.normalized_title like '%تواصل%') speech_title,
    (p.high_priority_terms like '%يتكلم%' or p.high_priority_terms like '%كلام%' or p.high_priority_terms like '%نطق%' or p.high_priority_terms like '%تواصل%') speech_terms,
    (p.normalized_title like '%لا يتكلم%' or p.normalized_title like '%لا يتحدث%' or p.normalized_title like '%لا ينطق%' or p.high_priority_terms like '%لا يتكلم%' or p.high_priority_terms like '%لا يتحدث%' or p.high_priority_terms like '%لا ينطق%') not_speaking_match,
    exists(select 1 from latin_tokens lt where pg_catalog.lower(coalesce(p.search_text,'')) not like '%'||lt.token||'%') misses_latin_entity
  from dids d join internal_search_v2.pages p using(entity_type,entity_id)
), scored as (
  select s.*,
    (case when s.normalized_title=i.nq and s.entity_type='sector' then 2200.0 when s.normalized_title=i.nq and s.entity_type='category' then 2175.0 when s.normalized_title=i.nq then 2150.0 when s.normalized_title like '%'||i.nq||'%' then 1500.0 when s.high_priority_terms like '%'||i.nq||'%' then 1250.0 else 0.0 end
    +case s.tier when 1 then 320.0 when 2 then 250.0 when 3 then 110.0 else 40.0 end
    +least(850.0,850.0*s.title_anchor_hits/qp.token_count)+least(360.0,360.0*s.terms_anchor_hits/qp.token_count)
    +case when qp.token_count>0 and greatest(s.title_anchor_hits,s.terms_anchor_hits)=0 then -500.0 when qp.token_count>=2 and s.title_anchor_hits/qp.token_count>=0.75 then 420.0 when qp.token_count>=2 and s.title_anchor_hits/qp.token_count>=0.50 then 180.0 when s.terms_anchor_hits>=qp.token_count then 60.0 else 0.0 end
    +case when f.parent_context and f.support_intent and s.parent_action_title then 900.0 when f.parent_context and f.support_intent and s.parent_support_match then 150.0 else 0.0 end
    +case when f.parent_context and f.assessment_intent and s.assessment_title then 850.0 when f.parent_context and f.assessment_intent and s.assessment_match then 180.0 else 0.0 end
    +case when f.not_speaking_intent and s.not_speaking_match then 800.0 when f.speech_intent and s.speech_title then 420.0 when f.speech_intent and s.speech_terms then 140.0 else 0.0 end
    +case when f.child_recognition_intent and s.normalized_title like 'علامات %' then 720.0 when f.child_recognition_intent and s.normalized_title like 'اعراض %' then 620.0 when f.child_recognition_intent and s.normalized_title like '%علامات%' then 260.0 else 0.0 end
    +greatest(extensions.word_similarity(i.nq,s.normalized_title)::double precision*450.0,extensions.word_similarity(i.nq,s.high_priority_terms)::double precision*160.0)
    +greatest(extensions.word_similarity(qp.anchor_query,s.normalized_title)::double precision*220.0,extensions.word_similarity(qp.anchor_query,s.high_priority_terms)::double precision*80.0)
    +case when f.parent_context and f.support_intent and s.destination like '/family-guide/%' then 180.0 when f.parent_context and f.support_intent and s.destination like '/care-guides/%' then 90.0 else 0.0 end
    +case when f.child_recognition_intent and s.destination like '%self-diagnosis%' then -350.0 else 0.0 end
    +case when s.misses_latin_entity then -1200.0 else 0.0 end
    +case when s.body_rank is not null then greatest(0.0,80.0-(s.body_rank::double precision/8.0)) else 0.0 end
    +case s.entity_type when 'sector' then 35.0 when 'category' then 25.0 else 0.0 end)::double precision final_score
  from s cross join input i cross join qp cross join f
)
select entity_type,entity_id,slug,title,subtitle,excerpt,destination,final_score,tier
from scored order by final_score desc,title asc limit (select lim from input);
$$;

revoke all on function internal_search_v2.search_lexical_v4_fast3(text,integer) from public,anon,authenticated;

after_grants:

create or replace function public.search_platform_v3_lexical(
  p_query text,
  p_limit integer default 30
)
returns table (
  entity_type text, entity_id uuid, slug text, title text, subtitle text, excerpt text,
  destination text, score double precision, retrieval_tier integer
)
language sql stable security definer set search_path=''
as $$
  select * from internal_search_v2.search_lexical_v4_fast3(p_query,p_limit);
$$;

revoke all on function public.search_platform_v3_lexical(text,integer) from public,anon,authenticated;
grant execute on function public.search_platform_v3_lexical(text,integer) to service_role;
