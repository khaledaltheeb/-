create or replace function public.set_content_review_date_on_publish()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  -- Publication and scientific/editorial review are separate events.
  -- Never infer a review timestamp from published_at. Review provenance must
  -- be written explicitly by the workflow that actually performed/recorded it.
  return new;
end;
$function$;

comment on function public.set_content_review_date_on_publish() is
'Preserves explicitly recorded review provenance only. Publishing content must not manufacture last_reviewed_at from published_at.';
