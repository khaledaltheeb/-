-- Rawafid institutional Public API v1 lifecycle primitives.
-- Public exposure is intentionally limited to metadata for content that is or was public.

create table if not exists public.api_change_log (
  id bigint generated always as identity primary key,
  content_id uuid not null,
  event_type text not null check (event_type in ('published','updated','archived')),
  slug text not null,
  content_type text not null,
  canonical_url text,
  occurred_at timestamptz not null default now()
);

create index if not exists api_change_log_occurred_idx
  on public.api_change_log (occurred_at desc, id desc);
create index if not exists api_change_log_content_idx
  on public.api_change_log (content_id, occurred_at desc);

alter table public.api_change_log enable row level security;

drop policy if exists api_change_log_public_read on public.api_change_log;
create policy api_change_log_public_read
  on public.api_change_log
  for select
  to anon, authenticated
  using (true);

create or replace function private.log_public_api_content_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_public boolean := false;
  new_public boolean := false;
  event_name text;
begin
  if tg_op <> 'INSERT' then
    old_public := old.status = 'published'::public.content_status
      and old.robots_index = true
      and old.published_at is not null
      and old.published_at <= now();
  end if;

  if tg_op <> 'DELETE' then
    new_public := new.status = 'published'::public.content_status
      and new.robots_index = true
      and new.published_at is not null
      and new.published_at <= now();
  end if;

  if tg_op = 'INSERT' and new_public then
    event_name := 'published';
  elsif tg_op = 'UPDATE' and not old_public and new_public then
    event_name := 'published';
  elsif tg_op = 'UPDATE' and old_public and new_public then
    event_name := 'updated';
  elsif tg_op = 'UPDATE' and old_public and not new_public then
    event_name := 'archived';
  elsif tg_op = 'DELETE' and old_public then
    event_name := 'archived';
  else
    return coalesce(new, old);
  end if;

  insert into public.api_change_log(content_id,event_type,slug,content_type,canonical_url,occurred_at)
  values(
    case when tg_op = 'DELETE' then old.id else new.id end,
    event_name,
    case when tg_op = 'DELETE' then old.slug else new.slug end,
    case when tg_op = 'DELETE' then old.content_type else new.content_type end,
    case when tg_op = 'DELETE' then old.canonical_url else new.canonical_url end,
    now()
  );

  return coalesce(new, old);
end;
$$;

revoke all on function private.log_public_api_content_change() from public;

drop trigger if exists public_api_content_change_log on public.content;
create trigger public_api_content_change_log
after insert or update or delete on public.content
for each row execute function private.log_public_api_content_change();

-- Seed a machine-readable baseline for content already published before API v1.
insert into public.api_change_log(content_id,event_type,slug,content_type,canonical_url,occurred_at)
select c.id,'published',c.slug,c.content_type,c.canonical_url,coalesce(c.published_at,c.updated_at,now())
from public.content c
where c.status = 'published'::public.content_status
  and c.robots_index = true
  and c.published_at is not null
  and c.published_at <= now()
  and not exists (
    select 1 from public.api_change_log l
    where l.content_id = c.id and l.event_type = 'published'
  );

create or replace function public.api_public_stats()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with public_rows as (
    select content_type, updated_at
    from public.content
    where status = 'published'::public.content_status
      and robots_index = true
      and published_at is not null
      and published_at <= now()
  ), type_counts as (
    select content_type, count(*)::bigint as count
    from public_rows
    group by content_type
  )
  select jsonb_build_object(
    'total', (select count(*)::bigint from public_rows),
    'by_type', coalesce((select jsonb_object_agg(content_type,count order by content_type) from type_counts), '{}'::jsonb),
    'latest_updated_at', (select max(updated_at) from public_rows)
  );
$$;

revoke all on function public.api_public_stats() from public;
grant execute on function public.api_public_stats() to anon, authenticated, service_role;
