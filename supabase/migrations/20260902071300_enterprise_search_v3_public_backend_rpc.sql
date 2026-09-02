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
with input as materialized (
  select
    pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160)) as q,
    public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query,''),160))) as nq,
    greatest(1,least(coalesce(p_limit,30),100)) as lim
),
raw_tokens as materialized (
  select distinct
    t.raw_token,
    public.normalize_arabic_search(t.raw_token) as raw_nt,
    internal_search_v2.normalize_query_token_v3(t.raw_token) as nt
  from input i
  cross join lateral pg_catalog.regexp_split_to_table(
    pg_catalog.regexp_replace(i.q,'[[:space:]،,؛;:!?؟._/\\\\-]+',' ','g'),
    '[[:space:]]+'
  ) as t(raw_token)
  where pg_catalog.char_length(t.raw_token)>=2
),
core_tokens as materialized (
  select raw_token,raw_nt,nt
  from raw_tokens
  where nt<>''
    and nt not in (
      'كيف','هل','ما','ماذا','من','في','علي','الى','عن','مع','عند','عنده','عندها',
      'لدي','لديه','لديها','انا','ان','هذا','هذه','ذلك','الذي','التي','هو','هي',
      'يكون','تكون','يمكن','اريد','ابحث','اود','لو','اذا','ثم','قد','او','بعد','قبل',
      'اعرف','يعني','تعني','متي','لماذا','مصاب','مصابه','ابني','ابنتي','طفلي','طفلتي',
      'ولدي','بنتي','اساعد','ساعد','مساعده','افعل','اتعامل','التعامل','لا'
    )
),
latin_tokens as materialized (
  select pg_catalog.lower(rt.raw_token) as token
  from raw_tokens rt
  where rt.raw_token ~ '[A-Za-z0-9]'
    and pg_catalog.char_length(rt.raw_token)>=2
),
query_features as materialized (
  select
    exists(select 1 from raw_tokens where raw_nt in ('ابني','ابنتي','طفلي','طفلتي','ولدي','بنتي')) as parent_context,
    exists(select 1 from raw_tokens where raw_nt in ('اساعد','ساعد','مساعده','افعل','اتعامل','التعامل','دعم')) as support_intent,
    exists(select 1 from raw_tokens where raw_nt in ('اعرف','علامات','اعراض','مصاب','مصابه','تشخيص','تقييم','متي')) as assessment_intent,
    exists(select 1 from raw_tokens where raw_nt in ('يتكلم','يتحدث','ينطق','كلام','الكلام','نطق','النطق','تواصل','التواصل')) as speech_intent,
    (exists(select 1 from raw_tokens where raw_nt='لا') and exists(select 1 from raw_tokens where raw_nt in ('يتكلم','يتحدث','ينطق'))) as not_speaking_intent,
    (exists(select 1 from raw_tokens where raw_nt in ('اعرف','علامات','اعراض','مصاب','مصابه')) and exists(select 1 from raw_tokens where raw_nt in ('ابني','ابنتي','طفلي','طفلتي','ولدي','بنتي'))) as child_recognition_intent
),
query_parts as materialized (
  select
    coalesce((select pg_catalog.string_agg(nt,' ' order by nt) from core_tokens),(select nq from input)) as all_query,
    coalesce((select pg_catalog.string_agg(nt,' OR ' order by nt) from core_tokens),(select nq from input)) as any_query,
    coalesce((select pg_catalog.string_agg(nt,' ' order by nt) from core_tokens),(select nq from input)) as anchor_query,
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
  from internal_search_v2.pages p cross join input i cross join query_parts qp
  where i.nq<>'' and p.is_public=true
    and (p.published_at is null or p.published_at<=pg_catalog.now())
    and qp.anchor_query<>''
    and (
      extensions.word_similarity(qp.anchor_query,p.normalized_title)>0.24
      or extensions.word_similarity(qp.anchor_query,p.high_priority_terms)>0.18
    )
  order by greatest(
    extensions.word_similarity(qp.anchor_query,p.normalized_title),
    extensions.word_similarity(qp.anchor_query,p.high_priority_terms)
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
signals as materialized (
  select
    d.*,
    coalesce((select count(*)::double precision from core_tokens ct where d.normalized_title like '%'||ct.nt||'%'),0.0) as title_anchor_hits,
    coalesce((select count(*)::double precision from core_tokens ct where d.high_priority_terms like '%'||ct.nt||'%'),0.0) as terms_anchor_hits,
    (
      d.normalized_title like '%طفل%' or d.normalized_title like '%اسره%' or d.normalized_title like '%والد%'
      or d.normalized_title like '%دعم%' or d.normalized_title like '%مساعد%'
      or d.high_priority_terms like '%طفل%' or d.high_priority_terms like '%الاسره%'
      or d.high_priority_terms like '%الوالد%' or d.high_priority_terms like '%دعم%'
      or d.high_priority_terms like '%مساعد%'
    ) as parent_support_match,
    (
      d.normalized_title like '%كيف%طفل%' or d.normalized_title like '%طفل%كيف%'
      or d.normalized_title like '%المنزل%' or d.normalized_title like '%المنزلي%'
      or d.normalized_title like '%دليل الاسره%' or d.normalized_title like '%للاسره%'
      or d.normalized_title like '%الوالدين%'
    ) as parent_action_title,
    (
      d.normalized_title like '%علامات%' or d.normalized_title like '%اعراض%'
      or d.normalized_title like '%تشخيص%' or d.normalized_title like '%تقييم%'
      or d.high_priority_terms like '%علامات%' or d.high_priority_terms like '%اعراض%'
      or d.high_priority_terms like '%تشخيص%' or d.high_priority_terms like '%تقييم%'
    ) as assessment_match,
    (
      d.normalized_title like '%علامات%' or d.normalized_title like '%اعراض%'
      or d.normalized_title like '%تشخيص%' or d.normalized_title like '%تقييم%'
    ) as assessment_title,
    (
      d.normalized_title like '%يتكلم%' or d.normalized_title like '%كلام%'
      or d.normalized_title like '%نطق%' or d.normalized_title like '%تواصل%'
    ) as speech_title,
    (
      d.high_priority_terms like '%يتكلم%' or d.high_priority_terms like '%كلام%'
      or d.high_priority_terms like '%نطق%' or d.high_priority_terms like '%تواصل%'
    ) as speech_terms,
    (
      d.normalized_title like '%لا يتكلم%' or d.normalized_title like '%لا يتحدث%' or d.normalized_title like '%لا ينطق%'
      or d.high_priority_terms like '%لا يتكلم%' or d.high_priority_terms like '%لا يتحدث%' or d.high_priority_terms like '%لا ينطق%'
    ) as not_speaking_match,
    exists(
      select 1 from latin_tokens lt
      where pg_catalog.lower(coalesce(d.search_text,'')) not like '%'||lt.token||'%'
    ) as misses_latin_entity
  from deduped d
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
      + least(850.0,850.0*d.title_anchor_hits/qp.token_count)
      + least(360.0,360.0*d.terms_anchor_hits/qp.token_count)
      + case
          when qp.token_count>0 and greatest(d.title_anchor_hits,d.terms_anchor_hits)=0 then -700.0
          when qp.token_count>=2 and d.title_anchor_hits/qp.token_count>=0.75 then 420.0
          when qp.token_count>=2 and d.title_anchor_hits/qp.token_count>=0.50 then 180.0
          when d.terms_anchor_hits>=qp.token_count then 60.0
          else 0.0
        end
      + case
          when qf.parent_context and qf.support_intent and d.parent_action_title then 900.0
          when qf.parent_context and qf.support_intent and d.parent_support_match then 150.0
          else 0.0
        end
      + case
          when qf.parent_context and qf.assessment_intent and d.assessment_title then 850.0
          when qf.parent_context and qf.assessment_intent and d.assessment_match then 180.0
          else 0.0
        end
      + case
          when qf.not_speaking_intent and d.not_speaking_match then 800.0
          when qf.speech_intent and d.speech_title then 420.0
          when qf.speech_intent and d.speech_terms then 140.0
          else 0.0
        end
      + case
          when qf.child_recognition_intent and d.normalized_title like 'علامات %' then 720.0
          when qf.child_recognition_intent and d.normalized_title like 'اعراض %' then 620.0
          when qf.child_recognition_intent and d.normalized_title like '%علامات%' then 260.0
          else 0.0
        end
      + greatest(
          extensions.word_similarity(i.nq,d.normalized_title)::double precision*450.0,
          extensions.word_similarity(i.nq,d.high_priority_terms)::double precision*160.0
        )
      + greatest(
          extensions.word_similarity(qp.anchor_query,d.normalized_title)::double precision*220.0,
          extensions.word_similarity(qp.anchor_query,d.high_priority_terms)::double precision*80.0
        )
      + case
          when qf.parent_context and qf.support_intent and d.destination like '/family-guide/%' then 180.0
          when qf.parent_context and qf.support_intent and d.destination like '/care-guides/%' then 90.0
          else 0.0
        end
      + case when qf.child_recognition_intent and d.destination like '%self-diagnosis%' then -350.0 else 0.0 end
      + case when d.misses_latin_entity then -1200.0 else 0.0 end
      + case d.entity_type when 'sector' then 35.0 when 'category' then 25.0 else 0.0 end
    )::double precision as score
  from signals d cross join input i cross join query_parts qp cross join query_features qf
)
select s.entity_type,s.entity_id,s.slug,s.title,s.subtitle,s.excerpt,s.destination,s.score,s.tier
from scored s
order by s.score desc,s.title asc
limit (select lim from input);
$$;

revoke all on function public.search_platform_v3_lexical(text,integer) from public,anon,authenticated;
grant execute on function public.search_platform_v3_lexical(text,integer) to service_role;
