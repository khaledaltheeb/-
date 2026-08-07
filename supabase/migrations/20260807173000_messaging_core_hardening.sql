alter table public.conversations
  add column if not exists specialist_id uuid references public.specialists(id) on delete set null,
  add column if not exists center_id uuid references public.centers(id) on delete set null,
  add column if not exists last_message_at timestamptz,
  add column if not exists closed_at timestamptz;

alter table public.conversations drop constraint if exists conversations_target_check;
alter table public.conversations add constraint conversations_target_check
  check ((specialist_id is not null and center_id is null) or (specialist_id is null and center_id is not null));

alter table public.conversation_participants
  add column if not exists participant_role text not null default 'requester',
  add column if not exists archived_at timestamptz;
alter table public.conversation_participants drop constraint if exists conversation_participants_role_check;
alter table public.conversation_participants add constraint conversation_participants_role_check
  check (participant_role in ('requester','specialist','center_manager','admin'));

alter table public.messages
  add column if not exists reply_to_id uuid references public.messages(id) on delete set null,
  add column if not exists message_type text not null default 'text',
  add column if not exists client_token uuid;
alter table public.messages drop constraint if exists messages_type_check;
alter table public.messages add constraint messages_type_check check (message_type in ('text','system'));
alter table public.messages drop constraint if exists messages_payload_check;
alter table public.messages add constraint messages_payload_check check (
  ((body is not null and length(trim(body)) between 1 and 4000) or jsonb_array_length(attachments) > 0)
  and jsonb_typeof(attachments) = 'array'
  and jsonb_array_length(attachments) <= 5
);

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint user_blocks_not_self check (blocker_id <> blocked_id)
);

create table if not exists public.conversation_reports (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversation_reports_reason_check check (reason in ('spam','harassment','unsafe','impersonation','privacy','other')),
  constraint conversation_reports_status_check check (status in ('pending','reviewing','resolved','dismissed')),
  constraint conversation_reports_details_check check (details is null or length(details) <= 2000),
  constraint conversation_reports_resolution_check check (resolution_note is null or length(resolution_note) <= 2000)
);

drop trigger if exists conversation_reports_updated on public.conversation_reports;
create trigger conversation_reports_updated before update on public.conversation_reports
for each row execute function public.set_updated_at();

create index if not exists conversations_created_by_recent_idx on public.conversations(created_by,created_at desc);
create index if not exists conversations_specialist_idx on public.conversations(specialist_id,last_message_at desc) where specialist_id is not null;
create index if not exists conversations_center_idx on public.conversations(center_id,last_message_at desc) where center_id is not null;
create unique index if not exists conversations_requester_specialist_open_unique on public.conversations(created_by,specialist_id) where specialist_id is not null and closed_at is null;
create unique index if not exists conversations_requester_center_open_unique on public.conversations(created_by,center_id) where center_id is not null and closed_at is null;
create index if not exists participants_user_conversation_idx on public.conversation_participants(user_id,conversation_id);
create index if not exists messages_conversation_recent_idx on public.messages(conversation_id,created_at desc);
create unique index if not exists messages_sender_client_token_unique on public.messages(sender_id,client_token) where client_token is not null;
create index if not exists notifications_user_unread_recent_idx on public.notifications(user_id,created_at desc) where read_at is null;
create index if not exists user_blocks_blocked_idx on public.user_blocks(blocked_id,blocker_id);
create index if not exists conversation_reports_status_recent_idx on public.conversation_reports(status,created_at desc);
create index if not exists conversation_reports_reporter_recent_idx on public.conversation_reports(reporter_id,created_at desc);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.user_blocks enable row level security;
alter table public.conversation_reports enable row level security;

do $$
declare r record;
begin
  for r in select schemaname,tablename,policyname from pg_policies
    where schemaname='public' and tablename in ('conversations','conversation_participants','messages','notifications','user_blocks','conversation_reports')
  loop
    execute format('drop policy if exists %I on %I.%I',r.policyname,r.schemaname,r.tablename);
  end loop;
end $$;

revoke all on public.conversations, public.conversation_participants, public.messages, public.notifications, public.user_blocks, public.conversation_reports from anon, authenticated;

create or replace function private.require_active_user()
returns uuid
language plpgsql
stable
security definer
set search_path=''
as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  if not exists(select 1 from public.profiles p where p.id=v_uid and p.is_active=true) then raise exception 'active account required'; end if;
  return v_uid;
end;
$$;

create or replace function private.start_conversation(p_specialist_id uuid default null,p_center_id uuid default null,p_subject text default null)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_uid uuid := private.require_active_user();
  v_target uuid;
  v_role text;
  v_id uuid;
  v_subject text := nullif(trim(left(coalesce(p_subject,''),160)),'');
begin
  if (p_specialist_id is null) = (p_center_id is null) then raise exception 'choose exactly one conversation target'; end if;
  if p_specialist_id is not null then
    select s.user_id into v_target from public.specialists s
    join public.profiles p on p.id=s.user_id and p.is_active=true
    where s.id=p_specialist_id and s.is_active=true and s.verification='verified'::public.verification_status and s.user_id is not null;
    v_role:='specialist';
  else
    select c.manager_user_id into v_target from public.centers c
    join public.profiles p on p.id=c.manager_user_id and p.is_active=true
    where c.id=p_center_id and c.is_active=true and c.verification='verified'::public.verification_status and c.manager_user_id is not null;
    v_role:='center_manager';
  end if;
  if v_target is null then raise exception 'target unavailable'; end if;
  if v_target=v_uid then raise exception 'cannot message yourself'; end if;
  if exists(select 1 from public.user_blocks b where (b.blocker_id=v_uid and b.blocked_id=v_target) or (b.blocker_id=v_target and b.blocked_id=v_uid)) then raise exception 'conversation unavailable'; end if;
  select c.id into v_id from public.conversations c
  where c.created_by=v_uid and c.closed_at is null
    and ((p_specialist_id is not null and c.specialist_id=p_specialist_id) or (p_center_id is not null and c.center_id=p_center_id))
  order by c.created_at desc limit 1;
  if v_id is not null then
    update public.conversation_participants set archived_at=null where conversation_id=v_id and user_id=v_uid;
    return v_id;
  end if;
  if (select count(*) from public.conversations c where c.created_by=v_uid and c.created_at > now()-interval '1 hour') >= 10 then raise exception 'conversation rate limit exceeded'; end if;
  if (select count(*) from public.conversations c where c.created_by=v_uid and c.created_at > now()-interval '1 day') >= 30 then raise exception 'daily conversation limit exceeded'; end if;
  begin
    insert into public.conversations(created_by,subject,specialist_id,center_id,last_message_at)
    values(v_uid,v_subject,p_specialist_id,p_center_id,null) returning id into v_id;
  exception when unique_violation then
    select c.id into v_id from public.conversations c
    where c.created_by=v_uid and c.closed_at is null
      and ((p_specialist_id is not null and c.specialist_id=p_specialist_id) or (p_center_id is not null and c.center_id=p_center_id))
    order by c.created_at desc limit 1;
  end;
  if v_id is null then raise exception 'failed to create conversation'; end if;
  insert into public.conversation_participants(conversation_id,user_id,participant_role,last_read_at)
  values(v_id,v_uid,'requester',now()),(v_id,v_target,v_role,null)
  on conflict (conversation_id,user_id) do update set archived_at=null;
  insert into public.notifications(user_id,kind,title,body,data)
  values(v_target,'conversation_started','محادثة جديدة','لديك محادثة جديدة في منصة روافد.',jsonb_build_object('conversation_id',v_id));
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data)
  values(v_uid,'conversation',v_id::text,'conversation_started',jsonb_build_object('specialist_id',p_specialist_id,'center_id',p_center_id));
  return v_id;
end;
$$;

create or replace function private.get_my_conversations(p_include_archived boolean default false,p_limit integer default 50,p_offset integer default 0)
returns table(conversation_id uuid,subject text,specialist_id uuid,center_id uuid,counterpart_user_id uuid,counterpart_name text,counterpart_title text,counterpart_slug text,last_message_body text,last_message_at timestamptz,unread_count bigint,archived_at timestamptz,blocked_by_me boolean,blocked_me boolean,closed_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$
declare v_uid uuid := private.require_active_user();
begin
 return query
 select c.id,c.subject,c.specialist_id,c.center_id,otherp.user_id,
        case when (s.user_id=v_uid or ctr.manager_user_id=v_uid) then coalesce(op.display_name,'مستخدم روافد') else coalesce(s.full_name,ctr.name,op.display_name,'مستخدم روافد') end,
        case when (s.user_id=v_uid or ctr.manager_user_id=v_uid) then 'مستخدم روافد' else coalesce(s.professional_title,case when ctr.id is not null then 'مركز موثق' end) end,
        case when (s.user_id=v_uid or ctr.manager_user_id=v_uid) then null else coalesce(s.slug,ctr.slug) end,
        case when lm.deleted_at is null then left(lm.body,240) else null end,
        coalesce(lm.created_at,c.last_message_at,c.created_at),
        (select count(*) from public.messages um where um.conversation_id=c.id and um.sender_id<>v_uid and um.deleted_at is null and um.created_at > coalesce(me.last_read_at,me.joined_at)),
        me.archived_at,
        exists(select 1 from public.user_blocks b where b.blocker_id=v_uid and b.blocked_id=otherp.user_id),
        exists(select 1 from public.user_blocks b where b.blocker_id=otherp.user_id and b.blocked_id=v_uid),c.closed_at
 from public.conversations c
 join public.conversation_participants me on me.conversation_id=c.id and me.user_id=v_uid
 join lateral (select cp.user_id from public.conversation_participants cp where cp.conversation_id=c.id and cp.user_id<>v_uid order by cp.joined_at limit 1) otherp on true
 left join public.profiles op on op.id=otherp.user_id left join public.specialists s on s.id=c.specialist_id left join public.centers ctr on ctr.id=c.center_id
 left join lateral (select m.body,m.created_at,m.deleted_at from public.messages m where m.conversation_id=c.id order by m.created_at desc limit 1) lm on true
 where p_include_archived or me.archived_at is null
 order by coalesce(lm.created_at,c.last_message_at,c.created_at) desc
 limit greatest(1,least(coalesce(p_limit,50),100)) offset greatest(0,coalesce(p_offset,0));
end;
$$;

create or replace function private.get_conversation_detail(p_conversation_id uuid)
returns table(conversation_id uuid,subject text,specialist_id uuid,center_id uuid,counterpart_user_id uuid,counterpart_name text,counterpart_title text,counterpart_slug text,blocked_by_me boolean,blocked_me boolean,archived_at timestamptz,closed_at timestamptz,created_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$
declare v_uid uuid := private.require_active_user();
begin
 return query
 select c.id,c.subject,c.specialist_id,c.center_id,otherp.user_id,
        case when (s.user_id=v_uid or ctr.manager_user_id=v_uid) then coalesce(op.display_name,'مستخدم روافد') else coalesce(s.full_name,ctr.name,op.display_name,'مستخدم روافد') end,
        case when (s.user_id=v_uid or ctr.manager_user_id=v_uid) then 'مستخدم روافد' else coalesce(s.professional_title,case when ctr.id is not null then 'مركز موثق' end) end,
        case when (s.user_id=v_uid or ctr.manager_user_id=v_uid) then null else coalesce(s.slug,ctr.slug) end,
        exists(select 1 from public.user_blocks b where b.blocker_id=v_uid and b.blocked_id=otherp.user_id),
        exists(select 1 from public.user_blocks b where b.blocker_id=otherp.user_id and b.blocked_id=v_uid),me.archived_at,c.closed_at,c.created_at
 from public.conversations c join public.conversation_participants me on me.conversation_id=c.id and me.user_id=v_uid
 join lateral (select cp.user_id from public.conversation_participants cp where cp.conversation_id=c.id and cp.user_id<>v_uid order by cp.joined_at limit 1) otherp on true
 left join public.profiles op on op.id=otherp.user_id left join public.specialists s on s.id=c.specialist_id left join public.centers ctr on ctr.id=c.center_id
 where c.id=p_conversation_id limit 1;
end;
$$;

create or replace function private.get_conversation_messages(p_conversation_id uuid,p_limit integer default 80,p_before timestamptz default null)
returns table(message_id uuid,sender_id uuid,sender_name text,body text,attachments jsonb,message_type text,created_at timestamptz,edited_at timestamptz,deleted_at timestamptz,is_mine boolean,read_by_other boolean)
language plpgsql stable security definer set search_path=''
as $$
declare v_uid uuid := private.require_active_user();
begin
 if not exists(select 1 from public.conversation_participants cp where cp.conversation_id=p_conversation_id and cp.user_id=v_uid) then raise exception 'conversation denied'; end if;
 return query
 select m.id,m.sender_id,coalesce(case when s.user_id=m.sender_id then s.full_name when ctr.manager_user_id=m.sender_id then ctr.name else p.display_name end,'مستخدم روافد'),
        case when m.deleted_at is null then m.body else null end,case when m.deleted_at is null then m.attachments else '[]'::jsonb end,m.message_type,m.created_at,m.edited_at,m.deleted_at,m.sender_id=v_uid,
        exists(select 1 from public.conversation_participants cp2 where cp2.conversation_id=m.conversation_id and cp2.user_id<>m.sender_id and cp2.last_read_at is not null and cp2.last_read_at>=m.created_at)
 from public.messages m join public.conversations c on c.id=m.conversation_id left join public.profiles p on p.id=m.sender_id left join public.specialists s on s.id=c.specialist_id left join public.centers ctr on ctr.id=c.center_id
 where m.conversation_id=p_conversation_id and (p_before is null or m.created_at<p_before)
 order by m.created_at asc limit greatest(1,least(coalesce(p_limit,80),200));
end;
$$;

create or replace function private.send_message(p_conversation_id uuid,p_body text,p_client_token uuid default null,p_reply_to_id uuid default null,p_attachments jsonb default '[]'::jsonb)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_uid uuid := private.require_active_user(); v_other uuid; v_id uuid; v_body text := nullif(trim(coalesce(p_body,'')),''); v_attachments jsonb := coalesce(p_attachments,'[]'::jsonb);
begin
 if v_body is not null and length(v_body)>4000 then raise exception 'message too long'; end if;
 if jsonb_typeof(v_attachments)<>'array' or jsonb_array_length(v_attachments)>5 then raise exception 'invalid attachments'; end if;
 if v_body is null and jsonb_array_length(v_attachments)=0 then raise exception 'empty message'; end if;
 if not exists(select 1 from public.conversation_participants cp join public.conversations c on c.id=cp.conversation_id where cp.conversation_id=p_conversation_id and cp.user_id=v_uid and c.closed_at is null) then raise exception 'conversation denied'; end if;
 select cp.user_id into v_other from public.conversation_participants cp where cp.conversation_id=p_conversation_id and cp.user_id<>v_uid order by cp.joined_at limit 1;
 if v_other is null then raise exception 'conversation recipient unavailable'; end if;
 if exists(select 1 from public.user_blocks b where (b.blocker_id=v_uid and b.blocked_id=v_other) or (b.blocker_id=v_other and b.blocked_id=v_uid)) then raise exception 'messaging blocked'; end if;
 if p_reply_to_id is not null and not exists(select 1 from public.messages rm where rm.id=p_reply_to_id and rm.conversation_id=p_conversation_id) then raise exception 'invalid reply target'; end if;
 if p_client_token is not null then select m.id into v_id from public.messages m where m.sender_id=v_uid and m.client_token=p_client_token; if v_id is not null then return v_id; end if; end if;
 if (select count(*) from public.messages m where m.sender_id=v_uid and m.created_at>now()-interval '1 minute')>=30 then raise exception 'message rate limit exceeded'; end if;
 if (select count(*) from public.messages m where m.sender_id=v_uid and m.created_at>now()-interval '1 hour')>=300 then raise exception 'hourly message limit exceeded'; end if;
 insert into public.messages(conversation_id,sender_id,body,attachments,reply_to_id,message_type,client_token) values(p_conversation_id,v_uid,v_body,v_attachments,p_reply_to_id,'text',p_client_token) returning id into v_id;
 update public.conversations set last_message_at=now(),updated_at=now() where id=p_conversation_id;
 update public.conversation_participants set archived_at=null,last_read_at=now() where conversation_id=p_conversation_id and user_id=v_uid;
 insert into public.notifications(user_id,kind,title,body,data) values(v_other,'message_received','رسالة جديدة','لديك رسالة جديدة في منصة روافد.',jsonb_build_object('conversation_id',p_conversation_id,'message_id',v_id));
 insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data) values(v_uid,'message',v_id::text,'message_sent',jsonb_build_object('conversation_id',p_conversation_id,'has_attachments',jsonb_array_length(v_attachments)>0));
 return v_id;
end;
$$;

create or replace function private.mark_conversation_read(p_conversation_id uuid) returns timestamptz language plpgsql security definer set search_path=''
as $$ declare v_uid uuid := private.require_active_user(); v_now timestamptz:=now(); begin update public.conversation_participants set last_read_at=v_now where conversation_id=p_conversation_id and user_id=v_uid; if not found then raise exception 'conversation denied'; end if; update public.notifications set read_at=coalesce(read_at,v_now) where user_id=v_uid and read_at is null and data->>'conversation_id'=p_conversation_id::text; return v_now; end; $$;
create or replace function private.set_conversation_archived(p_conversation_id uuid,p_archived boolean default true) returns boolean language plpgsql security definer set search_path='' as $$ declare v_uid uuid := private.require_active_user(); begin update public.conversation_participants set archived_at=case when p_archived then now() else null end where conversation_id=p_conversation_id and user_id=v_uid; if not found then raise exception 'conversation denied'; end if; return p_archived; end; $$;
create or replace function private.set_user_block(p_user_id uuid,p_blocked boolean default true) returns boolean language plpgsql security definer set search_path='' as $$ declare v_uid uuid := private.require_active_user(); begin if p_user_id is null or p_user_id=v_uid then raise exception 'invalid user'; end if; if not exists(select 1 from public.conversation_participants a join public.conversation_participants b on b.conversation_id=a.conversation_id where a.user_id=v_uid and b.user_id=p_user_id) then raise exception 'no shared conversation'; end if; if p_blocked then insert into public.user_blocks(blocker_id,blocked_id) values(v_uid,p_user_id) on conflict do nothing; else delete from public.user_blocks where blocker_id=v_uid and blocked_id=p_user_id; end if; insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data) values(v_uid,'user_block',p_user_id::text,case when p_blocked then 'user_blocked' else 'user_unblocked' end,jsonb_build_object('blocked',p_blocked)); return p_blocked; end; $$;
create or replace function private.report_conversation(p_conversation_id uuid,p_reason text,p_details text default null,p_reported_user_id uuid default null,p_message_id uuid default null) returns uuid language plpgsql security definer set search_path='' as $$ declare v_uid uuid := private.require_active_user(); v_id uuid; v_reason text:=lower(trim(coalesce(p_reason,''))); v_details text:=nullif(trim(left(coalesce(p_details,''),2000)),''); begin if v_reason not in ('spam','harassment','unsafe','impersonation','privacy','other') then raise exception 'invalid report reason'; end if; if not exists(select 1 from public.conversation_participants cp where cp.conversation_id=p_conversation_id and cp.user_id=v_uid) then raise exception 'conversation denied'; end if; if p_reported_user_id is not null and (p_reported_user_id=v_uid or not exists(select 1 from public.conversation_participants cp where cp.conversation_id=p_conversation_id and cp.user_id=p_reported_user_id)) then raise exception 'invalid reported user'; end if; if p_message_id is not null and not exists(select 1 from public.messages m where m.id=p_message_id and m.conversation_id=p_conversation_id) then raise exception 'invalid reported message'; end if; if (select count(*) from public.conversation_reports r where r.reporter_id=v_uid and r.created_at>now()-interval '1 day')>=10 then raise exception 'report rate limit exceeded'; end if; insert into public.conversation_reports(conversation_id,reporter_id,reported_user_id,message_id,reason,details) values(p_conversation_id,v_uid,p_reported_user_id,p_message_id,v_reason,v_details) returning id into v_id; insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data) values(v_uid,'conversation_report',v_id::text,'conversation_reported',jsonb_build_object('conversation_id',p_conversation_id,'reason',v_reason)); return v_id; end; $$;
create or replace function private.get_my_notifications(p_limit integer default 50,p_offset integer default 0) returns table(notification_id uuid,kind text,title text,body text,data jsonb,read_at timestamptz,created_at timestamptz) language plpgsql stable security definer set search_path='' as $$ declare v_uid uuid := private.require_active_user(); begin return query select n.id,n.kind,n.title,n.body,n.data,n.read_at,n.created_at from public.notifications n where n.user_id=v_uid order by n.created_at desc limit greatest(1,least(coalesce(p_limit,50),100)) offset greatest(0,coalesce(p_offset,0)); end; $$;
create or replace function private.mark_notification_read(p_notification_id uuid default null,p_all boolean default false) returns integer language plpgsql security definer set search_path='' as $$ declare v_uid uuid := private.require_active_user(); v_count integer; begin if p_all then update public.notifications set read_at=coalesce(read_at,now()) where user_id=v_uid and read_at is null; else if p_notification_id is null then raise exception 'notification required'; end if; update public.notifications set read_at=coalesce(read_at,now()) where id=p_notification_id and user_id=v_uid; end if; get diagnostics v_count = row_count; return v_count; end; $$;
create or replace function private.admin_conversation_reports(p_status text default null,p_limit integer default 100,p_offset integer default 0) returns table(report_id uuid,conversation_id uuid,reporter_id uuid,reporter_name text,reported_user_id uuid,reported_user_name text,message_id uuid,reason text,details text,status text,reviewed_by uuid,reviewed_at timestamptz,resolution_note text,created_at timestamptz) language plpgsql stable security definer set search_path='' as $$ begin if not private.is_admin() then raise exception 'admin required'; end if; return query select r.id,r.conversation_id,r.reporter_id,rp.display_name,r.reported_user_id,tp.display_name,r.message_id,r.reason,r.details,r.status,r.reviewed_by,r.reviewed_at,r.resolution_note,r.created_at from public.conversation_reports r left join public.profiles rp on rp.id=r.reporter_id left join public.profiles tp on tp.id=r.reported_user_id where p_status is null or r.status=p_status order by case r.status when 'pending' then 0 when 'reviewing' then 1 else 2 end,r.created_at desc limit greatest(1,least(coalesce(p_limit,100),300)) offset greatest(0,coalesce(p_offset,0)); end; $$;
create or replace function private.admin_resolve_conversation_report(p_report_id uuid,p_status text,p_resolution_note text default null) returns text language plpgsql security definer set search_path='' as $$ declare v_uid uuid := private.require_active_user(); v_old text; v_status text:=lower(trim(coalesce(p_status,''))); v_note text:=nullif(trim(left(coalesce(p_resolution_note,''),2000)),''); begin if not private.is_admin() then raise exception 'admin required'; end if; if v_status not in ('reviewing','resolved','dismissed') then raise exception 'invalid report status'; end if; select status into v_old from public.conversation_reports where id=p_report_id for update; if v_old is null then raise exception 'report not found'; end if; update public.conversation_reports set status=v_status,reviewed_by=v_uid,reviewed_at=case when v_status in ('resolved','dismissed') then now() else reviewed_at end,resolution_note=v_note where id=p_report_id; insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data) values(v_uid,'conversation_report',p_report_id::text,'report_status_changed',jsonb_build_object('status',v_old),jsonb_build_object('status',v_status)); return v_status; end; $$;

revoke all on function private.require_active_user() from public;
revoke all on function private.start_conversation(uuid,uuid,text), private.get_my_conversations(boolean,integer,integer), private.get_conversation_detail(uuid), private.get_conversation_messages(uuid,integer,timestamptz), private.send_message(uuid,text,uuid,uuid,jsonb), private.mark_conversation_read(uuid), private.set_conversation_archived(uuid,boolean), private.set_user_block(uuid,boolean), private.report_conversation(uuid,text,text,uuid,uuid), private.get_my_notifications(integer,integer), private.mark_notification_read(uuid,boolean), private.admin_conversation_reports(text,integer,integer), private.admin_resolve_conversation_report(uuid,text,text) from public;
grant usage on schema private to authenticated;
grant execute on function private.require_active_user(), private.start_conversation(uuid,uuid,text), private.get_my_conversations(boolean,integer,integer), private.get_conversation_detail(uuid), private.get_conversation_messages(uuid,integer,timestamptz), private.send_message(uuid,text,uuid,uuid,jsonb), private.mark_conversation_read(uuid), private.set_conversation_archived(uuid,boolean), private.set_user_block(uuid,boolean), private.report_conversation(uuid,text,text,uuid,uuid), private.get_my_notifications(integer,integer), private.mark_notification_read(uuid,boolean), private.admin_conversation_reports(text,integer,integer), private.admin_resolve_conversation_report(uuid,text,text) to authenticated;

create or replace function public.start_conversation(p_specialist_id uuid default null,p_center_id uuid default null,p_subject text default null) returns uuid language sql security invoker set search_path='' as $$ select private.start_conversation(p_specialist_id,p_center_id,p_subject); $$;
create or replace function public.get_my_conversations(p_include_archived boolean default false,p_limit integer default 50,p_offset integer default 0) returns table(conversation_id uuid,subject text,specialist_id uuid,center_id uuid,counterpart_user_id uuid,counterpart_name text,counterpart_title text,counterpart_slug text,last_message_body text,last_message_at timestamptz,unread_count bigint,archived_at timestamptz,blocked_by_me boolean,blocked_me boolean,closed_at timestamptz) language sql stable security invoker set search_path='' as $$ select * from private.get_my_conversations(p_include_archived,p_limit,p_offset); $$;
create or replace function public.get_conversation_detail(p_conversation_id uuid) returns table(conversation_id uuid,subject text,specialist_id uuid,center_id uuid,counterpart_user_id uuid,counterpart_name text,counterpart_title text,counterpart_slug text,blocked_by_me boolean,blocked_me boolean,archived_at timestamptz,closed_at timestamptz,created_at timestamptz) language sql stable security invoker set search_path='' as $$ select * from private.get_conversation_detail(p_conversation_id); $$;
create or replace function public.get_conversation_messages(p_conversation_id uuid,p_limit integer default 80,p_before timestamptz default null) returns table(message_id uuid,sender_id uuid,sender_name text,body text,attachments jsonb,message_type text,created_at timestamptz,edited_at timestamptz,deleted_at timestamptz,is_mine boolean,read_by_other boolean) language sql stable security invoker set search_path='' as $$ select * from private.get_conversation_messages(p_conversation_id,p_limit,p_before); $$;
create or replace function public.send_message(p_conversation_id uuid,p_body text,p_client_token uuid default null,p_reply_to_id uuid default null,p_attachments jsonb default '[]'::jsonb) returns uuid language sql security invoker set search_path='' as $$ select private.send_message(p_conversation_id,p_body,p_client_token,p_reply_to_id,p_attachments); $$;
create or replace function public.mark_conversation_read(p_conversation_id uuid) returns timestamptz language sql security invoker set search_path='' as $$ select private.mark_conversation_read(p_conversation_id); $$;
create or replace function public.set_conversation_archived(p_conversation_id uuid,p_archived boolean default true) returns boolean language sql security invoker set search_path='' as $$ select private.set_conversation_archived(p_conversation_id,p_archived); $$;
create or replace function public.set_user_block(p_user_id uuid,p_blocked boolean default true) returns boolean language sql security invoker set search_path='' as $$ select private.set_user_block(p_user_id,p_blocked); $$;
create or replace function public.report_conversation(p_conversation_id uuid,p_reason text,p_details text default null,p_reported_user_id uuid default null,p_message_id uuid default null) returns uuid language sql security invoker set search_path='' as $$ select private.report_conversation(p_conversation_id,p_reason,p_details,p_reported_user_id,p_message_id); $$;
create or replace function public.get_my_notifications(p_limit integer default 50,p_offset integer default 0) returns table(notification_id uuid,kind text,title text,body text,data jsonb,read_at timestamptz,created_at timestamptz) language sql stable security invoker set search_path='' as $$ select * from private.get_my_notifications(p_limit,p_offset); $$;
create or replace function public.mark_notification_read(p_notification_id uuid default null,p_all boolean default false) returns integer language sql security invoker set search_path='' as $$ select private.mark_notification_read(p_notification_id,p_all); $$;
create or replace function public.admin_conversation_reports(p_status text default null,p_limit integer default 100,p_offset integer default 0) returns table(report_id uuid,conversation_id uuid,reporter_id uuid,reporter_name text,reported_user_id uuid,reported_user_name text,message_id uuid,reason text,details text,status text,reviewed_by uuid,reviewed_at timestamptz,resolution_note text,created_at timestamptz) language sql stable security invoker set search_path='' as $$ select * from private.admin_conversation_reports(p_status,p_limit,p_offset); $$;
create or replace function public.admin_resolve_conversation_report(p_report_id uuid,p_status text,p_resolution_note text default null) returns text language sql security invoker set search_path='' as $$ select private.admin_resolve_conversation_report(p_report_id,p_status,p_resolution_note); $$;

revoke all on function public.start_conversation(uuid,uuid,text), public.get_my_conversations(boolean,integer,integer), public.get_conversation_detail(uuid), public.get_conversation_messages(uuid,integer,timestamptz), public.send_message(uuid,text,uuid,uuid,jsonb), public.mark_conversation_read(uuid), public.set_conversation_archived(uuid,boolean), public.set_user_block(uuid,boolean), public.report_conversation(uuid,text,text,uuid,uuid), public.get_my_notifications(integer,integer), public.mark_notification_read(uuid,boolean), public.admin_conversation_reports(text,integer,integer), public.admin_resolve_conversation_report(uuid,text,text) from public,anon;
grant execute on function public.start_conversation(uuid,uuid,text), public.get_my_conversations(boolean,integer,integer), public.get_conversation_detail(uuid), public.get_conversation_messages(uuid,integer,timestamptz), public.send_message(uuid,text,uuid,uuid,jsonb), public.mark_conversation_read(uuid), public.set_conversation_archived(uuid,boolean), public.set_user_block(uuid,boolean), public.report_conversation(uuid,text,text,uuid,uuid), public.get_my_notifications(integer,integer), public.mark_notification_read(uuid,boolean), public.admin_conversation_reports(text,integer,integer), public.admin_resolve_conversation_report(uuid,text,text) to authenticated,service_role;
