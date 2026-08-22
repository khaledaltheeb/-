-- Consolidate the duplicate pediatric-cancer sector into pediatric-oncology.
-- This migration is intentionally defensive: it refuses to delete the legacy
-- sector if unexpected content/category relations appear in another environment.

do $$
declare
  v_canonical_id uuid;
  v_legacy_id uuid;
  v_link_count bigint;
begin
  select id into v_canonical_id from public.sectors where slug = 'pediatric-oncology';
  if v_canonical_id is null then
    raise exception 'Canonical pediatric-oncology sector is missing';
  end if;

  select id into v_legacy_id from public.sectors where slug = 'pediatric-cancer';

  if v_legacy_id is not null then
    select
      (select count(*) from public.content where sector_id = v_legacy_id)
      +
      (select count(*)
         from public.content c
         join public.categories cat on cat.id = c.category_id
        where cat.sector_id = v_legacy_id)
      +
      (select count(*)
         from public.content_categories cc
         join public.categories cat on cat.id = cc.category_id
        where cat.sector_id = v_legacy_id)
    into v_link_count;

    if v_link_count > 0 then
      raise exception 'Refusing pediatric-cancer sector deletion: % unexpected content/category links exist', v_link_count;
    end if;
  end if;

  update public.sectors
     set description = 'مركز معرفي عربي متكامل لسرطان الأطفال يجمع الأنواع والتشخيص والعلاج والرعاية السريرية، أحدث الأبحاث والدراسات والرسائل الجامعية، الدعم النفسي والأسري، التواصل الملائم للعمر، المدرسة والحياة اليومية، الرعاية الداعمة وجودة الحياة، والنجاة والآثار المتأخرة ضمن مسارات واضحة ومترابطة.',
         seo_title = 'سرطان الأطفال: مركز المعرفة والعلاج والدعم العلمي | روافد',
         seo_description = 'مركز عربي متكامل ومحدث لسرطان الأطفال: الأنواع والتشخيص والعلاج، الأبحاث والدراسات، الدعم النفسي والأسري، التواصل والمدرسة، الرعاية الداعمة وجودة الحياة والنجاة.',
         metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
           'scope', 'pediatric-oncology',
           'editorial_model', 'multidisciplinary',
           'merged_sector_aliases', jsonb_build_array('pediatric-cancer'),
           'merged_from_sector', 'pediatric-cancer',
           'canonical_sector_slug', 'pediatric-oncology'
         ),
         updated_at = now()
   where id = v_canonical_id;

  update public.categories
     set description = 'شرح التشخيص والفحوص والإجراءات للطفل حسب عمره، والتواصل الصادق والملائم للنمو حول العلاج والأسئلة الصعبة، والتحضير للخوف والألم والمستشفى، وإشراك الطفل أو المراهق في القرار بقدر مناسب.'
   where sector_id = v_canonical_id
     and slug = 'procedures-communication-childhood-cancer';

  update public.categories
     set description = 'دعم عملي قائم على الدليل للطفل والمراهق والوالدين والإخوة ومقدمي الرعاية عبر التشخيص والعلاج والنجاة، مع دعم التواصل داخل الأسرة، الحفاظ على الروتين، تقليل العزلة والعبء النفسي، وربط الاحتياجات بالخدمات المناسبة.'
   where sector_id = v_canonical_id
     and slug = 'pediatric-cancer-psychosocial-family';

  update public.categories
     set description = 'الخوف والقلق والحزن والغضب والهوية وصورة الجسد والنوم والتكيف النفسي وجودة الحياة حسب العمر والمرحلة، مع توضيح متى يحتاج الطفل أو المراهق إلى تقييم نفسي متخصص.'
   where sector_id = v_canonical_id
     and slug = 'child-emotional-support-cancer';

  update public.categories
     set description = 'المدرسة، استمرار التعليم والعودة للتعلم، التواصل والعلاقات واللعب والأنشطة، الخصوصية والتكييفات، السفر، الدعم الاجتماعي والمالي، والعودة التدريجية إلى الحياة اليومية أثناء العلاج وبعده.'
   where sector_id = v_canonical_id
     and slug = 'pediatric-cancer-daily-life-school';

  insert into public.redirects (source_path, destination_path, status_code, is_active, note)
  values
    ('/sectors/pediatric-cancer', '/sectors/pediatric-oncology', 301, true, 'Merged duplicate pediatric-cancer sector into canonical pediatric-oncology sector; preserve legacy route and SEO equity.'),
    ('/sectors/pediatric-cancer/', '/sectors/pediatric-oncology', 301, true, 'Merged duplicate pediatric-cancer sector into canonical pediatric-oncology sector; preserve legacy route and SEO equity.')
  on conflict (source_path) do update
    set destination_path = excluded.destination_path,
        status_code = excluded.status_code,
        is_active = true,
        note = excluded.note,
        updated_at = now();

  if v_legacy_id is not null then
    delete from public.sectors where id = v_legacy_id;
  end if;
end
$$;
