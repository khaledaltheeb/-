create or replace function private.admin_platform_integrity()
returns table(check_key text,severity text,issue_count bigint,summary text)
language plpgsql
stable
security definer
set search_path=''
as $$
begin
  if not private.is_admin() then raise exception 'admin required'; end if;
  return query select 'conversation_participant_count','error',count(*)::bigint,'محادثات لا تحتوي طرفين بالضبط' from public.conversations c where (select count(*) from public.conversation_participants cp where cp.conversation_id=c.id)<>2;
  return query select 'message_sender_membership','error',count(*)::bigint,'رسائل مرسلها ليس عضوًا في المحادثة' from public.messages m where not exists(select 1 from public.conversation_participants cp where cp.conversation_id=m.conversation_id and cp.user_id=m.sender_id);
  return query select 'appointment_conversation_alignment','error',count(*)::bigint,'مواعيد لا تتطابق مع هدف أو طالب المحادثة المرتبطة' from public.appointments a left join public.conversations c on c.id=a.conversation_id where a.conversation_id is not null and (c.id is null or (a.specialist_id is distinct from c.specialist_id) or (a.center_id is distinct from c.center_id) or not exists(select 1 from public.conversation_participants cp where cp.conversation_id=a.conversation_id and cp.user_id=a.requester_id));
  return query select 'verified_specialist_contact_readiness','warn',count(*)::bigint,'مختصون موثقون لا يملكون حسابًا فعّالًا لاستقبال الرسائل والمواعيد' from public.specialists s left join public.profiles p on p.id=s.user_id where s.is_active=true and s.verification='verified'::public.verification_status and (s.user_id is null or p.id is null or p.is_active is distinct from true);
  return query select 'verified_center_contact_readiness','warn',count(*)::bigint,'مراكز موثقة لا تملك مدير حساب فعّالًا لاستقبال الرسائل والمواعيد' from public.centers c left join public.profiles p on p.id=c.manager_user_id where c.is_active=true and c.verification='verified'::public.verification_status and (c.manager_user_id is null or p.id is null or p.is_active is distinct from true);
  return query select 'redirect_cycles','error',count(*)::bigint,'تحويلات نشطة تدخل في حلقة أو سلسلة غير آمنة' from public.redirects r where r.is_active=true and not private.validate_redirect_chain(r.source_path,r.destination_path,r.id);
  return query select 'sensitive_direct_grants','error',count(*)::bigint,'صلاحيات مباشرة غير مسموحة على الجداول الحساسة' from information_schema.role_table_grants g where g.table_schema='public' and g.grantee in ('anon','authenticated') and g.table_name in ('conversations','conversation_participants','messages','notifications','user_blocks','conversation_reports','appointments','audit_logs') and g.privilege_type in ('SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER');
  return query select 'published_content_meta_description','warn',count(*)::bigint,'صفحات منشورة بلا Meta Description تحريرية' from public.content c where c.status='published'::public.content_status and c.published_at is not null and c.published_at<=now() and nullif(trim(coalesce(c.seo_description,'')),'') is null;
  return query select 'published_content_author','warn',count(*)::bigint,'صفحات منشورة بلا اسم مؤلف ظاهر' from public.content c where c.status='published'::public.content_status and c.published_at is not null and c.published_at<=now() and nullif(trim(coalesce(c.author_display_name,'')),'') is null;
  return query select 'medical_content_disclaimer','warn',count(*)::bigint,'صفحات طبية منشورة بلا إخلاء مسؤولية خاص بالصفحة' from public.content c where c.status='published'::public.content_status and c.published_at is not null and c.published_at<=now() and c.content_type in ('condition','protocol','intervention','assessment') and nullif(trim(coalesce(c.medical_disclaimer,'')),'') is null;
end;
$$;
revoke all on function private.admin_platform_integrity() from public;
grant execute on function private.admin_platform_integrity() to authenticated;
create or replace function public.admin_platform_integrity() returns table(check_key text,severity text,issue_count bigint,summary text) language sql stable security invoker set search_path='' as $$ select * from private.admin_platform_integrity(); $$;
revoke all on function public.admin_platform_integrity() from public,anon;
grant execute on function public.admin_platform_integrity() to authenticated,service_role;
