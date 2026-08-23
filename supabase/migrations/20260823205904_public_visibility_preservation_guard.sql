create or replace function private.guard_published_content_presence()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if tg_op = 'DELETE' then
    if old.status::text = 'published'
       and old.published_at is not null
       and old.published_at <= pg_catalog.now() then
      raise exception 'published public content cannot be deleted; preserve the live page and revise it in place';
    end if;
    return old;
  end if;

  if old.status::text = 'published'
     and old.published_at is not null
     and old.published_at <= pg_catalog.now() then
    if new.status::text <> 'published' then
      raise exception 'published public content cannot be unpublished or archived; preserve the live page';
    end if;
    if new.published_at is null or new.published_at > pg_catalog.now() then
      raise exception 'published public content cannot be moved out of the live publication window';
    end if;
    if pg_catalog.coalesce(old.robots_index, false) = true
       and pg_catalog.coalesce(new.robots_index, false) = false then
      raise exception 'an indexable published page cannot be changed to noindex';
    end if;
    if new.slug is distinct from old.slug then
      raise exception 'published public content slug is immutable; preserve the existing public route';
    end if;
    if new.canonical_url is distinct from old.canonical_url then
      raise exception 'published public content canonical URL is immutable; preserve the existing public route';
    end if;
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_published_content_presence() from public, anon, authenticated;

drop trigger if exists z_preserve_published_content_update on public.content;
create trigger z_preserve_published_content_update
before update of status, published_at, robots_index, slug, canonical_url
on public.content
for each row execute function private.guard_published_content_presence();

drop trigger if exists z_preserve_published_content_delete on public.content;
create trigger z_preserve_published_content_delete
before delete on public.content
for each row execute function private.guard_published_content_presence();

create or replace function private.guard_public_taxonomy_presence()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if tg_op = 'DELETE' then
    if pg_catalog.coalesce(old.is_active, false) = true
       and pg_catalog.coalesce(old.visibility::text, '') = 'public' then
      raise exception 'public taxonomy pages cannot be deleted; preserve the live route';
    end if;
    return old;
  end if;

  if pg_catalog.coalesce(old.is_active, false) = true
     and pg_catalog.coalesce(old.visibility::text, '') = 'public' then
    if pg_catalog.coalesce(new.is_active, false) <> true
       or pg_catalog.coalesce(new.visibility::text, '') <> 'public' then
      raise exception 'public taxonomy pages cannot be hidden or deactivated';
    end if;
    if new.slug is distinct from old.slug then
      raise exception 'public taxonomy slug is immutable; preserve the existing public route';
    end if;
  end if;

  return new;
end;
$function$;

revoke all on function private.guard_public_taxonomy_presence() from public, anon, authenticated;

drop trigger if exists z_preserve_public_sector_update on public.sectors;
create trigger z_preserve_public_sector_update
before update of is_active, visibility, slug
on public.sectors
for each row execute function private.guard_public_taxonomy_presence();

drop trigger if exists z_preserve_public_sector_delete on public.sectors;
create trigger z_preserve_public_sector_delete
before delete on public.sectors
for each row execute function private.guard_public_taxonomy_presence();

drop trigger if exists z_preserve_public_category_update on public.categories;
create trigger z_preserve_public_category_update
before update of is_active, visibility, slug
on public.categories
for each row execute function private.guard_public_taxonomy_presence();

drop trigger if exists z_preserve_public_category_delete on public.categories;
create trigger z_preserve_public_category_delete
before delete on public.categories
for each row execute function private.guard_public_taxonomy_presence();

comment on function private.guard_published_content_presence() is
  'Hard no-loss guard: currently published pages cannot be deleted, unpublished, hidden from indexing after being indexable, or silently moved to a different slug/canonical URL.';
comment on function private.guard_public_taxonomy_presence() is
  'Hard no-loss guard: active public sector/category routes cannot be deleted, hidden, deactivated, or silently renamed.';
