create unique index if not exists content_categories_one_primary_per_content_idx
on public.content_categories(content_id)
where is_primary=true;
