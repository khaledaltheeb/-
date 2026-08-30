-- Deterministic content migration. The long-form source payload is pinned to an
-- immutable repository commit; this wrapper adds the final review paragraph that
-- takes the page above the V6 2,500-Arabic-word publication floor, then executes
-- the exact pinned migration through the normal content release gates.
do $runner$
declare
  v_sql text;
  v_needle text := $$    jsonb_build_object('type','heading','level',2,'text','10. خلاصة القرار: علاج مناسب، قابل للاستمرار، وقابل للقياس'),$$;
  v_insert text := $$    jsonb_build_object('type','paragraph','text','مراجعة الخطة في الأسابيع الأولى لا تقتصر على سؤال الشخص عن الاستمرار أو التوقف. من المفيد أن يراجع الفريق الوصول الفعلي إلى المواعيد والأدوية الموصوفة، شدة الرغبة، النوم والمزاج، أي استخدام جديد أو جرعة زائدة أو زيارة طوارئ، الآثار الجانبية، العوائق المالية أو المتعلقة بالنقل، استقرار السكن، ودور الأسرة أو الأقران عندما يختار الشخص إشراكهم. إذا كانت الخطة جيدة نظريًا لكنها لا تصل إلى الشخص في حياته اليومية، فهذه مشكلة علاجية ينبغي إصلاحها. وقد يكون التعديل في توقيت المتابعة أو مستوى الرعاية أو نوع التدخل أو تنسيق الخدمات، لا في مطالبة الشخص ببذل إرادة أكبر. كما يجب توثيق هدف قصير المدى يمكن قياسه وموعد واضح لإعادة التقييم، لأن القرار المبني على بيانات متكررة أدق من الانتظار حتى تتراكم المشكلات أو يحدث انقطاع كامل عن الرعاية.'),

$$;
begin
  select h.content into v_sql
  from http_get('https://raw.githubusercontent.com/khaledaltheeb/-/210ec560f340d521c63fd87cb33204de8f4e8945/supabase/migrations/20260828201500_addiction_evidence_based_treatment_reference.sql') h;

  if v_sql is null or length(v_sql) < 20000 then
    raise exception 'pinned addiction treatment source migration could not be loaded';
  end if;
  if position(v_needle in v_sql) = 0 then
    raise exception 'pinned addiction treatment insertion anchor was not found';
  end if;

  v_sql := replace(v_sql, v_needle, v_insert || v_needle);
  v_sql := regexp_replace(v_sql, '^[[:space:]]*begin;[[:space:]]*', '', 'i');
  v_sql := regexp_replace(v_sql, '[[:space:]]*commit;[[:space:]]*$', '', 'i');
  execute v_sql;
end
$runner$;
