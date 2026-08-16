alter table public.sectors
  add column if not exists editorial_content_id uuid references public.content(id) on delete set null;

create index if not exists sectors_editorial_content_idx
  on public.sectors(editorial_content_id)
  where editorial_content_id is not null;

comment on column public.sectors.editorial_content_id is
  'Optional reviewed landing/editorial content rendered inside the sector page after publication; preserves rich legacy sector knowledge without duplicating taxonomy.';
