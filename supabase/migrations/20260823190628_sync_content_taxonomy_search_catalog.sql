create or replace function internal_search.sync_content_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op='DELETE' then
    delete from internal_search.catalog where entity_type='content' and entity_id=old.id;
    return old;
  end if;

  if new.status='published'::public.content_status and new.published_at is not null then
    insert into internal_search.catalog(
      entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public
    ) values (
      'content',new.id,new.slug,new.title,public.normalize_arabic_search(new.title),
      public.normalize_arabic_search(
        coalesce(new.primary_keyword,'') || ' ' ||
        coalesce(pg_catalog.array_to_string(new.secondary_keywords,' '),'') || ' ' ||
        coalesce(pg_catalog.array_to_string(new.semantic_terms,' '),'') || ' ' ||
        coalesce(pg_catalog.array_to_string(new.search_aliases,' '),'')
      ),
      new.content_type::text,new.excerpt,'/content/'||new.slug,new.published_at,true
    )
    on conflict(entity_type,entity_id) do update set
      slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
      normalized_terms=excluded.normalized_terms,subtitle=excluded.subtitle,excerpt=excluded.excerpt,
      destination=excluded.destination,published_at=excluded.published_at,is_public=true;
  else
    delete from internal_search.catalog where entity_type='content' and entity_id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function internal_search.sync_content_catalog() from public;

drop trigger if exists content_search_catalog_insert_delete on public.content;
create trigger content_search_catalog_insert_delete
after insert or delete on public.content
for each row execute function internal_search.sync_content_catalog();

drop trigger if exists content_search_catalog_update on public.content;
create trigger content_search_catalog_update
after update of slug,title,excerpt,status,published_at,content_type,primary_keyword,secondary_keywords,semantic_terms,search_aliases on public.content
for each row execute function internal_search.sync_content_catalog();

create or replace function internal_search.sync_sector_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op='DELETE' then
    delete from internal_search.catalog where entity_type='sector' and entity_id=old.id;
    return old;
  end if;
  if new.is_active=true and new.visibility='public' then
    insert into internal_search.catalog(entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public)
    values('sector',new.id,new.slug,new.name_ar,public.normalize_arabic_search(new.name_ar),'','قطاع',new.description,'/sectors/'||new.slug,null,true)
    on conflict(entity_type,entity_id) do update set
      slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
      subtitle=excluded.subtitle,excerpt=excluded.excerpt,destination=excluded.destination,is_public=true;
  else
    delete from internal_search.catalog where entity_type='sector' and entity_id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function internal_search.sync_sector_catalog() from public;

drop trigger if exists sector_search_catalog_sync on public.sectors;
create trigger sector_search_catalog_sync
after insert or delete or update of slug,name_ar,description,is_active,visibility on public.sectors
for each row execute function internal_search.sync_sector_catalog();

create or replace function internal_search.sync_category_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op='DELETE' then
    delete from internal_search.catalog where entity_type='category' and entity_id=old.id;
    return old;
  end if;
  if new.is_active=true and new.visibility='public' then
    insert into internal_search.catalog(entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public)
    values('category',new.id,new.slug,new.name_ar,public.normalize_arabic_search(new.name_ar),'','قسم',new.description,'/sections/'||new.slug,null,true)
    on conflict(entity_type,entity_id) do update set
      slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
      subtitle=excluded.subtitle,excerpt=excluded.excerpt,destination=excluded.destination,is_public=true;
  else
    delete from internal_search.catalog where entity_type='category' and entity_id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function internal_search.sync_category_catalog() from public;

drop trigger if exists category_search_catalog_sync on public.categories;
create trigger category_search_catalog_sync
after insert or delete or update of slug,name_ar,description,is_active,visibility on public.categories
for each row execute function internal_search.sync_category_catalog();
