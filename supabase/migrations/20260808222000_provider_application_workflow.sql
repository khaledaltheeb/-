-- Provider application workflow for Platform Rawafid.
-- Reuses specialists/centers as the pending application records instead of
-- introducing duplicate application tables.

alter table public.specialists
  add column if not exists verification_note text;

alter table public.centers
  add column if not exists verification_note text;

alter table public.specialists
  drop constraint if exists specialists_verification_note_length;
alter table public.specialists
  add constraint specialists_verification_note_length
  check (verification_note is null or char_length(verification_note) <= 2000);

alter table public.centers
  drop constraint if exists centers_verification_note_length;
alter table public.centers
  add constraint centers_verification_note_length
  check (verification_note is null or char_length(verification_note) <= 2000);

create or replace function private.submit_specialist_application(
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
  p_offers_in_person boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_active_user();
  v_role public.app_role := private.current_role();
  v_existing public.specialists%rowtype;
  v_id uuid;
  v_qualifications jsonb := coalesce(pg_catalog.to_jsonb(p_qualifications), '[]'::jsonb);
begin
  if v_role <> 'user'::public.app_role then
    raise exception 'provider application is available to standard user accounts only';
  end if;
  if exists(select 1 from public.centers c where c.manager_user_id=v_uid) then
    raise exception 'account already has a center application';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug)>140 then raise exception 'invalid slug'; end if;
  if p_full_name is null or length(trim(p_full_name))<3 or length(p_full_name)>200 then raise exception 'invalid full name'; end if;
  if p_years_experience is not null and (p_years_experience<0 or p_years_experience>80) then raise exception 'invalid experience'; end if;
  if p_latitude is not null and (p_latitude < -90 or p_latitude > 90) then raise exception 'invalid latitude'; end if;
  if p_longitude is not null and (p_longitude < -180 or p_longitude > 180) then raise exception 'invalid longitude'; end if;
  if nullif(trim(coalesce(p_email,'')),'') is not null and p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid email'; end if;
  if nullif(trim(coalesce(p_website_url,'')),'') is not null and p_website_url !~* '^https?://[^[:space:]]+$' then raise exception 'invalid website'; end if;

  select * into v_existing from public.specialists where user_id=v_uid limit 1;
  if v_existing.id is not null and v_existing.verification='verified'::public.verification_status then
    raise exception 'verified specialist must use specialist portal';
  end if;

  if v_existing.id is null then
    insert into public.specialists(
      user_id,slug,full_name,professional_title,bio,email,phone,website_url,country,region,city,
      latitude,longitude,languages,specialties,qualifications,license_number,years_experience,
      offers_remote,offers_in_person,show_email,show_phone,show_map,verification,verification_note,is_active
    ) values (
      v_uid,p_slug,trim(p_full_name),nullif(trim(p_professional_title),''),nullif(trim(p_bio),''),
      nullif(trim(p_email),''),nullif(trim(p_phone),''),nullif(trim(p_website_url),''),
      nullif(trim(p_country),''),nullif(trim(p_region),''),nullif(trim(p_city),''),p_latitude,p_longitude,
      coalesce(p_languages,'{}'::text[]),coalesce(p_specialties,'{}'::text[]),v_qualifications,
      nullif(trim(p_license_number),''),p_years_experience,p_offers_remote,p_offers_in_person,
      false,false,false,'pending'::public.verification_status,null,false
    ) returning id into v_id;
  else
    update public.specialists set
      slug=p_slug,
      full_name=trim(p_full_name),
      professional_title=nullif(trim(p_professional_title),''),
      bio=nullif(trim(p_bio),''),
      email=nullif(trim(p_email),''),
      phone=nullif(trim(p_phone),''),
      website_url=nullif(trim(p_website_url),''),
      country=nullif(trim(p_country),''),region=nullif(trim(p_region),''),city=nullif(trim(p_city),''),
      latitude=p_latitude,longitude=p_longitude,
      languages=coalesce(p_languages,'{}'::text[]),specialties=coalesce(p_specialties,'{}'::text[]),
      qualifications=v_qualifications,license_number=nullif(trim(p_license_number),''),years_experience=p_years_experience,
      offers_remote=p_offers_remote,offers_in_person=p_offers_in_person,
      verification='pending'::public.verification_status,verification_note=null,verified_at=null,verified_by=null,is_active=false,
      updated_at=now()
    where id=v_existing.id
    returning id into v_id;
  end if;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_uid,'specialist',v_id::text,'specialist_application_submitted',jsonb_build_object('slug',p_slug,'verification','pending'));

  insert into public.notifications(user_id,kind,title,body,data)
  select p.id,'provider_application','طلب انضمام مختص جديد','يوجد طلب انضمام جديد بانتظار المراجعة.',jsonb_build_object('specialist_id',v_id)
  from public.profiles p where p.is_active=true and p.role in ('owner'::public.app_role,'admin'::public.app_role);

  return v_id;
end;
$$;

create or replace function private.submit_center_application(
  p_slug text,
  p_name text,
  p_description text default null,
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
  p_center_type text default 'center',
  p_services text[] default '{}'::text[],
  p_languages text[] default '{}'::text[],
  p_offers_remote boolean default false,
  p_offers_in_person boolean default true,
  p_license_number text default null,
  p_regulatory_authority text default null,
  p_license_expiry_date date default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_active_user();
  v_role public.app_role := private.current_role();
  v_existing public.centers%rowtype;
  v_id uuid;
begin
  if v_role <> 'user'::public.app_role then
    raise exception 'provider application is available to standard user accounts only';
  end if;
  if exists(select 1 from public.specialists s where s.user_id=v_uid) then
    raise exception 'account already has a specialist application';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug)>140 then raise exception 'invalid slug'; end if;
  if p_name is null or length(trim(p_name))<2 or length(p_name)>220 then raise exception 'invalid center name'; end if;
  if p_center_type not in ('center','clinic','hospital','rehabilitation_center','association','school','other') then raise exception 'invalid center type'; end if;
  if p_latitude is not null and (p_latitude < -90 or p_latitude > 90) then raise exception 'invalid latitude'; end if;
  if p_longitude is not null and (p_longitude < -180 or p_longitude > 180) then raise exception 'invalid longitude'; end if;
  if pg_catalog.jsonb_typeof(coalesce(p_working_hours,'{}'::jsonb)) <> 'object' then raise exception 'invalid working hours'; end if;
  if nullif(trim(coalesce(p_email,'')),'') is not null and p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid email'; end if;
  if nullif(trim(coalesce(p_website_url,'')),'') is not null and p_website_url !~* '^https?://[^[:space:]]+$' then raise exception 'invalid website'; end if;

  select * into v_existing from public.centers where manager_user_id=v_uid and parent_center_id is null order by created_at limit 1;
  if v_existing.id is not null and v_existing.verification='verified'::public.verification_status then
    raise exception 'verified center must use center portal';
  end if;

  if v_existing.id is null then
    insert into public.centers(
      manager_user_id,slug,name,description,email,phone,website_url,country,region,city,address,latitude,longitude,
      working_hours,parent_center_id,center_type,services,languages,offers_remote,offers_in_person,
      show_email,show_phone,show_map,license_number,regulatory_authority,license_expiry_date,
      verification,verification_note,is_active
    ) values (
      v_uid,p_slug,trim(p_name),nullif(trim(p_description),''),nullif(trim(p_email),''),nullif(trim(p_phone),''),
      nullif(trim(p_website_url),''),nullif(trim(p_country),''),nullif(trim(p_region),''),nullif(trim(p_city),''),
      nullif(trim(p_address),''),p_latitude,p_longitude,coalesce(p_working_hours,'{}'::jsonb),null,p_center_type,
      coalesce(p_services,'{}'::text[]),coalesce(p_languages,'{}'::text[]),p_offers_remote,p_offers_in_person,
      false,false,false,nullif(trim(p_license_number),''),nullif(trim(p_regulatory_authority),''),p_license_expiry_date,
      'pending'::public.verification_status,null,false
    ) returning id into v_id;
  else
    update public.centers set
      slug=p_slug,name=trim(p_name),description=nullif(trim(p_description),''),email=nullif(trim(p_email),''),
      phone=nullif(trim(p_phone),''),website_url=nullif(trim(p_website_url),''),country=nullif(trim(p_country),''),
      region=nullif(trim(p_region),''),city=nullif(trim(p_city),''),address=nullif(trim(p_address),''),
      latitude=p_latitude,longitude=p_longitude,working_hours=coalesce(p_working_hours,'{}'::jsonb),
      center_type=p_center_type,services=coalesce(p_services,'{}'::text[]),languages=coalesce(p_languages,'{}'::text[]),
      offers_remote=p_offers_remote,offers_in_person=p_offers_in_person,
      license_number=nullif(trim(p_license_number),''),regulatory_authority=nullif(trim(p_regulatory_authority),''),
      license_expiry_date=p_license_expiry_date,
      verification='pending'::public.verification_status,verification_note=null,verified_at=null,verified_by=null,is_active=false,
      updated_at=now()
    where id=v_existing.id
    returning id into v_id;
  end if;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_uid,'center',v_id::text,'center_application_submitted',jsonb_build_object('slug',p_slug,'verification','pending'));

  insert into public.notifications(user_id,kind,title,body,data)
  select p.id,'provider_application','طلب انضمام مركز جديد','يوجد طلب مركز جديد بانتظار المراجعة.',jsonb_build_object('center_id',v_id)
  from public.profiles p where p.is_active=true and p.role in ('owner'::public.app_role,'admin'::public.app_role);

  return v_id;
end;
$$;

create or replace function private.admin_specialist_queue_v2(p_limit integer default 300)
returns table(
  id uuid,user_id uuid,slug text,full_name text,professional_title text,bio text,email text,phone text,website_url text,
  country text,region text,city text,languages text[],specialties text[],qualifications jsonb,license_number text,
  years_experience integer,verification public.verification_status,verification_note text,verified_at timestamptz,
  is_active boolean,created_at timestamptz,updated_at timestamptz
)
language plpgsql
stable security definer
set search_path=''
as $$
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  return query
  select s.id,s.user_id,s.slug,s.full_name,s.professional_title,s.bio,s.email,s.phone,s.website_url,
         s.country,s.region,s.city,s.languages,s.specialties,s.qualifications,s.license_number,s.years_experience,
         s.verification,s.verification_note,s.verified_at,s.is_active,s.created_at,s.updated_at
  from public.specialists s
  order by case s.verification when 'pending'::public.verification_status then 0 when 'unverified'::public.verification_status then 1 else 2 end,
           s.updated_at desc
  limit greatest(1,least(coalesce(p_limit,300),500));
end;
$$;

create or replace function private.admin_center_queue_v2(p_limit integer default 300)
returns table(
  id uuid,manager_user_id uuid,slug text,name text,description text,email text,phone text,website_url text,
  country text,region text,city text,address text,latitude double precision,longitude double precision,working_hours jsonb,
  verification public.verification_status,verification_note text,verified_at timestamptz,is_active boolean,parent_center_id uuid,
  center_type text,services text[],languages text[],offers_remote boolean,offers_in_person boolean,
  license_number text,regulatory_authority text,license_expiry_date date,created_at timestamptz,updated_at timestamptz
)
language plpgsql
stable security definer
set search_path=''
as $$
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  return query
  select c.id,c.manager_user_id,c.slug,c.name,c.description,c.email,c.phone,c.website_url,c.country,c.region,c.city,c.address,
         c.latitude,c.longitude,c.working_hours,c.verification,c.verification_note,c.verified_at,c.is_active,c.parent_center_id,
         c.center_type,c.services,c.languages,c.offers_remote,c.offers_in_person,c.license_number,c.regulatory_authority,
         c.license_expiry_date,c.created_at,c.updated_at
  from public.centers c
  order by case c.verification when 'pending'::public.verification_status then 0 when 'unverified'::public.verification_status then 1 else 2 end,
           c.updated_at desc
  limit greatest(1,least(coalesce(p_limit,300),500));
end;
$$;

create or replace function private.set_specialist_verification_v2(
  p_id uuid,
  p_status public.verification_status,
  p_is_active boolean default true,
  p_note text default null
)
returns public.verification_status
language plpgsql
security definer
set search_path=''
as $$
declare
  v_before public.specialists%rowtype;
  v_note text := nullif(trim(left(coalesce(p_note,''),2000)),'');
  v_active boolean;
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  select * into v_before from public.specialists where id=p_id for update;
  if v_before.id is null then raise exception 'specialist not found'; end if;
  v_active := case when p_status='verified'::public.verification_status then true else coalesce(p_is_active,false) end;

  update public.specialists set
    verification=p_status,
    verification_note=v_note,
    is_active=v_active,
    verified_at=case when p_status='verified'::public.verification_status then now() else null end,
    verified_by=case when p_status='verified'::public.verification_status then (select auth.uid()) else null end,
    updated_at=now()
  where id=p_id;

  if p_status='verified'::public.verification_status and v_before.user_id is not null then
    update public.profiles
      set role='specialist'::public.app_role,is_active=true,updated_at=now()
    where id=v_before.user_id and role in ('user'::public.app_role,'specialist'::public.app_role);
  end if;

  if v_before.user_id is not null then
    insert into public.notifications(user_id,kind,title,body,data)
    values(
      v_before.user_id,'verification_update',
      case p_status when 'verified'::public.verification_status then 'تم توثيق ملفك المهني' when 'rejected'::public.verification_status then 'طلب المختص يحتاج تصحيحًا' when 'suspended'::public.verification_status then 'تم إيقاف الملف المهني' else 'تحديث حالة طلب المختص' end,
      coalesce(v_note,'تم تحديث حالة ملفك المهني في منصة روافد.'),
      jsonb_build_object('specialist_id',p_id,'status',p_status::text)
    );
  end if;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values((select auth.uid()),'specialist',p_id::text,'verification_change_v2',
    jsonb_build_object('verification',v_before.verification,'is_active',v_before.is_active),
    jsonb_build_object('verification',p_status,'is_active',v_active,'has_note',v_note is not null));

  return p_status;
end;
$$;

create or replace function private.set_center_verification_v2(
  p_id uuid,
  p_status public.verification_status,
  p_is_active boolean default true,
  p_note text default null
)
returns public.verification_status
language plpgsql
security definer
set search_path=''
as $$
declare
  v_before public.centers%rowtype;
  v_note text := nullif(trim(left(coalesce(p_note,''),2000)),'');
  v_active boolean;
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  select * into v_before from public.centers where id=p_id for update;
  if v_before.id is null then raise exception 'center not found'; end if;
  v_active := case when p_status='verified'::public.verification_status then true else coalesce(p_is_active,false) end;

  update public.centers set
    verification=p_status,
    verification_note=v_note,
    is_active=v_active,
    verified_at=case when p_status='verified'::public.verification_status then now() else null end,
    verified_by=case when p_status='verified'::public.verification_status then (select auth.uid()) else null end,
    updated_at=now()
  where id=p_id;

  if p_status='verified'::public.verification_status and v_before.manager_user_id is not null then
    update public.profiles
      set role='center_manager'::public.app_role,is_active=true,updated_at=now()
    where id=v_before.manager_user_id and role in ('user'::public.app_role,'center_manager'::public.app_role);
  end if;

  if v_before.manager_user_id is not null then
    insert into public.notifications(user_id,kind,title,body,data)
    values(
      v_before.manager_user_id,'verification_update',
      case p_status when 'verified'::public.verification_status then 'تم توثيق المركز' when 'rejected'::public.verification_status then 'طلب المركز يحتاج تصحيحًا' when 'suspended'::public.verification_status then 'تم إيقاف المركز' else 'تحديث حالة طلب المركز' end,
      coalesce(v_note,'تم تحديث حالة ملف المركز في منصة روافد.'),
      jsonb_build_object('center_id',p_id,'status',p_status::text)
    );
  end if;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values((select auth.uid()),'center',p_id::text,'verification_change_v2',
    jsonb_build_object('verification',v_before.verification,'is_active',v_before.is_active),
    jsonb_build_object('verification',p_status,'is_active',v_active,'has_note',v_note is not null));

  return p_status;
end;
$$;

create or replace function public.submit_specialist_application(
  p_slug text,p_full_name text,p_professional_title text default null,p_bio text default null,p_email text default null,
  p_phone text default null,p_website_url text default null,p_country text default null,p_region text default null,p_city text default null,
  p_latitude double precision default null,p_longitude double precision default null,p_languages text[] default '{}'::text[],
  p_specialties text[] default '{}'::text[],p_qualifications text[] default '{}'::text[],p_license_number text default null,
  p_years_experience integer default null,p_offers_remote boolean default false,p_offers_in_person boolean default true
)
returns uuid language sql security invoker set search_path=''
as $$ select private.submit_specialist_application(p_slug,p_full_name,p_professional_title,p_bio,p_email,p_phone,p_website_url,p_country,p_region,p_city,p_latitude,p_longitude,p_languages,p_specialties,p_qualifications,p_license_number,p_years_experience,p_offers_remote,p_offers_in_person); $$;

create or replace function public.submit_center_application(
  p_slug text,p_name text,p_description text default null,p_email text default null,p_phone text default null,p_website_url text default null,
  p_country text default null,p_region text default null,p_city text default null,p_address text default null,p_latitude double precision default null,
  p_longitude double precision default null,p_working_hours jsonb default '{}'::jsonb,p_center_type text default 'center',
  p_services text[] default '{}'::text[],p_languages text[] default '{}'::text[],p_offers_remote boolean default false,
  p_offers_in_person boolean default true,p_license_number text default null,p_regulatory_authority text default null,p_license_expiry_date date default null
)
returns uuid language sql security invoker set search_path=''
as $$ select private.submit_center_application(p_slug,p_name,p_description,p_email,p_phone,p_website_url,p_country,p_region,p_city,p_address,p_latitude,p_longitude,p_working_hours,p_center_type,p_services,p_languages,p_offers_remote,p_offers_in_person,p_license_number,p_regulatory_authority,p_license_expiry_date); $$;

create or replace function public.admin_specialist_queue_v2(p_limit integer default 300)
returns table(
  id uuid,user_id uuid,slug text,full_name text,professional_title text,bio text,email text,phone text,website_url text,
  country text,region text,city text,languages text[],specialties text[],qualifications jsonb,license_number text,
  years_experience integer,verification public.verification_status,verification_note text,verified_at timestamptz,
  is_active boolean,created_at timestamptz,updated_at timestamptz
)
language sql security invoker set search_path=''
as $$ select * from private.admin_specialist_queue_v2(p_limit); $$;

create or replace function public.admin_center_queue_v2(p_limit integer default 300)
returns table(
  id uuid,manager_user_id uuid,slug text,name text,description text,email text,phone text,website_url text,
  country text,region text,city text,address text,latitude double precision,longitude double precision,working_hours jsonb,
  verification public.verification_status,verification_note text,verified_at timestamptz,is_active boolean,parent_center_id uuid,
  center_type text,services text[],languages text[],offers_remote boolean,offers_in_person boolean,
  license_number text,regulatory_authority text,license_expiry_date date,created_at timestamptz,updated_at timestamptz
)
language sql security invoker set search_path=''
as $$ select * from private.admin_center_queue_v2(p_limit); $$;

create or replace function public.set_specialist_verification_v2(p_id uuid,p_status public.verification_status,p_is_active boolean default true,p_note text default null)
returns public.verification_status language sql security invoker set search_path=''
as $$ select private.set_specialist_verification_v2(p_id,p_status,p_is_active,p_note); $$;

create or replace function public.set_center_verification_v2(p_id uuid,p_status public.verification_status,p_is_active boolean default true,p_note text default null)
returns public.verification_status language sql security invoker set search_path=''
as $$ select private.set_center_verification_v2(p_id,p_status,p_is_active,p_note); $$;

revoke all on function private.submit_specialist_application(text,text,text,text,text,text,text,text,text,text,double precision,double precision,text[],text[],text[],text,integer,boolean,boolean) from public,anon;
revoke all on function private.submit_center_application(text,text,text,text,text,text,text,text,text,text,double precision,double precision,jsonb,text,text[],text[],boolean,boolean,text,text,date) from public,anon;
revoke all on function private.admin_specialist_queue_v2(integer) from public,anon;
revoke all on function private.admin_center_queue_v2(integer) from public,anon;
revoke all on function private.set_specialist_verification_v2(uuid,public.verification_status,boolean,text) from public,anon;
revoke all on function private.set_center_verification_v2(uuid,public.verification_status,boolean,text) from public,anon;

grant execute on function private.submit_specialist_application(text,text,text,text,text,text,text,text,text,text,double precision,double precision,text[],text[],text[],text,integer,boolean,boolean) to authenticated;
grant execute on function private.submit_center_application(text,text,text,text,text,text,text,text,text,text,double precision,double precision,jsonb,text,text[],text[],boolean,boolean,text,text,date) to authenticated;
grant execute on function private.admin_specialist_queue_v2(integer) to authenticated;
grant execute on function private.admin_center_queue_v2(integer) to authenticated;
grant execute on function private.set_specialist_verification_v2(uuid,public.verification_status,boolean,text) to authenticated;
grant execute on function private.set_center_verification_v2(uuid,public.verification_status,boolean,text) to authenticated;

revoke all on function public.submit_specialist_application(text,text,text,text,text,text,text,text,text,text,double precision,double precision,text[],text[],text[],text,integer,boolean,boolean) from public,anon;
revoke all on function public.submit_center_application(text,text,text,text,text,text,text,text,text,text,double precision,double precision,jsonb,text,text[],text[],boolean,boolean,text,text,date) from public,anon;
revoke all on function public.admin_specialist_queue_v2(integer) from public,anon;
revoke all on function public.admin_center_queue_v2(integer) from public,anon;
revoke all on function public.set_specialist_verification_v2(uuid,public.verification_status,boolean,text) from public,anon;
revoke all on function public.set_center_verification_v2(uuid,public.verification_status,boolean,text) from public,anon;

grant execute on function public.submit_specialist_application(text,text,text,text,text,text,text,text,text,text,double precision,double precision,text[],text[],text[],text,integer,boolean,boolean) to authenticated;
grant execute on function public.submit_center_application(text,text,text,text,text,text,text,text,text,text,double precision,double precision,jsonb,text,text[],text[],boolean,boolean,text,text,date) to authenticated;
grant execute on function public.admin_specialist_queue_v2(integer) to authenticated;
grant execute on function public.admin_center_queue_v2(integer) to authenticated;
grant execute on function public.set_specialist_verification_v2(uuid,public.verification_status,boolean,text) to authenticated;
grant execute on function public.set_center_verification_v2(uuid,public.verification_status,boolean,text) to authenticated;
