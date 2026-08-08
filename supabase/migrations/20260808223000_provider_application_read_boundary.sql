-- Self-service provider application reads stay behind RPC boundaries.
-- Do not grant direct access to user_id/manager_user_id or verification_note.

create or replace function private.get_my_specialist_application()
returns table(
  slug text,full_name text,professional_title text,bio text,email text,phone text,website_url text,
  country text,region text,city text,latitude double precision,longitude double precision,languages text[],specialties text[],
  qualifications jsonb,license_number text,years_experience integer,offers_remote boolean,offers_in_person boolean,
  verification public.verification_status,verification_note text,updated_at timestamptz
)
language plpgsql
stable security definer
set search_path=''
as $$
declare v_uid uuid:=private.require_active_user();
begin
  return query
  select s.slug,s.full_name,s.professional_title,s.bio,s.email,s.phone,s.website_url,s.country,s.region,s.city,
         s.latitude,s.longitude,s.languages,s.specialties,s.qualifications,s.license_number,s.years_experience,
         s.offers_remote,s.offers_in_person,s.verification,s.verification_note,s.updated_at
  from public.specialists s where s.user_id=v_uid limit 1;
end;
$$;

create or replace function private.get_my_center_application()
returns table(
  slug text,name text,description text,email text,phone text,website_url text,country text,region text,city text,address text,
  latitude double precision,longitude double precision,working_hours jsonb,center_type text,services text[],languages text[],
  offers_remote boolean,offers_in_person boolean,license_number text,regulatory_authority text,license_expiry_date date,
  verification public.verification_status,verification_note text,updated_at timestamptz
)
language plpgsql
stable security definer
set search_path=''
as $$
declare v_uid uuid:=private.require_active_user();
begin
  return query
  select c.slug,c.name,c.description,c.email,c.phone,c.website_url,c.country,c.region,c.city,c.address,c.latitude,c.longitude,
         c.working_hours,c.center_type,c.services,c.languages,c.offers_remote,c.offers_in_person,c.license_number,
         c.regulatory_authority,c.license_expiry_date,c.verification,c.verification_note,c.updated_at
  from public.centers c where c.manager_user_id=v_uid and c.parent_center_id is null order by c.created_at limit 1;
end;
$$;

create or replace function public.get_my_specialist_application()
returns table(
  slug text,full_name text,professional_title text,bio text,email text,phone text,website_url text,
  country text,region text,city text,latitude double precision,longitude double precision,languages text[],specialties text[],
  qualifications jsonb,license_number text,years_experience integer,offers_remote boolean,offers_in_person boolean,
  verification public.verification_status,verification_note text,updated_at timestamptz
)
language sql security invoker set search_path=''
as $$ select * from private.get_my_specialist_application(); $$;

create or replace function public.get_my_center_application()
returns table(
  slug text,name text,description text,email text,phone text,website_url text,country text,region text,city text,address text,
  latitude double precision,longitude double precision,working_hours jsonb,center_type text,services text[],languages text[],
  offers_remote boolean,offers_in_person boolean,license_number text,regulatory_authority text,license_expiry_date date,
  verification public.verification_status,verification_note text,updated_at timestamptz
)
language sql security invoker set search_path=''
as $$ select * from private.get_my_center_application(); $$;

revoke all on function private.get_my_specialist_application() from public,anon;
revoke all on function private.get_my_center_application() from public,anon;
grant execute on function private.get_my_specialist_application() to authenticated;
grant execute on function private.get_my_center_application() to authenticated;

revoke all on function public.get_my_specialist_application() from public,anon;
revoke all on function public.get_my_center_application() from public,anon;
grant execute on function public.get_my_specialist_application() to authenticated;
grant execute on function public.get_my_center_application() to authenticated;
