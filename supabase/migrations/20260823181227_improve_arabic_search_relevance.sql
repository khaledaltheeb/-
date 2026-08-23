create or replace function public.normalize_arabic_search(p_value text)
returns text
language sql
immutable
parallel safe
security invoker
set search_path = ''
as $$
  select pg_catalog.btrim(
    pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(
        pg_catalog.replace(
          pg_catalog.replace(
            pg_catalog.replace(
              pg_catalog.replace(
                pg_catalog.replace(
                  pg_catalog.replace(
                    pg_catalog.replace(
                      pg_catalog.replace(
                        pg_catalog.lower(coalesce(p_value, ''::text)),
                        'أ', 'ا'
                      ),
                      'إ', 'ا'
                    ),
                    'آ', 'ا'
                  ),
                  'ٱ', 'ا'
                ),
                'ى', 'ي'
              ),
              'ة', 'ه'
            ),
            'ؤ', 'و'
          ),
          'ئ', 'ي'
        ),
        '[ًٌٍَُِّْـٰ]', '', 'g'
      ),
      '[[:space:]،,؛;:!?؟._/\\-]+', ' ', 'g'
    )
  );
$$;

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
    select
      pg_catalog.btrim(pg_catalog.left(coalesce(p_query, ''::text), 160)) as q,
      public.normalize_arabic_search(pg_catalog.btrim(pg_catalog.left(coalesce(p_query, ''::text), 160))) as nq,
      greatest(1, least(coalesce(p_limit, 30), 100)) as lim
  ),
  content_results as (
    select
      'content'::text as entity_type,
      c.id as entity_id,
      c.slug,
      c.title,
      c.content_type as subtitle,
      coalesce(c.excerpt, pg_catalog.left(coalesce(c.body_text, ''::text), 240)) as excerpt,
      '/content/' || c.slug as destination,
      (
        case
          when n.ntitle = i.nq then 360.0
          when n.nprimary = i.nq then 350.0
          when n.naliases = i.nq or n.nsecondary = i.nq then 330.0
          when n.ntitle like '%' || i.nq || '%' then 305.0
          when n.nprimary like '%' || i.nq || '%' then 295.0
          when n.naliases like '%' || i.nq || '%' then 280.0
          when n.nsecondary like '%' || i.nq || '%' then 270.0
          when n.nsemantic like '%' || i.nq || '%' then 250.0
          else 120.0
        end
        + greatest(
            coalesce(pg_catalog.ts_rank_cd(c.search_vector, pg_catalog.plainto_tsquery('pg_catalog.simple'::regconfig, i.q)), 0)::double precision * 18.0,
            extensions.similarity(n.ntitle, i.nq)::double precision * 120.0,
            coalesce(extensions.similarity(n.nprimary, i.nq), 0)::double precision * 110.0,
            coalesce(extensions.similarity(n.nsecondary, i.nq), 0)::double precision * 90.0,
            coalesce(extensions.similarity(n.nsemantic, i.nq), 0)::double precision * 80.0,
            coalesce(extensions.similarity(n.naliases, i.nq), 0)::double precision * 95.0
          )
      )::double precision as score
    from public.content c
    cross join input i
    cross join lateral (
      select
        public.normalize_arabic_search(c.title) as ntitle,
        public.normalize_arabic_search(c.primary_keyword) as nprimary,
        public.normalize_arabic_search(pg_catalog.array_to_string(c.secondary_keywords, ' ')) as nsecondary,
        public.normalize_arabic_search(pg_catalog.array_to_string(c.semantic_terms, ' ')) as nsemantic,
        public.normalize_arabic_search(pg_catalog.array_to_string(c.search_aliases, ' ')) as naliases
    ) n
    where i.nq <> ''
      and c.status = 'published'::public.content_status
      and c.published_at is not null
      and c.published_at <= pg_catalog.now()
      and (
        c.search_vector @@ pg_catalog.plainto_tsquery('pg_catalog.simple'::regconfig, i.q)
        or n.ntitle = i.nq
        or n.nprimary = i.nq
        or n.ntitle like '%' || i.nq || '%'
        or n.nprimary like '%' || i.nq || '%'
        or n.naliases like '%' || i.nq || '%'
        or n.nsecondary like '%' || i.nq || '%'
        or n.nsemantic like '%' || i.nq || '%'
        or extensions.similarity(n.ntitle, i.nq) > 0.12
        or extensions.similarity(n.nprimary, i.nq) > 0.12
        or extensions.similarity(n.nsecondary, i.nq) > 0.12
        or extensions.similarity(n.nsemantic, i.nq) > 0.12
        or extensions.similarity(n.naliases, i.nq) > 0.12
      )
  ),
  sector_results as (
    select 'sector'::text,s.id,s.slug,s.name_ar,'قطاع'::text,s.description,'/sectors/'||s.slug,
      (case when n.nname=i.nq then 430.0 when n.nname like '%'||i.nq||'%' then 350.0 else 210.0 end
       + extensions.similarity(n.nname,i.nq)::double precision*120.0)::double precision
    from public.sectors s cross join input i
    cross join lateral (select public.normalize_arabic_search(s.name_ar) as nname) n
    where i.nq<>'' and s.is_active=true and s.visibility='public'
      and (n.nname=i.nq or n.nname like '%'||i.nq||'%' or extensions.similarity(n.nname,i.nq)>0.12)
  ),
  category_results as (
    select 'category'::text,c.id,c.slug,c.name_ar,'قسم'::text,c.description,'/sections/'||c.slug,
      (case when n.nname=i.nq then 420.0 when n.nname like '%'||i.nq||'%' then 340.0 else 205.0 end
       + extensions.similarity(n.nname,i.nq)::double precision*115.0)::double precision
    from public.categories c cross join input i
    cross join lateral (select public.normalize_arabic_search(c.name_ar) as nname) n
    where i.nq<>'' and c.is_active=true and c.visibility='public'
      and (n.nname=i.nq or n.nname like '%'||i.nq||'%' or extensions.similarity(n.nname,i.nq)>0.12)
  ),
  specialist_results as (
    select 'specialist'::text,s.id,s.slug,s.full_name,
      coalesce(s.professional_title,pg_catalog.array_to_string(s.specialties,'، ')) as subtitle,
      nullif(pg_catalog.left(coalesce(s.bio,''::text),240),'') as excerpt,'/specialists/'||s.slug,
      (case when n.nname=i.nq then 400.0 when n.nname like '%'||i.nq||'%' then 330.0 when n.ntitle like '%'||i.nq||'%' then 285.0 else 190.0 end
       + greatest(extensions.similarity(n.nname,i.nq)::double precision*110.0,extensions.similarity(n.ntitle,i.nq)::double precision*90.0,extensions.similarity(n.nspecialties,i.nq)::double precision*85.0))::double precision
    from public.specialists s cross join input i
    cross join lateral (select public.normalize_arabic_search(s.full_name) as nname,public.normalize_arabic_search(s.professional_title) as ntitle,public.normalize_arabic_search(pg_catalog.array_to_string(s.specialties,' ')) as nspecialties) n
    where i.nq<>'' and s.is_active=true and s.verification='verified'::public.verification_status
      and (n.nname=i.nq or n.nname like '%'||i.nq||'%' or n.ntitle like '%'||i.nq||'%' or n.nspecialties like '%'||i.nq||'%' or extensions.similarity(n.nname,i.nq)>0.12 or extensions.similarity(n.ntitle,i.nq)>0.12 or extensions.similarity(n.nspecialties,i.nq)>0.12)
  ),
  center_results as (
    select 'center'::text,c.id,c.slug,c.name,nullif(pg_catalog.concat_ws('، ',c.city,c.country),'') as subtitle,
      nullif(pg_catalog.left(coalesce(c.description,''::text),240),'') as excerpt,'/centers/'||c.slug,
      (case when n.nname=i.nq then 400.0 when n.nname like '%'||i.nq||'%' then 330.0 when n.nservices like '%'||i.nq||'%' then 275.0 else 185.0 end
       + greatest(extensions.similarity(n.nname,i.nq)::double precision*110.0,extensions.similarity(n.ncity,i.nq)::double precision*75.0,extensions.similarity(n.nservices,i.nq)::double precision*85.0))::double precision
    from public.centers c cross join input i
    cross join lateral (select public.normalize_arabic_search(c.name) as nname,public.normalize_arabic_search(c.city) as ncity,public.normalize_arabic_search(pg_catalog.array_to_string(c.services,' ')) as nservices) n
    where i.nq<>'' and c.is_active=true and c.verification='verified'::public.verification_status
      and (n.nname=i.nq or n.nname like '%'||i.nq||'%' or n.ncity like '%'||i.nq||'%' or n.nservices like '%'||i.nq||'%' or extensions.similarity(n.nname,i.nq)>0.12 or extensions.similarity(n.ncity,i.nq)>0.12 or extensions.similarity(n.nservices,i.nq)>0.12)
  ),
  community_results as (
    select 'community'::text,c.id,c.slug,c.full_name,case c.member_type when 'trainee' then 'متدرب' else 'متطوع' end as subtitle,
      nullif(pg_catalog.left(coalesce(c.bio,c.headline,''::text),240),'') as excerpt,'/community/'||c.slug,
      (case when n.nname=i.nq then 390.0 when n.nname like '%'||i.nq||'%' then 320.0 when n.nheadline like '%'||i.nq||'%' then 270.0 else 180.0 end
       + greatest(extensions.similarity(n.nname,i.nq)::double precision*105.0,extensions.similarity(n.nheadline,i.nq)::double precision*80.0,extensions.similarity(n.nskills,i.nq)::double precision*80.0,extensions.similarity(n.ninterests,i.nq)::double precision*75.0))::double precision
    from public.community_profiles c cross join input i
    cross join lateral (select public.normalize_arabic_search(c.full_name) as nname,public.normalize_arabic_search(c.headline) as nheadline,public.normalize_arabic_search(pg_catalog.array_to_string(c.skills,' ')) as nskills,public.normalize_arabic_search(pg_catalog.array_to_string(c.interests,' ')) as ninterests) n
    where i.nq<>'' and c.is_active=true and c.verification='verified'::public.verification_status
      and (n.nname=i.nq or n.nname like '%'||i.nq||'%' or n.nheadline like '%'||i.nq||'%' or n.nskills like '%'||i.nq||'%' or n.ninterests like '%'||i.nq||'%' or extensions.similarity(n.nname,i.nq)>0.12 or extensions.similarity(n.nheadline,i.nq)>0.12 or extensions.similarity(n.nskills,i.nq)>0.12 or extensions.similarity(n.ninterests,i.nq)>0.12)
  ),
  combined as (
    select * from content_results
    union all select * from sector_results
    union all select * from category_results
    union all select * from specialist_results
    union all select * from center_results
    union all select * from community_results
  )
  select c.entity_type,c.entity_id,c.slug,c.title,c.subtitle,c.excerpt,c.destination,c.score
  from combined c cross join input i
  order by c.score desc,c.title asc
  limit (select lim from input);
$$;

revoke all on function public.normalize_arabic_search(text) from public;
grant execute on function public.normalize_arabic_search(text) to anon,authenticated,service_role;

revoke all on function public.search_platform(text,integer) from public;
grant execute on function public.search_platform(text,integer) to anon,authenticated,service_role;
