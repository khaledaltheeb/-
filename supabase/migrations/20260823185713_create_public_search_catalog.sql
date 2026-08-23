create table if not exists public.public_search_catalog (
  entity_type text not null,
  entity_id uuid not null,
  slug text not null,
  title text not null,
  normalized_title text not null,
  normalized_terms text not null default '',
  subtitle text,
  excerpt text,
  destination text not null,
  published_at timestamptz,
  is_public boolean not null default true,
  primary key (entity_type, entity_id)
);

alter table public.public_search_catalog enable row level security;

create index if not exists public_search_catalog_title_trgm_idx
  on public.public_search_catalog using gin (normalized_title extensions.gin_trgm_ops);
create index if not exists public_search_catalog_terms_trgm_idx
  on public.public_search_catalog using gin (normalized_terms extensions.gin_trgm_ops);
create index if not exists public_search_catalog_type_public_idx
  on public.public_search_catalog (entity_type, is_public, published_at);

insert into public.public_search_catalog (
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
  c.content_type::text,c.excerpt,'/content/'||c.slug,c.published_at,
  (c.status='published'::public.content_status and c.published_at is not null)
from public.content c
where c.status='published'::public.content_status
on conflict (entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  normalized_terms=excluded.normalized_terms,subtitle=excluded.subtitle,excerpt=excluded.excerpt,
  destination=excluded.destination,published_at=excluded.published_at,is_public=excluded.is_public;

insert into public.public_search_catalog (
  entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public
)
select 'sector',s.id,s.slug,s.name_ar,public.normalize_arabic_search(s.name_ar),'','قطاع',s.description,
  '/sectors/'||s.slug,null,(s.is_active and s.visibility='public')
from public.sectors s where s.is_active=true and s.visibility='public'
on conflict (entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  subtitle=excluded.subtitle,excerpt=excluded.excerpt,destination=excluded.destination,is_public=excluded.is_public;

insert into public.public_search_catalog (
  entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public
)
select 'category',c.id,c.slug,c.name_ar,public.normalize_arabic_search(c.name_ar),'','قسم',c.description,
  '/sections/'||c.slug,null,(c.is_active and c.visibility='public')
from public.categories c where c.is_active=true and c.visibility='public'
on conflict (entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  subtitle=excluded.subtitle,excerpt=excluded.excerpt,destination=excluded.destination,is_public=excluded.is_public;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='public_search_catalog' and policyname='public_search_catalog_read'
  ) then
    create policy public_search_catalog_read on public.public_search_catalog
      for select to anon, authenticated
      using (is_public=true and (published_at is null or published_at<=now()));
  end if;
end $$;

grant select on public.public_search_catalog to anon,authenticated,service_role;
analyze public.public_search_catalog;
