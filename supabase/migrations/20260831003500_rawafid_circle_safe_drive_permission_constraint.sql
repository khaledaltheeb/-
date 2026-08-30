-- Keep the table-level permission invariant aligned with the RPC whitelist.
alter table public.circle_permissions
  drop constraint if exists circle_permissions_permission;

alter table public.circle_permissions
  add constraint circle_permissions_permission
  check (permission = any (array[
    'chat'::text,
    'quick_questions'::text,
    'location_request'::text,
    'emergency'::text,
    'safe_arrival'::text,
    'care'::text,
    'safety_location'::text,
    'driving_safety'::text
  ]));
