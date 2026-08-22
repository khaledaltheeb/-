-- Preserve the existing /encyclopedia/* corpus in place and expose it as a distinct sector.
-- No legacy content rows, slugs, canonical URLs, or routes are deleted or rewritten here.

insert into public.sectors (
  slug,
  name_ar,
  description,
  accent,
  sort_order,
  is_active,
  visibility,
  seo_title,
  seo_description,
  audience,
  icon_key,
  metadata
)
values (
  'short-encyclopedia',
  'الموسوعة المختصرة',
  'قطاع مستقل يحفظ صفحات الموسوعة النفسية الحالية كما هي، ويقدمها كمرجع مختصر منفصل عن مشروع الموسوعة النفسية الموسعة ذات المصطلحات المتخصصة.',
  'lilac',
  45,
  true,
  'public',
  'الموسوعة المختصرة | منصة روافد',
  'الموسوعة المختصرة في منصة روافد تجمع الصفحات النفسية الحالية في قطاع مستقل مع الحفاظ على المسارات الأصلية والروابط والفهرسة دون حذف أو تكرار.',
  array['الجمهور','الطلاب','الأسر','المختصون']::text[],
  'book-open',
  jsonb_build_object(
    'content_source', 'legacy-psych-encyclopedia',
    'canonical_root', '/encyclopedia/',
    'preserve_existing_pages', true,
    'rename_public_label_only', true,
    'expanded_encyclopedia_separate', true
  )
)
on conflict (slug) do update
set
  name_ar = excluded.name_ar,
  description = excluded.description,
  accent = excluded.accent,
  sort_order = excluded.sort_order,
  is_active = true,
  visibility = 'public',
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  audience = excluded.audience,
  icon_key = excluded.icon_key,
  metadata = coalesce(public.sectors.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();
