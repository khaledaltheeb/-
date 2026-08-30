-- Medical decision science knowledge cluster
-- Live release: 2026-08-29

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
  icon_key,
  metadata
)
select
  s.id,
  'medical-decision-science',
  'علوم القرار الطبي',
  'قسم عربي متخصص يشرح كيف تندمج الأدلة والاحتمالات وعدم اليقين مع قيم الشخص وتفضيلاته لبناء قرارات صحية أكثر وضوحا وقابلية للمراجعة، مع أدوات عملية للمرضى والأسر والممارسين.',
  25,
  true,
  'علوم القرار الطبي واتخاذ القرار المشترك | منصة روافد',
  'مرجع عربي لعلوم القرار الطبي: القرار المشترك، فهم المخاطر والاحتمالات، عدم اليقين، أدوات دعم قرار المريض، تعارض القرار، والثقافة والأسرة.',
  'public',
  array['الأفراد','الأسر','الممارسون الصحيون','المختصون','الباحثون','المتدربون']::text[],
  'scale',
  jsonb_build_object(
    'module','medical-decision-science',
    'source_origin','SAMDS correspondence and independent evidence verification',
    'rights_note','Original Arabic synthesis; source links are cited, not republished or translated verbatim.'
  )
from public.sectors s
where s.slug='knowledge'
on conflict (slug) do update set
  sector_id=excluded.sector_id,
  name_ar=excluded.name_ar,
  description=excluded.description,
  sort_order=excluded.sort_order,
  is_active=true,
  seo_title=excluded.seo_title,
  seo_description=excluded.seo_description,
  visibility='public',
  audience=excluded.audience,
  icon_key=excluded.icon_key,
  metadata=public.categories.metadata || excluded.metadata,
  updated_at=now();
