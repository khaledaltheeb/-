create or replace function public.sync_addiction_sector_featured_media_on_category_assignment()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1
    from public.categories cat
    where cat.id = new.category_id
      and cat.sector_id = '1088b29a-fe97-483f-a2e6-b6715a7e58a0'
  ) then
    update public.content c
    set featured_image_url = case when coalesce(trim(c.featured_image_url),'')='' then '/addiction/images/' || c.slug else c.featured_image_url end,
        featured_image_alt = case when coalesce(trim(c.featured_image_alt),'')='' then c.title else c.featured_image_alt end
    where c.id = new.content_id
      and c.status='published'
      and c.robots_index=true
      and (coalesce(trim(c.featured_image_url),'')='' or coalesce(trim(c.featured_image_alt),'')='');
  end if;
  return new;
end;
$$;

revoke all on function public.sync_addiction_sector_featured_media_on_category_assignment() from public;

drop trigger if exists addiction_sector_category_assignment_media_sync on public.content_categories;
create trigger addiction_sector_category_assignment_media_sync
after insert or update of category_id, content_id
on public.content_categories
for each row
execute function public.sync_addiction_sector_featured_media_on_category_assignment();
