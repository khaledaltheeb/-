alter function public.register_provider_verification_document(text,text,text,text,text,bigint) security definer;
alter function public.delete_provider_verification_document(uuid) security definer;
alter function public.admin_review_provider_verification_document(uuid,text,text) security definer;
