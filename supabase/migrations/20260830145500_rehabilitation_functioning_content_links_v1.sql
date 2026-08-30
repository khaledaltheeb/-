do $$
declare
  v_sector uuid;
begin
  select id into v_sector from public.sectors where slug='rehabilitation-functioning' and is_active=true limit 1;
  if v_sector is null then raise exception 'rehabilitation-functioning sector missing'; end if;

  update public.categories c set editorial_content_id=x.content_id,updated_at=now()
  from (
    select 'rehabilitation-foundations'::text cat,(select id from public.content where slug='rehabilitation-comprehensive-assessment' and status='published') content_id
    union all select 'rehabilitation-service-pathways',(select id from public.content where slug='rehabilitation-care-pathway' and status='published')
    union all select 'rehabilitation-professions',(select id from public.content where slug='multidisciplinary-rehabilitation-team' and status='published')
    union all select 'rehabilitation-measurement-outcomes',(select id from public.content where slug='rehabilitation-outcome-measures' and status='published')
    union all select 'assistive-technology-rehabilitation',(select id from public.content where slug='assistive-technology' and status='published')
    union all select 'family-rehabilitation',(select id from public.content where slug='family-rehabilitation-guide' and status='published')
    union all select 'community-vocational-rehabilitation',(select id from public.content where slug='community-participation-barrier-audit' and status='published')
    union all select 'emergency-rehabilitation',(select id from public.content where slug='care-guide-disability-emergency-evacuation-plan' and status='published')
  ) x
  where c.sector_id=v_sector and c.slug=x.cat and x.content_id is not null;

  insert into public.content_categories(content_id,category_id,is_primary)
  select ct.id,c.id,false
  from (values
    ('legacy-special-needs-guides-assessment-icf-functioning-participation','rehabilitation-foundations'),
    ('care-guide-participation-goal-setting-icf','rehabilitation-foundations'),
    ('legacy-special-needs-guides-system-quality-rehabilitation-goal-review','rehabilitation-measurement-outcomes'),
    ('care-guide-participation-goal-setting-icf','rehabilitation-measurement-outcomes'),
    ('care-guide-disability-hospital-discharge-plan','rehabilitation-service-pathways'),
    ('assistive-technology','assistive-technology-rehabilitation'),
    ('care-guide-assistive-technology-selection-plan','assistive-technology-rehabilitation'),
    ('care-guide-assistive-technology-maintenance-plan','assistive-technology-rehabilitation'),
    ('care-guide-assistive-technology-trial-follow-up','assistive-technology-rehabilitation'),
    ('legacy-special-needs-science-family-centered-rehabilitation','family-rehabilitation'),
    ('evidence-guides-caregiver-wellbeing','family-rehabilitation'),
    ('evidence-guides-inclusive-family-support','family-rehabilitation'),
    ('caregiver-burnout','family-rehabilitation'),
    ('care-guide-caregiver-self-care-boundaries','family-rehabilitation'),
    ('evidence-guides-supported-adulthood-transition','family-rehabilitation'),
    ('child-safety-vs-overprotection','family-rehabilitation'),
    ('community-participation-barrier-audit','community-vocational-rehabilitation'),
    ('care-guide-inclusive-volunteering-community-participation-disability','community-vocational-rehabilitation'),
    ('care-guide-public-transport-independence-training','community-vocational-rehabilitation'),
    ('care-guide-supported-employment-job-coaching-disability','community-vocational-rehabilitation'),
    ('care-guide-reasonable-workplace-accommodations-disability','community-vocational-rehabilitation'),
    ('care-guide-disability-entrepreneurship-self-employment','community-vocational-rehabilitation'),
    ('evidence-guides-supported-adulthood-transition','community-vocational-rehabilitation'),
    ('evidence-guides-supported-decision-making-transition-guide','community-vocational-rehabilitation'),
    ('care-guide-disability-emergency-evacuation-plan','emergency-rehabilitation'),
    ('care-guide-special-needs-emergency-contact-card','emergency-rehabilitation'),
    ('magazine-protect-shoulder-arthroplasty-telerehabilitation-protocol-2026','telerehabilitation'),
    ('magazine-cancer-telerehab-telecare-rct-2026','telerehabilitation'),
    ('legacy-outside-box-limb-difference-amputation','musculoskeletal-rehabilitation'),
    ('magazine-protect-shoulder-arthroplasty-telerehabilitation-protocol-2026','musculoskeletal-rehabilitation'),
    ('fragile-x-early-intervention-therapies','developmental-rehabilitation'),
    ('legacy-special-needs-early-intervention-communication-routines','developmental-rehabilitation'),
    ('legacy-special-needs-early-intervention-social-emotional-routines','developmental-rehabilitation'),
    ('legacy-special-needs-early-intervention-transition-to-preschool-school','developmental-rehabilitation'),
    ('legacy-special-needs-early-intervention-motor-development-routines','developmental-rehabilitation'),
    ('capabilities-hearing-loss','sensory-rehabilitation'),
    ('capabilities-low-vision','sensory-rehabilitation'),
    ('capabilities-deafblindness','sensory-rehabilitation'),
    ('special-ed-encyclopedia-hearing-loss','sensory-rehabilitation'),
    ('special-ed-encyclopedia-visual-impairment','sensory-rehabilitation'),
    ('care-guide-hearing-loss-mental-health-access','sensory-rehabilitation'),
    ('care-guide-visual-impairment-mental-health-access','sensory-rehabilitation'),
    ('childhood-cancer-hearing-ototoxicity-late-effects','sensory-rehabilitation'),
    ('palliative-rehabilitation-function-mobility','cancer-rehabilitation'),
    ('magazine-cancer-telerehab-telecare-rct-2026','cancer-rehabilitation'),
    ('childhood-cancer-hearing-ototoxicity-late-effects','cancer-rehabilitation'),
    ('evidence-guides-early-psychosis-safe-guide','mental-health-psychosocial-rehabilitation'),
    ('legacy-library-therapies-therapies-19','mental-health-psychosocial-rehabilitation'),
    ('concept-1918','mental-health-psychosocial-rehabilitation'),
    ('palliative-care-frailty-older-adults','adult-geriatric-rehabilitation'),
    ('capabilities-parkinson-disease','adult-geriatric-rehabilitation'),
    ('palliative-rehabilitation-function-mobility','adult-geriatric-rehabilitation'),
    ('capabilities-parkinson-disease','neurological-rehabilitation'),
    ('concept-1809','neurological-rehabilitation'),
    ('magazine-ischemic-stroke-peru-evidence-gaps-scoping-review-2026','neurological-rehabilitation')
  ) as m(content_slug,category_slug)
  join public.content ct on ct.slug=m.content_slug and ct.status='published' and ct.robots_index=true
  join public.categories c on c.slug=m.category_slug and c.sector_id=v_sector
  on conflict (content_id,category_id) do nothing;
end $$;
