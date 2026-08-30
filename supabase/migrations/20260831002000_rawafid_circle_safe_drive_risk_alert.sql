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
  if v_event not in ('help_requested','sudden_stop_unanswered','possible_incident','risky_driving') then
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
        case when v_event='risky_driving' then 'text' else 'location_share' end,
        v_summary,
        case when v_event='risky_driving' then 'safe_drive_risk' else 'safe_drive_incident' end,
        jsonb_build_object(
          'latitude',p_latitude,
          'longitude',p_longitude,
          'accuracy_m',p_accuracy_m,
          'driving_event',v_event,
          'automatic',v_event in ('sudden_stop_unanswered','risky_driving')
        )
      ) returning id into v_message_id;

    insert into public.notifications(user_id,kind,title,body,data)
      values(
        v_row.recipient_id,
        case when v_event='risky_driving' then 'circle_drive_risk' else 'circle_drive_alert' end,
        case when v_event='risky_driving' then 'تنبيه قيادة آمنة من دائرتك' else 'تنبيه مساعدة من قيادة آمنة' end,
        v_summary,
        jsonb_build_object(
          'circle_connection_id',v_row.connection_id,
          'circle_message_id',v_message_id,
          'message_kind',case when v_event='risky_driving' then 'text' else 'location_share' end,
          'driving_event',v_event,
          'urgent',v_event<>'risky_driving'
        )
      );
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
