revoke select on public.specialists from anon, authenticated;
grant select (
  id, slug, full_name, professional_title, bio, website_url,
  country, region, city, languages, specialties, qualifications,
  license_number, years_experience, offers_remote, offers_in_person,
  show_email, show_phone, show_map, verification, verified_at,
  is_active, created_at, updated_at
) on public.specialists to anon, authenticated;

revoke select on public.centers from anon, authenticated;
grant select (
  id, slug, name, description, logo_url, cover_url, email, phone, website_url,
  country, region, city, address, latitude, longitude, working_hours,
  verification, is_active, created_at, updated_at
) on public.centers to anon, authenticated;

create or replace function private.get_public_specialist(p_slug text)
returns table (
  id uuid,
  slug text,
  full_name text,
  professional_title text,
  bio text,
  website_url text,
  country text,
  region text,
  city text,
  languages text[],
  specialties text[],
  qualifications jsonb,
  license_number text,
  years_experience integer,
  offers_remote boolean,
  offers_in_person boolean,
  public_email text,
  public_phone text,
  public_latitude double precision,
  public_longitude double precision,
  verified_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.id, s.slug, s.full_name, s.professional_title, s.bio, s.website_url,
    s.country, s.region, s.city, s.languages, s.specialties, s.qualifications,
    s.license_number, s.years_experience, s.offers_remote, s.offers_in_person,
    case when s.show_email then s.email else null end,
    case when s.show_phone then s.phone else null end,
    case when s.show_map then s.latitude else null end,
    case when s.show_map then s.longitude else null end,
    s.verified_at
  from public.specialists s
  where s.slug = p_slug
    and s.is_active = true
    and s.verification = 'verified'::public.verification_status
  limit 1;
$$;

revoke all on function private.get_public_specialist(text) from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.get_public_specialist(text) to anon, authenticated;

create or replace function public.get_public_specialist(p_slug text)
returns table (
  id uuid,
  slug text,
  full_name text,
  professional_title text,
  bio text,
  website_url text,
  country text,
  region text,
  city text,
  languages text[],
  specialties text[],
  qualifications jsonb,
  license_number text,
  years_experience integer,
  offers_remote boolean,
  offers_in_person boolean,
  public_email text,
  public_phone text,
  public_latitude double precision,
  public_longitude double precision,
  verified_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_public_specialist(p_slug);
$$;

revoke all on function public.get_public_specialist(text) from public;
grant execute on function public.get_public_specialist(text) to anon, authenticated, service_role;
