create or replace function public.set_addiction_sector_featured_media_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.robots_index is true then
    if exists (
      select 1
      from public.content_categories cc
      join public.categories cat on cat.id = cc.category_id
      where cc.content_id = new.id
        and cat.sector_id = '1088b29a-fe97-483f-a2e6-b6715a7e58a0'
    ) then
      if coalesce(trim(new.featured_image_url), '') = '' then
        new.featured_image_url := '/addiction/images/' || new.slug;
      end if;
      if coalesce(trim(new.featured_image_alt), '') = '' then
        new.featured_image_alt := new.title;
      end if;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.set_addiction_sector_featured_media_defaults() from public;

drop trigger if exists addiction_sector_featured_media_defaults on public.content;
create trigger addiction_sector_featured_media_defaults
before insert or update of status, robots_index, slug, title, featured_image_url, featured_image_alt
on public.content
for each row
execute function public.set_addiction_sector_featured_media_defaults();

with addiction_categories as (
  select id from public.categories where sector_id = '1088b29a-fe97-483f-a2e6-b6715a7e58a0'
), target as (
  select distinct c.id,c.slug,c.title
  from public.content c
  join public.content_categories cc on cc.content_id=c.id
  where cc.category_id in (select id from addiction_categories)
    and c.status='published'
    and c.robots_index=true
    and c.published_at<=now()
)
update public.content c
set featured_image_url = case when coalesce(trim(c.featured_image_url),'')='' then '/addiction/images/' || c.slug else c.featured_image_url end,
    featured_image_alt = case when coalesce(trim(c.featured_image_alt),'')='' then c.title else c.featured_image_alt end
from target t
where c.id=t.id
  and (coalesce(trim(c.featured_image_url),'')='' or coalesce(trim(c.featured_image_alt),'')='');
