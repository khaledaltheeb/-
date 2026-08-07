alter table public.centers
  add column if not exists parent_center_id uuid references public.centers(id) on delete set null,
  add column if not exists center_type text not null default 'center',
  add column if not exists services text[] not null default '{}'::text[],
  add column if not exists languages text[] not null default '{}'::text[],
  add column if not exists offers_remote boolean not null default false,
  add column if not exists offers_in_person boolean not null default true,
  add column if not exists show_email boolean not null default true,
  add column if not exists show_phone boolean not null default true,
  add column if not exists show_map boolean not null default true;

alter table public.centers drop constraint if exists centers_center_type_check;
alter table public.centers add constraint centers_center_type_check check (center_type in ('center','clinic','hospital','rehabilitation_center','association','school','other'));
alter table public.centers drop constraint if exists centers_latitude_range;
alter table public.centers add constraint centers_latitude_range check (latitude is null or latitude between -90 and 90);
alter table public.centers drop constraint if exists centers_longitude_range;
alter table public.centers add constraint centers_longitude_range check (longitude is null or longitude between -180 and 180);
alter table public.centers drop constraint if exists centers_parent_not_self;
alter table public.centers add constraint centers_parent_not_self check (parent_center_id is null or parent_center_id <> id);

create index if not exists centers_manager_idx on public.centers(manager_user_id,updated_at desc);
create index if not exists centers_parent_idx on public.centers(parent_center_id);

revoke select on public.centers from anon, authenticated;
grant select (
  id,slug,name,description,logo_url,cover_url,country,region,city,address,
  center_type,services,languages,offers_remote,offers_in_person,
  verification,is_active,parent_center_id,created_at,updated_at
) on public.centers to anon, authenticated;

create or replace function private.get_public_center(p_slug text)
returns table (
  id uuid,slug text,name text,description text,logo_url text,cover_url text,website_url text,
  country text,region text,city text,address text,center_type text,services text[],languages text[],
  offers_remote boolean,offers_in_person boolean,public_email text,public_phone text,
  public_latitude double precision,public_longitude double precision,working_hours jsonb,parent_center_id uuid,verified_at timestamptz
)
language sql
stable
security definer
set search_path=''
as $$
  select c.id,c.slug,c.name,c.description,c.logo_url,c.cover_url,c.website_url,
         c.country,c.region,c.city,c.address,c.center_type,c.services,c.languages,
         c.offers_remote,c.offers_in_person,
         case when c.show_email then c.email else null end,
         case when c.show_phone then c.phone else null end,
         case when c.show_map then c.latitude else null end,
         case when c.show_map then c.longitude else null end,
         c.working_hours,c.parent_center_id,c.verified_at
  from public.centers c
  where c.slug=p_slug and c.is_active=true and c.verification='verified'::public.verification_status
  limit 1;
$$;

create or replace function private.get_my_centers()
returns table (
  id uuid,slug text,name text,description text,logo_url text,cover_url text,email text,phone text,website_url text,
  country text,region text,city text,address text,latitude double precision,longitude double precision,working_hours jsonb,
  verification public.verification_status,verified_at timestamptz,is_active boolean,parent_center_id uuid,center_type text,
  services text[],languages text[],offers_remote boolean,offers_in_person boolean,show_email boolean,show_phone boolean,show_map boolean,updated_at timestamptz
)
language sql
stable
security definer
set search_path=''
as $$
  select c.id,c.slug,c.name,c.description,c.logo_url,c.cover_url,c.email,c.phone,c.website_url,
         c.country,c.region,c.city,c.address,c.latitude,c.longitude,c.working_hours,
         c.verification,c.verified_at,c.is_active,c.parent_center_id,c.center_type,c.services,c.languages,
         c.offers_remote,c.offers_in_person,c.show_email,c.show_phone,c.show_map,c.updated_at
  from public.centers c
  where c.manager_user_id=(select auth.uid())
  order by c.parent_center_id nulls first,c.name;
$$;

create or replace function private.upsert_my_center(
  p_id uuid default null,
  p_slug text default null,
  p_name text default null,
  p_description text default null,
  p_logo_url text default null,
  p_cover_url text default null,
  p_email text default null,
  p_phone text default null,
  p_website_url text default null,
  p_country text default null,
  p_region text default null,
  p_city text default null,
  p_address text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_working_hours jsonb default '{}'::jsonb,
  p_parent_center_id uuid default null,
  p_center_type text default 'center',
  p_services text[] default '{}'::text[],
  p_languages text[] default '{}'::text[],
  p_offers_remote boolean default false,
  p_offers_in_person boolean default true,
  p_show_email boolean default true,
  p_show_phone boolean default true,
  p_show_map boolean default true
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_role public.app_role;
  v_old public.centers%rowtype;
  v_id uuid;
  v_verification public.verification_status;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  v_role:=private.current_role();
  if v_role not in ('center_manager','owner','admin') then raise exception 'center manager role required'; end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug)>140 then raise exception 'invalid slug'; end if;
  if p_name is null or length(trim(p_name))<2 or length(p_name)>220 then raise exception 'invalid name'; end if;
  if p_center_type not in ('center','clinic','hospital','rehabilitation_center','association','school','other') then raise exception 'invalid center type'; end if;
  if p_latitude is not null and (p_latitude < -90 or p_latitude > 90) then raise exception 'invalid latitude'; end if;
  if p_longitude is not null and (p_longitude < -180 or p_longitude > 180) then raise exception 'invalid longitude'; end if;

  if p_id is not null then
    select * into v_old from public.centers where id=p_id and manager_user_id=v_uid;
    if v_old.id is null then raise exception 'center not found or denied'; end if;
  end if;
  if p_parent_center_id is not null and not exists(select 1 from public.centers c where c.id=p_parent_center_id and c.manager_user_id=v_uid) then
    raise exception 'parent center denied';
  end if;
  if p_id is not null and p_parent_center_id=p_id then raise exception 'center cannot be its own parent'; end if;

  if p_id is null then
    insert into public.centers(
      manager_user_id,slug,name,description,logo_url,cover_url,email,phone,website_url,country,region,city,address,
      latitude,longitude,working_hours,parent_center_id,center_type,services,languages,offers_remote,offers_in_person,
      show_email,show_phone,show_map,verification,is_active
    ) values(
      v_uid,p_slug,trim(p_name),nullif(trim(p_description),''),nullif(trim(p_logo_url),''),nullif(trim(p_cover_url),''),
      nullif(trim(p_email),''),nullif(trim(p_phone),''),nullif(trim(p_website_url),''),nullif(trim(p_country),''),
      nullif(trim(p_region),''),nullif(trim(p_city),''),nullif(trim(p_address),''),p_latitude,p_longitude,
      coalesce(p_working_hours,'{}'::jsonb),p_parent_center_id,p_center_type,coalesce(p_services,'{}'::text[]),
      coalesce(p_languages,'{}'::text[]),p_offers_remote,p_offers_in_person,p_show_email,p_show_phone,p_show_map,
      'pending'::public.verification_status,true
    ) returning id into v_id;
    v_verification:='pending'::public.verification_status;
  else
    v_verification:=v_old.verification;
    if v_old.verification='verified'::public.verification_status and (
      v_old.name is distinct from trim(p_name)
      or v_old.center_type is distinct from p_center_type
      or v_old.services is distinct from coalesce(p_services,'{}'::text[])
      or v_old.country is distinct from nullif(trim(p_country),'')
      or v_old.region is distinct from nullif(trim(p_region),'')
      or v_old.city is distinct from nullif(trim(p_city),'')
      or v_old.address is distinct from nullif(trim(p_address),'')
      or v_old.parent_center_id is distinct from p_parent_center_id
    ) then v_verification:='pending'::public.verification_status; end if;

    update public.centers set
      slug=p_slug,name=trim(p_name),description=nullif(trim(p_description),''),logo_url=nullif(trim(p_logo_url),''),cover_url=nullif(trim(p_cover_url),''),
      email=nullif(trim(p_email),''),phone=nullif(trim(p_phone),''),website_url=nullif(trim(p_website_url),''),country=nullif(trim(p_country),''),
      region=nullif(trim(p_region),''),city=nullif(trim(p_city),''),address=nullif(trim(p_address),''),latitude=p_latitude,longitude=p_longitude,
      working_hours=coalesce(p_working_hours,'{}'::jsonb),parent_center_id=p_parent_center_id,center_type=p_center_type,
      services=coalesce(p_services,'{}'::text[]),languages=coalesce(p_languages,'{}'::text[]),offers_remote=p_offers_remote,
      offers_in_person=p_offers_in_person,show_email=p_show_email,show_phone=p_show_phone,show_map=p_show_map,
      verification=v_verification,verified_at=case when v_verification='verified'::public.verification_status then verified_at else null end,
      verified_by=case when v_verification='verified'::public.verification_status then verified_by else null end
    where id=p_id returning id into v_id;
  end if;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_uid,'center',v_id::text,'center_profile_upsert',jsonb_build_object('verification',v_verification,'slug',p_slug));
  return v_id;
end;
$$;

create or replace function private.admin_center_queue(p_limit integer default 300)
returns table (
  id uuid,manager_user_id uuid,slug text,name text,description text,email text,phone text,website_url text,country text,region text,city text,address text,
  latitude double precision,longitude double precision,working_hours jsonb,verification public.verification_status,verified_at timestamptz,is_active boolean,
  parent_center_id uuid,center_type text,services text[],languages text[],offers_remote boolean,offers_in_person boolean,updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path=''
as $$
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  return query select c.id,c.manager_user_id,c.slug,c.name,c.description,c.email,c.phone,c.website_url,c.country,c.region,c.city,c.address,c.latitude,c.longitude,
    c.working_hours,c.verification,c.verified_at,c.is_active,c.parent_center_id,c.center_type,c.services,c.languages,c.offers_remote,c.offers_in_person,c.updated_at
    from public.centers c
    order by case c.verification when 'pending'::public.verification_status then 0 when 'unverified'::public.verification_status then 1 else 2 end,c.updated_at desc
    limit greatest(1,least(coalesce(p_limit,300),500));
end;
$$;

create or replace function private.set_center_verification(p_id uuid,p_status public.verification_status,p_is_active boolean default true)
returns public.verification_status
language plpgsql
security definer
set search_path=''
as $$
declare v_before public.verification_status;
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  if p_status not in ('unverified','pending','verified','rejected','suspended') then raise exception 'invalid status'; end if;
  select verification into v_before from public.centers where id=p_id;
  if v_before is null then raise exception 'center not found'; end if;
  update public.centers set verification=p_status,is_active=p_is_active,
    verified_at=case when p_status='verified'::public.verification_status then now() else null end,
    verified_by=case when p_status='verified'::public.verification_status then (select auth.uid()) else null end
  where id=p_id;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values((select auth.uid()),'center',p_id::text,'verification_change',jsonb_build_object('verification',v_before),jsonb_build_object('verification',p_status,'is_active',p_is_active));
  return p_status;
end;
$$;

revoke all on function private.get_public_center(text) from public;
revoke all on function private.get_my_centers() from public;
revoke all on function private.upsert_my_center(uuid,text,text,text,text,text,text,text,text,text,text,text,text,double precision,double precision,jsonb,uuid,text,text[],text[],boolean,boolean,boolean,boolean,boolean) from public;
revoke all on function private.admin_center_queue(integer) from public;
revoke all on function private.set_center_verification(uuid,public.verification_status,boolean) from public;

grant usage on schema private to anon,authenticated;
grant execute on function private.get_public_center(text) to anon,authenticated;
grant execute on function private.get_my_centers() to authenticated;
grant execute on function private.upsert_my_center(uuid,text,text,text,text,text,text,text,text,text,text,text,text,double precision,double precision,jsonb,uuid,text,text[],text[],boolean,boolean,boolean,boolean,boolean) to authenticated;
grant execute on function private.admin_center_queue(integer) to authenticated;
grant execute on function private.set_center_verification(uuid,public.verification_status,boolean) to authenticated;

create or replace function public.get_public_center(p_slug text)
returns table (
  id uuid,slug text,name text,description text,logo_url text,cover_url text,website_url text,country text,region text,city text,address text,
  center_type text,services text[],languages text[],offers_remote boolean,offers_in_person boolean,public_email text,public_phone text,
  public_latitude double precision,public_longitude double precision,working_hours jsonb,parent_center_id uuid,verified_at timestamptz
)
language sql stable security invoker set search_path=''
as $$ select * from private.get_public_center(p_slug); $$;

create or replace function public.get_my_centers()
returns table (
  id uuid,slug text,name text,description text,logo_url text,cover_url text,email text,phone text,website_url text,country text,region text,city text,address text,
  latitude double precision,longitude double precision,working_hours jsonb,verification public.verification_status,verified_at timestamptz,is_active boolean,
  parent_center_id uuid,center_type text,services text[],languages text[],offers_remote boolean,offers_in_person boolean,show_email boolean,show_phone boolean,show_map boolean,updated_at timestamptz
)
language sql stable security invoker set search_path=''
as $$ select * from private.get_my_centers(); $$;

create or replace function public.upsert_my_center(
  p_id uuid default null,p_slug text default null,p_name text default null,p_description text default null,p_logo_url text default null,p_cover_url text default null,
  p_email text default null,p_phone text default null,p_website_url text default null,p_country text default null,p_region text default null,p_city text default null,p_address text default null,
  p_latitude double precision default null,p_longitude double precision default null,p_working_hours jsonb default '{}'::jsonb,p_parent_center_id uuid default null,
  p_center_type text default 'center',p_services text[] default '{}'::text[],p_languages text[] default '{}'::text[],p_offers_remote boolean default false,p_offers_in_person boolean default true,
  p_show_email boolean default true,p_show_phone boolean default true,p_show_map boolean default true
)
returns uuid
language sql security invoker set search_path=''
as $$ select private.upsert_my_center(p_id,p_slug,p_name,p_description,p_logo_url,p_cover_url,p_email,p_phone,p_website_url,p_country,p_region,p_city,p_address,p_latitude,p_longitude,p_working_hours,p_parent_center_id,p_center_type,p_services,p_languages,p_offers_remote,p_offers_in_person,p_show_email,p_show_phone,p_show_map); $$;

create or replace function public.admin_center_queue(p_limit integer default 300)
returns table (
  id uuid,manager_user_id uuid,slug text,name text,description text,email text,phone text,website_url text,country text,region text,city text,address text,
  latitude double precision,longitude double precision,working_hours jsonb,verification public.verification_status,verified_at timestamptz,is_active boolean,
  parent_center_id uuid,center_type text,services text[],languages text[],offers_remote boolean,offers_in_person boolean,updated_at timestamptz
)
language sql stable security invoker set search_path=''
as $$ select * from private.admin_center_queue(p_limit); $$;

create or replace function public.set_center_verification(p_id uuid,p_status public.verification_status,p_is_active boolean default true)
returns public.verification_status
language sql security invoker set search_path=''
as $$ select private.set_center_verification(p_id,p_status,p_is_active); $$;

revoke all on function public.get_public_center(text) from public;
revoke all on function public.get_my_centers() from public,anon;
revoke all on function public.upsert_my_center(uuid,text,text,text,text,text,text,text,text,text,text,text,text,double precision,double precision,jsonb,uuid,text,text[],text[],boolean,boolean,boolean,boolean,boolean) from public,anon;
revoke all on function public.admin_center_queue(integer) from public,anon;
revoke all on function public.set_center_verification(uuid,public.verification_status,boolean) from public,anon;

grant execute on function public.get_public_center(text) to anon,authenticated,service_role;
grant execute on function public.get_my_centers() to authenticated,service_role;
grant execute on function public.upsert_my_center(uuid,text,text,text,text,text,text,text,text,text,text,text,text,double precision,double precision,jsonb,uuid,text,text[],text[],boolean,boolean,boolean,boolean,boolean) to authenticated,service_role;
grant execute on function public.admin_center_queue(integer) to authenticated,service_role;
grant execute on function public.set_center_verification(uuid,public.verification_status,boolean) to authenticated,service_role;
