-- Enforce a single public canonical owner at write time.
-- Draft and noindex rows may still share a canonical while under editorial work.
-- Published, indexable rows reserve canonical ownership regardless of published_at
-- so scheduled releases cannot race with an already-public or concurrently-scheduled owner.

create unique index if not exists content_published_indexable_canonical_owner_uidx
on public.content (
  (lower(coalesce(nullif(rtrim(btrim(canonical_url), '/'), ''), '/')))
)
where status = 'published'
  and robots_index is true
  and canonical_url is not null
  and btrim(canonical_url) <> '';
