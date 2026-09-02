-- Rawafid SEO readiness audit for the healthrenewal.org cutover.
-- Read-only. Run against the production Supabase database.

with pages as (
  select
    id,
    slug,
    title,
    content_type,
    seo_title,
    seo_description,
    canonical_url,
    primary_keyword,
    secondary_keywords,
    semantic_terms,
    body_text,
    body_json,
    references_json,
    featured_image_url,
    schema_json,
    last_reviewed_at,
    reviewer_display_name,
    case
      when trim(coalesce(body_text,''))='' then 0
      else array_length(regexp_split_to_array(trim(body_text), E'\\s+'),1)
    end as words,
    case
      when jsonb_typeof(references_json)='array' then jsonb_array_length(references_json)
      else 0
    end as ref_count,
    case
      when jsonb_typeof(body_json->'blocks')='array' then jsonb_array_length(body_json->'blocks')
      else 0
    end as block_count,
    coalesce((
      select count(*)
      from jsonb_array_elements(
        case when jsonb_typeof(body_json->'blocks')='array' then body_json->'blocks' else '[]'::jsonb end
      ) block
      where block->>'type'='heading'
    ),0) as heading_count
  from public.content
  where status='published'
    and robots_index=true
    and published_at <= now()
), scored as (
  select *,
    (
      nullif(trim(coalesce(seo_title,'')),'') is not null
      and nullif(trim(coalesce(seo_description,'')),'') is not null
      and nullif(trim(coalesce(canonical_url,'')),'') is not null
      and nullif(trim(coalesce(primary_keyword,'')),'') is not null
      and case
        when content_type='research' then
          ((ref_count>=2 and words>=300)
            or (ref_count=1 and words>=350 and block_count>=8 and heading_count>=3))
        when content_type in ('article','guide','condition','intervention','comparison','learning_path')
          then words>=400 and ref_count>=1
        when content_type in ('glossary_term','resource')
          then words>=100 and ref_count>=1
        when content_type in ('tool','directory_page','landing_page')
          then words>=100
        else words>=200
      end
    ) as db_content_qualified
  from pages
), duplicate_titles as (
  select lower(trim(seo_title)) key from pages group by 1 having count(*)>1
), duplicate_descriptions as (
  select lower(trim(seo_description)) key from pages group by 1 having count(*)>1
), duplicate_canonicals as (
  select canonical_url key from pages group by 1 having count(*)>1
)
select
  count(*) as indexable_database_pages,
  count(*) filter (where db_content_qualified) as qualified_database_pages,
  count(*) filter (where not db_content_qualified) as needs_editorial_upgrade,
  count(*) filter (where nullif(trim(coalesce(seo_title,'')),'') is null) as missing_seo_title,
  count(*) filter (where nullif(trim(coalesce(seo_description,'')),'') is null) as missing_seo_description,
  count(*) filter (where nullif(trim(coalesce(canonical_url,'')),'') is null) as missing_canonical,
  count(*) filter (where nullif(trim(coalesce(primary_keyword,'')),'') is null) as missing_primary_keyword,
  count(*) filter (where coalesce(cardinality(secondary_keywords),0)=0) as missing_secondary_keywords,
  count(*) filter (where coalesce(cardinality(semantic_terms),0)=0) as missing_semantic_terms,
  count(*) filter (where last_reviewed_at is null) as missing_review_date,
  count(*) filter (where reviewer_display_name is null or trim(reviewer_display_name)='') as missing_reviewer,
  count(*) filter (where featured_image_url is null and not (coalesce(schema_json::text,'') ~ '"image"')) as missing_page_image_signal,
  (select count(*) from duplicate_titles) as duplicate_seo_title_groups,
  (select count(*) from duplicate_descriptions) as duplicate_seo_description_groups,
  (select count(*) from duplicate_canonicals) as duplicate_canonical_groups,
  count(*) filter (where canonical_url ~* 'workers\\.dev') as staging_canonicals,
  count(*) filter (
    where canonical_url ~* '^https?://'
      and canonical_url !~* '^https://(www\\.)?healthrenewal\\.org(/|$)'
  ) as external_canonicals,
  round(100.0 * count(*) filter (where db_content_qualified) / nullif(count(*),0), 2) as database_quality_percent,
  greatest(10000 - count(*) filter (where db_content_qualified), 0) as db_only_gap_to_10000
from scored;
