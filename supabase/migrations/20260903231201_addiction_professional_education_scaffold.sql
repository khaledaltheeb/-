begin;

insert into public.categories (
  sector_id,
  parent_id,
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
  null,
  'addiction-professional-education',
  'التعليم والكفاءات المهنية في رعاية اضطرابات استخدام المواد',
  'مسار مهني متعدد التخصصات داخل قطاع الإدمان والتعافي لتنظيم الكفاءات الأساسية في التعرف المبكر والتحري والتقييم والتدخل الوجيز والإحالة والعلاج وخفض الضرر والتعافي والعمل البيني والأخلاقيات، مع تكييف المحتوى للسياق العربي والاستناد إلى أطر ومصادر مؤسسية موثوقة.',
  14,
  false,
  'التعليم والكفاءات المهنية في رعاية اضطرابات استخدام المواد | روافد',
  'قسم مهني عربي منظم للكفاءات الأساسية في رعاية اضطرابات استخدام المواد: التحري والتقييم وSBIRT والمقابلة التحفيزية والعلاج والإحالة وخفض الضرر والعمل متعدد التخصصات، ضمن إطار قائم على الدليل.',
  'public',
  array[
    'المختصون',
    'الأطباء',
    'التمريض',
    'الصيادلة',
    'الأخصائيون الاجتماعيون',
    'العاملون في الصحة النفسية',
    'مقدمو الرعاية الأولية',
    'مدربو وميسرو التعافي'
  ]::text[],
  jsonb_build_object(
    'page_role', 'addiction-professional-education-index',
    'content_model', 'professional-competency-learning-path-v1',
    'lifecycle', 'scaffold-ready',
    'activation_state', 'hold-until-content-ready',
    'planned_route', '/addiction/education/',
    'canonical_section_route', '/sections/addiction-professional-education',
    'framework_basis', jsonb_build_array(
      'AMERSA Core Competencies',
      'Grayken Center / Boston Medical Center',
      'current evidence and guidelines'
    ),
    'planned_core_pages', jsonb_build_array(
      'core-competencies',
      'screening-assessment',
      'sbirt',
      'motivational-interviewing'
    ),
    'cross_listing_policy', 'reuse-existing-canonical-pages-no-duplication',
    'publication_gate', jsonb_build_object(
      'requires_editorial_landing_page', true,
      'requires_core_competency_page', true,
      'requires_minimum_professional_pages', 4,
      'requires_reference_review', true,
      'requires_internal_link_review', true,
      'requires_no_duplicate_canonical_content', true
    )
  )
from public.sectors s
where s.slug = 'addiction-recovery'
on conflict (slug) do update set
  sector_id = excluded.sector_id,
  parent_id = excluded.parent_id,
  name_ar = excluded.name_ar,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = false,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  visibility = excluded.visibility,
  audience = excluded.audience,
  metadata = coalesce(public.categories.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

do $$
declare
  v_sector_slug text;
  v_active boolean;
  v_lifecycle text;
begin
  select s.slug, c.is_active, c.metadata->>'lifecycle'
    into v_sector_slug, v_active, v_lifecycle
  from public.categories c
  join public.sectors s on s.id = c.sector_id
  where c.slug = 'addiction-professional-education';

  if v_sector_slug is distinct from 'addiction-recovery' then
    raise exception 'professional education scaffold is not attached to addiction-recovery';
  end if;

  if v_active is distinct from false then
    raise exception 'professional education scaffold must remain inactive until content release';
  end if;

  if v_lifecycle is distinct from 'scaffold-ready' then
    raise exception 'professional education scaffold lifecycle metadata missing';
  end if;
end $$;

commit;
