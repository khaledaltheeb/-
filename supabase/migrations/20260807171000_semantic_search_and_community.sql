create index if not exists community_profiles_name_trgm_idx on public.community_profiles using gin (full_name extensions.gin_trgm_ops);

create or replace function public.refresh_content_search_vector()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_vector := pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(new.title, '')), 'A') ||
    pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(new.primary_keyword, '')), 'A') ||
    pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(pg_catalog.array_to_string(new.secondary_keywords, ' '), '')), 'B') ||
    pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(pg_catalog.array_to_string(new.semantic_terms, ' '), '')), 'B') ||
    pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(pg_catalog.array_to_string(new.search_aliases, ' '), '')), 'B') ||
    pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(new.excerpt, '')), 'C') ||
    pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(new.body_text, '')), 'D');
  return new;
end;
$$;

drop trigger if exists content_search_vector_updated on public.content;
create trigger content_search_vector_updated
before insert or update of title, excerpt, body_text, search_aliases, primary_keyword, secondary_keywords, semantic_terms on public.content
for each row execute function public.refresh_content_search_vector();

update public.content set search_vector =
  pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(title, '')), 'A') ||
  pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(primary_keyword, '')), 'A') ||
  pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(pg_catalog.array_to_string(secondary_keywords, ' '), '')), 'B') ||
  pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(pg_catalog.array_to_string(semantic_terms, ' '), '')), 'B') ||
  pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(pg_catalog.array_to_string(search_aliases, ' '), '')), 'B') ||
  pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(excerpt, '')), 'C') ||
  pg_catalog.setweight(pg_catalog.to_tsvector('pg_catalog.simple'::regconfig, coalesce(body_text, '')), 'D');

create or replace function public.search_platform(p_query text, p_limit integer default 30)
returns table (
  entity_type text,
  entity_id uuid,
  slug text,
  title text,
  subtitle text,
  excerpt text,
  destination text,
  score double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  with input as (
    select trim(left(coalesce(p_query, ''), 160)) as q, greatest(1, least(coalesce(p_limit, 30), 50)) as lim
  ),
  content_results as (
    select 'content'::text as entity_type,c.id as entity_id,c.slug,c.title,c.content_type as subtitle,
      coalesce(c.excerpt,left(coalesce(c.body_text,''),240)) as excerpt,'/content/'||c.slug as destination,
      greatest(
        coalesce(pg_catalog.ts_rank_cd(c.search_vector,pg_catalog.plainto_tsquery('pg_catalog.simple'::regconfig,i.q)),0)::double precision,
        extensions.similarity(c.title,i.q)::double precision,
        coalesce(extensions.similarity(c.primary_keyword,i.q),0)::double precision,
        coalesce(extensions.similarity(pg_catalog.array_to_string(c.secondary_keywords,' '),i.q),0)::double precision,
        coalesce(extensions.similarity(pg_catalog.array_to_string(c.semantic_terms,' '),i.q),0)::double precision,
        coalesce(extensions.similarity(pg_catalog.array_to_string(c.search_aliases,' '),i.q),0)::double precision
      ) + case when lower(c.title)=lower(i.q) then 1.0 else 0 end as score
    from public.content c cross join input i
    where i.q<>'' and c.status='published'::public.content_status and c.published_at is not null and c.published_at<=now()
      and (c.search_vector @@ pg_catalog.plainto_tsquery('pg_catalog.simple'::regconfig,i.q) or extensions.similarity(c.title,i.q)>0.12 or extensions.similarity(coalesce(c.primary_keyword,''),i.q)>0.12 or extensions.similarity(pg_catalog.array_to_string(c.secondary_keywords,' '),i.q)>0.12 or extensions.similarity(pg_catalog.array_to_string(c.semantic_terms,' '),i.q)>0.12 or c.title ilike '%'||i.q||'%')
  ),
  sector_results as (
    select 'sector'::text,s.id,s.slug,s.name_ar,'قطاع'::text,s.description,'/sectors/'||s.slug,
      greatest(extensions.similarity(s.name_ar,i.q),case when s.name_ar ilike '%'||i.q||'%' then 0.7 else 0 end)::double precision
    from public.sectors s cross join input i
    where i.q<>'' and s.is_active=true and s.visibility='public' and (extensions.similarity(s.name_ar,i.q)>0.12 or s.name_ar ilike '%'||i.q||'%')
  ),
  category_results as (
    select 'category'::text,c.id,c.slug,c.name_ar,'قسم'::text,c.description,'/sections/'||c.slug,
      greatest(extensions.similarity(c.name_ar,i.q),case when c.name_ar ilike '%'||i.q||'%' then 0.7 else 0 end)::double precision
    from public.categories c cross join input i
    where i.q<>'' and c.is_active=true and c.visibility='public' and (extensions.similarity(c.name_ar,i.q)>0.12 or c.name_ar ilike '%'||i.q||'%')
  ),
  specialist_results as (
    select 'specialist'::text,s.id,s.slug,s.full_name,coalesce(s.professional_title,pg_catalog.array_to_string(s.specialties,'، ')) as subtitle,
      nullif(left(coalesce(s.bio,''),240),'') as excerpt,'/specialists/'||s.slug,
      greatest(extensions.similarity(s.full_name,i.q),coalesce(extensions.similarity(s.professional_title,i.q),0),coalesce(extensions.similarity(pg_catalog.array_to_string(s.specialties,' '),i.q),0),case when s.full_name ilike '%'||i.q||'%' then 0.75 else 0 end)::double precision
    from public.specialists s cross join input i
    where i.q<>'' and s.is_active=true and s.verification='verified'::public.verification_status and (extensions.similarity(s.full_name,i.q)>0.12 or extensions.similarity(coalesce(s.professional_title,''),i.q)>0.12 or extensions.similarity(pg_catalog.array_to_string(s.specialties,' '),i.q)>0.12 or s.full_name ilike '%'||i.q||'%' or coalesce(s.professional_title,'') ilike '%'||i.q||'%')
  ),
  center_results as (
    select 'center'::text,c.id,c.slug,c.name,nullif(pg_catalog.concat_ws('، ',c.city,c.country),'') as subtitle,
      nullif(left(coalesce(c.description,''),240),'') as excerpt,'/centers/'||c.slug,
      greatest(extensions.similarity(c.name,i.q),coalesce(extensions.similarity(c.city,i.q),0),coalesce(extensions.similarity(pg_catalog.array_to_string(c.services,' '),i.q),0),case when c.name ilike '%'||i.q||'%' then 0.75 else 0 end)::double precision
    from public.centers c cross join input i
    where i.q<>'' and c.is_active=true and c.verification='verified'::public.verification_status and (extensions.similarity(c.name,i.q)>0.12 or extensions.similarity(coalesce(c.city,''),i.q)>0.12 or extensions.similarity(pg_catalog.array_to_string(c.services,' '),i.q)>0.12 or c.name ilike '%'||i.q||'%')
  ),
  community_results as (
    select 'community'::text,c.id,c.slug,c.full_name,case c.member_type when 'trainee' then 'متدرب' else 'متطوع' end as subtitle,
      nullif(left(coalesce(c.bio,c.headline,''),240),'') as excerpt,'/community/'||c.slug,
      greatest(extensions.similarity(c.full_name,i.q),coalesce(extensions.similarity(c.headline,i.q),0),coalesce(extensions.similarity(pg_catalog.array_to_string(c.skills,' '),i.q),0),coalesce(extensions.similarity(pg_catalog.array_to_string(c.interests,' '),i.q),0),case when c.full_name ilike '%'||i.q||'%' then 0.7 else 0 end)::double precision
    from public.community_profiles c cross join input i
    where i.q<>'' and c.is_active=true and c.verification='verified'::public.verification_status and (extensions.similarity(c.full_name,i.q)>0.12 or extensions.similarity(coalesce(c.headline,''),i.q)>0.12 or extensions.similarity(pg_catalog.array_to_string(c.skills,' '),i.q)>0.12 or extensions.similarity(pg_catalog.array_to_string(c.interests,' '),i.q)>0.12 or c.full_name ilike '%'||i.q||'%')
  ),
  combined as (
    select * from content_results union all select * from sector_results union all select * from category_results union all select * from specialist_results union all select * from center_results union all select * from community_results
  )
  select c.entity_type,c.entity_id,c.slug,c.title,c.subtitle,c.excerpt,c.destination,c.score
  from combined c cross join input i
  order by c.score desc,c.title asc
  limit (select lim from input);
$$;

revoke all on function public.search_platform(text,integer) from public;
grant execute on function public.search_platform(text,integer) to anon,authenticated,service_role;
