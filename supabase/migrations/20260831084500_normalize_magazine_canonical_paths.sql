-- Normalize same-site magazine canonicals to the path-only contract used by
-- the Magazine route loader and sitemap ownership rules.
--
-- A 2026-08-30 publishing batch inserted 20 research rows with absolute
-- healthrenewal.org URLs. The public route resolves magazine records by their
-- path canonical, so those rows were visible in the sitemap but returned 404.

update public.content
set canonical_url = regexp_replace(canonical_url, '^https://healthrenewal\.org', '')
where content_type = 'research'
  and canonical_url like 'https://healthrenewal.org/magazine/%';
