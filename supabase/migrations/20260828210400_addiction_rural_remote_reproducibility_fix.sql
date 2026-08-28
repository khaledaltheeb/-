begin;

do $$
declare
  v_id uuid;
  v_body jsonb;
  v_clean_blocks jsonb;
  v_text text;
begin
  select id, body_json into v_id, v_body
  from public.content
  where slug='addiction-rural-remote-care'
  limit 1;

  if v_id is null then
    raise exception 'published rural addiction reference missing';
  end if;
  if jsonb_typeof(coalesce(v_body->'blocks','[]'::jsonb)) <> 'array' then
    raise exception 'rural addiction reference blocks are not an array';
  end if;

  select coalesce(jsonb_agg(block order by ord),'[]'::jsonb)
  into v_clean_blocks
  from jsonb_array_elements(v_body->'blocks') with ordinality b(block,ord)
  where block <> '{"paragraph":"paragraph"}'::jsonb;

  if v_clean_blocks is distinct from (v_body->'blocks') then
    v_body := jsonb_set(v_body,'{blocks}',v_clean_blocks,true);

    select string_agg(txt,E'\n\n' order by ord) into v_text
    from (
      select ord, case
        when block->>'type' in ('paragraph','heading') then block->>'text'
        when block->>'type'='list' then (select string_agg(value,E'\n') from jsonb_array_elements_text(block->'items'))
        when block->>'type'='faq' then (select string_agg((item->>'question')||' '||(item->>'answer'),E'\n') from jsonb_array_elements(block->'items') item)
        else null end txt
      from jsonb_array_elements(v_clean_blocks) with ordinality b(block,ord)
    ) s where txt is not null and btrim(txt)<>'';

    update public.content
    set body_json=v_body,
        body_text=v_text,
        updated_at=now()
    where id=v_id;
  end if;
end $$;

commit;
