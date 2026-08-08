create index if not exists provider_verification_documents_reviewer_idx
on public.provider_verification_documents(reviewed_by)
where reviewed_by is not null;
