create table if not exists public.circle_identities (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rawafid_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint circle_identities_rawafid_id_format check (rawafid_id ~ '^RFD-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$')
);

create table if not exists public.circle_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  requester_label text not null,
  receiver_label text,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint circle_connections_distinct_members check (requester_id <> receiver_id),
  constraint circle_connections_status check (status in ('pending','accepted','rejected','removed')),
  constraint circle_connections_requester_label check (char_length(trim(requester_label)) between 1 and 80),
  constraint circle_connections_receiver_label check (receiver_label is null or char_length(trim(receiver_label)) between 1 and 80)
);

create unique index if not exists circle_connections_pair_unique
  on public.circle_connections ((least(requester_id::text, receiver_id::text)), (greatest(requester_id::text, receiver_id::text)));
create index if not exists circle_connections_requester_idx on public.circle_connections(requester_id, status, updated_at desc);
create index if not exists circle_connections_receiver_idx on public.circle_connections(receiver_id, status, updated_at desc);

create table if not exists public.circle_permissions (
  connection_id uuid not null references public.circle_connections(id) on delete cascade,
  grantor_id uuid not null references auth.users(id) on delete cascade,
  permission text not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (connection_id, grantor_id, permission),
  constraint circle_permissions_permission check (permission in ('chat','quick_questions','location_request','emergency','safe_arrival','care'))
);
create index if not exists circle_permissions_grantor_idx on public.circle_permissions(grantor_id, connection_id);

create table if not exists public.circle_messages (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.circle_connections(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  body text,
  template_key text,
  metadata jsonb not null default '{}'::jsonb,
  reply_to_id uuid references public.circle_messages(id) on delete set null,
  client_token uuid,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint circle_messages_kind check (kind in ('text','yes_no_question','location_request','location_share','system')),
  constraint circle_messages_body_length check (body is null or char_length(body) <= 4000),
  constraint circle_messages_template_key check (template_key is null or template_key ~ '^[a-z0-9_]{1,60}$'),
  constraint circle_messages_metadata_object check (jsonb_typeof(metadata) = 'object')
);
create unique index if not exists circle_messages_sender_token_unique on public.circle_messages(sender_id, client_token) where client_token is not null;
create index if not exists circle_messages_connection_created_idx on public.circle_messages(connection_id, created_at desc);
create index if not exists circle_messages_sender_created_idx on public.circle_messages(sender_id, created_at desc);

create table if not exists public.circle_message_answers (
  message_id uuid primary key references public.circle_messages(id) on delete cascade,
  responder_id uuid not null references auth.users(id) on delete cascade,
  answer_code text not null,
  answered_at timestamptz not null default now(),
  constraint circle_message_answers_code check (answer_code in ('yes','no','decline'))
);
create index if not exists circle_message_answers_responder_idx on public.circle_message_answers(responder_id, answered_at desc);

alter table public.circle_identities enable row level security;
alter table public.circle_connections enable row level security;
alter table public.circle_permissions enable row level security;
alter table public.circle_messages enable row level security;
alter table public.circle_message_answers enable row level security;

revoke all on table public.circle_identities from anon, authenticated;
revoke all on table public.circle_connections from anon, authenticated;
revoke all on table public.circle_permissions from anon, authenticated;
revoke all on table public.circle_messages from anon, authenticated;
revoke all on table public.circle_message_answers from anon, authenticated;

drop policy if exists circle_identities_deny_direct on public.circle_identities;
create policy circle_identities_deny_direct on public.circle_identities for all to anon, authenticated using (false) with check (false);
drop policy if exists circle_connections_deny_direct on public.circle_connections;
create policy circle_connections_deny_direct on public.circle_connections for all to anon, authenticated using (false) with check (false);
drop policy if exists circle_permissions_deny_direct on public.circle_permissions;
create policy circle_permissions_deny_direct on public.circle_permissions for all to anon, authenticated using (false) with check (false);
drop policy if exists circle_messages_deny_direct on public.circle_messages;
create policy circle_messages_deny_direct on public.circle_messages for all to anon, authenticated using (false) with check (false);
drop policy if exists circle_message_answers_deny_direct on public.circle_message_answers;
create policy circle_message_answers_deny_direct on public.circle_message_answers for all to anon, authenticated using (false) with check (false);

create or replace function private.circle_ensure_identity()
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_existing text;
  v_hex text;
  v_id text;
begin
  select ci.rawafid_id into v_existing from public.circle_identities ci where ci.user_id = v_uid;
  if v_existing is not null then return v_existing; end if;

  loop
    v_hex := upper(replace(gen_random_uuid()::text, '-', ''));
    v_id := 'RFD-' || substr(v_hex,1,4) || '-' || substr(v_hex,5,4) || '-' || substr(v_hex,9,4) || '-' || substr(v_hex,13,4);
    begin
      insert into public.circle_identities(user_id, rawafid_id) values(v_uid, v_id)
      on conflict (user_id) do nothing;
    exception when unique_violation then
      null;
    end;
    select ci.rawafid_id into v_existing from public.circle_identities ci where ci.user_id = v_uid;
    if v_existing is not null then return v_existing; end if;
  end loop;
end;
$function$;

create or replace function public.circle_my_identity()
returns text
language sql
set search_path to ''
as $function$
  select private.circle_ensure_identity();
$function$;

create or replace function private.circle_send_request(p_rawafid_id text, p_label text)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_target uuid;
  v_label text := nullif(trim(coalesce(p_label,'')), '');
  v_code text := upper(trim(coalesce(p_rawafid_id,'')));
  v_existing public.circle_connections%rowtype;
  v_id uuid;
begin
  perform private.circle_ensure_identity();
  if v_label is null or char_length(v_label) > 80 then raise exception 'relationship label required'; end if;
  if v_code !~ '^RFD-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$' then raise exception 'unable to create request'; end if;

  select ci.user_id into v_target from public.circle_identities ci where ci.rawafid_id = v_code;
  if v_target is null or v_target = v_uid then raise exception 'unable to create request'; end if;
  if not exists(select 1 from public.profiles p where p.id=v_target and p.is_active=true) then raise exception 'unable to create request'; end if;
  if exists(select 1 from public.user_blocks b where (b.blocker_id=v_uid and b.blocked_id=v_target) or (b.blocker_id=v_target and b.blocked_id=v_uid)) then raise exception 'unable to create request'; end if;
  if (select count(*) from public.circle_connections c where c.requester_id=v_uid and c.requested_at > now()-interval '1 hour') >= 20 then raise exception 'connection request rate limit exceeded'; end if;

  select c.* into v_existing
  from public.circle_connections c
  where least(c.requester_id::text,c.receiver_id::text)=least(v_uid::text,v_target::text)
    and greatest(c.requester_id::text,c.receiver_id::text)=greatest(v_uid::text,v_target::text)
  limit 1;

  if found then
    if v_existing.status='accepted' then raise exception 'already connected'; end if;
    if v_existing.status='pending' and v_existing.requester_id<>v_uid then raise exception 'incoming request already exists'; end if;
    if v_existing.status='pending' and v_existing.requester_id=v_uid then
      update public.circle_connections set requester_label=v_label, updated_at=now() where id=v_existing.id;
      return v_existing.id;
    end if;
    update public.circle_connections
      set requester_id=v_uid, receiver_id=v_target, requester_label=v_label, receiver_label=null,
          status='pending', requested_at=now(), responded_at=null, updated_at=now()
      where id=v_existing.id returning id into v_id;
    delete from public.circle_permissions where connection_id=v_id;
  else
    insert into public.circle_connections(requester_id,receiver_id,requester_label)
      values(v_uid,v_target,v_label) returning id into v_id;
  end if;

  insert into public.notifications(user_id,kind,title,body,data)
    values(v_target,'circle_request','طلب ارتباط في دائرتي','لديك طلب ارتباط جديد في روافد.',jsonb_build_object('circle_connection_id',v_id));
  return v_id;
end;
$function$;

create or replace function public.circle_send_request(p_rawafid_id text, p_label text)
returns uuid
language sql
set search_path to ''
as $function$
  select private.circle_send_request(p_rawafid_id,p_label);
$function$;

create or replace function private.circle_pending_requests()
returns table(request_id uuid, requester_rawafid_id text, requester_name text, requested_at timestamptz)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare v_uid uuid := private.require_active_user();
begin
  return query
  select c.id, ci.rawafid_id, coalesce(p.display_name,'مستخدم روافد'), c.requested_at
  from public.circle_connections c
  join public.circle_identities ci on ci.user_id=c.requester_id
  left join public.profiles p on p.id=c.requester_id
  where c.receiver_id=v_uid and c.status='pending'
  order by c.requested_at desc
  limit 100;
end;
$function$;

create or replace function public.circle_pending_requests()
returns table(request_id uuid, requester_rawafid_id text, requester_name text, requested_at timestamptz)
language sql
stable
set search_path to ''
as $function$
  select * from private.circle_pending_requests();
$function$;

create or replace function private.circle_respond_request(p_request_id uuid, p_accept boolean, p_my_label text)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_row public.circle_connections%rowtype;
  v_label text := nullif(trim(coalesce(p_my_label,'')), '');
  v_permission text;
begin
  select c.* into v_row from public.circle_connections c where c.id=p_request_id for update;
  if not found or v_row.receiver_id<>v_uid or v_row.status<>'pending' then raise exception 'request unavailable'; end if;
  if p_accept and (v_label is null or char_length(v_label)>80) then raise exception 'relationship label required'; end if;

  if p_accept then
    update public.circle_connections set receiver_label=v_label,status='accepted',responded_at=now(),updated_at=now() where id=p_request_id;
    foreach v_permission in array array['chat','quick_questions','location_request'] loop
      insert into public.circle_permissions(connection_id,grantor_id,permission,enabled)
      values(p_request_id,v_row.requester_id,v_permission,true)
      on conflict(connection_id,grantor_id,permission) do update set enabled=true,updated_at=now();
      insert into public.circle_permissions(connection_id,grantor_id,permission,enabled)
      values(p_request_id,v_row.receiver_id,v_permission,true)
      on conflict(connection_id,grantor_id,permission) do update set enabled=true,updated_at=now();
    end loop;
    insert into public.notifications(user_id,kind,title,body,data)
      values(v_row.requester_id,'circle_connected','تم قبول الارتباط','أصبح الشخص الآن ضمن دائرتك في روافد.',jsonb_build_object('circle_connection_id',p_request_id));
  else
    update public.circle_connections set receiver_label=null,status='rejected',responded_at=now(),updated_at=now() where id=p_request_id;
  end if;
  return p_accept;
end;
$function$;

create or replace function public.circle_respond_request(p_request_id uuid, p_accept boolean, p_my_label text)
returns boolean
language sql
set search_path to ''
as $function$
  select private.circle_respond_request(p_request_id,p_accept,p_my_label);
$function$;

create or replace function private.circle_my_connections()
returns table(connection_id uuid, counterpart_rawafid_id text, counterpart_name text, my_label text, connected_at timestamptz, can_message boolean, can_quick_question boolean, can_request_location boolean, allow_messages_from_them boolean, allow_quick_questions_from_them boolean, allow_location_requests_from_them boolean)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare v_uid uuid := private.require_active_user();
begin
  return query
  select
    c.id,
    ci.rawafid_id,
    coalesce(p.display_name,'مستخدم روافد'),
    case when c.requester_id=v_uid then c.requester_label else c.receiver_label end,
    coalesce(c.responded_at,c.updated_at),
    coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=c.id and cp.grantor_id=other.user_id and cp.permission='chat'),false),
    coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=c.id and cp.grantor_id=other.user_id and cp.permission='quick_questions'),false),
    coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=c.id and cp.grantor_id=other.user_id and cp.permission='location_request'),false),
    coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='chat'),false),
    coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='quick_questions'),false),
    coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=c.id and cp.grantor_id=v_uid and cp.permission='location_request'),false)
  from public.circle_connections c
  join lateral (select case when c.requester_id=v_uid then c.receiver_id else c.requester_id end as user_id) other on true
  join public.circle_identities ci on ci.user_id=other.user_id
  left join public.profiles p on p.id=other.user_id
  where c.status='accepted' and (c.requester_id=v_uid or c.receiver_id=v_uid)
  order by coalesce(c.responded_at,c.updated_at) desc;
end;
$function$;

create or replace function public.circle_my_connections()
returns table(connection_id uuid, counterpart_rawafid_id text, counterpart_name text, my_label text, connected_at timestamptz, can_message boolean, can_quick_question boolean, can_request_location boolean, allow_messages_from_them boolean, allow_quick_questions_from_them boolean, allow_location_requests_from_them boolean)
language sql
stable
set search_path to ''
as $function$
  select * from private.circle_my_connections();
$function$;

create or replace function private.circle_set_permission(p_connection_id uuid, p_permission text, p_enabled boolean)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
begin
  if p_permission not in ('chat','quick_questions','location_request','emergency','safe_arrival','care') then raise exception 'unsupported permission'; end if;
  if not exists(select 1 from public.circle_connections c where c.id=p_connection_id and c.status='accepted' and (c.requester_id=v_uid or c.receiver_id=v_uid)) then raise exception 'connection unavailable'; end if;
  insert into public.circle_permissions(connection_id,grantor_id,permission,enabled)
    values(p_connection_id,v_uid,p_permission,coalesce(p_enabled,false))
    on conflict(connection_id,grantor_id,permission) do update set enabled=excluded.enabled,updated_at=now();
  return coalesce(p_enabled,false);
end;
$function$;

create or replace function public.circle_set_permission(p_connection_id uuid, p_permission text, p_enabled boolean)
returns boolean
language sql
set search_path to ''
as $function$
  select private.circle_set_permission(p_connection_id,p_permission,p_enabled);
$function$;

create or replace function private.circle_send_message(
  p_connection_id uuid,
  p_kind text,
  p_body text,
  p_template_key text,
  p_reply_to_id uuid,
  p_latitude double precision,
  p_longitude double precision,
  p_accuracy_m double precision,
  p_client_token uuid
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_other uuid;
  v_kind text := lower(trim(coalesce(p_kind,'')));
  v_body text := nullif(trim(coalesce(p_body,'')), '');
  v_template text := nullif(lower(trim(coalesce(p_template_key,''))), '');
  v_metadata jsonb := '{}'::jsonb;
  v_id uuid;
  v_needed_permission text;
begin
  select case when c.requester_id=v_uid then c.receiver_id else c.requester_id end into v_other
  from public.circle_connections c
  where c.id=p_connection_id and c.status='accepted' and (c.requester_id=v_uid or c.receiver_id=v_uid);
  if v_other is null then raise exception 'connection unavailable'; end if;
  if exists(select 1 from public.user_blocks b where (b.blocker_id=v_uid and b.blocked_id=v_other) or (b.blocker_id=v_other and b.blocked_id=v_uid)) then raise exception 'messaging blocked'; end if;

  if v_kind not in ('text','yes_no_question','location_request','location_share') then raise exception 'unsupported message kind'; end if;
  if v_template is not null and v_template !~ '^[a-z0-9_]{1,60}$' then raise exception 'invalid template key'; end if;
  if v_body is not null and char_length(v_body)>4000 then raise exception 'message too long'; end if;

  if v_kind='text' then
    if v_body is null then raise exception 'empty message'; end if;
    v_needed_permission := 'chat';
  elsif v_kind='yes_no_question' then
    if v_body is null then raise exception 'question required'; end if;
    v_needed_permission := 'quick_questions';
  elsif v_kind='location_request' then
    v_body := coalesce(v_body,'أرسل لي موقعك');
    v_needed_permission := 'location_request';
  elsif v_kind='location_share' then
    if p_latitude is null or p_longitude is null or p_latitude < -90 or p_latitude > 90 or p_longitude < -180 or p_longitude > 180 then raise exception 'invalid location'; end if;
    if p_accuracy_m is not null and (p_accuracy_m < 0 or p_accuracy_m > 100000) then raise exception 'invalid location accuracy'; end if;
    v_body := coalesce(v_body,'تم إرسال الموقع');
    v_metadata := jsonb_build_object('latitude',p_latitude,'longitude',p_longitude,'accuracy_m',p_accuracy_m);
  end if;

  if v_needed_permission is not null and not coalesce((select cp.enabled from public.circle_permissions cp where cp.connection_id=p_connection_id and cp.grantor_id=v_other and cp.permission=v_needed_permission),false) then
    raise exception 'recipient permission disabled';
  end if;

  if p_reply_to_id is not null and not exists(select 1 from public.circle_messages rm where rm.id=p_reply_to_id and rm.connection_id=p_connection_id and rm.deleted_at is null) then raise exception 'invalid reply target'; end if;
  if v_kind='location_share' and p_reply_to_id is not null and not exists(select 1 from public.circle_messages rm where rm.id=p_reply_to_id and rm.connection_id=p_connection_id and rm.kind='location_request' and rm.sender_id=v_other) then raise exception 'location reply target invalid'; end if;

  if p_client_token is not null then
    select m.id into v_id from public.circle_messages m where m.sender_id=v_uid and m.client_token=p_client_token;
    if v_id is not null then return v_id; end if;
  end if;
  if (select count(*) from public.circle_messages m where m.sender_id=v_uid and m.created_at>now()-interval '1 minute')>=30 then raise exception 'message rate limit exceeded'; end if;
  if (select count(*) from public.circle_messages m where m.sender_id=v_uid and m.created_at>now()-interval '1 hour')>=300 then raise exception 'hourly message limit exceeded'; end if;

  insert into public.circle_messages(connection_id,sender_id,kind,body,template_key,metadata,reply_to_id,client_token)
    values(p_connection_id,v_uid,v_kind,v_body,v_template,v_metadata,p_reply_to_id,p_client_token)
    returning id into v_id;

  insert into public.notifications(user_id,kind,title,body,data)
  values(
    v_other,
    case when v_kind='yes_no_question' then 'circle_question' when v_kind='location_request' then 'circle_location_request' when v_kind='location_share' then 'circle_location_share' else 'circle_message' end,
    case when v_kind='yes_no_question' then 'سؤال سريع من دائرتك' when v_kind='location_request' then 'طلب موقع من دائرتك' when v_kind='location_share' then 'تمت مشاركة موقع معك' else 'رسالة من دائرتك' end,
    case when v_kind in ('yes_no_question','location_request') then v_body else 'لديك تحديث جديد في دائرتك على روافد.' end,
    jsonb_build_object('circle_connection_id',p_connection_id,'circle_message_id',v_id,'message_kind',v_kind)
  );
  return v_id;
end;
$function$;

create or replace function public.circle_send_message(
  p_connection_id uuid,
  p_kind text,
  p_body text default null,
  p_template_key text default null,
  p_reply_to_id uuid default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_accuracy_m double precision default null,
  p_client_token uuid default null
)
returns uuid
language sql
set search_path to ''
as $function$
  select private.circle_send_message(p_connection_id,p_kind,p_body,p_template_key,p_reply_to_id,p_latitude,p_longitude,p_accuracy_m,p_client_token);
$function$;

create or replace function private.circle_answer_message(p_message_id uuid, p_answer_code text)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_uid uuid := private.require_active_user();
  v_message public.circle_messages%rowtype;
  v_other uuid;
  v_answer text := lower(trim(coalesce(p_answer_code,'')));
begin
  select m.* into v_message from public.circle_messages m where m.id=p_message_id and m.deleted_at is null;
  if not found then raise exception 'message unavailable'; end if;
  select case when c.requester_id=v_uid then c.receiver_id else c.requester_id end into v_other
  from public.circle_connections c
  where c.id=v_message.connection_id and c.status='accepted' and (c.requester_id=v_uid or c.receiver_id=v_uid);
  if v_other is null or v_message.sender_id=v_uid then raise exception 'answer denied'; end if;
  if exists(select 1 from public.user_blocks b where (b.blocker_id=v_uid and b.blocked_id=v_other) or (b.blocker_id=v_other and b.blocked_id=v_uid)) then raise exception 'messaging blocked'; end if;
  if v_message.kind='yes_no_question' and v_answer not in ('yes','no') then raise exception 'invalid answer'; end if;
  if v_message.kind='location_request' and v_answer<>'decline' then raise exception 'use explicit location sharing to accept'; end if;
  if v_message.kind not in ('yes_no_question','location_request') then raise exception 'message does not accept an answer'; end if;

  insert into public.circle_message_answers(message_id,responder_id,answer_code)
    values(p_message_id,v_uid,v_answer);
  insert into public.notifications(user_id,kind,title,body,data)
    values(v_message.sender_id,'circle_answer','تمت الإجابة على رسالتك',case when v_answer='yes' then 'الإجابة: نعم' when v_answer='no' then 'الإجابة: لا' else 'تم رفض طلب الموقع' end,jsonb_build_object('circle_connection_id',v_message.connection_id,'circle_message_id',p_message_id,'answer',v_answer));
  return true;
end;
$function$;

create or replace function public.circle_answer_message(p_message_id uuid, p_answer_code text)
returns boolean
language sql
set search_path to ''
as $function$
  select private.circle_answer_message(p_message_id,p_answer_code);
$function$;

create or replace function private.circle_get_messages(p_connection_id uuid, p_limit integer, p_before timestamptz)
returns table(message_id uuid, sender_is_me boolean, kind text, body text, template_key text, latitude double precision, longitude double precision, accuracy_m double precision, reply_to_id uuid, created_at timestamptz, answer_code text, answered_at timestamptz)
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare v_uid uuid := private.require_active_user();
begin
  if not exists(select 1 from public.circle_connections c where c.id=p_connection_id and c.status='accepted' and (c.requester_id=v_uid or c.receiver_id=v_uid)) then raise exception 'connection unavailable'; end if;
  return query
  select m.id, m.sender_id=v_uid, m.kind, m.body, m.template_key,
         case when m.kind='location_share' then (m.metadata->>'latitude')::double precision end,
         case when m.kind='location_share' then (m.metadata->>'longitude')::double precision end,
         case when m.kind='location_share' and m.metadata->>'accuracy_m' is not null then (m.metadata->>'accuracy_m')::double precision end,
         m.reply_to_id,m.created_at,a.answer_code,a.answered_at
  from public.circle_messages m
  left join public.circle_message_answers a on a.message_id=m.id
  where m.connection_id=p_connection_id and m.deleted_at is null and (p_before is null or m.created_at<p_before)
  order by m.created_at desc
  limit greatest(1,least(coalesce(p_limit,60),100));
end;
$function$;

create or replace function public.circle_get_messages(p_connection_id uuid, p_limit integer default 60, p_before timestamptz default null)
returns table(message_id uuid, sender_is_me boolean, kind text, body text, template_key text, latitude double precision, longitude double precision, accuracy_m double precision, reply_to_id uuid, created_at timestamptz, answer_code text, answered_at timestamptz)
language sql
stable
set search_path to ''
as $function$
  select * from private.circle_get_messages(p_connection_id,p_limit,p_before);
$function$;

create or replace function private.circle_remove_connection(p_connection_id uuid)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare v_uid uuid := private.require_active_user();
begin
  if not exists(select 1 from public.circle_connections c where c.id=p_connection_id and (c.requester_id=v_uid or c.receiver_id=v_uid)) then raise exception 'connection unavailable'; end if;
  update public.circle_connections set status='removed',responded_at=now(),updated_at=now() where id=p_connection_id;
  delete from public.circle_permissions where connection_id=p_connection_id;
  return true;
end;
$function$;

create or replace function public.circle_remove_connection(p_connection_id uuid)
returns boolean
language sql
set search_path to ''
as $function$
  select private.circle_remove_connection(p_connection_id);
$function$;

revoke all on function public.circle_my_identity() from public, anon;
revoke all on function public.circle_send_request(text,text) from public, anon;
revoke all on function public.circle_pending_requests() from public, anon;
revoke all on function public.circle_respond_request(uuid,boolean,text) from public, anon;
revoke all on function public.circle_my_connections() from public, anon;
revoke all on function public.circle_set_permission(uuid,text,boolean) from public, anon;
revoke all on function public.circle_send_message(uuid,text,text,text,uuid,double precision,double precision,double precision,uuid) from public, anon;
revoke all on function public.circle_answer_message(uuid,text) from public, anon;
revoke all on function public.circle_get_messages(uuid,integer,timestamptz) from public, anon;
revoke all on function public.circle_remove_connection(uuid) from public, anon;

grant execute on function public.circle_my_identity() to authenticated;
grant execute on function public.circle_send_request(text,text) to authenticated;
grant execute on function public.circle_pending_requests() to authenticated;
grant execute on function public.circle_respond_request(uuid,boolean,text) to authenticated;
grant execute on function public.circle_my_connections() to authenticated;
grant execute on function public.circle_set_permission(uuid,text,boolean) to authenticated;
grant execute on function public.circle_send_message(uuid,text,text,text,uuid,double precision,double precision,double precision,uuid) to authenticated;
grant execute on function public.circle_answer_message(uuid,text) to authenticated;
grant execute on function public.circle_get_messages(uuid,integer,timestamptz) to authenticated;
grant execute on function public.circle_remove_connection(uuid) to authenticated;

grant execute on function private.circle_ensure_identity() to authenticated;
grant execute on function private.circle_send_request(text,text) to authenticated;
grant execute on function private.circle_pending_requests() to authenticated;
grant execute on function private.circle_respond_request(uuid,boolean,text) to authenticated;
grant execute on function private.circle_my_connections() to authenticated;
grant execute on function private.circle_set_permission(uuid,text,boolean) to authenticated;
grant execute on function private.circle_send_message(uuid,text,text,text,uuid,double precision,double precision,double precision,uuid) to authenticated;
grant execute on function private.circle_answer_message(uuid,text) to authenticated;
grant execute on function private.circle_get_messages(uuid,integer,timestamptz) to authenticated;
grant execute on function private.circle_remove_connection(uuid) to authenticated;