-- Rawafid Safe Drive: explicit, revocable Circle permission plus aggregate
-- driving-safety alert/report delivery. No route trace is stored or exposed.

create or replace function private.circle_set_permission(
  p_connection_id uuid,
  p_permission text,
  p_enabled boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_uid uuid := private.require_active_user();
begin
  if p_permission not in (
    'chat','quick_questions','location_request','emergency','safe_arrival',
    'care','safety_location','driving_safety'
  ) then
    raise exception 'unsupported permission';
  end if;
  if not exists(
    select 1 from public.circle_connections c
    where c.id=p_connection_id and c.status='accepted'
      and (c.requester_id=v_uid or c.receiver_id=v_uid)
  ) then
    raise exception 'connection unavailable';
  end if;
  insert into public.circle_permissions(connection_id,grantor_id,permission,enabled)
    values(p_connection_id,v_uid,p_permission,coalesce(p_enabled,false))
  on conflict(connection_id,grantor_id,permission)
    do update set enabled=excluded.enabled,updated_at=now();
  return coalesce(p_enabled,false);
end;
$$;

create or replace function private.circle_get_permissions(p_connection_id uuid)
returns table(permission text, mine boolean, theirs boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_active_user();
  v_other uuid;
begin
  select case when c.requester_id=v_uid then c.receiver_id else c.requester_id end
    into v_other
  from public.circle_connections c
  where c.id=p_connection_id and c.status='accepted'
    and (c.requester_id=v_uid or c.receiver_id=v_uid);
  if v_other is null then raise exception 'connection unavailable'; end if;
  return query
  select p.permission,
    coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=p_connection_id and cp.grantor_id=v_uid and cp.permission=p.permission), false),
    coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=p_connection_id and cp.grantor_id=v_other and cp.permission=p.permission), false)
  from (values
    ('chat'::text),('quick_questions'::text),('location_request'::text),('emergency'::text),
    ('safe_arrival'::text),('care'::text),('safety_location'::text),('driving_safety'::text)
  ) p(permission);
end;
$$;

create or replace function private.circle_broadcast_drive_alert(
  p_latitude double precision,
  p_longitude double precision,
  p_accuracy_m double precision default null,
  p_event text default 'help_requested',
  p_summary text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_active_user();
  v_event text := lower(trim(coalesce(p_event,'')));
  v_summary text := left(nullif(trim(coalesce(p_summary,'')),''),900);
  v_count integer := 0;
  v_row record;
  v_message_id uuid;
begin
  if p_latitude is null or p_longitude is null or p_latitude < -90 or p_latitude > 90 or p_longitude < -180 or p_longitude > 180 then
    raise exception 'invalid location';
  end if;
  if p_accuracy_m is not null and (p_accuracy_m < 0 or p_accuracy_m > 100000) then
    raise exception 'invalid location accuracy';
  end if;
  if v_event not in ('help_requested','sudden_stop_unanswered','possible_incident') then
    raise exception 'unsupported drive alert';
  end if;
  if v_summary is null then
    v_summary := 'صدر تنبيه من قيادة آمنة ويحتاج صاحب الحساب إلى الاطمئنان عليه.';
  end if;
  if (select count(*) from public.circle_messages m where m.sender_id=v_uid and m.template_key='safe_drive_incident' and m.created_at>now()-interval '1 hour') >= 12 then
    raise exception 'drive alert rate limit exceeded';
  end if;

  for v_row in
    select c.id as connection_id,
      case when c.requester_id=v_uid then c.receiver_id else c.requester_id end as recipient_id
    from public.circle_connections c
    join public.circle_permissions cp
      on cp.connection_id=c.id
     and cp.grantor_id=v_uid
     and cp.permission='driving_safety'
     and cp.enabled=true
    where c.status='accepted'
      and (c.requester_id=v_uid or c.receiver_id=v_uid)
      and not exists(
        select 1 from public.user_blocks b
        where (b.blocker_id=v_uid and b.blocked_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end)
           or (b.blocker_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end and b.blocked_id=v_uid)
      )
    order by c.updated_at desc
    limit 20
  loop
    insert into public.circle_messages(connection_id,sender_id,kind,body,template_key,metadata)
      values(
        v_row.connection_id,
        v_uid,
        'location_share',
        v_summary,
        'safe_drive_incident',
        jsonb_build_object(
          'latitude',p_latitude,
          'longitude',p_longitude,
          'accuracy_m',p_accuracy_m,
          'driving_event',v_event,
          'automatic',v_event='sudden_stop_unanswered'
        )
      ) returning id into v_message_id;

    insert into public.notifications(user_id,kind,title,body,data)
      values(
        v_row.recipient_id,
        'circle_drive_alert',
        'تنبيه قيادة آمنة من دائرتك',
        v_summary,
        jsonb_build_object(
          'circle_connection_id',v_row.connection_id,
          'circle_message_id',v_message_id,
          'message_kind','location_share',
          'driving_event',v_event,
          'urgent',true
        )
      );
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function private.circle_broadcast_drive_report(
  p_summary text,
  p_score integer,
  p_max_speed_kmh double precision,
  p_duration_seconds integer,
  p_distance_km double precision,
  p_high_speed_seconds integer,
  p_event_count integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_active_user();
  v_summary text := left(nullif(trim(coalesce(p_summary,'')),''),1500);
  v_count integer := 0;
  v_row record;
  v_message_id uuid;
begin
  if v_summary is null then raise exception 'drive report summary required'; end if;
  if p_score is null or p_score < 0 or p_score > 100 then raise exception 'invalid drive score'; end if;
  if p_max_speed_kmh is null or p_max_speed_kmh < 0 or p_max_speed_kmh > 350 then raise exception 'invalid max speed'; end if;
  if p_duration_seconds is null or p_duration_seconds < 0 or p_duration_seconds > 172800 then raise exception 'invalid duration'; end if;
  if p_distance_km is null or p_distance_km < 0 or p_distance_km > 3000 then raise exception 'invalid distance'; end if;
  if p_high_speed_seconds is null or p_high_speed_seconds < 0 or p_high_speed_seconds > p_duration_seconds then raise exception 'invalid high-speed duration'; end if;
  if p_event_count is null or p_event_count < 0 or p_event_count > 10000 then raise exception 'invalid event count'; end if;
  if (select count(*) from public.circle_messages m where m.sender_id=v_uid and m.template_key='safe_drive_report' and m.created_at>now()-interval '1 day') >= 40 then
    raise exception 'drive report rate limit exceeded';
  end if;

  for v_row in
    select c.id as connection_id,
      case when c.requester_id=v_uid then c.receiver_id else c.requester_id end as recipient_id
    from public.circle_connections c
    join public.circle_permissions cp
      on cp.connection_id=c.id
     and cp.grantor_id=v_uid
     and cp.permission='driving_safety'
     and cp.enabled=true
    where c.status='accepted'
      and (c.requester_id=v_uid or c.receiver_id=v_uid)
      and not exists(
        select 1 from public.user_blocks b
        where (b.blocker_id=v_uid and b.blocked_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end)
           or (b.blocker_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end and b.blocked_id=v_uid)
      )
    order by c.updated_at desc
    limit 20
  loop
    insert into public.circle_messages(connection_id,sender_id,kind,body,template_key,metadata)
      values(
        v_row.connection_id,
        v_uid,
        'text',
        v_summary,
        'safe_drive_report',
        jsonb_build_object(
          'score',p_score,
          'max_speed_kmh',p_max_speed_kmh,
          'duration_seconds',p_duration_seconds,
          'distance_km',p_distance_km,
          'high_speed_seconds',p_high_speed_seconds,
          'event_count',p_event_count
        )
      ) returning id into v_message_id;

    insert into public.notifications(user_id,kind,title,body,data)
      values(
        v_row.recipient_id,
        'circle_drive_report',
        'تقرير قيادة آمنة من دائرتك',
        left(v_summary,700),
        jsonb_build_object(
          'circle_connection_id',v_row.connection_id,
          'circle_message_id',v_message_id,
          'message_kind','text',
          'drive_score',p_score
        )
      );
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.circle_broadcast_drive_alert(
  p_latitude double precision,
  p_longitude double precision,
  p_accuracy_m double precision default null,
  p_event text default 'help_requested',
  p_summary text default null
)
returns integer
language sql
set search_path = ''
as $$
  select private.circle_broadcast_drive_alert(p_latitude,p_longitude,p_accuracy_m,p_event,p_summary);
$$;

create or replace function public.circle_broadcast_drive_report(
  p_summary text,
  p_score integer,
  p_max_speed_kmh double precision,
  p_duration_seconds integer,
  p_distance_km double precision,
  p_high_speed_seconds integer,
  p_event_count integer
)
returns integer
language sql
set search_path = ''
as $$
  select private.circle_broadcast_drive_report(p_summary,p_score,p_max_speed_kmh,p_duration_seconds,p_distance_km,p_high_speed_seconds,p_event_count);
$$;

revoke all on function public.circle_broadcast_drive_alert(double precision,double precision,double precision,text,text) from public, anon;
revoke all on function public.circle_broadcast_drive_report(text,integer,double precision,integer,double precision,integer,integer) from public, anon;
grant execute on function public.circle_broadcast_drive_alert(double precision,double precision,double precision,text,text) to authenticated;
grant execute on function public.circle_broadcast_drive_report(text,integer,double precision,integer,double precision,integer,integer) to authenticated;
