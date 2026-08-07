create or replace function private.admin_create_specialist(
  p_user_id uuid default null,
  p_slug text default null,
  p_full_name text default null,
  p_professional_title text default null,
  p_bio text default null,
  p_email text default null,
  p_phone text default null,
  p_website_url text default null,
  p_country text default null,
  p_region text default null,
  p_city text default null,
  p_languages text[] default '{}',
  p_specialties text[] default '{}',
  p_qualifications text[] default '{}',
  p_license_number text default null,
  p_years_experience integer default null,
  p_offers_remote boolean default false,
  p_offers_in_person boolean default true
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_id uuid;
  v_qualifications jsonb := coalesce(to_jsonb(p_qualifications),'[]'::jsonb);
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug)>140 then raise exception 'invalid slug'; end if;
  if p_full_name is null or length(trim(p_full_name))<3 or length(p_full_name)>200 then raise exception 'invalid full name'; end if;
  if p_years_experience is not null and (p_years_experience<0 or p_years_experience>80) then raise exception 'invalid experience'; end if;
  if p_user_id is not null and not exists(select 1 from public.profiles p where p.id=p_user_id) then raise exception 'profile not found'; end if;
  if exists(select 1 from public.specialists s where s.slug=p_slug) then raise exception 'slug already exists'; end if;
  if p_user_id is not null and exists(select 1 from public.specialists s where s.user_id=p_user_id) then raise exception 'user already linked to specialist'; end if;

  insert into public.specialists(
    user_id,slug,full_name,professional_title,bio,email,phone,website_url,country,region,city,
    languages,specialties,qualifications,license_number,years_experience,offers_remote,offers_in_person,
    show_email,show_phone,show_map,verification,is_active
  ) values (
    p_user_id,p_slug,trim(p_full_name),nullif(trim(p_professional_title),''),nullif(trim(p_bio),''),
    nullif(trim(p_email),''),nullif(trim(p_phone),''),nullif(trim(p_website_url),''),
    nullif(trim(p_country),''),nullif(trim(p_region),''),nullif(trim(p_city),''),
    coalesce(p_languages,'{}'),coalesce(p_specialties,'{}'),v_qualifications,nullif(trim(p_license_number),''),p_years_experience,
    p_offers_remote,p_offers_in_person,false,false,false,'pending',true
  ) returning id into v_id;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values((select auth.uid()),'specialist',v_id::text,'admin_specialist_create',jsonb_build_object('slug',p_slug,'user_id',p_user_id,'verification','pending'));
  return v_id;
end;
$$;

revoke all on function private.admin_create_specialist(uuid,text,text,text,text,text,text,text,text,text,text,text[],text[],text[],text,integer,boolean,boolean) from public;
grant execute on function private.admin_create_specialist(uuid,text,text,text,text,text,text,text,text,text,text,text[],text[],text[],text,integer,boolean,boolean) to authenticated;

create or replace function public.admin_create_specialist(
  p_user_id uuid default null,
  p_slug text default null,
  p_full_name text default null,
  p_professional_title text default null,
  p_bio text default null,
  p_email text default null,
  p_phone text default null,
  p_website_url text default null,
  p_country text default null,
  p_region text default null,
  p_city text default null,
  p_languages text[] default '{}',
  p_specialties text[] default '{}',
  p_qualifications text[] default '{}',
  p_license_number text default null,
  p_years_experience integer default null,
  p_offers_remote boolean default false,
  p_offers_in_person boolean default true
)
returns uuid
language sql
security invoker
set search_path=''
as $$ select private.admin_create_specialist(p_user_id,p_slug,p_full_name,p_professional_title,p_bio,p_email,p_phone,p_website_url,p_country,p_region,p_city,p_languages,p_specialties,p_qualifications,p_license_number,p_years_experience,p_offers_remote,p_offers_in_person); $$;

revoke all on function public.admin_create_specialist(uuid,text,text,text,text,text,text,text,text,text,text,text[],text[],text[],text,integer,boolean,boolean) from public,anon;
grant execute on function public.admin_create_specialist(uuid,text,text,text,text,text,text,text,text,text,text,text[],text[],text[],text,integer,boolean,boolean) to authenticated,service_role;
