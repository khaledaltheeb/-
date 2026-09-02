create or replace function public.set_addiction_image_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.slug = 'addiction-hub' or new.slug like 'addiction-%' then
    if nullif(btrim(coalesce(new.featured_image_url, '')), '') is null then
      new.featured_image_url := '/addiction/images/' || regexp_replace(new.slug, '^addiction-', '');
    end if;
    if nullif(btrim(coalesce(new.featured_image_alt, '')), '') is null then
      new.featured_image_alt := new.title;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.set_addiction_image_defaults() from public;

drop trigger if exists addiction_image_defaults on public.content;
create trigger addiction_image_defaults
before insert or update of slug, title, featured_image_url, featured_image_alt
on public.content
for each row
execute function public.set_addiction_image_defaults();
