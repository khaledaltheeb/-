create or replace function private.community_account_confirmed()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.profiles p on p.id = u.id
    where u.id = (select auth.uid())
      and u.email_confirmed_at is not null
      and p.is_active = true
  );
$$;

create or replace function private.community_is_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.is_active = true
      and p.role = any (
        array[
          'owner'::public.app_role,
          'admin'::public.app_role,
          'editor'::public.app_role,
          'scientific_reviewer'::public.app_role
        ]
      )
  );
$$;

revoke all on function private.community_account_confirmed() from public;
revoke all on function private.community_is_moderator() from public;
grant execute on function private.community_account_confirmed() to authenticated;
grant execute on function private.community_is_moderator() to authenticated;

create or replace function public.community_enforce_post_publication_boundary()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  room_mode text;
  moderator boolean := private.community_is_moderator();
begin
  if not private.community_account_confirmed() then
    raise exception 'confirmed active account required';
  end if;

  select r.moderation_mode
  into room_mode
  from public.community_rooms r
  where r.id = new.room_id
    and r.status = 'active';

  if room_mode is null then
    raise exception 'active community room required';
  end if;

  if not moderator and room_mode = 'pre_publish' and new.status = 'published' then
    new.status := 'pending';
    new.moderation_state := 'needs_review';
    new.published_at := null;
    new.seo_indexable := false;
  end if;

  if new.status <> 'published' then
    new.published_at := null;
  end if;

  if new.status = 'pending' then
    new.moderation_state := 'needs_review';
    new.seo_indexable := false;
  end if;

  return new;
end;
$$;

revoke all on function public.community_enforce_post_publication_boundary() from public;

drop trigger if exists community_00_publication_boundary on public.community_posts;
create trigger community_00_publication_boundary
before insert or update of room_id, status, moderation_state
on public.community_posts
for each row
execute function public.community_enforce_post_publication_boundary();

drop policy if exists community_posts_create on public.community_posts;
create policy community_posts_create
on public.community_posts
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and status = any (array['draft'::text,'pending'::text,'published'::text])
  and moderation_state = any (array['clean'::text,'needs_review'::text])
  and private.community_account_confirmed()
  and exists (
    select 1
    from public.community_rooms r
    where r.id = community_posts.room_id
      and r.status = 'active'
      and (
        community_posts.status <> 'published'
        or r.moderation_mode = 'post_publish'
        or private.community_is_moderator()
      )
  )
);

drop policy if exists community_posts_owner_update on public.community_posts;
create policy community_posts_owner_update
on public.community_posts
for update
to authenticated
using (
  author_id = (select auth.uid())
  and status <> 'removed'
)
with check (
  author_id = (select auth.uid())
  and status = any (array['draft'::text,'pending'::text,'published'::text,'archived'::text])
  and moderation_state = any (array['clean'::text,'needs_review'::text])
  and private.community_account_confirmed()
  and exists (
    select 1
    from public.community_rooms r
    where r.id = community_posts.room_id
      and r.status = 'active'
      and (
        community_posts.status <> 'published'
        or r.moderation_mode = 'post_publish'
        or private.community_is_moderator()
      )
  )
);

alter table public.community_comments
  drop constraint if exists community_comments_status_check;
alter table public.community_comments
  add constraint community_comments_status_check
  check (status = any (array['pending'::text,'published'::text,'hidden'::text,'removed'::text]));

create or replace function public.community_enforce_comment_publication_boundary()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  room_mode text;
  moderator boolean := private.community_is_moderator();
begin
  if not private.community_account_confirmed() then
    raise exception 'confirmed active account required';
  end if;

  select r.moderation_mode
  into room_mode
  from public.community_posts p
  join public.community_rooms r on r.id = p.room_id
  where p.id = new.post_id
    and p.status = 'published'
    and r.status = 'active';

  if room_mode is null then
    raise exception 'published community post in an active room required';
  end if;

  if not moderator and room_mode = 'pre_publish' and new.status = 'published' then
    new.status := 'pending';
  end if;

  return new;
end;
$$;

revoke all on function public.community_enforce_comment_publication_boundary() from public;

drop trigger if exists community_00_comment_publication_boundary on public.community_comments;
create trigger community_00_comment_publication_boundary
before insert or update of post_id, status
on public.community_comments
for each row
execute function public.community_enforce_comment_publication_boundary();

drop policy if exists community_comments_create on public.community_comments;
create policy community_comments_create
on public.community_comments
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and status = any (array['pending'::text,'published'::text])
  and private.community_account_confirmed()
  and exists (
    select 1
    from public.community_posts p
    join public.community_rooms r on r.id = p.room_id
    where p.id = community_comments.post_id
      and p.status = 'published'
      and r.status = 'active'
      and (
        community_comments.status <> 'published'
        or r.moderation_mode = 'post_publish'
        or private.community_is_moderator()
      )
  )
);

drop policy if exists community_comments_owner_update on public.community_comments;
create policy community_comments_owner_update
on public.community_comments
for update
to authenticated
using (
  author_id = (select auth.uid())
  and status <> 'removed'
)
with check (
  author_id = (select auth.uid())
  and status = any (array['pending'::text,'published'::text,'hidden'::text])
  and private.community_account_confirmed()
);

drop policy if exists community_comments_owner_read on public.community_comments;
create policy community_comments_owner_read
on public.community_comments
for select
to authenticated
using (author_id = (select auth.uid()));
