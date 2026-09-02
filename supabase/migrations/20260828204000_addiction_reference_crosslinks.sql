begin;

with mapping(category_slug, content_slug) as (values
  ('addiction-special-populations','legacy-addiction-populations-chronic-pain'),
  ('addiction-special-populations','legacy-addiction-populations-justice-reentry'),
  ('addiction-special-populations','legacy-addiction-populations-refugees-displacement-complex-trauma'),
  ('addiction-community-systems','legacy-addiction-populations-justice-reentry')
), resolved as (
  select cat.id as category_id, c.id as content_id
  from mapping m
  join public.categories cat on cat.slug=m.category_slug
  join public.sectors s on s.id=cat.sector_id and s.slug='addiction-recovery'
  join public.content c on c.slug=m.content_slug
  where c.status='published' and c.robots_index=true and c.published_at<=now()
)
insert into public.content_categories(content_id,category_id,is_primary)
select content_id,category_id,false
from resolved
on conflict(content_id,category_id) do nothing;

do $$
declare v_count integer;
begin
  select count(*) into v_count
  from public.content_categories cc
  join public.categories cat on cat.id=cc.category_id
  join public.content c on c.id=cc.content_id
  where cat.slug='addiction-special-populations'
    and c.slug in (
      'legacy-addiction-populations-chronic-pain',
      'legacy-addiction-populations-justice-reentry',
      'legacy-addiction-populations-refugees-displacement-complex-trauma'
    );
  if v_count <> 3 then
    raise exception 'expected 3 special-population crosslinks, found %',v_count;
  end if;
end $$;

commit;
