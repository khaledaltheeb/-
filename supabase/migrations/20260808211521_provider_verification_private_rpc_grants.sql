alter function public.register_provider_verification_document(text,text,text,text,text,bigint) security invoker;
alter function public.delete_provider_verification_document(uuid) security invoker;
alter function public.admin_review_provider_verification_document(uuid,text,text) security invoker;

grant execute on function private.register_provider_verification_document(text,text,text,text,text,bigint) to authenticated;
grant execute on function private.delete_provider_verification_document(uuid) to authenticated;
grant execute on function private.admin_review_provider_verification_document(uuid,text,text) to authenticated;
