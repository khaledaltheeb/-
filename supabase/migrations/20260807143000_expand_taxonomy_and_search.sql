create extension if not exists pg_trgm;

alter table public.sectors
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists visibility text not null default 'public',
  add column if not exists audience text[] not null default '{}'::text[],
  add column if not exists icon_key text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.sectors
  drop constraint if exists sectors_visibility_check;
alter table public.sectors
  add constraint sectors_visibility_check check (visibility in ('public','authenticated','hidden'));

alter table public.categories
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists visibility text not null default 'public',
  add column if not exists audience text[] not null default '{}'::text[],
  add column if not exists icon_key text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.categories
  drop constraint if exists categories_visibility_check;
alter table public.categories
  add constraint categories_visibility_check check (visibility in ('public','authenticated','hidden'));

alter table public.content drop constraint if exists content_content_type_check;
alter table public.content
  add constraint content_content_type_check check (
    content_type in (
      'article','guide','condition','research','comparison','tool','news','sector_page','landing_page',
      'assessment','intervention','protocol','course','learning_path','resource','calendar','glossary_term','faq','directory_page'
    )
  );

alter table public.content
  add column if not exists search_aliases text[] not null default '{}'::text[],
  add column if not exists search_vector tsvector;

create or replace function public.refresh_content_search_vector()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_vector := pg_catalog.to_tsvector(
    'pg_catalog.simple'::regconfig,
    coalesce(new.title, '') || ' ' ||
    coalesce(new.excerpt, '') || ' ' ||
    coalesce(new.body_text, '') || ' ' ||
    coalesce(pg_catalog.array_to_string(new.search_aliases, ' '), '')
  );
  return new;
end;
$$;

drop trigger if exists content_search_vector_updated on public.content;
create trigger content_search_vector_updated
before insert or update of title, excerpt, body_text, search_aliases on public.content
for each row execute function public.refresh_content_search_vector();

update public.content
set search_vector = pg_catalog.to_tsvector(
  'pg_catalog.simple'::regconfig,
  coalesce(title, '') || ' ' ||
  coalesce(excerpt, '') || ' ' ||
  coalesce(body_text, '') || ' ' ||
  coalesce(pg_catalog.array_to_string(search_aliases, ' '), '')
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_tags (
  content_id uuid not null references public.content(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(content_id, tag_id)
);

create table if not exists public.content_categories (
  content_id uuid not null references public.content(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key(content_id, category_id)
);

create index if not exists sectors_name_trgm_idx on public.sectors using gin (name_ar gin_trgm_ops);
create index if not exists categories_name_trgm_idx on public.categories using gin (name_ar gin_trgm_ops);
create index if not exists content_title_trgm_idx on public.content using gin (title gin_trgm_ops);
create index if not exists content_body_trgm_idx on public.content using gin (body_text gin_trgm_ops);
create index if not exists content_search_vector_idx on public.content using gin (search_vector);
create index if not exists specialists_name_trgm_idx on public.specialists using gin (full_name gin_trgm_ops);
create index if not exists centers_name_trgm_idx on public.centers using gin (name gin_trgm_ops);
create index if not exists tags_name_trgm_idx on public.tags using gin (name_ar gin_trgm_ops);
create index if not exists content_categories_category_idx on public.content_categories(category_id, content_id);
create index if not exists content_tags_tag_idx on public.content_tags(tag_id, content_id);

drop trigger if exists tags_updated on public.tags;
create trigger tags_updated before update on public.tags for each row execute function public.set_updated_at();

alter table public.tags enable row level security;
alter table public.content_tags enable row level security;
alter table public.content_categories enable row level security;

create policy tags_public_read on public.tags
  for select to anon, authenticated
  using (is_active = true);

create policy tags_staff_all on public.tags
  for all to authenticated
  using ((select private.is_content_staff()))
  with check ((select private.is_content_staff()));

create policy content_tags_public_read on public.content_tags
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.content c
      where c.id = content_id
        and c.status = 'published'::public.content_status
        and c.published_at is not null
        and c.published_at <= now()
    )
  );

create policy content_tags_staff_or_author_all on public.content_tags
  for all to authenticated
  using (
    (select private.is_content_staff())
    or exists (select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid()))
  )
  with check (
    (select private.is_content_staff())
    or exists (select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid()))
  );

create policy content_categories_public_read on public.content_categories
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.content c
      where c.id = content_id
        and c.status = 'published'::public.content_status
        and c.published_at is not null
        and c.published_at <= now()
    )
  );

create policy content_categories_staff_or_author_all on public.content_categories
  for all to authenticated
  using (
    (select private.is_content_staff())
    or exists (select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid()))
  )
  with check (
    (select private.is_content_staff())
    or exists (select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid()))
  );
