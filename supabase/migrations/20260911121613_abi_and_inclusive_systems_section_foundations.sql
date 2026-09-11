do $$
declare
  v_rehab_sector uuid;
  v_neuro_parent uuid;
  v_abi uuid;
  v_special_sector uuid;
  v_inclusion_parent uuid;
  v_inclusive_systems uuid;
begin
  select id into v_rehab_sector
  from public.sectors
  where slug='rehabilitation-functioning' and is_active=true and visibility='public';
  if v_rehab_sector is null then raise exception 'rehabilitation-functioning sector missing'; end if;

  select id into v_neuro_parent
  from public.categories
  where sector_id=v_rehab_sector and slug='neurological-rehabilitation' and is_active=true and visibility='public';
  if v_neuro_parent is null then raise exception 'neurological-rehabilitation parent missing'; end if;

  insert into public.categories(
    sector_id,parent_id,slug,name_ar,description,sort_order,is_active,
    seo_title,seo_description,visibility,audience,icon_key,metadata
  ) values (
    v_rehab_sector,v_neuro_parent,'acquired-brain-injury-recovery',
    'إصابات الدماغ المكتسبة: الإدراك والسلوك والتعافي',
    'مركز معرفي متدرج لإصابات الدماغ المكتسبة يربط السبب والمسار بالتقييم العصبي النفسي والإدراك والتواصل والسلوك والتعب والأسرة والعودة إلى التعلم والعمل والاستقلال والمشاركة.',
    10,true,
    'إصابات الدماغ المكتسبة والتعافي | روافد',
    'مرجع عربي متقدم لإصابات الدماغ المكتسبة: الإدراك والذاكرة والانتباه والسلوك والتواصل والتعب والأسرة والتأهيل والعودة إلى الدراسة والعمل والمشاركة.',
    'public',array['الأشخاص','الأسر','مقدمو الرعاية','المختصون','الطلبة'],'brain',
    jsonb_build_object(
      'program','abi_knowledge_center',
      'taxonomy_version',1,
      'editorial_scope','acquired-brain-injury-cognition-behaviour-recovery-participation',
      'source_anchors',jsonb_build_array('WHO Rehabilitation','WFNR Gulf referral','Headway Information Library','Stroke Foundation Arabic resources','INCOG 2.0'),
      'rights_rule','original synthesis; link to protected source material; no verbatim republication',
      'terminology_rule','distinguish psychologist, clinical psychologist, neuropsychologist and psychiatrist by training and scope'
    )
  ) on conflict(slug) do update set
    sector_id=excluded.sector_id,parent_id=excluded.parent_id,name_ar=excluded.name_ar,
    description=excluded.description,sort_order=excluded.sort_order,is_active=true,
    seo_title=excluded.seo_title,seo_description=excluded.seo_description,
    visibility='public',audience=excluded.audience,icon_key=excluded.icon_key,
    metadata=public.categories.metadata || excluded.metadata,updated_at=now()
  returning id into v_abi;

  insert into public.content_categories(content_id,category_id,is_primary)
  select c.id,v_abi,false
  from public.content c
  where c.status='published' and c.robots_index=true and c.slug in (
    'legacy-outside-box-acquired-brain-injury',
    'legacy-family-guide-conditions-acquired-brain-injury',
    'traumatic-brain-injury-rehabilitation-guide',
    'stroke-rehabilitation-guide',
    'concept-1809',
    'magazine-abi-transitional-rehab-caregiver-strain-2026',
    'magazine-severe-abi-older-adults-rehabilitation-outcomes-2026',
    'post-stroke-dysphagia-full-cycle-care-2026',
    'capabilities-traumatic-brain-injury',
    'capabilities-stroke'
  )
  on conflict(content_id,category_id) do nothing;

  select id into v_special_sector
  from public.sectors
  where slug='special-needs-inclusion' and is_active=true and visibility='public';
  if v_special_sector is null then raise exception 'special-needs-inclusion sector missing'; end if;

  select id into v_inclusion_parent
  from public.categories
  where sector_id=v_special_sector and slug='inclusion-accommodations' and is_active=true and visibility='public';
  if v_inclusion_parent is null then raise exception 'inclusion-accommodations parent missing'; end if;

  insert into public.categories(
    sector_id,parent_id,slug,name_ar,description,sort_order,is_active,
    seo_title,seo_description,visibility,audience,icon_key,metadata
  ) values (
    v_special_sector,v_inclusion_parent,'inclusive-education-practice-systems',
    'الممارسة والقيادة والأنظمة في التعليم الدامج',
    'مركز تطبيقي ينتقل من تكييف الطالب منفردًا إلى بناء صف ومدرسة ونظام دامج: القيادة والتعاون وإشراك الأسرة وإتاحة التعلم والتقييم والتنفيذ ومراقبة الجودة والتحسين المستمر.',
    40,true,
    'الممارسة والأنظمة في التعليم الدامج | روافد',
    'مرجع عربي تطبيقي لبناء التعليم الدامج على مستوى الصف والمدرسة والنظام: القيادة والتعاون والأسرة وUDL والتقييم والتكييفات والتنفيذ وقياس جودة الدمج.',
    'public',array['المعلمون','الأسر','المختصون','قادة المدارس','صناع السياسات','الطلبة'],'education',
    jsonb_build_object(
      'program','inclusive_education_systems_center',
      'taxonomy_version',1,
      'editorial_scope','inclusive-education-practice-leadership-implementation-quality',
      'source_anchors',jsonb_build_array('CEC DISES Professional Learning Series','CAST UDL Guidelines 3.0','UN CRPD Article 24','UNESCO inclusive education resources'),
      'rights_rule','original synthesis with official-source attribution; no implied endorsement or official translation',
      'implementation_level',jsonb_build_array('classroom','school','family-school partnership','system')
    )
  ) on conflict(slug) do update set
    sector_id=excluded.sector_id,parent_id=excluded.parent_id,name_ar=excluded.name_ar,
    description=excluded.description,sort_order=excluded.sort_order,is_active=true,
    seo_title=excluded.seo_title,seo_description=excluded.seo_description,
    visibility='public',audience=excluded.audience,icon_key=excluded.icon_key,
    metadata=public.categories.metadata || excluded.metadata,updated_at=now()
  returning id into v_inclusive_systems;

  insert into public.content_categories(content_id,category_id,is_primary)
  select c.id,v_inclusive_systems,false
  from public.content c
  where c.status='published' and c.robots_index=true and c.slug in (
    'legacy-learning-path-evidence-guided-inclusive-education-foundations',
    'care-guide-inclusive-education-meeting-preparation',
    'care-guide-school-home-communication-log',
    'care-guide-school-accommodation-follow-up-plan',
    'universal-design-for-learning',
    'care-guide-udl-digital-learning-materials-access',
    'care-guide-udl-multilingual-disability-inclusion',
    'care-guide-udl-accessible-assessment-design',
    'iep-goals-quality',
    'legacy-special-needs-guides-education-inclusive-assessment-school',
    'legacy-special-needs-guides-education-attendance-participation-barriers',
    'legacy-special-needs-guides-education-curriculum-access',
    'legacy-special-needs-guides-education-classroom-accommodations',
    'legacy-special-needs-family-school-collaboration-meeting',
    'autistic-student-school-wellbeing',
    'care-guide-school-bullying-disability-response'
  )
  on conflict(content_id,category_id) do nothing;
end $$;
