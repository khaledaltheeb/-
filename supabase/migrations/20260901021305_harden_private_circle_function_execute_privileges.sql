do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and p.proname like 'circle_%'
  loop
    execute format('revoke execute on function %s from public', r.signature);
    execute format('grant execute on function %s to authenticated', r.signature);
  end loop;
end
$$;