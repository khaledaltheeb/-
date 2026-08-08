insert into public.categories (
  sector_id,
  slug,
  name_ar,
  description,
  sort_order,
  is_active,
  visibility,
  metadata
)
select
  s.id,
  'legacy-migration-staging',
  'ترحيل المحتوى — مراجعة داخلية',
  'تصنيف داخلي مخفي لحفظ المحتوى القديم كاملًا داخل بنية روافد V3 قبل المراجعة التحريرية والتصنيف النهائي والنشر.',
  999,
  true,
  'hidden',
  jsonb_build_object(
    'purpose','legacy-content-staging',
    'public_navigation',false,
    'publish_from_category',false,
    'requires_final_taxonomy',true
  )
from public.sectors s
where s.slug='knowledge'
on conflict (slug) do update
set sector_id=excluded.sector_id,
    name_ar=excluded.name_ar,
    description=excluded.description,
    sort_order=excluded.sort_order,
    is_active=excluded.is_active,
    visibility=excluded.visibility,
    metadata=excluded.metadata,
    updated_at=now();
