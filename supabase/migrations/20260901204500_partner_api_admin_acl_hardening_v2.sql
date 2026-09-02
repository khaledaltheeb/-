begin;

-- Administrative Partner API RPCs are intentionally callable only by signed-in
-- users. Each function additionally enforces private.assert_partner_admin().
-- Supabase/PostgREST roles had acquired explicit anon EXECUTE grants after the
-- original function creation, so revoke anon and PUBLIC explicitly.
revoke execute on function public.admin_create_api_partner(text,text,text,text,text[],integer,integer) from anon, public;
revoke execute on function public.admin_issue_api_partner_key(uuid,text,text[],timestamptz) from anon, public;
revoke execute on function public.admin_revoke_api_partner_key(uuid) from anon, public;
revoke execute on function public.admin_set_api_partner_status(uuid,text) from anon, public;
revoke execute on function public.admin_api_partner_dashboard() from anon, public;

grant execute on function public.admin_create_api_partner(text,text,text,text,text[],integer,integer) to authenticated, service_role;
grant execute on function public.admin_issue_api_partner_key(uuid,text,text[],timestamptz) to authenticated, service_role;
grant execute on function public.admin_revoke_api_partner_key(uuid) to authenticated, service_role;
grant execute on function public.admin_set_api_partner_status(uuid,text) to authenticated, service_role;
grant execute on function public.admin_api_partner_dashboard() to authenticated, service_role;

-- Public read/authorization RPCs are explicit rather than inherited from PUBLIC.
revoke execute on function public.api_partner_authorize(text,text) from public;
revoke execute on function public.api_public_stats() from public;
revoke execute on function public.api_content_sources(text) from public;
revoke execute on function public.api_source_detail(uuid) from public;
revoke execute on function public.api_source_registry(integer,integer,text,text,text) from public;

grant execute on function public.api_partner_authorize(text,text) to anon, authenticated, service_role;
grant execute on function public.api_public_stats() to anon, authenticated, service_role;
grant execute on function public.api_content_sources(text) to anon, authenticated, service_role;
grant execute on function public.api_source_detail(uuid) to anon, authenticated, service_role;
grant execute on function public.api_source_registry(integer,integer,text,text,text) to anon, authenticated, service_role;

commit;
