create or replace function private.capabilities_content_quality_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_words integer := 0;
  v_route_slug text;
  v_sentence_count integer := 0;
  v_repeated_sentence_count integer := 0;
begin
  if new.slug like 'capabilities-%' then
    v_route_slug := pg_catalog.regexp_replace(new.slug, '^capabilities-', '');
    new.canonical_url := case
      when new.slug = 'capabilities-hub' then '/capabilities/'
      else '/capabilities/' || v_route_slug || '/'
    end;

    if new.status = 'published'::public.content_status then
      v_words := coalesce(
        pg_catalog.array_length(
          pg_catalog.regexp_split_to_array(pg_catalog.btrim(coalesce(new.body_text,'')), '[[:space:]]+'),
          1
        ),
        0
      );
      if v_words < 1500 then
        raise exception 'capabilities page must contain at least 1500 useful words before publication';
      end if;

      if new.slug not in ('capabilities-hub','capabilities-methodology','capabilities-protocol','capabilities-registry') then
        if coalesce(new.body_text,'') like '%البروتوكول الكامل: تسع مراحل من الأمان إلى القرار المشترك%'
           or coalesce(new.body_text,'') like '%المخرج المطلوب: قائمة مخاطر وحدود مشاركة آمنة.%' then
          raise exception 'legacy repeated capabilities protocol must be removed before publication';
        end if;

        with new_sentences as (
          select distinct pg_catalog.btrim(s) as sentence
          from pg_catalog.regexp_split_to_table(coalesce(new.body_text,''), '[.!؟]+[[:space:]]*') as s
          where pg_catalog.char_length(pg_catalog.btrim(s)) >= 60
        ), repeated as (
          select ns.sentence
          from new_sentences ns
          where (
            select pg_catalog.count(distinct c.slug)
            from public.content c
            cross join lateral pg_catalog.regexp_split_to_table(coalesce(c.body_text,''), '[.!؟]+[[:space:]]*') as os
            where c.id <> new.id
              and c.slug like 'capabilities-%'
              and c.slug not in ('capabilities-hub','capabilities-methodology','capabilities-protocol','capabilities-registry')
              and pg_catalog.btrim(os) = ns.sentence
          ) >= 19
        )
        select
          (select pg_catalog.count(*) from new_sentences),
          (select pg_catalog.count(*) from repeated)
        into v_sentence_count, v_repeated_sentence_count;

        if v_sentence_count > 0
           and (100.0 * v_repeated_sentence_count / v_sentence_count) > 15.0 then
          raise exception 'capabilities page repeats too many long sentences used across the condition collection';
        end if;
      end if;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.capabilities_content_quality_guard() from public, anon, authenticated;
