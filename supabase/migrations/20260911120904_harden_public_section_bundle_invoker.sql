alter function public.get_public_section_bundle(uuid, integer, integer, text) security invoker;
revoke execute on function public.get_public_section_bundle(uuid, integer, integer, text) from public;
grant execute on function public.get_public_section_bundle(uuid, integer, integer, text) to anon, authenticated, service_role;
