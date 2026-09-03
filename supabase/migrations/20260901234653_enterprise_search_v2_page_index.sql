create or replace function internal_search_v2.compose_page_search_text(
  p_title text,
  p_subtitle text,
  p_excerpt text,
  p_high_priority_terms text,
  p_body_text text
)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select pg_catalog.btrim(pg_catalog.concat_ws(
    E'\n',
    nullif(pg_catalog.btrim(coalesce(p_title,'')),''),
    nullif(pg_catalog.btrim(coalesce(p_subtitle,'')),''),
    nullif(pg_catalog.btrim(coalesce(p_excerpt,'')),''),
    nullif(pg_catalog.btrim(coalesce(p_high_priority_terms,'')),''),
    nullif(pg_catalog.btrim(coalesce(p_body_text,'')), '')
  ));
$$;

revoke all on function internal_search_v2.compose_page_search_text(text,text,text,text,text) from public;

insert into internal_search_v2.pages (
  entity_type,entity_id,slug,title,normalized_title,high_priority_terms,search_text,
  subtitle,excerpt,destination,published_at,source_updated_at,is_public,content_hash,updated_at
)
select
  s.entity_type,s.entity_id,s.slug,s.title,s.normalized_title,s.normalized_terms,
  internal_search_v2.compose_page_search_text(
    s.title,s.subtitle,s.excerpt,s.normalized_terms,
    case when s.entity_type='content' then c.body_text else null end
  ),
  s.subtitle,s.excerpt,s.destination,s.published_at,
  case when s.entity_type='content' then c.updated_at else null end,
  s.is_public,
  pg_catalog.md5(internal_search_v2.compose_page_search_text(
    s.title,s.subtitle,s.excerpt,s.normalized_terms,
    case when s.entity_type='content' then c.body_text else null end
  )),
  pg_catalog.now()
from internal_search.catalog s
left join public.content c on s.entity_type='content' and c.id=s.entity_id
where s.is_public=true
  and (s.published_at is null or s.published_at<=pg_catalog.now())
on conflict (entity_type,entity_id) do update set
  slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
  high_priority_terms=excluded.high_priority_terms,search_text=excluded.search_text,
  subtitle=excluded.subtitle,excerpt=excluded.excerpt,destination=excluded.destination,
  published_at=excluded.published_at,source_updated_at=excluded.source_updated_at,
  is_public=excluded.is_public,content_hash=excluded.content_hash,updated_at=pg_catalog.now();

create or replace function internal_search_v2.sync_catalog_page()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  body_value text;
  source_updated timestamptz;
  composed text;
begin
  if tg_op='DELETE' then
    delete from internal_search_v2.pages where entity_type=old.entity_type and entity_id=old.entity_id;
    delete from internal_search_v2.chunks where entity_type=old.entity_type and entity_id=old.entity_id;
    return old;
  end if;

  if new.is_public is distinct from true
     or (new.published_at is not null and new.published_at>pg_catalog.now()) then
    delete from internal_search_v2.pages where entity_type=new.entity_type and entity_id=new.entity_id;
    delete from internal_search_v2.chunks where entity_type=new.entity_type and entity_id=new.entity_id;
    return new;
  end if;

  if new.entity_type='content' then
    select c.body_text,c.updated_at into body_value,source_updated
    from public.content c where c.id=new.entity_id;
  end if;

  composed := internal_search_v2.compose_page_search_text(
    new.title,new.subtitle,new.excerpt,new.normalized_terms,body_value
  );

  insert into internal_search_v2.pages (
    entity_type,entity_id,slug,title,normalized_title,high_priority_terms,search_text,
    subtitle,excerpt,destination,published_at,source_updated_at,is_public,content_hash,updated_at
  ) values (
    new.entity_type,new.entity_id,new.slug,new.title,new.normalized_title,new.normalized_terms,composed,
    new.subtitle,new.excerpt,new.destination,new.published_at,source_updated,true,pg_catalog.md5(composed),pg_catalog.now()
  )
  on conflict (entity_type,entity_id) do update set
    slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
    high_priority_terms=excluded.high_priority_terms,search_text=excluded.search_text,
    subtitle=excluded.subtitle,excerpt=excluded.excerpt,destination=excluded.destination,
    published_at=excluded.published_at,source_updated_at=excluded.source_updated_at,
    is_public=true,content_hash=excluded.content_hash,updated_at=pg_catalog.now();

  return new;
end;
$$;

revoke all on function internal_search_v2.sync_catalog_page() from public;

drop trigger if exists search_v2_sync_catalog_page on internal_search.catalog;
create trigger search_v2_sync_catalog_page
after insert or update or delete on internal_search.catalog
for each row execute function internal_search_v2.sync_catalog_page();

create or replace function internal_search_v2.sync_content_body()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  p internal_search_v2.pages%rowtype;
  composed text;
begin
  select * into p from internal_search_v2.pages
  where entity_type='content' and entity_id=new.id;
  if not found then return new; end if;

  composed := internal_search_v2.compose_page_search_text(
    p.title,p.subtitle,p.excerpt,p.high_priority_terms,new.body_text
  );

  update internal_search_v2.pages
  set search_text=composed,source_updated_at=new.updated_at,
      content_hash=pg_catalog.md5(composed),updated_at=pg_catalog.now()
  where entity_type='content' and entity_id=new.id;
  return new;
end;
$$;

revoke all on function internal_search_v2.sync_content_body() from public;

drop trigger if exists search_v2_sync_content_body on public.content;
create trigger search_v2_sync_content_body
after update of body_text on public.content
for each row
when (old.body_text is distinct from new.body_text)
execute function internal_search_v2.sync_content_body();

analyze internal_search_v2.pages;
