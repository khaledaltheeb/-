create or replace function private.circle_get_custom_drive_agreements()
returns table(
  connection_id uuid,
  permission_enabled boolean,
  incidents_enabled boolean,
  risk_alerts_enabled boolean,
  trip_reports_enabled boolean,
  speed_threshold_kmh integer,
  persistent_speed_seconds integer
)
language plpgsql stable security definer set search_path to ''
as $function$
declare v_uid uuid := private.require_active_user();
begin
  return query
  select c.id,coalesce(cp.enabled,false),da.incidents_enabled,da.risk_alerts_enabled,da.trip_reports_enabled,
    da.speed_threshold_kmh::integer,da.persistent_speed_seconds::integer
  from public.circle_connections c
  join public.circle_drive_agreements da on da.connection_id=c.id and da.grantor_id=v_uid
  left join public.circle_permissions cp on cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='driving_safety'
  where c.status='accepted' and (c.requester_id=v_uid or c.receiver_id=v_uid)
    and not exists(
      select 1 from public.user_blocks b
      where (b.blocker_id=v_uid and b.blocked_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end)
         or (b.blocker_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end and b.blocked_id=v_uid)
    )
  order by c.updated_at desc;
end;
$function$;

create or replace function public.circle_get_custom_drive_agreements()
returns table(
  connection_id uuid,
  permission_enabled boolean,
  incidents_enabled boolean,
  risk_alerts_enabled boolean,
  trip_reports_enabled boolean,
  speed_threshold_kmh integer,
  persistent_speed_seconds integer
)
language sql stable set search_path to ''
as $function$ select * from private.circle_get_custom_drive_agreements(); $function$;
revoke all on function public.circle_get_custom_drive_agreements() from public, anon;
grant execute on function public.circle_get_custom_drive_agreements() to authenticated, service_role;

create or replace function private.circle_send_drive_alert_to_connection(
  p_connection_id uuid,
  p_event text,
  p_speed_kmh double precision,
  p_continuous_seconds integer,
  p_summary text
)
returns boolean language plpgsql security definer set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_event text := lower(trim(coalesce(p_event,'')));
  v_recipient uuid;
  v_threshold integer;
  v_seconds integer;
  v_summary text := left(nullif(trim(coalesce(p_summary,'')),''),900);
  v_message_id uuid;
begin
  if v_event not in ('persistent_speed','severe_speed','risk_cluster') then raise exception 'unsupported targeted drive alert'; end if;
  if p_speed_kmh is null or p_speed_kmh < 0 or p_speed_kmh > 350 then raise exception 'invalid drive speed'; end if;
  if p_continuous_seconds is null or p_continuous_seconds < 0 or p_continuous_seconds > 7200 then raise exception 'invalid continuous speed duration'; end if;
  if v_summary is null then raise exception 'drive risk summary required'; end if;

  select case when c.requester_id=v_uid then c.receiver_id else c.requester_id end,
    da.speed_threshold_kmh::integer,da.persistent_speed_seconds::integer
  into v_recipient,v_threshold,v_seconds
  from public.circle_connections c
  join public.circle_permissions cp
    on cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='driving_safety' and cp.enabled=true
  join public.circle_drive_agreements da
    on da.connection_id=c.id and da.grantor_id=v_uid and da.risk_alerts_enabled=true
  where c.id=p_connection_id and c.status='accepted' and (c.requester_id=v_uid or c.receiver_id=v_uid)
    and not exists(
      select 1 from public.user_blocks b
      where (b.blocker_id=v_uid and b.blocked_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end)
         or (b.blocker_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end and b.blocked_id=v_uid)
    );

  if v_recipient is null then return false; end if;
  if v_event='persistent_speed' and (p_speed_kmh < v_threshold or p_continuous_seconds < v_seconds) then return false; end if;
  if (select count(*) from public.circle_messages m where m.sender_id=v_uid and m.connection_id=p_connection_id and m.template_key='safe_drive_risk' and m.created_at>now()-interval '1 hour') >= 18 then return false; end if;

  insert into public.circle_messages(connection_id,sender_id,kind,body,template_key,metadata)
    values(p_connection_id,v_uid,'text',v_summary,'safe_drive_risk',jsonb_build_object(
      'driving_event',v_event,'automatic',true,'location_shared',false,'speed_kmh',p_speed_kmh,
      'continuous_seconds',p_continuous_seconds,'agreement_speed_threshold_kmh',v_threshold,
      'agreement_persistent_seconds',v_seconds
    )) returning id into v_message_id;

  insert into public.notifications(user_id,kind,title,body,data)
    values(v_recipient,'circle_drive_risk','تنبيه قيادة آمنة من دائرتك',v_summary,jsonb_build_object(
      'circle_connection_id',p_connection_id,'circle_message_id',v_message_id,'message_kind','text',
      'driving_event',v_event,'urgent',v_event in ('severe_speed','risk_cluster'),'location_shared',false
    ));
  return true;
end;
$function$;

create or replace function public.circle_send_drive_alert_to_connection(
  p_connection_id uuid,
  p_event text,
  p_speed_kmh double precision,
  p_continuous_seconds integer,
  p_summary text
)
returns boolean language sql set search_path to ''
as $function$ select private.circle_send_drive_alert_to_connection(p_connection_id,p_event,p_speed_kmh,p_continuous_seconds,p_summary); $function$;
revoke all on function public.circle_send_drive_alert_to_connection(uuid,text,double precision,integer,text) from public, anon;
grant execute on function public.circle_send_drive_alert_to_connection(uuid,text,double precision,integer,text) to authenticated, service_role;

create or replace function private.circle_broadcast_drive_alert(
  p_latitude double precision,p_longitude double precision,p_accuracy_m double precision default null,
  p_event text default 'help_requested',p_summary text default null
)
returns integer language plpgsql security definer set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_event text := lower(trim(coalesce(p_event,'')));
  v_summary text := left(nullif(trim(coalesce(p_summary,'')),''),900);
  v_count integer := 0;
  v_row record;
  v_message_id uuid;
  v_metadata jsonb;
begin
  if v_event not in ('help_requested','sudden_stop_unanswered','possible_incident','risky_driving') then raise exception 'unsupported drive alert'; end if;
  if v_event <> 'risky_driving' then
    if p_latitude is null or p_longitude is null or p_latitude < -90 or p_latitude > 90 or p_longitude < -180 or p_longitude > 180 then raise exception 'invalid location'; end if;
    if p_accuracy_m is not null and (p_accuracy_m < 0 or p_accuracy_m > 100000) then raise exception 'invalid location accuracy'; end if;
  end if;
  if v_summary is null then v_summary := 'صدر تنبيه من قيادة آمنة ويحتاج صاحب الحساب إلى الاطمئنان عليه.'; end if;

  if v_event='risky_driving' then
    if (select count(*) from public.circle_messages m where m.sender_id=v_uid and m.template_key='safe_drive_risk' and m.created_at>now()-interval '1 hour') >= 30 then raise exception 'drive risk alert rate limit exceeded'; end if;
    v_metadata := jsonb_build_object('driving_event',v_event,'automatic',true,'location_shared',false);
  else
    if (select count(*) from public.circle_messages m where m.sender_id=v_uid and m.template_key='safe_drive_incident' and m.created_at>now()-interval '1 hour') >= 12 then raise exception 'drive incident alert rate limit exceeded'; end if;
    v_metadata := jsonb_build_object('latitude',p_latitude,'longitude',p_longitude,'accuracy_m',p_accuracy_m,'driving_event',v_event,'automatic',v_event='sudden_stop_unanswered','location_shared',true);
  end if;

  for v_row in
    select c.id as connection_id,case when c.requester_id=v_uid then c.receiver_id else c.requester_id end as recipient_id
    from public.circle_connections c
    join public.circle_permissions cp on cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='driving_safety' and cp.enabled=true
    left join public.circle_drive_agreements da on da.connection_id=c.id and da.grantor_id=v_uid
    where c.status='accepted' and (c.requester_id=v_uid or c.receiver_id=v_uid)
      and ((v_event='risky_driving' and da.connection_id is null) or (v_event<>'risky_driving' and coalesce(da.incidents_enabled,true)=true))
      and not exists(
        select 1 from public.user_blocks b
        where (b.blocker_id=v_uid and b.blocked_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end)
           or (b.blocker_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end and b.blocked_id=v_uid)
      )
    order by c.updated_at desc limit 20
  loop
    insert into public.circle_messages(connection_id,sender_id,kind,body,template_key,metadata)
      values(v_row.connection_id,v_uid,case when v_event='risky_driving' then 'text' else 'location_share' end,v_summary,case when v_event='risky_driving' then 'safe_drive_risk' else 'safe_drive_incident' end,v_metadata)
      returning id into v_message_id;
    insert into public.notifications(user_id,kind,title,body,data)
      values(v_row.recipient_id,case when v_event='risky_driving' then 'circle_drive_risk' else 'circle_drive_alert' end,case when v_event='risky_driving' then 'تنبيه قيادة آمنة من دائرتك' else 'تنبيه مساعدة من قيادة آمنة' end,v_summary,jsonb_build_object(
        'circle_connection_id',v_row.connection_id,'circle_message_id',v_message_id,'message_kind',case when v_event='risky_driving' then 'text' else 'location_share' end,
        'driving_event',v_event,'urgent',v_event<>'risky_driving','location_shared',v_event<>'risky_driving'
      ));
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$function$;
