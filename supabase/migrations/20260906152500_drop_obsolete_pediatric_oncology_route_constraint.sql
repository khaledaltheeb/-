-- Align the production schema with the 2026-09-05 pediatric-oncology release policy.
-- Live HTTP/sitemap verification was intentionally removed from the release chain in
-- 20260905084634_remove_legacy_pediatric_live_route_release_chain.sql, but the older
-- CHECK constraint remained behind and could force new content revisions to carry a
-- stale `public_route_verification=pending` compatibility object.
--
-- This removes only that obsolete route-verification constraint. The independent
-- pediatric-oncology scientific release guard remains authoritative for publication
-- readiness, source identity, originality, evidence-audit tokens, safe canonicals,
-- and robots indexing.

alter table public.content
  drop constraint if exists pediatric_oncology_published_route_verified;
