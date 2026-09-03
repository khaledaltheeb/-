create or replace function private.circle_get_permissions(p_connection_id uuid)
returns table(permission text, mine boolean, theirs boolean)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_other uuid;
begin
  select case when c.requester_id=v_uid then c.receiver_id else c.requester_id end
    into v_other
  from public.circle_connections c
  where c.id=p_connection_id
    and c.status='accepted'
    and (c.requester_id=v_uid or c.receiver_id=v_uid);
  if v_other is null then raise exception 'connection unavailable'; end if;
  return query
  select p.permission,
    coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=p_connection_id and cp.grantor_id=v_uid and cp.permission=p.permission), false),
    coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=p_connection_id and cp.grantor_id=v_other and cp.permission=p.permission), false)
  from (values
    ('chat'::text), ('quick_questions'::text), ('location_request'::text),
    ('emergency'::text), ('safe_arrival'::text), ('care'::text)
  ) as p(permission);
end;
$function$;

create or replace function public.circle_get_permissions(p_connection_id uuid)
returns table(permission text, mine boolean, theirs boolean)
language sql stable set search_path to ''
as $function$
  select * from private.circle_get_permissions(p_connection_id);
$function$;

revoke all on function public.circle_get_permissions(uuid) from public, anon;
grant execute on function public.circle_get_permissions(uuid) to authenticated;
grant execute on function private.circle_get_permissions(uuid) to authenticated;
