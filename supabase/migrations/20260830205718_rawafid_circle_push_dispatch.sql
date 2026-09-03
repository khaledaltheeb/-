create extension if not exists pg_net;

alter table public.notifications
  add column if not exists push_nonce uuid not null default gen_random_uuid(),
  add column if not exists push_attempt_count integer not null default 0,
  add column if not exists push_last_attempt_at timestamptz,
  add column if not exists push_delivered_at timestamptz,
  add column if not exists push_last_error text;

alter table public.notifications
  drop constraint if exists notifications_push_attempt_count_check;
alter table public.notifications
  add constraint notifications_push_attempt_count_check check (push_attempt_count between 0 and 20);

create index if not exists notifications_circle_push_pending_idx
  on public.notifications(created_at)
  where kind like 'circle\_%' escape '\' and push_delivered_at is null;

create or replace function public.circle_push_claim(
  p_notification_id uuid,
  p_nonce uuid
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_notification public.notifications%rowtype;
  v_devices jsonb := '[]'::jsonb;
begin
  select n.*
    into v_notification
    from public.notifications n
   where n.id = p_notification_id
     and n.push_nonce = p_nonce
     and n.kind like 'circle\_%' escape '\'
   for update;

  if not found then
    return null;
  end if;

  if v_notification.push_delivered_at is not null then
    return jsonb_build_object(
      'notification_id', v_notification.id,
      'user_id', v_notification.user_id,
      'kind', v_notification.kind,
      'already_delivered', true,
      'devices', '[]'::jsonb
    );
  end if;

  if v_notification.push_attempt_count >= 10 then
    return null;
  end if;

  update public.notifications
     set push_attempt_count = push_attempt_count + 1,
         push_last_attempt_at = now()
   where id = v_notification.id;

  select coalesce(jsonb_agg(jsonb_build_object('device_id', x.device_id, 'token', x.push_token)), '[]'::jsonb)
    into v_devices
    from (
      select d.device_id, d.push_token
        from public.circle_push_devices d
       where d.user_id = v_notification.user_id
         and d.enabled = true
         and d.last_seen_at >= now() - interval '180 days'
       order by d.updated_at desc
       limit 10
    ) x;

  return jsonb_build_object(
    'notification_id', v_notification.id,
    'user_id', v_notification.user_id,
    'kind', v_notification.kind,
    'already_delivered', false,
    'devices', v_devices
  );
end;
$function$;

create or replace function public.circle_push_complete(
  p_notification_id uuid,
  p_nonce uuid,
  p_success boolean,
  p_error text default null,
  p_disable_tokens text[] default array[]::text[]
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid;
begin
  select n.user_id
    into v_user_id
    from public.notifications n
   where n.id = p_notification_id
     and n.push_nonce = p_nonce
     and n.kind like 'circle\_%' escape '\';

  if v_user_id is null then
    return false;
  end if;

  if coalesce(array_length(p_disable_tokens, 1), 0) > 0 then
    update public.circle_push_devices
       set enabled = false,
           updated_at = now()
     where user_id = v_user_id
       and push_token = any(p_disable_tokens);
  end if;

  update public.notifications
     set push_delivered_at = case when p_success then coalesce(push_delivered_at, now()) else push_delivered_at end,
         push_last_error = case when p_success and p_error is null then null else left(p_error, 1200) end
   where id = p_notification_id
     and push_nonce = p_nonce;

  return found;
end;
$function$;

revoke all on function public.circle_push_claim(uuid,uuid) from public, anon, authenticated;
revoke all on function public.circle_push_complete(uuid,uuid,boolean,text,text[]) from public, anon, authenticated;
grant execute on function public.circle_push_claim(uuid,uuid) to service_role;
grant execute on function public.circle_push_complete(uuid,uuid,boolean,text,text[]) to service_role;

create or replace function private.enqueue_circle_push_notification()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.kind like 'circle\_%' escape '\' then
    perform net.http_post(
      url := 'https://ghljwfwqsyfnthvlzxjy.supabase.co/functions/v1/rawafid-circle-push',
      body := jsonb_build_object('notification_id', new.id, 'nonce', new.push_nonce),
      headers := '{"Content-Type":"application/json"}'::jsonb,
      timeout_milliseconds := 5000
    );
  end if;
  return new;
end;
$function$;

revoke all on function private.enqueue_circle_push_notification() from public, anon, authenticated;

drop trigger if exists notifications_circle_push_dispatch on public.notifications;
create trigger notifications_circle_push_dispatch
after insert on public.notifications
for each row
when (new.kind like 'circle\_%' escape '\')
execute function private.enqueue_circle_push_notification();
