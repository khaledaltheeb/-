begin;

update public.content
set title='علاج الإدمان: دليل مبني على الأدلة للأدوية والعلاج النفسي واختيار الرعاية لاضطرابات استخدام المواد',
    search_aliases=array['علاج الإدمان','علاج اضطرابات استخدام المواد','أفضل علاج للإدمان','طرق علاج الإدمان','أدوية علاج الإدمان','العلاج النفسي للإدمان','العلاج الدوائي للإدمان','مراكز علاج الإدمان'],
    updated_at=now()
where slug='addiction-evidence-based-treatment'
  and status='published';

update public.content
set title='دعم الأقران في التعافي: رأس مال التعافي وبناء شبكة قابلة للاستمرار',
    search_aliases=array['دعم الأقران','دعم الأقران في التعافي','دعم الأقران للإدمان','مدرب التعافي','مرشد التعافي','رأس مال التعافي','peer support','recovery capital','peer recovery specialist'],
    updated_at=now()
where slug='addiction-peer-support-recovery-capital'
  and status='published';

commit;
