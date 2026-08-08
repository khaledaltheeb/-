begin;

insert into public.categories (
  sector_id,
  slug,
  name_ar,
  description,
  sort_order,
  is_active,
  seo_title,
  seo_description,
  visibility,
  audience,
  metadata
)
select
  s.id,
  'addiction-conditions',
  'اضطرابات الإدمان والحالات الأساسية',
  'قسم متخصص يجمع اضطرابات استخدام المواد والسلوكيات الإدمانية الأساسية، مع التقييم والمخاطر والعلاج والتعافي ودعم الأسرة ومؤشرات الطوارئ وفق أدلة موثوقة.',
  5,
  true,
  'اضطرابات الإدمان والحالات الأساسية | روافد',
  'أدلة عربية موثوقة لاضطرابات الإدمان والحالات الأساسية: العلامات والمخاطر والتقييم والعلاج والتعافي ودعم الأسرة ومؤشرات الطوارئ، ضمن بنية علمية مترابطة.',
  'public',
  array['الشخص المتأثر بالإدمان','الأسرة','المدربون وميسرو الأقران','المجتمع والمؤسسات','المختصون']::text[],
  jsonb_build_object(
    'page_role', 'addiction-condition-index',
    'legacy_root', '/addiction/conditions/',
    'migration_batch', 'legacy-addiction-conditions-v1',
    'content_model', 'v3-native-category'
  )
from public.sectors s
where s.slug = 'addiction-recovery'
on conflict (slug) do update set
  sector_id = excluded.sector_id,
  name_ar = excluded.name_ar,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  visibility = excluded.visibility,
  audience = excluded.audience,
  metadata = public.categories.metadata || excluded.metadata,
  updated_at = now();

do $$
begin
  if not exists (
    select 1
    from public.categories c
    join public.sectors s on s.id = c.sector_id
    where c.slug = 'addiction-conditions'
      and s.slug = 'addiction-recovery'
      and c.is_active = true
      and c.visibility = 'public'
  ) then
    raise exception 'addiction-conditions taxonomy was not materialized under addiction-recovery';
  end if;
end $$;

commit;
