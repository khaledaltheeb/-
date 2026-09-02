create table if not exists internal_search_v2.public_search_rate_limits (
  bucket_key text primary key,
  window_start timestamptz not null default pg_catalog.now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default pg_catalog.now()
);

revoke all on internal_search_v2.public_search_rate_limits from public,anon,authenticated;

create or replace function public.consume_public_search_budget(
  p_bucket_key text,
  p_limit integer default 60,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
volatile
security definer
set search_path=''
as $$
declare
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_limit integer := greatest(1,least(coalesce(p_limit,60),300));
  v_window integer := greatest(10,least(coalesce(p_window_seconds,60),3600));
  v_count integer;
begin
  if p_bucket_key is null or pg_catalog.char_length(p_bucket_key) < 16 or pg_catalog.char_length(p_bucket_key) > 128 then
    return false;
  end if;

  insert into internal_search_v2.public_search_rate_limits(bucket_key,window_start,request_count,updated_at)
  values(p_bucket_key,v_now,1,v_now)
  on conflict(bucket_key) do update set
    window_start = case when internal_search_v2.public_search_rate_limits.window_start <= v_now - pg_catalog.make_interval(secs=>v_window)
      then v_now else internal_search_v2.public_search_rate_limits.window_start end,
    request_count = case when internal_search_v2.public_search_rate_limits.window_start <= v_now - pg_catalog.make_interval(secs=>v_window)
      then 1 else internal_search_v2.public_search_rate_limits.request_count + 1 end,
    updated_at = v_now
  returning request_count into v_count;

  return v_count <= v_limit;
end;
$$;

revoke all on function public.consume_public_search_budget(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_public_search_budget(text,integer,integer) to service_role;

create index if not exists search_v2_public_rate_limits_updated_idx
  on internal_search_v2.public_search_rate_limits(updated_at);
