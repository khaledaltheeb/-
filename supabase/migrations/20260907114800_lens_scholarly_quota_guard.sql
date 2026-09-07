-- Distributed, fail-closed Lens Scholarly API quota guard.
-- Enforces the limits communicated for the current Rawafid Lens route:
-- 10 requests per UTC minute and 20,000 requests per UTC month.
-- The counter is consumed before the upstream request so retries, failures and
-- concurrent app instances cannot silently exceed the allocation.

create table if not exists private.lens_scholarly_usage_windows (
  window_kind text not null check (window_kind in ('minute','month')),
  window_start timestamptz not null,
  used integer not null default 0 check (used >= 0),
  updated_at timestamptz not null default now(),
  primary key (window_kind, window_start)
);

revoke all on table private.lens_scholarly_usage_windows from public;

create index if not exists lens_scholarly_usage_window_start_idx
  on private.lens_scholarly_usage_windows(window_start);

create or replace function public.acquire_lens_scholarly_quota()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_minute_start timestamptz := date_trunc('minute', now());
  v_month_start timestamptz := (date_trunc('month', now() at time zone 'UTC') at time zone 'UTC');
  v_minute_used integer := 0;
  v_month_used integer := 0;
  v_minute_after integer;
  v_month_after integer;
begin
  -- Serialize all quota reservations so horizontally scaled app instances share
  -- one authoritative allocation. The lock is transaction-scoped.
  perform pg_advisory_xact_lock(hashtextextended('rawafid:lens:scholarly:quota', 0));

  select used into v_minute_used
  from private.lens_scholarly_usage_windows
  where window_kind='minute' and window_start=v_minute_start;

  select used into v_month_used
  from private.lens_scholarly_usage_windows
  where window_kind='month' and window_start=v_month_start;

  v_minute_used := coalesce(v_minute_used, 0);
  v_month_used := coalesce(v_month_used, 0);

  if v_minute_used >= 10 then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'minute_limit',
      'minute', jsonb_build_object('limit',10,'remaining',0,'reset_at',v_minute_start+interval '1 minute'),
      'month', jsonb_build_object('limit',20000,'remaining',greatest(20000-v_month_used,0),'reset_at',v_month_start+interval '1 month')
    );
  end if;

  if v_month_used >= 20000 then
    return jsonb_build_object(
      'allowed', false,
      'reason', 'month_limit',
      'minute', jsonb_build_object('limit',10,'remaining',greatest(10-v_minute_used,0),'reset_at',v_minute_start+interval '1 minute'),
      'month', jsonb_build_object('limit',20000,'remaining',0,'reset_at',v_month_start+interval '1 month')
    );
  end if;

  insert into private.lens_scholarly_usage_windows(window_kind,window_start,used,updated_at)
  values('minute',v_minute_start,1,now())
  on conflict(window_kind,window_start) do update
    set used=private.lens_scholarly_usage_windows.used+1,updated_at=now()
  returning used into v_minute_after;

  insert into private.lens_scholarly_usage_windows(window_kind,window_start,used,updated_at)
  values('month',v_month_start,1,now())
  on conflict(window_kind,window_start) do update
    set used=private.lens_scholarly_usage_windows.used+1,updated_at=now()
  returning used into v_month_after;

  -- Opportunistic retention cleanup. Keep current and previous periods only.
  delete from private.lens_scholarly_usage_windows
  where (window_kind='minute' and window_start < v_minute_start-interval '2 days')
     or (window_kind='month' and window_start < v_month_start-interval '2 months');

  return jsonb_build_object(
    'allowed', true,
    'minute', jsonb_build_object('limit',10,'remaining',greatest(10-v_minute_after,0),'reset_at',v_minute_start+interval '1 minute'),
    'month', jsonb_build_object('limit',20000,'remaining',greatest(20000-v_month_after,0),'reset_at',v_month_start+interval '1 month')
  );
end;
$$;

revoke all on function public.acquire_lens_scholarly_quota() from public, anon, authenticated;
grant execute on function public.acquire_lens_scholarly_quota() to service_role;
