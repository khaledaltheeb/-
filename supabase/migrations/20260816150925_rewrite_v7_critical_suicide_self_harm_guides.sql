-- Replace the generic V7 operational-template tail on two high-sensitivity guides
-- with topic-specific suicide/self-harm safety content. The previous Rawafid review
-- date is preserved in revision_provenance, then cleared from last_reviewed_at because
-- the materially rewritten version requires a fresh Rawafid team review.

with targets as (
  select id,slug,body_json,references_json,schema_json,last_reviewed_at,reviewer_display_name,reviewer_credentials
  from public.content
  where slug in (
    'care-guide-suicide-risk-conversation-safety-plan',
    'care-guide-self-harm-family-safety-support'
  )
), retained as (
  select t.id,t.slug,t.references_json,t.schema_json,t.last_reviewed_at,t.reviewer_display_name,t.reviewer_credentials,
         coalesce(jsonb_agg(e.block order by e.ord) filter (where e.ord < c.cutoff_ord),'[]'::jsonb) as retained_blocks
  from targets t
  cross join lateral jsonb_array_elements(t.body_json->'blocks') with ordinality as e(block,ord)
  cross join lateral (
    select min(x.ord) as cutoff_ord
    from jsonb_array_elements(t.body_json->'blocks') with ordinality as x(block,ord)
    where x.block->>'type'='heading'
      and x.block->>'text'='إطار التنفيذ والمتابعة الموسّع'
  ) c
  group by t.id,t.slug,t.references_json,t.schema_json,t.last_reviewed_at,t.reviewer_display_name,t.reviewer_credentials
), extras as (
  select
    'care-guide-suicide-risk-conversation-safety-plan'::text as slug,
    jsonb_build_array(
      jsonb_build_object('type','heading','level',2,'text','لا تختزل القرار في تصنيف «منخفض/متوسط/مرتفع»'),
      jsonb_build_object('type','paragraph','text','لا تستطيع الأسرة ولا الصفحة العامة تحويل خطر الانتحار إلى رقم واحد يقرر وحده من يحتاج علاجًا أو خروجًا أو دخولًا للمستشفى. توصي NICE بعدم استخدام أدوات التنبؤ أو التصنيف العام إلى منخفض أو متوسط أو مرتفع لتحديد العلاج أو الخروج. بدل ذلك، ركز على ما يحدث الآن: وجود أفكار حالية، نية قريبة، خطة، وصول إلى وسيلة شديدة الخطورة، تغير سريع في الحالة، تعاطي مواد أو ارتباك، القدرة على البقاء آمنًا، الدعم المتاح، وما يحتاجه الشخص فورًا وعلى المدى القريب. إذا تغيرت هذه العناصر، تتغير الحاجة إلى الرعاية ويجب إعادة التقييم.'),
      jsonb_build_object('type','heading','level',2,'text','ما الذي تنقله إلى الطبيب أو فريق الطوارئ؟'),
      jsonb_build_object('type','paragraph','text','عند الانتقال من المنزل إلى خدمة صحية، لا تحتاج الأسرة إلى إعداد تشخيص. يكفي نقل معلومات عملية تساعد الفريق على فهم الوضع: ما الذي أثار القلق ومتى بدأ، هل توجد أفكار انتحارية الآن أو تغيرت شدتها، هل توجد إصابة أو تسمم أو تعاطي مادة، ما الأدوية والحالات الصحية المهمة، هل توجد خطة أمان أو فريق علاجي قائم، ومن الشخص الموثوق الذي يمكن إشراكه. اذكر أيضًا أي صعوبة تواصل أو إعاقة أو حاجة لغوية قد تؤثر في التقييم. هذا التسليم يقلل فقد المعلومات بين البيت والطوارئ أو العيادة من دون تحويل الأسرة إلى جهة تقييم سريري.'),
      jsonb_build_object('type','heading','level',2,'text','بعد التقييم أو الخروج من الرعاية: لا تترك المتابعة مفتوحة'),
      jsonb_build_object('type','paragraph','text','قبل العودة إلى المنزل اسأل عن الخطوة التالية بوضوح: من جهة المتابعة؟ متى الموعد أو الاتصال القادم؟ ما تعليمات خطة الأمان؟ وما المسار إذا ارتفع الخطر خارج ساعات الدوام؟ توصي NICE بأنه عند استمرار مخاوف السلامة بعد إيذاء النفس ينبغي أن تقدم الجهة المسؤولة رعاية أولية لاحقة خلال 48 ساعة من التقييم النفسي الاجتماعي. لا تجعل هذا الرقم موعدًا منزليًا جامدًا لكل حالة؛ استخدم خطة الفريق المعالج والقواعد المحلية، لكن لا تقبل خروجًا غامضًا بلا جهة اتصال أو متابعة معروفة.'),
      jsonb_build_object('type','heading','level',2,'text','متى تعيد فتح سؤال الأمان حتى لو بدا الشخص أهدأ؟'),
      jsonb_build_object('type','paragraph','text','أعد السؤال واطلب تقييمًا مناسبًا إذا عاد الحديث عن الموت أو اليأس، ظهرت نية أو خطة، ازداد الانسحاب أو الاضطراب بصورة واضحة، حدثت انتكاسة بعد خروج حديث من الرعاية، ظهرت حالة ذهانية أو تسمم أو ارتباك، أو قال الشخص إنه لم يعد قادرًا على استخدام خطة الأمان أو التواصل مع الدعم. لا تعتمد على تحسن المزاج الظاهري وحده ولا على وعد قديم بالبقاء آمنًا. NIMH تؤكد أن كل حديث عن الانتحار يستحق أن يؤخذ بجدية، وأن السؤال المباشر لا يزيد الأفكار الانتحارية.'),
      jsonb_build_object('type','heading','level',2,'text','راجع خطة الأمان بعد كل أزمة أو تغير مهم'),
      jsonb_build_object('type','paragraph','text','خطة الأمان وثيقة قابلة للتحديث وليست نموذجًا ثابتًا. بعد أزمة أو زيارة طوارئ، راجع مع الشخص والفريق ما الذي ظهر قبل التصاعد، أي خطوة استخدمها فعلًا، من استجاب عند طلب المساعدة، وهل كانت أرقام الاتصال والمسارات العملية قابلة للوصول. احذف الخطوات غير الواقعية وأضف البدائل المتاحة في البيئة الحالية. ينبغي أن يحتفظ الشخص بالخطة وأن تكون متاحة للمهنيين أو الأسرة الذين اختار مشاركتها معهم. ويمكن أن تكون نسخة ورقية أو رقمية ما دامت سهلة الوصول وقت الأزمة.'),
      jsonb_build_object('type','heading','level',2,'text','كيف تعرف الأسرة أن الدعم يتحسن دون ادعاء أن الخطر انتهى؟'),
      jsonb_build_object('type','paragraph','text','لا يوجد مؤشر منزلي واحد يثبت أن خطر الانتحار أصبح صفرًا. مؤشرات عملية مفيدة تشمل أن الشخص يطلب المساعدة أبكر، يعرف من يتصل به عند التصاعد، يستطيع الوصول إلى خطة الأمان، يحضر المتابعة المتفق عليها، ويقل الوقت الذي يبقى فيه معزولًا أثناء الأزمة. هذه مؤشرات على قابلية استخدام شبكة الأمان وليست بديلًا عن التقييم المهني. إذا ظهرت مؤشرات مقلقة جديدة، فالأولوية لإعادة تقييم السلامة لا للحفاظ على خطة قديمة لأنها نجحت سابقًا.')
    ) as extra_blocks,
    jsonb_build_array(
      jsonb_build_object('claim','السؤال المباشر عن الانتحار لا يسبب أو يزيد الأفكار الانتحارية، ويمكن أن يفتح حوارًا ضروريًا عن الأمان.','sources',jsonb_build_array('NIMH-Suicide-FAQ','https://www.nimh.nih.gov/health/publications/5-action-steps-to-help-someone-having-thoughts-of-suicide')),
      jsonb_build_object('claim','لا ينبغي استخدام تصنيف عام منخفض/متوسط/مرتفع أو أداة خطر لتحديد العلاج أو الخروج بدل تقييم الاحتياجات والسلامة.','sources',jsonb_build_array('https://www.nice.org.uk/guidance/ng225/chapter/recommendations')),
      jsonb_build_object('claim','خطة الأمان تعاونية وتشمل إشارات الإنذار والتأقلم والدعم وجهات الخدمة وجعل البيئة أكثر أمانًا.','sources',jsonb_build_array('https://www.nice.org.uk/guidance/ng225/chapter/recommendations','https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme/evidence-centre/self-harm-and-suicide/safety-planning-interventions')),
      jsonb_build_object('claim','الربط بالدعم والمتابعة المستمرة بعد الأزمة جزء مهم من الوقاية ولا ينبغي أن تنتهي المساندة بانتهاء اللحظة الحادة.','sources',jsonb_build_array('https://www.nimh.nih.gov/health/publications/5-action-steps-to-help-someone-having-thoughts-of-suicide','SAMHSA-Transitions')),
      jsonb_build_object('claim','عند استمرار مخاوف السلامة بعد إيذاء النفس توصي NICE برعاية أولية لاحقة خلال 48 ساعة من التقييم النفسي الاجتماعي.','sources',jsonb_build_array('https://www.nice.org.uk/guidance/ng225/chapter/recommendations')),
      jsonb_build_object('claim','تكييف التقييم لصعوبات التعلم أو الحالات النمائية والتواصلية جزء من التقييم المناسب، ولا ينبغي تجاهل الاحتياجات الفردية.','sources',jsonb_build_array('https://www.nice.org.uk/guidance/ng225/chapter/recommendations'))
    ) as claim_map,
    jsonb_build_array(
      'هل السؤال المباشر عن الانتحار يزيد الفكرة؟',
      'متى يصبح الاشتباه بخطر الانتحار حالة عاجلة؟',
      'ما العناصر الأساسية في خطة الأمان؟',
      'لماذا لا يكفي وعد الشخص بأنه لن يؤذي نفسه؟',
      'ماذا أقول للطوارئ أو الطبيب عند طلب المساعدة؟',
      'ماذا أفعل إذا رفض الشخص إشراك الأسرة؟',
      'كيف تكون المتابعة بعد الخروج من الطوارئ أو المستشفى؟',
      'متى يجب إعادة تقييم الأمان حتى بعد هدوء الأزمة؟'
    ) as questions,
    jsonb_build_object(
      'purpose','مساعدة الأسرة أو الصديق على فتح حوار مباشر عن الانتحار، التقاط الحاجة العاجلة للأمان، بناء خطة أمان، وتسريع الربط بالرعاية والمتابعة دون وصم أو ادعاء تقييم سريري.',
      'audience','الأسرة والأصدقاء ومقدمو الرعاية الذين يقلقون من أفكار أو سلوك انتحاري لدى شخص قريب.',
      'content_model','مسار سلامة موضوعي: سؤال مباشر، استعجال طبي ونفسي، خطة أمان، حدود السرية، تسليم الرعاية، المتابعة بعد الأزمة، واحتياجات الفئات الخاصة.',
      'interaction_model','يستخدم القارئ الدليل لتحديد الخطوة الآمنة التالية والجهة التي يجب إشراكها، لا لتصنيف الشخص بدرجة خطر أو استبدال التقييم المهني.'
    ) as mechanism,
    jsonb_build_array(jsonb_build_object(
      'id','NIMH-Suicide-FAQ',
      'url','https://www.nimh.nih.gov/health/publications/suicide-faq',
      'year',2026,
      'title','Frequently Asked Questions About Suicide',
      'publisher','National Institute of Mental Health',
      'source_type','official-fact-sheet',
      'authority_tier','primary'
    )) as refs_add

  union all

  select
    'care-guide-self-harm-family-safety-support',
    jsonb_build_array(
      jsonb_build_object('type','heading','level',2,'text','بعد إيذاء النفس افصل بين ثلاثة أسئلة مختلفة'),
      jsonb_build_object('type','paragraph','text','لا تحاول الأسرة الإجابة عن كل شيء بسؤال واحد. أولًا: هل توجد إصابة أو تسمم يحتاج رعاية جسدية عاجلة؟ ثانيًا: هل توجد أفكار انتحارية حالية أو نية أو خطة أو عجز عن البقاء آمنًا؟ ثالثًا: ما الاحتياجات والضغوط والوظيفة التي كان يؤديها إيذاء النفس لهذا الشخص في هذه المرة؟ توصي NICE بأن يعامل كل حدث إيذاء نفس في حد ذاته، لأن الأسباب قد تختلف من مرة إلى أخرى. هذا الفصل يمنع خطأين شائعين: افتراض أن كل إيذاء نفس محاولة انتحار، أو افتراض أن غياب نية الموت في حدث سابق يعني غياب خطر الانتحار الآن.'),
      jsonb_build_object('type','heading','level',2,'text','ما الذي يجب أن تنتظره الأسرة من التقييم النفسي الاجتماعي؟'),
      jsonb_build_object('type','paragraph','text','التقييم النفسي الاجتماعي ليس استجوابًا للعثور على سبب واحد ولا مجرد درجة خطر. ينبغي أن يساعد على فهم ما يهم الشخص، الضغوط الحالية والقادمة، نقاط القوة، الظروف المنزلية والاجتماعية، الصحة النفسية والجسدية، استخدام المواد إن وجد، والدعم المتاح. بالنسبة للأطفال والشباب تضاف المدرسة والأقران والإنترنت وقضايا الحماية؛ وبالنسبة لمن لديهم صعوبات تعلم أو حالات نمائية يجب تكييف طريقة التواصل والتقييم. الهدف هو بناء فهم مشترك وخطة رعاية وأمان قابلة للتنفيذ.'),
      jsonb_build_object('type','heading','level',2,'text','لا تجعل «درجة الخطر» سببًا لقبول العلاج أو رفضه'),
      jsonb_build_object('type','paragraph','text','تنص NICE على عدم استخدام مقاييس الخطر أو تصنيف منخفض/متوسط/مرتفع للتنبؤ بالانتحار أو تكرار إيذاء النفس، أو لتقرير من يحصل على العلاج أو من يخرج من الخدمة. بالنسبة للأسرة، المعنى العملي هو ألا تطمئن لأن ورقة قديمة قالت «خطر منخفض»، وألا تفترض أن الشخص يحتاج القيود نفسها إلى أجل غير محدد لأن أزمة سابقة كانت شديدة. ما يهم هو الاحتياجات الحالية، السلامة الجسدية والنفسية، التغير منذ آخر تقييم، وخطة المتابعة.'),
      jsonb_build_object('type','heading','level',2,'text','إذا تكرر إيذاء النفس أو لم تنجح الخطة الحالية'),
      jsonb_build_object('type','paragraph','text','التكرار لا يبرر العقوبة ولا يعني أن الشخص لا يريد المساعدة. توصي NICE بمراجعة متعددة التخصصات عندما تتكرر الأحداث أو لا يكون العلاج فعالًا، مع تحديد من ينسق الرعاية، مراجعة ما تم تقديمه، وتطوير خطة رعاية وخطة أمان متفق عليها مع الشخص. بالنسبة للأسرة، جهز سجلًا موجزًا غير وصمي: متى تكررت الأزمات، ما التغيرات التي سبقتها، ما الدعم الذي استُخدم، وما الذي لم يكن متاحًا. شارك الحد الأدنى المفيد مع الفريق بدل جمع تفاصيل مؤلمة لمجرد التوثيق.'),
      jsonb_build_object('type','heading','level',2,'text','المتابعة المبكرة بعد الحدث أو الخروج من الرعاية'),
      jsonb_build_object('type','paragraph','text','ينبغي أن تعرف الأسرة ـ عندما تكون مشاركتها مناسبة ـ من يقدم الرعاية اللاحقة، ما هدفها، وتواترها، وكيف تتصل بالفريق. وإذا بقيت مخاوف سلامة بعد التقييم النفسي الاجتماعي، توصي NICE بأن تقدم الجهة المسؤولة الرعاية الأولية اللاحقة خلال 48 ساعة. كما تدعم WHO استخدام الاتصال المنتظم ضمن الرعاية بعد إيذاء النفس. لا تحول هذه المتابعة إلى مراقبة منزلية متواصلة؛ الأفضل اتصال متفق عليه، خطة واضحة، ومسار سريع إذا عاد التصاعد.'),
      jsonb_build_object('type','heading','level',2,'text','العودة إلى المدرسة أو العمل دون كشف تفاصيل لا يحتاجها الآخرون'),
      jsonb_build_object('type','paragraph','text','بعد الأزمة قد يحتاج الشخص إلى تخفيف مؤقت للضغط، مرونة في الحضور أو المواعيد، أو شخص اتصال موثوق. لا يلزم عادة أن يعرف الزملاء أو المعلمون تفاصيل الإصابات. شارك ما يلزم لتطبيق الدعم والسلامة فقط، وبموافقة الشخص عندما تسمح الظروف. للأطفال والشباب، قد يكون من المهم تنسيق خطة مع المدرسة إذا كان التنمر أو ضغط الدراسة أو المحتوى الرقمي جزءًا من السياق، مع مراعاة واجبات الحماية المحلية.'),
      jsonb_build_object('type','heading','level',2,'text','كيف تراجع الأسرة التقدم دون تحويل السلوك إلى امتحان؟'),
      jsonb_build_object('type','paragraph','text','راقب مؤشرات قابلة للاستخدام لا مجرد عبارة «لم يحدث إيذاء نفس»: هل صار الشخص يطلب المساعدة أبكر؟ هل يعرف كيف يصل إلى خطة الأمان؟ هل يحضر مواعيد المتابعة؟ هل تقل العزلة أو يزداد قدرته على وصف الضيق؟ وهل يعرف أفراد الأسرة متى يتصرفون ومتى يطلبون خدمة عاجلة؟ يمكن أيضًا متابعة اتجاه تكرار الأحداث وشدتها سريريًا مع الفريق، لكن لا تستخدم الأرقام للوم الشخص أو مكافأته. الهدف أن تتحسن السلامة والوصول إلى الرعاية والقدرة على طلب المساعدة.'),
      jsonb_build_object('type','heading','level',2,'text','متى تحتاج الخطة إلى مراجعة فورية؟'),
      jsonb_build_object('type','paragraph','text','اطلب إعادة تقييم عاجلة إذا ظهرت نية انتحارية أو خطة، ازدادت وتيرة أو شدة إيذاء النفس، ظهرت إصابة أو تسمم، ارتفع الضيق بسرعة، ظهرت حالة ذهانية أو تسمم مواد أو ارتباك، توقف الشخص عن القدرة على استخدام خطة الأمان، أو أصبحت الأسرة غير قادرة على الحفاظ على بيئة آمنة. كذلك تستحق الخطة مراجعة غير طارئة إذا كانت المواعيد لا تحدث، أو لا يعرف أحد منسق الرعاية، أو تعتمد الخطة على مراقبة شخص واحد طوال الوقت. الخطة الجيدة يجب أن تكون قابلة للتنفيذ عندما يكون الجميع تحت ضغط.')
    ),
    jsonb_build_array(
      jsonb_build_object('claim','كل حدث إيذاء نفس يحتاج فهمًا في سياقه، وقد تختلف أسبابه ووظيفته من مرة إلى أخرى.','sources',jsonb_build_array('https://www.nice.org.uk/guidance/ng225/chapter/recommendations')),
      jsonb_build_object('claim','التقييم النفسي الاجتماعي المبكر يركز على الاحتياجات والسياق ونقاط القوة والسلامة ولا ينبغي اختزاله إلى درجة خطر.','sources',jsonb_build_array('https://www.nice.org.uk/guidance/ng225/chapter/recommendations')),
      jsonb_build_object('claim','لا ينبغي استخدام تصنيف منخفض/متوسط/مرتفع أو مقياس خطر لتقرير العلاج أو الخروج.','sources',jsonb_build_array('https://www.nice.org.uk/guidance/ng225/chapter/recommendations')),
      jsonb_build_object('claim','خطة الأمان التعاونية تشمل إشارات الإنذار والتأقلم والدعم والخدمات وجعل البيئة أكثر أمانًا.','sources',jsonb_build_array('https://www.nice.org.uk/guidance/ng225/chapter/recommendations','https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme/evidence-centre/self-harm-and-suicide/safety-planning-interventions')),
      jsonb_build_object('claim','السؤال المباشر عن الانتحار لا يزيد الأفكار الانتحارية وينبغي عدم افتراض النية من إيذاء النفس وحده.','sources',jsonb_build_array('NIMH-Suicide-FAQ','https://www.nice.org.uk/guidance/ng225/chapter/recommendations')),
      jsonb_build_object('claim','عند استمرار مخاوف السلامة بعد التقييم توصي NICE برعاية أولية لاحقة خلال 48 ساعة، ويمكن أن يكون الاتصال المنتظم جزءًا من الرعاية اللاحقة.','sources',jsonb_build_array('https://www.nice.org.uk/guidance/ng225/chapter/recommendations','https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme/evidence-centre/self-harm-and-suicide/usefulness-of-regular-contact')),
      jsonb_build_object('claim','المقاربات العقابية ليست تدخلًا مناسبًا لإيذاء النفس، والتكرار أو فشل العلاج يستدعي مراجعة الرعاية لا زيادة الوصم.','sources',jsonb_build_array('https://www.nice.org.uk/guidance/ng225/chapter/recommendations'))
    ),
    jsonb_build_array(
      'هل إيذاء النفس يعني أن الشخص يريد الانتحار؟',
      'ما أول ما تفعله الأسرة بعد اكتشاف إيذاء النفس؟',
      'متى تحتاج الإصابة إلى رعاية طبية عاجلة؟',
      'لماذا يحتاج الشخص إلى تقييم نفسي اجتماعي حتى إذا هدأ؟',
      'ما الذي يجب أن تتضمنه خطة الأمان بعد إيذاء النفس؟',
      'هل تكفي درجة خطر أو وعد شفهي لاتخاذ قرار السلامة؟',
      'كيف تكون المتابعة بعد الخروج من الطوارئ أو المستشفى؟',
      'ماذا تفعل الأسرة إذا تكرر إيذاء النفس؟',
      'كيف نحافظ على الخصوصية عند العودة إلى المدرسة أو العمل؟'
    ),
    jsonb_build_object(
      'purpose','مساعدة الأسرة على الاستجابة لإيذاء النفس دون وصم: أمان جسدي، سؤال مباشر عن الانتحار، تقييم نفسي اجتماعي، خطة أمان، متابعة، وخصوصية.',
      'audience','الأسرة والشريك ومقدمو الرعاية الذين اكتشفوا إيذاء النفس أو يدعمون شخصًا بعد حدث حديث.',
      'content_model','مسار رعاية موضوعي يفصل الإصابة الجسدية عن خطر الانتحار وعن فهم وظيفة إيذاء النفس، ثم يربط ذلك بالتقييم وخطة الأمان والمتابعة.',
      'interaction_model','يستخدم القارئ الدليل لاختيار خطوة الرعاية التالية وتجهيز معلومات مفيدة للفريق، لا لتشخيص الشخص أو استخدام درجة خطر منزلية.'
    ),
    jsonb_build_array(jsonb_build_object(
      'id','NIMH-Suicide-FAQ',
      'url','https://www.nimh.nih.gov/health/publications/suicide-faq',
      'year',2026,
      'title','Frequently Asked Questions About Suicide',
      'publisher','National Institute of Mental Health',
      'source_type','official-fact-sheet',
      'authority_tier','primary'
    ))
), assembled as (
  select r.*,
         r.retained_blocks || e.extra_blocks as final_blocks,
         e.claim_map,e.questions,e.mechanism,e.refs_add
  from retained r
  join extras e using(slug)
), prepared as (
  select a.*,
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(coalesce(a.schema_json,'{}'::jsonb),'{claim_source_map}',a.claim_map,true),
            '{search_intent_questions}',a.questions,true
          ),
          '{page_mechanism}',a.mechanism,true
        ),
        '{revision_provenance}',
        coalesce(a.schema_json->'revision_provenance','[]'::jsonb) || jsonb_build_array(jsonb_build_object(
          'rewritten_at',to_jsonb(now()),
          'rewrite_scope','removed generic V7 operational template tail and replaced it with topic-specific crisis/safety follow-up sections',
          'previous_last_reviewed_at',to_jsonb(a.last_reviewed_at),
          'previous_reviewer_display_name',to_jsonb(a.reviewer_display_name),
          'review_reset_reason','substantive rewrite requires a fresh Rawafid team review before lastReviewed can describe the new version',
          'review_status','pending_fresh_rawafid_review'
        )),true
      ),
      '{content_quality_hold}',
      coalesce(a.schema_json->'content_quality_hold','{}'::jsonb) || jsonb_build_object(
        'status','rewrite_completed_pending_reaudit_and_rawafid_review',
        'rewrite_completed_at',to_jsonb(now()),
        'metrics_state','pre_rewrite_snapshot_pending_reaudit',
        'robots_index',false,
        'robots_follow',true
      ),true
    ) as new_schema,
    coalesce(a.references_json,'[]'::jsonb) || a.refs_add as new_refs
  from assembled a
), rendered as (
  select p.*,
    jsonb_build_object('type','care_guide','blocks',p.final_blocks) as new_body,
    (
      select string_agg(
        case
          when b.block->>'type'='heading' then coalesce(b.block->>'text','')
          when b.block->>'type'='paragraph' then coalesce(b.block->>'text','')
          when b.block->>'type'='callout' then concat_ws(E'\n',nullif(b.block->>'title',''),nullif(b.block->>'text',''))
          when b.block->>'type'='list' then coalesce((select string_agg(v,E'\n') from jsonb_array_elements_text(coalesce(b.block->'items','[]'::jsonb)) v),'')
          when b.block->>'type'='faq' then coalesce((select string_agg(concat_ws(E'\n',q->>'question',q->>'answer'),E'\n\n') from jsonb_array_elements(coalesce(b.block->'items','[]'::jsonb)) q),'')
          else ''
        end,
        E'\n\n' order by b.ord
      )
      from jsonb_array_elements(p.final_blocks) with ordinality as b(block,ord)
    ) as new_body_text
  from prepared p
)
update public.content c
set body_json=r.new_body,
    body_text=r.new_body_text,
    references_json=r.new_refs,
    schema_json=r.new_schema,
    last_reviewed_at=null,
    reviewer_display_name=null,
    reviewer_credentials=null,
    robots_index=false,
    robots_follow=true,
    updated_at=now()
from rendered r
where c.id=r.id;
