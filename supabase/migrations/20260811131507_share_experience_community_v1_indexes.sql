-- Covering indexes for community foreign keys and moderation operations.
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
