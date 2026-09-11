create or replace function private.guard_public_taxonomy_presence()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if tg_op = 'DELETE' then
    if coalesce(old.is_active, false) = true
       and coalesce(old.visibility::text, '') = 'public' then
      raise exception 'public taxonomy pages cannot be deleted; preserve the live route';
    end if;
    return old;
  end if;

  if coalesce(old.is_active, false) = true
     and coalesce(old.visibility::text, '') = 'public' then
    if coalesce(new.is_active, false) <> true
       or coalesce(new.visibility::text, '') <> 'public' then
      raise exception 'public taxonomy pages cannot be hidden or deactivated';
    end if;
    if new.slug is distinct from old.slug then
      raise exception 'public taxonomy slug is immutable; preserve the existing public route';
    end if;
  end if;

  return new;
end;
$function$;
