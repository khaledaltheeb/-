alter table public.centers
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references public.profiles(id) on delete set null;

create index if not exists centers_verified_by_idx on public.centers(verified_by);
