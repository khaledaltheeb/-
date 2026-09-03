revoke all on function public.search_platform_v2_lexical(text,integer) from public,anon,authenticated;
grant execute on function public.search_platform_v2_lexical(text,integer) to service_role;

revoke all on function public.search_platform_v2_hybrid(text,extensions.vector,integer,double precision,double precision,integer) from public,anon,authenticated;
grant execute on function public.search_platform_v2_hybrid(text,extensions.vector,integer,double precision,double precision,integer) to service_role;
