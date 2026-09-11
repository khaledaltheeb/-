do $migration$
declare
  v_def text;
  v_old text := $old$  if coalesce(new.body_text, '') ~ '(تنبيه|تحذير|إخلاء[[:space:]]+المسؤولية)' then
    raise exception 'inline warning and disclaimer language is forbidden; use the central disclaimer page';
  end if;$old$;
  v_new text := $new$  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(v_blocks) as block
    where block ->> 'type' = 'heading'
      and coalesce(block ->> 'text', '') ~ '^(تنبيه|تحذير|إخلاء[[:space:]]+المسؤولية)([[:space:]:：-]|$)'
  ) then
    raise exception 'warning/disclaimer headings are forbidden; use the central disclaimer page';
  end if;$new$;
begin
  select pg_get_functiondef('private.content_release_gate_v6()'::regprocedure) into v_def;
  if position(v_old in v_def)=0 then
    raise exception 'expected V6 warning-language guard not found';
  end if;
  execute replace(v_def,v_old,v_new);
end
$migration$;
