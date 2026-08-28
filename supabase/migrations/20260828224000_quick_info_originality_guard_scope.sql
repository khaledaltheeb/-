-- Quick Info originality checks are intentionally expensive because they scan
-- published Quick Info paragraphs for exact long-form duplication. Image-only
-- metadata updates must not re-run that scan when the content contract itself
-- did not change.
create or replace function private.quick_info_originality_guard()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  v_paragraph text;
  v_owner text;
  v_words integer;
  v_ready boolean := false;
  v_old_ready boolean := false;
  v_should_check boolean := false;
begin
  if new.slug not like 'quick-info-%' then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.slug is not distinct from old.slug
     and new.status is not distinct from old.status
     and new.schema_json is not distinct from old.schema_json
     and new.body_text is not distinct from old.body_text then
    return new;
  end if;

  v_ready := coalesce((new.schema_json ->> 'publication_ready')::boolean, false);
  if tg_op = 'UPDATE' then
    v_old_ready := coalesce((old.schema_json ->> 'publication_ready')::boolean, false);
  end if;

  v_should_check := new.status in (
    'approved'::public.content_status,
    'scheduled'::public.content_status,
    'published'::public.content_status
  );

  if not v_should_check and v_ready then
    if tg_op = 'INSERT' then
      v_should_check := true;
    elsif tg_op = 'UPDATE' then
      v_should_check := (not v_old_ready) or new.body_text is distinct from old.body_text;
    end if;
  end if;

  if not v_should_check then
    return new;
  end if;

  if coalesce(new.body_text,'') like any (array[
    '%هذه النقطة مأخوذة من المحتوى الأصلي للصفحة%',
    '%عند تطبيق هذه النقطة على حياتك%',
    '%شرح موسع للإشارات الموجودة في المحتوى الأصلي%',
    '%تطبيق أعمق لما ورد في الصفحة الأصلية%',
    '%أما المحتوى الأصلي للصفحة فقد تم الحفاظ عليه ثم شرحه وتوسيعه%',
    '%الباحث غالبًا يريد أن يعرف كيف يميز بين التفسيرات المتشابهة%'
  ]) then
    raise exception 'Quick Info generic migration/filler language is forbidden';
  end if;

  for v_paragraph in
    select pg_catalog.btrim(p)
    from pg_catalog.regexp_split_to_table(coalesce(new.body_text,''), E'\\n[[:space:]]*\\n+') p
    where pg_catalog.char_length(pg_catalog.btrim(p)) >= 120
  loop
    select pg_catalog.count(*)::integer
      into v_words
    from pg_catalog.regexp_split_to_table(v_paragraph, '[[:space:]]+') token
    where token ~ '[ء-يA-Za-z0-9]';

    if v_words < 20 then
      continue;
    end if;

    select c.slug
      into v_owner
    from public.content c
    cross join lateral pg_catalog.regexp_split_to_table(coalesce(c.body_text,''), E'\\n[[:space:]]*\\n+') op
    where c.id <> new.id
      and c.slug like 'quick-info-%'
      and c.status in (
        'approved'::public.content_status,
        'scheduled'::public.content_status,
        'published'::public.content_status
      )
      and pg_catalog.btrim(op) = v_paragraph
    limit 1;

    if v_owner is not null then
      raise exception 'Quick Info exact long-paragraph duplication detected against %', v_owner;
    end if;
  end loop;

  return new;
end;
$function$;
