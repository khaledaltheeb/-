create table if not exists public.community_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
  slug text not null unique,
  member_type text not null check (member_type in ('trainee','volunteer')),
  full_name text not null,
  headline text,
  bio text,
  country text,
  region text,
  city text,
  training_institution text,
  supervisor_name text,
  organization text,
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  availability text,
  verification public.verification_status not null default 'pending',
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists community_profiles_type_status_idx on public.community_profiles(member_type,verification,is_active);
create index if not exists community_profiles_location_idx on public.community_profiles(country,city);
create index if not exists community_profiles_verified_by_idx on public.community_profiles(verified_by);

alter table public.community_profiles enable row level security;

create policy community_public_read on public.community_profiles
for select to anon
using (verification='verified' and is_active=true);

create policy community_authenticated_read on public.community_profiles
for select to authenticated
using (
  (verification='verified' and is_active=true)
  or user_id=(select auth.uid())
  or (select private.is_admin())
);

revoke insert,update,delete,truncate,references,trigger on public.community_profiles from anon,authenticated;
grant select on public.community_profiles to anon,authenticated;

create or replace function private.upsert_my_community_profile(
  p_slug text,
  p_member_type text,
  p_full_name text,
  p_headline text default null,
  p_bio text default null,
  p_country text default null,
  p_region text default null,
  p_city text default null,
  p_training_institution text default null,
  p_supervisor_name text default null,
  p_organization text default null,
  p_skills text[] default '{}',
  p_interests text[] default '{}',
  p_availability text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
  v_existing public.community_profiles%rowtype;
  v_changed boolean := false;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if p_member_type not in ('trainee','volunteer') then raise exception 'invalid member type'; end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'invalid slug'; end if;
  if nullif(trim(p_full_name),'') is null then raise exception 'full name required'; end if;

  select * into v_existing from public.community_profiles where user_id=v_uid;
  if v_existing.id is not null then
    v_changed := v_existing.member_type is distinct from p_member_type
      or v_existing.full_name is distinct from trim(p_full_name)
      or v_existing.training_institution is distinct from nullif(trim(p_training_institution),'')
      or v_existing.supervisor_name is distinct from nullif(trim(p_supervisor_name),'');
  end if;

  insert into public.community_profiles(
    user_id,slug,member_type,full_name,headline,bio,country,region,city,training_institution,
    supervisor_name,organization,skills,interests,availability,verification,verified_at,verified_by,updated_at
  ) values (
    v_uid,p_slug,p_member_type,trim(p_full_name),nullif(trim(p_headline),''),nullif(trim(p_bio),''),
    nullif(trim(p_country),''),nullif(trim(p_region),''),nullif(trim(p_city),''),nullif(trim(p_training_institution),''),
    nullif(trim(p_supervisor_name),''),nullif(trim(p_organization),''),coalesce(p_skills,'{}'),coalesce(p_interests,'{}'),
    nullif(trim(p_availability),''),'pending',null,null,now()
  )
  on conflict(user_id) do update set
    slug=excluded.slug,
    member_type=excluded.member_type,
    full_name=excluded.full_name,
    headline=excluded.headline,
    bio=excluded.bio,
    country=excluded.country,
    region=excluded.region,
    city=excluded.city,
    training_institution=excluded.training_institution,
    supervisor_name=excluded.supervisor_name,
    organization=excluded.organization,
    skills=excluded.skills,
    interests=excluded.interests,
    availability=excluded.availability,
    verification=case when v_changed then 'pending'::public.verification_status else public.community_profiles.verification end,
    verified_at=case when v_changed then null else public.community_profiles.verified_at end,
    verified_by=case when v_changed then null else public.community_profiles.verified_by end,
    updated_at=now()
  returning id into v_id;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_uid,'community_profile',v_id::text,'community_profile_self_upsert',jsonb_build_object('member_type',p_member_type));
  return v_id;
end;
$$;

create or replace function private.admin_upsert_community_profile(
  p_id uuid default null,
  p_user_id uuid default null,
  p_slug text default null,
  p_member_type text default 'volunteer',
  p_full_name text default null,
  p_headline text default null,
  p_bio text default null,
  p_country text default null,
  p_region text default null,
  p_city text default null,
  p_training_institution text default null,
  p_supervisor_name text default null,
  p_organization text default null,
  p_skills text[] default '{}',
  p_interests text[] default '{}',
  p_availability text default null
)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_id uuid := coalesce(p_id,gen_random_uuid());
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  if p_member_type not in ('trainee','volunteer') then raise exception 'invalid member type'; end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'invalid slug'; end if;
  if nullif(trim(p_full_name),'') is null then raise exception 'full name required'; end if;

  insert into public.community_profiles(
    id,user_id,slug,member_type,full_name,headline,bio,country,region,city,training_institution,
    supervisor_name,organization,skills,interests,availability,verification,is_active,updated_at
  ) values (
    v_id,p_user_id,p_slug,p_member_type,trim(p_full_name),nullif(trim(p_headline),''),nullif(trim(p_bio),''),
    nullif(trim(p_country),''),nullif(trim(p_region),''),nullif(trim(p_city),''),nullif(trim(p_training_institution),''),
    nullif(trim(p_supervisor_name),''),nullif(trim(p_organization),''),coalesce(p_skills,'{}'),coalesce(p_interests,'{}'),
    nullif(trim(p_availability),''),'pending',true,now()
  )
  on conflict(id) do update set
    user_id=excluded.user_id,
    slug=excluded.slug,
    member_type=excluded.member_type,
    full_name=excluded.full_name,
    headline=excluded.headline,
    bio=excluded.bio,
    country=excluded.country,
    region=excluded.region,
    city=excluded.city,
    training_institution=excluded.training_institution,
    supervisor_name=excluded.supervisor_name,
    organization=excluded.organization,
    skills=excluded.skills,
    interests=excluded.interests,
    availability=excluded.availability,
    verification='pending',
    verified_at=null,
    verified_by=null,
    updated_at=now();

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values((select auth.uid()),'community_profile',v_id::text,'community_profile_admin_upsert',jsonb_build_object('member_type',p_member_type));
  return v_id;
end;
$$;

create or replace function private.set_community_verification(
  p_id uuid,
  p_status public.verification_status,
  p_is_active boolean default true
)
returns public.verification_status
language plpgsql
security definer
set search_path=''
as $$
declare
  v_before public.community_profiles%rowtype;
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  select * into v_before from public.community_profiles where id=p_id;
  if v_before.id is null then raise exception 'community profile not found'; end if;

  update public.community_profiles
  set verification=p_status,
      is_active=p_is_active,
      verified_at=case when p_status='verified' then now() else null end,
      verified_by=case when p_status='verified' then (select auth.uid()) else null end,
      updated_at=now()
  where id=p_id;

  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data)
  values(
    (select auth.uid()),'community_profile',p_id::text,'community_verification_change',
    jsonb_build_object('verification',v_before.verification,'is_active',v_before.is_active),
    jsonb_build_object('verification',p_status,'is_active',p_is_active)
  );
  return p_status;
end;
$$;

revoke all on function private.upsert_my_community_profile(text,text,text,text,text,text,text,text,text,text,text,text[],text[],text) from public;
revoke all on function private.admin_upsert_community_profile(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,text[],text[],text) from public;
revoke all on function private.set_community_verification(uuid,public.verification_status,boolean) from public;
grant execute on function private.upsert_my_community_profile(text,text,text,text,text,text,text,text,text,text,text,text[],text[],text) to authenticated;
grant execute on function private.admin_upsert_community_profile(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,text[],text[],text) to authenticated;
grant execute on function private.set_community_verification(uuid,public.verification_status,boolean) to authenticated;

create or replace function public.upsert_my_community_profile(
  p_slug text,p_member_type text,p_full_name text,p_headline text default null,p_bio text default null,
  p_country text default null,p_region text default null,p_city text default null,p_training_institution text default null,
  p_supervisor_name text default null,p_organization text default null,p_skills text[] default '{}',p_interests text[] default '{}',
  p_availability text default null
) returns uuid language sql security invoker set search_path=''
as $$ select private.upsert_my_community_profile(p_slug,p_member_type,p_full_name,p_headline,p_bio,p_country,p_region,p_city,p_training_institution,p_supervisor_name,p_organization,p_skills,p_interests,p_availability); $$;

create or replace function public.admin_upsert_community_profile(
  p_id uuid default null,p_user_id uuid default null,p_slug text default null,p_member_type text default 'volunteer',p_full_name text default null,
  p_headline text default null,p_bio text default null,p_country text default null,p_region text default null,p_city text default null,
  p_training_institution text default null,p_supervisor_name text default null,p_organization text default null,p_skills text[] default '{}',
  p_interests text[] default '{}',p_availability text default null
) returns uuid language sql security invoker set search_path=''
as $$ select private.admin_upsert_community_profile(p_id,p_user_id,p_slug,p_member_type,p_full_name,p_headline,p_bio,p_country,p_region,p_city,p_training_institution,p_supervisor_name,p_organization,p_skills,p_interests,p_availability); $$;

create or replace function public.set_community_verification(
  p_id uuid,p_status public.verification_status,p_is_active boolean default true
) returns public.verification_status language sql security invoker set search_path=''
as $$ select private.set_community_verification(p_id,p_status,p_is_active); $$;

revoke all on function public.upsert_my_community_profile(text,text,text,text,text,text,text,text,text,text,text,text[],text[],text) from public,anon;
revoke all on function public.admin_upsert_community_profile(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,text[],text[],text) from public,anon;
revoke all on function public.set_community_verification(uuid,public.verification_status,boolean) from public,anon;
grant execute on function public.upsert_my_community_profile(text,text,text,text,text,text,text,text,text,text,text,text[],text[],text) to authenticated,service_role;
grant execute on function public.admin_upsert_community_profile(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,text[],text[],text) to authenticated,service_role;
grant execute on function public.set_community_verification(uuid,public.verification_status,boolean) to authenticated,service_role;
