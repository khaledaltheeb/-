create schema if not exists internal_search;
revoke all on schema internal_search from public;
grant usage on schema internal_search to anon,authenticated,service_role;

create table if not exists internal_search.catalog (
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
  primary key (entity_type,entity_id)
);

create index if not exists internal_search_catalog_title_trgm_idx
  on internal_search.catalog using gin (normalized_title extensions.gin_trgm_ops);
create index if not exists internal_search_catalog_terms_trgm_idx
  on internal_search.catalog using gin (normalized_terms extensions.gin_trgm_ops);

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

insert into internal_search.catalog(entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public)
select 'sector',s.id,s.slug,s.name_ar,public.normalize_arabic_search(s.name_ar),'','قطاع',s.description,'/sectors/'||s.slug,null,true
from public.sectors s where s.is_active=true and s.visibility='public'
on conflict(entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  subtitle=excluded.subtitle,excerpt=excluded.excerpt,destination=excluded.destination,is_public=true;

insert into internal_search.catalog(entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public)
select 'category',c.id,c.slug,c.name_ar,public.normalize_arabic_search(c.name_ar),'','قسم',c.description,'/sections/'||c.slug,null,true
from public.categories c where c.is_active=true and c.visibility='public'
on conflict(entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  subtitle=excluded.subtitle,excerpt=excluded.excerpt,destination=excluded.destination,is_public=true;

insert into internal_search.catalog(entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public)
select 'specialist',s.id,s.slug,s.full_name,public.normalize_arabic_search(s.full_name),
  public.normalize_arabic_search(coalesce(s.professional_title,'') || ' ' || coalesce(pg_catalog.array_to_string(s.specialties,' '),'')),
  coalesce(s.professional_title,pg_catalog.array_to_string(s.specialties,'، ')),
  nullif(pg_catalog.left(coalesce(s.bio,''),240),''),'/specialists/'||s.slug,null,true
from public.specialists s where s.is_active=true and s.verification='verified'::public.verification_status
on conflict(entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  normalized_terms=excluded.normalized_terms,subtitle=excluded.subtitle,excerpt=excluded.excerpt,
  destination=excluded.destination,is_public=true;

insert into internal_search.catalog(entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public)
select 'center',c.id,c.slug,c.name,public.normalize_arabic_search(c.name),
  public.normalize_arabic_search(coalesce(c.city,'') || ' ' || coalesce(c.country,'') || ' ' || coalesce(pg_catalog.array_to_string(c.services,' '),'')),
  nullif(pg_catalog.concat_ws('، ',c.city,c.country),''),nullif(pg_catalog.left(coalesce(c.description,''),240),''),
  '/centers/'||c.slug,null,true
from public.centers c where c.is_active=true and c.verification='verified'::public.verification_status
on conflict(entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  normalized_terms=excluded.normalized_terms,subtitle=excluded.subtitle,excerpt=excluded.excerpt,
  destination=excluded.destination,is_public=true;

insert into internal_search.catalog(entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public)
select 'community',c.id,c.slug,c.full_name,public.normalize_arabic_search(c.full_name),
  public.normalize_arabic_search(coalesce(c.headline,'') || ' ' || coalesce(pg_catalog.array_to_string(c.skills,' '),'') || ' ' || coalesce(pg_catalog.array_to_string(c.interests,' '),'')),
  case c.member_type when 'trainee' then 'متدرب' else 'متطوع' end,
  nullif(pg_catalog.left(coalesce(c.bio,c.headline,''),240),''),'/community/'||c.slug,null,true
from public.community_profiles c where c.is_active=true and c.verification='verified'::public.verification_status
on conflict(entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  normalized_terms=excluded.normalized_terms,subtitle=excluded.subtitle,excerpt=excluded.excerpt,
  destination=excluded.destination,is_public=true;

grant select on internal_search.catalog to anon,authenticated,service_role;
analyze internal_search.catalog;
