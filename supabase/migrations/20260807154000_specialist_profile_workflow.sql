alter table public.specialists
  drop constraint if exists specialists_user_id_unique;
alter table public.specialists
  add constraint specialists_user_id_unique unique (user_id);

alter table public.specialists
  drop constraint if exists specialists_slug_format;
alter table public.specialists
  add constraint specialists_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

alter table public.specialists
  drop constraint if exists specialists_years_experience_range;
alter table public.specialists
  add constraint specialists_years_experience_range check (years_experience is null or years_experience between 0 and 80);

alter table public.specialists
  drop constraint if exists specialists_latitude_range;
alter table public.specialists
  add constraint specialists_latitude_range check (latitude is null or latitude between -90 and 90);

alter table public.specialists
  drop constraint if exists specialists_longitude_range;
alter table public.specialists
  add constraint specialists_longitude_range check (longitude is null or longitude between -180 and 180);

create or replace function private.get_my_specialist_profile()
returns table (
  id uuid,
  slug text,
  full_name text,
  professional_title text,
  bio text,
  email text,
  phone text,
  website_url text,
  country text,
  region text,
  city text,
  latitude double precision,
  longitude double precision,
  languages text[],
  specialties text[],
  qualifications jsonb,
  license_number text,
  years_experience integer,
  offers_remote boolean,
  offers_in_person boolean,
  show_email boolean,
  show_phone boolean,
  show_map boolean,
  verification public.verification_status,
  verified_at timestamptz,
  is_active boolean,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.id,s.slug,s.full_name,s.professional_title,s.bio,s.email,s.phone,s.website_url,
    s.country,s.region,s.city,s.latitude,s.longitude,s.languages,s.specialties,s.qualifications,
    s.license_number,s.years_experience,s.offers_remote,s.offers_in_person,
    s.show_email,s.show_phone,s.show_map,s.verification,s.verified_at,s.is_active,s.updated_at
  from public.specialists s
  where s.user_id = (select auth.uid())
  limit 1;
$$;

create or replace function private.upsert_my_specialist_profile(
  p_slug text,
  p_full_name text,
  p_professional_title text default null,
  p_bio text default null,
  p_email text default null,
  p_phone text default null,
  p_website_url text default null,
  p_country text default null,
  p_region text default null,
  p_city text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_languages text[] default '{}'::text[],
  p_specialties text[] default '{}'::text[],
  p_qualifications text[] default '{}'::text[],
  p_license_number text default null,
  p_years_experience integer default null,
  p_offers_remote boolean default false,
  p_offers_in_person boolean default true,
  p_show_email boolean default false,
  p_show_phone boolean default false,
  p_show_map boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_role public.app_role;
  v_id uuid;
  v_old public.specialists%rowtype;
  v_new_verification public.verification_status;
  v_qualifications jsonb := coalesce(to_jsonb(p_qualifications), '[]'::jsonb);
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  if v_role not in ('specialist','owner','admin') then raise exception 'specialist role required'; end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug) > 140 then raise exception 'invalid slug'; end if;
  if p_full_name is null or length(trim(p_full_name)) < 3 or length(p_full_name) > 200 then raise exception 'invalid full name'; end if;
  if p_years_experience is not null and (p_years_experience < 0 or p_years_experience > 80) then raise exception 'invalid experience'; end if;
  if p_latitude is not null and (p_latitude < -90 or p_latitude > 90) then raise exception 'invalid latitude'; end if;
  if p_longitude is not null and (p_longitude < -180 or p_longitude > 180) then raise exception 'invalid longitude'; end if;

  select * into v_old from public.specialists where user_id = v_uid;

  if v_old.id is null then
    v_new_verification := 'pending'::public.verification_status;
    insert into public.specialists(
      user_id,slug,full_name,professional_title,bio,email,phone,website_url,country,region,city,
      latitude,longitude,languages,specialties,qualifications,license_number,years_experience,
      offers_remote,offers_in_person,show_email,show_phone,show_map,verification,is_active
    ) values (
      v_uid,p_slug,trim(p_full_name),nullif(trim(p_professional_title),''),nullif(trim(p_bio),''),
      nullif(trim(p_email),''),nullif(trim(p_phone),''),nullif(trim(p_website_url),''),
      nullif(trim(p_country),''),nullif(trim(p_region),''),nullif(trim(p_city),''),
      p_latitude,p_longitude,coalesce(p_languages,'{}'::text[]),coalesce(p_specialties,'{}'::text[]),
      v_qualifications,nullif(trim(p_license_number),''),p_years_experience,
      p_offers_remote,p_offers_in_person,p_show_email,p_show_phone,p_show_map,v_new_verification,true
    ) returning id into v_id;
  else
    v_new_verification := v_old.verification;
    if v_old.verification = 'verified'::public.verification_status and (
      v_old.full_name is distinct from trim(p_full_name)
      or v_old.professional_title is distinct from nullif(trim(p_professional_title),'')
      or v_old.specialties is distinct from coalesce(p_specialties,'{}'::text[])
      or v_old.qualifications is distinct from v_qualifications
      or v_old.license_number is distinct from nullif(trim(p_license_number),'')
    ) then
      v_new_verification := 'pending'::public.verification_status;
    end if;

    update public.specialists set
      slug=p_slug,full_name=trim(p_full_name),professional_title=nullif(trim(p_professional_title),''),
      bio=nullif(trim(p_bio),''),email=nullif(trim(p_email),''),phone=nullif(trim(p_phone),''),
      website_url=nullif(trim(p_website_url),''),country=nullif(trim(p_country),''),region=nullif(trim(p_region),''),
      city=nullif(trim(p_city),''),latitude=p_latitude,longitude=p_longitude,
      languages=coalesce(p_languages,'{}'::text[]),specialties=coalesce(p_specialties,'{}'::text[]),
      qualifications=v_qualifications,license_number=nullif(trim(p_license_number),''),years_experience=p_years_experience,
      offers_remote=p_offers_remote,offers_in_person=p_offers_in_person,
      show_email=p_show_email,show_phone=p_show_phone,show_map=p_show_map,
      verification=v_new_verification,
      verified_at=case when v_new_verification='verified'::public.verification_status then verified_at else null end,
      verified_by=case when v_new_verification='verified'::public.verification_status then verified_by else null end
    where id=v_old.id returning id into v_id;
  end if;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_uid,'specialist',v_id::text,'profile_upsert',jsonb_build_object('verification',v_new_verification,'slug',p_slug));

  return v_id;
end;
$$;

create or replace function private.admin_specialist_queue(p_limit integer default 200)
returns table (
  id uuid,
  user_id uuid,
  slug text,
  full_name text,
  professional_title text,
  bio text,
  email text,
  phone text,
  website_url text,
  country text,
  region text,
  city text,
  languages text[],
  specialties text[],
  qualifications jsonb,
  license_number text,
  years_experience integer,
  verification public.verification_status,
  verified_at timestamptz,
  is_active boolean,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  return query
  select s.id,s.user_id,s.slug,s.full_name,s.professional_title,s.bio,s.email,s.phone,s.website_url,
         s.country,s.region,s.city,s.languages,s.specialties,s.qualifications,s.license_number,
         s.years_experience,s.verification,s.verified_at,s.is_active,s.updated_at
  from public.specialists s
  order by
    case s.verification when 'pending'::public.verification_status then 0 when 'unverified'::public.verification_status then 1 else 2 end,
    s.updated_at desc
  limit greatest(1,least(coalesce(p_limit,200),500));
end;
$$;

create or replace function private.set_specialist_verification(
  p_id uuid,
  p_status public.verification_status,
  p_is_active boolean default true
)
returns public.verification_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous public.verification_status;
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  if p_status not in ('unverified','pending','verified','rejected','suspended') then raise exception 'invalid status'; end if;
  select verification into v_previous from public.specialists where id=p_id;
  if v_previous is null then raise exception 'specialist not found'; end if;

  update public.specialists set
    verification=p_status,
    is_active=p_is_active,
    verified_at=case when p_status='verified'::public.verification_status then now() else null end,
    verified_by=case when p_status='verified'::public.verification_status then (select auth.uid()) else null end
  where id=p_id;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values((select auth.uid()),'specialist',p_id::text,'verification_change',jsonb_build_object('verification',v_previous),jsonb_build_object('verification',p_status,'is_active',p_is_active));
  return p_status;
end;
$$;

revoke all on function private.get_my_specialist_profile() from public;
revoke all on function private.upsert_my_specialist_profile(text,text,text,text,text,text,text,text,text,text,double precision,double precision,text[],text[],text[],text,integer,boolean,boolean,boolean,boolean,boolean) from public;
revoke all on function private.admin_specialist_queue(integer) from public;
revoke all on function private.set_specialist_verification(uuid,public.verification_status,boolean) from public;

grant usage on schema private to authenticated;
grant execute on function private.get_my_specialist_profile() to authenticated;
grant execute on function private.upsert_my_specialist_profile(text,text,text,text,text,text,text,text,text,text,double precision,double precision,text[],text[],text[],text,integer,boolean,boolean,boolean,boolean,boolean) to authenticated;
grant execute on function private.admin_specialist_queue(integer) to authenticated;
grant execute on function private.set_specialist_verification(uuid,public.verification_status,boolean) to authenticated;

create or replace function public.get_my_specialist_profile()
returns table (
  id uuid,slug text,full_name text,professional_title text,bio text,email text,phone text,website_url text,
  country text,region text,city text,latitude double precision,longitude double precision,languages text[],specialties text[],
  qualifications jsonb,license_number text,years_experience integer,offers_remote boolean,offers_in_person boolean,
  show_email boolean,show_phone boolean,show_map boolean,verification public.verification_status,verified_at timestamptz,
  is_active boolean,updated_at timestamptz
)
language sql stable security invoker set search_path=''
as $$ select * from private.get_my_specialist_profile(); $$;

create or replace function public.upsert_my_specialist_profile(
  p_slug text,p_full_name text,p_professional_title text default null,p_bio text default null,p_email text default null,
  p_phone text default null,p_website_url text default null,p_country text default null,p_region text default null,p_city text default null,
  p_latitude double precision default null,p_longitude double precision default null,p_languages text[] default '{}'::text[],
  p_specialties text[] default '{}'::text[],p_qualifications text[] default '{}'::text[],p_license_number text default null,
  p_years_experience integer default null,p_offers_remote boolean default false,p_offers_in_person boolean default true,
  p_show_email boolean default false,p_show_phone boolean default false,p_show_map boolean default false
)
returns uuid
language sql security invoker set search_path=''
as $$ select private.upsert_my_specialist_profile(p_slug,p_full_name,p_professional_title,p_bio,p_email,p_phone,p_website_url,p_country,p_region,p_city,p_latitude,p_longitude,p_languages,p_specialties,p_qualifications,p_license_number,p_years_experience,p_offers_remote,p_offers_in_person,p_show_email,p_show_phone,p_show_map); $$;

create or replace function public.admin_specialist_queue(p_limit integer default 200)
returns table (
  id uuid,user_id uuid,slug text,full_name text,professional_title text,bio text,email text,phone text,website_url text,
  country text,region text,city text,languages text[],specialties text[],qualifications jsonb,license_number text,
  years_experience integer,verification public.verification_status,verified_at timestamptz,is_active boolean,updated_at timestamptz
)
language sql stable security invoker set search_path=''
as $$ select * from private.admin_specialist_queue(p_limit); $$;

create or replace function public.set_specialist_verification(p_id uuid,p_status public.verification_status,p_is_active boolean default true)
returns public.verification_status
language sql security invoker set search_path=''
as $$ select private.set_specialist_verification(p_id,p_status,p_is_active); $$;

revoke all on function public.get_my_specialist_profile() from public,anon;
revoke all on function public.upsert_my_specialist_profile(text,text,text,text,text,text,text,text,text,text,double precision,double precision,text[],text[],text[],text,integer,boolean,boolean,boolean,boolean,boolean) from public,anon;
revoke all on function public.admin_specialist_queue(integer) from public,anon;
revoke all on function public.set_specialist_verification(uuid,public.verification_status,boolean) from public,anon;

grant execute on function public.get_my_specialist_profile() to authenticated,service_role;
grant execute on function public.upsert_my_specialist_profile(text,text,text,text,text,text,text,text,text,text,double precision,double precision,text[],text[],text[],text,integer,boolean,boolean,boolean,boolean,boolean) to authenticated,service_role;
grant execute on function public.admin_specialist_queue(integer) to authenticated,service_role;
grant execute on function public.set_specialist_verification(uuid,public.verification_status,boolean) to authenticated,service_role;
