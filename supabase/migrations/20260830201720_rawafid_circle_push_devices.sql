create table if not exists public.circle_push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  push_provider text not null default 'fcm',
  push_token text not null,
  platform text not null default 'android',
  app_version text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint circle_push_devices_provider check (push_provider in ('fcm')),
  constraint circle_push_devices_platform check (platform in ('android')),
  constraint circle_push_devices_device_id_len check (char_length(device_id) between 16 and 160),
  constraint circle_push_devices_token_len check (char_length(push_token) between 32 and 4096),
  unique (user_id, device_id),
  unique (push_token)
);

create index if not exists circle_push_devices_user_enabled_idx
  on public.circle_push_devices(user_id, enabled, updated_at desc);

alter table public.circle_push_devices enable row level security;
revoke all on table public.circle_push_devices from public, anon, authenticated;

create or replace function private.circle_register_push_device(
  p_device_id text,
  p_push_token text,
  p_app_version text default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_device_id text := trim(coalesce(p_device_id,''));
  v_token text := trim(coalesce(p_push_token,''));
  v_id uuid;
begin
  if char_length(v_device_id) < 16 or char_length(v_device_id) > 160 then
    raise exception 'invalid device id';
  end if;
  if char_length(v_token) < 32 or char_length(v_token) > 4096 then
    raise exception 'invalid push token';
  end if;

  delete from public.circle_push_devices
   where push_token=v_token
     and user_id<>v_uid;

  insert into public.circle_push_devices(
    user_id, device_id, push_provider, push_token, platform, app_version, enabled, updated_at, last_seen_at
  ) values (
    v_uid, v_device_id, 'fcm', v_token, 'android', left(nullif(trim(coalesce(p_app_version,'')),''),80), true, now(), now()
  )
  on conflict (user_id, device_id)
  do update set
    push_token=excluded.push_token,
    app_version=excluded.app_version,
    enabled=true,
    updated_at=now(),
    last_seen_at=now()
  returning id into v_id;

  return v_id;
end;
$function$;

create or replace function private.circle_unregister_push_device(p_device_id text)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_count integer;
begin
  update public.circle_push_devices
     set enabled=false, updated_at=now()
   where user_id=v_uid and device_id=trim(coalesce(p_device_id,'')) and enabled=true;
  get diagnostics v_count = row_count;
  return v_count>0;
end;
$function$;

create or replace function public.circle_register_push_device(
  p_device_id text,
  p_push_token text,
  p_app_version text default null
)
returns uuid
language sql
set search_path to ''
as $function$
  select private.circle_register_push_device(p_device_id,p_push_token,p_app_version);
$function$;

create or replace function public.circle_unregister_push_device(p_device_id text)
returns boolean
language sql
set search_path to ''
as $function$
  select private.circle_unregister_push_device(p_device_id);
$function$;

revoke all on function public.circle_register_push_device(text,text,text) from public, anon;
revoke all on function public.circle_unregister_push_device(text) from public, anon;
grant execute on function public.circle_register_push_device(text,text,text) to authenticated;
grant execute on function public.circle_unregister_push_device(text) to authenticated;
revoke all on function private.circle_register_push_device(text,text,text) from public, anon;
revoke all on function private.circle_unregister_push_device(text) from public, anon;
grant execute on function private.circle_register_push_device(text,text,text) to authenticated;
grant execute on function private.circle_unregister_push_device(text) to authenticated;
