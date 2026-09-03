-- Production history marker.
-- The invalid pg_catalog qualification on SQL expressions was corrected in production
-- before the chunk backfill completed. Fresh environments receive the corrected final
-- implementation directly from 20260901234958_enterprise_search_v2_chunk_pipeline.sql.
select 1;
