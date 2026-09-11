create table if not exists private.terminology_governance (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  term_en text not null,
  preferred_ar text not null,
  accepted_ar text[] not null default '{}',
  avoid_ar text[] not null default '{}',
  definition_ar text not null,
  usage_note_ar text not null,
  jurisdiction_scope text not null default 'cross-arabic-general',
  source_urls text[] not null default '{}',
  source_provenance text not null,
  review_status text not null default 'editorial-verified' check (review_status in ('editorial-verified','specialist-review-recommended','specialist-verified')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists terminology_governance_domain_term_en_uidx
  on private.terminology_governance(domain, lower(term_en));

revoke all on private.terminology_governance from public, anon, authenticated;
grant select,insert,update,delete on private.terminology_governance to service_role;

insert into private.terminology_governance(
  domain,term_en,preferred_ar,accepted_ar,avoid_ar,definition_ar,usage_note_ar,
  jurisdiction_scope,source_urls,source_provenance,review_status,metadata
) values
(
  'mental-health-professions','Psychologist','اختصاصي علم النفس',
  array['أخصائي علم النفس','اختصاصي نفسي','أخصائي نفسي'],array['طبيب نفسي'],
  'مهني في علم النفس؛ لا يدل المسمى بذاته على أنه طبيب أو على اختصاص طبي في الطب النفسي.',
  'يُفضّل ذكر التخصص عند توفره، مثل اختصاصي علم النفس السريري أو العصبي. لا يُترجم Psychologist إلى طبيب نفسي.',
  'cross-arabic-general',array['https://www.who.int/ar/news-room/fact-sheets/detail/rehabilitation'],
  'Cleveland Clinic Abu Dhabi neuropsychology referral highlighted the recurrent Arabic confusion between Psychologist and Psychiatrist; WHO Arabic rehabilitation terminology independently distinguishes clinical psychologists from physicians.',
  'specialist-review-recommended',jsonb_build_object('source_context','WFNR Gulf / Cleveland Clinic Abu Dhabi correspondence 2026-09-11')
),
(
  'mental-health-professions','Clinical Psychologist','اختصاصي علم النفس السريري',
  array['أخصائي علم النفس السريري','اختصاصي نفسي سريري','أخصائي نفسي سريري'],array['طبيب نفسي'],
  'اختصاصي علم نفس يعمل في التقييم والتدخلات النفسية السريرية ضمن نطاق مؤهلاته وتنظيم المهنة في البلد.',
  'لا يُساوى بالطبيب الاختصاصي في الطب النفسي. تُذكر الصفة السريرية عندما تكون جزءًا من المؤهل أو الدور الموثق.',
  'cross-arabic-general',array['https://www.who.int/ar/news-room/fact-sheets/detail/rehabilitation'],
  'WHO Arabic rehabilitation fact sheet lists clinical psychologists separately within the rehabilitation workforce.',
  'specialist-review-recommended','{}'::jsonb
),
(
  'mental-health-professions','Neuropsychologist','اختصاصي علم النفس العصبي',
  array['أخصائي علم النفس العصبي','اختصاصي علم النفس العصبي السريري'],array['طبيب أعصاب','طبيب نفسي'],
  'اختصاصي في العلاقة بين الدماغ والسلوك والإدراك، ويعمل في التقييم والتأهيل أو الرعاية العصبية النفسية وفق التدريب والنطاق المهني.',
  'عند الإشارة إلى شخص محدد يُستخدم المسمى الذي يطابق مؤهله الفعلي. لا يُترجم إلى طبيب أعصاب أو طبيب نفسي.',
  'cross-arabic-general',array['https://www.who.int/ar/news-room/fact-sheets/detail/rehabilitation'],
  'Terminology governance derived from WFNR Gulf referral and Cleveland Clinic Abu Dhabi neuropsychology correspondence; broader rehabilitation workforce terminology anchored to WHO Arabic.',
  'specialist-review-recommended',jsonb_build_object('source_context','WFNR Gulf / Cleveland Clinic Abu Dhabi correspondence 2026-09-11')
),
(
  'mental-health-professions','Psychiatrist','طبيب اختصاصي في الطب النفسي',
  array['طبيب نفسي','اختصاصي طب نفسي'],array['اختصاصي علم النفس','أخصائي نفسي'],
  'طبيب مؤهل في الطب ثم متخصص في الطب النفسي ضمن النظام المهني المعمول به.',
  'يجب الحفاظ على الفرق بين الطب النفسي وعلم النفس؛ الاختلاف في التدريب ونطاق الممارسة جوهري، مع اختلاف بعض الصلاحيات حسب البلد.',
  'cross-arabic-general',array[]::text[],
  'Cleveland Clinic Abu Dhabi neuropsychology correspondence 2026-09-11 explicitly flagged the Psychologist/Psychiatrist translation distinction as a practical patient-care problem.',
  'specialist-review-recommended',jsonb_build_object('source_context','WFNR Gulf / Cleveland Clinic Abu Dhabi correspondence 2026-09-11')
),
(
  'rehabilitation','Rehabilitation','إعادة التأهيل',
  array['التأهيل'],array[]::text[],
  'مجموعة تدخلات تهدف إلى تحسين الأداء الوظيفي والحد من الإعاقة لدى الأشخاص ذوي الحالات الصحية في تفاعلهم مع بيئتهم.',
  'يُستخدم «إعادة التأهيل» عندما ننقل المفهوم الصحي الرسمي وفق WHO، ويمكن استخدام «التأهيل» في أسماء الأقسام والسياقات العربية الشائعة ما دام المعنى واضحًا ومتسقًا.',
  'cross-arabic-general',array['https://www.who.int/ar/news-room/fact-sheets/detail/rehabilitation'],
  'WHO Arabic Rehabilitation fact sheet, accessed for 2026 terminology governance.',
  'editorial-verified','{}'::jsonb
),
(
  'rehabilitation-professions','Physiatrist','طبيب اختصاصي في الطب الفيزيائي وإعادة التأهيل',
  array['طبيب الطب الفيزيائي وإعادة التأهيل','اختصاصي الطب الفيزيائي وإعادة التأهيل'],array['معالج طبيعي','أخصائي علاج طبيعي'],
  'طبيب متخصص في الطب الفيزيائي وإعادة التأهيل، يختلف دوره عن اختصاصيي العلاج الطبيعي وغيرهم من أعضاء فريق التأهيل.',
  'تختلف الصياغة المهنية الرسمية حسب الدولة؛ عند ذكر جهة أو شخص محدد يُتبع اللقب التنظيمي الموثق محليًا.',
  'cross-arabic-general',array['https://www.who.int/ar/news-room/fact-sheets/detail/rehabilitation'],
  'WHO Arabic rehabilitation fact sheet lists physicians specialized in physical medicine and rehabilitation as part of the rehabilitation workforce.',
  'editorial-verified','{}'::jsonb
),
(
  'brain-injury','Acquired Brain Injury','إصابة الدماغ المكتسبة',
  array['إصابات الدماغ المكتسبة','إصابة دماغية مكتسبة'],array[]::text[],
  'مصطلح مظلي لإصابة أو ضرر يصيب الدماغ بعد الولادة وقد يشمل أسبابًا رضّية وغير رضّية؛ يجب بيان السبب بدل افتراض أن كل ABI رضّية.',
  'تستخدم الصفحة المظلية المصطلح لتجميع رحلة التعافي والإدراك والسلوك والمشاركة، بينما تبقى السكتة وإصابة الدماغ الرضّية وغيرها صفحات تشخيصية ومسارات مستقلة.',
  'cross-arabic-general',array['https://www.headway.org.uk/about-brain-injury/individuals/information-library/'],
  'Topic scope anchored to Headway brain injury information architecture and Rawafid existing neurological rehabilitation taxonomy.',
  'specialist-review-recommended','{}'::jsonb
),
(
  'brain-injury','Traumatic Brain Injury','إصابة الدماغ الرضّية',
  array['إصابة دماغية رضّية','إصابات الدماغ الرضّية'],array['إصابة الدماغ المكتسبة'],
  'إصابة في الدماغ تنتج عن قوة أو آلية رضّية؛ وهي نوع من إصابات الدماغ المكتسبة وليست مرادفًا للمصطلح المظلي كله.',
  'عند المقارنة مع ABI يُشرح أن TBI فئة فرعية رضّية، ولا تُستخدم المصطلحات بالتبادل في العناوين أو تعريف السكان.',
  'cross-arabic-general',array['https://pubmed.ncbi.nlm.nih.gov/36594856/'],
  'INCOG 2.0 traumatic brain injury cognitive rehabilitation guideline series and Rawafid existing TBI rehabilitation guide.',
  'editorial-verified','{}'::jsonb
),
(
  'neurology','Stroke','السكتة الدماغية',
  array['السكتة','السكتات الدماغية'],array['الجلطة الدماغية كمرادف شامل دون تحديد'],
  'حدث عصبي حاد ينجم عن اضطراب وعائي دماغي إقفاري أو نزفي؛ لا تختزل التسمية العلمية دائمًا إلى «جلطة» لأن السكتات تشمل النزف أيضًا.',
  'يمكن ذكر «الجلطة الدماغية» كلفظ بحثي شائع مع توضيح أن السكتة قد تكون إقفارية أو نزفية؛ العنوان العلمي المفضل هو السكتة الدماغية.',
  'cross-arabic-general',array['https://strokefoundation.org.au/about-stroke/learn/languages','https://www.who.int/ar/news-room/fact-sheets/detail/rehabilitation'],
  'Arabic Stroke Foundation resources and WHO Arabic rehabilitation terminology.',
  'editorial-verified','{}'::jsonb
)
on conflict(domain,lower(term_en)) do update set
  preferred_ar=excluded.preferred_ar,
  accepted_ar=excluded.accepted_ar,
  avoid_ar=excluded.avoid_ar,
  definition_ar=excluded.definition_ar,
  usage_note_ar=excluded.usage_note_ar,
  jurisdiction_scope=excluded.jurisdiction_scope,
  source_urls=excluded.source_urls,
  source_provenance=excluded.source_provenance,
  review_status=excluded.review_status,
  metadata=private.terminology_governance.metadata || excluded.metadata,
  updated_at=now();
