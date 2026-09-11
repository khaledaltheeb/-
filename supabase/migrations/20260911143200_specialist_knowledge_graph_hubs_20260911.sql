with abi_targets(slug) as (values
('abi-vs-tbi-stroke-hypoxic-injury-guide'),('post-traumatic-amnesia-recovery-guide'),('attention-after-acquired-brain-injury'),('processing-speed-after-acquired-brain-injury'),('memory-after-acquired-brain-injury'),('executive-dysfunction-self-awareness-after-abi'),('cognitive-communication-after-abi'),('fatigue-after-acquired-brain-injury'),('sleep-after-acquired-brain-injury'),('emotional-behavioural-changes-after-abi'),('mental-health-after-acquired-brain-injury'),('family-caregiver-support-after-abi'),('return-to-education-after-abi'),('return-to-work-after-abi'),('identity-adjustment-after-brain-injury'),('relationships-intimacy-after-abi'),('driving-independence-community-participation-after-abi')
), inc_targets(slug) as (values
('inclusive-school-leadership-implementation'),('family-engagement-inclusive-education-system'),('inclusive-academic-practices-schoolwide'),('inclusive-social-emotional-behavioral-supports-schoolwide'),('inclusive-assessment-governance-school-system'),('multidisciplinary-collaboration-inclusive-schools'),('accessibility-assistive-technology-school-system'),('inclusive-education-implementation-fidelity'),('inclusive-education-quality-indicators'),('teacher-professional-learning-inclusive-practice'),('inclusive-education-data-monitoring-improvement'),('culturally-responsive-inclusive-education-arab-context')
), raw_pairs as (
  select 'legacy-outside-box-acquired-brain-injury'::text a,slug b from abi_targets
  union all select 'legacy-learning-path-evidence-guided-inclusive-education-foundations',slug from inc_targets
  union all select cn.slug,t.slug
  from public.content cn
  cross join public.content t
  where cn.canonical_url='/library/branches/clinical-neuropsychology'
    and cn.status='published'
    and t.slug in ('attention-after-acquired-brain-injury','processing-speed-after-acquired-brain-injury','memory-after-acquired-brain-injury','executive-dysfunction-self-awareness-after-abi','cognitive-communication-after-abi','mental-health-after-acquired-brain-injury')
    and t.status='published'
), normalized as (
  select distinct least(a,b) a,greatest(a,b) b from raw_pairs where a<>b
), directed as (
  select a source_slug,b target_slug from normalized
  union all
  select b,a from normalized
)
insert into public.content_relations(source_content_id,target_content_id,relation_type)
select s.id,t.id,'related'
from directed d
join public.content s on s.slug=d.source_slug and s.status='published'
join public.content t on t.slug=d.target_slug and t.status='published'
on conflict do nothing;