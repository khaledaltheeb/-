alter table public.circle_drive_agreements
  add column if not exists weekly_reports_enabled boolean not null default false;

create or replace function private.circle_get_drive_weekly_preferences()
returns table(
  connection_id uuid,
  permission_enabled boolean,
  weekly_reports_enabled boolean
)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
begin
  return query
  select c.id,coalesce(cp.enabled,false),coalesce(da.weekly_reports_enabled,false)
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

create or replace function public.circle_get_drive_weekly_preferences()
returns table(connection_id uuid,permission_enabled boolean,weekly_reports_enabled boolean)
language sql stable set search_path to ''
as $function$ select * from private.circle_get_drive_weekly_preferences(); $function$;
revoke all on function public.circle_get_drive_weekly_preferences() from public, anon;
grant execute on function public.circle_get_drive_weekly_preferences() to authenticated, service_role;

create or replace function private.circle_set_drive_weekly_report_enabled(p_connection_id uuid,p_enabled boolean)
returns boolean language plpgsql security definer set search_path to ''
as $function$
declare v_uid uuid := private.require_active_user();
begin
  if not exists(
    select 1 from public.circle_connections c
    where c.id=p_connection_id and c.status='accepted' and (c.requester_id=v_uid or c.receiver_id=v_uid)
  ) then raise exception 'connection unavailable'; end if;

  insert into public.circle_drive_agreements(
    connection_id,grantor_id,incidents_enabled,risk_alerts_enabled,trip_reports_enabled,
    speed_threshold_kmh,persistent_speed_seconds,weekly_reports_enabled,updated_at
  ) values(p_connection_id,v_uid,true,true,true,120,120,coalesce(p_enabled,false),now())
  on conflict(connection_id,grantor_id) do update set
    weekly_reports_enabled=excluded.weekly_reports_enabled,
    updated_at=now();
  return true;
end;
$function$;

create or replace function public.circle_set_drive_weekly_report_enabled(p_connection_id uuid,p_enabled boolean)
returns boolean language sql set search_path to ''
as $function$ select private.circle_set_drive_weekly_report_enabled(p_connection_id,p_enabled); $function$;
revoke all on function public.circle_set_drive_weekly_report_enabled(uuid,boolean) from public, anon;
grant execute on function public.circle_set_drive_weekly_report_enabled(uuid,boolean) to authenticated, service_role;

create or replace function private.circle_send_drive_weekly_report_to_connection(
  p_connection_id uuid,
  p_week_key text,
  p_summary text,
  p_trip_count integer,
  p_distance_km double precision,
  p_duration_seconds integer,
  p_average_score integer,
  p_harsh_rate_per_100km double precision
)
returns boolean language plpgsql security definer set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_recipient uuid;
  v_week_key text := upper(trim(coalesce(p_week_key,'')));
  v_summary text := left(nullif(trim(coalesce(p_summary,'')),''),1500);
  v_message_id uuid;
begin
  if v_week_key !~ '^[0-9]{4}-W[0-9]{2}$' then raise exception 'invalid week key'; end if;
  if v_summary is null then raise exception 'weekly drive report summary required'; end if;
  if p_trip_count is null or p_trip_count < 1 or p_trip_count > 500 then raise exception 'invalid trip count'; end if;
  if p_distance_km is null or p_distance_km < 0 or p_distance_km > 10000 then raise exception 'invalid distance'; end if;
  if p_duration_seconds is null or p_duration_seconds < 0 or p_duration_seconds > 1209600 then raise exception 'invalid duration'; end if;
  if p_average_score is not null and (p_average_score < 0 or p_average_score > 100) then raise exception 'invalid average score'; end if;
  if p_harsh_rate_per_100km is not null and (p_harsh_rate_per_100km < 0 or p_harsh_rate_per_100km > 10000) then raise exception 'invalid harsh event rate'; end if;

  select case when c.requester_id=v_uid then c.receiver_id else c.requester_id end
  into v_recipient
  from public.circle_connections c
  join public.circle_permissions cp
    on cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='driving_safety' and cp.enabled=true
  join public.circle_drive_agreements da
    on da.connection_id=c.id and da.grantor_id=v_uid and da.weekly_reports_enabled=true
  where c.id=p_connection_id and c.status='accepted' and (c.requester_id=v_uid or c.receiver_id=v_uid)
    and not exists(
      select 1 from public.user_blocks b
      where (b.blocker_id=v_uid and b.blocked_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end)
         or (b.blocker_id=case when c.requester_id=v_uid then c.receiver_id else c.requester_id end and b.blocked_id=v_uid)
    );
  if v_recipient is null then return false; end if;

  if exists(
    select 1 from public.circle_messages m
    where m.sender_id=v_uid and m.connection_id=p_connection_id
      and m.template_key='safe_drive_weekly_report' and m.metadata->>'week_key'=v_week_key
  ) then return true; end if;

  insert into public.circle_messages(connection_id,sender_id,kind,body,template_key,metadata)
  values(
    p_connection_id,v_uid,'text',v_summary,'safe_drive_weekly_report',
    jsonb_build_object(
      'week_key',v_week_key,'trip_count',p_trip_count,'distance_km',p_distance_km,
      'duration_seconds',p_duration_seconds,'average_score',p_average_score,
      'harsh_rate_per_100km',p_harsh_rate_per_100km,'automatic',true,'location_shared',false
    )
  ) returning id into v_message_id;

  insert into public.notifications(user_id,kind,title,body,data)
  values(
    v_recipient,'circle_drive_weekly_report','ملخص أسبوعي للقيادة الآمنة',left(v_summary,700),
    jsonb_build_object(
      'circle_connection_id',p_connection_id,'circle_message_id',v_message_id,
      'message_kind','text','week_key',v_week_key,'automatic',true,'location_shared',false
    )
  );
  return true;
end;
$function$;

create or replace function public.circle_send_drive_weekly_report_to_connection(
  p_connection_id uuid,p_week_key text,p_summary text,p_trip_count integer,p_distance_km double precision,
  p_duration_seconds integer,p_average_score integer,p_harsh_rate_per_100km double precision
)
returns boolean language sql set search_path to ''
as $function$
  select private.circle_send_drive_weekly_report_to_connection(
    p_connection_id,p_week_key,p_summary,p_trip_count,p_distance_km,p_duration_seconds,
    p_average_score,p_harsh_rate_per_100km
  );
$function$;
revoke all on function public.circle_send_drive_weekly_report_to_connection(uuid,text,text,integer,double precision,integer,integer,double precision) from public, anon;
grant execute on function public.circle_send_drive_weekly_report_to_connection(uuid,text,text,integer,double precision,integer,integer,double precision) to authenticated, service_role;
