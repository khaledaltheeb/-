-- Deterministic wrapper around the immutable reviewed editorial payload.
-- Removes one non-rendering placeholder block, adds a substantive navigation
-- paragraph, then executes the page through the V6 publication gates.
do $runner$
declare
  v_sql text;
  v_bad text := $$    jsonb_build_object('paragraph','paragraph'),
$$;
  v_needle text := $$    jsonb_build_object('type','heading','level',2,'text','14. معيار اكتمال المرجع: اتصال المسارات لا عدد الصفحات'),$$;
  v_insert text := $$    jsonb_build_object('type','paragraph','text','عند استخدام القطاع في قرار عملي، من المفيد تدوين ثلاثة أشياء قبل الانتقال إلى الصفحة التالية: السؤال الذي تريد الإجابة عنه، مستوى الخطر الحالي، والمعلومة التي ستغير القرار. فإذا كان السؤال مثل هل هذه أعراض انسحاب؟ فالمعلومة الحاسمة قد تكون المادة والتوقيت وشدة الأعراض والحالة الطبية. وإذا كان السؤال هل هذا العلاج مناسب؟ فالمعلومة الحاسمة تصبح التشخيص والمخاطر والدليل ومستوى الرعاية والاستمرارية. وإذا كان السؤال كيف أساعد فردًا من الأسرة؟ فتتحول الأولوية إلى السلامة والتواصل والحدود والوصول إلى خدمة. هذه الطريقة تمنع القراءة المبعثرة وتكشف بسرعة متى تكفي المعرفة العامة ومتى يجب الانتقال إلى تقييم مهني أو خدمة طارئة أو مسار علاجي. كما تساعد المختص والمؤسسة على استخدام الصفحات بوصفها عقدًا داخل مسار واحد، لا مقالات منفصلة تتنافس على الإجابة عن السؤال نفسه.'),

$$;
begin
  select h.content into v_sql
  from http_get('https://raw.githubusercontent.com/khaledaltheeb/-/a9f463cf484142f5cb0476c329731befb037f399/supabase/migrations/20260828203500_addiction_sector_editorial_reference.sql') h;
  if v_sql is null or length(v_sql) < 20000 then
    raise exception 'pinned addiction sector editorial source migration could not be loaded';
  end if;
  if position(v_bad in v_sql) = 0 then
    raise exception 'expected non-rendering placeholder was not found';
  end if;
  if position(v_needle in v_sql) = 0 then
    raise exception 'editorial insertion anchor was not found';
  end if;
  v_sql := replace(v_sql, v_bad, '');
  v_sql := replace(v_sql, v_needle, v_insert || v_needle);
  v_sql := regexp_replace(v_sql, '^[[:space:]]*begin;[[:space:]]*', '', 'i');
  v_sql := regexp_replace(v_sql, '[[:space:]]*commit;[[:space:]]*$', '', 'i');
  execute v_sql;
end
$runner$;
