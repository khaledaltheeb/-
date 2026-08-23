insert into public.content_categories (content_id, category_id, is_primary)
select co.id, cat.id, false
from public.content co
join public.categories cat on cat.slug = 'pediatric-cancer-nutrition'
where co.slug = 'pediatric-cancer-nutrition-weight-family-guide'
on conflict (content_id, category_id) do nothing;

insert into public.content_categories (content_id, category_id, is_primary)
select co.id, cat.id, false
from public.content co
join public.categories cat on cat.slug = 'pediatric-cancer-systematic-reviews-guidelines'
where co.slug in (
  'pediatric-cancer-surveillance-nf1-rasopathies-39196581',
  'thesis-van-den-oever-survivorship-tools-2025'
)
on conflict (content_id, category_id) do nothing;
