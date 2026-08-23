create or replace function private.rawafid_seo_readiness_summary()
returns jsonb
language sql
stable
security definer
set search_path=''
as $$
with base as (
  select
    c.id,
    c.slug,
    c.content_type,
    c.canonical_url,
    c.seo_title,
    c.seo_description,
    c.primary_keyword,
    c.last_reviewed_at,
    c.featured_image_url,
    c.schema_json,
    case
      when trim(coalesce(c.body_text,'')) = '' then 0
      else coalesce(array_length(regexp_split_to_array(trim(c.body_text), E'\\s+'),1),0)
    end as words,
    case when jsonb_typeof(c.references_json)='array' then jsonb_array_length(c.references_json) else 0 end as ref_count,
    case when jsonb_typeof(c.body_json->'blocks')='array' then jsonb_array_length(c.body_json->'blocks') else 0 end as block_count,
    coalesce((select count(*) from jsonb_array_elements(case when jsonb_typeof(c.body_json->'blocks')='array' then c.body_json->'blocks' else '[]'::jsonb end) b where b->>'type'='heading'),0) as heading_count
  from public.content c
  where c.status='published'
    and c.robots_index=true
    and c.published_at <= now()
), scored as (
  select *,
    (nullif(trim(coalesce(seo_title,'')),'') is not null
      and nullif(trim(coalesce(seo_description,'')),'') is not null
      and nullif(trim(coalesce(canonical_url,'')),'') is not null
      and nullif(trim(coalesce(primary_keyword,'')),'') is not null) as meta_complete,
    case
      when content_type='research' then words >= 250 and ref_count >= 1 and block_count >= 8 and heading_count >= 3
      when content_type in ('article','guide','condition','intervention','comparison','learning_path') then words >= 400 and ref_count >= 1
      when content_type in ('glossary_term','resource') then words >= 100 and ref_count >= 1
      when content_type in ('tool','directory_page','landing_page') then words >= 100
      else words >= 200
    end as content_ready,
    (featured_image_url is not null or coalesce(schema_json::text,'') ~ '"image"') as has_content_image_signal
  from base
), duplicate_titles as (
  select coalesce(sum(n-1),0)::bigint as extras
  from (select count(*) n from base where nullif(trim(coalesce(seo_title,'')),'') is not null group by lower(trim(seo_title)) having count(*)>1) x
), duplicate_descriptions as (
  select coalesce(sum(n-1),0)::bigint as extras
  from (select count(*) n from base where nullif(trim(coalesce(seo_description,'')),'') is not null group by lower(trim(seo_description)) having count(*)>1) x
), duplicate_canonicals as (
  select coalesce(sum(n-1),0)::bigint as extras
  from (select count(*) n from base where nullif(trim(coalesce(canonical_url,'')),'') is not null group by canonical_url having count(*)>1) x
), totals as (
  select
    count(*)::bigint as indexable,
    count(*) filter(where meta_complete)::bigint as meta_complete,
    count(*) filter(where meta_complete and content_ready)::bigint as qualified,
    count(*) filter(where not content_ready)::bigint as content_not_ready,
    count(*) filter(where last_reviewed_at is not null)::bigint as with_review_date,
    count(*) filter(where has_content_image_signal)::bigint as with_content_image_signal,
    count(*) filter(where canonical_url ~* 'workers\\.dev')::bigint as staging_canonicals,
    count(*) filter(where canonical_url ~* '^https?://' and canonical_url !~* '^https://(www\\.)?healthrenewal\\.org(/|$)')::bigint as external_canonicals
  from scored
)
select jsonb_build_object(
  'generated_at', now(),
  'target_qualified_pages', 10000,
  'indexable_published', t.indexable,
  'meta_complete', t.meta_complete,
  'qualified_database_pages', t.qualified,
  'remaining_to_10000', greatest(10000 - t.qualified, 0),
  'content_not_ready', t.content_not_ready,
  'with_review_date', t.with_review_date,
  'with_content_image_signal', t.with_content_image_signal,
  'duplicate_canonical_extra_pages', dc.extras,
  'duplicate_title_extra_pages', dt.extras,
  'duplicate_description_extra_pages', dd.extras,
  'staging_canonicals', t.staging_canonicals,
  'external_canonicals', t.external_canonicals
)
from totals t cross join duplicate_titles dt cross join duplicate_descriptions dd cross join duplicate_canonicals dc;
$$;

revoke all on function private.rawafid_seo_readiness_summary() from public;
