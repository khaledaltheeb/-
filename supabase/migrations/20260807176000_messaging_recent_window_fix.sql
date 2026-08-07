create or replace function private.get_conversation_messages(p_conversation_id uuid,p_limit integer default 80,p_before timestamptz default null)
returns table(message_id uuid,sender_id uuid,sender_name text,body text,attachments jsonb,message_type text,created_at timestamptz,edited_at timestamptz,deleted_at timestamptz,is_mine boolean,read_by_other boolean)
language plpgsql stable security definer set search_path=''
as $$
declare v_uid uuid:=private.require_active_user();
begin
 if not exists(select 1 from public.conversation_participants cp where cp.conversation_id=p_conversation_id and cp.user_id=v_uid) then raise exception 'conversation denied'; end if;
 return query
 with recent as (
   select m.* from public.messages m where m.conversation_id=p_conversation_id and (p_before is null or m.created_at<p_before)
   order by m.created_at desc,m.id desc limit greatest(1,least(coalesce(p_limit,80),200))
 )
 select m.id,m.sender_id,coalesce(case when s.user_id=m.sender_id then s.full_name when ctr.manager_user_id=m.sender_id then ctr.name else p.display_name end,'مستخدم روافد'),
        case when m.deleted_at is null then m.body else null end,case when m.deleted_at is null then m.attachments else '[]'::jsonb end,
        m.message_type,m.created_at,m.edited_at,m.deleted_at,m.sender_id=v_uid,
        exists(select 1 from public.conversation_participants cp2 where cp2.conversation_id=m.conversation_id and cp2.user_id<>m.sender_id and cp2.last_read_at is not null and cp2.last_read_at>=m.created_at)
 from recent m join public.conversations c on c.id=m.conversation_id left join public.profiles p on p.id=m.sender_id left join public.specialists s on s.id=c.specialist_id left join public.centers ctr on ctr.id=c.center_id
 order by m.created_at asc,m.id asc;
end;
$$;
