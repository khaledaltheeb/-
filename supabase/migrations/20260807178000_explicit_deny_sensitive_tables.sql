create policy conversations_deny_direct on public.conversations for all to anon,authenticated using (false) with check (false);
create policy conversation_participants_deny_direct on public.conversation_participants for all to anon,authenticated using (false) with check (false);
create policy messages_deny_direct on public.messages for all to anon,authenticated using (false) with check (false);
create policy notifications_deny_direct on public.notifications for all to anon,authenticated using (false) with check (false);
create policy user_blocks_deny_direct on public.user_blocks for all to anon,authenticated using (false) with check (false);
create policy conversation_reports_deny_direct on public.conversation_reports for all to anon,authenticated using (false) with check (false);
create policy appointments_deny_direct on public.appointments for all to anon,authenticated using (false) with check (false);
