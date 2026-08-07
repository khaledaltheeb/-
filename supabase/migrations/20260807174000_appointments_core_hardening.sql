alter table public.appointments
  add column if not exists conversation_id uuid references public.conversations(id) on delete set null,
  add column if not exists appointment_mode text not null default 'remote',
  add column if not exists provider_note text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by uuid references public.profiles(id) on delete set null,
  add column if not exists cancellation_reason text;

alter table public.appointments drop constraint if exists appointments_check;
alter table public.appointments add constraint appointments_target_check check ((specialist_id is not null and center_id is null) or (specialist_id is null and center_id is not null));
alter table public.appointments drop constraint if exists appointments_mode_check;
alter table public.appointments add constraint appointments_mode_check check (appointment_mode in ('remote','in_person','phone','other'));
alter table public.appointments drop constraint if exists appointments_note_length_check;
alter table public.appointments add constraint appointments_note_length_check check (note is null or length(note)<=2000);
alter table public.appointments drop constraint if exists appointments_provider_note_length_check;
alter table public.appointments add constraint appointments_provider_note_length_check check (provider_note is null or length(provider_note)<=2000);
alter table public.appointments drop constraint if exists appointments_cancellation_reason_length_check;
alter table public.appointments add constraint appointments_cancellation_reason_length_check check (cancellation_reason is null or length(cancellation_reason)<=1000);

create index if not exists appointments_conversation_idx on public.appointments(conversation_id,created_at desc);
create index if not exists appointments_requester_status_recent_idx on public.appointments(requester_id,status,starts_at desc);
create index if not exists appointments_specialist_status_start_idx on public.appointments(specialist_id,status,starts_at) where specialist_id is not null;
create index if not exists appointments_center_status_start_idx on public.appointments(center_id,status,starts_at) where center_id is not null;

alter table public.appointments enable row level security;
do $$ declare r record; begin for r in select schemaname,tablename,policyname from pg_policies where schemaname='public' and tablename='appointments' loop execute format('drop policy if exists %I on %I.%I',r.policyname,r.schemaname,r.tablename); end loop; end $$;
revoke all on public.appointments from anon,authenticated;

create or replace function private.request_appointment(p_specialist_id uuid default null,p_center_id uuid default null,p_starts_at timestamptz default null,p_ends_at timestamptz default null,p_note text default null,p_mode text default 'remote',p_conversation_id uuid default null)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=private.require_active_user(); v_target uuid; v_id uuid; v_conversation uuid:=p_conversation_id; v_end timestamptz; v_note text:=nullif(trim(left(coalesce(p_note,''),2000)),''); v_mode text:=lower(trim(coalesce(p_mode,'remote')));
begin
 if (p_specialist_id is null)=(p_center_id is null) then raise exception 'choose exactly one appointment target'; end if;
 if p_starts_at is null or p_starts_at<now()+interval '15 minutes' or p_starts_at>now()+interval '365 days' then raise exception 'invalid appointment time'; end if;
 v_end:=coalesce(p_ends_at,p_starts_at+interval '60 minutes');
 if v_end<=p_starts_at or v_end>p_starts_at+interval '8 hours' then raise exception 'invalid appointment duration'; end if;
 if v_mode not in ('remote','in_person','phone','other') then raise exception 'invalid appointment mode'; end if;
 if p_specialist_id is not null then select s.user_id into v_target from public.specialists s join public.profiles p on p.id=s.user_id and p.is_active=true where s.id=p_specialist_id and s.is_active=true and s.verification='verified'::public.verification_status and s.user_id is not null;
 else select c.manager_user_id into v_target from public.centers c join public.profiles p on p.id=c.manager_user_id and p.is_active=true where c.id=p_center_id and c.is_active=true and c.verification='verified'::public.verification_status and c.manager_user_id is not null; end if;
 if v_target is null or v_target=v_uid then raise exception 'appointment target unavailable'; end if;
 if exists(select 1 from public.user_blocks b where (b.blocker_id=v_uid and b.blocked_id=v_target) or (b.blocker_id=v_target and b.blocked_id=v_uid)) then raise exception 'appointment unavailable'; end if;
 if v_conversation is null then v_conversation:=private.start_conversation(p_specialist_id,p_center_id,'طلب موعد');
 else if not exists(select 1 from public.conversations c join public.conversation_participants cp on cp.conversation_id=c.id and cp.user_id=v_uid where c.id=v_conversation and c.closed_at is null and ((p_specialist_id is not null and c.specialist_id=p_specialist_id) or (p_center_id is not null and c.center_id=p_center_id))) then raise exception 'appointment conversation mismatch'; end if; end if;
 if (select count(*) from public.appointments a where a.requester_id=v_uid and a.created_at>now()-interval '1 day')>=10 then raise exception 'appointment rate limit exceeded'; end if;
 if exists(select 1 from public.appointments a where a.requester_id=v_uid and a.status in ('requested'::public.appointment_status,'confirmed'::public.appointment_status) and ((p_specialist_id is not null and a.specialist_id=p_specialist_id) or (p_center_id is not null and a.center_id=p_center_id)) and abs(extract(epoch from (a.starts_at-p_starts_at)))<600) then raise exception 'similar appointment already exists'; end if;
 insert into public.appointments(requester_id,specialist_id,center_id,conversation_id,starts_at,ends_at,status,note,appointment_mode) values(v_uid,p_specialist_id,p_center_id,v_conversation,p_starts_at,v_end,'requested'::public.appointment_status,v_note,v_mode) returning id into v_id;
 insert into public.notifications(user_id,kind,title,body,data) values(v_target,'appointment_requested','طلب موعد جديد','لديك طلب موعد جديد في منصة روافد.',jsonb_build_object('appointment_id',v_id,'conversation_id',v_conversation));
 insert into public.audit_logs(actor_id,entity_type,entity_id,action,after_data) values(v_uid,'appointment',v_id::text,'appointment_requested',jsonb_build_object('specialist_id',p_specialist_id,'center_id',p_center_id,'conversation_id',v_conversation,'starts_at',p_starts_at,'mode',v_mode));
 return v_id;
end;
$$;

create or replace function private.get_my_appointments(p_limit integer default 100,p_offset integer default 0)
returns table(appointment_id uuid,conversation_id uuid,perspective text,specialist_id uuid,center_id uuid,counterpart_name text,counterpart_title text,counterpart_slug text,starts_at timestamptz,ends_at timestamptz,appointment_mode text,status public.appointment_status,note text,provider_note text,cancelled_at timestamptz,cancellation_reason text,created_at timestamptz,updated_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$ declare v_uid uuid:=private.require_active_user(); begin return query select a.id,a.conversation_id,case when a.requester_id=v_uid then 'requester' else 'provider' end,a.specialist_id,a.center_id,case when a.requester_id=v_uid then coalesce(s.full_name,c.name,'جهة مقدمة للخدمة') else coalesce(rp.display_name,'مستخدم روافد') end,case when a.requester_id=v_uid then coalesce(s.professional_title,case when c.id is not null then 'مركز موثق' end) else 'طالب الموعد' end,case when a.requester_id=v_uid then coalesce(s.slug,c.slug) else null end,a.starts_at,a.ends_at,a.appointment_mode,a.status,a.note,a.provider_note,a.cancelled_at,a.cancellation_reason,a.created_at,a.updated_at from public.appointments a left join public.profiles rp on rp.id=a.requester_id left join public.specialists s on s.id=a.specialist_id left join public.centers c on c.id=a.center_id where a.requester_id=v_uid or exists(select 1 from public.specialists ps where ps.id=a.specialist_id and ps.user_id=v_uid) or exists(select 1 from public.centers pc where pc.id=a.center_id and pc.manager_user_id=v_uid) or private.is_admin() order by a.starts_at desc,a.created_at desc limit greatest(1,least(coalesce(p_limit,100),300)) offset greatest(0,coalesce(p_offset,0)); end; $$;

create or replace function private.provider_update_appointment(p_appointment_id uuid,p_status public.appointment_status,p_starts_at timestamptz default null,p_ends_at timestamptz default null,p_provider_note text default null)
returns public.appointment_status language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=private.require_active_user(); v_row public.appointments%rowtype; v_start timestamptz; v_end timestamptz; v_note text:=nullif(trim(left(coalesce(p_provider_note,''),2000)),'');
begin
 select * into v_row from public.appointments where id=p_appointment_id for update; if v_row.id is null then raise exception 'appointment not found'; end if;
 if not private.is_admin() and not exists(select 1 from public.specialists s where s.id=v_row.specialist_id and s.user_id=v_uid) and not exists(select 1 from public.centers c where c.id=v_row.center_id and c.manager_user_id=v_uid) then raise exception 'provider denied'; end if;
 if not ((v_row.status='requested'::public.appointment_status and p_status in ('confirmed'::public.appointment_status,'cancelled'::public.appointment_status)) or (v_row.status='confirmed'::public.appointment_status and p_status in ('confirmed'::public.appointment_status,'completed'::public.appointment_status,'cancelled'::public.appointment_status,'no_show'::public.appointment_status))) then raise exception 'invalid appointment transition'; end if;
 v_start:=coalesce(p_starts_at,v_row.starts_at); v_end:=coalesce(p_ends_at,v_row.ends_at,v_start+interval '60 minutes');
 if v_end<=v_start or v_end>v_start+interval '8 hours' then raise exception 'invalid appointment duration'; end if;
 if p_status='confirmed'::public.appointment_status and (v_row.status='requested'::public.appointment_status or p_starts_at is not null or p_ends_at is not null) and v_start<now()+interval '5 minutes' then raise exception 'confirmed appointment must be in the future'; end if;
 if p_status in ('completed'::public.appointment_status,'no_show'::public.appointment_status) and now()<v_start then raise exception 'appointment has not started'; end if;
 update public.appointments set status=p_status,starts_at=v_start,ends_at=v_end,provider_note=v_note,confirmed_at=case when p_status='confirmed'::public.appointment_status then coalesce(confirmed_at,now()) else confirmed_at end,completed_at=case when p_status='completed'::public.appointment_status then now() else completed_at end,cancelled_at=case when p_status='cancelled'::public.appointment_status then now() else cancelled_at end,cancelled_by=case when p_status='cancelled'::public.appointment_status then v_uid else cancelled_by end,updated_at=now() where id=p_appointment_id;
 insert into public.notifications(user_id,kind,title,body,data) values(v_row.requester_id,'appointment_status','تحديث الموعد','تم تحديث حالة موعدك في منصة روافد.',jsonb_build_object('appointment_id',p_appointment_id,'conversation_id',v_row.conversation_id,'status',p_status::text));
 insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data) values(v_uid,'appointment',p_appointment_id::text,'appointment_status_changed',jsonb_build_object('status',v_row.status,'starts_at',v_row.starts_at),jsonb_build_object('status',p_status,'starts_at',v_start)); return p_status;
end; $$;

create or replace function private.requester_cancel_appointment(p_appointment_id uuid,p_reason text default null)
returns public.appointment_status language plpgsql security definer set search_path=''
as $$ declare v_uid uuid:=private.require_active_user(); v_row public.appointments%rowtype; v_target uuid; v_reason text:=nullif(trim(left(coalesce(p_reason,''),1000)),''); begin select * into v_row from public.appointments where id=p_appointment_id and requester_id=v_uid for update; if v_row.id is null then raise exception 'appointment denied'; end if; if v_row.status not in ('requested'::public.appointment_status,'confirmed'::public.appointment_status) then raise exception 'appointment cannot be cancelled'; end if; if v_row.specialist_id is not null then select user_id into v_target from public.specialists where id=v_row.specialist_id; else select manager_user_id into v_target from public.centers where id=v_row.center_id; end if; update public.appointments set status='cancelled'::public.appointment_status,cancelled_at=now(),cancelled_by=v_uid,cancellation_reason=v_reason,updated_at=now() where id=p_appointment_id; if v_target is not null then insert into public.notifications(user_id,kind,title,body,data) values(v_target,'appointment_cancelled','إلغاء موعد','تم إلغاء موعد في منصة روافد.',jsonb_build_object('appointment_id',p_appointment_id,'conversation_id',v_row.conversation_id)); end if; insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data,after_data) values(v_uid,'appointment',p_appointment_id::text,'appointment_cancelled',jsonb_build_object('status',v_row.status),jsonb_build_object('status','cancelled')); return 'cancelled'::public.appointment_status; end; $$;

create or replace function private.admin_appointments(p_status text default null,p_limit integer default 200,p_offset integer default 0)
returns table(appointment_id uuid,requester_id uuid,requester_name text,conversation_id uuid,specialist_id uuid,center_id uuid,provider_name text,starts_at timestamptz,ends_at timestamptz,appointment_mode text,status public.appointment_status,note text,provider_note text,cancelled_at timestamptz,cancellation_reason text,created_at timestamptz,updated_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$ begin if not private.is_admin() then raise exception 'admin required'; end if; return query select a.id,a.requester_id,rp.display_name,a.conversation_id,a.specialist_id,a.center_id,coalesce(s.full_name,c.name,'غير محدد'),a.starts_at,a.ends_at,a.appointment_mode,a.status,a.note,a.provider_note,a.cancelled_at,a.cancellation_reason,a.created_at,a.updated_at from public.appointments a left join public.profiles rp on rp.id=a.requester_id left join public.specialists s on s.id=a.specialist_id left join public.centers c on c.id=a.center_id where p_status is null or a.status::text=p_status order by a.created_at desc limit greatest(1,least(coalesce(p_limit,200),500)) offset greatest(0,coalesce(p_offset,0)); end; $$;

revoke all on function private.request_appointment(uuid,uuid,timestamptz,timestamptz,text,text,uuid), private.get_my_appointments(integer,integer), private.provider_update_appointment(uuid,public.appointment_status,timestamptz,timestamptz,text), private.requester_cancel_appointment(uuid,text), private.admin_appointments(text,integer,integer) from public;
grant execute on function private.request_appointment(uuid,uuid,timestamptz,timestamptz,text,text,uuid), private.get_my_appointments(integer,integer), private.provider_update_appointment(uuid,public.appointment_status,timestamptz,timestamptz,text), private.requester_cancel_appointment(uuid,text), private.admin_appointments(text,integer,integer) to authenticated;

create or replace function public.request_appointment(p_specialist_id uuid default null,p_center_id uuid default null,p_starts_at timestamptz default null,p_ends_at timestamptz default null,p_note text default null,p_mode text default 'remote',p_conversation_id uuid default null) returns uuid language sql security invoker set search_path='' as $$ select private.request_appointment(p_specialist_id,p_center_id,p_starts_at,p_ends_at,p_note,p_mode,p_conversation_id); $$;
create or replace function public.get_my_appointments(p_limit integer default 100,p_offset integer default 0) returns table(appointment_id uuid,conversation_id uuid,perspective text,specialist_id uuid,center_id uuid,counterpart_name text,counterpart_title text,counterpart_slug text,starts_at timestamptz,ends_at timestamptz,appointment_mode text,status public.appointment_status,note text,provider_note text,cancelled_at timestamptz,cancellation_reason text,created_at timestamptz,updated_at timestamptz) language sql stable security invoker set search_path='' as $$ select * from private.get_my_appointments(p_limit,p_offset); $$;
create or replace function public.provider_update_appointment(p_appointment_id uuid,p_status public.appointment_status,p_starts_at timestamptz default null,p_ends_at timestamptz default null,p_provider_note text default null) returns public.appointment_status language sql security invoker set search_path='' as $$ select private.provider_update_appointment(p_appointment_id,p_status,p_starts_at,p_ends_at,p_provider_note); $$;
create or replace function public.requester_cancel_appointment(p_appointment_id uuid,p_reason text default null) returns public.appointment_status language sql security invoker set search_path='' as $$ select private.requester_cancel_appointment(p_appointment_id,p_reason); $$;
create or replace function public.admin_appointments(p_status text default null,p_limit integer default 200,p_offset integer default 0) returns table(appointment_id uuid,requester_id uuid,requester_name text,conversation_id uuid,specialist_id uuid,center_id uuid,provider_name text,starts_at timestamptz,ends_at timestamptz,appointment_mode text,status public.appointment_status,note text,provider_note text,cancelled_at timestamptz,cancellation_reason text,created_at timestamptz,updated_at timestamptz) language sql stable security invoker set search_path='' as $$ select * from private.admin_appointments(p_status,p_limit,p_offset); $$;

revoke all on function public.request_appointment(uuid,uuid,timestamptz,timestamptz,text,text,uuid), public.get_my_appointments(integer,integer), public.provider_update_appointment(uuid,public.appointment_status,timestamptz,timestamptz,text), public.requester_cancel_appointment(uuid,text), public.admin_appointments(text,integer,integer) from public,anon;
grant execute on function public.request_appointment(uuid,uuid,timestamptz,timestamptz,text,text,uuid), public.get_my_appointments(integer,integer), public.provider_update_appointment(uuid,public.appointment_status,timestamptz,timestamptz,text), public.requester_cancel_appointment(uuid,text), public.admin_appointments(text,integer,integer) to authenticated,service_role;
