create or replace function private.enforce_rawafid_institutional_authorship()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if new.status = 'published' and nullif(trim(coalesce(new.author_display_name, '')), '') is not null then
    new.schema_json := jsonb_set(
      coalesce(new.schema_json, '{}'::jsonb),
      '{legacy_author_display_name}',
      to_jsonb(new.author_display_name),
      true
    );
    new.author_display_name := null;
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_rawafid_institutional_authorship() from public;

drop trigger if exists content_institutional_authorship_guard on public.content;
create trigger content_institutional_authorship_guard
before insert or update of status,author_display_name
on public.content
for each row
execute function private.enforce_rawafid_institutional_authorship();
