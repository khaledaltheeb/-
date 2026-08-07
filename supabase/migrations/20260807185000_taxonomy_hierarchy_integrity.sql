create or replace function private.validate_category_hierarchy()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_parent_sector uuid;
  v_cycle boolean := false;
begin
  if new.parent_id is null then return new; end if;
  if new.parent_id = new.id then raise exception 'category cannot be its own parent'; end if;

  select c.sector_id into v_parent_sector
  from public.categories c
  where c.id = new.parent_id;
  if v_parent_sector is null then raise exception 'parent category not found'; end if;
  if new.sector_id is distinct from v_parent_sector then raise exception 'parent category must belong to the same sector'; end if;

  with recursive ancestors as (
    select c.id,c.parent_id,1 as depth
    from public.categories c
    where c.id = new.parent_id
    union all
    select c.id,c.parent_id,a.depth+1
    from public.categories c
    join ancestors a on c.id = a.parent_id
    where a.depth < 100
  )
  select exists(select 1 from ancestors where id = new.id) into v_cycle;
  if v_cycle then raise exception 'category hierarchy cycle detected'; end if;
  return new;
end;
$$;

revoke all on function private.validate_category_hierarchy() from public,anon,authenticated;

drop trigger if exists validate_category_hierarchy on public.categories;
create trigger validate_category_hierarchy
before insert or update of sector_id,parent_id on public.categories
for each row execute function private.validate_category_hierarchy();

create or replace function private.delete_category_safe(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_role public.app_role;
  v_row public.categories%rowtype;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  if v_role not in ('owner','admin') then raise exception 'administrator role required'; end if;
  select * into v_row from public.categories where id=p_id;
  if v_row.id is null then raise exception 'category not found'; end if;
  if exists(select 1 from public.categories c where c.parent_id=p_id) then raise exception 'category has child categories; disable or move them first'; end if;
  if exists(select 1 from public.content c where c.category_id=p_id) then raise exception 'category has linked content; move or archive content first'; end if;
  delete from public.categories where id=p_id;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data)
  values(v_uid,'category',p_id::text,'category_delete',pg_catalog.to_jsonb(v_row));
end;
$$;

create or replace function public.delete_category_safe(p_id uuid)
returns void
language sql
set search_path = ''
as $$ select private.delete_category_safe(p_id); $$;

create or replace function private.delete_sector_safe(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_role public.app_role;
  v_row public.sectors%rowtype;
begin
  if v_uid is null then raise exception 'authentication required'; end if;
  v_role := private.current_role();
  if v_role not in ('owner','admin') then raise exception 'administrator role required'; end if;
  select * into v_row from public.sectors where id=p_id;
  if v_row.id is null then raise exception 'sector not found'; end if;
  if exists(select 1 from public.categories c where c.sector_id=p_id) then raise exception 'sector has categories; disable or move them first'; end if;
  if exists(select 1 from public.content c where c.sector_id=p_id) then raise exception 'sector has linked content; move or archive content first'; end if;
  delete from public.sectors where id=p_id;
  insert into public.audit_logs(actor_id,entity_type,entity_id,action,before_data)
  values(v_uid,'sector',p_id::text,'sector_delete',pg_catalog.to_jsonb(v_row));
end;
$$;

create or replace function public.delete_sector_safe(p_id uuid)
returns void
language sql
set search_path = ''
as $$ select private.delete_sector_safe(p_id); $$;

revoke delete on public.categories from authenticated;
revoke delete on public.sectors from authenticated;

revoke all on function private.delete_category_safe(uuid) from public,anon;
revoke all on function private.delete_sector_safe(uuid) from public,anon;
grant execute on function private.delete_category_safe(uuid) to authenticated;
grant execute on function private.delete_sector_safe(uuid) to authenticated;
revoke all on function public.delete_category_safe(uuid) from public,anon;
revoke all on function public.delete_sector_safe(uuid) from public,anon;
grant execute on function public.delete_category_safe(uuid) to authenticated;
grant execute on function public.delete_sector_safe(uuid) to authenticated;
