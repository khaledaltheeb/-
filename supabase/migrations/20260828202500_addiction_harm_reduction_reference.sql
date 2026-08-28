-- Deterministic wrapper around the immutable reviewed long-form source payload.
-- Adds a useful continuous-risk-review paragraph before publication and then
-- executes through the normal V6 content release gates.
do $runner$
declare
  v_sql text;
  v_needle text := $$    jsonb_build_object('type','heading','level',2,'text','12. كيف يتكامل خفض الضرر مع التعافي طويل المدى؟'),$$;
  v_insert text := $$    jsonb_build_object('type','paragraph','text','مراجعة خطة خفض الضرر ينبغي أن تكون دورية ومبنية على تغير الخطر لا على افتراض ثباته. قد تتغير المواد المتاحة أو السكن أو الصحة النفسية أو الأدوية الموصوفة أو شبكة الدعم، وقد تظهر إصابة أو عدوى أو جرعة زائدة تغير الأولويات. لهذا يعيد الفريق سؤال الشخص عن ما يساعده فعليًا على البقاء متصلًا بالخدمة، وما الحواجز الجديدة، وهل اكتملت الإحالات والفحوص والمتابعة أم بقيت مجرد توصيات. كما يراجع الوصول إلى العلاج المناسب، ووجود خطة واضحة بعد الطوارئ، وقدرة الشخص على فهم الخيارات المتاحة بلغة مناسبة. إذا تحسن مؤشر واحد وبقيت مخاطر أخرى، لا تعتبر الخطة مكتملة؛ تعدل الأهداف والمسؤوليات وموعد المراجعة. هذه المراجعة تجعل خفض الضرر عملية مستمرة قابلة للقياس وليست حزمة ثابتة من الخدمات، وتمنع أن تتحول كثرة الأنشطة إلى بديل عن سؤال أكثر أهمية: هل انخفض الخطر الفعلي وهل أصبح الوصول إلى الرعاية أسهل وأكثر استمرارية؟'),

$$;
begin
  select h.content into v_sql
  from http_get('https://raw.githubusercontent.com/khaledaltheeb/-/2e5399f2f04a1aa2f0cd4d832771c35a1aa2ab4f/supabase/migrations/20260828202500_addiction_harm_reduction_reference.sql') h;

  if v_sql is null or length(v_sql) < 20000 then
    raise exception 'pinned harm reduction source migration could not be loaded';
  end if;
  if position(v_needle in v_sql) = 0 then
    raise exception 'pinned harm reduction insertion anchor was not found';
  end if;

  v_sql := replace(v_sql, v_needle, v_insert || v_needle);
  v_sql := regexp_replace(v_sql, '^[[:space:]]*begin;[[:space:]]*', '', 'i');
  v_sql := regexp_replace(v_sql, '[[:space:]]*commit;[[:space:]]*$', '', 'i');
  execute v_sql;
end
$runner$;
