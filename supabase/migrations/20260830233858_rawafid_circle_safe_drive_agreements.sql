create table if not exists public.circle_drive_agreements (
  connection_id uuid not null references public.circle_connections(id) on delete cascade,
  grantor_id uuid not null references auth.users(id) on delete cascade,
  incidents_enabled boolean not null default true,
  risk_alerts_enabled boolean not null default true,
  trip_reports_enabled boolean not null default true,
  speed_threshold_kmh smallint not null default 120,
  persistent_speed_seconds integer not null default 120,
  updated_at timestamptz not null default now(),
  primary key (connection_id, grantor_id),
  constraint circle_drive_agreements_speed_check check (speed_threshold_kmh between 50 and 180),
  constraint circle_drive_agreements_duration_check check (persistent_speed_seconds between 30 and 900)
);

alter table public.circle_drive_agreements enable row level security;
revoke all on table public.circle_drive_agreements from anon, authenticated;
drop policy if exists circle_drive_agreements_deny_direct on public.circle_drive_agreements;
create policy circle_drive_agreements_deny_direct
  on public.circle_drive_agreements for all to anon, authenticated using (false) with check (false);

create or replace function private.circle_get_drive_agreements()
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
  select c.id,
    coalesce(cp.enabled,false),
    coalesce(da.incidents_enabled,true),
    coalesce(da.risk_alerts_enabled,true),
    coalesce(da.trip_reports_enabled,true),
    coalesce(da.speed_threshold_kmh,120)::integer,
    coalesce(da.persistent_speed_seconds,120)::integer
  from public.circle_connections c
  left join public.circle_permissions cp
    on cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='driving_safety'
  left join public.circle_drive_agreements da
    on da.connection_id=c.id and da.grantor_id=v_uid
  where c.status='accepted'
    and (c.requester_id=v_uid or c.receiver_id=v_uid)
    and not exists(
      select 1 from public.user_blocks b
      where (b.blocker_id=v_uid and b.blocked_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end)
         or (b.blocker_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end and b.blocked_id=v_uid)
    )
  order by c.updated_at desc;
end;
$function$;

create or replace function public.circle_get_drive_agreements()
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
as $function$ select * from private.circle_get_drive_agreements(); $function$;
revoke all on function public.circle_get_drive_agreements() from public, anon;
grant execute on function public.circle_get_drive_agreements() to authenticated, service_role;

create or replace function private.circle_set_drive_agreement(
  p_connection_id uuid,
  p_incidents_enabled boolean,
  p_risk_alerts_enabled boolean,
  p_trip_reports_enabled boolean,
  p_speed_threshold_kmh integer,
  p_persistent_speed_seconds integer
)
returns boolean language plpgsql security definer set search_path to ''
as $function$
declare v_uid uuid := private.require_active_user();
begin
  if p_speed_threshold_kmh is null or p_speed_threshold_kmh not between 50 and 180 then raise exception 'invalid drive speed threshold'; end if;
  if p_persistent_speed_seconds is null or p_persistent_speed_seconds not between 30 and 900 then raise exception 'invalid persistent speed duration'; end if;
  if not exists(
    select 1 from public.circle_connections c
    where c.id=p_connection_id and c.status='accepted'
      and (c.requester_id=v_uid or c.receiver_id=v_uid)
  ) then raise exception 'connection unavailable'; end if;

  insert into public.circle_drive_agreements(
    connection_id,grantor_id,incidents_enabled,risk_alerts_enabled,trip_reports_enabled,
    speed_threshold_kmh,persistent_speed_seconds,updated_at
  ) values(
    p_connection_id,v_uid,coalesce(p_incidents_enabled,false),coalesce(p_risk_alerts_enabled,false),
    coalesce(p_trip_reports_enabled,false),p_speed_threshold_kmh,p_persistent_speed_seconds,now()
  )
  on conflict(connection_id,grantor_id) do update set
    incidents_enabled=excluded.incidents_enabled,
    risk_alerts_enabled=excluded.risk_alerts_enabled,
    trip_reports_enabled=excluded.trip_reports_enabled,
    speed_threshold_kmh=excluded.speed_threshold_kmh,
    persistent_speed_seconds=excluded.persistent_speed_seconds,
    updated_at=now();
  return true;
end;
$function$;

create or replace function public.circle_set_drive_agreement(
  p_connection_id uuid,
  p_incidents_enabled boolean,
  p_risk_alerts_enabled boolean,
  p_trip_reports_enabled boolean,
  p_speed_threshold_kmh integer,
  p_persistent_speed_seconds integer
)
returns boolean language sql set search_path to ''
as $function$
  select private.circle_set_drive_agreement(
    p_connection_id,p_incidents_enabled,p_risk_alerts_enabled,p_trip_reports_enabled,
    p_speed_threshold_kmh,p_persistent_speed_seconds
  );
$function$;
revoke all on function public.circle_set_drive_agreement(uuid,boolean,boolean,boolean,integer,integer) from public, anon;
grant execute on function public.circle_set_drive_agreement(uuid,boolean,boolean,boolean,integer,integer) to authenticated, service_role;

create or replace function private.circle_send_drive_risk_to_connection(
  p_connection_id uuid,
  p_speed_kmh double precision,
  p_continuous_seconds integer,
  p_summary text
)
returns boolean language plpgsql security definer set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_recipient uuid;
  v_threshold integer;
  v_seconds integer;
  v_summary text := left(nullif(trim(coalesce(p_summary,'')),''),900);
  v_message_id uuid;
begin
  if p_speed_kmh is null or p_speed_kmh < 0 or p_speed_kmh > 350 then raise exception 'invalid drive speed'; end if;
  if p_continuous_seconds is null or p_continuous_seconds < 0 or p_continuous_seconds > 7200 then raise exception 'invalid continuous speed duration'; end if;
  if v_summary is null then raise exception 'drive risk summary required'; end if;

  select case when c.requester_id=v_uid then c.receiver_id else c.requester_id end,
    coalesce(da.speed_threshold_kmh,120)::integer,
    coalesce(da.persistent_speed_seconds,120)::integer
  into v_recipient,v_threshold,v_seconds
  from public.circle_connections c
  join public.circle_permissions cp
    on cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='driving_safety' and cp.enabled=true
  left join public.circle_drive_agreements da
    on da.connection_id=c.id and da.grantor_id=v_uid
  where c.id=p_connection_id and c.status='accepted'
    and (c.requester_id=v_uid or c.receiver_id=v_uid)
    and coalesce(da.risk_alerts_enabled,true)=true
    and not exists(
      select 1 from public.user_blocks b
      where (b.blocker_id=v_uid and b.blocked_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end)
         or (b.blocker_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end and b.blocked_id=v_uid)
    );

  if v_recipient is null then return false; end if;
  if p_speed_kmh < v_threshold or p_continuous_seconds < v_seconds then return false; end if;
  if (select count(*) from public.circle_messages m where m.sender_id=v_uid and m.connection_id=p_connection_id and m.template_key='safe_drive_risk' and m.created_at>now()-interval '1 hour') >= 12 then return false; end if;

  insert into public.circle_messages(connection_id,sender_id,kind,body,template_key,metadata)
    values(p_connection_id,v_uid,'text',v_summary,'safe_drive_risk',jsonb_build_object(
      'driving_event','persistent_speed','automatic',true,'location_shared',false,
      'speed_kmh',p_speed_kmh,'continuous_seconds',p_continuous_seconds,
      'agreement_speed_threshold_kmh',v_threshold,'agreement_persistent_seconds',v_seconds
    )) returning id into v_message_id;

  insert into public.notifications(user_id,kind,title,body,data)
    values(v_recipient,'circle_drive_risk','تنبيه قيادة آمنة من دائرتك',v_summary,jsonb_build_object(
      'circle_connection_id',p_connection_id,'circle_message_id',v_message_id,'message_kind','text',
      'driving_event','persistent_speed','urgent',false,'location_shared',false
    ));
  return true;
end;
$function$;

create or replace function public.circle_send_drive_risk_to_connection(
  p_connection_id uuid,
  p_speed_kmh double precision,
  p_continuous_seconds integer,
  p_summary text
)
returns boolean language sql set search_path to ''
as $function$ select private.circle_send_drive_risk_to_connection(p_connection_id,p_speed_kmh,p_continuous_seconds,p_summary); $function$;
revoke all on function public.circle_send_drive_risk_to_connection(uuid,double precision,integer,text) from public, anon;
grant execute on function public.circle_send_drive_risk_to_connection(uuid,double precision,integer,text) to authenticated, service_role;

create or replace function private.circle_broadcast_drive_alert(
  p_latitude double precision,
  p_longitude double precision,
  p_accuracy_m double precision default null,
  p_event text default 'help_requested',
  p_summary text default null
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
    select c.id as connection_id, case when c.requester_id=v_uid then c.receiver_id else c.requester_id end as recipient_id
    from public.circle_connections c
    join public.circle_permissions cp
      on cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='driving_safety' and cp.enabled=true
    left join public.circle_drive_agreements da
      on da.connection_id=c.id and da.grantor_id=v_uid
    where c.status='accepted'
      and (c.requester_id=v_uid or c.receiver_id=v_uid)
      and case when v_event='risky_driving' then coalesce(da.risk_alerts_enabled,true) else coalesce(da.incidents_enabled,true) end
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
        'circle_connection_id',v_row.connection_id,'circle_message_id',v_message_id,
        'message_kind',case when v_event='risky_driving' then 'text' else 'location_share' end,
        'driving_event',v_event,'urgent',v_event<>'risky_driving','location_shared',v_event<>'risky_driving'
      ));
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$function$;

create or replace function private.circle_broadcast_drive_report(
  p_summary text,
  p_score integer,
  p_max_speed_kmh double precision,
  p_duration_seconds integer,
  p_distance_km double precision,
  p_high_speed_seconds integer,
  p_event_count integer
)
returns integer language plpgsql security definer set search_path to ''
as $function$
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
  if (select count(*) from public.circle_messages m where m.sender_id=v_uid and m.template_key='safe_drive_report' and m.created_at>now()-interval '1 day') >= 40 then raise exception 'drive report rate limit exceeded'; end if;

  for v_row in
    select c.id as connection_id, case when c.requester_id=v_uid then c.receiver_id else c.requester_id end as recipient_id
    from public.circle_connections c
    join public.circle_permissions cp
      on cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='driving_safety' and cp.enabled=true
    left join public.circle_drive_agreements da
      on da.connection_id=c.id and da.grantor_id=v_uid
    where c.status='accepted'
      and (c.requester_id=v_uid or c.receiver_id=v_uid)
      and coalesce(da.trip_reports_enabled,true)=true
      and not exists(
        select 1 from public.user_blocks b
        where (b.blocker_id=v_uid and b.blocked_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end)
           or (b.blocker_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end and b.blocked_id=v_uid)
      )
    order by c.updated_at desc limit 20
  loop
    insert into public.circle_messages(connection_id,sender_id,kind,body,template_key,metadata)
      values(v_row.connection_id,v_uid,'text',v_summary,'safe_drive_report',jsonb_build_object(
        'score',p_score,'max_speed_kmh',p_max_speed_kmh,'duration_seconds',p_duration_seconds,
        'distance_km',p_distance_km,'high_speed_seconds',p_high_speed_seconds,'event_count',p_event_count
      )) returning id into v_message_id;
    insert into public.notifications(user_id,kind,title,body,data)
      values(v_row.recipient_id,'circle_drive_report','تقرير قيادة آمنة من دائرتك',left(v_summary,700),jsonb_build_object(
        'circle_connection_id',v_row.connection_id,'circle_message_id',v_message_id,'message_kind','text','drive_score',p_score
      ));
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$function$;
