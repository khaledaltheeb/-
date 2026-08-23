create or replace view private.seo_readiness_fast as
select
  pg_catalog.now() as measured_at,
  10000::bigint as target_indexable_pages,
  pg_catalog.count(*) filter (where c.status='published'::public.content_status and c.published_at<=pg_catalog.now())::bigint as published_content,
  pg_catalog.count(*) filter (where c.status='published'::public.content_status and c.robots_index=true and c.published_at<=pg_catalog.now())::bigint as indexable_published_content,
  greatest(0::bigint,10000::bigint-pg_catalog.count(*) filter (where c.status='published'::public.content_status and c.robots_index=true and c.published_at<=pg_catalog.now())::bigint) as raw_gap_to_10000,
  pg_catalog.count(*) filter (where c.status='published'::public.content_status and c.robots_index=true and c.published_at<=pg_catalog.now() and (nullif(pg_catalog.btrim(coalesce(c.seo_title,'')),'') is null or nullif(pg_catalog.btrim(coalesce(c.seo_description,'')),'') is null or nullif(pg_catalog.btrim(coalesce(c.canonical_url,'')),'') is null or nullif(pg_catalog.btrim(coalesce(c.primary_keyword,'')),'') is null))::bigint as published_missing_seo_core,
  pg_catalog.count(*) filter (where c.status='published'::public.content_status and c.robots_index=true and c.published_at<=pg_catalog.now() and coalesce(pg_catalog.cardinality(c.secondary_keywords),0)=0)::bigint as published_missing_secondary_terms,
  pg_catalog.count(*) filter (where c.status='published'::public.content_status and c.robots_index=true and c.published_at<=pg_catalog.now() and coalesce(pg_catalog.cardinality(c.semantic_terms),0)=0)::bigint as published_missing_semantic_terms,
  pg_catalog.count(*) filter (where c.status='published'::public.content_status and c.robots_index=true and c.published_at<=pg_catalog.now() and c.last_reviewed_at is null)::bigint as published_missing_review_date,
  pg_catalog.count(*) filter (where c.status='published'::public.content_status and c.robots_index=true and c.published_at<=pg_catalog.now() and c.featured_image_url is null and coalesce(c.schema_json::text,'') !~ '"image"')::bigint as published_without_image_signal,
  pg_catalog.count(*) filter (where c.status='draft'::public.content_status)::bigint as draft_content,
  pg_catalog.count(*) filter (where c.status='editorial_review'::public.content_status)::bigint as editorial_review_content,
  (select pg_catalog.count(*)::bigint from public.redirects r where r.is_active) as active_redirects,
  (select pg_catalog.count(*)::bigint from public.redirects r1 join public.redirects r2 on r2.source_path=r1.destination_path and r1.is_active and r2.is_active and r1.id<>r2.id) as redirect_chains
from public.content c;

revoke all on private.seo_readiness_fast from public, anon, authenticated;
