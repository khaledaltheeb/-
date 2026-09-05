-- IECMH taxonomy and linkage record
-- Applied to production content DB on 2026-09-05 and retained here as an idempotent repository record.
-- Full editorial bodies live in public.content and are governed by content_release_gate_v6.
-- This migration deliberately does not claim external specialist review or WAIMH endorsement.

begin;

-- Root category.
with s as (
  select id from public.sectors where slug = 'mental-health'
)
insert into public.categories (
  sector_id, parent_id, slug, name_ar, description, sort_order, is_active,
  seo_title, seo_description, visibility, audience, metadata
)
select
  s.id,
  null,
  'infant-early-childhood-mental-health',
  'الصحة النفسية للرضع والطفولة المبكرة',
  'مسار عربي متخصص من الحمل والولادة حتى سن الخامسة يركز على العلاقة مع مقدم الرعاية، الرعاية المستجيبة، التنظيم، التعلق، صحة مقدم الرعاية، النمو، الصدمة، الخداج والإحالة الآمنة.',
  155,
  true,
  'الصحة النفسية للرضع والطفولة المبكرة 0–5 | روافد',
  'مرجع عربي متكامل للصحة النفسية للرضع والأطفال حتى الخامسة: العلاقة المبكرة، الرعاية المستجيبة، التعلق، التنظيم، النوم، صحة مقدم الرعاية، النمو، الصدمة والإحالة.',
  'public',
  array['الوالدان ومقدمو الرعاية','الأسر','المختصون','العاملون مع الأطفال']::text[],
  jsonb_build_object(
    'page_role','iecmh-reference-hub',
    'coverage_model','IECMH-100-v1',
    'age_range','pregnancy-to-5',
    'evidence_policy','primary-guidelines-plus-current-peer-reviewed',
    'review_state','internal-evidence-review-external-specialist-review-welcomed'
  )
from s
on conflict (slug) do update set
  sector_id = excluded.sector_id,
  parent_id = null,
  name_ar = excluded.name_ar,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  visibility = 'public',
  audience = excluded.audience,
  metadata = coalesce(public.categories.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

-- Five child tracks.
with s as (
  select id from public.sectors where slug = 'mental-health'
), p as (
  select id from public.categories where slug = 'infant-early-childhood-mental-health'
)
insert into public.categories (
  sector_id, parent_id, slug, name_ar, description, sort_order, is_active,
  seo_title, seo_description, visibility, audience, metadata
)
select
  s.id, p.id, v.slug, v.name_ar, v.description, v.sort_order, true,
  v.seo_title, v.seo_description, 'public',
  array['الوالدان ومقدمو الرعاية','الأسر','المختصون','العاملون مع الأطفال']::text[],
  jsonb_build_object('page_role', v.page_role, 'coverage_model', 'IECMH-100-v1')
from s, p
cross join (values
  ('iecmh-relationships-caregiving','العلاقة المبكرة والرعاية المستجيبة','الصحة العلاقية المبكرة، قراءة إشارات الطفل، التبادل التفاعلي، التنظيم المشترك، التعلق والوظيفة التأملية الوالدية ضمن سياق ثقافي غير وصمي.',10,'العلاقة المبكرة والرعاية المستجيبة 0–5 | روافد','دليل عربي للصحة العلاقية المبكرة والرعاية المستجيبة والتنظيم المشترك والتعلق والوظيفة التأملية الوالدية من الرضاعة حتى الخامسة.','relational-health'),
  ('iecmh-caregiver-perinatal','صحة مقدم الرعاية والفترة المحيطة بالولادة','الصحة النفسية أثناء الحمل وبعد الولادة، ضغط مقدم الرعاية، الدعم الأسري، وتأثير قدرة البالغ على الرعاية دون لومه أو اختزال صحة الطفل في حالة الوالد.',20,'صحة مقدم الرعاية والحمل وما بعد الولادة | روافد','مسار عربي يربط الصحة النفسية المحيطة بالولادة ورفاه مقدم الرعاية بالرعاية الحانية للرضيع والطفل مع حدود إحالة واضحة.','caregiver-perinatal'),
  ('iecmh-regulation-development','التنظيم والروتين والنمو والإحالة','التنظيم المشترك، النوم والبكاء والتغذية كروتينات علاقة وسلامة، المراقبة النمائية، فقد المهارات، والتمييز بين التنوع الطبيعي والحاجة إلى تقييم.',30,'التنظيم والنمو والإحالة في 0–5 | روافد','مرجع عربي للتنظيم والنوم والبكاء والروتين والمراقبة النمائية وعلامات الحاجة إلى تقييم لدى الرضع والأطفال حتى الخامسة.','regulation-development'),
  ('iecmh-trauma-medical','الصدمة والفقد والخداج والرعاية الطبية','احتياجات الرضع والأطفال الصغار بعد العنف أو الحرب أو النزوح أو الفقد، وكذلك الخداج وNICU والإجراءات الطبية، مع أولوية الأمان والعلاقة والأسرة.',40,'الصدمة والخداج والرعاية الطبية في الطفولة المبكرة | روافد','دليل عربي للصدمة 0–5 والفقد والنزوح والخداج وNICU والضغط الطبي ودور العلاقة مع مقدم الرعاية والإحالة المتخصصة.','trauma-medical'),
  ('iecmh-practice-inclusion','الممارسة المهنية والثقافة والدمج','التنوع العصبي والإعاقة، الرعاية المرتكزة على الأسرة، الأخلاق، الحدود، الممارسة التأملية، التواضع الثقافي، وعدم استبدال العلاقة المهنية بأدوات رقمية أو ذكاء اصطناعي.',50,'الممارسة المهنية والدمج في الصحة النفسية للرضع | روافد','مرجع للمختصين حول الدمج والتنوع العصبي والأخلاق والممارسة التأملية والتواضع الثقافي وحدود التقنية في الصحة النفسية للرضع والطفولة المبكرة.','practice-inclusion')
) as v(slug,name_ar,description,sort_order,seo_title,seo_description,page_role)
on conflict (slug) do update set
  sector_id = excluded.sector_id,
  parent_id = excluded.parent_id,
  name_ar = excluded.name_ar,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  visibility = 'public',
  audience = excluded.audience,
  metadata = coalesce(public.categories.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

-- Bind each taxonomy node to its released V6 editorial page when the content row exists.
update public.categories cat
set editorial_content_id = c.id, updated_at = now()
from public.content c
where (cat.slug, c.slug) in (
  ('infant-early-childhood-mental-health','iecmh-reference-hub'),
  ('iecmh-relationships-caregiving','iecmh-relationships-caregiving-guide'),
  ('iecmh-caregiver-perinatal','iecmh-caregiver-perinatal-guide'),
  ('iecmh-regulation-development','iecmh-regulation-development-guide'),
  ('iecmh-trauma-medical','iecmh-trauma-medical-guide'),
  ('iecmh-practice-inclusion','iecmh-practice-inclusion-guide')
);

-- Add the five child editorial pages as supporting content under the root hub.
insert into public.content_categories(content_id, category_id, is_primary)
select c.id, root.id, false
from public.content c
cross join public.categories root
where root.slug = 'infant-early-childhood-mental-health'
  and c.slug in (
    'iecmh-relationships-caregiving-guide',
    'iecmh-caregiver-perinatal-guide',
    'iecmh-regulation-development-guide',
    'iecmh-trauma-medical-guide',
    'iecmh-practice-inclusion-guide'
  )
on conflict (content_id, category_id) do nothing;

-- Cross-list existing authoritative Rawafid content. Primary taxonomy remains unchanged.
insert into public.content_categories(content_id,category_id,is_primary)
select c.id,cat.id,false from public.content c cross join public.categories cat
where cat.slug='iecmh-relationships-caregiving'
  and c.slug in ('concept-0432','concept-0421','legacy-sector-child-guides-play-participation','magazine-parenting-under3-meta-2026')
on conflict(content_id,category_id) do nothing;

insert into public.content_categories(content_id,category_id,is_primary)
select c.id,cat.id,false from public.content c cross join public.categories cat
where cat.slug='iecmh-caregiver-perinatal'
  and c.slug in ('legacy-sector-women-perinatal-mental-health','legacy-sector-women-postpartum-depression','quick-info-baby-blues-vs-postpartum-depression','quick-info-perinatal-anxiety-pregnancy-postpartum','magazine-perinatal-depression-digital-nma-2026','quick-info-postpartum-rage')
on conflict(content_id,category_id) do nothing;

insert into public.content_categories(content_id,category_id,is_primary)
select c.id,cat.id,false from public.content c cross join public.categories cat
where cat.slug='iecmh-regulation-development'
  and c.slug in ('quick-info-early-intervention-activities-age-1-3','quick-info-early-intervention-home-program','quick-info-social-development-delay-signs','quick-info-three-year-old-developmental-milestones','legacy-sector-child-guides-play-participation','participation-based-early-intervention-goals','activity-matrix-early-intervention')
on conflict(content_id,category_id) do nothing;

insert into public.content_categories(content_id,category_id,is_primary)
select c.id,cat.id,false from public.content c cross join public.categories cat
where cat.slug='iecmh-trauma-medical'
  and c.slug in ('concept-0132','care-guide-pediatric-cancer-medical-traumatic-stress','perinatal-neonatal-palliative-care')
on conflict(content_id,category_id) do nothing;

insert into public.content_categories(content_id,category_id,is_primary)
select c.id,cat.id,false from public.content c cross join public.categories cat
where cat.slug='iecmh-practice-inclusion'
  and c.slug in ('participation-based-early-intervention-goals','family-identified-outcomes-early-intervention','activity-based-intervention-early-childhood','legacy-special-needs-early-intervention-communication-routines','legacy-special-needs-early-intervention-motor-development-routines','play-embedded-intervention','caregiver-training-fidelity')
on conflict(content_id,category_id) do nothing;

commit;
