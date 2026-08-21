create or replace function private.owner_assign_specialist_direct(
  p_user_id uuid,
  p_professional_title text default null,
  p_specialties text[] default '{}'::text[],
  p_license_number text default null,
  p_years_experience integer default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_profile public.profiles%rowtype;
  v_specialist public.specialists%rowtype;
  v_email text;
  v_name text;
  v_slug text;
  v_id uuid;
  v_specialties text[] := coalesce(p_specialties, '{}'::text[]);
begin
  if private.current_role() <> 'owner'::public.app_role then
    raise exception 'owner required';
  end if;
  if p_user_id is null then raise exception 'user required'; end if;
  if p_user_id = v_actor then raise exception 'owner cannot assign self as specialist'; end if;
  if p_years_experience is not null and (p_years_experience < 0 or p_years_experience > 80) then
    raise exception 'invalid experience';
  end if;

  select * into v_profile from public.profiles where id = p_user_id for update;
  if v_profile.id is null then raise exception 'profile not found'; end if;
  if v_profile.role not in ('user'::public.app_role, 'specialist'::public.app_role) then
    raise exception 'target account role cannot be assigned as specialist';
  end if;

  select u.email into v_email from auth.users u where u.id = p_user_id;
  select * into v_specialist from public.specialists where user_id = p_user_id limit 1 for update;

  if v_specialist.id is not null then
    update public.specialists
    set professional_title = coalesce(nullif(trim(p_professional_title), ''), professional_title),
        specialties = case when coalesce(pg_catalog.cardinality(v_specialties), 0) > 0 then v_specialties else specialties end,
        license_number = coalesce(nullif(trim(p_license_number), ''), license_number),
        years_experience = coalesce(p_years_experience, years_experience),
        verification = 'verified'::public.verification_status,
        verification_note = null,
        is_active = true,
        verified_at = now(),
        verified_by = v_actor,
        updated_at = now()
    where id = v_specialist.id
    returning id into v_id;
  else
    v_name := nullif(trim(v_profile.display_name), '');
    if v_name is null or char_length(v_name) < 3 then
      v_name := nullif(trim(pg_catalog.split_part(coalesce(v_email, ''), '@', 1)), '');
    end if;
    if v_name is null or char_length(v_name) < 3 then v_name := 'مختص روافد'; end if;

    v_slug := 'specialist-' || pg_catalog.replace(p_user_id::text, '-', '');
    if exists(select 1 from public.specialists s where s.slug = v_slug) then
      v_slug := v_slug || '-' || pg_catalog.substr(pg_catalog.md5(pg_catalog.clock_timestamp()::text), 1, 8);
    end if;

    insert into public.specialists(
      user_id, slug, full_name, professional_title, email, phone,
      languages, specialties, qualifications, license_number, years_experience,
      offers_remote, offers_in_person, show_email, show_phone, show_map,
      verification, verification_note, verified_at, verified_by, is_active
    ) values (
      p_user_id, v_slug, v_name, nullif(trim(p_professional_title), ''), nullif(trim(v_email), ''), v_profile.phone,
      '{}'::text[], v_specialties, '[]'::jsonb, nullif(trim(p_license_number), ''), p_years_experience,
      false, false, false, false, false,
      'verified'::public.verification_status, null, now(), v_actor, true
    ) returning id into v_id;
  end if;

  update public.profiles
  set role = 'specialist'::public.app_role,
      is_active = true,
      updated_at = now()
  where id = p_user_id;

  insert into public.notifications(user_id, kind, title, body, data)
  values(
    p_user_id,
    'verification_update',
    'تم اعتمادك كمختص في منصة روافد',
    'قام مالك المنصة بتعيين حسابك مباشرةً كمختص موثق. يمكنك الآن الدخول إلى بوابة المختص وإكمال بيانات ملفك المهني.',
    jsonb_build_object('specialist_id', v_id, 'status', 'verified', 'source', 'owner_direct_assignment')
  );

  insert into public.audit_logs(actor_id, entity_type, entity_id, action, before_data, after_data)
  values(
    v_actor,
    'specialist',
    v_id::text,
    'owner_direct_specialist_assignment',
    jsonb_build_object('user_id', p_user_id, 'profile_role', v_profile.role, 'existing_specialist', v_specialist.id is not null, 'previous_verification', v_specialist.verification),
    jsonb_build_object('user_id', p_user_id, 'profile_role', 'specialist', 'verification', 'verified', 'is_active', true)
  );

  return v_id;
end;
$$;

revoke all on function private.owner_assign_specialist_direct(uuid,text,text[],text,integer) from public;
grant usage on schema private to authenticated;
grant execute on function private.owner_assign_specialist_direct(uuid,text,text[],text,integer) to authenticated;

create or replace function public.owner_assign_specialist_direct(
  p_user_id uuid,
  p_professional_title text default null,
  p_specialties text[] default '{}'::text[],
  p_license_number text default null,
  p_years_experience integer default null
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.owner_assign_specialist_direct(p_user_id,p_professional_title,p_specialties,p_license_number,p_years_experience);
$$;

revoke all on function public.owner_assign_specialist_direct(uuid,text,text[],text,integer) from public, anon;
grant execute on function public.owner_assign_specialist_direct(uuid,text,text[],text,integer) to authenticated, service_role;
