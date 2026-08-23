create or replace function internal_search.sync_specialist_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op='DELETE' then
    delete from internal_search.catalog where entity_type='specialist' and entity_id=old.id;
    return old;
  end if;
  if new.is_active=true and new.verification='verified'::public.verification_status then
    insert into internal_search.catalog(entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public)
    values(
      'specialist',new.id,new.slug,new.full_name,public.normalize_arabic_search(new.full_name),
      public.normalize_arabic_search(coalesce(new.professional_title,'') || ' ' || coalesce(pg_catalog.array_to_string(new.specialties,' '),'')),
      coalesce(new.professional_title,pg_catalog.array_to_string(new.specialties,'، ')),
      nullif(pg_catalog.left(coalesce(new.bio,''),240),''),'/specialists/'||new.slug,null,true
    )
    on conflict(entity_type,entity_id) do update set
      slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
      normalized_terms=excluded.normalized_terms,subtitle=excluded.subtitle,excerpt=excluded.excerpt,
      destination=excluded.destination,is_public=true;
  else
    delete from internal_search.catalog where entity_type='specialist' and entity_id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function internal_search.sync_specialist_catalog() from public;

drop trigger if exists specialist_search_catalog_sync on public.specialists;
create trigger specialist_search_catalog_sync
after insert or delete or update of slug,full_name,professional_title,specialties,bio,is_active,verification on public.specialists
for each row execute function internal_search.sync_specialist_catalog();

create or replace function internal_search.sync_center_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op='DELETE' then
    delete from internal_search.catalog where entity_type='center' and entity_id=old.id;
    return old;
  end if;
  if new.is_active=true and new.verification='verified'::public.verification_status then
    insert into internal_search.catalog(entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public)
    values(
      'center',new.id,new.slug,new.name,public.normalize_arabic_search(new.name),
      public.normalize_arabic_search(coalesce(new.city,'') || ' ' || coalesce(new.country,'') || ' ' || coalesce(pg_catalog.array_to_string(new.services,' '),'')),
      nullif(pg_catalog.concat_ws('، ',new.city,new.country),''),
      nullif(pg_catalog.left(coalesce(new.description,''),240),''),'/centers/'||new.slug,null,true
    )
    on conflict(entity_type,entity_id) do update set
      slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
      normalized_terms=excluded.normalized_terms,subtitle=excluded.subtitle,excerpt=excluded.excerpt,
      destination=excluded.destination,is_public=true;
  else
    delete from internal_search.catalog where entity_type='center' and entity_id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function internal_search.sync_center_catalog() from public;

drop trigger if exists center_search_catalog_sync on public.centers;
create trigger center_search_catalog_sync
after insert or delete or update of slug,name,city,country,services,description,is_active,verification on public.centers
for each row execute function internal_search.sync_center_catalog();

create or replace function internal_search.sync_community_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op='DELETE' then
    delete from internal_search.catalog where entity_type='community' and entity_id=old.id;
    return old;
  end if;
  if new.is_active=true and new.verification='verified'::public.verification_status then
    insert into internal_search.catalog(entity_type,entity_id,slug,title,normalized_title,normalized_terms,subtitle,excerpt,destination,published_at,is_public)
    values(
      'community',new.id,new.slug,new.full_name,public.normalize_arabic_search(new.full_name),
      public.normalize_arabic_search(coalesce(new.headline,'') || ' ' || coalesce(pg_catalog.array_to_string(new.skills,' '),'') || ' ' || coalesce(pg_catalog.array_to_string(new.interests,' '),'')),
      case new.member_type when 'trainee' then 'متدرب' else 'متطوع' end,
      nullif(pg_catalog.left(coalesce(new.bio,new.headline,''),240),''),'/community/'||new.slug,null,true
    )
    on conflict(entity_type,entity_id) do update set
      slug=excluded.slug,title=excluded.title,normalized_title=excluded.normalized_title,
      normalized_terms=excluded.normalized_terms,subtitle=excluded.subtitle,excerpt=excluded.excerpt,
      destination=excluded.destination,is_public=true;
  else
    delete from internal_search.catalog where entity_type='community' and entity_id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function internal_search.sync_community_catalog() from public;

drop trigger if exists community_search_catalog_sync on public.community_profiles;
create trigger community_search_catalog_sync
after insert or delete or update of slug,full_name,headline,skills,interests,bio,is_active,verification,member_type on public.community_profiles
for each row execute function internal_search.sync_community_catalog();
