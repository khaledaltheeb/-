create or replace view private.seo_readiness_snapshot as
with base as (
  select
    c.*,
    case
      when pg_catalog.btrim(coalesce(c.body_text,''))='' then 0
      else pg_catalog.array_length(pg_catalog.regexp_split_to_array(pg_catalog.btrim(c.body_text), E'\\s+'),1)
    end as word_count,
    case
      when pg_catalog.jsonb_typeof(c.references_json)='array' then pg_catalog.jsonb_array_length(c.references_json)
      else 0
    end as reference_count,
    (
      nullif(pg_catalog.btrim(coalesce(c.seo_title,'')),'') is not null and
      nullif(pg_catalog.btrim(coalesce(c.seo_description,'')),'') is not null and
      nullif(pg_catalog.btrim(coalesce(c.canonical_url,'')),'') is not null and
      nullif(pg_catalog.btrim(coalesce(c.primary_keyword,'')),'') is not null
    ) as seo_core_complete
  from public.content c
), scored as (
  select
    b.*,
    (
      b.status='published'::public.content_status and
      b.robots_index=true and
      b.published_at <= pg_catalog.now() and
      b.seo_core_complete and
      case
        when b.content_type='research' then
          ((b.reference_count>=2 and b.word_count>=300) or (b.reference_count=1 and b.word_count>=350))
        when b.content_type in ('article','guide','condition','intervention','comparison','learning_path') then
          b.word_count>=400 and b.reference_count>=1
        when b.content_type in ('glossary_term','resource') then
          b.word_count>=100 and b.reference_count>=1
        when b.content_type in ('tool','directory_page','landing_page') then
          b.word_count>=100
        else b.word_count>=200
      end
    ) as qualified_indexable
  from base b
), totals as (
  select
    pg_catalog.count(*) filter(where s.status='published'::public.content_status and s.published_at<=pg_catalog.now())::bigint as published_content,
    pg_catalog.count(*) filter(where s.status='published'::public.content_status and s.robots_index=true and s.published_at<=pg_catalog.now())::bigint as indexable_published_content,
    pg_catalog.count(*) filter(where s.qualified_indexable)::bigint as qualified_indexable_content,
    pg_catalog.count(*) filter(where s.status='published'::public.content_status and s.robots_index=true and s.published_at<=pg_catalog.now() and not s.seo_core_complete)::bigint as published_missing_seo_core,
    pg_catalog.count(*) filter(where s.status='published'::public.content_status and s.robots_index=true and s.published_at<=pg_catalog.now() and coalesce(pg_catalog.cardinality(s.secondary_keywords),0)=0)::bigint as published_missing_secondary_terms,
    pg_catalog.count(*) filter(where s.status='published'::public.content_status and s.robots_index=true and s.published_at<=pg_catalog.now() and coalesce(pg_catalog.cardinality(s.semantic_terms),0)=0)::bigint as published_missing_semantic_terms,
    pg_catalog.count(*) filter(where s.status='published'::public.content_status and s.robots_index=true and s.published_at<=pg_catalog.now() and s.last_reviewed_at is null)::bigint as published_missing_review_date,
    pg_catalog.count(*) filter(where s.status='published'::public.content_status and s.robots_index=true and s.published_at<=pg_catalog.now() and s.featured_image_url is null)::bigint as published_without_image_signal,
    pg_catalog.count(*) filter(where s.status='draft'::public.content_status)::bigint as draft_content,
    pg_catalog.count(*) filter(where s.status='editorial_review'::public.content_status)::bigint as editorial_review_content
  from scored s
), redirect_stats as (
  select
    pg_catalog.count(*) filter(where r.is_active)::bigint as active_redirects,
    pg_catalog.count(*) filter(where r.is_active and exists(
      select 1 from public.redirects r2 where r2.is_active and r2.source_path=r.destination_path and r2.id<>r.id
    ))::bigint as redirect_chains
  from public.redirects r
), legacy_stats as (
  select
    pg_catalog.count(*) filter(where not r.is_excluded)::bigint as legacy_routes_in_scope,
    pg_catalog.count(*) filter(where not r.is_excluded and r.migration_decision='PROMOTED_DRAFT')::bigint as promoted_legacy_routes,
    pg_catalog.count(*) filter(where not r.is_excluded and r.migration_decision='INTERACTIVE_REVIEW')::bigint as interactive_review_routes
  from private.legacy_route_registry r
)
select
  pg_catalog.now() as measured_at,
  10000::bigint as target_indexable_pages,
  t.published_content,
  t.indexable_published_content,
  t.qualified_indexable_content,
  case when t.qualified_indexable_content >= 10000::bigint then 0::bigint else 10000::bigint - t.qualified_indexable_content end as qualified_gap_to_10000,
  t.published_missing_seo_core,
  t.published_missing_secondary_terms,
  t.published_missing_semantic_terms,
  t.published_missing_review_date,
  t.published_without_image_signal,
  t.draft_content,
  t.editorial_review_content,
  r.active_redirects,
  r.redirect_chains,
  l.legacy_routes_in_scope,
  l.promoted_legacy_routes,
  l.interactive_review_routes
from totals t
cross join redirect_stats r
cross join legacy_stats l;

revoke all on private.seo_readiness_snapshot from public, anon, authenticated;
