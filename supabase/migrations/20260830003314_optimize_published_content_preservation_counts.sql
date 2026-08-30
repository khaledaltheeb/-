create index if not exists content_published_at_published_idx
on public.content (published_at, id)
where status = 'published';

create index if not exists content_published_at_indexable_idx
on public.content (published_at, id)
where status = 'published' and robots_index is true;
