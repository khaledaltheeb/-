insert into internal_search.catalog (
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
  c.content_type::text,c.excerpt,'/content/'||c.slug,c.published_at,true
from public.content c
where c.status='published'::public.content_status and c.published_at is not null
on conflict(entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  normalized_terms=excluded.normalized_terms,subtitle=excluded.subtitle,excerpt=excluded.excerpt,
  destination=excluded.destination,published_at=excluded.published_at,is_public=true;

analyze internal_search.catalog;
