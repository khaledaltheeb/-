begin;

-- Public API change events must reflect changes visible to API consumers, not
-- internal editorial/automation metadata churn. Lifecycle transitions remain
-- authoritative; public-to-public updates are emitted only when a public field
-- changes.
create or replace function private.log_public_api_content_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_public boolean := false;
  new_public boolean := false;
  public_payload_changed boolean := false;
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

  if tg_op = 'UPDATE' and old_public and new_public then
    public_payload_changed :=
      old.content_type is distinct from new.content_type
      or old.slug is distinct from new.slug
      or old.title is distinct from new.title
      or old.excerpt is distinct from new.excerpt
      or old.body_json is distinct from new.body_json
      or old.body_text is distinct from new.body_text
      or old.audience is distinct from new.audience
      or old.seo_title is distinct from new.seo_title
      or old.seo_description is distinct from new.seo_description
      or old.canonical_url is distinct from new.canonical_url
      or (old.schema_json -> 'structured_data') is distinct from (new.schema_json -> 'structured_data')
      or (old.schema_json -> 'public_api_rights') is distinct from (new.schema_json -> 'public_api_rights')
      or old.featured_image_url is distinct from new.featured_image_url
      or old.featured_image_alt is distinct from new.featured_image_alt
      or old.primary_keyword is distinct from new.primary_keyword
      or old.secondary_keywords is distinct from new.secondary_keywords
      or old.semantic_terms is distinct from new.semantic_terms
      or old.search_intent is distinct from new.search_intent
      or old.author_display_name is distinct from new.author_display_name
      or old.reviewer_display_name is distinct from new.reviewer_display_name
      or old.reviewer_credentials is distinct from new.reviewer_credentials
      or old.last_reviewed_at is distinct from new.last_reviewed_at
      or old.references_json is distinct from new.references_json
      or old.medical_disclaimer is distinct from new.medical_disclaimer
      or old.sector_id is distinct from new.sector_id
      or old.category_id is distinct from new.category_id
      or old.published_at is distinct from new.published_at;
  end if;

  if tg_op = 'INSERT' and new_public then
    event_name := 'published';
  elsif tg_op = 'UPDATE' and not old_public and new_public then
    event_name := 'published';
  elsif tg_op = 'UPDATE' and old_public and new_public and public_payload_changed then
    event_name := 'updated';
  elsif tg_op = 'UPDATE' and old_public and not new_public then
    event_name := 'archived';
  elsif tg_op = 'DELETE' and old_public then
    event_name := 'archived';
  else
    if tg_op = 'DELETE' then return old; end if;
    return new;
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

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function private.log_public_api_content_change() from public;

comment on function private.log_public_api_content_change() is
  'Rawafid Public API v1.2 lifecycle logger. Emits public events only for publication-state transitions or API-visible field changes.';

commit;
