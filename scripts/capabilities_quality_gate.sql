-- Rawafid capabilities non-destructive upgrade quality gate
-- Run against the same Supabase database that contains:
-- private.capabilities_upgrade_snapshot_20260826
-- This script is read-only. Any FAIL row blocks approval of an upgrade batch.

with
baseline as (
  select * from private.capabilities_upgrade_snapshot_20260826
),
current_rows as (
  select * from public.content where slug like 'capabilities-%'
),
condition_rows as (
  select * from current_rows
  where slug not in ('capabilities-hub','capabilities-methodology','capabilities-protocol','capabilities-registry')
),
ranked as (
  select slug, nullif(schema_json->>'legacy_rank','')::int as rank
  from condition_rows
),
missing_original as (
  select b.slug from baseline b left join current_rows c using (slug) where c.id is null
),
seo_fail as (
  select slug from current_rows
  where status='published' and (robots_index is distinct from true or robots_follow is distinct from true
    or canonical_url is null or btrim(canonical_url)=''
    or seo_title is null or btrim(seo_title)=''
    or seo_description is null or btrim(seo_description)='')
),
canonical_dupes as (
  select canonical_url, count(*) n from current_rows
  where canonical_url is not null and btrim(canonical_url)<>''
  group by canonical_url having count(*)>1
),
rank_dupes as (
  select rank,count(*) n from ranked where rank is not null group by rank having count(*)>1
),
missing_ranks as (
  select x from generate_series(1,100) x where not exists (select 1 from ranked r where r.rank=x)
),
content_loss as (
  select c.slug,
         length(coalesce(b.body_text,'')) baseline_chars,
         length(coalesce(c.body_text,'')) current_chars,
         jsonb_array_length(coalesce(b.references_json,'[]'::jsonb)) baseline_refs,
         jsonb_array_length(coalesce(c.references_json,'[]'::jsonb)) current_refs
  from baseline b join current_rows c using (slug)
  where length(coalesce(c.body_text,'')) < greatest(500, length(coalesce(b.body_text,''))*0.75)
     or jsonb_array_length(coalesce(c.references_json,'[]'::jsonb)) < jsonb_array_length(coalesce(b.references_json,'[]'::jsonb))
),
contract_gaps as (
  select slug from condition_rows
  where not (schema_json ? 'page_mechanism')
     or not (schema_json ? 'claim_source_map')
     or not (schema_json ? 'search_intent_questions')
     or not (schema_json ? 'content_contract_version')
),
faq_questions as (
  select c.slug, item->>'question' question
  from current_rows c
  cross join lateral jsonb_array_elements(coalesce(c.body_json->'blocks','[]'::jsonb)) b(block)
  cross join lateral jsonb_array_elements(case when b.block->>'type'='faq' then coalesce(b.block->'items','[]'::jsonb) else '[]'::jsonb end) item
  where nullif(btrim(item->>'question'),'') is not null
),
faq_templates as (
  select question,count(distinct slug) pages
  from faq_questions group by question having count(distinct slug)>=10
),
block_text as (
  select c.slug,
         regexp_replace(lower(btrim(coalesce(b.block->>'text',''))),'\s+',' ','g') txt
  from condition_rows c
  cross join lateral jsonb_array_elements(coalesce(c.body_json->'blocks','[]'::jsonb)) b(block)
  where length(btrim(coalesce(b.block->>'text',''))) >= 120
),
shared_blocks as (
  select txt,count(distinct slug) pages
  from block_text group by txt having count(distinct slug)>=5
)
select * from (
  select 'original_slugs_preserved' check_name,
         case when not exists(select 1 from missing_original) then 'PASS' else 'FAIL' end status,
         (select count(*)::text from missing_original) detail
  union all
  select 'published_index_follow_and_seo', case when not exists(select 1 from seo_fail) then 'PASS' else 'FAIL' end,
         (select count(*)::text from seo_fail)
  union all
  select 'canonical_uniqueness', case when not exists(select 1 from canonical_dupes) then 'PASS' else 'FAIL' end,
         (select count(*)::text from canonical_dupes)
  union all
  select 'exactly_100_condition_pages', case when (select count(*) from condition_rows)=100 then 'PASS' else 'FAIL' end,
         (select count(*)::text from condition_rows)
  union all
  select 'registry_ranks_1_to_100_unique',
         case when not exists(select 1 from missing_ranks) and not exists(select 1 from rank_dupes) and (select count(*) from ranked where rank between 1 and 100)=100 then 'PASS' else 'FAIL' end,
         jsonb_build_object('missing',(select coalesce(jsonb_agg(x),'[]'::jsonb) from missing_ranks),'dupes',(select coalesce(jsonb_agg(jsonb_build_object('rank',rank,'n',n)),'[]'::jsonb) from rank_dupes))::text
  union all
  select 'no_large_content_or_reference_loss', case when not exists(select 1 from content_loss) then 'PASS' else 'FAIL' end,
         (select count(*)::text from content_loss)
  union all
  select 'modern_content_contract_complete', case when not exists(select 1 from contract_gaps) then 'PASS' else 'FAIL' end,
         (select count(*)::text from contract_gaps)
  union all
  select 'faq_template_repetition_below_threshold', case when not exists(select 1 from faq_templates) then 'PASS' else 'FAIL' end,
         (select count(*)::text from faq_templates)
  union all
  select 'long_exact_block_repetition_below_threshold', case when not exists(select 1 from shared_blocks) then 'PASS' else 'FAIL' end,
         (select count(*)::text from shared_blocks)
) q
order by check_name;

-- Diagnostic details to inspect when a gate fails:
-- select * from missing_original;
-- select * from seo_fail;
-- select * from canonical_dupes;
-- select * from rank_dupes;
-- select * from missing_ranks;
-- select * from content_loss order by slug;
-- select * from contract_gaps order by slug;
-- select * from faq_templates order by pages desc, question;
-- select * from shared_blocks order by pages desc, length(txt) desc;