create or replace function internal_search.sync_content_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quick_info_ready boolean;
  target_destination text;
begin
  if tg_op='DELETE' then
    delete from internal_search.catalog where entity_type='content' and entity_id=old.id;
    return old;
  end if;

  quick_info_ready := (
    new.slug not like 'quick-info-%'
    or (
      new.robots_index = true
      and new.schema_json->>'page_role' = 'quick-info'
      and new.schema_json->>'publication_ready' = 'true'
      and new.schema_json->>'editorial_review_required' = 'false'
      and (
        new.canonical_url is null
        or new.canonical_url = '/quick-info/' || pg_catalog.substr(new.slug, 12) || '/'
      )
    )
  );

  if new.status='published'::public.content_status
     and new.published_at is not null
     and quick_info_ready then
    target_destination := case
      when new.slug like 'quick-info-%'
        then coalesce(new.canonical_url, '/quick-info/' || pg_catalog.substr(new.slug, 12) || '/')
      else '/content/' || new.slug
    end;

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
      new.content_type::text,new.excerpt,target_destination,new.published_at,true
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

drop trigger if exists content_search_catalog_update on public.content;
create trigger content_search_catalog_update
after update of slug,title,excerpt,status,published_at,content_type,primary_keyword,secondary_keywords,semantic_terms,search_aliases,robots_index,schema_json,canonical_url on public.content
for each row execute function internal_search.sync_content_catalog();

-- Reconcile only quick-info rows. This changes the derived search catalog, never the source content.
delete from internal_search.catalog
where entity_type='content' and slug like 'quick-info-%';

insert into internal_search.catalog(
  entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public
)
select
  'content',c.id,c.slug,c.title,public.normalize_arabic_search(c.title),
  public.normalize_arabic_search(
    coalesce(c.primary_keyword,'') || ' ' ||
    coalesce(pg_catalog.array_to_string(c.secondary_keywords,' '),'') || ' ' ||
    coalesce(pg_catalog.array_to_string(c.semantic_terms,' '),'') || ' ' ||
    coalesce(pg_catalog.array_to_string(c.search_aliases,' '),'')
  ),
  c.content_type::text,c.excerpt,
  coalesce(c.canonical_url, '/quick-info/' || pg_catalog.substr(c.slug, 12) || '/'),
  c.published_at,true
from public.content c
where c.slug like 'quick-info-%'
  and c.status='published'::public.content_status
  and c.published_at is not null
  and c.robots_index=true
  and c.schema_json->>'page_role'='quick-info'
  and c.schema_json->>'publication_ready'='true'
  and c.schema_json->>'editorial_review_required'='false'
  and (
    c.canonical_url is null
    or c.canonical_url = '/quick-info/' || pg_catalog.substr(c.slug, 12) || '/'
  )
on conflict(entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  normalized_terms=excluded.normalized_terms,subtitle=excluded.subtitle,excerpt=excluded.excerpt,
  destination=excluded.destination,published_at=excluded.published_at,is_public=true;

analyze internal_search.catalog;
