update public.content
set references_json = references_json || jsonb_build_array(
      jsonb_build_object('url','https://www.who.int/ar/news-room/fact-sheets/detail/rehabilitation','title','منظمة الصحة العالمية — إعادة التأهيل','publisher','World Health Organization','source_type','official-guidance','language','ar'),
      jsonb_build_object('url','https://www.headway.org.uk/about-brain-injury/individuals/information-library/','title','Headway — Brain Injury Information Library','publisher','Headway UK','source_type','patient-family-information-library','language','en'),
      jsonb_build_object('url','https://strokefoundation.org.au/about-stroke/learn/languages','title','Stroke Foundation — Arabic stroke information and My Stroke Journey','publisher','Stroke Foundation Australia','source_type','official-patient-resource','language','ar/en','context_note','Australian service contacts must not be presented as local Arab-region services'),
      jsonb_build_object('url','https://pubmed.ncbi.nlm.nih.gov/36594856/','title','INCOG 2.0 — Methods, Overview, and Principles','publisher','Journal of Head Trauma Rehabilitation / PubMed','source_type','clinical-practice-guideline','year',2023),
      jsonb_build_object('url','https://pubmed.ncbi.nlm.nih.gov/36594858/','title','INCOG 2.0 — Attention and Information Processing Speed','publisher','Journal of Head Trauma Rehabilitation / PubMed','source_type','clinical-practice-guideline','year',2023),
      jsonb_build_object('url','https://pubmed.ncbi.nlm.nih.gov/36594859/','title','INCOG 2.0 — Executive Functions','publisher','Journal of Head Trauma Rehabilitation / PubMed','source_type','clinical-practice-guideline','year',2023),
      jsonb_build_object('url','https://pubmed.ncbi.nlm.nih.gov/36594861/','title','INCOG 2.0 — Memory','publisher','Journal of Head Trauma Rehabilitation / PubMed','source_type','clinical-practice-guideline','year',2023)
    ),
    schema_json = coalesce(schema_json,'{}'::jsonb) || jsonb_build_object(
      'source_refresh_2026_09_11',jsonb_build_object(
        'reason','WFNR Gulf / Cleveland Clinic Abu Dhabi referral source expansion',
        'use_rule','triangulate clinical claims; Headway and Stroke Foundation support patient/family pathway discovery; do not republish protected material verbatim',
        'terminology_governance','Psychologist, Clinical Psychologist, Neuropsychologist and Psychiatrist must remain distinct by training and scope'
      )
    ),
    updated_at=now()
where slug='legacy-outside-box-acquired-brain-injury'
  and not (references_json @> '[{"url":"https://www.who.int/ar/news-room/fact-sheets/detail/rehabilitation"}]'::jsonb);

update public.content
set references_json = references_json || jsonb_build_array(
      jsonb_build_object('url','https://dises-cec.org/professional-learning-gallery/inclusion-101','title','CEC DISES — Inclusion 101','publisher','Division of International Special Education and Services, Council for Exceptional Children','source_type','professional-learning-module','year',2025),
      jsonb_build_object('url','https://dises-cec.org/dises-publications/information-brief','title','CEC DISES — Information Briefs','publisher','Division of International Special Education and Services, Council for Exceptional Children','source_type','professional-learning-library'),
      jsonb_build_object('url','https://udlguidelines.cast.org/more/downloads/','title','CAST — UDL Guidelines 3.0 Downloads and Arabic Translation','publisher','CAST','source_type','official-framework-resource','year',2024),
      jsonb_build_object('url','https://www.un.org/development/desa/disabilities/convention-on-the-rights-of-persons-with-disabilities/article-24-education.html','title','United Nations — CRPD Article 24: Education','publisher','United Nations','source_type','rights-framework'),
      jsonb_build_object('url','https://www.unesco.org/en/articles/jordan-launches-national-framework-inclusion-and-diversity-education-unesco','title','UNESCO — Jordan National Framework for Inclusion and Diversity in Education','publisher','UNESCO','source_type','official-national-framework','year',2025)
    ),
    schema_json = coalesce(schema_json,'{}'::jsonb) || jsonb_build_object(
      'source_refresh_2026_09_11',jsonb_build_object(
        'reason','CEC DISES referral source expansion',
        'use_rule','build original Arabic system-level synthesis from rights, implementation and professional-learning sources; preserve attribution and avoid implied endorsement',
        'implementation_levels',jsonb_build_array('learner','classroom','family-school partnership','school leadership','education system')
      )
    ),
    updated_at=now()
where slug='legacy-learning-path-evidence-guided-inclusive-education-foundations'
  and not (references_json @> '[{"url":"https://dises-cec.org/professional-learning-gallery/inclusion-101"}]'::jsonb);
