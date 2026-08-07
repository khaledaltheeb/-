revoke all on public.audit_logs from anon,authenticated;
revoke all on public.redirects from anon,authenticated;
grant select on public.redirects to anon,authenticated;
