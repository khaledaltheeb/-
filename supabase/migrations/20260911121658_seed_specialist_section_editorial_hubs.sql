update public.categories c
set editorial_content_id = src.id,
    updated_at=now()
from public.content src
where c.slug='acquired-brain-injury-recovery'
  and src.slug='legacy-outside-box-acquired-brain-injury'
  and src.status='published' and src.robots_index=true;

update public.categories c
set editorial_content_id = src.id,
    updated_at=now()
from public.content src
where c.slug='inclusive-education-practice-systems'
  and src.slug='legacy-learning-path-evidence-guided-inclusive-education-foundations'
  and src.status='published' and src.robots_index=true;
