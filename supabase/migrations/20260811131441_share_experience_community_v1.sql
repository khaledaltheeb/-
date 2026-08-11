-- Native Rawafid "Share Your Experience" community foundation.
-- This migration records the production schema in source control so fresh environments are reproducible.

create extension if not exists pgcrypto;

create table if not exists public.community_rooms (
  id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 80), description text not null check (char_length(description) between 20 and 600),
  category text not null check (char_length(category) between 2 and 60), icon text, created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'active' check (status in ('pending','active','archived','suspended')),
  moderation_mode text not null default 'post_publish' check (moderation_mode in ('pre_publish','post_publish')),
  is_official boolean not null default false, member_count integer not null default 0 check(member_count>=0), post_count integer not null default 0 check(post_count>=0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.community_room_members (
  room_id uuid not null references public.community_rooms(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
  membership_role text not null default 'member' check(membership_role in ('member','moderator','owner')), notifications_enabled boolean not null default true,
  joined_at timestamptz not null default now(), primary key(room_id,user_id)
);
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(), room_id uuid not null references public.community_rooms(id) on delete restrict, author_id uuid not null references public.profiles(id) on delete restrict,
  slug text not null unique check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), post_type text not null default 'experience' check(post_type in ('experience','question','tip','warning','resource')),
  title text not null check(char_length(title) between 20 and 120), summary text not null check(char_length(summary) between 60 and 280), body text not null check(char_length(body) between 200 and 20000),
  topics text[] not null default '{}', keywords text[] not null default '{}', audience text[] not null default '{}',
  status text not null default 'published' check(status in ('draft','pending','published','rejected','archived','removed')),
  moderation_state text not null default 'clean' check(moderation_state in ('clean','needs_review','restricted','removed')), seo_indexable boolean not null default true,
  seo_title text check(seo_title is null or char_length(seo_title)<=65), seo_description text check(seo_description is null or char_length(seo_description)<=170),
  comments_count integer not null default 0 check(comments_count>=0), useful_count integer not null default 0 check(useful_count>=0), views_count integer not null default 0 check(views_count>=0),
  published_at timestamptz, edited_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), search_vector tsvector not null default ''::tsvector,
  check(cardinality(topics)<=5), check(cardinality(keywords)<=8), check(cardinality(audience)<=5)
);
create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.community_posts(id) on delete cascade, author_id uuid not null references public.profiles(id) on delete restrict,
  parent_id uuid references public.community_comments(id) on delete cascade, body text not null check(char_length(body) between 2 and 4000), status text not null default 'published' check(status in ('published','hidden','removed')),
  useful_count integer not null default 0 check(useful_count>=0), edited_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.community_post_reactions (post_id uuid not null references public.community_posts(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,reaction text not null default 'useful' check(reaction in ('useful','support','insightful')),created_at timestamptz not null default now(),primary key(post_id,user_id,reaction));
create table if not exists public.community_comment_reactions (comment_id uuid not null references public.community_comments(id) on delete cascade,user_id uuid not null references public.profiles(id) on delete cascade,reaction text not null default 'useful' check(reaction in ('useful','support','insightful')),created_at timestamptz not null default now(),primary key(comment_id,user_id,reaction));
create table if not exists public.community_bookmarks (user_id uuid not null references public.profiles(id) on delete cascade,post_id uuid not null references public.community_posts(id) on delete cascade,created_at timestamptz not null default now(),primary key(user_id,post_id));
create table if not exists public.community_reports (
 id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id) on delete restrict, post_id uuid references public.community_posts(id) on delete cascade, comment_id uuid references public.community_comments(id) on delete cascade,
 reason text not null check(reason in ('privacy','medical_claim','abuse','spam','misinformation','copyright','other')), details text check(details is null or char_length(details)<=1500), status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
 reviewed_by uuid references public.profiles(id) on delete set null, reviewed_at timestamptz, created_at timestamptz not null default now(), check((post_id is not null)::int+(comment_id is not null)::int=1)
);
create table if not exists public.community_moderation_events (id uuid primary key default gen_random_uuid(),actor_id uuid references public.profiles(id) on delete set null,post_id uuid references public.community_posts(id) on delete cascade,comment_id uuid references public.community_comments(id) on delete cascade,action text not null check(action in ('approve','restrict','hide','remove','restore','lock','unlock','seo_noindex','seo_index')),reason text,created_at timestamptz not null default now(),check(post_id is not null or comment_id is not null));

create index if not exists community_rooms_category_status_idx on public.community_rooms(category,status);
create index if not exists community_posts_room_published_idx on public.community_posts(room_id,published_at desc) where status='published';
create index if not exists community_posts_author_idx on public.community_posts(author_id,created_at desc);
create index if not exists community_posts_search_idx on public.community_posts using gin(search_vector);
create index if not exists community_posts_topics_idx on public.community_posts using gin(topics);
create index if not exists community_posts_keywords_idx on public.community_posts using gin(keywords);
create index if not exists community_comments_post_idx on public.community_comments(post_id,created_at);
create index if not exists community_reports_status_idx on public.community_reports(status,created_at);
create index if not exists community_bookmarks_post_idx on public.community_bookmarks(post_id);
create index if not exists community_comment_reactions_user_idx on public.community_comment_reactions(user_id);
create index if not exists community_comments_author_idx on public.community_comments(author_id);
create index if not exists community_comments_parent_idx on public.community_comments(parent_id) where parent_id is not null;
create index if not exists community_moderation_actor_idx on public.community_moderation_events(actor_id);
create index if not exists community_moderation_post_idx on public.community_moderation_events(post_id) where post_id is not null;
create index if not exists community_moderation_comment_idx on public.community_moderation_events(comment_id) where comment_id is not null;
create index if not exists community_post_reactions_user_idx on public.community_post_reactions(user_id);
create index if not exists community_reports_reporter_idx on public.community_reports(reporter_id);
create index if not exists community_reports_post_idx on public.community_reports(post_id) where post_id is not null;
create index if not exists community_reports_comment_idx on public.community_reports(comment_id) where comment_id is not null;
create index if not exists community_reports_reviewer_idx on public.community_reports(reviewed_by) where reviewed_by is not null;
create index if not exists community_room_members_user_idx on public.community_room_members(user_id);
create index if not exists community_rooms_creator_idx on public.community_rooms(created_by) where created_by is not null;

alter table public.community_rooms enable row level security; alter table public.community_room_members enable row level security; alter table public.community_posts enable row level security; alter table public.community_comments enable row level security; alter table public.community_post_reactions enable row level security; alter table public.community_comment_reactions enable row level security; alter table public.community_bookmarks enable row level security; alter table public.community_reports enable row level security; alter table public.community_moderation_events enable row level security;

create policy community_rooms_public_read on public.community_rooms for select to anon,authenticated using(status='active');
create policy community_rooms_member_create on public.community_rooms for insert to authenticated with check(auth.uid()=created_by and status='pending' and is_official=false);
create policy community_rooms_admin_manage on public.community_rooms for all to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','admin','editor'))) with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','admin','editor')));
create policy community_members_read on public.community_room_members for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.community_rooms r where r.id=room_id and r.status='active'));
create policy community_members_join on public.community_room_members for insert to authenticated with check(user_id=auth.uid() and membership_role='member' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active));
create policy community_members_leave on public.community_room_members for delete to authenticated using(user_id=auth.uid());
create policy community_posts_public_read on public.community_posts for select to anon,authenticated using(status='published' and moderation_state in ('clean','needs_review'));
create policy community_posts_owner_read on public.community_posts for select to authenticated using(author_id=auth.uid());
create policy community_posts_create on public.community_posts for insert to authenticated with check(author_id=auth.uid() and status in ('draft','published') and moderation_state='clean' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active) and exists(select 1 from public.community_rooms r where r.id=room_id and r.status='active'));
create policy community_posts_owner_update on public.community_posts for update to authenticated using(author_id=auth.uid() and status<>'removed') with check(author_id=auth.uid() and moderation_state in ('clean','needs_review'));
create policy community_posts_admin_manage on public.community_posts for all to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','admin','editor','scientific_reviewer'))) with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','admin','editor','scientific_reviewer')));
create policy community_comments_public_read on public.community_comments for select to anon,authenticated using(status='published' and exists(select 1 from public.community_posts p where p.id=post_id and p.status='published'));
create policy community_comments_create on public.community_comments for insert to authenticated with check(author_id=auth.uid() and status='published' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active));
create policy community_comments_owner_update on public.community_comments for update to authenticated using(author_id=auth.uid() and status='published') with check(author_id=auth.uid() and status in ('published','hidden'));
create policy community_comments_admin_manage on public.community_comments for all to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','admin','editor','scientific_reviewer'))) with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','admin','editor','scientific_reviewer')));
create policy community_post_reactions_read on public.community_post_reactions for select to anon,authenticated using(true); create policy community_post_reactions_write on public.community_post_reactions for insert to authenticated with check(user_id=auth.uid()); create policy community_post_reactions_delete on public.community_post_reactions for delete to authenticated using(user_id=auth.uid());
create policy community_comment_reactions_read on public.community_comment_reactions for select to anon,authenticated using(true); create policy community_comment_reactions_write on public.community_comment_reactions for insert to authenticated with check(user_id=auth.uid()); create policy community_comment_reactions_delete on public.community_comment_reactions for delete to authenticated using(user_id=auth.uid());
create policy community_bookmarks_owner on public.community_bookmarks for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy community_reports_create on public.community_reports for insert to authenticated with check(reporter_id=auth.uid() and status='open'); create policy community_reports_owner_read on public.community_reports for select to authenticated using(reporter_id=auth.uid());
create policy community_reports_admin_manage on public.community_reports for all to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','admin','editor','scientific_reviewer'))) with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','admin','editor','scientific_reviewer')));
create policy community_moderation_admin on public.community_moderation_events for all to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','admin','editor','scientific_reviewer'))) with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('owner','admin','editor','scientific_reviewer')));

create or replace function public.community_touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create trigger community_rooms_touch before update on public.community_rooms for each row execute function public.community_touch_updated_at(); create trigger community_posts_touch before update on public.community_posts for each row execute function public.community_touch_updated_at(); create trigger community_comments_touch before update on public.community_comments for each row execute function public.community_touch_updated_at();
create or replace function public.community_post_defaults() returns trigger language plpgsql set search_path='' as $$ begin if new.status='published' and new.published_at is null then new.published_at=now(); end if; if new.seo_title is null then new.seo_title=left(new.title||' | شاركنا تجربتك - منصة روافد',65); end if; if new.seo_description is null then new.seo_description=left(new.summary,170); end if; if char_length(new.body)<350 or cardinality(new.topics)=0 then new.seo_indexable=false; end if; new.search_vector=setweight(to_tsvector('simple',coalesce(new.title,'')),'A')||setweight(to_tsvector('simple',coalesce(new.summary,'')),'B')||setweight(to_tsvector('simple',coalesce(new.body,'')),'C')||setweight(to_tsvector('simple',array_to_string(new.topics,' ')),'B')||setweight(to_tsvector('simple',array_to_string(new.keywords,' ')),'B'); return new; end $$;
create trigger community_posts_defaults before insert or update of title,summary,body,topics,keywords,status on public.community_posts for each row execute function public.community_post_defaults();

insert into public.community_rooms(slug,title,description,category,is_official,status,moderation_mode) values
('inclusive-education','التربية الدامجة','تجارب عملية حول الدمج المدرسي، التهيئة، التكيفات، التعاون مع المدرسة، وما تعلّمه الأهل ومقدمو الخدمة.','التربية الدامجة',true,'active','post_publish'),
('autism-experiences','طيف التوحد','خبرات أسرية ومهنية حول التواصل، الروتين، البيئة، الدعم اليومي والخدمات، مع احترام اختلاف كل شخص وتجربته.','طيف التوحد',true,'active','post_publish'),
('learning-difficulties','صعوبات التعلم','مساحة لتبادل التجارب المتعلقة بالتعلم، التقييم التربوي، التكيفات الصفية، المتابعة المنزلية والتواصل مع المدرسة.','التعلم',true,'active','post_publish'),
('speech-communication','النطق والتواصل','تجارب ونصائح عملية حول تنمية التواصل، التعاون مع المختصين، التقنيات المساندة والمواقف اليومية.','التواصل',true,'active','post_publish'),
('behavior-daily-life','السلوك والحياة اليومية','خبرات في فهم السلوك، تنظيم البيئة، بناء الروتين والمهارات اليومية بطرق داعمة وغير وصمية.','الحياة اليومية',true,'active','post_publish'),
('services-centers','الخدمات والمراكز','تجارب الاستفادة من الخدمات والمراكز وكيفية الاستعداد للزيارة وطرح الأسئلة وتقييم ملاءمة الخدمة دون تشهير أو كشف بيانات شخصية.','الخدمات',true,'active','pre_publish'),
('assistive-technology','التقنيات المساندة','تجارب استخدام الأدوات والتطبيقات والتقنيات المساندة في التعلم والتواصل والاستقلالية.','التقنية المساندة',true,'active','post_publish'),
('family-experiences','تجارب الأهل','مساحة عامة للأهل ومقدمي الرعاية لمشاركة ما تعلموه من مواقف وتجارب يومية يمكن أن تفيد أسراً أخرى.','الأهل',true,'active','post_publish')
on conflict(slug) do nothing;

grant select on public.community_rooms,public.community_posts,public.community_comments,public.community_post_reactions,public.community_comment_reactions to anon,authenticated;
grant select,insert,update,delete on public.community_rooms,public.community_room_members,public.community_posts,public.community_comments,public.community_post_reactions,public.community_comment_reactions,public.community_bookmarks,public.community_reports,public.community_moderation_events to authenticated;
