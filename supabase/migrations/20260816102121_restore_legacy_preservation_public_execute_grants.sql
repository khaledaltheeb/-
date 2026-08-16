revoke all on function public.get_legacy_preserved_page(text) from public;
revoke all on function public.legacy_preserved_route_exists(text) from public;

grant execute on function public.get_legacy_preserved_page(text) to anon, authenticated;
grant execute on function public.legacy_preserved_route_exists(text) to anon, authenticated;
