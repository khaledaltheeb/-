revoke execute on function public.set_content_release_contract_v6(uuid,jsonb) from anon;
revoke execute on function private.set_content_release_contract_v6(uuid,jsonb) from anon;
grant execute on function public.set_content_release_contract_v6(uuid,jsonb) to authenticated, service_role;
grant execute on function private.set_content_release_contract_v6(uuid,jsonb) to authenticated, service_role;
