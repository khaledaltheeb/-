revoke execute on function public.legacy_preserved_route_exists(text) from anon, authenticated;
revoke execute on function public.get_legacy_preserved_page(text) from anon, authenticated;

grant execute on function public.legacy_preserved_route_exists(text) to service_role;
grant execute on function public.get_legacy_preserved_page(text) to service_role;
