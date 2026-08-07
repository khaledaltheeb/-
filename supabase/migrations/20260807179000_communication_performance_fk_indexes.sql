create index if not exists appointments_cancelled_by_idx on public.appointments(cancelled_by) where cancelled_by is not null;
create index if not exists conversation_reports_conversation_idx on public.conversation_reports(conversation_id);
create index if not exists conversation_reports_message_idx on public.conversation_reports(message_id) where message_id is not null;
create index if not exists conversation_reports_reported_user_idx on public.conversation_reports(reported_user_id) where reported_user_id is not null;
create index if not exists conversation_reports_reviewed_by_idx on public.conversation_reports(reviewed_by) where reviewed_by is not null;
create index if not exists messages_reply_to_idx on public.messages(reply_to_id) where reply_to_id is not null;
create index if not exists redirects_created_by_idx on public.redirects(created_by) where created_by is not null;
create index if not exists redirects_updated_by_idx on public.redirects(updated_by) where updated_by is not null;
drop index if exists public.messages_conversation_recent_idx;
