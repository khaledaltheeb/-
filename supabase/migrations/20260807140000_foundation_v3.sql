create schema if not exists private;

create type public.app_role as enum ('owner','admin','editor','scientific_reviewer','seo_manager','specialist','center_manager','user');
create type public.content_status as enum ('draft','scientific_review','editorial_review','seo_review','accessibility_review','approved','scheduled','published','archived');
create type public.verification_status as enum ('unverified','pending','verified','rejected','suspended');
create type public.appointment_status as enum ('requested','confirmed','completed','cancelled','no_show');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  phone text,
  locale text not null default 'ar',
  role public.app_role not null default 'user',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  description text,
  accent text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid references public.sectors(id) on delete cascade,
  parent_id uuid references public.categories(id) on delete set null,
  slug text not null unique,
  name_ar text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('article','guide','condition','research','comparison','tool','news','sector_page','landing_page')),
  slug text not null unique,
  title text not null,
  excerpt text,
  body_json jsonb not null default '{}'::jsonb,
  body_text text,
  sector_id uuid references public.sectors(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  audience text[] not null default '{}'::text[],
  author_id uuid references public.profiles(id) on delete set null,
  scientific_reviewer_id uuid references public.profiles(id) on delete set null,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  canonical_url text,
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  schema_json jsonb not null default '{}'::jsonb,
  featured_image_url text,
  is_featured boolean not null default false,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(content_id, version)
);

create table public.specialists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null,
  slug text not null unique,
  full_name text not null,
  professional_title text,
  bio text,
  email text,
  phone text,
  website_url text,
  country text,
  region text,
  city text,
  latitude double precision,
  longitude double precision,
  languages text[] not null default '{}'::text[],
  specialties text[] not null default '{}'::text[],
  qualifications jsonb not null default '[]'::jsonb,
  license_number text,
  years_experience integer check (years_experience is null or years_experience >= 0),
  offers_remote boolean not null default false,
  offers_in_person boolean not null default true,
  show_email boolean not null default false,
  show_phone boolean not null default false,
  show_map boolean not null default false,
  verification public.verification_status not null default 'unverified',
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.centers (
  id uuid primary key default gen_random_uuid(),
  manager_user_id uuid references public.profiles(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text,
  logo_url text,
  cover_url text,
  email text,
  phone text,
  website_url text,
  country text,
  region text,
  city text,
  address text,
  latitude double precision,
  longitude double precision,
  working_hours jsonb not null default '{}'::jsonb,
  verification public.verification_status not null default 'unverified',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.center_specialists (
  center_id uuid not null references public.centers(id) on delete cascade,
  specialist_id uuid not null references public.specialists(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key(center_id, specialist_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  subject text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key(conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  specialist_id uuid references public.specialists(id) on delete set null,
  center_id uuid references public.centers(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.appointment_status not null default 'requested',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (specialist_id is not null or center_id is not null),
  check (ends_at is null or ends_at > starts_at)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_path text not null,
  status_code integer not null default 301 check (status_code in (301,302,307,308)),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id text,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index content_status_idx on public.content(status);
create index content_sector_idx on public.content(sector_id);
create index content_category_idx on public.content(category_id);
create index content_author_idx on public.content(author_id);
create index specialists_user_idx on public.specialists(user_id);
create index specialists_verification_idx on public.specialists(verification) where is_active;
create index centers_manager_idx on public.centers(manager_user_id);
create index centers_verification_idx on public.centers(verification) where is_active;
create index messages_conversation_created_idx on public.messages(conversation_id, created_at desc);
create index participants_user_idx on public.conversation_participants(user_id);
create index appointments_requester_idx on public.appointments(requester_id, starts_at desc);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

create or replace function private.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$ select role from public.profiles where id = (select auth.uid()) and is_active = true $$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select coalesce((select private.current_role()) in ('owner'::public.app_role,'admin'::public.app_role), false) $$;

create or replace function private.is_content_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select coalesce((select private.current_role()) in ('owner'::public.app_role,'admin'::public.app_role,'editor'::public.app_role,'scientific_reviewer'::public.app_role,'seo_manager'::public.app_role), false) $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$ begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger sectors_updated before update on public.sectors for each row execute function public.set_updated_at();
create trigger categories_updated before update on public.categories for each row execute function public.set_updated_at();
create trigger content_updated before update on public.content for each row execute function public.set_updated_at();
create trigger specialists_updated before update on public.specialists for each row execute function public.set_updated_at();
create trigger centers_updated before update on public.centers for each row execute function public.set_updated_at();
create trigger conversations_updated before update on public.conversations for each row execute function public.set_updated_at();
create trigger appointments_updated before update on public.appointments for each row execute function public.set_updated_at();
create trigger redirects_updated before update on public.redirects for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$ begin
  insert into public.profiles(id, display_name, avatar_url)
  values(new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.sectors enable row level security;
alter table public.categories enable row level security;
alter table public.content enable row level security;
alter table public.content_versions enable row level security;
alter table public.specialists enable row level security;
alter table public.centers enable row level security;
alter table public.center_specialists enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.appointments enable row level security;
alter table public.notifications enable row level security;
alter table public.redirects enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_self_select on public.profiles for select to authenticated using ((select auth.uid()) = id or (select private.is_admin()));
create policy profiles_self_update on public.profiles for update to authenticated using ((select auth.uid()) = id or (select private.is_admin())) with check ((select auth.uid()) = id or (select private.is_admin()));
create policy profiles_admin_all on public.profiles for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy sectors_public_read on public.sectors for select to anon, authenticated using (is_active = true);
create policy sectors_admin_all on public.sectors for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy categories_public_read on public.categories for select to anon, authenticated using (is_active = true);
create policy categories_admin_all on public.categories for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy content_public_read on public.content for select to anon, authenticated using (status = 'published'::public.content_status and published_at is not null and published_at <= now());
create policy content_owned_or_staff_read on public.content for select to authenticated using (author_id = (select auth.uid()) or (select private.is_content_staff()));
create policy content_create on public.content for insert to authenticated with check (author_id = (select auth.uid()) and (select private.current_role()) in ('owner'::public.app_role,'admin'::public.app_role,'editor'::public.app_role,'specialist'::public.app_role));
create policy content_update on public.content for update to authenticated using (author_id = (select auth.uid()) or (select private.is_content_staff())) with check (author_id = (select auth.uid()) or (select private.is_content_staff()));
create policy content_delete on public.content for delete to authenticated using ((select private.is_admin()) or (author_id = (select auth.uid()) and status = 'draft'::public.content_status));

create policy versions_staff_or_author_read on public.content_versions for select to authenticated using ((select private.is_content_staff()) or exists(select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid())));
create policy versions_staff_or_author_insert on public.content_versions for insert to authenticated with check ((select private.is_content_staff()) or exists(select 1 from public.content c where c.id = content_id and c.author_id = (select auth.uid())));

create policy specialists_public_read on public.specialists for select to anon, authenticated using (verification = 'verified'::public.verification_status and is_active = true);
create policy specialists_owner_read on public.specialists for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy specialists_owner_insert on public.specialists for insert to authenticated with check (user_id = (select auth.uid()) or (select private.is_admin()));
create policy specialists_owner_update on public.specialists for update to authenticated using (user_id = (select auth.uid()) or (select private.is_admin())) with check (user_id = (select auth.uid()) or (select private.is_admin()));
create policy specialists_admin_delete on public.specialists for delete to authenticated using ((select private.is_admin()));

create policy centers_public_read on public.centers for select to anon, authenticated using (verification = 'verified'::public.verification_status and is_active = true);
create policy centers_manager_read on public.centers for select to authenticated using (manager_user_id = (select auth.uid()) or (select private.is_admin()));
create policy centers_manager_insert on public.centers for insert to authenticated with check (manager_user_id = (select auth.uid()) or (select private.is_admin()));
create policy centers_manager_update on public.centers for update to authenticated using (manager_user_id = (select auth.uid()) or (select private.is_admin())) with check (manager_user_id = (select auth.uid()) or (select private.is_admin()));
create policy centers_admin_delete on public.centers for delete to authenticated using ((select private.is_admin()));

create policy center_specialists_public_read on public.center_specialists for select to anon, authenticated using (true);
create policy center_specialists_admin_all on public.center_specialists for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy conversations_member_read on public.conversations for select to authenticated using (created_by = (select auth.uid()) or exists(select 1 from public.conversation_participants p where p.conversation_id = id and p.user_id = (select auth.uid())) or (select private.is_admin()));
create policy conversations_create on public.conversations for insert to authenticated with check (created_by = (select auth.uid()));
create policy conversations_owner_update on public.conversations for update to authenticated using (created_by = (select auth.uid()) or (select private.is_admin())) with check (created_by = (select auth.uid()) or (select private.is_admin()));

create policy participants_member_read on public.conversation_participants for select to authenticated using (user_id = (select auth.uid()) or exists(select 1 from public.conversation_participants self where self.conversation_id = conversation_id and self.user_id = (select auth.uid())) or (select private.is_admin()));
create policy participants_self_insert on public.conversation_participants for insert to authenticated with check (user_id = (select auth.uid()) or (select private.is_admin()));
create policy participants_self_delete on public.conversation_participants for delete to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy messages_member_read on public.messages for select to authenticated using (exists(select 1 from public.conversation_participants p where p.conversation_id = messages.conversation_id and p.user_id = (select auth.uid())) or (select private.is_admin()));
create policy messages_member_insert on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists(select 1 from public.conversation_participants p where p.conversation_id = messages.conversation_id and p.user_id = (select auth.uid())));
create policy messages_sender_update on public.messages for update to authenticated using (sender_id = (select auth.uid())) with check (sender_id = (select auth.uid()));

create policy appointments_parties_read on public.appointments for select to authenticated using (requester_id = (select auth.uid()) or exists(select 1 from public.specialists s where s.id = specialist_id and s.user_id = (select auth.uid())) or exists(select 1 from public.centers c where c.id = center_id and c.manager_user_id = (select auth.uid())) or (select private.is_admin()));
create policy appointments_user_create on public.appointments for insert to authenticated with check (requester_id = (select auth.uid()));
create policy appointments_parties_update on public.appointments for update to authenticated using (requester_id = (select auth.uid()) or exists(select 1 from public.specialists s where s.id = specialist_id and s.user_id = (select auth.uid())) or exists(select 1 from public.centers c where c.id = center_id and c.manager_user_id = (select auth.uid())) or (select private.is_admin()));

create policy notifications_self_read on public.notifications for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy notifications_self_update on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy redirects_public_read on public.redirects for select to anon, authenticated using (is_active = true);
create policy redirects_admin_all on public.redirects for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy audit_admin_read on public.audit_logs for select to authenticated using ((select private.is_admin()));

revoke all on schema private from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
