select cron.unschedule(jobid)
  from cron.job
 where jobname = 'rawafid-circle-push-retry';

drop trigger if exists notifications_circle_push_dispatch on public.notifications;
drop function if exists private.enqueue_circle_push_notification();
drop function if exists private.retry_pending_circle_pushes();

drop extension if exists pg_net;
create extension pg_net with schema extensions;

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

create trigger notifications_circle_push_dispatch
after insert on public.notifications
for each row
when (new.kind like 'circle\_%' escape '\')
execute function private.enqueue_circle_push_notification();

create or replace function private.retry_pending_circle_pushes()
returns integer
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_row record;
  v_count integer := 0;
begin
  for v_row in
    select n.id, n.push_nonce, n.push_attempt_count
      from public.notifications n
     where n.kind like 'circle\_%' escape '\'
       and n.push_delivered_at is null
       and n.push_attempt_count < 10
       and n.created_at >= now() - interval '24 hours'
       and n.created_at <= now() - interval '1 minute'
       and (
         n.push_last_attempt_at is null
         or n.push_last_attempt_at <= now() - case
           when n.push_attempt_count <= 1 then interval '1 minute'
           when n.push_attempt_count = 2 then interval '2 minutes'
           when n.push_attempt_count = 3 then interval '4 minutes'
           when n.push_attempt_count = 4 then interval '8 minutes'
           else interval '15 minutes'
         end
       )
     order by n.created_at
     limit 100
  loop
    perform net.http_post(
      url := 'https://ghljwfwqsyfnthvlzxjy.supabase.co/functions/v1/rawafid-circle-push',
      body := jsonb_build_object('notification_id', v_row.id, 'nonce', v_row.push_nonce),
      headers := '{"Content-Type":"application/json"}'::jsonb,
      timeout_milliseconds := 5000
    );
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$function$;

revoke all on function private.retry_pending_circle_pushes() from public, anon, authenticated;

select cron.schedule(
  'rawafid-circle-push-retry',
  '* * * * *',
  'select private.retry_pending_circle_pushes();'
);
