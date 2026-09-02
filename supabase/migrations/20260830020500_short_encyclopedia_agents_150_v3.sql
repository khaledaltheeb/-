begin;

update public.categories
set metadata = jsonb_set(
  jsonb_set(
    jsonb_set(coalesce(metadata, '{}'::jsonb), '{target_pages_per_hour}', '150'::jsonb, true),
    '{run_interval_minutes}', '60'::jsonb, true
  ),
  '{agent_contract_version}', '3'::jsonb, true
)
where slug in (
  'short-encyclopedia-psychology-terms',
  'short-encyclopedia-special-needs-inclusive-education'
);

commit;
