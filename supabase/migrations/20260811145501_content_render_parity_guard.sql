create or replace function private.content_render_parity_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  source_words integer := 0;
  rendered_words integer := 0;
  block_count integer := 0;
begin
  if new.status::text <> 'published' or not coalesce(new.robots_index, false) then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.status is not distinct from old.status
     and new.robots_index is not distinct from old.robots_index
     and new.body_text is not distinct from old.body_text
     and new.body_json is not distinct from old.body_json then
    return new;
  end if;

  if jsonb_typeof(new.body_json) = 'object'
     and jsonb_typeof(new.body_json -> 'blocks') = 'array' then
    block_count := jsonb_array_length(new.body_json -> 'blocks');
  end if;

  if block_count = 0 then
    return new;
  end if;

  select count(*)::integer
    into source_words
    from regexp_split_to_table(trim(coalesce(new.body_text, '')), E'\\s+') token
   where token <> '';

  select count(*)::integer
    into rendered_words
    from regexp_split_to_table(trim(coalesce(new.body_json::text, '')), E'\\s+') token
   where token <> '';

  if source_words >= 2500
     and rendered_words < ceil(source_words * 0.70)::integer then
    raise exception
      'structured content render parity failed: body_json words % are below 70 percent of body_text words %',
      rendered_words,
      source_words
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.content_render_parity_guard() from public;

drop trigger if exists zz_content_render_parity_guard on public.content;
create trigger zz_content_render_parity_guard
before insert or update of status, robots_index, body_text, body_json
on public.content
for each row
execute function private.content_render_parity_guard();
