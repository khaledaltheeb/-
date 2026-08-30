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
  v_existing text;
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

  select a.answer_code into v_existing
  from public.circle_message_answers a
  where a.message_id=p_message_id and a.responder_id=v_uid;
  if v_existing is not null then return v_existing = v_answer; end if;

  insert into public.circle_message_answers(message_id,responder_id,answer_code)
    values(p_message_id,v_uid,v_answer);
  insert into public.notifications(user_id,kind,title,body,data)
    values(v_message.sender_id,'circle_answer','تمت الإجابة على رسالتك',
      case when v_answer='yes' then 'الإجابة: نعم' when v_answer='no' then 'الإجابة: لا' else 'تم رفض طلب الموقع' end,
      jsonb_build_object('circle_connection_id',v_message.connection_id,'circle_message_id',p_message_id,'answer',v_answer));
  return true;
end;
$function$;
