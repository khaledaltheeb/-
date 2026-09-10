-- Published public content must never be silently removed from search discovery.
-- Draft/review content may still be non-indexable; the invariant starts when status becomes published.
-- This migration mirrors the production constraint validated during the 2026-09-10 indexability audit.

alter table public.content
  drop constraint if exists content_published_must_be_indexable;

alter table public.content
  add constraint content_published_must_be_indexable
  check (
    status::text <> 'published'
    or (robots_index is true and robots_follow is true)
  ) not valid;

alter table public.content
  validate constraint content_published_must_be_indexable;
